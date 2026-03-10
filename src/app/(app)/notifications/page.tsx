"use client";

import { motion } from "framer-motion";
import { Bell, Heart, Trophy, Users, Dumbbell, TrendingUp } from "lucide-react";

const DEMO_NOTIFICATIONS = [
  {
    id: "1",
    icon: Heart,
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-500",
    title: "Chris Bumstead liked your workout",
    body: "Classic Physique Chest Day 💪",
    time: "2m ago",
    unread: true,
  },
  {
    id: "2",
    icon: Trophy,
    iconBg: "bg-accent-green/10",
    iconColor: "text-accent-green",
    title: "New personal record!",
    body: "You hit a new PR on Barbell Bench Press: 100kg",
    time: "1h ago",
    unread: true,
  },
  {
    id: "3",
    icon: Users,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    title: "Jeff Nippard started following you",
    body: "You have a new follower",
    time: "3h ago",
    unread: true,
  },
  {
    id: "4",
    icon: Dumbbell,
    iconBg: "bg-accent-orange/10",
    iconColor: "text-accent-orange",
    title: "Workout reminder",
    body: "You haven't logged a workout in 2 days — keep the streak alive!",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "5",
    icon: TrendingUp,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
    title: "Weekly progress summary",
    body: "You trained 4 days this week. Volume up 12% from last week 🔥",
    time: "2 days ago",
    unread: false,
  },
  {
    id: "6",
    icon: Heart,
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-500",
    title: "Simeon Panda liked your video",
    body: "Arms Superset Finisher 🔥",
    time: "3 days ago",
    unread: false,
  },
];

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Recent
        </p>
        <button className="text-xs font-semibold text-accent-green">
          Mark all read
        </button>
      </div>

      <div className="divide-y divide-border/60">
        {DEMO_NOTIFICATIONS.map((n, i) => {
          const Icon = n.icon;
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-3 px-4 py-4 transition-colors hover:bg-surface-elevated cursor-pointer ${
                n.unread ? "bg-accent-green/[0.03]" : ""
              }`}
            >
              <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${n.iconBg}`}>
                <Icon className={`h-5 w-5 ${n.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary leading-snug">
                  {n.title}
                </p>
                <p className="text-xs text-text-secondary mt-0.5 leading-snug line-clamp-2">
                  {n.body}
                </p>
                <p className="text-2xs text-text-muted mt-1">{n.time}</p>
              </div>
              {n.unread && (
                <div className="h-2 w-2 rounded-full bg-accent-green shrink-0 mt-2" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Empty state hint */}
      <div className="px-4 py-8 text-center">
        <Bell className="h-8 w-8 text-text-muted mx-auto mb-2" />
        <p className="text-sm text-text-muted">You&apos;re all caught up!</p>
      </div>
    </div>
  );
}
