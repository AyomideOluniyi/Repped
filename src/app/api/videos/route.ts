import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createVideoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.number().optional(),
  muscleGroups: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const muscleGroup = searchParams.get("muscleGroup");
  const isPublic = searchParams.get("public") === "true";
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const videos = await prisma.video.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        ...(isPublic ? [{ isPublic: true }] : []),
      ],
      ...(muscleGroup && { muscleGroups: { has: muscleGroup as never } }),
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  return NextResponse.json(videos);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createVideoSchema.parse(body);

    const video = await prisma.video.create({
      data: {
        userId: session.user.id,
        title: data.title,
        description: data.description,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
        duration: data.duration,
        muscleGroups: (data.muscleGroups ?? []) as never,
        equipment: (data.equipment ?? []) as never,
        difficulty: data.difficulty,
        isPublic: data.isPublic ?? false,
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
