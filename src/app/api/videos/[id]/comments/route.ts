import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const comments = await prisma.videoComment.findMany({
    where: { videoId: id, parentId: null },
    include: {
      user: { select: { id: true, name: true, avatar: true, username: true } },
      replies: {
        include: {
          user: { select: { id: true, name: true, avatar: true, username: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { content, parentId } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const comment = await prisma.videoComment.create({
    data: { videoId: id, userId: session.user.id, content: content.trim(), parentId: parentId ?? null },
    include: {
      user: { select: { id: true, name: true, avatar: true, username: true } },
      replies: { include: { user: { select: { id: true, name: true, avatar: true, username: true } } } },
    },
  });

  // Notify video owner (skip self-comments)
  const video = await prisma.video.findUnique({ where: { id }, select: { userId: true, title: true } });
  if (video && video.userId !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId: video.userId,
        type: "POST_COMMENT",
        title: `${session.user.name ?? "Someone"} commented on your video`,
        body: content.trim().slice(0, 80),
        imageUrl: session.user.image ?? null,
        data: { videoId: id, actorId: session.user.id },
      },
    }).catch(() => {});
  }

  return NextResponse.json(comment, { status: 201 });
}
