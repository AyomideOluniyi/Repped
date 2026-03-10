"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, ArrowLeft, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const pageTitles: Record<string, string> = {
  "/dashboard":            "Dashboard",
  "/workouts":             "Workouts",
  "/workouts/new":         "New Workout",
  "/workouts/templates":   "Templates",
  "/videos":               "Video Library",
  "/videos/upload":        "Upload Video",
  "/exercises":            "Exercise Encyclopedia",
  "/progress":             "Progress",
  "/progress/photos":      "Progress Photos",
  "/nutrition":            "Nutrition",
  "/nutrition/scan":       "Scan Meal",
  "/equipment-scan":       "Equipment Scanner",
  "/form-check":           "Form Checker",
  "/social":               "Community",
  "/messages":             "Messages",
  "/challenges":           "Challenges",
  "/buddy-finder":         "Find a Buddy",
  "/gym-finder":           "Gym Finder",
  "/profile":              "My Profile",
  "/settings":             "Settings",
  "/tools/plate-calculator":"Plate Calculator",
  "/tools/1rm-calculator": "1RM Calculator",
};

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const title = pageTitles[pathname] ?? "REPPED";
  const isDashboard = pathname === "/dashboard";
  const isSubPage = pathname.split("/").length > 2;

  // Fetch unread notification count on mount and when leaving the notifications page
  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.unreadCount ?? 0))
      .catch(() => {});
  }, [pathname, session?.user]);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 bg-background/90 backdrop-blur-2xl",
        "border-b border-border/60",
        /* push content below iOS status bar */
        "pt-[env(safe-area-inset-top,0px)]",
        className
      )}
    >
      <div className="flex h-14 items-center gap-3 px-4 md:pl-64">
        {isSubPage && !isDashboard && (
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center h-8 w-8 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-all mr-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}

        {isDashboard ? (
          <div className="flex-1">
            <p className="text-xs text-text-muted font-medium tracking-wide uppercase">Good {getTimeOfDay()}</p>
            <h1 className="text-lg font-black font-display text-text-primary leading-tight">
              {session?.user?.name?.split(" ")[0] ?? "Athlete"} 💪
            </h1>
          </div>
        ) : (
          <h1 className="flex-1 text-lg font-black font-display text-text-primary tracking-tight">
            {title}
          </h1>
        )}

        <div className="flex items-center gap-0.5">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="text-text-muted hover:text-text-primary"
          >
            {theme === "dark"
              ? <Sun  className="h-4 w-4" />
              : <Moon className="h-4 w-4" />
            }
          </Button>

          <Link href="/exercises">
            <Button variant="ghost" size="icon-sm" className="text-text-muted hover:text-text-primary">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/notifications" className="relative">
            <Button variant="ghost" size="icon-sm" className="text-text-muted hover:text-text-primary">
              <Bell className="h-4 w-4" />
            </Button>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[1rem] h-4 px-0.5 rounded-full bg-accent-green text-background text-[10px] font-black flex items-center justify-center leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <Link href="/profile" className="ml-1">
            <Avatar
              src={session?.user?.image}
              name={session?.user?.name ?? "User"}
              size="sm"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
