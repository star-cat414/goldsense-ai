"use client";

import { CheckCircle2, Scale, Trophy } from "lucide-react";
import { api, friendlyError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useApi } from "@/hooks/useApi";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ErrorState, InfoNotice, EmptyState } from "@/components/ui/StateBlock";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { ComparisonChart } from "@/components/charts/ComparisonChart";

export function ModelComparisonSection() {
  const comparison = useApi(() => api.comparison());

  const better =
    comparison.data?.better_model === comparison.data?.primary_model
      ? "primary"
      : comparison.data?.better_model === comparison.data?.baseline_model
        ? "baseline"
        : null;

  const metrics: Array<{ label: string; key: "MAE" | "RMSE" | "MAPE" | "R2"; lowerBetter?: boolean; hint: string }> = [
    { label: "MAE", key: "MAE", lowerBetter: true, hint: "Mean Absolute Error" },
    { label: "RMSE", key: "RMSE", lowerBetter: true, hint: "Root Mean Squared Error" },
    { label: "MAPE", key: "MAPE", lowerBetter: true, hint: "Mean Absolute Percentage Error (%)" },
    { label: "R² Score", key: "R2", hint: "Coefficient of determination (higher is better)" },
  ];

  const bestValue = (key: "MAE" | "RMSE" | "MAPE" | "R2", model: string | undefined) => {
    if (!comparison.data) return false;
    return model === comparison.data.better_model;
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Scale className="h-4 w-4" />}
        title="Model Comparison"
        subtitle="XGBoost Regressor vs Linear Regression evaluated on the identical walk-forward test period."
      />

      {comparison.error ? (
        <ErrorState message={friendlyError(comparison.error)} onRetry={comparison.retry} />
      ) : comparison.loading && !comparison.data ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CardSkeleton lines={8} />
          <CardSkeleton lines={8} />
        </div>
      ) : comparison.data ? (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader
                title="Evaluation Results"
                description={`Test window ${comparison.data.test_period.start} → ${comparison.data.test_period.end} (${comparison.data.test_period.records} points). Values come from actual model evaluation.`}
                actions={
                  <Badge variant="info">Primary Model: {comparison.data.primary_model}</Badge>
                }
              />
              <CardContent className="overflow-x-auto pt-4">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                      <th className="px-3 py-2.5 font-medium">Metric</th>
                      <th className="px-3 py-2.5 font-medium">{comparison.data.XGBoost.model_name}</th>
                      <th className="px-3 py-2.5 font-medium">{comparison.data.Linear_Regression.model_name}</th>
                      <th className="px-3 py-2.5 font-medium">Better</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                    {metrics.map((metric) => {
                      const xgbBest = bestValue(metric.key, comparison.data?.primary_model);
                      const lrBest = bestValue(metric.key, comparison.data?.baseline_model);
                      return (
                        <tr key={metric.key} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                          <td className="px-3 py-2.5">
                            <span className="font-medium text-slate-700 dark:text-slate-200">{metric.label}</span>
                            <span className="ml-2 hidden text-xs text-slate-400 sm:inline">{metric.hint}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            <Cell value={comparison.data!.XGBoost[metric.key]} best={xgbBest} />
                          </td>
                          <td className="px-3 py-2.5">
                            <Cell value={comparison.data!.Linear_Regression[metric.key]} best={lrBest} />
                          </td>
                          <td className="px-3 py-2.5">
                            {xgbBest && (
                              <Badge variant="info">
                                <Trophy className="h-3 w-3" /> {comparison.data!.XGBoost.model_name}
                              </Badge>
                            )}
                            {lrBest && (
                              <Badge variant="info">
                                <Trophy className="h-3 w-3" /> {comparison.data!.Linear_Regression.model_name}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                title="Model Performance"
                description="MAE and RMSE (lower is better)"
                actions={
                  <Badge variant="success" dot>
                    Best: {comparison.data.better_model}
                  </Badge>
                }
              />
              <CardContent className="pt-4">
                <ComparisonChart comparison={comparison.data} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="space-y-3 pt-5">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {comparison.data.comparison_basis}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {comparison.data.model_selection_policy}
                  </p>
                </div>
              </div>
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                Evaluation method: {comparison.data.evaluation_method}
              </p>
              <InfoNotice message="Both models are trained and evaluated chronologically. No future information is ever used to predict an earlier date, and no random shuffling is applied." />
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState message="Model comparison results are unavailable. Run the training pipeline." />
      )}
    </div>
  );
}

function Cell({ value, best }: { value: number; best: boolean }) {
  return (
    <span
      className={cn(
        "font-semibold tabular-nums text-slate-800 dark:text-slate-100",
        best && "text-sky-600 dark:text-sky-400",
      )}
    >
      {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
    </span>
  );
}