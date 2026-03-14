"use client";

import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { Header } from "./header";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { InstallPrompt } from "@/components/ui/install-prompt";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-background relative">
      <OfflineBanner />
      <Sidebar />
      <div className="md:pl-60">
        <Header />
        <main
          className={cn(
            "min-h-[calc(100vh-3.5rem)] md:pb-6",
            keyboardOpen ? "pb-0" : "pb-[var(--nav-bar-height)]",
            className
          )}
        >
          {children}
        </main>
      </div>
      <BottomNav />
      <InstallPrompt />
    </div>
  );
}
