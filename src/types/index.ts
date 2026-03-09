import type { User, Workout, WorkoutSet, Exercise, Video, PersonalRecord, MealLog, Post, Challenge, Badge, UserBadge } from "@prisma/client";

export type { User, Workout, WorkoutSet, Exercise, Video, PersonalRecord, MealLog, Post, Challenge, Badge, UserBadge };

export type WorkoutWithSets = Workout & {
  sets: (WorkoutSet & { exercise: Exercise })[];
};

export type PostWithAuthor = Post & {
  user: Pick<User, "id" | "name" | "avatar" | "username">;
  likes: { userId: string }[];
  comments: { id: string }[];
  _count: { likes: number; comments: number };
};

export type VideoWithUser = Video & {
  user: Pick<User, "id" | "name" | "avatar" | "username">;
};

export type ExerciseWithRecords = Exercise & {
  personalRecords: PersonalRecord[];
};

export type ChallengeWithParticipants = Challenge & {
  participants: { userId: string; rank: number | null; progress: unknown }[];
  creator: Pick<User, "id" | "name" | "avatar">;
  _count: { participants: number };
};

export type UserBadgeWithDetails = UserBadge & {
  badge: Badge;
};

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export interface MuscleGroupFilter {
  value: string;
  label: string;
}

export interface WorkoutLogEntry {
  exerciseId: string;
  exerciseName: string;
  sets: {
    reps: number;
    weight: number;
    rpe?: number;
    restTime?: number;
  }[];
}

export interface AIAnalysisResult {
  foods: {
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  healthRating: number;
  healthNotes: string;
  suggestions: string[];
}

export interface EquipmentAnalysisResult {
  name: string;
  category: string;
  primaryMuscles: string[];
  exercises: {
    name: string;
    description: string;
    difficulty: string;
  }[];
  setupInstructions: string;
  commonMistakes: string[];
  adjustmentTips: string;
}

export interface PlateResult {
  plate: number;
  count: number;
}
