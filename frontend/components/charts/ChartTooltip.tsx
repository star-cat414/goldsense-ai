"use client";

import { formatPrice } from "@/lib/utils";

interface TooltipRow {
  name: string;
  value: number | string;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  labelKey?: string;
  title?: string;
  rows?: TooltipRow[];
  labelFormatter?: (label: string) => string;
  valueFormatter?: (value: number) => string;
  timestamp?: boolean;
}

export function ChartTooltip({
  active,
  label,
  labelKey = "date",
  title,
  rows,
  labelFormatter,
  valueFormatter = (value) => String(value),
  timestamp,
}: ChartTooltipProps) {
  if (!active || !label) return null;

  const formattedLabel = labelFormatter
    ? labelFormatter(String(label))
    : timestamp
      ? new Date(String(label)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : String(label);

  return (
    <div className="rounded-xl border px-3 py-2.5 text-xs shadow-lg backdrop-blur-sm"
      style={{
        backgroundColor: "var(--chart-tooltip-bg)",
        borderColor: "var(--chart-tooltip-border)",
      }}
    >
      <div className="mb-1.5 font-semibold" style={{ color: "var(--chart-axis)" }}>
        {title ?? formattedLabel}
      </div>
      {rows && rows.length > 0 ? (
        <div className="space-y-1">
          {rows.map((row, index) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5">
                {row.color && (
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
                )}
                {row.name}
              </span>
              <span className="font-medium tabular-nums">
                {typeof row.value === "number" ? valueFormatter(row.value) : row.value}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="font-medium tabular-nums">{formattedLabel}</div>
      )}
    </div>
  );
}

export function useCurrencyFormatter(currency: string) {
  return (value: number) => formatPrice(value, currency);
}