import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { ExerciseDetailClient } from "./exercise-detail-client";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const ex = await prisma.exercise.findUnique({ where: { id }, select: { name: true } });
  return { title: ex?.name ?? "Exercise" };
}

export default async function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const exercise = await prisma.exercise.findUnique({ where: { id } });
  if (!exercise) notFound();

  const userRecord = session?.user?.id
    ? await prisma.personalRecord.findFirst({
        where: { userId: session.user.id, exerciseId: id },
        orderBy: { weight: "desc" },
      })
    : null;

  return <ExerciseDetailClient exercise={exercise} userRecord={userRecord} />;
}
