# GoldSense AI

**AI-Powered Gold Price Prediction & Market Trend Analysis**

GoldSense AI is a full-stack machine-learning web application that forecasts gold prices and analyzes
market trends. A FastAPI backend trains and serves two models — **XGBoost Regressor** (production) and
**Linear Regression** (baseline) — on real historical gold market data, exposed through a polished
Next.js 15 dashboard.

> **Disclaimer:** This is an educational data-science project. Forecasts are model outputs, not
> financial advice.

---

## Architecture

```
┌────────────────────────────┐        ┌──────────────────────────────┐
│  Frontend  (Next.js 15)   │  /api  │  Backend  (FastAPI / Python) │
│  - React 19 + TS + Tailwind│ ─────> │  - REST API (10 endpoints)   │
│  - Recharts visualizations │        │  - ML pipeline (XGBoost/LR)  │
└────────────────────────────┘        │  - SQLAlchemy + DB           │
                                      └──────────────┬───────────────┘
                                                     │
                                    ┌────────────────┴────────────────┐
                                    │  PostgreSQL (primary)           │
                                    │  SQLite (automatic fallback)    │
                                    └─────────────────────────────────┘
```

- `frontend/` — Next.js 15 App Router + TypeScript + Tailwind CSS + Recharts. Uses `/api` with a
  rewrite proxy to the backend.
- `backend/` — FastAPI application, ML training/evaluation pipeline, forecast + analytics services.
- `database/` — SQL schema and seed definitions for `gold_prices`, `predictions`, `model_metrics`
  and `model_metadata`.
- `notebooks/` — placeholders for interactive data analysis and prototyping.

---

## Models & Evaluation

| Aspect                 | Detail |
|------------------------|--------|
| Primary model          | XGBoost Regressor (production) |
| Baseline model         | Linear Regression (comparison) |
| Dataset                | 2,000 real daily records (2018-09-28 → 2026-09-11) from Yahoo Finance `GC=F` |
| Features               | 35 technical + market features (lags, MA, RSI, MACD, Bollinger, volatility, market indicators, date) |
| Train / test split     | Chronological: 1,545 train / 387 test |
| Evaluation method      | Expanding-window, one-day-ahead walk-forward (same window for both models) |
| XGBoost (test)         | MAE 76.47 · RMSE 104.26 · MAPE 1.86% · R² 0.9737 |
| Linear Regression (test) | MAE 51.21 · RMSE 76.06 · MAPE 1.24% · R² 0.986 |

The dashboard reports both models' metrics transparently — including the fact that the baseline
outperformed XGBoost on the hold-out window — while keeping XGBoost as the production model per the
documented selection policy (see `/api/models/comparison`).

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 20+
- (Optional) A PostgreSQL server — not required, SQLite is used automatically as a fallback.

### 1. Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt

# Train the models (walk-forward evaluation + production artifacts)
.venv\Scripts\python -m app.ml.train

# Download / refresh the dataset (optional)
.venv\Scripts\python scripts\download_data.py

# Run the API
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/api/health

To use PostgreSQL instead of SQLite (the server currently runs at `localhost:5432`, auth is not
pre-configured), set the connection string before starting:

```powershell
$env:GOLDSENSE_DB_URL = "postgresql+psycopg://user:password@localhost:5432/goldsense"
```

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

- App: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard
- The Next.js dev server proxies `/api/*` to the backend at `http://localhost:8000`
  (override with the `BACKEND_URL` env var).

### 3. Production build

```powershell
cd frontend
npm run build
npm run start
```

---

## API Endpoints

| Method | Endpoint                          | Description                                       |
|--------|-----------------------------------|---------------------------------------------------|
| GET    | `/api/health`                     | Service, DB status, dataset & model metadata      |
| GET    | `/api/gold/latest`                | Latest gold OHLC + daily change                   |
| GET    | `/api/gold/history`               | Paginated/filtered price history                  |
| GET    | `/api/forecast?days=3\|7\|30`     | Recursive XGBoost forecast (1–90 valid)           |
| GET    | `/api/models/comparison`          | Walk-forward metrics for both models              |
| GET    | `/api/models/feature-importance`  | Feature importance from the production model      |
| GET    | `/api/analytics/trend?horizon=7`  | Trend classification + rules                      |
| GET    | `/api/analytics/statistics`       | Dataset statistics                                |

---

## Data Sources

- Gold: Yahoo Finance `GC=F` (daily OHLCV) — Stooq was blocked and FRED timed out during this project.
- Correlated markets (merged by date): Silver (`SI=F`), Crude Oil (`CL=F`), S&P 500 (`^GSPC`),
  USD Index (`DX-Y.NYB`).
- External market indicators are held at their last observed value inside multi-day forecasts
  (documented per-request in the API response `methodology`).

## Project Tasks
- [ ] PostgreSQL credentials configured for a local `goldsense` database
- [ ] Stock-market-holiday calendar for more accurate forecast dates

## License
Private educational project. Not affiliated with any financial institution.