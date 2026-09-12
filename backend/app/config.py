from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    db_url: str = ""

    data_dir: Path = BACKEND_DIR / "data"
    raw_data_dir: Path = BACKEND_DIR / "data" / "raw"
    processed_data_dir: Path = BACKEND_DIR / "data" / "processed"
    models_dir: Path = BACKEND_DIR / "saved_models"
    database_file: Path = BACKEND_DIR / "data" / "goldsense.db"

    raw_dataset_file: Path = BACKEND_DIR / "data" / "raw" / "gold_daily.csv"
    processed_dataset_file: Path = BACKEND_DIR / "data" / "processed" / "gold_features.csv"

    xgb_model_file: Path = BACKEND_DIR / "saved_models" / "xgboost_model.json"
    linear_model_file: Path = BACKEND_DIR / "saved_models" / "linear_regression.joblib"
    feature_names_file: Path = BACKEND_DIR / "saved_models" / "feature_names.json"
    feature_importance_file: Path = BACKEND_DIR / "saved_models" / "feature_importance.json"
    evaluation_file: Path = BACKEND_DIR / "saved_models" / "evaluation.json"
    metadata_file: Path = BACKEND_DIR / "saved_models" / "metadata.json"

    model_version: str = "1.0.0"
    primary_model_name: str = "XGBoost"
    baseline_model_name: str = "Linear Regression"
    target_column: str = "Gold_Close"

    default_horizons: tuple[int, ...] = (3, 7, 30)
    max_forecast_horizon: int = 90
    warmup_rows: int = 60

    train_ratio: float = 0.8

    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    model_config = SettingsConfigDict(
        env_prefix="GOLDSENSE_",
        env_file=str(BACKEND_DIR / ".env"),
        extra="ignore",
    )

    @property
    def preset_postgres_url(self) -> str:
        return "postgresql+psycopg://postgres:postgres@localhost:5432/goldsense"


settings = Settings()