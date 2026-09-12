"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { AppSettings, ChartAccent, CurrencyCode } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";

const SETTINGS_KEY = "goldsense-settings";

export const chartAccentColors: Record<ChartAccent, { stroke: string; gradient: [string, string]; soft: string }> = {
  blue: {
    stroke: "#3390ff",
    gradient: ["#3390ff", "#8b4df4"],
    soft: "rgba(51, 144, 255, 0.16)",
  },
  purple: {
    stroke: "#8b4df4",
    gradient: ["#8b4df4", "#3390ff"],
    soft: "rgba(139, 77, 244, 0.16)",
  },
  teal: {
    stroke: "#14b8a6",
    gradient: ["#14b8a6", "#3390ff"],
    soft: "rgba(20, 184, 166, 0.16)",
  },
};

export const currencySymbols: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};

interface SettingsContextValue {
  settings: AppSettings;
  currencySymbol: string;
  accent: (typeof chartAccentColors)[ChartAccent];
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<AppSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.appearance === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [settings.appearance]);

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      setSettings((current) => (current ? { ...current, ...patch } : { ...DEFAULT_SETTINGS, ...patch }));
    },
    [setSettings],
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, [setSettings]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      currencySymbol: currencySymbols[settings.currency] ?? "$",
      accent: chartAccentColors[settings.chartAccent] ?? chartAccentColors.blue,
      updateSettings,
      resetSettings,
    }),
    [settings, updateSettings, resetSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider.");
  }
  return context;
}