import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NutritionClient } from "./nutrition-client";

export const metadata: Metadata = { title: "Nutrition" };

export default async function NutritionPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayMeals, recentMeals] = await Promise.all([
    prisma.mealLog.findMany({
      where: { userId: session.user.id, date: { gte: today } },
      orderBy: { date: "desc" },
    }),
    prisma.mealLog.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 10,
    }),
  ]);

  return <NutritionClient todayMeals={todayMeals} recentMeals={recentMeals} />;
}
