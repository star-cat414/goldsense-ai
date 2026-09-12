"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useChartTheme } from "@/components/charts/ChartTheme";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { useSettings } from "@/components/SettingsProvider";
import { formatPrice } from "@/lib/utils";

export function Sparkline({
  data,
  height = 220,
  showAxes = false,
}: {
  data: number[];
  height?: number;
  showAxes?: boolean;
}) {
  const theme = useChartTheme();
  const { settings, accent } = useSettings();

  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent.stroke} stopOpacity={0.25} />
            <stop offset="100%" stopColor={accent.stroke} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        {showAxes && (
          <>
            <XAxis dataKey="index" hide />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: theme.axis, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={60}
              tickFormatter={(value: number) => formatPrice(Number(value), settings.currency)}
            />
          </>
        )}
        <Tooltip
          content={({ active, payload, label }) => (
            <ChartTooltip
              active={active as never}
              label={label as never}
              title={`Point ${String(label)}`}
              rows={[{ name: "Price", value: payload?.[0]?.payload?.value, color: accent.stroke }]}
              valueFormatter={(value) => formatPrice(value, settings.currency)}
            />
          )}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={accent.stroke}
          strokeWidth={2}
          fill="url(#sparkFill)"
          dot={false}
          activeDot={{ r: 4 }}
          animationDuration={700}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}