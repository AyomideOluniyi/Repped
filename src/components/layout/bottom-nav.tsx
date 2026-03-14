"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Dumbbell, Plus, Play, Grid3X3,
  Video, BookOpen, TrendingUp, Utensils, Camera, Zap,
  Users, MessageCircle, Trophy, MapPin, Calculator, User, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const moreGroups = [
  {
    label: "Main",
    items: [
      { label: "Profile", href: "/profile", icon: User },
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

const navItems = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Train", href: "/workouts", icon: Dumbbell },
  { label: "Log", href: "/workouts/new", icon: Plus, accent: true },
  { label: "Reels", href: "/reels", icon: Play },
  { label: "More", href: null, icon: Grid3X3 },
];

export function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // Hide nav when any input/textarea is focused (keyboard opens on mobile)
  useEffect(() => {
    const onFocus = (e: FocusEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        setKeyboardOpen(true);
      }
    };
    const onBlur = () => setKeyboardOpen(false);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", onBlur);
    return () => {
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onBlur);
    };
  }, []);

  const isMoreActive = moreGroups.some((g) =>
    g.items.some((i) => pathname === i.href || pathname.startsWith(i.href))
  );

  return (
    <>
      {!keyboardOpen && <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="bg-background/90 backdrop-blur-2xl border-t border-border/60 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-around px-2 py-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))]">
            {navItems.map((item) => {
              const isActive =
                item.href !== null &&
                (pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href)));
              const Icon = item.icon;

              if (item.accent) {
                return (
                  <Link
                    key="log"
                    href={item.href!}
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

              if (item.href === null) {
                // "More" button
                return (
                  <button
                    key="more"
                    onClick={() => setShowMore(true)}
                    className="flex flex-col items-center gap-1 min-w-[3rem] py-1"
                  >
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      className={cn(
                        "relative flex items-center justify-center h-[26px] w-[26px] rounded-lg transition-colors duration-200",
                        isMoreActive ? "text-accent-green" : "text-text-muted"
                      )}
                    >
                      <Icon className="h-[22px] w-[22px]" strokeWidth={isMoreActive ? 2.5 : 2} />
                    </motion.div>
                    <span
                      className={cn(
                        "text-[7px] font-medium transition-colors duration-200",
                        isMoreActive ? "text-accent-green" : "text-text-muted"
                      )}
                    >
                      More
                    </span>
                  </button>
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
      </nav>}

      {/* More sheet */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
            onClick={() => setShowMore(false)}
          >
            <div className="absolute inset-0 bg-black/60" />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl overflow-hidden"
              style={{ paddingBottom: "calc(var(--nav-bar-height))" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="h-1 w-10 rounded-full bg-border-strong mx-auto mt-3 mb-4" />

              {/* Header */}
              <div className="flex items-center justify-between px-5 mb-4">
                <p className="font-bold text-text-primary text-base">Menu</p>
                <button onClick={() => setShowMore(false)} className="text-text-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Groups */}
              <div className="px-4 pb-4 space-y-5 overflow-y-auto max-h-[70dvh]">
                {moreGroups.map((group) => (
                  <div key={group.label}>
                    <p className="text-2xs font-semibold text-text-muted uppercase tracking-wider px-1 mb-2">
                      {group.label}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setShowMore(false)}
                            className={cn(
                              "flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-colors",
                              isActive
                                ? "bg-accent-green/10 border border-accent-green/20"
                                : "bg-surface-elevated"
                            )}
                          >
                            <Icon
                              className={cn("h-5 w-5", isActive ? "text-accent-green" : "text-text-secondary")}
                              strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span
                              className={cn(
                                "text-[10px] font-medium text-center leading-tight",
                                isActive ? "text-accent-green" : "text-text-secondary"
                              )}
                            >
                              {item.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
