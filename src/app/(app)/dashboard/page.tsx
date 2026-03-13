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

  // Fetch workout dates for last 60 days in a single query for streak calculation
  const sixtyDaysAgo = new Date(startOfToday);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const [recentWorkouts, todayMeals, weekWorkouts, totalRecords, streakWorkouts] = await Promise.all([
    prisma.workout.findMany({
      where: { userId },
      select: {
        id: true, name: true, date: true, duration: true,
        sets: {
          select: { exercise: { select: { name: true } }, reps: true, weight: true },
          take: 5,
        },
      },
      orderBy: { date: "desc" },
      take: 3,
    }),
    prisma.mealLog.findMany({
      where: { userId, date: { gte: startOfToday } },
      select: { calories: true, protein: true },
    }),
    prisma.workout.count({
      where: { userId, date: { gte: startOfWeek } },
    }),
    prisma.personalRecord.count({ where: { userId } }),
    prisma.workout.findMany({
      where: { userId, date: { gte: sixtyDaysAgo } },
      select: { date: true },
      orderBy: { date: "desc" },
    }),
  ]);

  const todayCalories = todayMeals.reduce((sum, m) => sum + (m.calories ?? 0), 0);
  const todayProtein = todayMeals.reduce((sum, m) => sum + (m.protein ?? 0), 0);

  // Calculate streak from the single batch of dates — no extra queries
  const workedOutDays = new Set(
    streakWorkouts.map((w) => {
      const d = new Date(w.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );
  let streak = 0;
  const checkDate = new Date(startOfToday);
  for (let i = 0; i < 60; i++) {
    const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
    if (!workedOutDays.has(key)) break;
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
