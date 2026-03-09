"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Dumbbell, Video, BookOpen, TrendingUp, Utensils,
  MessageCircle, Users, Trophy, User, Settings, Zap,
  Camera, Calculator, MapPin, ChevronRight, Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

const navGroups = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: Home },
      { label: "Workouts", href: "/workouts", icon: Dumbbell },
      { label: "Videos", href: "/videos", icon: Video },
      { label: "Exercises", href: "/exercises", icon: BookOpen },
      { label: "Progress", href: "/progress", icon: TrendingUp },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { label: "Meal Scanner", href: "/nutrition", icon: Utensils },
      { label: "Equipment ID", href: "/equipment-scan", icon: Camera },
      { label: "Form Check", href: "/form-check", icon: Zap },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Reels", href: "/reels", icon: Play },
      { label: "Social Feed", href: "/social", icon: Users },
      { label: "Messages", href: "/messages", icon: MessageCircle },
      { label: "Challenges", href: "/challenges", icon: Trophy },
      { label: "Buddy Finder", href: "/buddy-finder", icon: Users },
      { label: "Gym Finder", href: "/gym-finder", icon: MapPin },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Plate Calc", href: "/tools/plate-calculator", icon: Calculator },
      { label: "1RM Calc", href: "/tools/1rm-calculator", icon: Calculator },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 flex-col bg-surface border-r border-border z-40 overflow-hidden">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-accent-green flex items-center justify-center shadow-glow">
            <span className="text-xl font-black font-display text-background">R</span>
          </div>
          <span className="text-xl font-black font-display text-text-primary tracking-tight">
            REPPED
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-hide">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-2xs font-semibold text-text-muted uppercase tracking-wider px-2 mb-2">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-accent-green/10 text-accent-green border border-accent-green/20"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                    {isActive && (
                      <ChevronRight className="h-3 w-3 ml-auto opacity-50" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div className="p-3 border-t border-border">
        <Link href="/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-elevated transition-colors group">
          <Avatar
            src={session?.user?.image}
            name={session?.user?.name ?? "User"}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">
              {session?.user?.name ?? "User"}
            </p>
            <p className="text-xs text-text-muted truncate">
              {session?.user?.email}
            </p>
          </div>
          <Link href="/settings" onClick={(e) => e.stopPropagation()}>
            <Settings className="h-4 w-4 text-text-muted group-hover:text-text-secondary transition-colors" />
          </Link>
        </Link>
      </div>
    </aside>
  );
}
