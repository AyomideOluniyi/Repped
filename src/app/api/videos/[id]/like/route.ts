import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    await prisma.videoFavorite.create({ data: { userId: session.user.id, videoId: id } });
  } catch {
    // Already liked — ignore unique constraint error
  }

  const count = await prisma.videoFavorite.count({ where: { videoId: id } });
  return NextResponse.json({ likes: count, isLiked: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await prisma.videoFavorite.deleteMany({ where: { userId: session.user.id, videoId: id } });
  const count = await prisma.videoFavorite.count({ where: { videoId: id } });
  return NextResponse.json({ likes: count, isLiked: false });
}
