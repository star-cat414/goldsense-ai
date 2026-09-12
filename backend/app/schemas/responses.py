from datetime import date, datetime

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    database: str
    database_backend: str
    dataset_records: int
    model_available: bool
    last_trained_at: str | None


class GoldPrice(BaseModel):
    date: date
    open: float
    high: float
    low: float
    close: float
    volume: float | None = None


class LatestPriceResponse(GoldPrice):
    previous_close: float
    daily_change: float
    daily_change_pct: float


class HistoryResponse(BaseModel):
    total: int
    limit: int
    offset: int
    data: list[GoldPrice]


class ForecastPoint(BaseModel):
    date: date
    predicted_price: float
    change: float
    change_pct: float
    trend: str


class ForecastStatistics(BaseModel):
    highest_price: float
    lowest_price: float
    average_price: float
    overall_change: float
    overall_change_pct: float


class TrendAnalysis(BaseModel):
    trend: str
    rules: list[str]
    latest_price: float
    forecasted_price: float
    expected_change_pct: float
    highest_price: float
    lowest_price: float
    average_price: float


class ForecastResponse(BaseModel):
    horizon: int
    generated_at: datetime
    model_name: str
    methodology: str
    disclaimer: str = Field(
        default="GoldSense AI forecasts are estimates generated from historical and market data. "
        "They are not guaranteed future prices or financial advice."
    )
    predictions: list[ForecastPoint]
    statistics: ForecastStatistics
    trend: TrendAnalysis


class ModelMetric(BaseModel):
    model_name: str
    MAE: float
    RMSE: float
    MAPE: float
    R2: float


class ModelComparisonResponse(BaseModel):
    evaluation_method: str
    test_period: dict
    XGBoost: ModelMetric
    Linear_Regression: ModelMetric
    better_model: str
    comparison_basis: str
    primary_model: str
    baseline_model: str
    model_selection_policy: str


class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float
    relative_importance: float


class FeatureImportanceResponse(BaseModel):
    model_name: str
    explanation: str
    items: list[FeatureImportanceItem]


class TrendResponse(BaseModel):
    trend: str
    rules: list[str]
    latest_price: float
    forecasted_price: float
    expected_change_pct: float
    highest_price: float
    lowest_price: float
    average_price: float
    horizon: int


class StatisticsResponse(BaseModel):
    dataset_records: int
    period_start: date
    period_end: date
    latest_price: float
    minimum_close: float
    maximum_close: float
    mean_close: float
    median_close: float
    std_close: float
    avg_daily_change: float
    max_daily_change: float
    min_daily_change: float
    avg_daily_volume: float | None = None
    observations: dict


class SettingsView(BaseModel):
    database_backend: str
    primary_model: str
    baseline_model: str
    model_version: str
    forecast_horizons: list[int]
    disclaimer: str = Field(
        default="GoldSense AI forecasts are estimates generated from historical and market data. "
        "They are not guaranteed future prices or financial advice."
    )