import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST — follow a user
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: targetId } = await params;

  if (targetId === session.user.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  try {
    await prisma.follow.create({
      data: { followerId: session.user.id, followingId: targetId },
    });

    // Notify the followed user
    await prisma.notification.create({
      data: {
        userId: targetId,
        type: "FOLLOW",
        title: `${session.user.name ?? "Someone"} started following you`,
        body: "Tap to view their profile",
        imageUrl: session.user.image ?? null,
        data: { actorId: session.user.id },
      },
    }).catch(() => {});
  } catch {
    // Already following — ignore
  }

  const followerCount = await prisma.follow.count({ where: { followingId: targetId } });
  return NextResponse.json({ following: true, followerCount });
}

// DELETE — unfollow a user
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: targetId } = await params;

  await prisma.follow.deleteMany({
    where: { followerId: session.user.id, followingId: targetId },
  });

  const followerCount = await prisma.follow.count({ where: { followingId: targetId } });
  return NextResponse.json({ following: false, followerCount });
}

// GET — check if current user follows this user
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ following: false });
  const { id: targetId } = await params;

  const follow = await prisma.follow.findFirst({
    where: { followerId: session.user.id, followingId: targetId },
  });

  const followerCount = await prisma.follow.count({ where: { followingId: targetId } });
  return NextResponse.json({ following: !!follow, followerCount });
}
