import json
import logging

from app.config import settings

logger = logging.getLogger(__name__)


def load_evaluation() -> dict:
    payload = json.loads(settings.evaluation_file.read_text(encoding="utf-8"))
    return payload


def get_model_comparison() -> dict:
    evaluation = load_evaluation()
    xgb_metrics = evaluation.get("XGBoost")
    lr_metrics = evaluation.get("Linear Regression")
    if not xgb_metrics or not lr_metrics:
        raise ValueError("Model evaluation results are unavailable. Run the training pipeline first.")

    return {
        "evaluation_method": evaluation.get("evaluation_method", ""),
        "test_period": evaluation.get("test_period", {}),
        "XGBoost": {
            "model_name": "XGBoost",
            "MAE": xgb_metrics["MAE"],
            "RMSE": xgb_metrics["RMSE"],
            "MAPE": xgb_metrics["MAPE"],
            "R2": xgb_metrics["R2"],
        },
        "Linear_Regression": {
            "model_name": "Linear Regression",
            "MAE": lr_metrics["MAE"],
            "RMSE": lr_metrics["RMSE"],
            "MAPE": lr_metrics["MAPE"],
            "R2": lr_metrics["R2"],
        },
        "better_model": evaluation.get("better_model", ""),
        "comparison_basis": evaluation.get("comparison_basis", ""),
        "primary_model": settings.primary_model_name,
        "baseline_model": settings.baseline_model_name,
        "model_selection_policy": evaluation.get("model_selection_policy", ""),
    }


def get_feature_importance() -> dict:
    items = json.loads(settings.feature_importance_file.read_text(encoding="utf-8"))
    return {
        "model_name": settings.primary_model_name,
        "explanation": (
            "Higher feature importance indicates that the model relied more heavily on that "
            "feature when making predictions. Feature importance measures model behaviour and "
            "does not prove causality."
        ),
        "items": items,
    }