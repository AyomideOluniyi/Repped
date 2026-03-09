import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkoutDetailClient } from "./workout-detail-client";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const workout = await prisma.workout.findUnique({ where: { id }, select: { name: true } });
  return { title: workout?.name ?? "Workout" };
}

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return null;

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

  if (!workout) notFound();

  return <WorkoutDetailClient workout={workout} />;
}
