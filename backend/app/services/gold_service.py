import logging

import pandas as pd

from app.config import settings
from app.database import get_session
from app.ml.preprocess import load_raw
from app.models import GoldPrice

logger = logging.getLogger(__name__)


def load_raw_frame() -> pd.DataFrame:
    return load_raw()


def seed_gold_prices_if_empty() -> int:
    session = get_session()
    try:
        existing = session.query(GoldPrice).count()
        if existing > 0:
            return 0
        frame = load_raw_frame()
        rows = [
            GoldPrice(
                date=row.Date.date(),
                open=float(row.Open),
                high=float(row.High),
                low=float(row.Low),
                close=float(row.Close),
                volume=(float(row.Volume) if pd.notna(row.Volume) else None),
            )
            for row in frame.itertuples()
        ]
        session.add_all(rows)
        session.commit()
        logger.info("Seeded %s gold price records into the database.", len(rows))
        return len(rows)
    except Exception as exc:
        logger.warning("Could not seed gold prices into the database: %s", exc)
        session.rollback()
        return 0
    finally:
        session.close()


def _row_to_dict(row) -> dict:
    return {
        "date": row.date,
        "open": float(row.open),
        "high": float(row.high),
        "low": float(row.low),
        "close": float(row.close),
        "volume": float(row.volume) if row.volume is not None else None,
    }


def get_latest_price() -> dict | None:
    try:
        session = get_session()
        try:
            row = session.query(GoldPrice).order_by(GoldPrice.date.desc()).first()
            if row is None:
                return None
            return _row_to_dict(row)
        finally:
            session.close()
    except Exception as exc:
        logger.warning("Failed to read latest price from database: %s", exc)
        frame = load_raw_frame()
        if frame.empty:
            return None
        last = frame.iloc[-1]
        return {
            "date": last.Date.date(),
            "open": float(last.Open),
            "high": float(last.High),
            "low": float(last.Low),
            "close": float(last.Close),
            "volume": float(last.Volume) if pd.notna(last.Volume) else None,
        }


def get_recent_prices(n: int) -> list[dict]:
    try:
        session = get_session()
        try:
            rows = (
                session.query(GoldPrice)
                .order_by(GoldPrice.date.desc())
                .limit(n)
                .all()
            )
            return [_row_to_dict(r) for r in reversed(rows)]
        finally:
            session.close()
    except Exception as exc:
        logger.warning("Failed to read recent prices from database, falling back to CSV: %s", exc)
        frame = load_raw_frame()
        window = frame.tail(n)
        return [
            {
                "date": r.Date.date(),
                "open": float(r.Open),
                "high": float(r.High),
                "low": float(r.Low),
                "close": float(r.Close),
                "volume": float(r.Volume) if pd.notna(r.Volume) else None,
            }
            for r in window.itertuples()
        ]


def get_history(limit: int = 2000, offset: int = 0, start: str | None = None, end: str | None = None) -> dict:
    try:
        session = get_session()
        try:
            query = session.query(GoldPrice)
            if start:
                query = query.filter(GoldPrice.date >= start)
            if end:
                query = query.filter(GoldPrice.date <= end)
            total = query.count()
            rows = query.order_by(GoldPrice.date.asc()).offset(offset).limit(limit).all()
            return {
                "total": total,
                "limit": limit,
                "offset": offset,
                "data": [_row_to_dict(r) for r in rows],
            }
        finally:
            session.close()
    except Exception as exc:
        logger.warning("Failed to read history from database, falling back to CSV: %s", exc)
        frame = load_raw_frame()
        if start:
            frame = frame[frame["Date"] >= start]
        if end:
            frame = frame[frame["Date"] <= end]
        frame = frame.sort_values("Date").reset_index(drop=True)
        total = len(frame)
        window = frame.iloc[offset : offset + limit]
        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "data": [
                {
                    "date": r.Date.date(),
                    "open": float(r.Open),
                    "high": float(r.High),
                    "low": float(r.Low),
                    "close": float(r.Close),
                    "volume": float(r.Volume) if pd.notna(r.Volume) else None,
                }
                for r in window.itertuples()
            ],
        }