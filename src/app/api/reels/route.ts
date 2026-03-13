import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = 10;

  const videos = await prisma.video.findMany({
    where: { isPublic: true },
    include: {
      user: { select: { id: true, name: true, avatar: true, username: true } },
      _count: { select: { favorites: true, comments: true } },
    },
    orderBy: [{ views: "desc" }, { createdAt: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = videos.length > limit;
  const items = hasMore ? videos.slice(0, limit) : videos;

  // Check which videos the current user has liked
  const likedIds = await prisma.videoFavorite.findMany({
    where: { userId: session.user.id, videoId: { in: items.map((v) => v.id) } },
    select: { videoId: true },
  });
  const likedSet = new Set(likedIds.map((l) => l.videoId));

  const result = items.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    url: v.url,
    thumbnailUrl: v.thumbnailUrl,
    duration: v.duration,
    muscleGroups: v.muscleGroups,
    views: v.views,
    likes: v._count.favorites,
    comments: v._count.comments,
    isLiked: likedSet.has(v.id),
    createdAt: v.createdAt,
    user: v.user,
  }));

  return NextResponse.json({
    videos: result,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  });
}
