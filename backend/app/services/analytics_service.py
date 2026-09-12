import logging

import numpy as np
import pandas as pd

from app.ml import preprocess
from app.ml.preprocess import MARKET_LEVELS

logger = logging.getLogger(__name__)


def collect_statistics() -> dict:
    frame = preprocess.load_raw()
    if frame.empty:
        raise ValueError("Dataset is unavailable.")

    close = frame["Close"].astype(float)
    daily = close.diff().dropna()
    volume = pd.to_numeric(frame["Volume"], errors="coerce")

    observations: dict = {}
    for col in MARKET_LEVELS:
        if col in frame.columns:
            obs_frame = frame[[col]].astype(float).dropna()
            if len(obs_frame) >= 2:
                correlation = float(np.corrcoef(obs_frame[col], close.loc[obs_frame.index])[0, 1])
                observations[f"correlation_{col}"] = round(correlation, 4)
            else:
                observations[f"correlation_{col}"] = None

    observations["up_days"] = int((daily > 0).sum())
    observations["down_days"] = int((daily < 0).sum())
    observations["flat_days"] = int((daily == 0).sum())

    stats = {
        "dataset_records": int(len(frame)),
        "period_start": frame["Date"].iloc[0],
        "period_end": frame["Date"].iloc[-1],
        "latest_price": round(float(close.iloc[-1]), 2),
        "minimum_close": round(float(close.min()), 2),
        "maximum_close": round(float(close.max()), 2),
        "mean_close": round(float(close.mean()), 2),
        "median_close": round(float(close.median()), 2),
        "std_close": round(float(close.std()), 2),
        "avg_daily_change": round(float(daily.mean()), 2),
        "max_daily_change": round(float(daily.max()), 2),
        "min_daily_change": round(float(daily.min()), 2),
        "avg_daily_volume": round(float(volume.dropna().mean()), 2) if volume.notna().any() else None,
        "observations": observations,
    }
    return stats