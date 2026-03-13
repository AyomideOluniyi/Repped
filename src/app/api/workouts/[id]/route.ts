import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const appendSetsSchema = z.object({
  sets: z.array(z.object({
    exerciseId: z.string(),
    exerciseName: z.string().optional(),
    setNumber: z.number(),
    reps: z.number().optional(),
    weight: z.number().optional(),
    rpe: z.number().optional(),
    restTime: z.number().optional(),
  })),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const workout = await prisma.workout.findFirst({
    where: { id, userId: session.user.id },
    include: {
      sets: {
        include: { exercise: true },
        orderBy: [{ setNumber: "asc" }],
      },
    },
  });

  if (!workout) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  return NextResponse.json(workout);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const workout = await prisma.workout.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!workout) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  await prisma.workout.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const workout = await prisma.workout.findFirst({
    where: { id, userId: session.user.id },
    include: { sets: { orderBy: { setNumber: "asc" } } },
  });

  if (!workout) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { sets } = appendSetsSchema.parse(body);

    // Resolve custom exercise IDs
    const idMap = new Map<string, string>();
    for (const set of sets) {
      if (set.exerciseId.startsWith("custom-") && !idMap.has(set.exerciseId)) {
        const name = set.exerciseName ?? set.exerciseId;
        const ex = await prisma.exercise.upsert({
          where: { name },
          update: {},
          create: { name, muscleGroups: [], equipment: [] },
        });
        idMap.set(set.exerciseId, ex.id);
      }
    }
    const resolvedSets = sets.map((s) => ({
      ...s,
      exerciseId: idMap.get(s.exerciseId) ?? s.exerciseId,
    }));

    // Offset set numbers so they don't clash with existing ones
    const maxSetNumber = workout.sets.reduce((m, s) => Math.max(m, s.setNumber), 0);
    await prisma.workoutSet.createMany({
      data: resolvedSets.map((s, i) => ({
        workoutId: id,
        exerciseId: s.exerciseId,
        setNumber: maxSetNumber + i + 1,
        reps: s.reps,
        weight: s.weight,
        rpe: s.rpe,
        restTime: s.restTime,
        isWarmup: false,
      })),
    });

    const updated = await prisma.workout.findFirst({
      where: { id },
      include: { sets: { include: { exercise: true }, orderBy: { setNumber: "asc" } } },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
}
