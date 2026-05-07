# -*- coding: utf-8 -*-
"""
Created on Thu May  7 12:34:16 2026

@author: Dell
"""

import pino from "pino";
const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: ["req.headers.authorization", "req.headers.cookie", "res.headers['set-cookie']"],
  ...(isProduction ? {} : {
    transport: { target: "pino-pretty", options: { colorize: true } },
  }),
});
