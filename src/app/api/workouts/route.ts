import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(200),
  date: z.string().optional(),
  notes: z.string().optional(),
  duration: z.number().optional(),
  templateId: z.string().optional(),
  sets: z.array(z.object({
    exerciseId: z.string(),
    exerciseName: z.string().optional(), // provided when exerciseId starts with "custom-"
    setNumber: z.number(),
    reps: z.number().optional(),
    weight: z.number().optional(),
    rpe: z.number().optional(),
    restTime: z.number().optional(),
    notes: z.string().optional(),
    isWarmup: z.boolean().optional(),
  })).optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const workouts = await prisma.workout.findMany({
    where: {
      userId: session.user.id,
      date: {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      },
    },
    include: {
      sets: {
        include: { exercise: true },
        orderBy: [{ setNumber: "asc" }],
      },
    },
    orderBy: { date: "desc" },
    take: limit,
    skip: offset,
  });

  const total = await prisma.workout.count({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ workouts, total });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createWorkoutSchema.parse(body);

    // Resolve custom exercise IDs → real DB IDs
    if (data.sets) {
      const idMap = new Map<string, string>();
      for (const set of data.sets) {
        if (set.exerciseId.startsWith("custom-") && !idMap.has(set.exerciseId)) {
          const name = set.exerciseName ?? set.exerciseId;
          // upsert so duplicate names don't create duplicate rows
          const ex = await prisma.exercise.upsert({
            where: { name },
            update: {},
            create: { name, muscleGroups: [], equipment: [] },
          });
          idMap.set(set.exerciseId, ex.id);
        }
      }
      if (idMap.size > 0) {
        for (const set of data.sets) {
          if (idMap.has(set.exerciseId)) set.exerciseId = idMap.get(set.exerciseId)!;
        }
      }
    }

    const workout = await prisma.workout.create({
      data: {
        userId: session.user.id,
        name: data.name,
        date: data.date ? new Date(data.date) : new Date(),
        notes: data.notes,
        duration: data.duration,
        templateId: data.templateId,
        sets: data.sets
          ? {
              create: data.sets.map((set) => ({
                exerciseId: set.exerciseId,
                setNumber: set.setNumber,
                reps: set.reps,
                weight: set.weight,
                rpe: set.rpe,
                restTime: set.restTime,
                notes: set.notes,
                isWarmup: set.isWarmup ?? false,
              })),
            }
          : undefined,
      },
      include: {
        sets: { include: { exercise: true } },
      },
    });

    // Milestone: first workout ever
    const workoutCount = await prisma.workout.count({ where: { userId: session.user.id } });
    if (workoutCount === 1) {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: "PR_CELEBRATION",
          title: "First workout logged! 🎉",
          body: "Welcome to REPPED. The journey of a thousand gains begins with a single rep.",
          data: { workoutId: workout.id },
        },
      }).catch(() => {});
    }

    // Check for genuine PRs — silent baseline on first log, only notify on real improvements
    if (data.sets) {
      for (const set of data.sets) {
        if (set.weight && set.reps) {
          const existingPR = await prisma.personalRecord.findFirst({
            where: { userId: session.user.id, exerciseId: set.exerciseId },
            orderBy: { weight: "desc" },
          });
          if (!existingPR) {
            // First time logging this exercise — store silently as baseline
            await prisma.personalRecord.create({
              data: { userId: session.user.id, exerciseId: set.exerciseId, weight: set.weight, reps: set.reps, workoutId: workout.id },
            }).catch(() => {});
          } else if (set.weight > existingPR.weight) {
            // Genuine weight PR
            const ex = await prisma.exercise.findUnique({ where: { id: set.exerciseId }, select: { name: true } });
            await prisma.personalRecord.create({
              data: { userId: session.user.id, exerciseId: set.exerciseId, weight: set.weight, reps: set.reps, workoutId: workout.id },
            }).catch(() => {});
            await prisma.notification.create({
              data: {
                userId: session.user.id, type: "PR_CELEBRATION", title: `New PR! 🏆`,
                body: `${ex?.name ?? "Exercise"}: ${set.weight}kg × ${set.reps} reps (was ${existingPR.weight}kg)`,
                data: { exerciseId: set.exerciseId, weight: set.weight, reps: set.reps },
              },
            }).catch(() => {});
          } else if (set.weight === existingPR.weight && set.reps > existingPR.reps) {
            // Same weight, more reps
            const ex = await prisma.exercise.findUnique({ where: { id: set.exerciseId }, select: { name: true } });
            await prisma.personalRecord.create({
              data: { userId: session.user.id, exerciseId: set.exerciseId, weight: set.weight, reps: set.reps, workoutId: workout.id },
            }).catch(() => {});
            await prisma.notification.create({
              data: {
                userId: session.user.id, type: "PR_CELEBRATION", title: `Rep record! 💪`,
                body: `${ex?.name ?? "Exercise"}: ${set.reps} reps at ${set.weight}kg (was ${existingPR.reps})`,
                data: { exerciseId: set.exerciseId, weight: set.weight, reps: set.reps },
              },
            }).catch(() => {});
          }
        }
      }
    }

    // Streak check
    if (workoutCount > 1) {
      const today = new Date(); today.setHours(0,0,0,0);
      const recent = await prisma.workout.findMany({
        where: { userId: session.user.id, id: { not: workout.id }, date: { gte: new Date(today.getTime() - 31 * 86400000) } },
        select: { date: true },
      });
      const daySet = new Set(recent.map((w) => { const d = new Date(w.date); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); }));
      let streak = 1;
      const check = new Date(today); check.setDate(check.getDate() - 1);
      while (daySet.has(check.toISOString().slice(0,10)) && streak <= 30) { streak++; check.setDate(check.getDate() - 1); }
      const streakMessages: Record<number, string> = {
        3: "3 days in a row! You're building a habit 🔥",
        7: "7-day streak! One full week of training 💪",
        14: "14 days straight! Two weeks of consistency 🏆",
        30: "30 days! You're an absolute machine 👑",
      };
      if (streakMessages[streak]) {
        await prisma.notification.create({
          data: { userId: session.user.id, type: "STREAK_WARNING", title: `${streak}-day streak!`, body: streakMessages[streak], data: { streak, workoutId: workout.id } },
        }).catch(() => {});
      }
    }

    return NextResponse.json(workout, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Create workout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
