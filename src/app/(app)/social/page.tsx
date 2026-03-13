import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SocialClient } from "./social-client";

export const metadata: Metadata = { title: "Community" };

export default async function SocialPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [posts, myLikes] = await Promise.all([
    prisma.post.findMany({
      where: { isPublic: true },
      select: {
        id: true, content: true, mediaUrls: true, createdAt: true,
        user: { select: { id: true, name: true, avatar: true, username: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    // Only fetch which of these posts the current user liked — not all likes
    prisma.postLike.findMany({
      where: { userId: session.user.id },
      select: { postId: true },
    }),
  ]);

  const likedSet = new Set(myLikes.map((l) => l.postId));
  const postsWithLikes = posts.map((p) => ({
    ...p,
    likes: likedSet.has(p.id) ? [{ userId: session.user.id }] : [],
  }));

  return <SocialClient posts={postsWithLikes} currentUserId={session.user.id} />;
}
