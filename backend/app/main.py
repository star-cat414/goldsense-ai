import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routes import analytics, forecast, gold, health, models
from app.services.gold_service import seed_gold_prices_if_empty

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("goldsense.api")


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        backend = init_db()
        logger.info("Database initialized (backend=%s).", backend)
    except Exception as exc:
        logger.warning("Database initialization failed: %s", exc)
    try:
        seeded = seed_gold_prices_if_empty()
        if seeded:
            logger.info("Seeded %s gold price records.", seeded)
    except Exception as exc:
        logger.warning("Gold price seeding failed: %s", exc)
    yield


app = FastAPI(
    title="GoldSense AI API",
    description=(
        "Backend API for GoldSense AI — AI-based gold price prediction and market trend "
        "analysis. Serves historical data, XGBoost forecasts, model comparison, feature "
        "importance and dataset analytics."
    ),
    version=settings.model_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[*settings.cors_origins, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(gold.router, prefix="/api")
app.include_router(forecast.router, prefix="/api")
app.include_router(models.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")


@app.get("/")
def root() -> dict:
    return {
        "service": "GoldSense AI",
        "docs": "/docs",
        "health": "/api/health",
    }