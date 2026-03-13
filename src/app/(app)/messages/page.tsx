import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessagesClient } from "./messages-client";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const conversations = await prisma.userConversation.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      conversation: {
        select: {
          id: true, type: true, name: true, updatedAt: true,
          participants: {
            select: { user: { select: { id: true, name: true, avatar: true } } },
          },
          messages: {
            select: { content: true, createdAt: true, senderId: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  });

  return <MessagesClient conversations={conversations} currentUserId={session.user.id} />;
}
