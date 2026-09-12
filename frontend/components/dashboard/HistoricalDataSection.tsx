"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  Search,
} from "lucide-react";
import { api, friendlyError } from "@/lib/api";
import { cn, downloadCsv, formatDate, formatPrice } from "@/lib/utils";
import { useApi } from "@/hooks/useApi";
import { useSettings } from "@/components/SettingsProvider";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ErrorState, EmptyState } from "@/components/ui/StateBlock";
import type { GoldPrice } from "@/types";

type SortKey = "date" | "open" | "high" | "low" | "close" | "volume";
type SortDirection = "asc" | "desc";

const COLUMNS: Array<{ key: SortKey; label: string; align?: string }> = [
  { key: "date", label: "Date" },
  { key: "open", label: "Open", align: "text-right" },
  { key: "high", label: "High", align: "text-right" },
  { key: "low", label: "Low", align: "text-right" },
  { key: "close", label: "Close", align: "text-right" },
  { key: "volume", label: "Volume", align: "text-right" },
];

export function HistoricalDataSection() {
  const { settings } = useSettings();
  const currency = settings.currency;
  const history = useApi(() => api.history(2000));

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const rows = useMemo(() => history.data?.data ?? [], [history.data]);

  const filtered = useMemo(() => {
    let result = rows;
    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter((row) => {
        return (
          row.date.includes(query) ||
          String(row.close).startsWith(query) ||
          String(row.volume ?? "").includes(query)
        );
      });
    }
    if (fromDate) result = result.filter((row) => row.date >= fromDate);
    if (toDate) result = result.filter((row) => row.date <= toDate);
    return result;
  }, [rows, search, fromDate, toDate]);

  const sorted = useMemo(() => {
    const direction = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const left = a[sortKey] ?? 0;
      const right = b[sortKey] ?? 0;
      if (left < right) return -1 * direction;
      if (left > right) return 1 * direction;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  const handleExport = () => {
    downloadCsv(
      `goldsense-historical-gold-data-${new Date().toISOString().slice(0, 10)}.csv`,
      sorted.map((row) => ({
        Date: row.date,
        Open: row.open,
        High: row.high,
        Low: row.low,
        Close: row.close,
        Volume: row.volume ?? "",
      })),
    );
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Database className="h-4 w-4" />}
        title="Historical Data"
        subtitle={`Search, filter and export the ${history.data?.total ?? "—"} gold price records stored in the database.`}
        actions={
          <Button variant="outline" size="sm" onClick={handleExport} disabled={sorted.length === 0}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <Card>
        <CardHeader title="Price Records" description="Date, OHLC and volume for every trading day in the dataset." />
        <CardContent className="pt-4">
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search date, close or volume…"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 shadow-sm transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">From date</span>
              <input
                type="date"
                value={fromDate}
                onChange={(event) => {
                  setFromDate(event.target.value);
                  setPage(1);
                }}
                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">To date</span>
              <input
                type="date"
                value={toDate}
                onChange={(event) => {
                  setToDate(event.target.value);
                  setPage(1);
                }}
                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>
            <div className="flex items-end gap-2">
              <label className="block flex-1">
                <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Rows per page</span>
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(1);
                  }}
                  className="h-9 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-sky-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  {[10, 25, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size} rows
                    </option>
                  ))}
                </select>
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setFromDate("");
                  setToDate("");
                  setPage(1);
                }}
              >
                Clear
              </Button>
            </div>
          </div>

          {history.loading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : history.error ? (
            <ErrorState message={friendlyError(history.error)} onRetry={history.retry} />
          ) : sorted.length === 0 ? (
            <EmptyState title="No matching records" message="Adjust the search query or date filters to see results." />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40">
                      {COLUMNS.map((column) => (
                        <th key={column.key} className="px-3 py-2.5">
                          <button
                            onClick={() => handleSort(column.key)}
                            className={cn(
                              "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors",
                              column.align === "text-right" && "float-right",
                              sortKey === column.key
                                ? "text-sky-600 dark:text-sky-400"
                                : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300",
                            )}
                          >
                            {column.label}
                            {sortKey === column.key ? (
                              sortDir === "asc" ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-50" />
                            )}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                    {pageRows.map((row) => (
                      <tr key={row.date} className="transition-colors hover:bg-sky-50/40 dark:hover:bg-slate-800/40">
                        <td className="whitespace-nowrap px-3 py-2.5 font-medium text-slate-700 dark:text-slate-200">
                          {formatDate(row.date)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-300">
                          {formatPrice(row.open, currency)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-300">
                          {formatPrice(row.high, currency)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-300">
                          {formatPrice(row.low, currency)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums text-slate-900 dark:text-white">
                          {formatPrice(row.close, currency)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-slate-500 dark:text-slate-400">
                          {row.volume != null ? row.volume.toLocaleString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <Badge variant="default">
                  {sorted.length.toLocaleString()} records
                  {(search || fromDate || toDate) && ` · filtered${filtered.length !== rows.length ? ` from ${rows.length.toLocaleString()}` : ""}`}
                </Badge>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={safePage <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Page {safePage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}