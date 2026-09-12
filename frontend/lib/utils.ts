export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(value: number, currency: string = "USD"): string {
  const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", JPY: "¥" };
  const symbol = symbols[currency] ?? "$";
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

export function formatPercent(value: number, digits = 2): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = {}): string {
  if (!iso) return "—";
  return new Date(iso.slice(0, 10) + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...opts,
  });
}

export function formatCompactDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso.slice(0, 10) + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function trendBadgeStyles(trend: string): { label: string; className: string; dot: string } {
  const key = trend.toLowerCase();
  if (key.startsWith("bull") || key === "increase") {
    return {
      label: trend === "increase" ? "Increase" : trend,
      className: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
      dot: "bg-emerald-500",
    };
  }
  if (key.startsWith("bear") || key === "decrease") {
    return {
      label: trend === "decrease" ? "Decrease" : trend,
      className: "bg-rose-50 text-rose-600 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20",
      dot: "bg-rose-500",
    };
  }
  return {
    label: trend === "flat" ? "Flat" : trend,
    className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
    dot: "bg-slate-400",
  };
}

export function downloadCsv(filename: string, rows: Array<Record<string, unknown>>): void {
  const header = Object.keys(rows[0] || {});
  const escape = (value: unknown) => {
    const raw = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
  };
  const lines = [
    header.join(","),
    ...rows.map((row) => header.map((key) => escape(row[key])).join(",")),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}