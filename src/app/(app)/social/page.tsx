import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SocialClient } from "./social-client";

export const metadata: Metadata = { title: "Community" };

export default async function SocialPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const posts = await prisma.post.findMany({
    where: { isPublic: true },
    include: {
      user: { select: { id: true, name: true, avatar: true, username: true } },
      likes: { select: { userId: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return <SocialClient posts={posts} currentUserId={session.user.id} />;
}
