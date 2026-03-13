import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPhotoSchema = z.object({
  url: z.string().url(),
  type: z.enum(["FRONT", "SIDE", "BACK"]),
  date: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const photos = await prisma.progressPhoto.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(photos.map((p) => ({ id: p.id, url: p.photoUrl, type: p.type, takenAt: p.date })));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = createPhotoSchema.parse(body);

    const photo = await prisma.progressPhoto.create({
      data: {
        userId: session.user.id,
        photoUrl: data.url,
        type: data.type as never,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });

    return NextResponse.json({ id: photo.id, url: photo.photoUrl, type: photo.type, takenAt: photo.date }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
