"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { createContext, useContext, useState, useCallback } from "react";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-2xl border p-4 shadow-card transition-all duration-300 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-fade-up data-[state=closed]:opacity-0",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-elevated",
        success: "border-status-success/30 bg-status-success/10",
        error: "border-status-error/30 bg-status-error/10",
        warning: "border-status-warning/30 bg-status-warning/10",
        info: "border-status-info/30 bg-status-info/10",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

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

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
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

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            className={cn(toastVariants({ variant: t.variant }))}
            duration={t.duration ?? 4000}
            onOpenChange={(open) => !open && removeToast(t.id)}
            defaultOpen
          >
            <div className="flex items-start gap-3 flex-1">
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
            </div>
            <ToastPrimitive.Close
              className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-text-primary"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-[var(--nav-bar-height)] right-4 z-50 flex max-h-screen w-full max-w-sm flex-col gap-2 p-4 md:bottom-4" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
