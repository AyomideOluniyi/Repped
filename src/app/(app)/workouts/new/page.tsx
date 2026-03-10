"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Timer, Check,
  Search, X, Save, Play, Pause, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  equipment: string[];
}

interface SetEntry {
  id: string;
  reps: string;
  weight: string;
  rpe: string;
  restTime: string;
  isPR?: boolean;
}

interface ExerciseEntry {
  id: string;
  exercise: Exercise;
  sets: SetEntry[];
}

const REST_TIMER_PRESETS = [60, 90, 120, 180, 240, 300];

export default function NewWorkoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [workoutName, setWorkoutName] = useState(`${new Date().toLocaleDateString("en-GB", { weekday: "long", month: "short", day: "numeric" })} Workout`);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startTime] = useState(Date.now());
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  // Track keyboard height via visualViewport so the modal stays above the keyboard
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => setKeyboardOffset(window.innerHeight - vv.height - (vv.offsetTop ?? 0));
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    return () => { vv.removeEventListener("resize", onResize); vv.removeEventListener("scroll", onResize); };
  }, []);

  // Rest timer
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerDuration, setTimerDuration] = useState(90);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerActive && timerSeconds > 0) {
      timerRef.current = setTimeout(() => setTimerSeconds((s) => s - 1), 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
      if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
      toast({ title: "Rest complete!", description: "Time to get back to it 💪", variant: "success" });
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timerActive, timerSeconds, toast]);

  const startTimer = (seconds: number) => {
    setTimerDuration(seconds);
    setTimerSeconds(seconds);
    setTimerActive(true);
  };

  const searchExercises = async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    const res = await fetch(`/api/exercises?q=${encodeURIComponent(q)}&limit=10`);
    const data = await res.json();
    setSearchResults(data.exercises ?? []);
    setSearchLoading(false);
  };

  const addExercise = (exercise: Exercise) => {
    setExercises((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        exercise,
        sets: [{ id: Math.random().toString(36).slice(2), reps: "", weight: "", rpe: "", restTime: "90" }],
      },
    ]);
    setShowExerciseSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const addSet = (exerciseIdx: number) => {
    setExercises((prev) => {
      const copy = [...prev];
      const lastSet = copy[exerciseIdx].sets.at(-1);
      copy[exerciseIdx].sets.push({
        id: Math.random().toString(36).slice(2),
        reps: lastSet?.reps ?? "",
        weight: lastSet?.weight ?? "",
        rpe: lastSet?.rpe ?? "",
        restTime: lastSet?.restTime ?? "90",
      });
      return copy;
    });
  };

  const updateSet = (exerciseIdx: number, setIdx: number, field: keyof SetEntry, value: string) => {
    setExercises((prev) => {
      const copy = [...prev];
      (copy[exerciseIdx].sets[setIdx] as unknown as Record<string, string>)[field] = value;
      return copy;
    });
  };

  const removeSet = (exerciseIdx: number, setIdx: number) => {
    setExercises((prev) => {
      const copy = [...prev];
      copy[exerciseIdx].sets.splice(setIdx, 1);
      if (copy[exerciseIdx].sets.length === 0) copy.splice(exerciseIdx, 1);
      return copy;
    });
  };

  const removeExercise = (exerciseIdx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== exerciseIdx));
  };

  const saveWorkout = async () => {
    if (exercises.length === 0) {
      toast({ title: "Add at least one exercise", variant: "error" });
      return;
    }
    setSaving(true);
    try {
      const duration = Math.round((Date.now() - startTime) / 1000);
      const sets = exercises.flatMap((e, ei) =>
        e.sets.map((s, si) => ({
          exerciseId: e.exercise.id,
          setNumber: ei * 100 + si + 1,
          reps: s.reps ? parseInt(s.reps) : undefined,
          weight: s.weight ? parseFloat(s.weight) : undefined,
          rpe: s.rpe ? parseFloat(s.rpe) : undefined,
          restTime: s.restTime ? parseInt(s.restTime) : undefined,
        }))
      );

      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workoutName, duration, sets }),
      });

      if (!res.ok) throw new Error("Failed to save");
      const workout = await res.json();
      toast({ title: "Workout saved! 💪", variant: "success" });
      router.push(`/workouts/${workout.id}`);
    } catch {
      toast({ title: "Failed to save workout", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const timerProgress = timerDuration > 0 ? ((timerDuration - timerSeconds) / timerDuration) * 100 : 0;
  const timerColor = timerSeconds <= 10 ? "text-status-error" : timerSeconds <= 30 ? "text-status-warning" : "text-accent-green";

  return (
    <div className="max-w-2xl mx-auto pb-32">
      {/* Workout name */}
      <div className="p-4 pb-0">
        <input
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          className="w-full bg-transparent text-xl font-black font-display text-text-primary placeholder:text-text-muted focus:outline-none border-b border-transparent focus:border-accent-green/50 pb-1 transition-colors"
          placeholder="Workout name..."
        />
      </div>

      {/* Rest timer */}
      <AnimatePresence>
        {timerActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-4 mt-4 p-4 rounded-2xl bg-surface-elevated border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-accent-green" />
                  <span className="text-sm font-semibold text-text-primary">Rest Timer</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimerActive(!timerActive)}
                    className="text-text-muted hover:text-text-primary transition-colors"
                  >
                    {timerActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => { setTimerSeconds(timerDuration); setTimerActive(false); }}
                    className="text-text-muted hover:text-text-primary transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button onClick={() => setTimerActive(false)} className="text-text-muted">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-center">
                <span className={`text-5xl font-black font-display tabular-nums ${timerColor}`}>
                  {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-green rounded-full transition-all duration-1000"
                  style={{ width: `${timerProgress}%` }}
                />
              </div>
              <div className="flex gap-2 mt-3 justify-center flex-wrap">
                {REST_TIMER_PRESETS.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => startTimer(sec)}
                    className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                      timerDuration === sec ? "border-accent-green text-accent-green bg-accent-green/10" : "border-border text-text-muted hover:border-border-strong"
                    }`}
                  >
                    {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercises */}
      <div className="p-4 space-y-4">
        {exercises.map((entry, exerciseIdx) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card>
              {/* Exercise header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-text-primary">{entry.exercise.name}</p>
                  <div className="flex gap-1 mt-0.5 flex-wrap">
                    {entry.exercise.muscleGroups.slice(0, 2).map((m) => (
                      <Badge key={m} variant="secondary" className="text-2xs">
                        {m.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => removeExercise(exerciseIdx)}
                  className="text-text-muted hover:text-status-error transition-colors p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Set headers */}
              <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 mb-2 px-1">
                <span className="text-2xs text-text-muted text-center">#</span>
                <span className="text-2xs text-text-muted text-center">KG</span>
                <span className="text-2xs text-text-muted text-center">REPS</span>
                <span />
              </div>

              {/* Sets */}
              {entry.sets.map((set, setIdx) => (
                <div key={set.id} className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 mb-2 items-center">
                  <span className="text-sm font-bold text-text-muted text-center">{setIdx + 1}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={set.weight}
                    onChange={(e) => updateSet(exerciseIdx, setIdx, "weight", e.target.value)}
                    className="h-10 w-full rounded-xl bg-surface-elevated border border-border text-center text-sm font-semibold text-text-primary focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green/30"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={set.reps}
                    onChange={(e) => updateSet(exerciseIdx, setIdx, "reps", e.target.value)}
                    className="h-10 w-full rounded-xl bg-surface-elevated border border-border text-center text-sm font-semibold text-text-primary focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green/30"
                  />
                  <button
                    onClick={() => removeSet(exerciseIdx, setIdx)}
                    className="flex items-center justify-center text-text-muted hover:text-status-error transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {/* Add set + timer */}
              <div className="flex gap-2 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  onClick={() => addSet(exerciseIdx)}
                >
                  Add Set
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Timer className="h-3.5 w-3.5" />}
                  onClick={() => startTimer(90)}
                >
                  Rest
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}

        {/* Add exercise button */}
        <button
          onClick={() => setShowExerciseSearch(true)}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-border hover:border-accent-green/40 hover:bg-accent-green/5 transition-all text-text-muted hover:text-accent-green group"
        >
          <Plus className="h-5 w-5" />
          <span className="font-semibold">Add Exercise</span>
        </button>
      </div>

      {/* Exercise search modal */}
      <AnimatePresence>
        {showExerciseSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowExerciseSearch(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-3xl max-h-[80dvh] overflow-hidden"
              style={{ bottom: keyboardOffset, paddingBottom: keyboardOffset > 0 ? 0 : "env(safe-area-inset-bottom, 0px)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border">
                <div className="h-1 w-10 rounded-full bg-border-strong mx-auto mb-4" />
                <Input
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchExercises(e.target.value);
                  }}
                  leftIcon={<Search className="h-4 w-4" />}
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto max-h-[60dvh] p-2">
                {searchLoading && (
                  <div className="text-center py-4 text-text-muted text-sm">Searching...</div>
                )}
                {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="py-2">
                    <p className="text-center py-2 text-text-muted text-sm">No exercises found</p>
                    <button
                      onClick={() => addExercise({ id: `custom-${Date.now()}`, name: searchQuery.trim(), muscleGroups: [], equipment: [] })}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-accent-green/10 border border-accent-green/20 hover:bg-accent-green/15 transition-colors text-left"
                    >
                      <div className="h-9 w-9 rounded-xl bg-accent-green/20 flex items-center justify-center shrink-0">
                        <Plus className="h-4 w-4 text-accent-green" />
                      </div>
                      <div>
                        <p className="font-semibold text-accent-green text-sm">Add &quot;{searchQuery.trim()}&quot;</p>
                        <p className="text-xs text-text-muted">Add as custom exercise</p>
                      </div>
                    </button>
                  </div>
                )}
                {searchResults.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => addExercise(exercise)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-elevated transition-colors text-left"
                  >
                    <div className="h-9 w-9 rounded-xl bg-accent-green/10 flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-accent-green" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{exercise.name}</p>
                      <p className="text-xs text-text-muted">
                        {exercise.muscleGroups.slice(0, 2).join(", ")}
                      </p>
                    </div>
                  </button>
                ))}
                {searchResults.length > 0 && searchQuery.trim() && (
                  <button
                    onClick={() => addExercise({ id: `custom-${Date.now()}`, name: searchQuery.trim(), muscleGroups: [], equipment: [] })}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-elevated transition-colors text-left mt-1 border-t border-border pt-3"
                  >
                    <div className="h-9 w-9 rounded-xl bg-accent-green/10 flex items-center justify-center shrink-0">
                      <Plus className="h-4 w-4 text-accent-green" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-sm">Add &quot;{searchQuery.trim()}&quot;</p>
                      <p className="text-xs text-text-muted">Add as custom exercise</p>
                    </div>
                  </button>
                )}
                {searchQuery.length < 2 && (
                  <p className="text-center py-4 text-text-muted text-sm">Type to search exercises</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save bar */}
      <div className="fixed bottom-[var(--nav-bar-height)] left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-t border-border md:bottom-0">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            Discard
          </Button>
          <Button
            className="flex-1"
            loading={saving}
            leftIcon={<Save className="h-4 w-4" />}
            onClick={saveWorkout}
          >
            Save Workout
          </Button>
        </div>
      </div>
    </div>
  );
}
