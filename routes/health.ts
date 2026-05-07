# -*- coding: utf-8 -*-
"""
Created on Thu May  7 12:35:33 2026

@author: Dell
"""

import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();
router.get("/healthz", (_req, res) => {
  res.json(HealthCheckResponse.parse({ status: "ok" }));
});
export default router;
