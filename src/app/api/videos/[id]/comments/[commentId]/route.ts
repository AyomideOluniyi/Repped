import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { commentId } = await params;

  const comment = await prisma.videoComment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.videoComment.delete({ where: { id: commentId } });
  return new NextResponse(null, { status: 204 });
}
