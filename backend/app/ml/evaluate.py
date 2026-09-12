import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def evaluate_model(y_true, y_pred) -> dict:
    y_true = np.asarray(y_true).reshape(-1)
    y_pred = np.asarray(y_pred).reshape(-1)
    mask = np.isfinite(y_true) & np.isfinite(y_pred)
    y_true, y_pred = y_true[mask], y_pred[mask]
    if len(y_true) == 0:
        raise ValueError("Cannot evaluate model: no valid observation pairs.")

    non_zero = y_true != 0
    mape = float(np.mean(np.abs((y_true[non_zero] - y_pred[non_zero]) / y_true[non_zero])) * 100)

    return {
        "MAE": round(float(mean_absolute_error(y_true, y_pred)), 2),
        "RMSE": round(float(np.sqrt(mean_squared_error(y_true, y_pred))), 2),
        "MAPE": round(mape, 2),
        "R2": round(float(r2_score(y_true, y_pred)), 4),
    }


def evaluate_residuals(y_true, y_pred) -> dict:
    residuals = np.asarray(y_true).reshape(-1) - np.asarray(y_pred).reshape(-1)
    return {
        "mean_error": round(float(np.mean(residuals)), 2),
        "std_error": round(float(np.std(residuals)), 2),
        "max_abs_error": round(float(np.max(np.abs(residuals))), 2),
    }


def walk_forward_evaluate(x_train, y_train, x_test, y_test, xgb_params: dict) -> dict:
    import xgboost as xgb
    from sklearn.linear_model import LinearRegression
    from sklearn.pipeline import make_pipeline
    from sklearn.preprocessing import StandardScaler

    x_train = np.asarray(x_train, dtype="float64")
    y_train = np.asarray(y_train, dtype="float64").reshape(-1)
    x_test = np.asarray(x_test, dtype="float64")
    y_test = np.asarray(y_test, dtype="float64").reshape(-1)

    xgb_preds: list[float] = []
    lr_preds: list[float] = []

    for i in range(len(x_test)):
        x_all = np.vstack([x_train, x_test[:i]]) if i > 0 else x_train
        y_all = np.concatenate([y_train, y_test[:i]]) if i > 0 else y_train
        row = x_test[i : i + 1]

        xgb_model = xgb.XGBRegressor(**xgb_params)
        xgb_model.fit(x_all, y_all)
        xgb_preds.append(float(xgb_model.predict(row)[0]))  # noqa: E501

        lr_pipeline = make_pipeline(StandardScaler(), LinearRegression())
        lr_pipeline.fit(x_all, y_all)
        lr_preds.append(float(lr_pipeline.predict(row)[0]))  # noqa: E501

    xgb_metrics = evaluate_model(y_test, xgb_preds)
    lr_metrics = evaluate_model(y_test, lr_preds)

    return {
        "XGBoost": xgb_metrics,
        "Linear Regression": lr_metrics,
        "predictions": {"XGBoost": xgb_preds, "Linear Regression": lr_preds},
        "actuals": y_test.tolist(),
    }