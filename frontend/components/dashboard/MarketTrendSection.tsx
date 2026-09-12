"use client";

import { TrendingUp } from "lucide-react";
import { api, friendlyError } from "@/lib/api";
import { cn, formatDate, formatPercent, formatPrice } from "@/lib/utils";
import { useApi } from "@/hooks/useApi";
import { useSettings } from "@/components/SettingsProvider";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ErrorState, InfoNotice } from "@/components/ui/StateBlock";
import { CardSkeleton } from "@/components/ui/Skeleton";

export function MarketTrendSection() {
  const { settings } = useSettings();
  const currency = settings.currency;

  const trend = useApi(() => api.trend(7));

  const trendStyle = (value: string) => {
    if (value === "Bullish") return "text-emerald-600 dark:text-emerald-400";
    if (value === "Bearish") return "text-rose-600 dark:text-rose-400";
    return "text-slate-600 dark:text-slate-300";
  };

  const cards = [
    { label: "Latest Price", value: trend.data ? formatPrice(trend.data.latest_price, currency) : "—" },
    { label: "Forecasted Price", value: trend.data ? formatPrice(trend.data.forecasted_price, currency) : "—" },
    {
      label: "Expected Change",
      value: trend.data ? formatPercent(trend.data.expected_change_pct) : "—",
      valueClassName: trend.data && trendStyle(trend.data.trend),
    },
    { label: "Market Trend", value: trend.data?.trend ?? "—", valueClassName: trend.data && trendStyle(trend.data.trend) },
    { label: "Highest Predicted", value: trend.data ? formatPrice(trend.data.highest_price, currency) : "—" },
    { label: "Lowest Predicted", value: trend.data ? formatPrice(trend.data.lowest_price, currency) : "—" },
    { label: "Average Predicted", value: trend.data ? formatPrice(trend.data.average_price, currency) : "—" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<TrendingUp className="h-4 w-4" />}
        title="Market Trend Analysis"
        subtitle="Directional classification based on the AI forecast and transparent rules."
      />

      {trend.error ? (
        <ErrorState message={friendlyError(trend.error)} onRetry={trend.retry} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 min-[540px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cards.map((card, index) => (
              <Card key={card.label} className="animate-slide-up">
                <CardContent className="p-5">
                  <div style={{ animationDelay: `${index * 50}ms` }}>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                    {trend.loading && !trend.data ? (
                      <div className="mt-2 h-7 w-24 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                    ) : (
                      <p className={cn("mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-white", card.valueClassName)}>
                        {card.value}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader
                title="Classification Rules"
                description="The trend label is derived from transparent, documented thresholds."
                actions={
                  trend.data ? (
                    <Badge variant="trend" trend={trend.data.trend} dot className="text-sm">
                      {trend.data.trend}
                    </Badge>
                  ) : (
                    <CardSkeleton lines={1} />
                  )
                }
              />
              <CardContent className="pt-4">
                {trend.loading && !trend.data ? (
                  <CardSkeleton lines={5} />
                ) : (
                  <ol className="space-y-2.5">
                    {trend.data?.rules.map((rule, index) => (
                      <li key={index} className="flex gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[10px] font-bold text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
                          {index + 1}
                        </span>
                        <span className="leading-relaxed">{rule}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                title="Forecast Overview"
                description={`Based on the ${trend.data?.horizon ?? 7}-day XGBoost forecast.`}
              />
              <CardContent className="space-y-3 pt-4">
                {trend.loading && !trend.data ? (
                  <CardSkeleton lines={4} />
                ) : trend.data ? (
                  <>
                    <div className="flex items-center justify-between rounded-xl bg-gradient-soft px-4 py-3 dark:bg-slate-800/60">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">7-day expected movement</p>
                        <p className={cn("mt-1 text-2xl font-bold tabular-nums", trendStyle(trend.data.trend))}>
                          {formatPercent(trend.data.expected_change_pct)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Forecast window</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {trend.data.horizon} trading days
                        </p>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-500">
                      Highest predicted: {trend.data.highest_price} · Lowest predicted: {trend.data.lowest_price} ·
                      Average predicted: {trend.data.average_price}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Latest observed date: {formatDate(new Date().toISOString())}
                    </p>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <InfoNotice message="The trend classification describes the model's expectation for the 7-day window. It is not a recommendation to buy, sell, or hold gold, and it does not guarantee future price direction." />
        </>
      )}
    </div>
  );
}