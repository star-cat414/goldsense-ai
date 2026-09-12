"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTheme, formatAxisDate } from "@/components/charts/ChartTheme";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { useSettings } from "@/components/SettingsProvider";
import { formatPrice } from "@/lib/utils";
import type { ForecastPoint, GoldPrice } from "@/types";

interface ForecastChartProps {
  history: GoldPrice[];
  forecast: ForecastPoint[];
  height?: number;
}

export function ForecastChart({ history, forecast, height = 380 }: ForecastChartProps) {
  const { settings, accent } = useSettings();
  const theme = useChartTheme();
  const formatCurrency = (value: number) => formatPrice(value, settings.currency);

  const historyTail = history.slice(-120).map((row) => ({
    date: row.date,
    actual: row.close,
    forecast: null as number | null,
  }));

  const splitIndex = historyTail.length;
  const forecastPoints = forecast.map((point) => ({
    date: point.date,
    actual: null as number | null,
    forecast: point.predicted_price,
  }));

  const combined = [...historyTail, ...forecastPoints];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={combined} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent.gradient[1]} stopOpacity={0.3} />
            <stop offset="100%" stopColor={accent.gradient[1]} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="0" stroke={theme.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatAxisDate}
          tick={{ fill: theme.axis, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          minTickGap={42}
        />
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fill: theme.axis, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={76}
          orientation="right"
          tickFormatter={(value: number) => formatPrice(Number(value), settings.currency)}
        />
        <Tooltip
          cursor={{ stroke: accent.stroke, strokeDasharray: "4 4" }}
          content={({ active, payload, label }) => {
            const row = payload?.[0]?.payload as { date: string; actual: number | null; forecast: number | null };
            if (!active || !row) return null;
            const isForecast = row.forecast !== null;
            return (
              <ChartTooltip
                active={true}
                label={label as string}
                timestamp
                title={formatAxisDate(row.date)}
                rows={[
                  ...(isForecast
                    ? [{ name: "AI Forecast", value: row.forecast as number, color: accent.gradient[1] }]
                    : [{ name: "Historical", value: row.actual as number, color: accent.stroke }]),
                ]}
                valueFormatter={formatCurrency}
              />
            );
          }}
        />
        <ReferenceLine
          x={splitIndex > 0 ? combined[splitIndex - 1]?.date : undefined}
          stroke={theme.axis}
          strokeDasharray="6 4"
          label={{
            value: "Forecast starts",
            position: "insideTopRight",
            fill: theme.axis,
            fontSize: 11,
          }}
        />
        <Area
          type="monotone"
          dataKey="actual"
          stroke={accent.stroke}
          strokeWidth={2}
          fill="none"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: theme.tooltipBg }}
          connectNulls={false}
          animationDuration={700}
        />
        <Area
          type="monotone"
          dataKey="forecast"
          stroke={accent.gradient[1]}
          strokeWidth={2}
          strokeDasharray="6 3"
          fill="url(#forecastFill)"
          dot={{ r: 3, fill: accent.gradient[1], stroke: theme.tooltipBg, strokeWidth: 1 }}
          connectNulls={false}
          animationDuration={700}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}