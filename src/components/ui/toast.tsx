"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { createContext, useContext, useState, useCallback } from "react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning" | "info";
  duration?: number;
}

interface ToastContextValue {
  toast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = {
    default: null,
    success: <CheckCircle2 className="h-5 w-5 text-status-success shrink-0" />,
    error: <XCircle className="h-5 w-5 text-status-error shrink-0" />,
    warning: <AlertCircle className="h-5 w-5 text-status-warning shrink-0" />,
    info: <Info className="h-5 w-5 text-status-info shrink-0" />,
  };

  const variantStyles: Record<NonNullable<Toast["variant"]> | "default", string> = {
    default: "bg-surface-elevated border-border",
    success: "bg-surface-elevated border-status-success/40",
    error: "bg-surface-elevated border-status-error/40",
    warning: "bg-surface-elevated border-status-warning/40",
    info: "bg-surface-elevated border-status-info/40",
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      <ToastPrimitive.Provider swipeDirection="up">
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            duration={t.duration ?? 800}
            onOpenChange={(open) => !open && removeToast(t.id)}
            defaultOpen
            className={cn(
              "pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl",
              "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95",
              "transition-all duration-200",
              variantStyles[t.variant ?? "default"]
            )}
          >
            {icons[t.variant ?? "default"]}
            <div className="flex-1">
              <ToastPrimitive.Title className="text-sm font-semibold text-text-primary">
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="text-xs text-text-secondary mt-0.5">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none px-10" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
