# -*- coding: utf-8 -*-
"""
Created on Thu May  7 12:36:18 2026

@author: Dell
"""

import { Router, type IRouter } from "express";
import { sql, inArray } from "drizzle-orm";
import { db, studentsTable, assessmentsTable } from "@workspace/db";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const DECISIONS = ["yok", "gozlem", "danisman"] as const;

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [{ totalStudents }] = await db
    .select({ totalStudents: sql<number>`count(*)::int` })
    .from(studentsTable);

  const [aggregates] = await db.select({
    totalAssessments: sql<number>`count(*)::int`,
    averageScore:     sql<number>`coalesce(avg(score), 0)::float`,
  }).from(assessmentsTable);

  // Her öğrencinin son değerlendirmesi
  const latestRows = await db.execute(sql`
    SELECT DISTINCT ON (student_id) * FROM ${assessmentsTable}
    ORDER BY student_id, created_at DESC
  `);

  const latestByStudent = new Map<number, { score: number; decision: string }>();
  for (const r of latestRows.rows as Array<Record<string, unknown>>) {
    latestByStudent.set(Number(r.student_id), {
      score: Number(r.score), decision: String(r.decision),
    });
  }

  const decisionCounts = DECISIONS.map((decision) => ({
    decision,
    count: Array.from(latestByStudent.values()).filter((a) => a.decision === decision).length,
  }));

  // Sınıf bazlı dağılım
  const allStudents = await db.select().from(studentsTable);
  const gradeMap = new Map<string, { total: number; danismanCount: number; scoreSum: number; scored: number }>();
  for (const s of allStudents) {
    const entry = gradeMap.get(s.grade) ?? { total: 0, danismanCount: 0, scoreSum: 0, scored: 0 };
    entry.total += 1;
    const latest = latestByStudent.get(s.id);
    if (latest) {
      entry.scoreSum += latest.score; entry.scored += 1;
      if (latest.decision === "danisman") entry.danismanCount += 1;
    }
    gradeMap.set(s.grade, entry);
  }
  const gradeBreakdown = Array.from(gradeMap.entries())
    .map(([grade, v]) => ({
      grade, total: v.total, danismanCount: v.danismanCount,
      avgScore: v.scored > 0 ? Math.round((v.scoreSum / v.scored) * 100) / 100 : 0,
    }))
    .sort((a, b) => a.grade.localeCompare(b.grade, "tr"));

  // Dikkat listesi — son değerlendirmesi "danisman" olan öğrenciler
  const attentionIds = Array.from(latestByStudent.entries())
    .filter(([, a]) => a.decision === "danisman").map(([id]) => id);

  let attentionList: Array<{ id: number; name: string; grade: string; notes: string | null; createdAt: Date; assessmentCount: number }> = [];
  if (attentionIds.length > 0) {
    const rows = await db.select().from(studentsTable).where(inArray(studentsTable.id, attentionIds));
    const counts = await db.select({
      studentId: assessmentsTable.studentId,
      count:     sql<number>`count(*)::int`,
    }).from(assessmentsTable).where(inArray(assessmentsTable.studentId, attentionIds)).groupBy(assessmentsTable.studentId);
    const countMap = new Map(counts.map((c) => [c.studentId, Number(c.count)]));
    attentionList = rows.map((s) => ({
      id: s.id, name: s.name, grade: s.grade, notes: s.notes, createdAt: s.createdAt,
      latestAssessment: null, assessmentCount: countMap.get(s.id) ?? 0,
    })).sort((a, b) => (latestByStudent.get(b.id)?.score ?? 0) - (latestByStudent.get(a.id)?.score ?? 0));
  }

  res.json(GetDashboardSummaryResponse.parse({
    totalStudents:    Number(totalStudents) || 0,
    totalAssessments: Number(aggregates?.totalAssessments) || 0,
    averageScore:     aggregates?.averageScore ? Math.round(Number(aggregates.averageScore) * 100) / 100 : 0,
    decisionCounts, gradeBreakdown, attentionList,
  }));
});

export default router;