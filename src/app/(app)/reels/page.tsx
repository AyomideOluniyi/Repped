import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReelsClient } from "./reels-client";

export const dynamic = "force-dynamic";

export default async function ReelsPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const limit = 10;

  const videos = await prisma.video.findMany({
    where: { isPublic: true },
    include: {
      user: { select: { id: true, name: true, avatar: true, username: true } },
      _count: { select: { favorites: true } },
    },
    orderBy: [{ views: "desc" }, { createdAt: "desc" }],
    take: limit + 1,
  });

  const hasMore = videos.length > limit;
  const items = hasMore ? videos.slice(0, limit) : videos;

  const likedIds = await prisma.videoFavorite.findMany({
    where: { userId, videoId: { in: items.map((v) => v.id) } },
    select: { videoId: true },
  });
  const likedSet = new Set(likedIds.map((l) => l.videoId));

  const reels = items.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    url: v.url,
    thumbnailUrl: v.thumbnailUrl,
    muscleGroups: v.muscleGroups as string[],
    views: v.views,
    likes: v._count.favorites,
    isLiked: likedSet.has(v.id),
    createdAt: v.createdAt,
    user: v.user,
  }));

  return (
    <ReelsClient
      initialReels={reels}
      initialCursor={hasMore ? items[items.length - 1].id : null}
    />
  );
}
