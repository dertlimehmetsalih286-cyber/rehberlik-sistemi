# -*- coding: utf-8 -*-
"""
Created on Thu May  7 12:35:49 2026

@author: Dell
"""

import { Router, type IRouter } from "express";
import { eq, desc, and, ilike, sql, type SQL } from "drizzle-orm";
import { db, studentsTable, assessmentsTable } from "@workspace/db";
import {
  CreateStudentBody, GetStudentParams, GetStudentResponse,
  ListStudentsQueryParams, ListStudentsResponse,
  UpdateStudentParams, UpdateStudentBody, UpdateStudentResponse,
  DeleteStudentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

// GET /api/students
router.get("/students", async (req, res): Promise<void> => {
  const params = ListStudentsQueryParams.safeParse(req.query);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const filters: SQL[] = [];
  if (params.data.search?.trim()) {
    filters.push(ilike(studentsTable.name, `%${params.data.search.trim()}%`));
  }

  const studentRows = await db.select().from(studentsTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(studentsTable.createdAt));

  const studentIds = studentRows.map((s) => s.id);
  const latestByStudent = new Map<number, typeof assessmentsTable.$inferSelect>();
  const countByStudent  = new Map<number, number>();

  if (studentIds.length > 0) {
    const latestRows = await db.execute(sql`
      SELECT DISTINCT ON (student_id) * FROM ${assessmentsTable}
      WHERE student_id = ANY(${studentIds})
      ORDER BY student_id, created_at DESC
    `);
    for (const r of latestRows.rows as Array<Record<string, unknown>>) {
      latestByStudent.set(Number(r.student_id), {
        id: Number(r.id), studentId: Number(r.student_id),
        sabika: Number(r.sabika), sosyal_izole: Number(r.sosyal_izole),
        oz_bakim: Number(r.oz_bakim), duygusal_tepki: Number(r.duygusal_tepki),
        nezaket: Number(r.nezaket), score: Number(r.score),
        decision: String(r.decision),
        note: r.note == null ? null : String(r.note),
        createdAt: new Date(r.created_at as string),
      });
    }
    const countRows = await db.select({
      studentId: assessmentsTable.studentId,
      count: sql<number>`count(*)::int`,
    }).from(assessmentsTable).groupBy(assessmentsTable.studentId);
    for (const c of countRows) countByStudent.set(c.studentId, Number(c.count));
  }

  const enriched = studentRows.map((s) => ({
    ...s,
    latestAssessment: latestByStudent.get(s.id) ?? null,
    assessmentCount:  countByStudent.get(s.id) ?? 0,
  })).filter((s) => !params.data.decision || s.latestAssessment?.decision === params.data.decision);

  res.json(ListStudentsResponse.parse(enriched));
});

// POST /api/students
router.post("/students", async (req, res): Promise<void> => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(studentsTable).values({
    name: parsed.data.name, grade: parsed.data.grade,
    school:            parsed.data.school?.trim()      || null,
    schoolCode:        parsed.data.schoolCode?.trim()  || null,
    disciplinaryCount: parsed.data.disciplinaryCount   ?? null,
    studentNo:         parsed.data.studentNo?.trim()   || null,
    notes:             parsed.data.notes               ?? null,
  }).returning();
  res.status(201).json(row);
});

// GET /api/students/:id
router.get("/students/:id", async (req, res): Promise<void> => {
  const params = GetStudentParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, params.data.id));
  if (!student) { res.status(404).json({ error: "Öğrenci bulunamadı" }); return; }
  const assessments = await db.select().from(assessmentsTable)
    .where(eq(assessmentsTable.studentId, params.data.id))
    .orderBy(desc(assessmentsTable.createdAt));
  res.json(GetStudentResponse.parse({ ...student, assessments }));
});

// PATCH /api/students/:id
router.patch("/students/:id", async (req, res): Promise<void> => {
  const params = UpdateStudentParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const body = UpdateStudentBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const [row] = await db.update(studentsTable).set({
    name: body.data.name, grade: body.data.grade,
    school:            body.data.school?.trim()      || null,
    schoolCode:        body.data.schoolCode?.trim()  || null,
    disciplinaryCount: body.data.disciplinaryCount   ?? null,
    studentNo:         body.data.studentNo?.trim()   || null,
    notes:             body.data.notes               ?? null,
  }).where(eq(studentsTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Öğrenci bulunamadı" }); return; }
  res.json(UpdateStudentResponse.parse(row));
});

// DELETE /api/students/:id
router.delete("/students/:id", async (req, res): Promise<void> => {
  const params = DeleteStudentParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [row] = await db.delete(studentsTable).where(eq(studentsTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Öğrenci bulunamadı" }); return; }
  res.sendStatus(204);
});

export default router;
