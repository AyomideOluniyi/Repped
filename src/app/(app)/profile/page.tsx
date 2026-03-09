import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "./profile-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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
  });

  if (!user) return null;

  const recentPRs = await prisma.personalRecord.findMany({
    where: { userId: session.user.id },
    include: { exercise: { select: { name: true } } },
    orderBy: { date: "desc" },
    take: 5,
  });

  return <ProfileClient user={user} recentPRs={recentPRs} isOwn={true} />;
}
