import logging

from fastapi import APIRouter, HTTPException, Query

from app.config import settings
from app.schemas.responses import StatisticsResponse, TrendResponse
from app.services import analytics_service, prediction_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/trend", response_model=TrendResponse)
def trend(
    horizon: int = Query(7, ge=1, le=settings.max_forecast_horizon),
) -> TrendResponse:
    try:
        data = prediction_service.get_market_trend(horizon)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("Market trend analysis failed: %s", exc)
        raise HTTPException(
            status_code=503,
            detail="Unable to analyze the market trend right now. Please try again.",
        ) from exc
    return TrendResponse(**data)


@router.get("/statistics", response_model=StatisticsResponse)
def statistics() -> StatisticsResponse:
    try:
        data = analytics_service.collect_statistics()
    except Exception as exc:
        logger.error("Dataset statistics failed: %s", exc)
        raise HTTPException(
            status_code=503,
            detail="Unable to compute dataset statistics right now. Please try again.",
        ) from exc
    return StatisticsResponse(**data)