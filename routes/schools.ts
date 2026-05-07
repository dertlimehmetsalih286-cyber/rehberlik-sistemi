# -*- coding: utf-8 -*-
"""
Created on Thu May  7 12:36:40 2026

@author: Dell
"""

import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, studentsTable, assessmentsTable } from "@workspace/db";
import { ListSchoolsResponse } from "@workspace/api-zod";
import { pickDecision, type Decision } from "../lib/fuzzy";

const router: IRouter = Router();

router.get("/schools", async (_req, res): Promise<void> => {
  const students    = await db.select().from(studentsTable);
  const assessments = await db.select().from(assessmentsTable).orderBy(sql`student_id, created_at DESC`);

  // Her öğrencinin son değerlendirmesi
  const latestByStudent = new Map<number, { score: number; decision: Decision }>();
  for (const a of assessments) {
    if (!latestByStudent.has(a.studentId)) {
      latestByStudent.set(a.studentId, { score: a.score, decision: pickDecision(a.score) });
    }
  }

  // Okul bazlı gruplama
  const bySchool = new Map<string, {
    school: string; studentCount: number; assessedCount: number;
    averageScore: number; yokCount: number; gozlemCount: number; danismanCount: number;
  }>();

  for (const s of students) {
    const schoolName = (s.school ?? "").trim();
    if (!schoolName) continue;
    const key = schoolName.toLocaleLowerCase("tr");
    let agg = bySchool.get(key) ?? { school: schoolName, studentCount: 0, assessedCount: 0, averageScore: 0, yokCount: 0, gozlemCount: 0, danismanCount: 0 };
    agg.studentCount += 1;
    const latest = latestByStudent.get(s.id);
    if (latest) {
      agg.assessedCount += 1; agg.averageScore += latest.score;
      if (latest.decision === "yok")      agg.yokCount++;
      else if (latest.decision === "gozlem") agg.gozlemCount++;
      else                                    agg.danismanCount++;
    }
    bySchool.set(key, agg);
  }

  const items = Array.from(bySchool.values())
    .map((a) => ({
      school: a.school, studentCount: a.studentCount, assessedCount: a.assessedCount,
      averageScore: a.assessedCount > 0 ? Math.round((a.averageScore / a.assessedCount) * 100) / 100 : 0,
      decisionCounts: [
        { decision: "yok"      as Decision, count: a.yokCount },
        { decision: "gozlem"   as Decision, count: a.gozlemCount },
        { decision: "danisman" as Decision, count: a.danismanCount },
      ],
    }))
    .sort((a, b) => {
      if (a.assessedCount === 0 && b.assessedCount === 0) return a.school.localeCompare(b.school, "tr");
      if (a.assessedCount === 0) return 1;
      if (b.assessedCount === 0) return -1;
      return a.averageScore - b.averageScore;
    });

  res.json(ListSchoolsResponse.parse(items.map((item, idx) => ({ ...item, rank: idx + 1 }))));
});

export default router;
