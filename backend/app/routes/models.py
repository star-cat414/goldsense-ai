import logging

from fastapi import APIRouter, HTTPException

from app.schemas.responses import FeatureImportanceResponse, ModelComparisonResponse
from app.services import models_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/models", tags=["models"])


@router.get("/comparison", response_model=ModelComparisonResponse)
def model_comparison() -> ModelComparisonResponse:
    try:
        data = models_service.get_model_comparison()
    except Exception as exc:
        logger.error("Model comparison unavailable: %s", exc)
        raise HTTPException(
            status_code=503,
            detail="Model comparison results are unavailable. Run the training pipeline first.",
        ) from exc
    return ModelComparisonResponse(**data)


@router.get("/feature-importance", response_model=FeatureImportanceResponse)
def feature_importance() -> FeatureImportanceResponse:
    try:
        data = models_service.get_feature_importance()
    except Exception as exc:
        logger.error("Feature importance unavailable: %s", exc)
        raise HTTPException(
            status_code=503,
            detail="Feature importance results are unavailable. Run the training pipeline first.",
        ) from exc
    return FeatureImportanceResponse(**data)