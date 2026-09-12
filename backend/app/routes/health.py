import json
import logging

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import get_driver_name, get_session
from app.ml.preprocess import load_raw
from app.schemas.responses import HealthResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    dataset_records = 0
    try:
        dataset_records = int(load_raw().shape[0])
    except Exception as exc:
        logger.warning("Could not load dataset for health check: %s", exc)

    model_available = settings.xgb_model_file.exists()

    last_trained_at = None
    try:
        payload = json.loads(settings.metadata_file.read_text(encoding="utf-8"))
        last_trained_at = payload.get("trained_at")
    except Exception:
        last_trained_at = None

    database_backend = "unknown"
    try:
        database_backend = get_driver_name()
    except Exception as exc:
        logger.warning("Database backend unavailable: %s", exc)

    db_status = "up"
    try:
        session = get_session()
        session.close()
    except Exception:
        db_status = "degraded"

    return HealthResponse(
        status="ok" if model_available else "degraded",
        service="GoldSense AI API",
        version=settings.model_version,
        database=db_status,
        database_backend=database_backend,
        dataset_records=dataset_records,
        model_available=model_available,
        last_trained_at=last_trained_at,
    )