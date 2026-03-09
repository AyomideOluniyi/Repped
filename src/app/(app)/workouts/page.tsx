import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkoutsClient } from "./workouts-client";

export const metadata: Metadata = { title: "Workouts" };

export default async function WorkoutsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const workouts = await prisma.workout.findMany({
    where: { userId: session.user.id },
    include: {
      sets: { include: { exercise: true } },
    },
    orderBy: { date: "desc" },
    take: 30,
  });

  return <WorkoutsClient workouts={workouts} />;
}
