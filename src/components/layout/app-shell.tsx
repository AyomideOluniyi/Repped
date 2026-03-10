"use client";

import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { Header } from "./header";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { InstallPrompt } from "@/components/ui/install-prompt";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background relative">
      <OfflineBanner />
      <Sidebar />
      <div className="md:pl-60">
        <Header />
        <main
          className={cn(
            "min-h-[calc(100vh-3.5rem)] pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-6",
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
