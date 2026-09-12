"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTheme } from "@/components/charts/ChartTheme";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { useSettings } from "@/components/SettingsProvider";
import type { FeatureImportanceResponse } from "@/types";

const MAX_BARS = 15;

interface FeatureImportanceChartProps {
  data: FeatureImportanceResponse;
  height?: number;
}

export function FeatureImportanceChart({ data, height = 420 }: FeatureImportanceChartProps) {
  const theme = useChartTheme();
  const { accent } = useSettings();

  const items = [...data.items].slice(0, MAX_BARS).reverse();
  const chartData = items.map((item) => ({
    feature: item.feature,
    importance: item.relative_importance,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="0" stroke={theme.grid} horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fill: theme.axis, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          unit="%"
        />
        <YAxis
          type="category"
          dataKey="feature"
          tick={{ fill: theme.axis, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={130}
        />
        <Tooltip
          cursor={{ fill: theme.cursor }}
          content={({ active, payload, label }) => (
            <ChartTooltip
              active={active as never}
              label={label as never}
              title={String(label)}
              rows={[
                { name: "Relative importance", value: `${Number(payload?.[0]?.value ?? 0).toFixed(2)}%`, color: accent.stroke },
              ]}
            />
          )}
        />
        <Bar dataKey="importance" radius={[0, 6, 6, 0]} maxBarSize={20} animationDuration={700}>
          {chartData.map((entry, index) => (
            <Cell
              key={entry.feature}
              fill={index === chartData.length - 1 ? accent.gradient[1] : accent.stroke}
              fillOpacity={0.55 + (index / chartData.length) * 0.45}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}