"use client";

import { useSettings } from "@/components/SettingsProvider";

export interface ChartTheme {
  axis: string;
  grid: string;
  tooltipBg: string;
  tooltipBorder: string;
  cursor: string;
}

export function useChartTheme(): ChartTheme {
  const { settings } = useSettings();
  const dark = settings.appearance === "dark";
  return {
    axis: dark ? "#94a3b8" : "#64748b",
    grid: dark ? "#293449" : "#e2e8f0",
    tooltipBg: dark ? "rgba(15, 23, 42, 0.96)" : "rgba(255, 255, 255, 0.96)",
    tooltipBorder: dark ? "#334155" : "#e2e8f0",
    cursor: dark ? "rgba(139, 77, 244, 0.12)" : "rgba(51, 144, 255, 0.08)",
  };
}

export function formatAxisDate(iso: string): string {
  return new Date(iso.slice(0, 10) + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: iso.slice(0, 4) === new Date().getFullYear().toString() ? undefined : "2-digit",
  });
}