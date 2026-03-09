import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProgressClient } from "./progress-client";

export const metadata: Metadata = { title: "Progress" };

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [records, recentWorkouts, measurements] = await Promise.all([
    prisma.personalRecord.findMany({
      where: { userId: session.user.id },
      include: { exercise: { select: { name: true } } },
      orderBy: { date: "desc" },
      take: 20,
    }),
    prisma.workout.findMany({
      where: { userId: session.user.id },
      include: { sets: true },
      orderBy: { date: "desc" },
      take: 30,
    }),
    prisma.bodyMeasurement.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 12,
    }),
  ]);

  return <ProgressClient records={records} workouts={recentWorkouts} measurements={measurements} />;
}
