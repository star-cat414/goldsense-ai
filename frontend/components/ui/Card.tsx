import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white shadow-card transition-shadow duration-300 hover:shadow-cardHover dark:border-slate-800 dark:bg-slate-900/70",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  actions,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800", className)}>
      <div className="min-w-0">
        {title && (
          <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white sm:text-base">
            {title}
          </h3>
        )}
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardContent({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("border-t border-slate-100 px-5 py-3 dark:border-slate-800", className)}>
      {children}
    </div>
  );
}