"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  User, Bell, Shield, Moon, LogOut, ChevronRight,
  Smartphone, Database, HelpCircle, Trash2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [signingOut, setSigningOut] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/users/profile", { method: "DELETE" });
      if (!res.ok) throw new Error();
      await signOut({ callbackUrl: "/" });
    } catch {
      toast({ title: "Failed to delete account", variant: "error" });
      setDeleting(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: "/" });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `repped-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Data exported!", variant: "success" });
    } catch {
      toast({ title: "Export failed", variant: "error" });
    } finally {
      setExporting(false);
    }
  };

  const SETTINGS_GROUPS = [
    {
      label: "Account",
      items: [
        { icon: User, label: "Edit Profile", desc: "Name, bio, goals, avatar", action: () => router.push("/settings/profile"), isLoading: false },
        { icon: Shield, label: "Privacy", desc: "Control who sees your data", action: () => toast({ title: "Privacy settings coming soon", variant: "info" }), isLoading: false },
      ],
    },
    {
      label: "App",
      items: [
        { icon: Bell, label: "Notifications", desc: "Workout reminders, messages", action: () => toast({ title: "Manage notifications in your browser settings", variant: "info" }), isLoading: false },
        { icon: Moon, label: "Appearance", desc: "Dark/light mode, theme", action: () => toast({ title: "Appearance settings coming soon", variant: "info" }), isLoading: false },
        { icon: Smartphone, label: "Install App", desc: "Add REPPED to your home screen", action: () => toast({ title: "Tap the share button in your browser and select 'Add to Home Screen'", variant: "info" }), isLoading: false },
      ],
    },
    {
      label: "Data",
      items: [
        { icon: Database, label: "Export Data", desc: "Download your workout history as JSON", action: handleExport, isLoading: exporting },
      ],
    },
    {
      label: "Support",
      items: [
        { icon: HelpCircle, label: "Help & FAQ", desc: "Get answers to common questions", action: () => toast({ title: "Support coming soon", variant: "info" }), isLoading: false },
      ],
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4 max-w-2xl mx-auto">
      {SETTINGS_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">
            {group.label}
          </p>
          <Card className="divide-y divide-border p-0 overflow-hidden">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 p-4 hover:bg-surface-elevated transition-colors text-left disabled:opacity-50"
                  onClick={item.action}
                  disabled={item.isLoading}
                >
                  <div className="h-8 w-8 rounded-lg bg-surface-elevated flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary text-sm">{item.label}</p>
                    <p className="text-xs text-text-muted">{item.desc}</p>
                  </div>
                  {item.isLoading
                    ? <div className="h-4 w-4 rounded-full border-2 border-accent-green border-t-transparent animate-spin" />
                    : <ChevronRight className="h-4 w-4 text-text-muted" />
                  }
                </button>
              );
            })}
          </Card>
        </div>
      ))}

      <Button
        variant="destructive"
        size="lg"
        className="w-full"
        loading={signingOut}
        leftIcon={<LogOut className="h-4 w-4" />}
        onClick={handleSignOut}
      >
        Sign Out
      </Button>

      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="w-full text-center text-xs text-status-error underline underline-offset-2 py-1"
      >
        Delete Account
      </button>

      <p className="text-center text-xs text-text-muted">REPPED v1.0.0 · Built with ❤️ for athletes</p>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setShowDeleteConfirm(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-surface rounded-3xl p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-full bg-status-error/10 border border-status-error/20 flex items-center justify-center">
                <Trash2 className="h-7 w-7 text-status-error" />
              </div>
              <div>
                <p className="font-bold text-text-primary text-lg">Delete your account?</p>
                <p className="text-sm text-text-muted mt-1">All your data — workouts, videos, and messages — will be permanently deleted. This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-2xl border border-border text-text-primary font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-3 rounded-2xl bg-status-error text-white font-semibold text-sm disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
