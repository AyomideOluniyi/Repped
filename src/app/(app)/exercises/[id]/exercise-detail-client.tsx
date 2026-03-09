"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Dumbbell, Trophy, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: string;
  description: string | null;
  instructions: string[];
  commonMistakes: string[];
  tips: string[];
  repRangeStrength: string | null;
  repRangeHypertrophy: string | null;
  repRangeEndurance: string | null;
}

interface PersonalRecord {
  weight: number;
  reps: number;
  date: Date;
}

export function ExerciseDetailClient({ exercise, userRecord }: { exercise: Exercise; userRecord: PersonalRecord | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-4 max-w-2xl mx-auto"
    >
      {/* Header */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center shrink-0">
            <Dumbbell className="h-6 w-6 text-accent-green" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black font-display text-text-primary">{exercise.name}</h1>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {exercise.muscleGroups.map((m) => (
                <Badge key={m} variant="default">{m.replace(/_/g, " ")}</Badge>
              ))}
              {exercise.equipment.slice(0, 2).map((e) => (
                <Badge key={e} variant="secondary">{e.replace(/_/g, " ")}</Badge>
              ))}
              <Badge variant={exercise.difficulty === "BEGINNER" ? "success" : exercise.difficulty === "INTERMEDIATE" ? "warning" : "destructive"}>
                {exercise.difficulty}
              </Badge>
            </div>
          </div>
        </div>

        {exercise.description && (
          <p className="text-sm text-text-secondary mt-3 leading-relaxed">{exercise.description}</p>
        )}
      </Card>

      {/* Your PR */}
      {userRecord && (
        <Card className="bg-accent-green/5 border-accent-green/20">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-status-warning" />
            <span className="text-sm font-semibold text-text-primary">Your Personal Record</span>
          </div>
          <p className="text-2xl font-black font-display text-accent-green">
            {userRecord.weight}kg × {userRecord.reps} reps
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            {new Date(userRecord.date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </Card>
      )}

      {/* Rep ranges */}
      <Card>
        <h2 className="font-bold text-text-primary mb-3">Recommended Rep Ranges</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Strength", value: exercise.repRangeStrength, desc: "3-5 min rest" },
            { label: "Hypertrophy", value: exercise.repRangeHypertrophy, desc: "60-90s rest" },
            { label: "Endurance", value: exercise.repRangeEndurance, desc: "30-60s rest" },
          ].map((range) => (
            <div key={range.label} className="text-center p-3 rounded-xl bg-surface-elevated border border-border">
              <p className="text-xs font-semibold text-text-muted mb-1">{range.label}</p>
              <p className="text-lg font-black font-display text-text-primary">{range.value}</p>
              <p className="text-2xs text-text-muted mt-1">{range.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Instructions */}
      {exercise.instructions.length > 0 && (
        <Card>
          <h2 className="font-bold text-text-primary mb-3">How to Perform</h2>
          <div className="space-y-3">
            {exercise.instructions.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-accent-green/10 border border-accent-green/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-accent-green">{i + 1}</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Common mistakes */}
      {exercise.commonMistakes.length > 0 && (
        <Card>
          <h2 className="font-bold text-text-primary mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-status-warning" />
            Common Mistakes to Avoid
          </h2>
          <div className="space-y-2">
            {exercise.commonMistakes.map((mistake, i) => (
              <div key={i} className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-status-warning mt-2 shrink-0" />
                <p className="text-sm text-text-secondary">{mistake}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tips */}
      {exercise.tips.length > 0 && (
        <Card>
          <h2 className="font-bold text-text-primary mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent-green" />
            Pro Tips
          </h2>
          <div className="space-y-2">
            {exercise.tips.map((tip, i) => (
              <div key={i} className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent-green mt-2 shrink-0" />
                <p className="text-sm text-text-secondary">{tip}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* CTA */}
      <Link href="/workouts/new">
        <Button className="w-full" leftIcon={<Plus className="h-4 w-4" />}>
          Add to Workout
        </Button>
      </Link>
    </motion.div>
  );
}
