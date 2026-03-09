"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { generateAvatarFallback } from "@/lib/utils";

const AvatarRoot = AvatarPrimitive.Root;

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  online?: boolean;
}

const sizeClasses = {
  xs: "h-6 w-6 text-2xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

function Avatar({ src, name, size = "md", online, className, ...props }: AvatarProps) {
  return (
    <div className="relative inline-flex">
      <AvatarRoot
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <AvatarPrimitive.Image
          src={src ?? undefined}
          alt={name ?? "User"}
          className="aspect-square h-full w-full object-cover"
        />
        <AvatarPrimitive.Fallback
          className="flex h-full w-full items-center justify-center rounded-full bg-surface-elevated text-text-secondary font-semibold border border-border"
        >
          {name ? generateAvatarFallback(name) : "?"}
        </AvatarPrimitive.Fallback>
      </AvatarRoot>
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-background",
            size === "xs" || size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5",
            online ? "bg-status-success" : "bg-text-muted"
          )}
        />
      )}
    </div>
  );
}

export { Avatar };
