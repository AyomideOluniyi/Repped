import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPhotoSchema = z.object({
  url: z.string().url(),
  type: z.enum(["FRONT", "SIDE", "BACK"]),
  takenAt: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const photos = await prisma.progressPhoto.findMany({
    where: { userId: session.user.id },
    orderBy: { takenAt: "desc" },
  });

  return NextResponse.json(photos);
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
        url: data.url,
        type: data.type as never,
        takenAt: data.takenAt ? new Date(data.takenAt) : new Date(),
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
