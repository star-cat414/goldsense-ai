"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Info, Sparkles, TrendingUp } from "lucide-react";
import { api, friendlyError } from "@/lib/api";
import { cn, formatDate, formatPercent, formatPrice } from "@/lib/utils";
import { useApi } from "@/hooks/useApi";
import { useSettings } from "@/components/SettingsProvider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Sparkline } from "@/components/charts/Sparkline";

export function HeroSection() {
  const { settings } = useSettings();
  const currency = settings.currency;
  const latest = useApi(() => api.latestPrice());
  const history = useApi(() => api.history(120));

  const up = (latest.data?.daily_change ?? 0) >= 0;
  const spark = (history.data?.data ?? []).map((row) => row.close);

  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="animate-slide-up">
          <Badge variant="info" className="mb-5">
            <Sparkles className="h-3 w-3" /> AI-Powered Analytics
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            GoldSense{" "}
            <span className="bg-gradient-brand bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg font-medium leading-snug text-slate-500 dark:text-slate-400">
            AI-Powered Gold Price Prediction &amp; Market Trend Analysis
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
            GoldSense AI applies machine learning to ~2,000 real historical gold-price records,
            engineering technical and market features to generate short-term price forecasts
            with XGBoost — benchmarked transparently against a Linear Regression baseline.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/dashboard">
              <Button size="lg">
                Explore Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline">
                Learn About GoldSense AI
              </Button>
            </Link>
          </div>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
            <HeroStat value="2,000" label="records" />
            <HeroStat value="35" label="features" />
            <HeroStat value="30d" label="forecast" />
          </div>
        </div>

        <div className="relative animate-fade-in">
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-brand opacity-[0.07] blur-2xl" />
          <div className="relative rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-card backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
            {latest.loading ? (
              <div className="space-y-3">
                <div className="h-5 w-40 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                <div className="h-10 w-56 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              </div>
            ) : latest.error ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Info className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-400">{friendlyError(latest.error)}</p>
              </div>
            ) : latest.data ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Latest Gold Price
                    </p>
                    <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {formatPrice(latest.data.close, currency)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold",
                      up
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
                    )}
                  >
                    {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {formatPercent(latest.data.daily_change_pct)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {formatDate(latest.data.date)} · Previous close {formatPrice(latest.data.previous_close, currency)}
                </p>
                <div className="mt-4">
                  {history.loading ? (
                    <div className="h-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                  ) : (
                    <Sparkline data={spark} height={200} />
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-soft px-4 py-3 dark:bg-slate-800/60">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    <TrendingUp className="mr-1 inline h-3.5 w-3.5" />
                    XGBoost · next 30 days
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    3 / 7 / 1-month horizons
                  </span>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-3 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      <p className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
    </div>
  );
}