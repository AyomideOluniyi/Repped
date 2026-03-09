import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConversationClient } from "./conversation-client";

export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return notFound();

  const membership = await prisma.userConversation.findFirst({
    where: { conversationId: id, userId: session.user.id },
    include: {
      conversation: {
        include: {
          participants: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
          },
        },
      },
    },
  });

  if (!membership) return notFound();

  const otherParticipant = membership.conversation.participants.find(
    (p) => p.user.id !== session.user.id
  );
  if (!otherParticipant) return notFound();

  const messages = await prisma.message.findMany({
    where: { conversationId: id, isDeleted: false },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return (
    <ConversationClient
      conversationId={id}
      currentUserId={session.user.id}
      otherUser={otherParticipant.user}
      initialMessages={messages}
    />
  );
}
