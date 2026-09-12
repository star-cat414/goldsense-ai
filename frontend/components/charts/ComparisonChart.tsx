"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTheme } from "@/components/charts/ChartTheme";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import type { ModelComparison } from "@/types";

interface ComparisonChartProps {
  comparison: ModelComparison;
  height?: number;
}

export function ComparisonChart({ comparison, height = 320 }: ComparisonChartProps) {
  const theme = useChartTheme();

  const data = [
    {
      metric: "MAE",
      XGBoost: comparison.XGBoost.MAE,
      LinearRegression: comparison.Linear_Regression.MAE,
    },
    {
      metric: "RMSE",
      XGBoost: comparison.XGBoost.RMSE,
      LinearRegression: comparison.Linear_Regression.RMSE,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="0" stroke={theme.grid} vertical={false} />
        <XAxis dataKey="metric" tick={{ fill: theme.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: theme.axis, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={64}
          tickFormatter={(value: number) => Number(value).toLocaleString()}
        />
        <Tooltip
          cursor={{ fill: theme.cursor }}
          content={({ active, payload, label }) => (
            <ChartTooltip
              active={active as never}
              label={label as never}
              title={`${String(label)} (lower is better)`}
              rows={(payload ?? []).map((entry) => ({
                name: entry.name === "LinearRegression" ? "Linear Regression" : String(entry.name ?? ""),
                value: Number(entry.value).toLocaleString(undefined, { maximumFractionDigits: 1 }),
                color: entry.color,
              }))}
            />
          )}
        />
        <Legend
          formatter={(value) => (value === "LinearRegression" ? "Linear Regression" : "XGBoost")}
          wrapperStyle={{ fontSize: 12, color: theme.axis }}
        />
        <Bar dataKey="XGBoost" fill="#3390ff" radius={[6, 6, 0, 0]} maxBarSize={48} />
        <Bar dataKey="LinearRegression" fill="#8b4df4" radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}