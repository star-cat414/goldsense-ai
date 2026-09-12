import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800",
        className,
      )}
    />
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500 dark:border-slate-600 dark:border-t-sky-400",
        className,
      )}
    />
  );
}

export function PageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-slate-400 dark:text-slate-500">
      <Spinner className="h-6 w-6" />
      {label}
    </div>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900/70">
      <Skeleton className="mb-3 h-4 w-32" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-full" />
        ))}
      </div>
    </div>
  );
}