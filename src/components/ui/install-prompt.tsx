"use client";

import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "@/components/ui/button";
import { X, Download, Share, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPrompt() {
  const { showPrompt, isIOS, install, dismiss, isInstalled } = useInstallPrompt();

  if (isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-50 md:bottom-8 md:left-auto md:right-8 md:max-w-sm"
      >
        <div className="bg-surface-elevated border border-border rounded-2xl p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center shrink-0">
                <span className="text-2xl font-black font-display text-accent-green">R</span>
              </div>
              <div>
                <p className="font-bold text-text-primary text-sm">Install REPPED</p>
                <p className="text-xs text-text-secondary mt-0.5">Add to your home screen for the best experience</p>
              </div>
            </div>
            <button
              onClick={dismiss}
              className="text-text-muted hover:text-text-secondary transition-colors shrink-0 mt-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {isIOS ? (
            <div className="mt-3 p-3 bg-surface rounded-xl border border-border">
              <p className="text-xs text-text-secondary">
                Tap <Share className="inline h-3 w-3 text-status-info mx-0.5" /> <strong>Share</strong> then{" "}
                <Plus className="inline h-3 w-3 mx-0.5" /> <strong>Add to Home Screen</strong>
              </p>
            </div>
          ) : (
            <div className="flex gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-text-muted"
                onClick={dismiss}
              >
                Not now
              </Button>
              <Button
                size="sm"
                className="flex-1"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={install}
              >
                Install
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
