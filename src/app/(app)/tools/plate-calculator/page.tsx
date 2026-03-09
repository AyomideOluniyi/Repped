"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPlateConfig } from "@/lib/utils";

const PLATE_COLORS: Record<number, string> = {
  25: "bg-red-500",
  20: "bg-blue-500",
  15: "bg-yellow-500",
  10: "bg-green-500",
  5: "bg-white text-background",
  2.5: "bg-gray-400 text-background",
  1.25: "bg-gray-600",
  45: "bg-red-600",
  35: "bg-blue-600",
};

export default function PlateCalculatorPage() {
  const [targetWeight, setTargetWeight] = useState("100");
  const [barWeight, setBarWeight] = useState("20");
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");

  const target = parseFloat(targetWeight) || 0;
  const bar = parseFloat(barWeight) || 0;
  const plates = getPlateConfig(target, bar, unit);
  const isValid = target > bar;

  return (
    <div className="p-4 space-y-4 max-w-sm mx-auto">
      {/* Unit toggle */}
      <div className="flex gap-2 p-1 bg-surface-elevated rounded-xl border border-border">
        {(["kg", "lbs"] as const).map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${u === unit ? "bg-background text-text-primary shadow-sm" : "text-text-muted"}`}
          >
            {u.toUpperCase()}
          </button>
        ))}
      </div>

      <Input
        label={`Target Weight (${unit})`}
        type="number"
        inputMode="decimal"
        value={targetWeight}
        onChange={(e) => setTargetWeight(e.target.value)}
      />

      <Input
        label={`Bar Weight (${unit})`}
        type="number"
        inputMode="decimal"
        value={barWeight}
        onChange={(e) => setBarWeight(e.target.value)}
      />

      {/* Visual bar */}
      {isValid && plates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Plate diagram */}
          <Card>
            <p className="text-sm font-semibold text-text-muted mb-3 text-center">Each Side</p>
            <div className="flex items-center justify-center gap-1 flex-wrap">
              {/* Bar */}
              <div className="h-3 w-8 bg-surface-hover rounded-full" />
              {/* Plates */}
              {plates.map(({ plate, count }) =>
                Array.from({ length: count }).map((_, i) => (
                  <div
                    key={`${plate}-${i}`}
                    className={`${PLATE_COLORS[plate] ?? "bg-surface-hover"} rounded-sm text-2xs font-bold text-white flex items-center justify-center`}
                    style={{
                      height: `${Math.max(24, Math.min(64, plate * 1.5 + 16))}px`,
                      width: "20px",
                    }}
                  >
                    {plate}
                  </div>
                ))
              )}
              <div className="h-3 w-8 bg-surface-hover rounded-full" />
            </div>
          </Card>

          {/* Plate list */}
          <Card>
            <p className="text-sm font-semibold text-text-primary mb-3">Plates per side</p>
            <div className="space-y-2">
              {plates.map(({ plate, count }) => (
                <div key={plate} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-sm ${PLATE_COLORS[plate] ?? "bg-surface-hover"} flex items-center justify-center`}>
                      <span className="text-2xs font-bold">{plate}</span>
                    </div>
                    <span className="text-sm text-text-primary">{plate}{unit} plate</span>
                  </div>
                  <span className="text-sm font-bold text-accent-green">× {count}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex justify-between">
              <span className="text-sm text-text-muted">Total Weight</span>
              <span className="text-sm font-bold text-text-primary">{target}{unit}</span>
            </div>
          </Card>
        </motion.div>
      )}

      {!isValid && target > 0 && (
        <p className="text-sm text-status-error text-center">Target weight must be greater than bar weight</p>
      )}
    </div>
  );
}
