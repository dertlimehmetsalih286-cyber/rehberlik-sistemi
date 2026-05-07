# -*- coding: utf-8 -*-
"""
Created on Thu May  7 12:37:14 2026

@author: Dell
"""

import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";

export const studentsTable = pgTable("students", {
  id:                serial("id").primaryKey(),
  name:              text("name").notNull(),
  grade:             text("grade").notNull(),
  school:            text("school"),
  schoolCode:        text("school_code"),
  disciplinaryCount: integer("disciplinary_count"),
  studentNo:         text("student_no"),
  notes:             text("notes"),
  createdAt:         timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const assessmentsTable = pgTable("assessments", {
  id:             serial("id").primaryKey(),
  studentId:      integer("student_id").notNull().references(() => studentsTable.id, { onDelete: "cascade" }),
  sabika:         real("sabika").notNull(),
  sosyal_izole:   real("sosyal_izole").notNull(),
  oz_bakim:       real("oz_bakim").notNull(),
  duygusal_tepki: real("duygusal_tepki").notNull(),
  nezaket:        real("nezaket").notNull(),
  score:          real("score").notNull(),
  decision:       text("decision").notNull(),
  note:           text("note"),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Student    = typeof studentsTable.$inferSelect;
export type Assessment = typeof assessmentsTable.$inferSelect;