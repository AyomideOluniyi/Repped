"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(ios);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Track visit count
    const visitCount = parseInt(localStorage.getItem("repped-visit-count") ?? "0") + 1;
    localStorage.setItem("repped-visit-count", visitCount.toString());

    // Capture install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Show prompt on 2nd+ visit if not dismissed recently
    const lastDismissed = localStorage.getItem("repped-install-dismissed");
    const dismissedRecently = lastDismissed &&
      Date.now() - parseInt(lastDismissed) < 7 * 24 * 60 * 60 * 1000; // 7 days

    if (visitCount >= 2 && !dismissedRecently) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setShowPrompt(false);
    }
    setInstallPrompt(null);
  };

  const dismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("repped-install-dismissed", Date.now().toString());
  };

  return { installPrompt, isInstalled, showPrompt, isIOS, install, dismiss };
}
