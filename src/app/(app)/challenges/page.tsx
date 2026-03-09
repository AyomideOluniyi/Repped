import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChallengesClient } from "./challenges-client";

export const metadata: Metadata = { title: "Challenges" };

export default async function ChallengesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const challenges = await prisma.challenge.findMany({
    where: { isPublic: true },
    include: {
      creator: { select: { id: true, name: true, avatar: true } },
      _count: { select: { participants: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const myParticipations = await prisma.challengeParticipant.findMany({
    where: { userId: session.user.id },
    select: { challengeId: true },
  });

  const joinedIds = new Set(myParticipations.map((p) => p.challengeId));

  return <ChallengesClient challenges={challenges} joinedChallengeIds={joinedIds} userId={session.user.id} />;
}
