import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { goals: true },
  });

  const buddies = await prisma.user.findMany({
    where: { id: { not: session.user.id } },
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true,
      goals: true,
      gymLocation: true,
      activityLevel: true,
      _count: { select: { workouts: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const myGoals = currentUser?.goals ?? [];

  // Sort by matching goals first
  const sorted = buddies.sort((a, b) => {
    const aMatches = a.goals.filter((g) => myGoals.includes(g)).length;
    const bMatches = b.goals.filter((g) => myGoals.includes(g)).length;
    return bMatches - aMatches;
  });

  return NextResponse.json(sorted);
}
