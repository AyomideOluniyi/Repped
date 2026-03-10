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

    // Check for PRs
    if (data.sets) {
      for (const set of data.sets) {
        if (set.weight && set.reps) {
          const existingPR = await prisma.personalRecord.findFirst({
            where: {
              userId: session.user.id,
              exerciseId: set.exerciseId,
            },
            orderBy: { weight: "desc" },
          });

          if (!existingPR || set.weight > existingPR.weight) {
            const [newPR] = await Promise.all([
              prisma.personalRecord.create({
                data: {
                  userId: session.user.id,
                  exerciseId: set.exerciseId,
                  weight: set.weight,
                  reps: set.reps,
                  workoutId: workout.id,
                },
                include: { exercise: true },
              }),
            ]);
            // Fire PR notification
            await prisma.notification.create({
              data: {
                userId: session.user.id,
                type: "PR_CELEBRATION",
                title: `New personal record! 🏆`,
                body: `${newPR.exercise.name}: ${set.weight}kg × ${set.reps} reps`,
                data: { exerciseId: set.exerciseId, weight: set.weight, reps: set.reps },
              },
            }).catch(() => {});
          }
        }
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
