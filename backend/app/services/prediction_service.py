import logging
from datetime import date, datetime, timezone
from functools import lru_cache

import numpy as np
import pandas as pd
import xgboost as xgb

from app.config import settings
from app.database import get_session
from app.ml import preprocess
from app.ml.preprocess import MARKET_LEVELS

logger = logging.getLogger(__name__)

TREND_UP = "Increase"
TREND_DOWN = "Decrease"
TREND_FLAT = "Flat"

MARKET_TREND_THRESHOLD_PCT = 0.5

DISCLAIMER = (
    "GoldSense AI forecasts are estimates generated from historical and market data. "
    "They are not guaranteed future prices or financial advice."
)


@lru_cache(maxsize=1)
def load_xgboost_model():
    model = xgb.XGBRegressor()
    model.load_model(str(settings.xgb_model_file))
    params = dict(model.get_params())
    if params.get("objective") is None:
        model.set_params(objective="reg:squarederror")
    return model


def load_feature_names() -> list[str]:
    import json

    payload = json.loads(settings.feature_names_file.read_text(encoding="utf-8"))
    return list(payload["features"])


def _next_business_day(current) -> pd.Timestamp:
    candidate = current + pd.Timedelta(days=1)
    while candidate.weekday() >= 5:
        candidate = candidate + pd.Timedelta(days=1)
    return candidate


def classify_trend(expected_change_pct: float) -> str:
    if expected_change_pct >= MARKET_TREND_THRESHOLD_PCT:
        return "Bullish"
    if expected_change_pct <= -MARKET_TREND_THRESHOLD_PCT:
        return "Bearish"
    return "Neutral"


def trend_rules() -> list[str]:
    return [
        f"Overall expected change is computed as (last predicted price - latest observed close) / latest observed close * 100.",
        f"The market is classified Bullish when the expected change is >= +{MARKET_TREND_THRESHOLD_PCT}%.",
        f"The market is classified Bearish when the expected change is <= -{MARKET_TREND_THRESHOLD_PCT}%.",
        "Anywhere in between is classified Neutral.",
        "The classification is rule-based and transparent; it describes the model's expectation, not a guarantee.",
    ]


def build_base_series() -> pd.DataFrame:
    raw = preprocess.load_raw()
    available_market = [c for c in MARKET_LEVELS if c in raw.columns]
    keep = ["Date", "Open", "High", "Low", "Close", "Volume", *available_market]
    series = raw[keep].copy()
    series["Date"] = pd.to_datetime(series["Date"])
    return series


def _feature_vector(series: pd.DataFrame, feature_names: list[str]) -> np.ndarray:
    featured, _, _ = preprocess.engineer_features(series)
    last_row = featured.iloc[-1]
    values = last_row[feature_names].astype(float).to_numpy().reshape(1, -1)
    if not np.isfinite(values).all():
        raise ValueError("Incomplete feature history for the requested forecast origin.")
    return values


def generate_forecast(days: int) -> dict:
    if not 1 <= days <= settings.max_forecast_horizon:
        raise ValueError(f"Forecast horizon must be between 1 and {settings.max_forecast_horizon} days.")

    model = load_xgboost_model()
    feature_names = load_feature_names()

    series = build_base_series()
    if len(series) < settings.warmup_rows:
        raise ValueError("Insufficient historical data to build a forecast.")

    last_volume = float(series["Volume"].iloc[-1]) if pd.notna(series["Volume"].iloc[-1]) else None
    last_volume = last_volume if last_volume is not None else 0.0

    market_cols = [c for c in MARKET_LEVELS if c in series.columns]
    last_market = {col: float(series[col].iloc[-1]) for col in market_cols}

    latest_close = float(series["Close"].iloc[-1])
    generated_at = datetime.now(timezone.utc).replace(tzinfo=None)

    predictions = []
    reference = latest_close
    current_date = pd.Timestamp(series["Date"].iloc[-1])

    for step in range(days):
        pred_date = _next_business_day(current_date)

        x = _feature_vector(series, feature_names)
        predicted = float(model.predict(x)[0])
        if not np.isfinite(predicted) or predicted <= 0:
            predicted = reference

        change = round(predicted - reference, 2)
        change_pct = round((change / reference) * 100, 2) if reference != 0 else 0.0
        direction = TREND_UP if change > 0 else (TREND_DOWN if change < 0 else TREND_FLAT)

        predictions.append(
            {
                "date": pred_date.date(),
                "predicted_price": round(predicted, 2),
                "change": change,
                "change_pct": change_pct,
                "trend": direction,
            }
        )

        new_row = {
            "Date": pred_date,
            "Open": predicted,
            "High": predicted,
            "Low": predicted,
            "Close": predicted,
            "Volume": last_volume,
        }
        new_row.update(last_market)
        series = pd.concat([series, pd.DataFrame([new_row])], ignore_index=True)
        reference = predicted
        current_date = pred_date

    forecasted_price = predictions[-1]["predicted_price"]
    overall_change = round(forecasted_price - latest_close, 2)
    overall_change_pct = round((overall_change / latest_close) * 100, 2) if latest_close else 0.0
    prices = [p["predicted_price"] for p in predictions]

    trend_analysis = {
        "trend": classify_trend(overall_change_pct),
        "rules": trend_rules(),
        "latest_price": round(latest_close, 2),
        "forecasted_price": forecasted_price,
        "expected_change_pct": overall_change_pct,
        "highest_price": round(max(prices), 2),
        "lowest_price": round(min(prices), 2),
        "average_price": round(sum(prices) / len(prices), 2),
    }

    methodology = (
        "Recursive one-day-ahead forecasting: at each step the latest engineered features "
        "(price lags, moving averages, RSI, MACD, Bollinger Bands, date features, and market "
        "indicator lags) are computed from the series as known up to that point, the trained "
        "XGBoost model predicts the next trading-day close, and the prediction is appended to "
        "the series before the next step. Trading days skip weekends; exchange holidays are not "
        "modelled. External market indicators are held at their last observed value because "
        "their future values are unknown at forecast time."
    )

    result = {
        "horizon": days,
        "generated_at": generated_at,
        "model_name": settings.primary_model_name,
        "methodology": methodology,
        "disclaimer": DISCLAIMER,
        "predictions": predictions,
        "statistics": {
            "highest_price": max(prices),
            "lowest_price": min(prices),
            "average_price": round(sum(prices) / len(prices), 2),
            "overall_change": overall_change,
            "overall_change_pct": overall_change_pct,
        },
        "trend": trend_analysis,
    }

    _store_predictions(days, predictions, generated_at)
    return result


def _store_predictions(days: int, predictions: list[dict], generated_at) -> None:
    try:
        session = get_session()
        try:
            from app.models import Prediction

            rows = [
                Prediction(
                    prediction_date=datetime.strptime(p["date"].isoformat(), "%Y-%m-%d").date(),
                    forecast_generated_at=generated_at,
                    horizon=days,
                    predicted_price=p["predicted_price"],
                    percentage_change=p["change_pct"],
                    trend=p["trend"],
                    model_name=settings.primary_model_name,
                )
                for p in predictions
            ]
            session.add_all(rows)
            all_rows = session.query(Prediction).order_by(Prediction.forecast_generated_at.desc(), Prediction.id.desc()).all()
            if len(all_rows) > 500:
                for stale in all_rows[500:]:
                    session.delete(stale)
            session.commit()
        finally:
            session.close()
    except Exception as exc:
        logger.warning("Could not persist forecast history in the database: %s", exc)


def get_market_trend(horizon: int = 7) -> dict:
    forecast = generate_forecast(horizon)
    trend = forecast["trend"]
    trend["horizon"] = horizon
    return trend