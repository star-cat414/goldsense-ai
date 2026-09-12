from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from app.config import settings


def build_linear_pipeline() -> "make_pipeline":
    return make_pipeline(StandardScaler(), LinearRegression())


def train_linear(X_train, y_train) -> object:
    pipeline = build_linear_pipeline()
    pipeline.fit(X_train, y_train)
    return pipeline


def predict(pipeline, X) -> object:
    return pipeline.predict(X)