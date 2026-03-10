import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, type, startDate, endDate } = await req.json();
  if (!title?.trim() || !type || !startDate || !endDate)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const challenge = await prisma.challenge.create({
    data: {
      creatorId: session.user.id,
      title: title.trim(),
      description: description?.trim() ?? "",
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      rules: {},
      isPublic: true,
    },
    include: {
      creator: { select: { id: true, name: true, avatar: true } },
      _count: { select: { participants: true } },
    },
  });

  // Auto-join the creator
  await prisma.challengeParticipant.create({
    data: { challengeId: challenge.id, userId: session.user.id, progress: {} },
  });

  return NextResponse.json(challenge, { status: 201 });
}
