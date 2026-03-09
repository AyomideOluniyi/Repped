import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const exerciseId = searchParams.get("exerciseId");

  const records = await prisma.personalRecord.findMany({
    where: {
      userId: session.user.id,
      ...(exerciseId && { exerciseId }),
    },
    include: { exercise: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(records);
}
