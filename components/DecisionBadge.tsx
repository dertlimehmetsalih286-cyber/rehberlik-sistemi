# -*- coding: utf-8 -*-
"""
Created on Thu May  7 12:37:50 2026

@author: Dell
"""

import { Decision } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Eye, AlertTriangle } from "lucide-react";

export const decisionConfig = {
  yok:      { label: "Müdahale Gerekmiyor",          colorClass: "bg-[#eaf4eb] text-[#2e7d32] border-[#c8e6c9]", icon: CheckCircle2 },
  gozlem:   { label: "Gözlem Önerilir",              colorClass: "bg-[#fff8e1] text-[#f57c00] border-[#ffecb3]", icon: Eye },
  danisman: { label: "Rehber Öğretmene Yönlendir",   colorClass: "bg-[#fbe9e7] text-[#d32f2f] border-[#ffccbc]", icon: AlertTriangle },
};

export function DecisionBadge({ decision, className, showIcon = true }: { decision: Decision; className?: string; showIcon?: boolean }) {
  const config = decisionConfig[decision] || decisionConfig.yok;
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", config.colorClass, className)}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
}
