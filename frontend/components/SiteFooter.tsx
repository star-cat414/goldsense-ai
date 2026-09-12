import { Coins } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand text-white">
            <Coins className="h-4 w-4" />
          </span>
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">GoldSense AI</span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Research tool · Not financial advice · Powered by real market data
        </p>
      </div>
    </footer>
  );
}