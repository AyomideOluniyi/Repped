"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, BookOpen, Dumbbell, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const MUSCLE_FILTERS = ["All", "CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS", "QUADS", "HAMSTRINGS", "GLUTES", "CALVES", "ABS", "FULL_BODY"];
const DIFFICULTY_COLORS = {
  BEGINNER: "success" as const,
  INTERMEDIATE: "warning" as const,
  ADVANCED: "destructive" as const,
};

interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: string;
  description: string | null;
}

export function ExercisesClient({ exercises }: { exercises: Exercise[] }) {
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("All");

  const filtered = exercises.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchMuscle = muscleFilter === "All" || e.muscleGroups.includes(muscleFilter);
    return matchSearch && matchMuscle;
  });

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <Input
        placeholder="Search exercises..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      {/* Muscle filter chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {MUSCLE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setMuscleFilter(f)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              muscleFilter === f
                ? "bg-accent-green text-background"
                : "bg-surface-elevated text-text-secondary border border-border hover:border-border-strong"
            }`}
          >
            {f === "All" ? "All" : f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <p className="text-xs text-text-muted">{filtered.length} exercises</p>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-14 w-14 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">No exercises found</h2>
          <p className="text-text-secondary text-sm">Try a different search or filter</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((exercise, i) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Link href={`/exercises/${exercise.id}`}>
                <Card hoverable>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-surface-elevated flex items-center justify-center shrink-0">
                      <Dumbbell className="h-5 w-5 text-text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-primary">{exercise.name}</p>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        {exercise.muscleGroups.slice(0, 2).map((m) => (
                          <Badge key={m} variant="secondary" className="text-2xs">
                            {m.replace(/_/g, " ")}
                          </Badge>
                        ))}
                        <Badge
                          variant={DIFFICULTY_COLORS[exercise.difficulty as keyof typeof DIFFICULTY_COLORS] ?? "secondary"}
                          className="text-2xs"
                        >
                          {exercise.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
