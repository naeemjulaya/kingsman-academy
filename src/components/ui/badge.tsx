import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "outline";
}

export const Badge = ({ className, variant = "primary", ...props }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors uppercase tracking-widest",
        {
          "bg-primary/10 text-primary": variant === "primary",
          "bg-surface-variant text-on-surface-variant": variant === "secondary",
          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20": variant === "success",
          "bg-amber-500/10 text-amber-400 border border-amber-500/20": variant === "warning",
          "bg-red-500/10 text-red-400 border border-red-500/20": variant === "danger",
          "border border-primary/20 text-on-surface": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
};
Badge.displayName = "Badge";
