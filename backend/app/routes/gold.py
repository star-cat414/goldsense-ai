import logging

from fastapi import APIRouter, HTTPException, Query

from app.schemas.responses import HistoryResponse, LatestPriceResponse
from app.services import gold_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/gold", tags=["gold"])


@router.get("/latest", response_model=LatestPriceResponse)
def latest_price() -> LatestPriceResponse:
    latest = gold_service.get_latest_price()
    if latest is None:
        raise HTTPException(status_code=404, detail="No gold price data is available.")
    recent = gold_service.get_recent_prices(2)
    previous_close = recent[-2]["close"] if len(recent) >= 2 else latest["close"]

    daily_change = round(latest["close"] - previous_close, 2)
    daily_change_pct = round((daily_change / previous_close) * 100, 3) if previous_close else 0.0

    return LatestPriceResponse(
        date=latest["date"],
        open=latest["open"],
        high=latest["high"],
        low=latest["low"],
        close=latest["close"],
        volume=latest["volume"],
        previous_close=previous_close,
        daily_change=daily_change,
        daily_change_pct=daily_change_pct,
    )


@router.get("/history", response_model=HistoryResponse)
def history(
    limit: int = Query(2000, ge=1, le=5000),
    offset: int = Query(0, ge=0),
    start: str | None = Query(None, description="Start date (YYYY-MM-DD)"),
    end: str | None = Query(None, description="End date (YYYY-MM-DD)"),
) -> HistoryResponse:
    try:
        result = gold_service.get_history(limit=limit, offset=offset, start=start, end=end)
    except Exception as exc:
        logger.error("History lookup failed: %s", exc)
        raise HTTPException(status_code=503, detail="Unable to load historical gold price data right now. Please try again.") from exc

    return HistoryResponse(
        total=result["total"],
        limit=result["limit"],
        offset=result["offset"],
        data=result["data"],
    )