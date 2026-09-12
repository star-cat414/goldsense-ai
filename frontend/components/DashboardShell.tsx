"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Coins,
  Database,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Scale,
  Settings,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OverviewSection } from "@/components/dashboard/OverviewSection";
import { GoldPriceSection } from "@/components/dashboard/GoldPriceSection";
import { ForecastSection } from "@/components/dashboard/ForecastSection";
import { MarketTrendSection } from "@/components/dashboard/MarketTrendSection";
import { ModelComparisonSection } from "@/components/dashboard/ModelComparisonSection";
import { FeatureImportanceSection } from "@/components/dashboard/FeatureImportanceSection";
import { HistoricalDataSection } from "@/components/dashboard/HistoricalDataSection";
import { SettingsSection } from "@/components/dashboard/SettingsSection";

export type SectionId =
  | "overview"
  | "gold-price"
  | "forecast"
  | "market-trend"
  | "model-comparison"
  | "feature-importance"
  | "historical-data"
  | "settings";

const NAV_ITEMS: Array<{ id: SectionId; label: string; tagline: string; icon: LucideIcon }> = [
  { id: "overview", label: "Overview", tagline: "At-a-glance snapshot", icon: LayoutDashboard },
  { id: "gold-price", label: "Gold Price", tagline: "Historical trends", icon: Activity },
  { id: "forecast", label: "Forecast", tagline: "AI price predictions", icon: Sparkles },
  { id: "market-trend", label: "Market Trend", tagline: "Directional analysis", icon: TrendingUp },
  { id: "model-comparison", label: "Model Comparison", tagline: "XGBoost vs Linear", icon: Scale },
  { id: "feature-importance", label: "Feature Importance", tagline: "What drives the model", icon: Sparkles },
  { id: "historical-data", label: "Historical Data", tagline: "Raw price records", icon: Database },
  { id: "settings", label: "Settings", tagline: "Appearance & display", icon: Settings },
];

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-md shadow-sky-500/25">
        <Coins className="h-5 w-5" />
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">GoldSense AI</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Analytics
          </p>
        </div>
      )}
    </div>
  );
}

export function DashboardShell() {
  const [active, setActive] = useState<SectionId>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeItem = useMemo(() => NAV_ITEMS.find((item) => item.id === active)!, [active]);

  const handleNavigate = (id: SectionId) => {
    setActive(id);
    setDrawerOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside
        className={cn(
          "sticky top-0 z-30 hidden h-screen flex-col border-r border-slate-200/80 bg-white/80 backdrop-blur-xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/70 md:flex",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <div className={cn("flex h-16 items-center border-b border-slate-100 dark:border-slate-800", collapsed ? "justify-center px-0" : "justify-between px-4")}>
          <Brand collapsed={collapsed} />
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="absolute -right-3 top-16 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition-colors hover:text-sky-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="h-3.5 w-3.5" />
          </button>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                title={item.label}
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-gradient-brand text-white shadow-md shadow-sky-500/20"
                    : "text-slate-500 hover:bg-sky-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                )}
              >
                <Icon className={cn("h-[18px] w-[18px] shrink-0", collapsed && "h-5 w-5")} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          {!collapsed ? (
            <div className="rounded-xl bg-gradient-soft p-3 text-xs dark:bg-slate-800/60">
              <p className="font-semibold text-slate-700 dark:text-slate-200">Primary model</p>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">XGBoost Regressor</p>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
                Forecasts are estimates, not financial advice.
              </p>
            </div>
          ) : (
            <Badge variant="info" className="w-full justify-center">XGB</Badge>
          )}
        </div>
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4 dark:border-slate-800">
              <Brand collapsed={false} />
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gradient-brand text-white"
                        : "text-slate-500 hover:bg-sky-50 hover:text-slate-800",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-slate-100 p-4 dark:border-slate-800">
              <p className="text-xs text-slate-400">Primary model: XGBoost</p>
              <p className="mt-1 text-[11px] text-slate-400">Forecasts are estimates, not financial advice.</p>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/70 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70 sm:px-6 md:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
                {activeItem.label}
              </h1>
              <p className="hidden text-xs text-slate-400 dark:text-slate-500 sm:block">{activeItem.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" dot>API Connected</Badge>
            <Badge className="hidden sm:inline-flex">Model v1.0</Badge>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 md:px-8">
          <div key={active} className="animate-fade-in">
            {active === "overview" && <OverviewSection />}
            {active === "gold-price" && <GoldPriceSection />}
            {active === "forecast" && <ForecastSection />}
            {active === "market-trend" && <MarketTrendSection />}
            {active === "model-comparison" && <ModelComparisonSection />}
            {active === "feature-importance" && <FeatureImportanceSection />}
            {active === "historical-data" && <HistoricalDataSection />}
            {active === "settings" && <SettingsSection />}
          </div>
        </main>
      </div>
    </div>
  );
}