"use client";

import { Activity, ArrowDownRight, ArrowUpRight, CalendarDays, Coins, Info, Sparkles, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api, friendlyError } from "@/lib/api";
import { cn, formatPercent, formatPrice } from "@/lib/utils";
import { useApi } from "@/hooks/useApi";
import { useSettings } from "@/components/SettingsProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { InfoNotice, ErrorState } from "@/components/ui/StateBlock";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Sparkline } from "@/components/charts/Sparkline";

interface SummaryCard {
  title: string;
  value: string;
  loading: boolean;
  icon: LucideIcon;
  sub: React.ReactNode;
  valueClassName?: string;
}

export function OverviewSection() {
  const { settings } = useSettings();
  const currency = settings.currency;

  const latest = useApi(() => api.latestPrice());
  const forecast3 = useApi(() => api.forecast(3));
  const forecast7 = useApi(() => api.forecast(7));
  const forecast30 = useApi(() => api.forecast(30));
  const history = useApi(() => api.history(400));

  const sparklineData = (history.data?.data ?? []).slice(-90).map((row) => row.close);
  const latestChangePositive = (latest.data?.daily_change ?? 0) >= 0;

  const summaryCards: SummaryCard[] = [
    {
      title: "Current Gold Price",
      value: latest.data ? formatPrice(latest.data.close, currency) : "—",
      loading: latest.loading,
      icon: Coins,
      sub: latest.data ? (
        <span className={cn("flex items-center gap-1 font-medium", latestChangePositive ? "text-emerald-500" : "text-rose-500")}>
          {latestChangePositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {formatPrice(Math.abs(latest.data.daily_change), currency)} ({formatPercent(latest.data.daily_change_pct)})
        </span>
      ) : (
        "Latest close —"
      ),
    },
    {
      title: "3-Day Forecast",
      value: forecast3.data ? formatPrice(forecast3.data.statistics.average_price, currency) : "—",
      loading: forecast3.loading,
      icon: CalendarDays,
      sub: forecast3.data ? `Ends ${forecast3.data.predictions.at(-1)?.predicted_price}` : "Next 3 trading days",
    },
    {
      title: "7-Day Forecast",
      value: forecast7.data ? formatPrice(forecast7.data.statistics.average_price, currency) : "—",
      loading: forecast7.loading,
      icon: Sparkles,
      sub: forecast7.data ? `Trend ${forecast7.data.trend.trend}` : "Next 7 trading days",
    },
    {
      title: "1-Month Forecast",
      value: forecast30.data ? formatPrice(forecast30.data.statistics.average_price, currency) : "—",
      loading: forecast30.loading,
      icon: Activity,
      sub: forecast30.data ? `Trend ${forecast30.data.trend.trend}` : "Next 30 trading days",
    },
    {
      title: "Current Trend",
      value: forecast7.data ? forecast7.data.trend.trend : "—",
      loading: forecast7.loading,
      icon: TrendingUp,
      valueClassName: cn(
        forecast7.data?.trend.trend === "Bullish" && "text-emerald-600 dark:text-emerald-400",
        forecast7.data?.trend.trend === "Bearish" && "text-rose-600 dark:text-rose-400",
        forecast7.data?.trend.trend === "Neutral" && "text-slate-600 dark:text-slate-300",
      ),
      sub: "7-day expected movement",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className={cn("animate-slide-up")} >
              <CardContent className="p-5" >
                <div style={{ animationDelay: `${index * 60}ms` }} className="space-y-2">
                  <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Icon className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                    {card.title}
                  </span>
                  {card.loading ? (
                    <div className="h-8 w-28 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                  ) : (
                    <p className={cn("text-2xl font-bold tracking-tight text-slate-900 dark:text-white", card.valueClassName)}>
                      {card.value}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 dark:text-slate-500">{card.sub}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Gold Price"
            description="Latest 90 trading days"
            actions={
              <Badge variant={latestChangePositive ? "success" : "danger"}>
                {formatPercent(latest.data?.daily_change_pct ?? 0)} today
              </Badge>
            }
          />
          <CardContent className="pt-4">
            {history.loading ? (
              <CardSkeleton lines={4} />
            ) : history.error ? (
              <ErrorState message={friendlyError(history.error)} onRetry={history.retry} />
            ) : (
              <Sparkline data={sparklineData} height={220} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Market Pulse"
            description="Latest signals"
            actions={<TrendingUp className="h-4 w-4 text-sky-500" />}
          />
          <CardContent className="space-y-3 pt-4">
            {latest.data && (
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Latest close</p>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {formatPrice(latest.data.close, currency)}
                </p>
              </div>
            )}
            {forecast7.data && (
              <div className="rounded-xl bg-gradient-soft p-3 dark:bg-slate-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Expected 7-day move</span>
                  <Badge variant="trend" trend={forecast7.data.trend.trend} dot>
                    {forecast7.data.trend.trend}
                  </Badge>
                </div>
                <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <Sparkles className="h-4 w-4 text-sky-500" />
                  {formatPercent(forecast7.data.trend.expected_change_pct)}
                </p>
              </div>
            )}
            <InfoNotice
              icon={<Info className="h-4 w-4" />}
              message="GoldSense AI forecasts are estimates generated from historical and market data. They are not guaranteed future prices or financial advice."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}