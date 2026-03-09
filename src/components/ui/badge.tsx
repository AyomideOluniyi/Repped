import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-accent-green/10 text-accent-green border border-accent-green/20",
        orange: "bg-accent-orange/10 text-accent-orange border border-accent-orange/20",
        secondary: "bg-surface-elevated text-text-secondary border border-border",
        destructive: "bg-status-error/10 text-status-error border border-status-error/20",
        success: "bg-status-success/10 text-status-success border border-status-success/20",
        warning: "bg-status-warning/10 text-status-warning border border-status-warning/20",
        info: "bg-status-info/10 text-status-info border border-status-info/20",
        solid: "bg-accent-green text-background",
        "solid-orange": "bg-accent-orange text-white",
        glass: "bg-white/10 text-text-primary border border-white/10 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
