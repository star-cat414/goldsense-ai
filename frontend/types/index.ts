export interface GoldPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}

export interface LatestPrice extends GoldPrice {
  previous_close: number;
  daily_change: number;
  daily_change_pct: number;
}

export interface HistoryResponse {
  total: number;
  limit: number;
  offset: number;
  data: GoldPrice[];
}

export interface ForecastPoint {
  date: string;
  predicted_price: number;
  change: number;
  change_pct: number;
  trend: string;
}

export interface ForecastStatistics {
  highest_price: number;
  lowest_price: number;
  average_price: number;
  overall_change: number;
  overall_change_pct: number;
}

export interface TrendAnalysis {
  trend: "Bullish" | "Bearish" | "Neutral";
  rules: string[];
  latest_price: number;
  forecasted_price: number;
  expected_change_pct: number;
  highest_price: number;
  lowest_price: number;
  average_price: number;
}

export interface ForecastResponse {
  horizon: number;
  generated_at: string;
  model_name: string;
  methodology: string;
  disclaimer: string;
  predictions: ForecastPoint[];
  statistics: ForecastStatistics;
  trend: TrendAnalysis;
}

export interface ModelMetric {
  model_name: string;
  MAE: number;
  RMSE: number;
  MAPE: number;
  R2: number;
}

export interface ModelComparison {
  evaluation_method: string;
  test_period: { start: string; end: string; records: number };
  XGBoost: ModelMetric;
  Linear_Regression: ModelMetric;
  better_model: string;
  comparison_basis: string;
  primary_model: string;
  baseline_model: string;
  model_selection_policy: string;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
  relative_importance: number;
}

export interface FeatureImportanceResponse {
  model_name: string;
  explanation: string;
  items: FeatureImportanceItem[];
}

export interface TrendResponse extends TrendAnalysis {
  horizon: number;
}

export interface StatisticsResponse {
  dataset_records: number;
  period_start: string;
  period_end: string;
  latest_price: number;
  minimum_close: number;
  maximum_close: number;
  mean_close: number;
  median_close: number;
  std_close: number;
  avg_daily_change: number;
  max_daily_change: number;
  min_daily_change: number;
  avg_daily_volume: number | null;
  observations: Record<string, number | null>;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  database: string;
  database_backend: string;
  dataset_records: number;
  model_available: boolean;
  last_trained_at: string | null;
}

export type CurrencyCode = "USD" | "EUR" | "GBP";
export type ChartAccent = "blue" | "purple" | "teal";
export type Appearance = "light" | "dark";

export interface AppSettings {
  currency: CurrencyCode;
  chartAccent: ChartAccent;
  appearance: Appearance;
}

export const DEFAULT_SETTINGS: AppSettings = {
  currency: "USD",
  chartAccent: "blue",
  appearance: "light",
};