import type {
  FeatureImportanceResponse,
  ForecastResponse,
  HealthResponse,
  HistoryResponse,
  LatestPrice,
  ModelComparison,
  StatisticsResponse,
  TrendResponse,
} from "@/types";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export class ApiError extends Error {
  status: number;
  detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export function friendlyError(error: unknown): string {
  if (error instanceof ApiError) return error.detail || error.message;
  return "Unable to reach the GoldSense AI API. Please make sure the backend is running.";
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (error) {
    throw new ApiError(0, "Network request failed", "Unable to reach the GoldSense AI API.");
  }

  if (!response.ok) {
    let detail: string | undefined;
    try {
      const body = await response.json();
      detail = typeof body.detail === "string" ? body.detail : undefined;
    } catch {
      detail = undefined;
    }
    throw new ApiError(response.status, `Request failed with status ${response.status}`, detail);
  }

  return (await response.json()) as T;
}

function withQuery(path: string, params: Record<string, string | number | undefined>): string {
  const url = new URL(path, "http://localhost");
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return `${url.pathname}${url.search}`;
}

export const api = {
  health: (signal?: AbortSignal) => request<HealthResponse>("/health", signal),
  latestPrice: (signal?: AbortSignal) => request<LatestPrice>("/gold/latest", signal),
  history: (limit = 2000, start?: string, end?: string, signal?: AbortSignal) =>
    request<HistoryResponse>(withQuery("/gold/history", { limit, start, end }), signal),
  forecast: (days: number, signal?: AbortSignal) =>
    request<ForecastResponse>(withQuery("/forecast", { days }), signal),
  comparison: (signal?: AbortSignal) => request<ModelComparison>("/models/comparison", signal),
  featureImportance: (signal?: AbortSignal) =>
    request<FeatureImportanceResponse>("/models/feature-importance", signal),
  trend: (horizon = 7, signal?: AbortSignal) =>
    request<TrendResponse>(withQuery("/analytics/trend", { horizon }), signal),
  statistics: (signal?: AbortSignal) => request<StatisticsResponse>("/analytics/statistics", signal),
};