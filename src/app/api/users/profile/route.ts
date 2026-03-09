import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers and underscores only").optional(),
  bio: z.string().max(300).optional(),
  gymLocation: z.string().max(100).optional(),
  goals: z.array(z.string()).optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  age: z.number().min(13).max(100).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, username: true, bio: true, avatar: true, gymLocation: true, goals: true, weight: true, height: true, age: true, email: true },
  });

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    if (data.username) {
      const existing = await prisma.user.findFirst({
        where: { username: data.username, id: { not: session.user.id } },
      });
      if (existing) return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.username !== undefined && { username: data.username }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.gymLocation !== undefined && { gymLocation: data.gymLocation }),
        ...(data.goals !== undefined && { goals: data.goals as never }),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.height !== undefined && { height: data.height }),
        ...(data.age !== undefined && { age: data.age }),
      },
      select: { id: true, name: true, username: true, bio: true, avatar: true, gymLocation: true, goals: true },
    });

    return NextResponse.json(user);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
