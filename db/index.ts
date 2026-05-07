# -*- coding: utf-8 -*-
"""
Created on Thu May  7 12:36:58 2026

@author: Dell
"""

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL must be set.");

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
export * from "./schema";
