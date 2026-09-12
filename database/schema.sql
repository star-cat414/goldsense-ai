-- GoldSense AI PostgreSQL schema
-- Note: the FastAPI backend creates these tables automatically via SQLAlchemy.
-- This file is provided for manual PostgreSQL provisioning (e.g. `psql -f schema.sql`).

CREATE TABLE IF NOT EXISTS gold_prices (
    id          SERIAL PRIMARY KEY,
    date        DATE NOT NULL,
    open        DOUBLE PRECISION NOT NULL,
    high        DOUBLE PRECISION NOT NULL,
    low         DOUBLE PRECISION NOT NULL,
    close       DOUBLE PRECISION NOT NULL,
    volume      DOUBLE PRECISION,
    created_at  TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_gold_prices_date UNIQUE (date)
);

CREATE INDEX IF NOT EXISTS ix_gold_prices_date ON gold_prices (date);

CREATE TABLE IF NOT EXISTS predictions (
    id                     SERIAL PRIMARY KEY,
    prediction_date        DATE NOT NULL,
    forecast_generated_at  TIMESTAMP DEFAULT NOW() NOT NULL,
    horizon                INTEGER NOT NULL,
    predicted_price        DOUBLE PRECISION NOT NULL,
    percentage_change      DOUBLE PRECISION,
    trend                  VARCHAR(20),
    model_name             VARCHAR(50) NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_predictions_prediction_date ON predictions (prediction_date);
CREATE INDEX IF NOT EXISTS ix_predictions_forecast_generated_at ON predictions (forecast_generated_at);

CREATE TABLE IF NOT EXISTS model_metrics (
    id          SERIAL PRIMARY KEY,
    model_name  VARCHAR(50) NOT NULL,
    mae         DOUBLE PRECISION NOT NULL,
    rmse        DOUBLE PRECISION NOT NULL,
    mape        DOUBLE PRECISION NOT NULL,
    r2          DOUBLE PRECISION NOT NULL,
    trained_at  TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_model_metrics_model_name UNIQUE (model_name)
);

CREATE TABLE IF NOT EXISTS model_metadata (
    id               SERIAL PRIMARY KEY,
    model_name       VARCHAR(50) NOT NULL,
    version          VARCHAR(20) NOT NULL,
    training_records INTEGER NOT NULL,
    test_records     INTEGER NOT NULL,
    feature_count    INTEGER NOT NULL,
    trained_at       TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_model_metadata_model_name UNIQUE (model_name)
);