"use client";

import { useState, useEffect } from "react";

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      if (wasOffline) {
        setWasOffline(false);
        // Trigger sync when coming back online
        if ("serviceWorker" in navigator && "sync" in ServiceWorkerRegistration.prototype) {
          navigator.serviceWorker.ready.then((registration) => {
            // @ts-expect-error - Background sync API
            return registration.sync.register("sync-workouts");
          });
        }
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  return { isOffline, wasOffline };
}
