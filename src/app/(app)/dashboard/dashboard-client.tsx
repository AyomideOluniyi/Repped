"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Dumbbell, Utensils, Flame, TrendingUp, Trophy, Plus,
  ChevronRight, Zap, Camera, BookOpen, Target
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration, formatRelativeTime } from "@/lib/utils";

const MOTIVATIONAL_QUOTES = [
  "The pain you feel today is the strength you feel tomorrow.",
  "Don't stop when you're tired. Stop when you're done.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Results happen over time, not overnight. Work hard, stay consistent.",
  "Train insane or remain the same.",
  "Champions aren't made in the gyms. Champions are made from something they have deep inside.",
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface DashboardData {
  recentWorkouts: Array<{
    id: string;
    name: string;
    date: Date;
    duration: number | null;
    sets: Array<{ exercise: { name: string } }>;
  }>;
  todayCalories: number;
  todayProtein: number;
  weekWorkouts: number;
  totalRecords: number;
  streak: number;
}

interface DashboardClientProps {
  data: DashboardData;
  user: { name: string | null; avatar: string | null; goals: string[] } | null;
}

export function DashboardClient({ data, user }: DashboardClientProps) {
  const quote = MOTIVATIONAL_QUOTES[new Date().getDay() % MOTIVATIONAL_QUOTES.length];

  const quickActions = [
    { label: "Log Workout", href: "/workouts/new", icon: Dumbbell, color: "text-accent-green", bg: "bg-accent-green/10" },
    { label: "Scan Meal", href: "/nutrition/scan", icon: Camera, color: "text-accent-orange", bg: "bg-accent-orange/10" },
    { label: "Find Exercise", href: "/exercises", icon: BookOpen, color: "text-status-info", bg: "bg-status-info/10" },
    { label: "Generate Plan", href: "/workouts/generate", icon: Zap, color: "text-status-warning", bg: "bg-status-warning/10" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-4 space-y-5 max-w-2xl mx-auto"
    >
      {/* Stats row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <Card className="bg-accent-green/5 border-accent-green/20">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-4 w-4 text-accent-green" />
            <span className="text-xs text-text-muted">Day Streak</span>
          </div>
          <p className="text-3xl font-black font-display text-accent-green">{data.streak}</p>
          <p className="text-xs text-text-muted mt-0.5">days in a row</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell className="h-4 w-4 text-text-secondary" />
            <span className="text-xs text-text-muted">This Week</span>
          </div>
          <p className="text-3xl font-black font-display text-text-primary">{data.weekWorkouts}</p>
          <p className="text-xs text-text-muted mt-0.5">workouts logged</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Utensils className="h-4 w-4 text-text-secondary" />
            <span className="text-xs text-text-muted">Today&apos;s Calories</span>
          </div>
          <p className="text-3xl font-black font-display text-text-primary">
            {Math.round(data.todayCalories)}
          </p>
          <p className="text-xs text-text-muted mt-0.5">{Math.round(data.todayProtein)}g protein</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-status-warning" />
            <span className="text-xs text-text-muted">Total PRs</span>
          </div>
          <p className="text-3xl font-black font-display text-text-primary">{data.totalRecords}</p>
          <p className="text-xs text-text-muted mt-0.5">personal records</p>
        </Card>
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-border bg-surface-elevated hover:border-border-strong transition-colors"
                >
                  <div className={`h-10 w-10 rounded-xl ${action.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <span className="text-2xs font-medium text-text-secondary text-center leading-tight">
                    {action.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Recent workouts */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Recent Workouts</h2>
          <Link href="/workouts" className="text-xs text-accent-green hover:underline flex items-center gap-0.5">
            See all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {data.recentWorkouts.length === 0 ? (
          <Card className="text-center py-8">
            <Dumbbell className="h-10 w-10 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-semibold">No workouts yet</p>
            <p className="text-text-muted text-sm mb-4">Log your first workout to get started</p>
            <Link href="/workouts/new">
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                Log Workout
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-2">
            {data.recentWorkouts.map((workout) => {
              const exercises = [...new Set(workout.sets.map((s) => s.exercise.name))];
              return (
                <Link key={workout.id} href={`/workouts/${workout.id}`}>
                  <Card hoverable className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-accent-green/10 flex items-center justify-center shrink-0">
                      <Dumbbell className="h-5 w-5 text-accent-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-primary text-sm truncate">{workout.name}</p>
                      <p className="text-xs text-text-muted truncate">
                        {exercises.slice(0, 3).join(", ")}
                        {exercises.length > 3 && ` +${exercises.length - 3}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-text-muted">{formatRelativeTime(workout.date)}</p>
                      {workout.duration && (
                        <p className="text-xs text-text-muted">{formatDuration(workout.duration)}</p>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Goals */}
      {user?.goals && user.goals.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-text-muted" />
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Your Goals</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.goals.map((goal) => (
              <Badge key={goal} variant="default">
                {goal.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      {/* Motivational quote */}
      <motion.div variants={itemVariants}>
        <Card glass>
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-accent-green shrink-0 mt-0.5" />
            <p className="text-sm text-text-secondary italic leading-relaxed">&ldquo;{quote}&rdquo;</p>
          </div>
        </Card>
      </motion.div>

      {/* Bottom spacer for mobile nav */}
      <div className="h-4" />
    </motion.div>
  );
}
