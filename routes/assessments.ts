# -*- coding: utf-8 -*-
"""
Created on Thu May  7 12:35:39 2026

@author: Dell
"""

import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, studentsTable, assessmentsTable } from "@workspace/db";
import {
  ComputeAssessmentBody, ComputeAssessmentResponse,
  CreateAssessmentBody, CreateAssessmentParams,
  ListRecentAssessmentsQueryParams, ListRecentAssessmentsResponse,
} from "@workspace/api-zod";
import { computeFuzzy } from "../lib/fuzzy";

const router: IRouter = Router();

// POST /api/assess — fuzzy hesapla (kaydetmeden)
router.post("/assess", async (req, res): Promise<void> => {
  const parsed = ComputeAssessmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  res.json(ComputeAssessmentResponse.parse(computeFuzzy(parsed.data)));
});

// POST /api/students/:id/assessments — değerlendirme kaydet
router.post("/students/:id/assessments", async (req, res): Promise<void> => {
  const params = CreateAssessmentParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const body = CreateAssessmentBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, params.data.id));
  if (!student) { res.status(404).json({ error: "Öğrenci bulunamadı" }); return; }

  const fuzzy = computeFuzzy(body.data);
  const [row] = await db.insert(assessmentsTable).values({
    studentId:      params.data.id,
    sabika:         body.data.sabika,
    sosyal_izole:   body.data.sosyal_izole,
    oz_bakim:       body.data.oz_bakim,
    duygusal_tepki: body.data.duygusal_tepki,
    nezaket:        body.data.nezaket,
    score:          fuzzy.score,
    decision:       fuzzy.decision,
    note:           body.data.note ?? null,
  }).returning();

  res.status(201).json(row);
});

// GET /api/assessments/recent — son N değerlendirme
router.get("/assessments/recent", async (req, res): Promise<void> => {
  const params = ListRecentAssessmentsQueryParams.safeParse(req.query);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const rows = await db.select({
    id: assessmentsTable.id, studentId: assessmentsTable.studentId,
    score: assessmentsTable.score, decision: assessmentsTable.decision,
    createdAt: assessmentsTable.createdAt,
    studentName: studentsTable.name, grade: studentsTable.grade,
  })
  .from(assessmentsTable)
  .innerJoin(studentsTable, eq(assessmentsTable.studentId, studentsTable.id))
  .orderBy(desc(assessmentsTable.createdAt))
  .limit(params.data.limit ?? 10);

  res.json(ListRecentAssessmentsResponse.parse(rows));
});

export default router;
