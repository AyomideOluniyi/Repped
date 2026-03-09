"use client";

import { useOffline } from "@/hooks/useOffline";
import { WifiOff, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function OfflineBanner() {
  const { isOffline } = useOffline();
  const [show, setShow] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setShow(true);
      setShowReconnected(false);
    } else if (show) {
      setShowReconnected(true);
      setTimeout(() => {
        setShow(false);
        setShowReconnected(false);
      }, 3000);
    }
  }, [isOffline, show]);

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium transition-all duration-300",
        showReconnected
          ? "bg-status-success/90 text-white"
          : "bg-surface-elevated text-text-secondary border-b border-border"
      )}
    >
      {showReconnected ? (
        <>
          <Wifi className="h-4 w-4" />
          Back online. Syncing your data...
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          You&apos;re offline. Changes will sync when reconnected.
        </>
      )}
    </div>
  );
}
