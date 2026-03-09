import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const participant = await prisma.challengeParticipant.upsert({
      where: {
        challengeId_userId: { challengeId: id, userId: session.user.id },
      },
      update: {},
      create: {
        challengeId: id,
        userId: session.user.id,
        progress: {},
      },
    });

    return NextResponse.json(participant, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to join" }, { status: 500 });
  }
}
