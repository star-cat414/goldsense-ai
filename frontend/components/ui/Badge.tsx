import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { trendBadgeStyles } from "@/lib/utils";

type BadgeVariant = "default" | "trend" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  trend?: string;
  className?: string;
  dot?: boolean;
}

export function Badge({ children, variant = "default", trend, className, dot = false }: BadgeProps) {
  if (variant === "trend") {
    if (trend) {
      const styles = trendBadgeStyles(trend);
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            styles.className,
            className,
          )}
        >
          {dot && <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />}
          {children}
        </span>
      );
    }
    variant = "default";
  }

  const variants: Record<Exclude<BadgeVariant, "trend">, string> = {
    default: "bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
    success: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
    warning: "bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
    danger: "bg-rose-50 text-rose-600 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20",
    info: "bg-sky-50 text-sky-600 ring-1 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20",
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}