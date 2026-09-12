"use client";

import { Info, Sparkles } from "lucide-react";
import { api, friendlyError } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ErrorState, InfoNotice, EmptyState } from "@/components/ui/StateBlock";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { FeatureImportanceChart } from "@/components/charts/FeatureImportanceChart";

const TOP_COUNT = 10;

export function FeatureImportanceSection() {
  const importance = useApi(() => api.featureImportance());

  const topItems = importance.data?.items.slice(0, TOP_COUNT) ?? [];
  const depth = Math.max(...topItems.map((item) => item.relative_importance), 0);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Sparkles className="h-4 w-4" />}
        title="Feature Importance"
        subtitle={`Which inputs drive the ${importance.data?.model_name ?? "XGBoost"} model's predictions`}
        actions={
          importance.data ? <Badge variant="info">{importance.data.items.length} features</Badge> : null
        }
      />

      {importance.error ? (
        <ErrorState message={friendlyError(importance.error)} onRetry={importance.retry} />
      ) : importance.loading && !importance.data ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CardSkeleton lines={9} />
          <CardSkeleton lines={9} />
        </div>
      ) : importance.data ? (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Relative Importance" description="Sorted from most to least important (top 15 shown)." />
              <CardContent className="pt-4">
                <FeatureImportanceChart data={importance.data} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                title={`Top ${TOP_COUNT} Features`}
                description="Share of the model's total importance used by each feature."
              />
              <CardContent className="pt-4">
                <div className="space-y-2.5">
                  {topItems.map((item, index) => (
                    <div key={item.feature} className="group">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          <span className="mr-2 text-slate-400">{index + 1}.</span>
                          {item.feature}
                        </span>
                        <span className="tabular-nums font-semibold text-slate-500 dark:text-slate-400">
                          {item.relative_importance.toFixed(2)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-brand transition-all duration-700"
                          style={{ width: `${(item.relative_importance / depth) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="space-y-3 pt-5">
              <div className="flex items-start gap-2.5">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {importance.data.explanation}
                </p>
              </div>
              <InfoNotice message="Typical top drivers include previous closing prices, moving averages, momentum and volatility indicators, and market signals such as the USD index and oil. Feature importance reflects how the trained model weighted each input during prediction." />
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState message="Feature importance is unavailable. Run the training pipeline." />
      )}
    </div>
  );
}