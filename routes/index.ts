# -*- coding: utf-8 -*-
"""
Created on Thu May  7 12:35:22 2026

@author: Dell
"""

import { Router, type IRouter } from "express";
import healthRouter     from "./health";
import studentsRouter   from "./students";
import assessmentsRouter from "./assessments";
import dashboardRouter  from "./dashboard";
import schoolsRouter    from "./schools";

const router: IRouter = Router();
router.use(healthRouter);
router.use(studentsRouter);
router.use(assessmentsRouter);
router.use(dashboardRouter);
router.use(schoolsRouter);
export default router;
