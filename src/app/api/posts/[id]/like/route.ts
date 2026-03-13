import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.postLike.findUnique({
    where: { userId_postId: { userId: session.user.id, postId: id } },
  });

  if (existing) {
    await prisma.postLike.delete({
      where: { userId_postId: { userId: session.user.id, postId: id } },
    });
    return NextResponse.json({ liked: false });
  } else {
    await prisma.postLike.create({ data: { userId: session.user.id, postId: id } });
    // Notify post owner (skip self-likes)
    const post = await prisma.post.findUnique({ where: { id }, select: { userId: true, content: true } });
    if (post && post.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: "POST_LIKE",
          title: `${session.user.name ?? "Someone"} liked your post`,
          body: post.content.slice(0, 80),
          imageUrl: session.user.image ?? null,
          data: { postId: id, actorId: session.user.id },
        },
      }).catch(() => {});
    }
    return NextResponse.json({ liked: true });
  }
}
