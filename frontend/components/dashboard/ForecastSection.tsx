"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Info, Sparkles } from "lucide-react";
import { api, friendlyError } from "@/lib/api";
import { cn, formatDate, formatPercent, formatPrice, trendBadgeStyles } from "@/lib/utils";
import { useApi } from "@/hooks/useApi";
import { useSettings } from "@/components/SettingsProvider";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ErrorState, InfoNotice } from "@/components/ui/StateBlock";
import { Spinner } from "@/components/ui/Skeleton";
import { ForecastChart } from "@/components/charts/ForecastChart";

const HORIZONS = [
  { days: 3, label: "3 Days", description: "Short-term outlook" },
  { days: 7, label: "7 Days", description: "Week-ahead outlook" },
  { days: 30, label: "1 Month", description: "Month-ahead outlook" },
];

export function ForecastSection() {
  const { settings } = useSettings();
  const currency = settings.currency;
  const [horizon, setHorizon] = useState(7);

  const history = useApi(() => api.history(2000));
  const forecast = useApi(() => api.forecast(horizon), [horizon]);

  const selected = HORIZONS.find((item) => item.days === horizon)!;

  const historyForChart = history.data?.data ?? [];

  const tableData = useMemo(() => forecast.data?.predictions ?? [], [forecast.data]);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Sparkles className="h-4 w-4" />}
        title="AI Price Forecast"
        subtitle="The XGBoost model recursively predicts future gold closing prices from the latest available data."
        actions={
          <div className="flex items-center gap-2">
            {HORIZONS.map((item) => (
              <button
                key={item.days}
                onClick={() => setHorizon(item.days)}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                  horizon === item.days
                    ? "bg-gradient-brand text-white shadow-md shadow-sky-500/25"
                    : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:ring-sky-300 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        }
      />

      {forecast.error && (
        <ErrorState message={friendlyError(forecast.error)} onRetry={forecast.retry} />
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title={`${selected.label} Forecast`}
            description="Historical prices vs AI-predicted values (dashed segment starts at the forecast origin)."
            actions={
              forecast.data ? (
                <Badge variant="trend" trend={forecast.data.trend.trend} dot>
                  {forecast.data.trend.trend}
                </Badge>
              ) : (
                forecast.loading && <Spinner />
              )
            }
          />
          <CardContent className="pt-4">
            {forecast.loading && !forecast.data ? (
              <div className="h-96 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ) : forecast.error ? (
              <ErrorState message={friendlyError(forecast.error)} onRetry={forecast.retry} />
            ) : forecast.data && historyForChart.length > 0 ? (
              <ForecastChart history={historyForChart} forecast={forecast.data.predictions} />
            ) : (
              <p className="py-16 text-center text-sm text-slate-400">
                No forecast data available yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Forecast Statistics"
            actions={<CalendarDays className="h-4 w-4 text-sky-500" />}
          />
          <CardContent className="space-y-3 pt-4">
            {forecast.loading && !forecast.data ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            ) : forecast.data ? (
              <>
                <StatRow label="Horizon" value={`${selected.label} (${selected.days} trading days)`} />
                <StatRow label="Expected change" value={formatPercent(forecast.data.trend.expected_change_pct)} highlight />
                <StatRow
                  label="Highest predicted"
                  value={formatPrice(forecast.data.trend.highest_price, currency)}
                />
                <StatRow
                  label="Lowest predicted"
                  value={formatPrice(forecast.data.trend.lowest_price, currency)}
                />
                <StatRow
                  label="Average predicted"
                  value={formatPrice(forecast.data.trend.average_price, currency)}
                />
                <div className="pt-2">
                  <StatRow
                    label="Prediction model"
                    value={forecast.data.model_name}
                    valueClassName="text-sky-600 dark:text-sky-400"
                  />
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Forecast Table"
          description="AI Forecast / Estimated Price — each row is an estimate, not a guaranteed future price."
        />
        <CardContent className="pt-4">
          {forecast.loading && !forecast.data ? (
            <div className="space-y-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="h-9 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                    <th className="px-3 py-2.5 font-medium">Date</th>
                    <th className="px-3 py-2.5 font-medium">Predicted Price</th>
                    <th className="px-3 py-2.5 font-medium">Change</th>
                    <th className="px-3 py-2.5 font-medium">Change %</th>
                    <th className="px-3 py-2.5 font-medium">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                  {tableData.map((point) => {
                    const styles = trendBadgeStyles(point.trend);
                    return (
                      <tr key={point.date} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="whitespace-nowrap px-3 py-2.5 font-medium text-slate-700 dark:text-slate-200">
                          {formatDate(point.date)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 font-semibold tabular-nums text-slate-900 dark:text-white">
                          {formatPrice(point.predicted_price, currency)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">
                          <span className={cn("font-medium", point.change > 0 ? "text-emerald-600 dark:text-emerald-400" : point.change < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-500")}>
                            {point.change > 0 ? "+" : ""}
                            {point.change}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-500 dark:text-slate-400">
                          {formatPercent(point.change_pct)}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge variant="trend" trend={point.trend} dot className={styles.className}>
                            {point.trend}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-5">
          <InfoNotice
            icon={<Info className="h-4 w-4" />}
            message="GoldSense AI forecasts are estimates generated from historical and market data. They are not guaranteed future prices or financial advice."
          />
          {forecast.data && (
            <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-500">{forecast.data.methodology}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatRow({
  label,
  value,
  highlight,
  valueClassName,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 dark:bg-slate-800/50">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100",
          highlight && "text-sky-600 dark:text-sky-400",
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}