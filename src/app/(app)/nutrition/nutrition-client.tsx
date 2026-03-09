"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, Utensils, Flame, Droplets, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface MealLog {
  id: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  rating: number | null;
  date: Date;
  photoUrl: string | null;
  name: string | null;
}

const DAILY_TARGETS = { calories: 2200, protein: 160, carbs: 250, fat: 75 };

export function NutritionClient({ todayMeals, recentMeals }: { todayMeals: MealLog[]; recentMeals: MealLog[] }) {
  const totals = todayMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories ?? 0),
      protein: acc.protein + (m.protein ?? 0),
      carbs: acc.carbs + (m.carbs ?? 0),
      fat: acc.fat + (m.fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const macros = [
    { label: "Protein", current: totals.protein, target: DAILY_TARGETS.protein, unit: "g", color: "orange" as const },
    { label: "Carbs", current: totals.carbs, target: DAILY_TARGETS.carbs, unit: "g", color: "blue" as const },
    { label: "Fat", current: totals.fat, target: DAILY_TARGETS.fat, unit: "g", color: "white" as const },
  ];

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Calorie ring + scan button */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-text-muted">Today&apos;s Calories</p>
            <p className="text-4xl font-black font-display text-text-primary">
              {Math.round(totals.calories)}
              <span className="text-lg font-normal text-text-muted"> / {DAILY_TARGETS.calories}</span>
            </p>
          </div>
          <Link href="/nutrition/scan">
            <Button leftIcon={<Camera className="h-4 w-4" />}>Scan Meal</Button>
          </Link>
        </div>

        {/* Calorie progress */}
        <Progress
          value={Math.min(100, (totals.calories / DAILY_TARGETS.calories) * 100)}
          color="green"
          className="h-3 mb-4"
        />

        {/* Macros */}
        <div className="grid grid-cols-3 gap-3">
          {macros.map((macro) => (
            <div key={macro.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-secondary">{macro.label}</span>
                <span className="text-text-muted">{Math.round(macro.current)}/{macro.target}{macro.unit}</span>
              </div>
              <Progress
                value={Math.min(100, (macro.current / macro.target) * 100)}
                color={macro.color}
                className="h-1.5"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Today's meals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Today&apos;s Meals</h2>
          <Link href="/nutrition/scan">
            <Button variant="ghost" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>Add</Button>
          </Link>
        </div>

        {todayMeals.length === 0 ? (
          <Card className="text-center py-8">
            <Utensils className="h-10 w-10 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-semibold">No meals logged today</p>
            <p className="text-text-muted text-sm mb-4">Take a photo to analyze your meal with AI</p>
            <Link href="/nutrition/scan">
              <Button size="sm" leftIcon={<Camera className="h-4 w-4" />}>Scan a Meal</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-2">
            {todayMeals.map((meal) => (
              <motion.div key={meal.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card>
                  <div className="flex items-center gap-3">
                    {meal.photoUrl ? (
                      <img src={meal.photoUrl} alt="meal" className="h-12 w-12 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-surface-elevated flex items-center justify-center shrink-0">
                        <Utensils className="h-5 w-5 text-text-muted" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-text-primary">{meal.name ?? "Meal"}</p>
                      <div className="flex gap-2 mt-0.5 text-xs text-text-muted">
                        {meal.calories && <span className="flex items-center gap-0.5"><Flame className="h-3 w-3" />{Math.round(meal.calories)} cal</span>}
                        {meal.protein && <span>{Math.round(meal.protein)}g protein</span>}
                      </div>
                    </div>
                    {meal.rating && (
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        meal.rating >= 7 ? "bg-status-success/20 text-status-success" :
                        meal.rating >= 4 ? "bg-status-warning/20 text-status-warning" :
                        "bg-status-error/20 text-status-error"
                      }`}>
                        {meal.rating}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
