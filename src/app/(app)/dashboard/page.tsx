import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = { title: "Dashboard" };

async function getDashboardData(userId: string) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

  const [recentWorkouts, todayMeals, weekWorkouts, totalRecords] = await Promise.all([
    prisma.workout.findMany({
      where: { userId },
      include: {
        sets: { include: { exercise: true }, take: 5 },
      },
      orderBy: { date: "desc" },
      take: 3,
    }),
    prisma.mealLog.findMany({
      where: { userId, date: { gte: startOfToday } },
      orderBy: { date: "desc" },
    }),
    prisma.workout.count({
      where: { userId, date: { gte: startOfWeek } },
    }),
    prisma.personalRecord.count({ where: { userId } }),
  ]);

  const todayCalories = todayMeals.reduce((sum, m) => sum + (m.calories ?? 0), 0);
  const todayProtein = todayMeals.reduce((sum, m) => sum + (m.protein ?? 0), 0);

  // Calculate streak
  let streak = 0;
  const checkDate = new Date(startOfToday);
  while (true) {
    const dayStart = new Date(checkDate);
    const dayEnd = new Date(checkDate);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const hasWorkout = await prisma.workout.findFirst({
      where: { userId, date: { gte: dayStart, lt: dayEnd } },
    });
    if (!hasWorkout) break;
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return { recentWorkouts, todayCalories, todayProtein, weekWorkouts, totalRecords, streak };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const data = await getDashboardData(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, avatar: true, goals: true },
  });

  return <DashboardClient data={data} user={user} />;
}
