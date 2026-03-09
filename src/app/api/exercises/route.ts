import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const muscleGroup = searchParams.get("muscleGroup");
  const equipment = searchParams.get("equipment");
  const difficulty = searchParams.get("difficulty");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const exercises = await prisma.exercise.findMany({
    where: {
      ...(query && {
        name: { contains: query, mode: "insensitive" },
      }),
      ...(muscleGroup && {
        muscleGroups: { has: muscleGroup as never },
      }),
      ...(equipment && {
        equipment: { has: equipment as never },
      }),
      ...(difficulty && {
        difficulty: difficulty as never,
      }),
    },
    orderBy: { name: "asc" },
    take: limit,
    skip: offset,
  });

  const total = await prisma.exercise.count({
    where: {
      ...(query && { name: { contains: query, mode: "insensitive" } }),
    },
  });

  return NextResponse.json({ exercises, total });
}
