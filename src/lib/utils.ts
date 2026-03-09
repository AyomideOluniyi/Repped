import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWeight(weight: number, unit: "kg" | "lbs" = "kg"): string {
  if (unit === "lbs") {
    return `${(weight * 2.20462).toFixed(1)} lbs`;
  }
  return `${weight} kg`;
}

export function calculate1RM(
  weight: number,
  reps: number,
  formula: "epley" | "brzycki" | "lombardi" = "epley"
): number {
  if (reps === 1) return weight;
  switch (formula) {
    case "epley":
      return weight * (1 + reps / 30);
    case "brzycki":
      return weight * (36 / (37 - reps));
    case "lombardi":
      return weight * Math.pow(reps, 0.1);
    default:
      return weight * (1 + reps / 30);
  }
}

export function calculateTDEE(
  weight: number, // kg
  height: number, // cm
  age: number,
  gender: "male" | "female",
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active"
): number {
  // Mifflin-St Jeor equation
  let bmr: number;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return Math.round(bmr * activityMultipliers[activityLevel]);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs > 0 ? `${secs}s` : ""}`.trim();
  }
  return `${secs}s`;
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export function getPlateConfig(
  targetWeight: number,
  barWeight: number,
  unit: "kg" | "lbs" = "kg"
): { plate: number; count: number }[] {
  const availablePlates =
    unit === "kg"
      ? [25, 20, 15, 10, 5, 2.5, 1.25]
      : [45, 35, 25, 10, 5, 2.5];

  const weightPerSide = (targetWeight - barWeight) / 2;
  if (weightPerSide <= 0) return [];

  const plates: { plate: number; count: number }[] = [];
  let remaining = weightPerSide;

  for (const plate of availablePlates) {
    const count = Math.floor(remaining / plate);
    if (count > 0) {
      plates.push({ plate, count });
      remaining -= plate * count;
    }
  }

  return plates;
}

export function getStrengthLevel(
  exercise: string,
  bodyweight: number,
  oneRepMax: number,
  gender: "male" | "female" = "male"
): "beginner" | "novice" | "intermediate" | "advanced" | "elite" {
  const ratio = oneRepMax / bodyweight;

  // Simplified strength standards (male benchmarks)
  const standards: Record<string, number[]> = {
    "Bench Press": [0.5, 0.75, 1.0, 1.25, 1.5],
    "Squat": [0.75, 1.0, 1.5, 1.75, 2.0],
    "Deadlift": [1.0, 1.25, 1.75, 2.0, 2.5],
    "Overhead Press": [0.35, 0.5, 0.65, 0.8, 1.0],
  };

  const thresholds = standards[exercise] ?? [0.5, 0.75, 1.0, 1.25, 1.5];

  if (ratio < thresholds[0]) return "beginner";
  if (ratio < thresholds[1]) return "novice";
  if (ratio < thresholds[2]) return "intermediate";
  if (ratio < thresholds[3]) return "advanced";
  return "elite";
}

export function generateAvatarFallback(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
