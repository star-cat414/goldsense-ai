import logging

from fastapi import APIRouter, HTTPException, Query

from app.config import settings
from app.schemas.responses import ForecastResponse
from app.services import prediction_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/forecast", tags=["forecast"])


@router.get("", response_model=ForecastResponse)
def forecast(
    days: int = Query(7, ge=1, le=settings.max_forecast_horizon, description="Forecast horizon in trading days"),
) -> ForecastResponse:
    try:
        result = prediction_service.generate_forecast(days)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("Forecast generation failed: %s", exc)
        raise HTTPException(
            status_code=503,
            detail="Unable to generate the forecast right now. Please try again.",
        ) from exc

    return ForecastResponse(**result)