# GoldSense AI — Backend

FastAPI application powering GoldSense AI: machine-learning training, evaluation, forecasting and
analytics, exposed over a REST API.

## Layout

```
backend/
├── app/
│   ├── main.py              # FastAPI app, CORS, lifespan (init DB + seed), routers
│   ├── config.py            # Settings, paths
│   ├── database.py          # Postgres-primary / SQLite-fallback session engine
│   ├── models.py            # SQLAlchemy models: GoldPrice, Prediction, ModelMetric, ModelMetadata
│   ├── schemas.py           # Pydantic response schemas
│   ├── routers/             # gold, forecast, models, analytics, health
│   ├── services/            # gold_service, prediction_service, analytics_service, model_service
│   └── ml/
│       ├── preprocess.py    # 35-feature engineering + chronological split
│       ├── evaluate.py      # expanding-window one-day-ahead walk-forward evaluation
│       ├── xgboost_model.py # XGBoost class (train, tune, predict)
│       ├── linear_model.py  # Linear Regression baseline
│       └── train.py         # Orchestrator: `python -m app.ml.train`
├── scripts/
│   └── download_data.py     # Fetches Yahoo Finance data -> data/raw/gold_daily.csv
├── data/                    # raw/ (csv), goldsense.db (SQLite fallback)
├── saved_models/            # artifacts, evaluation.json, feature_importance.json, metadata.json
└── requirements.txt
```

## Setup & run

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python -m app.ml.train          # train + evaluate + persist artifacts
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

## Database

- Default: SQLite at `backend/data/goldsense.db`, auto-seeded with 2,000 gold price rows on startup.
- To use PostgreSQL, set `GOLDSENSE_DB_URL` before starting, e.g.
  `postgresql+psycopg://user:password@host:5432/goldsense`. The schema lives in `../database/schema.sql`.

## Testing the API

The API was verified via `TestClient`; with the server running you can also:

```powershell
Invoke-RestMethod http://localhost:8000/api/health
Invoke-RestMethod "http://localhost:8000/api/forecast?days=7"
Invoke-RestMethod http://localhost:8000/api/models/comparison
```

Interactive OpenAPI docs: http://localhost:8000/docs

## Notes

- Training and forecasting are strictly chronological — no data leakage.
- Forecasts are recursive one-day-ahead; weekends are skipped; external market features are held at
  the last observed value (explained in every `/api/forecast` response's `methodology`).
- `evaluation.json` and `feature_importance.json` are produced only by genuine model evaluation.