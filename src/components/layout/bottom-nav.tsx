"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, Plus, Play, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Train", href: "/workouts", icon: Dumbbell },
  { label: "Log", href: "/workouts/new", icon: Plus, accent: true },
  { label: "Reels", href: "/reels", icon: Play },
  { label: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="bg-background/90 backdrop-blur-2xl border-t border-border/60 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-around px-2 py-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))]">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            if (item.accent) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="h-10 w-10 rounded-xl bg-accent-green flex items-center justify-center shadow-glow"
                  >
                    <Icon className="h-[22px] w-[22px] text-background" strokeWidth={2.5} />
                  </motion.div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 min-w-[3rem] py-1"
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className={cn(
                    "relative flex items-center justify-center h-[26px] w-[26px] rounded-lg transition-colors duration-200",
                    isActive ? "text-accent-green" : "text-text-muted"
                  )}
                >
                  <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-accent-green"
                    />
                  )}
                </motion.div>
                <span
                  className={cn(
                    "text-[7px] font-medium transition-colors duration-200",
                    isActive ? "text-accent-green" : "text-text-muted"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
