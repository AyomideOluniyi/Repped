import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user, workouts, records, mealLogs, bodyMeasurements] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, username: true, goals: true, createdAt: true },
    }),
    prisma.workout.findMany({
      where: { userId: session.user.id },
      include: { sets: { include: { exercise: { select: { name: true } } } } },
      orderBy: { startedAt: "desc" },
    }),
    prisma.personalRecord.findMany({
      where: { userId: session.user.id },
      include: { exercise: { select: { name: true } } },
    }),
    prisma.mealLog.findMany({
      where: { userId: session.user.id },
      orderBy: { loggedAt: "desc" },
    }),
    prisma.bodyMeasurement.findMany({
      where: { userId: session.user.id },
      orderBy: { measuredAt: "desc" },
    }),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    user,
    workouts: workouts.map((w) => ({
      date: w.startedAt,
      duration: w.duration,
      notes: w.notes,
      exercises: w.sets.map((s) => ({
        exercise: s.exercise.name,
        setNumber: s.setNumber,
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe,
      })),
    })),
    personalRecords: records.map((r) => ({
      exercise: r.exercise.name,
      weight: r.weight,
      reps: r.reps,
      achievedAt: r.achievedAt,
    })),
    nutrition: mealLogs,
    bodyMeasurements,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="repped-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
