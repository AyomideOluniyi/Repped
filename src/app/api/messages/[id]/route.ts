import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  // Verify user is in this conversation
  const membership = await prisma.userConversation.findFirst({
    where: { conversationId: id, userId: session.user.id },
  });
  if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { conversationId: id, isDeleted: false },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const membership = await prisma.userConversation.findFirst({
    where: { conversationId: id, userId: session.user.id },
  });
  if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const [message, otherParticipants, sender] = await Promise.all([
    prisma.message.create({
      data: { conversationId: id, senderId: session.user.id, content: content.trim() },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    }),
    prisma.userConversation.findMany({
      where: { conversationId: id, userId: { not: session.user.id } },
      select: { userId: true },
    }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } }),
    prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } }),
  ]);

  // Notify all other participants (fire-and-forget)
  const senderName = sender?.name ?? "Someone";
  prisma.notification.createMany({
    data: otherParticipants.map((p) => ({
      userId: p.userId,
      type: "MESSAGE" as const,
      title: `${senderName} sent you a message`,
      body: content.trim().length > 80 ? content.trim().slice(0, 77) + "…" : content.trim(),
      data: { actorId: session.user.id, conversationId: id },
    })),
  }).catch(() => {});

  return NextResponse.json(message, { status: 201 });
}
