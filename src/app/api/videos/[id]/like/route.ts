import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let alreadyLiked = false;
  try {
    await prisma.videoFavorite.create({ data: { userId: session.user.id, videoId: id } });
  } catch {
    alreadyLiked = true;
  }

  if (!alreadyLiked) {
    // Notify the video owner (but not if they liked their own video)
    const video = await prisma.video.findUnique({
      where: { id },
      select: { userId: true, title: true },
    });
    if (video && video.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: video.userId,
          type: "POST_LIKE",
          title: `${session.user.name ?? "Someone"} liked your video`,
          body: video.title,
          imageUrl: session.user.image ?? null,
          data: { videoId: id, actorId: session.user.id },
        },
      }).catch(() => {}); // Fire-and-forget; don't block the like
    }
  }

  const count = await prisma.videoFavorite.count({ where: { videoId: id } });
  return NextResponse.json({ likes: count, isLiked: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await prisma.videoFavorite.deleteMany({ where: { userId: session.user.id, videoId: id } });
  const count = await prisma.videoFavorite.count({ where: { videoId: id } });
  return NextResponse.json({ likes: count, isLiked: false });
}
