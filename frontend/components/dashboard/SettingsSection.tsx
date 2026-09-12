"use client";

import { Check, Palette, RotateCcw, Settings2, SunMoon } from "lucide-react";
import { api, friendlyError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useApi } from "@/hooks/useApi";
import {
  chartAccentColors,
  currencySymbols,
  useSettings,
} from "@/components/SettingsProvider";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ErrorState, InfoNotice } from "@/components/ui/StateBlock";
import { FormSelect, Toggle } from "@/components/ui/Form";
import type { Appearance, ChartAccent, CurrencyCode } from "@/types";

const CURRENCY_OPTIONS = (["USD", "EUR", "GBP"] as CurrencyCode[]).map((code) => ({
  value: code,
  label: `${code} (${currencySymbols[code]})`,
}));

const ACCENT_OPTIONS: Array<{ id: ChartAccent; label: string; swatch: string }> = [
  { id: "blue", label: "Sky Blue", swatch: "#3390ff" },
  { id: "purple", label: "Purple", swatch: "#8b4df4" },
  { id: "teal", label: "Teal", swatch: "#14b8a6" },
];

export function SettingsSection() {
  const { settings, updateSettings, resetSettings, currencySymbol } = useSettings();
  const health = useApi(() => api.health());

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Settings2 className="h-4 w-4" />}
        title="Settings"
        subtitle="Personalize the dashboard appearance and display preferences. No authentication — everything applies instantly."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Display"
            description="How prices and charts are presented across the dashboard."
            actions={<Palette className="h-4 w-4 text-sky-500" />}
          />
          <CardContent className="space-y-5 pt-4">
            <FormSelect
              label="Preferred currency display"
              value={settings.currency}
              onChange={(value) => updateSettings({ currency: value as CurrencyCode })}
              options={CURRENCY_OPTIONS}
              hint={`Prices are shown with the ${settings.currency} symbol (e.g. ${currencySymbol}9,999.99). Values remain in the dataset's native USD terms — this only changes the displayed symbol.`}
            />

            <div>
              <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">Chart accent color</span>
              <div className="flex flex-wrap gap-2">
                {ACCENT_OPTIONS.map((option) => {
                  const active = settings.chartAccent === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => updateSettings({ chartAccent: option.id })}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                        active
                          ? "border-transparent bg-sky-50 text-slate-900 shadow-sm ring-2 ring-sky-400/50 dark:bg-slate-800 dark:text-white"
                          : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400",
                      )}
                    >
                      <span className="h-4 w-4 rounded-full" style={{ backgroundColor: option.swatch }} />
                      {option.label}
                      {active && <Check className="h-3.5 w-3.5 text-sky-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
              <Toggle
                checked={settings.appearance === "dark"}
                onChange={(checked) =>
                  updateSettings({ appearance: (checked ? "dark" : "light") as Appearance })
                }
                label="Dark appearance"
                description="Switch between light and dark dashboard themes."
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                <SunMoon className="mr-1 inline h-3.5 w-3.5" /> Theme is applied consistently across all pages.
              </span>
              <Button variant="outline" size="sm" onClick={resetSettings}>
                <RotateCcw className="h-3.5 w-3.5" /> Reset to defaults
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="System Status"
            description="Backend, model and dataset information for this deployment."
            actions={<Badge variant={health.data?.status === "ok" ? "success" : "warning"}>
              {health.data ? health.data.status : "checking…"}
            </Badge>}
          />
          <CardContent className="space-y-3 pt-4">
            {health.loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            ) : health.error ? (
              <ErrorState message={friendlyError(health.error)} onRetry={health.retry} />
            ) : health.data ? (
              <>
                <SystemRow label="Service" value={health.data.service} />
                <SystemRow label="API version" value={`v${health.data.version}`} />
                <SystemRow label="Database status" value={health.data.database} />
                <SystemRow label="Database backend" value={health.data.database_backend} />
                <SystemRow label="Dataset records" value={health.data.dataset_records.toLocaleString()} />
                <SystemRow label="Model available" value={health.data.model_available ? "Yes" : "No"} />
                {health.data.last_trained_at && (
                  <SystemRow
                    label="Last trained"
                    value={new Date(health.data.last_trained_at).toLocaleString()}
                  />
                )}
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <InfoNotice message="Settings are saved locally in your browser (localStorage). They never leave your device and require no account." />
    </div>
  );
}

function SystemRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 dark:bg-slate-800/50">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">{value}</span>
    </div>
  );
}