"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const Modal = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;
const ModalClose = DialogPrimitive.Close;

interface ModalContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  showClose?: boolean;
  title?: string;
  description?: string;
  fullScreen?: boolean;
  bottomSheet?: boolean;
}

function ModalContent({
  className,
  children,
  showClose = true,
  title,
  description,
  fullScreen,
  bottomSheet,
  ...props
}: ModalContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-fade-in data-[state=closed]:opacity-0"
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 bg-surface border border-border shadow-card",
          "data-[state=open]:animate-fade-up data-[state=closed]:opacity-0",
          "focus:outline-none",
          bottomSheet
            ? "bottom-0 left-0 right-0 rounded-t-3xl max-h-[90vh] overflow-y-auto"
            : fullScreen
            ? "inset-0 rounded-none"
            : "left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md rounded-2xl max-h-[90vh] overflow-y-auto",
          className
        )}
        {...props}
      >
        {bottomSheet && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1 w-10 rounded-full bg-border-strong" />
          </div>
        )}
        {(title || showClose) && (
          <div className={cn("flex items-center justify-between p-4", bottomSheet && "pb-2")}>
            <div>
              {title && (
                <DialogPrimitive.Title className="text-lg font-bold text-text-primary font-display">
                  {title}
                </DialogPrimitive.Title>
              )}
              {description && (
                <DialogPrimitive.Description className="text-sm text-text-secondary mt-0.5">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            {showClose && (
              <DialogPrimitive.Close className="rounded-xl p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            )}
          </div>
        )}
        <div className={cn("p-4", (title || showClose) && "pt-0")}>
          {children}
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export { Modal, ModalTrigger, ModalClose, ModalContent };
