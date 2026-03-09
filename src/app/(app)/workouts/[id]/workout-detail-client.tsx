"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Dumbbell, Calendar, Clock, Trash2, Share2, Trophy, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatDuration } from "@/lib/utils";

interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  rpe: number | null;
  exercise: { id: string; name: string; muscleGroups: string[] };
}

interface Workout {
  id: string;
  name: string;
  date: Date;
  duration: number | null;
  notes: string | null;
  sets: WorkoutSet[];
}

export function WorkoutDetailClient({ workout }: { workout: Workout }) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  // Group sets by exercise
  const groupedSets = workout.sets.reduce<Record<string, { name: string; muscleGroups: string[]; sets: WorkoutSet[] }>>((acc, set) => {
    const key = set.exercise.id;
    if (!acc[key]) acc[key] = { name: set.exercise.name, muscleGroups: set.exercise.muscleGroups, sets: [] };
    acc[key].sets.push(set);
    return acc;
  }, {});

  const totalVolume = workout.sets.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0);
  const totalSets = workout.sets.length;

  const handleDelete = async () => {
    if (!confirm("Delete this workout? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/workouts/${workout.id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Workout deleted", variant: "success" });
      router.push("/workouts");
    } else {
      toast({ title: "Failed to delete", variant: "error" });
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-4 max-w-2xl mx-auto"
    >
      {/* Workout summary */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center shrink-0">
            <Dumbbell className="h-6 w-6 text-accent-green" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black font-display text-text-primary">{workout.name}</h1>
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(workout.date).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
              </span>
              {workout.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(workout.duration)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-black font-display text-text-primary">{Object.keys(groupedSets).length}</p>
            <p className="text-xs text-text-muted">Exercises</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black font-display text-text-primary">{totalSets}</p>
            <p className="text-xs text-text-muted">Total Sets</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black font-display text-text-primary">{Math.round(totalVolume)}</p>
            <p className="text-xs text-text-muted">kg Volume</p>
          </div>
        </div>
      </Card>

      {/* Exercises */}
      {Object.entries(groupedSets).map(([exerciseId, group]) => (
        <Card key={exerciseId}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-text-primary">{group.name}</p>
              <div className="flex gap-1 mt-0.5">
                {group.muscleGroups.slice(0, 2).map((m) => (
                  <Badge key={m} variant="secondary" className="text-2xs">
                    {m.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
            <Trophy className="h-4 w-4 text-status-warning opacity-0" />
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[2rem_1fr_1fr_1fr] gap-2 mb-2 px-1">
            {["Set", "Weight", "Reps", "Vol"].map((h) => (
              <span key={h} className="text-2xs text-text-muted text-center">{h}</span>
            ))}
          </div>

          {/* Sets */}
          {group.sets.map((set, i) => (
            <div key={set.id} className="grid grid-cols-[2rem_1fr_1fr_1fr] gap-2 py-1.5 border-t border-border/50 items-center">
              <span className="text-sm font-bold text-text-muted text-center">{i + 1}</span>
              <span className="text-sm font-semibold text-text-primary text-center">
                {set.weight ? `${set.weight}kg` : "—"}
              </span>
              <span className="text-sm font-semibold text-text-primary text-center">
                {set.reps ?? "—"}
              </span>
              <span className="text-sm text-text-secondary text-center">
                {set.weight && set.reps ? Math.round(set.weight * set.reps) : "—"}
              </span>
            </div>
          ))}
        </Card>
      ))}

      {workout.notes && (
        <Card>
          <p className="text-sm font-semibold text-text-secondary mb-1">Notes</p>
          <p className="text-sm text-text-primary">{workout.notes}</p>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          leftIcon={<Share2 className="h-4 w-4" />}
          onClick={() => toast({ title: "Sharing coming soon!", variant: "info" })}
        >
          Share
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          leftIcon={<Trash2 className="h-4 w-4" />}
          loading={deleting}
          onClick={handleDelete}
        >
          Delete
        </Button>
      </div>
    </motion.div>
  );
}
