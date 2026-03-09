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
      {/* Safe area gradient */}
      <div className="bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
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
                    className="h-12 w-12 rounded-2xl bg-accent-green flex items-center justify-center shadow-glow"
                  >
                    <Icon className="h-6 w-6 text-background" strokeWidth={2.5} />
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
                    "relative flex items-center justify-center h-8 w-8 rounded-xl transition-colors duration-200",
                    isActive ? "text-accent-green" : "text-text-muted"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-accent-green"
                    />
                  )}
                </motion.div>
                <span
                  className={cn(
                    "text-2xs font-medium transition-colors duration-200",
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
