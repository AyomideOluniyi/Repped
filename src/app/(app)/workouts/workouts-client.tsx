"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Dumbbell, Calendar, ChevronRight, Flame, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDuration, formatRelativeTime } from "@/lib/utils";

interface WorkoutSet {
  exercise: { name: string; muscleGroups: string[] };
  weight: number | null;
  reps: number | null;
}

interface Workout {
  id: string;
  name: string;
  date: Date;
  duration: number | null;
  notes: string | null;
  sets: WorkoutSet[];
}

function CalendarView({ workouts }: { workouts: Workout[] }) {
  const router = useRouter();
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  // Map "YYYY-MM-DD" -> first workout on that day
  const workoutsByDay = new Map<string, Workout>();
  for (const w of workouts) {
    const d = new Date(w.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!workoutsByDay.has(key)) workoutsByDay.set(key, w);
  }

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <Card>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-surface-elevated transition-colors text-text-muted">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-bold text-text-primary text-sm">{monthName}</p>
        <button onClick={nextMonth} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-surface-elevated transition-colors text-text-muted">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-2xs font-semibold text-text-muted py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const workout = workoutsByDay.get(key);
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return (
            <button
              key={key}
              onClick={() => workout && router.push(`/workouts/${workout.id}`)}
              className={`relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all
                ${workout ? "bg-accent-green text-black hover:bg-accent-green/80" : isToday ? "ring-2 ring-accent-green text-text-primary" : "text-text-secondary hover:bg-surface-elevated"}`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-accent-green" />
          <span className="text-2xs text-text-muted">Workout logged</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full ring-2 ring-accent-green" />
          <span className="text-2xs text-text-muted">Today</span>
        </div>
      </div>
    </Card>
  );
}

export function WorkoutsClient({ workouts }: { workouts: Workout[] }) {
  const [view, setView] = useState<"list" | "calendar">("list");

  const totalVolume = (workout: Workout) =>
    workout.sets.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0);

  const getMuscleGroups = (workout: Workout) => {
    const groups = new Set<string>();
    workout.sets.forEach((s) => s.exercise.muscleGroups.forEach((g) => groups.add(g)));
    return [...groups];
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 p-1 bg-surface-elevated rounded-xl border border-border">
          {(["list", "calendar"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                view === v
                  ? "bg-background text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {v === "list"
                ? <span className="flex items-center gap-1.5"><Dumbbell className="h-3.5 w-3.5" />List</span>
                : <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Calendar</span>}
            </button>
          ))}
        </div>
        <Link href="/workouts/new">
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
            Log Workout
          </Button>
        </Link>
      </div>

      {/* Weekly summary */}
      {workouts.length > 0 && view === "list" && (
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-accent-green" />
            <span className="text-sm font-semibold text-text-primary">This Week</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Workouts", value: workouts.filter(w => {
                const d = new Date(w.date);
                const now = new Date();
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                return d >= startOfWeek;
              }).length },
              { label: "Total Volume", value: `${Math.round(workouts.slice(0, 7).reduce((s, w) => s + totalVolume(w), 0) / 1000)}k kg` },
              { label: "Avg Duration", value: formatDuration(Math.round(workouts.filter(w => w.duration).slice(0, 7).reduce((s, w) => s + (w.duration ?? 0), 0) / Math.max(1, workouts.filter(w => w.duration).slice(0, 7).length))) },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-black font-display text-text-primary">{stat.value}</p>
                <p className="text-2xs text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {workouts.length === 0 ? (
        <div className="text-center py-16">
          <Dumbbell className="h-14 w-14 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">No workouts yet</h2>
          <p className="text-text-secondary mb-6 text-sm">Log your first workout to start tracking your progress</p>
          <Link href="/workouts/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Log First Workout</Button>
          </Link>
        </div>
      ) : view === "calendar" ? (
        <CalendarView workouts={workouts} />
      ) : (
        <div className="space-y-2">
          {workouts.map((workout, i) => {
            const muscles = getMuscleGroups(workout).slice(0, 3);
            const volume = totalVolume(workout);
            return (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/workouts/${workout.id}`}>
                  <Card hoverable>
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center shrink-0">
                        <Dumbbell className="h-5 w-5 text-accent-green" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-text-primary">{workout.name}</p>
                            <p className="text-xs text-text-muted mt-0.5">{formatRelativeTime(workout.date)}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-text-muted shrink-0 mt-0.5" />
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {muscles.length > 0 ? muscles.map((m) => (
                            <Badge key={m} variant="secondary" className="text-2xs">
                              {m.replace(/_/g, " ")}
                            </Badge>
                          )) : (
                            <Badge variant="secondary" className="text-2xs">Custom</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                          <span>{workout.sets.length} sets</span>
                          {volume > 0 && <span>{Math.round(volume)}kg volume</span>}
                          {workout.duration && <span>{formatDuration(workout.duration)}</span>}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
