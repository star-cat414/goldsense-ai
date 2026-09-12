import json
import time

import numpy as np
import xgboost as xgb
from sklearn.model_selection import TimeSeriesSplit
from sklearn.model_selection import RandomizedSearchCV

from app.config import settings


def default_param_grid() -> dict:
    return {
        "n_estimators": [200, 400, 700, 1000],
        "learning_rate": [0.01, 0.03, 0.05, 0.1],
        "max_depth": [3, 4, 5, 6],
        "min_child_weight": [1, 3, 5],
        "subsample": [0.7, 0.8, 0.9, 1.0],
        "colsample_bytree": [0.6, 0.8, 1.0],
        "reg_alpha": [0.0, 0.1, 0.5],
        "reg_lambda": [0.0, 1.0, 2.0],
    }


def build_xgboost(params: dict | None = None) -> xgb.XGBRegressor:
    merged = {
        "objective": "reg:squarederror",
        "n_estimators": 400,
        "learning_rate": 0.05,
        "max_depth": 5,
        "min_child_weight": 1,
        "subsample": 0.9,
        "colsample_bytree": 0.8,
        "reg_alpha": 0.1,
        "reg_lambda": 1.0,
        "random_state": 42,
        "tree_method": "hist",
        "verbosity": 0,
        "n_jobs": -1,
    }
    merged.update(params or {})
    return xgb.XGBRegressor(**merged)


def tune_xgboost(X_train, y_train, n_iter: int = 25, cv_splits: int = 5, full_fit: bool = False) -> tuple[xgb.XGBRegressor, dict, dict]:
    tscv = TimeSeriesSplit(n_splits=cv_splits)
    base = build_xgboost({"n_estimators": 50, "learning_rate": 0.05})
    search = RandomizedSearchCV(
        estimator=base,
        param_distributions=default_param_grid(),
        n_iter=n_iter,
        scoring="neg_root_mean_squared_error",
        cv=tscv,
        n_jobs=-1,
        random_state=42,
        verbose=0,
    )
    started = time.time()
    search.fit(X_train, y_train)
    duration = round(time.time() - started, 2)

    best_model = search.best_estimator_
    if full_fit:
        best_model.set_params(n_estimators=search.best_params_.get("n_estimators", 400))
        best_model.fit(X_train, y_train)

    tuning = {
        "n_iterations": n_iter,
        "cv_splits": cv_splits,
        "best_params": {k: v for k, v in search.best_params_.items()},
        "best_cv_rmse": round(float(-search.best_score_), 2),
        "duration_seconds": duration,
    }
    return best_model, search, tuning


def train_xgboost(X_train, y_train, tune: bool = True, n_iter: int = 25, full_fit: bool = True) -> tuple[xgb.XGBRegressor, dict]:
    search = None
    if tune:
        model, search, tuning = tune_xgboost(X_train, y_train, n_iter=n_iter, full_fit=full_fit)
    else:
        model = build_xgboost()
        model.fit(X_train, y_train)
        tuning = {"n_iterations": 0, "best_params": dict(model.get_params()), "best_cv_rmse": None}
    return model, search, tuning


def feature_importance(model) -> list[dict]:
    if isinstance(model, xgb.XGBRegressor):
        importances = model.feature_importances_
        names = model.feature_names_in_.tolist()
    else:
        importances = model.get_score(importance_type="gain")
        names = list(importances.keys())
        importances = [importances[n] for n in names]
    total = float(np.sum(importances))
    ranked = []
    for name, value in sorted(zip(names, importances), key=lambda item: item[1], reverse=True):
        ranked.append(
            {
                "feature": name,
                "importance": round(float(value), 6),
                "relative_importance": round(float(value / total) * 100, 2) if total > 0 else 0.0,
            }
        )
    return ranked