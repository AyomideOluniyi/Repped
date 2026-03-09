import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VideosClient } from "./videos-client";

export const metadata: Metadata = { title: "Video Library" };

export default async function VideosPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const videos = await prisma.video.findMany({
    where: { OR: [{ userId: session.user.id }, { isPublic: true }] },
    include: { user: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return <VideosClient videos={videos} currentUserId={session.user.id} />;
}
