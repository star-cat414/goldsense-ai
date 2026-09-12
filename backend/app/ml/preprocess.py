from pathlib import Path

import numpy as np
import pandas as pd

from app.config import settings

MARKET_LEVELS = ["usd_index_close", "silver_close", "crude_oil_close", "sp500_close"]

LAG_WINDOWS = [1, 2, 3, 7, 14, 30]
MA_WINDOWS = [7, 14, 30, 50]


def load_raw(path: Path = None) -> pd.DataFrame:
    path = path or settings.raw_dataset_file
    if not path.exists():
        raise FileNotFoundError(f"Raw dataset not found at {path}. Run scripts/download_data.py first.")
    df = pd.read_csv(path)
    df["Date"] = pd.to_datetime(df["Date"])
    df["Close"] = pd.to_numeric(df["Close"], errors="coerce")
    df["Open"] = pd.to_numeric(df["Open"], errors="coerce")
    df["High"] = pd.to_numeric(df["High"], errors="coerce")
    df["Low"] = pd.to_numeric(df["Low"], errors="coerce")
    df = df.sort_values("Date").drop_duplicates(subset=["Date"], keep="last").reset_index(drop=True)
    return df


def _sma(series: pd.Series, window: int) -> pd.Series:
    return series.rolling(window=window).mean()


def _ema(series: pd.Series, span: int) -> pd.Series:
    return series.ewm(span=span, adjust=False).mean()


def _rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(alpha=1 / period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1 / period, adjust=False).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    return rsi.fillna(100)

from app.config import settings as _settings  # noqa: E402


def _pct_change(series: pd.Series, periods: int = 1) -> pd.Series:
    return (series - series.shift(periods)) / series.shift(periods)


def engineer_features(df: pd.DataFrame) -> tuple[pd.DataFrame, list[str], str]:
    feature_df = df.copy()
    close = feature_df["Close"]

    for window in LAG_WINDOWS:
        feature_df[f"close_lag_{window}"] = close.shift(window)

    for window in MA_WINDOWS:
        feature_df[f"MA_{window}"] = _sma(close, window)

    returns = _pct_change(close)
    feature_df["daily_change"] = close.diff()
    feature_df["pct_change"] = returns
    feature_df["rolling_std_7"] = returns.rolling(7).std()
    feature_df["rolling_std_14"] = returns.rolling(14).std()

    feature_df["EMA_12"] = _ema(close, 12)
    feature_df["EMA_26"] = _ema(close, 26)

    macd_line = feature_df["EMA_12"] - feature_df["EMA_26"]
    macd_signal = macd_line.ewm(span=9, adjust=False).mean()
    feature_df["MACD"] = macd_line
    feature_df["MACD_signal"] = macd_signal
    feature_df["MACD_histogram"] = macd_line - macd_signal

    feature_df["RSI_14"] = _rsi(close, 14)

    bb_mid = _sma(close, 20)
    bb_std = close.rolling(20).std()
    feature_df["BB_upper"] = bb_mid + 2 * bb_std
    feature_df["BB_lower"] = bb_mid - 2 * bb_std
    feature_df["BB_width"] = (feature_df["BB_upper"] - feature_df["BB_lower"]) / bb_mid.replace(0, np.nan)
    feature_df["BB_pctB"] = (close - feature_df["BB_lower"]) / (feature_df["BB_upper"] - feature_df["BB_lower"]).replace(0, np.nan)

    for col in MARKET_LEVELS:
        feature_df[col] = pd.to_numeric(feature_df[col], errors="coerce")

    for col in MARKET_LEVELS:
        feature_df[f"{col}_pct_1"] = _pct_change(feature_df[col], 1)

    feature_df["Volume"] = pd.to_numeric(feature_df.get("Volume"), errors="coerce")
    feature_df["volume_lag_1"] = feature_df["Volume"].shift(1)
    feature_df["volume_pct_1"] = _pct_change(feature_df["Volume"], 1)

    dates = feature_df["Date"]
    feature_df["year"] = dates.dt.year
    feature_df["month"] = dates.dt.month
    feature_df["day"] = dates.dt.day
    feature_df["day_of_week"] = dates.dt.dayofweek
    feature_df["day_of_year"] = dates.dt.dayofyear

    target = "Gold_Close"
    feature_df[target] = feature_df["Close"].shift(-1)

    feature_columns = [
        *[f"close_lag_{w}" for w in LAG_WINDOWS],
        *[f"MA_{w}" for w in MA_WINDOWS],
        "daily_change",
        "pct_change",
        "rolling_std_7",
        "rolling_std_14",
        "EMA_12",
        "EMA_26",
        "MACD",
        "MACD_signal",
        "MACD_histogram",
        "RSI_14",
        "BB_upper",
        "BB_lower",
        "BB_width",
        "BB_pctB",
        *[f"{col}_pct_1" for col in MARKET_LEVELS],
        "volume_lag_1",
        "volume_pct_1",
        "year",
        "month",
        "day",
        "day_of_week",
        "day_of_year",
    ]

    keep_cols = ["Date", "Open", "High", "Low", "Close", "Volume", *feature_columns, target]
    feature_df = feature_df[[c for c in keep_cols if c in feature_df.columns]]

    feature_columns = [c for c in feature_columns if c in feature_df.columns]

    feature_df[feature_columns] = feature_df[feature_columns].replace([np.inf, -np.inf], np.nan)

    return feature_df, feature_columns, target


def prepare_dataset(
    raw_path: Path = None, processed_path: Path = None
) -> tuple[pd.DataFrame, list[str], str, dict]:
    raw = load_raw(raw_path)
    feature_df, feature_columns, target = engineer_features(raw)

    required = set(feature_columns + [target])
    missing_in_features = feature_df[list(required)].isna().sum()
    missing_columns = [c for c in feature_columns if c not in feature_df.columns]
    if missing_columns:
        raise ValueError(f"Missing engineered feature columns: {missing_columns}")

    feature_df = feature_df.dropna(subset=list(required)).reset_index(drop=True)

    quality = {
        "raw_records": int(len(raw)),
        "final_records": int(len(feature_df)),
        "discarded_warmup_rows": int(len(raw) - len(feature_df)),
        "missing_values_by_column": missing_in_features.to_dict(),
    }

    if processed_path:
        processed_path.parent.mkdir(parents=True, exist_ok=True)
        feature_df.to_csv(processed_path, index=False)

    return feature_df, feature_columns, target, quality


def split_chronological(
    feature_df: pd.DataFrame,
    feature_columns: list[str],
    target: str,
    train_ratio: float = None,
) -> dict:
    ratio = train_ratio if train_ratio is not None else settings.train_ratio
    split_idx = int(len(feature_df) * ratio)
    if split_idx <= 0 or split_idx >= len(feature_df):
        raise ValueError("Invalid chronological split point.")

    x_train = feature_df[feature_columns].iloc[:split_idx].reset_index(drop=True)
    y_train = feature_df[target].iloc[:split_idx].reset_index(drop=True)
    x_test = feature_df[feature_columns].iloc[split_idx:].reset_index(drop=True)
    y_test = feature_df[target].iloc[split_idx:].reset_index(drop=True)

    return {
        "X_train": x_train,
        "y_train": y_train,
        "X_test": x_test,
        "y_test": y_test,
        "split_idx": split_idx,
        "train_start": feature_df["Date"].iloc[0],
        "train_end": feature_df["Date"].iloc[split_idx - 1],
        "test_start": feature_df["Date"].iloc[split_idx],
        "test_end": feature_df["Date"].iloc[-1],
        "test_dates": feature_df["Date"].iloc[split_idx:].reset_index(drop=True),
        "test_actuals": feature_df[target].iloc[split_idx:].reset_index(drop=True),
    }