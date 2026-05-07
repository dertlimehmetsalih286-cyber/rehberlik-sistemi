# -*- coding: utf-8 -*-
"""
Created on Thu May  7 12:34:32 2026

@author: Dell
"""

export type Decision = "yok" | "gozlem" | "danisman";

export interface AssessmentInputs {
  sabika: number;       // Disiplin geçmişi (0-10)
  sosyal_izole: number; // Sosyal izolasyon (0-10)
  oz_bakim: number;     // Öz bakım (0-10)
  duygusal_tepki: number; // Duygusal tepkisellik (0-10)
  nezaket: number;      // Nezaket ve saygı (0-10)
}

export interface MembershipBreakdown { yok: number; gozlem: number; danisman: number; }
export interface FuzzyResult {
  score: number; decision: Decision; decisionLabel: string;
  recommendation: string; membership: MembershipBreakdown;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function triangular(x: number, a: number, b: number, c: number): number {
  if (x <= a || x >= c) return 0;
  if (x === b) return 1;
  if (x < b) return clamp01((x - a) / (b - a));
  return clamp01((c - x) / (c - b));
}

// automf(3): poor / average / good — 0..10 evren
function inputMembership(x: number) {
  return {
    poor:    triangular(x, 0, 0,  5),
    average: triangular(x, 0, 5, 10),
    good:    triangular(x, 5, 10, 10),
  };
}

// Çıktı bantları: yok [0,0,35] / gozlem [30,50,70] / danisman [65,100,100]
function outputMembership(x: number): MembershipBreakdown {
  return {
    yok:      triangular(x, 0,   0,   35),
    gozlem:   triangular(x, 30,  50,  70),
    danisman: triangular(x, 65, 100, 100),
  };
}

const RECOMMENDATIONS: Record<Decision, string> = {
  yok:      "Öğrenci için şu an ek bir müdahale gerekmiyor. Olumlu davranışlarını destekleyin ve düzenli takibe devam edin.",
  gozlem:   "Öğrenciyi sınıf içinde ve sosyal ortamda yakından gözlemleyin. Veli ile iletişime geçip değişimleri kayıt altına alın.",
  danisman: "Öğrenci için en kısa sürede rehber öğretmen yönlendirmesi yapılmalı. Sınıf öğretmeni ve veli ile koordineli bir destek planı hazırlayın.",
};

const LABELS: Record<Decision, string> = {
  yok:      "Müdahale Gerekmiyor",
  gozlem:   "Gözlem Önerilir",
  danisman: "Rehber Öğretmene Yönlendir",
};

// Hard override kuralları — fuzzy motorunu kısa devre eder
function applyOverrideRules(inputs: AssessmentInputs): FuzzyResult | null {
  const referToCounselor = inputs.duygusal_tepki >= 6 || inputs.sabika > 3;
  const noIntervention   = inputs.oz_bakim >= 6 && inputs.nezaket >= 6;

  if (referToCounselor) {
    const reasons: string[] = [];
    if (inputs.duygusal_tepki >= 6) reasons.push("duygusal tepkisellik yüksek");
    if (inputs.sabika > 3) reasons.push("disiplin geçmişi 3'ün üzerinde");
    return {
      score: 85, decision: "danisman", decisionLabel: LABELS.danisman,
      recommendation: `Belirleyici eşik aşıldı (${reasons.join(", ")}). ` + RECOMMENDATIONS.danisman,
      membership: { yok: 0, gozlem: 0, danisman: 1 },
    };
  }

  if (noIntervention) {
    return {
      score: 15, decision: "yok", decisionLabel: LABELS.yok,
      recommendation: "Öz bakım ve nezaket düzeyleri 6'nın üzerinde. " + RECOMMENDATIONS.yok,
      membership: { yok: 1, gozlem: 0, danisman: 0 },
    };
  }
  return null;
}

// Ana hesaplama — Mamdani max-min + centroid defuzz
export function computeFuzzy(inputs: AssessmentInputs): FuzzyResult {
  const override = applyOverrideRules(inputs);
  if (override) return override;

  const sabika  = inputMembership(inputs.sabika);
  const sosyal  = inputMembership(inputs.sosyal_izole);
  const ozbakim = inputMembership(inputs.oz_bakim);
  const tepki   = inputMembership(inputs.duygusal_tepki);
  const nezaket = inputMembership(inputs.nezaket);

  // R1: sosyal_izole.good AND oz_bakim.poor  -> danisman
  const r1 = Math.min(sosyal.good, ozbakim.poor);
  // R2: duygusal_tepki.good OR sabika.good   -> danisman
  const r2 = Math.max(tepki.good, sabika.good);
  // R3: nezaket.good AND duygusal_tepki.poor -> yok
  const r3 = Math.min(nezaket.good, tepki.poor);

  const aggDanisman = Math.max(r1, r2);
  const aggYok      = r3;
  const aggGozlem   = 0;

  let numerator = 0, denominator = 0;
  for (let x = 0; x <= 100; x++) {
    const mf = outputMembership(x);
    const mu = Math.max(
      Math.min(aggYok,      mf.yok),
      Math.min(aggGozlem,   mf.gozlem),
      Math.min(aggDanisman, mf.danisman),
    );
    numerator   += x * mu;
    denominator += mu;
  }

  let score = denominator > 0 ? numerator / denominator : 50;
  score = Math.max(0, Math.min(100, Math.round(score * 100) / 100));

  const decision = pickDecision(score);
  const mf = outputMembership(score);
  return {
    score, decision, decisionLabel: LABELS[decision],
    recommendation: RECOMMENDATIONS[decision],
    membership: {
      yok:      Math.round(mf.yok      * 1000) / 1000,
      gozlem:   Math.round(mf.gozlem   * 1000) / 1000,
      danisman: Math.round(mf.danisman * 1000) / 1000,
    },
  };
}

export function pickDecision(score: number): Decision {
  const mf = outputMembership(score);
  let best: Decision = "gozlem", bestVal = mf.gozlem;
  if (mf.yok      > bestVal) { best = "yok";      bestVal = mf.yok; }
  if (mf.danisman > bestVal) { best = "danisman";  bestVal = mf.danisman; }
  if (bestVal === 0) {
    if (score < 35)  return "yok";
    if (score > 65)  return "danisman";
    return "gozlem";
  }
  return best;
}

export function decisionLabel(decision: Decision): string { return LABELS[decision]; }
