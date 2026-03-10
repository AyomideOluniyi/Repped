"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Bell, Heart, Trophy, Users, Dumbbell, MessageCircle, Zap } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

type NotificationType =
  | "MESSAGE" | "CHALLENGE_UPDATE" | "WORKOUT_REMINDER" | "STREAK_WARNING"
  | "PR_CELEBRATION" | "FOLLOW" | "POST_LIKE" | "POST_COMMENT"
  | "BUDDY_REQUEST" | "COACH_FEEDBACK";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  imageUrl: string | null;
  readAt: string | null;
  createdAt: string;
}

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
  POST_LIKE:        { icon: Heart,          iconBg: "bg-rose-500/10",          iconColor: "text-rose-500" },
  PR_CELEBRATION:   { icon: Trophy,         iconBg: "bg-accent-green/10",       iconColor: "text-accent-green" },
  FOLLOW:           { icon: Users,          iconBg: "bg-blue-500/10",           iconColor: "text-blue-500" },
  WORKOUT_REMINDER: { icon: Dumbbell,       iconBg: "bg-accent-orange/10",      iconColor: "text-accent-orange" },
  STREAK_WARNING:   { icon: Zap,            iconBg: "bg-yellow-500/10",         iconColor: "text-yellow-500" },
  MESSAGE:          { icon: MessageCircle,  iconBg: "bg-purple-500/10",         iconColor: "text-purple-500" },
  POST_COMMENT:     { icon: MessageCircle,  iconBg: "bg-purple-500/10",         iconColor: "text-purple-500" },
  CHALLENGE_UPDATE: { icon: Trophy,         iconBg: "bg-accent-orange/10",      iconColor: "text-accent-orange" },
  BUDDY_REQUEST:    { icon: Users,          iconBg: "bg-blue-500/10",           iconColor: "text-blue-500" },
  COACH_FEEDBACK:   { icon: Zap,            iconBg: "bg-accent-green/10",       iconColor: "text-accent-green" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
  };

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
  };

  const unread = notifications.filter((n) => !n.readAt);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-4">
            <div className="h-10 w-10 rounded-2xl bg-surface-elevated shimmer shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded bg-surface-elevated shimmer" />
              <div className="h-3 w-32 rounded bg-surface-elevated shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="h-16 w-16 rounded-3xl bg-surface-elevated flex items-center justify-center mb-4">
          <Bell className="h-8 w-8 text-text-muted" />
        </div>
        <h2 className="text-lg font-bold text-text-primary mb-1">You&apos;re all caught up</h2>
        <p className="text-sm text-text-muted max-w-xs">
          When someone likes your video, follows you, or you hit a new PR — you&apos;ll see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {unread.length > 0 && (
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            {unread.length} unread
          </p>
          <button onClick={markAllRead} className="text-xs font-semibold text-accent-green">
            Mark all read
          </button>
        </div>
      )}

      <div className="divide-y divide-border/60">
        {notifications.map((n, i) => {
          const config = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.WORKOUT_REMINDER;
          const Icon = config.icon;
          const isUnread = !n.readAt;

          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => isUnread && markRead(n.id)}
              className={`flex items-start gap-3 px-4 py-4 transition-colors cursor-pointer ${
                isUnread ? "bg-accent-green/[0.03] hover:bg-accent-green/[0.06]" : "hover:bg-surface-elevated"
              }`}
            >
              <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${config.iconBg}`}>
                {n.imageUrl ? (
                  <img src={n.imageUrl} alt="" className="h-10 w-10 rounded-2xl object-cover" />
                ) : (
                  <Icon className={`h-5 w-5 ${config.iconColor}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary leading-snug">
                  {n.title}
                </p>
                <p className="text-xs text-text-secondary mt-0.5 leading-snug line-clamp-2">
                  {n.body}
                </p>
                <p className="text-2xs text-text-muted mt-1">{formatRelativeTime(new Date(n.createdAt))}</p>
              </div>
              {isUnread && (
                <div className="h-2 w-2 rounded-full bg-accent-green shrink-0 mt-2" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
