"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Dumbbell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

interface GeneratedWorkoutDay {
  name: string;
  exercises: { name: string; sets: number; reps: string; rest: number; notes: string }[];
}

interface GeneratedWorkout {
  name: string;
  days: GeneratedWorkoutDay[];
  notes: string;
}

export default function GenerateWorkoutPage() {
  const { toast } = useToast();
  const [goal, setGoal] = useState("HYPERTROPHY");
  const [equipment, setEquipment] = useState("FULL_GYM");
  const [frequency, setFrequency] = useState("4");
  const [experience, setExperience] = useState("INTERMEDIATE");
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);

  const generate = async () => {
    setLoading(true);
    setWorkout(null);
    try {
      const res = await fetch("/api/ai/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, equipment, frequency, experience }),
      });
      const data = await res.json();
      setWorkout(data);
    } catch {
      toast({ title: "Generation failed", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-5 max-w-2xl mx-auto">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-accent-green" />
          <h2 className="font-bold text-text-primary">AI Workout Generator</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Goal</label>
            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HYPERTROPHY">Build Muscle</SelectItem>
                <SelectItem value="STRENGTH">Get Stronger</SelectItem>
                <SelectItem value="FAT_LOSS">Lose Fat</SelectItem>
                <SelectItem value="ENDURANCE">Improve Endurance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Equipment</label>
            <Select value={equipment} onValueChange={setEquipment}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FULL_GYM">Full Gym</SelectItem>
                <SelectItem value="DUMBBELLS">Dumbbells Only</SelectItem>
                <SelectItem value="BODYWEIGHT">Bodyweight Only</SelectItem>
                <SelectItem value="BARBELL">Barbell + Rack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Days per week</label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["2", "3", "4", "5", "6"].map((d) => (
                  <SelectItem key={d} value={d}>{d} days/week</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Experience Level</label>
            <Select value={experience} onValueChange={setExperience}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full"
            size="lg"
            loading={loading}
            leftIcon={<Zap className="h-4 w-4" />}
            onClick={generate}
          >
            {loading ? "Generating..." : "Generate My Plan"}
          </Button>
        </div>
      </Card>

      {loading && (
        <div className="text-center py-8">
          <div className="h-12 w-12 rounded-full border-2 border-accent-green border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">AI is building your personalized plan...</p>
        </div>
      )}

      {workout && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-black font-display text-text-primary text-lg">{workout.name}</h2>
            <Button variant="ghost" size="icon-sm" onClick={generate}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          {workout.days.map((day, i) => (
            <Card key={i}>
              <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-accent-green" />
                {day.name}
              </h3>
              <div className="space-y-2">
                {day.exercises.map((ex, j) => (
                  <div key={j} className="flex items-start justify-between gap-3 py-2 border-t border-border/50">
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{ex.name}</p>
                      <p className="text-xs text-text-muted">{ex.notes}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="secondary" className="text-2xs">
                        {ex.sets}×{ex.reps}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
          {workout.notes && (
            <Card glass>
              <p className="text-sm text-text-secondary italic">{workout.notes}</p>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
