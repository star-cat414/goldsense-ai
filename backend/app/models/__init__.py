from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    Float,
    Index,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def now_utc() -> datetime:
    return datetime.utcnow()


class GoldPrice(Base):
    __tablename__ = "gold_prices"
    __table_args__ = (
        Index("ix_gold_prices_date", "date"),
        UniqueConstraint("date", name="uq_gold_prices_date"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    open: Mapped[float] = mapped_column(Float, nullable=False)
    high: Mapped[float] = mapped_column(Float, nullable=False)
    low: Mapped[float] = mapped_column(Float, nullable=False)
    close: Mapped[float] = mapped_column(Float, nullable=False)
    volume: Mapped[float] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc, nullable=False)


class Prediction(Base):
    __tablename__ = "predictions"
    __table_args__ = (
        Index("ix_predictions_prediction_date", "prediction_date"),
        Index("ix_predictions_forecast_generated_at", "forecast_generated_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    prediction_date: Mapped[date] = mapped_column(Date, nullable=False)
    forecast_generated_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc, nullable=False)
    horizon: Mapped[int] = mapped_column(Integer, nullable=False)
    predicted_price: Mapped[float] = mapped_column(Float, nullable=False)
    percentage_change: Mapped[float] = mapped_column(Float, nullable=True)
    trend: Mapped[str] = mapped_column(String(20), nullable=True)
    model_name: Mapped[str] = mapped_column(String(50), nullable=False)


class ModelMetric(Base):
    __tablename__ = "model_metrics"
    __table_args__ = (UniqueConstraint("model_name", name="uq_model_metrics_model_name"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    model_name: Mapped[str] = mapped_column(String(50), nullable=False)
    mae: Mapped[float] = mapped_column(Float, nullable=False)
    rmse: Mapped[float] = mapped_column(Float, nullable=False)
    mape: Mapped[float] = mapped_column(Float, nullable=False)
    r2: Mapped[float] = mapped_column(Float, nullable=False)
    trained_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc, nullable=False)


class ModelMetadata(Base):
    __tablename__ = "model_metadata"
    __table_args__ = (UniqueConstraint("model_name", name="uq_model_metadata_model_name"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    model_name: Mapped[str] = mapped_column(String(50), nullable=False)
    version: Mapped[str] = mapped_column(String(20), nullable=False)
    training_records: Mapped[int] = mapped_column(Integer, nullable=False)
    test_records: Mapped[int] = mapped_column(Integer, nullable=False)
    feature_count: Mapped[int] = mapped_column(Integer, nullable=False)
    trained_at: Mapped[datetime] = mapped_column(DateTime, default=now_utc, nullable=False)