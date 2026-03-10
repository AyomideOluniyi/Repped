import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { VideoPlayerClient } from "./video-player-client";

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const { id } = await params;

  const video = await prisma.video.findFirst({
    where: { id, OR: [{ userId: session.user.id }, { isPublic: true }] },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });

  if (!video) notFound();

  // Increment view count
  await prisma.video.update({ where: { id }, data: { views: { increment: 1 } } });

  return <VideoPlayerClient video={video} currentUserId={session.user.id!} />;
}
