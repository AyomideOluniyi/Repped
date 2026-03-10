import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function computeProgress(
  userId: string,
  type: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const start = startDate;
  const end = endDate > new Date() ? new Date() : endDate;

  if (type === "CONSISTENCY" || type === "STREAK") {
    const workouts = await prisma.workout.findMany({
      where: { userId, date: { gte: start, lte: end } },
      select: { date: true },
      orderBy: { date: "asc" },
    });
    if (workouts.length === 0) return 0;

    const days = new Set(workouts.map((w) => w.date.toISOString().slice(0, 10)));

    if (type === "CONSISTENCY") return days.size;

    // STREAK: max consecutive days
    const sorted = Array.from(days).sort();
    let maxStreak = 1, cur = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const next = new Date(sorted[i]);
      const diff = (next.getTime() - prev.getTime()) / 86400000;
      if (diff === 1) { cur++; maxStreak = Math.max(maxStreak, cur); }
      else cur = 1;
    }
    return maxStreak;
  }

  if (type === "TOTAL_VOLUME") {
    const sets = await prisma.workoutSet.findMany({
      where: { workout: { userId, date: { gte: start, lte: end } } },
      select: { weight: true, reps: true },
    });
    return Math.round(sets.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0));
  }

  if (type === "PR_BASED") {
    return await prisma.personalRecord.count({
      where: { userId, date: { gte: start, lte: end } },
    });
  }

  return 0;
}

function formatProgress(value: number, type: string): string {
  if (type === "TOTAL_VOLUME") return `${value.toLocaleString()} kg`;
  if (type === "STREAK") return `${value} day${value !== 1 ? "s" : ""}`;
  if (type === "CONSISTENCY") return `${value} workout${value !== 1 ? "s" : ""}`;
  if (type === "PR_BASED") return `${value} PR${value !== 1 ? "s" : ""}`;
  return String(value);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, avatar: true } },
      participants: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        take: 50,
      },
    },
  });

  if (!challenge) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Compute progress for all participants in parallel
  const leaderboard = await Promise.all(
    challenge.participants.map(async (p) => {
      const value = await computeProgress(
        p.userId,
        challenge.type,
        challenge.startDate,
        challenge.endDate
      );
      return {
        userId: p.userId,
        name: p.user.name,
        avatar: p.user.avatar,
        joinedAt: p.joinedAt,
        value,
        formatted: formatProgress(value, challenge.type),
      };
    })
  );

  leaderboard.sort((a, b) => b.value - a.value);
  const ranked = leaderboard.map((entry, i) => ({ ...entry, rank: i + 1 }));

  return NextResponse.json({ challenge, leaderboard: ranked });
}
