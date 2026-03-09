"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, ArrowLeft, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

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
  const title = pageTitles[pathname] ?? "REPPED";
  const isDashboard = pathname === "/dashboard";
  const isSubPage = pathname.split("/").length > 2;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-xl",
        /* push content below iOS status bar */
        "pt-[env(safe-area-inset-top,0px)]",
        className
      )}
    >
      <div className="flex h-14 items-center gap-3 px-4 md:pl-64">
        {isSubPage && !isDashboard && (
          <button
            onClick={() => window.history.back()}
            className="text-text-muted hover:text-text-primary transition-colors mr-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        {isDashboard ? (
          <div className="flex-1">
            <p className="text-xs text-text-muted">Good {getTimeOfDay()}</p>
            <h1 className="text-lg font-black font-display text-text-primary leading-tight">
              {session?.user?.name?.split(" ")[0] ?? "Athlete"} 💪
            </h1>
          </div>
        ) : (
          <h1 className="flex-1 text-lg font-bold font-display text-text-primary">
            {title}
          </h1>
        )}

        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark"
              ? <Sun  className="h-4 w-4 text-text-secondary" />
              : <Moon className="h-4 w-4 text-text-secondary" />
            }
          </Button>

          <Link href="/exercises">
            <Button variant="ghost" size="icon-sm">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/notifications" className="relative">
            <Button variant="ghost" size="icon-sm">
              <Bell className="h-5 w-5" />
            </Button>
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent-green animate-pulse" />
          </Link>

          <Link href="/profile">
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
