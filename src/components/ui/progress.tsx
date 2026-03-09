"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  showValue?: boolean;
  color?: "green" | "orange" | "blue" | "white";
}

function Progress({
  className,
  value,
  indicatorClassName,
  showValue,
  color = "green",
  ...props
}: ProgressProps) {
  const colorClasses = {
    green: "bg-accent-green",
    orange: "bg-accent-orange",
    blue: "bg-status-info",
    white: "bg-text-primary",
  };

  return (
    <div className="flex items-center gap-2">
      <ProgressPrimitive.Root
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-surface-elevated",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all duration-500 ease-out rounded-full",
            colorClasses[color],
            indicatorClassName
          )}
          style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
        />
      </ProgressPrimitive.Root>
      {showValue && (
        <span className="text-xs text-text-secondary min-w-[2.5rem] text-right">
          {value}%
        </span>
      )}
    </div>
  );
}

export { Progress };
