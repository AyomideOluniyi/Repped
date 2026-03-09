"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { calculate1RM } from "@/lib/utils";
import { Trophy } from "lucide-react";

const FORMULAS = ["epley", "brzycki", "lombardi"] as const;

export default function OneRMCalculatorPage() {
  const [weight, setWeight] = useState("100");
  const [reps, setReps] = useState("5");

  const w = parseFloat(weight) || 0;
  const r = parseInt(reps) || 1;

  const results = FORMULAS.map((f) => ({
    formula: f,
    oneRM: w > 0 && r >= 1 ? Math.round(calculate1RM(w, r, f) * 10) / 10 : 0,
  }));

  const avg = results.length > 0 ? Math.round((results.reduce((s, r) => s + r.oneRM, 0) / results.length) * 10) / 10 : 0;

  const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60].map((pct) => ({
    pct,
    weight: Math.round(avg * (pct / 100) * 2) / 2,
    reps: pct >= 100 ? 1 : pct >= 95 ? 2 : pct >= 90 ? 4 : pct >= 85 ? 5 : pct >= 80 ? 6 : pct >= 75 ? 8 : pct >= 70 ? 10 : pct >= 65 ? 12 : 15,
  }));

  return (
    <div className="p-4 space-y-4 max-w-sm mx-auto">
      <Card>
        <div className="space-y-3">
          <Input label="Weight (kg)" type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
          <Input label="Reps" type="number" inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} />
        </div>
      </Card>

      {avg > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Average 1RM */}
          <Card className="bg-accent-green/5 border-accent-green/20 text-center py-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy className="h-5 w-5 text-status-warning" />
              <span className="text-sm font-semibold text-text-secondary">Estimated 1RM</span>
            </div>
            <p className="text-5xl font-black font-display text-accent-green">{avg}<span className="text-xl text-text-muted">kg</span></p>
            <p className="text-xs text-text-muted mt-1">Average across formulas</p>
          </Card>

          {/* Formula breakdown */}
          <Card>
            <p className="text-sm font-semibold text-text-primary mb-3">Formula Breakdown</p>
            <div className="space-y-2">
              {results.map((r) => (
                <div key={r.formula} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary capitalize">{r.formula}</span>
                  <span className="text-sm font-bold text-text-primary">{r.oneRM}kg</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Percentage table */}
          <Card>
            <p className="text-sm font-semibold text-text-primary mb-3">Training Percentages</p>
            <div className="space-y-1.5">
              {percentages.map(({ pct, weight: w, reps: r }) => (
                <div key={pct} className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-sm text-text-muted">{pct}%</span>
                  <span className="text-sm font-semibold text-text-primary">{w}kg</span>
                  <span className="text-xs text-text-muted">~{r} reps</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
