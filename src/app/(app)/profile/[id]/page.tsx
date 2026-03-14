import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "../profile-client";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return notFound();

  // Redirect own profile to /profile
  if (id === session.user.id) {
    const { redirect } = await import("next/navigation");
    redirect("/profile");
  }

  const [user, recentPRs, followRecord] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, avatar: true, bio: true, username: true,
        goals: true, weight: true, height: true, age: true, gymLocation: true,
        createdAt: true, role: true,
        _count: {
          select: {
            workouts: true,
            personalRecords: true,
            videos: true,
            followers: true,
            following: true,
          },
        },
      },
    }),
    prisma.personalRecord.findMany({
      where: { userId: id },
      include: { exercise: { select: { name: true } } },
      orderBy: { date: "desc" },
      take: 5,
    }),
    prisma.follow.findFirst({
      where: { followerId: session.user.id, followingId: id },
    }),
  ]);

  if (!user) return notFound();

  return (
    <ProfileClient
      user={user}
      recentPRs={recentPRs}
      isOwn={false}
      isFollowing={!!followRecord}
    />
  );
}
