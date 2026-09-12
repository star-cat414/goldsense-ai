"use client";

import { useMemo, useState } from "react";
import { Activity } from "lucide-react";
import { api, friendlyError } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/utils";
import { useApi } from "@/hooks/useApi";
import { useSettings } from "@/components/SettingsProvider";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ErrorState, EmptyState, InfoNotice } from "@/components/ui/StateBlock";
import { PriceChart, PriceRangeSelector, type PriceRange } from "@/components/charts/PriceChart";
import { PRICE_RANGES } from "@/components/charts/PriceChart";

export function GoldPriceSection() {
  const { settings } = useSettings();
  const currency = settings.currency;
  const [range, setRange] = useState<PriceRange>("1Y");

  const history = useApi(() => api.history(2000));

  const data = useMemo(() => (history.data?.data ?? []).map((row) => ({ ...row })), [history.data]);

  const rangeConfig = PRICE_RANGES.find((item) => item.id === range)!;

  const filtered = useMemo(() => {
    if (range === "ALL" || !rangeConfig.days) return data;
    const cutoff = new Date();
    const now = new Date(data.at(-1)?.date ?? new Date().toISOString());
    const start = new Date(now);
    start.setDate(start.getDate() - rangeConfig.days);
    return data.filter((row) => new Date(row.date) >= start);
  }, [data, range, rangeConfig.days]);

  const availableDays =
    data.length >= 2
      ? Math.round(
          (new Date(data.at(-1)!.date).getTime() - new Date(data[0].date).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  const insufficient = range !== "ALL" && rangeConfig.days !== null && availableDays < rangeConfig.days;
  const shownData = insufficient ? data : filtered;

  const stats = useMemo(() => {
    if (shownData.length === 0) return null;
    const closes = shownData.map((row) => row.close);
    return {
      start: shownData[0].date,
      end: shownData.at(-1)!.date,
      min: Math.min(...closes),
      max: Math.max(...closes),
      avg: closes.reduce((sum, value) => sum + value, 0) / closes.length,
    };
  }, [shownData]);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Activity className="h-4 w-4" />}
        title="Historical Gold Price"
        subtitle="Daily gold prices from the connected dataset. Select a time window to inspect the trend."
        actions={<PriceRangeSelector value={range} onChange={setRange} />}
      />

      <Card>
        <CardHeader
          title={`Gold Price — ${rangeConfig.label}`}
          description={
            stats
              ? `${formatDate(stats.start)} to ${formatDate(stats.end)} · ${shownData.length} trading days`
              : "Loading data…"
          }
        />
        <CardContent>
          {history.loading ? (
            <div className="h-96 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ) : history.error ? (
            <ErrorState message={friendlyError(history.error)} onRetry={history.retry} />
          ) : data.length === 0 ? (
            <EmptyState message="No historical gold price data is available in the dataset." />
          ) : insufficient ? (
            <div className="space-y-4">
              <EmptyState
                title="Not enough data for the selected range"
                message={`The dataset spans ${availableDays} calendar days, which is shorter than the ${rangeConfig.days} days requested. Showing all available data instead.`}
              />
              <PriceChart data={data} />
            </div>
          ) : (
            <PriceChart data={shownData} />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Start price", value: stats ? formatPrice(stats.min, currency) : "—" },
          { label: "End price", value: stats ? formatPrice(stats.max, currency) : "—" },
          { label: "Average", value: stats ? formatPrice(stats.avg, currency) : "—" },
          { label: "Points shown", value: shownData.length ? String(shownData.length) : "—" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <InfoNotice message="Price data is sourced from a legally accessible free financial data feed and stored in the project database. No values in this section are fabricated." />
    </div>
  );
}