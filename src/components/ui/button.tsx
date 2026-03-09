"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-95 font-body",
  {
    variants: {
      variant: {
        default:
          "bg-accent-green text-background hover:bg-accent-green-dim shadow-glow",
        secondary:
          "bg-surface-elevated text-text-primary hover:bg-surface-hover border border-border",
        destructive:
          "bg-status-error text-white hover:bg-red-600",
        outline:
          "border border-border-strong bg-transparent text-text-primary hover:bg-surface-elevated",
        ghost:
          "text-text-secondary hover:text-text-primary hover:bg-surface-elevated",
        link:
          "text-accent-green underline-offset-4 hover:underline p-0 h-auto",
        orange:
          "bg-accent-orange text-white hover:bg-accent-orange-dim shadow-glow-orange",
        glass:
          "bg-white/5 backdrop-blur-sm border border-white/10 text-text-primary hover:bg-white/10",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-14 rounded-2xl px-8 text-base",
        xl: "h-16 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
