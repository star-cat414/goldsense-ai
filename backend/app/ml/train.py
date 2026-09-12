import argparse
import json
import logging
from datetime import datetime, timezone

import joblib

from app.config import settings
from app.database import get_session, init_db
from app.ml import preprocess
from app.ml.evaluate import evaluate_model, walk_forward_evaluate
from app.ml.linear_model import train_linear
from app.ml.xgboost_model import build_xgboost, feature_importance, train_xgboost

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("goldsense.train")


def save_json(path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, default=str), encoding="utf-8")


def store_metadata(metadata: dict) -> None:
    try:
        session = get_session()
        try:
            from app.models import ModelMetadata

            record = session.query(ModelMetadata).filter_by(model_name=settings.primary_model_name).first()
            if record is None:
                record = ModelMetadata(model_name=settings.primary_model_name)
                session.add(record)
            record.version = metadata.get("version", settings.model_version)
            record.training_records = metadata["split"]["train_records"]
            record.test_records = metadata["split"]["test_records"]
            record.feature_count = metadata["features"]["count"]
            record.trained_at = datetime.now(timezone.utc).replace(tzinfo=None)
            session.commit()
        finally:
            session.close()
    except Exception as exc:
        logger.warning("Could not store model metadata in database: %s", exc)


def store_metrics(evaluation: dict) -> None:
    try:
        session = get_session()
        try:
            from app.models import ModelMetric

            for model_name in (settings.primary_model_name, settings.baseline_model_name):
                metrics = evaluation.get(model_name)
                if not metrics:
                    continue
                record = session.query(ModelMetric).filter_by(model_name=model_name).first()
                if record is None:
                    record = ModelMetric(model_name=model_name)
                    session.add(record)
                record.mae = metrics["MAE"]
                record.rmse = metrics["RMSE"]
                record.mape = metrics["MAPE"]
                record.r2 = metrics["R2"]
                record.trained_at = datetime.now(timezone.utc).replace(tzinfo=None)
            session.commit()
        finally:
            session.close()
    except Exception as exc:
        logger.warning("Could not store model metrics in database: %s", exc)


def build_production_xgboost(xgb_params: dict):
    model = build_xgboost(xgb_params)
    return model


def run_training(tune: bool = True, n_iter: int = 25) -> dict:
    logger.info("Preparing dataset...")
    feature_df, feature_columns, target, quality = preprocess.prepare_dataset(
        processed_path=settings.processed_dataset_file
    )

    split = preprocess.split_chronological(feature_df, feature_columns, target)
    x_train, y_train = split["X_train"], split["y_train"]
    x_test, y_test = split["X_test"], split["y_test"]

    logger.info("Chronological split -> train: %s records | test: %s records", len(x_train), len(x_test))

    tuning: dict = {"n_iterations": 0, "best_params": {}, "best_cv_rmse": None}
    if tune:
        logger.info("Tuning XGBoost with time-series CV on training window...")
        _, _, tuning = train_xgboost(x_train, y_train, tune=True, n_iter=n_iter, full_fit=False)
    best_params = tuning.get("best_params") or {}
    fixed_params = build_xgboost({"random_state": 42}).get_params()
    fixed_params.update(best_params)

    logger.info("Running expanding-window walk-forward evaluation on the test period...")
    wf = walk_forward_evaluate(x_train, y_train, x_test, y_test, fixed_params)

    xgb_metrics = wf["XGBoost"]
    lr_metrics = wf["Linear Regression"]
    logger.info("XGBoost (walk-forward test): %s", xgb_metrics)
    logger.info("Linear Regression (walk-forward test): %s", lr_metrics)

    evaluation = {
        "evaluation_method": (
            "Expanding-window walk-forward, one-day-ahead predictions over the preserved chronological "
            "test period. Both models are retrained at every step using only data available up to the "
            "forecast origin. The same test window is used for both models."
        ),
        "test_period": {
            "start": str(split["test_start"].date()),
            "end": str(split["test_end"].date()),
            "records": int(len(x_test)),
        },
        settings.primary_model_name: xgb_metrics,
        settings.baseline_model_name: lr_metrics,
        "better_model": (
            settings.primary_model_name
            if xgb_metrics["RMSE"] <= lr_metrics["RMSE"]
            else settings.baseline_model_name
        ),
        "comparison_basis": "Lower RMSE over the identical walk-forward test period.",
        "model_selection_policy": (
            "The production forecasting model is always XGBoost. The comparison results are reported "
            "transparently and are not used to silently swap the production model."
        ),
    }

    logger.info("Final-fitting production XGBoost on the complete dataset...")
    production_model = build_production_xgboost(fixed_params)
    production_model.fit(feature_df[feature_columns], feature_df[target])
    settings.models_dir.mkdir(parents=True, exist_ok=True)
    production_model.save_model(str(settings.xgb_model_file))

    logger.info("Saving baseline Linear Regression fitted on the training window...")
    baseline_linear = train_linear(x_train, y_train)
    joblib.dump(baseline_linear, settings.linear_model_file)

    importance = feature_importance(production_model)
    logger.info("Top features: %s", [(row["feature"], row["relative_importance"]) for row in importance[:5]])

    save_json(settings.feature_names_file, {"target": target, "features": feature_columns})
    save_json(settings.feature_importance_file, importance)
    save_json(settings.evaluation_file, evaluation)

    metadata = {
        "version": settings.model_version,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "dataset": {
            "raw_records": quality["raw_records"],
            "featured_records": quality["final_records"],
            "discarded_warmup_rows": quality["discarded_warmup_rows"],
            "period_start": str(feature_df["Date"].iloc[0].date()),
            "period_end": str(feature_df["Date"].iloc[-1].date()),
            "source": str(settings.raw_dataset_file),
            "preprocessing_notes": [
                "Rows sorted chronologically by date and de-duplicated.",
                "Merged market indicators (silver, crude oil, S&P 500, USD index) forward-filled only for isolated missing weekdays (documented in download script).",
                "First 50+ rows dropped because 30-day lags and 50-day moving averages were not yet computable.",
                "Rows containing NaN targets (final forecastable date) are excluded from training.",
                "No random shuffling anywhere; all ordering is chronological.",
            ],
        },
        "split": {
            "method": "Chronological. Oldest 80% for training, newest 20% reserved for evaluation.",
            "train_ratio": settings.train_ratio,
            "train_records": int(len(x_train)),
            "test_records": int(len(x_test)),
            "train_start": str(split["train_start"].date()),
            "train_end": str(split["train_end"].date()),
            "test_start": str(split["test_start"].date()),
            "test_end": str(split["test_end"].date()),
        },
        "target": target,
        "features": {"count": len(feature_columns), "names": feature_columns},
        "feature_groups": {
            "lags": [c for c in feature_columns if c.startswith("close_lag")],
            "moving_averages": [c for c in feature_columns if c.startswith("MA_")],
            "volatility": [c for c in feature_columns if c.startswith(("rolling_std", "pct_change", "daily_change"))],
            "technical": [c for c in feature_columns if any(k in c for k in ("RSI", "MACD", "EMA", "BB"))],
            "date": [c for c in feature_columns if c in ("year", "month", "day", "day_of_week", "day_of_year")],
            "market": [c for c in feature_columns if any(k in c for k in ("usd_index", "silver", "crude_oil", "sp500"))],
            "volume": [c for c in feature_columns if "volume" in c],
        },
        "models": {
            settings.primary_model_name: {
                "objective": "reg:squarederror",
                "file": str(settings.xgb_model_file),
                "production_trained_on": "Full chronological dataset (features fitted at train time).",
                "tuning": tuning,
                "final_params_snapshot": fixed_params,
            },
            settings.baseline_model_name: {
                "pipeline": "StandardScaler -> LinearRegression",
                "file": str(settings.linear_model_file),
                "trained_on": "Chronological training window (baseline reference only).",
            },
        },
        "evaluation": evaluation,
    }
    save_json(settings.metadata_file, metadata)

    logger.info("Saving model metadata and metrics to database...")
    store_metadata(metadata)
    store_metrics(evaluation)

    return {
        "metadata_file": str(settings.metadata_file),
        "evaluation": {
            "method": evaluation["evaluation_method"],
            "test_period": evaluation["test_period"],
            "XGBoost": evaluation["XGBoost"],
            "Linear Regression": evaluation["Linear Regression"],
            "better_model": evaluation["better_model"],
        },
        "tuning": tuning,
        "top_features": importance[:5],
        "split": {
            "train_records": int(len(x_train)),
            "test_records": int(len(x_test)),
            "train_start": str(split["train_start"].date()),
            "train_end": str(split["train_end"].date()),
            "test_start": str(split["test_start"].date()),
            "test_end": str(split["test_end"].date()),
        },
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train GoldSense AI models.")
    parser.add_argument("--no-tune", action="store_true", help="Skip hyperparameter tuning.")
    parser.add_argument("--iterations", type=int, default=25, help="Random search iterations.")
    args = parser.parse_args()

    init_db()
    summary = run_training(tune=not args.no_tune, n_iter=args.iterations)
    print(json.dumps(summary, indent=2, default=str))