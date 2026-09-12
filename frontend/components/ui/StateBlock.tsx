import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function ErrorState({
  message,
  onRetry,
  className,
  title = "Something went wrong",
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
  title?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 px-6 py-10 text-center dark:border-rose-500/30 dark:bg-rose-500/5",
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-500 dark:bg-rose-500/10">
        <RefreshCw className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
        <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">{message}</p>
      </div>
      {onRetry && <Button size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function EmptyState({
  message,
  title = "Nothing to show yet",
  className,
}: {
  message: string;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-900/40",
        className,
      )}
    >
      <div className="text-2xl">🗂️</div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

export function InfoNotice({
  message,
  className,
  icon,
}: {
  message: string;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl bg-sky-50/70 px-4 py-3 text-xs leading-relaxed text-slate-600 dark:bg-sky-500/5 dark:text-slate-300",
        className,
      )}
    >
      {icon && <span className="mt-px shrink-0 text-sky-500 dark:text-sky-400">{icon}</span>}
      <span>{message}</span>
    </div>
  );
}