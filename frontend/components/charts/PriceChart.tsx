"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTheme, formatAxisDate } from "@/components/charts/ChartTheme";
import { ChartTooltip, useCurrencyFormatter } from "@/components/charts/ChartTooltip";
import { useSettings } from "@/components/SettingsProvider";
import { formatPrice } from "@/lib/utils";
import type { GoldPrice } from "@/types";
import { cn } from "@/lib/utils";

export type PriceRange = "30D" | "90D" | "6M" | "1Y" | "ALL";

export const PRICE_RANGES: { id: PriceRange; label: string; days: number | null }[] = [
  { id: "30D", label: "30 Days", days: 30 },
  { id: "90D", label: "90 Days", days: 90 },
  { id: "6M", label: "6 Months", days: 182 },
  { id: "1Y", label: "1 Year", days: 365 },
  { id: "ALL", label: "All Data", days: null },
];

interface PriceChartProps {
  data: GoldPrice[];
  showVolume?: boolean;
  height?: number;
}

export function PriceChart({ data, showVolume = true, height = 360 }: PriceChartProps) {
  const { settings, accent } = useSettings();
  const theme = useChartTheme();
  const formatCurrency = useCurrencyFormatter(settings.currency);

  const chartData = data
    .filter((row) => row.close !== null && row.close !== undefined)
    .map((row) => ({
      date: row.date,
      price: row.close,
      volume: (row.volume ?? 0) / 1000,
    }));

  if (chartData.length === 0) {
    return <EmptyChart />;
  }

  const domain = [Math.min(...chartData.map((d) => d.price)), Math.max(...chartData.map((d) => d.price))];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent.stroke} stopOpacity={0.28} />
            <stop offset="100%" stopColor={accent.stroke} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="0" stroke={theme.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatAxisDate}
          tick={{ fill: theme.axis, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          minTickGap={48}
        />
        <YAxis
          domain={domain}
          tick={{ fill: theme.axis, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={70}
          tickFormatter={(value: number) => formatPrice(Number(value), settings.currency)}
          orientation="right"
        />
        <Tooltip
          cursor={{ stroke: accent.stroke, strokeDasharray: "4 4" }}
          content={({ active, payload, label }) => (
            <ChartTooltip
              active={active as never}
              label={label as never}
              timestamp
              title={formatAxisDate(String(label))}
              rows={[
                { name: "Close", value: payload?.[0]?.payload?.price, color: accent.stroke },
                ...(showVolume
                  ? [{ name: "Volume (k)", value: Number(payload?.[0]?.payload?.volume ?? 0).toLocaleString(), color: "#94a3b8" }]
                  : []),
              ]}
              valueFormatter={formatCurrency}
            />
          )}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke={accent.stroke}
          strokeWidth={2}
          fill="url(#priceFill)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: theme.tooltipBg }}
          animationDuration={700}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function EmptyChart() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-slate-400 dark:text-slate-500">
      <div className="text-3xl">📉</div>
      <div>Not enough data for the selected range.</div>
    </div>
  );
}

interface PriceRangeSelectorProps {
  value: PriceRange;
  onChange: (range: PriceRange) => void;
}

export function PriceRangeSelector({ value, onChange }: PriceRangeSelectorProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
      {PRICE_RANGES.map((range) => (
        <button
          key={range.id}
          onClick={() => onChange(range.id)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            value === range.id
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}