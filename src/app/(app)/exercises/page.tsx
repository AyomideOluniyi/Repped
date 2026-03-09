import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ExercisesClient } from "./exercises-client";

export const metadata: Metadata = { title: "Exercise Encyclopedia" };

export default async function ExercisesPage() {
  const exercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
    take: 100,
  });

  return <ExercisesClient exercises={exercises} />;
}
