# GoldSense AI — Project Summary

**AI-Powered Gold Price Prediction & Market Trend Analysis**

A full-stack machine-learning web application that trains two gold-price forecasting models on real
historical market data and serves the results through an interactive dashboard.

- Status: **Complete as a local, demo-ready build** (not deployed)
- Last updated: 2026-09-12

---

## 1. What It Is

GoldSense AI collects ~2,000 real daily gold market records, engineers 35 technical and market
features, trains an **XGBoost Regressor** (production model) alongside a **Linear Regression**
baseline, evaluates both honestly with walk-forward validation, and exposes everything through a
FastAPI REST API consumed by a Next.js 15 dashboard.

> Educational data-science project. Forecasts are model outputs, not financial advice.

---

## 2. Architecture

```
┌──────────────────────────┐        ┌──────────────────────────────┐
│  Frontend (Next.js 15)  │  /api  │  Backend (FastAPI / Python) │
│  React 19 · TS · Recharts│ ─────> │  10 REST endpoints           │
│  Tailwind · dark mode    │ proxy  │  ML pipeline (XGBoost / LR)  │
└──────────────────────────┘        │  Training/eval/forecast svcs │
                                    └──────────────┬───────────────┘
                                                   │ SQLAlchemy
                              ┌────────────────────┴──────────────────┐
                              │ PostgreSQL (primary)                  │
                              │ SQLite (automatic fallback, in use)   │
                              └───────────────────────────────────────┘
```

| Component | Location | Tech |
|-----------|----------|------|
| Frontend  | `frontend/` | Next.js 15.5, React 19.3, TypeScript 5.9, Tailwind 3.4, Recharts 2.15 |
| Backend   | `backend/`  | Python 3.14, FastAPI 0.141, SQLAlchemy 2.0, pandas 3.0, NumPy, scikit-learn 1.9, XGBoost 3.4 |
| Database  | `database/` | schema.sql + seed.sql (Postgres schema, SQLite-compatible) |
| Notebooks | `notebooks/`| data_analysis / feature_engineering / model_comparison placeholders |

---

## 3. Data

| Aspect | Detail |
|--------|--------|
| Source | Yahoo Finance v8 chart API (`GC=F`) — Stooq blocked, FRED timed out |
| Records | 2,000 daily rows, 2018-09-28 → 2026-09-11 |
| Assets  | Gold OHLCV + Silver, Crude Oil, S&P 500, USD Index (closes + volume) |
| File    | `backend/data/raw/gold_daily.csv` |
| Loader  | `backend/scripts/download_data.py` |

---

## 4. Machine Learning

### Feature engineering (35 features)
Lag closes (1/2/3/7/14/30) and volumes · Moving averages (7/14/30/50) · Volatility (rolling std
7/14) · Daily change / pct change · EMA 12/26 · MACD + signal + histogram · RSI-14 · Bollinger
upper/lower/width/%B · market pct-change lags · volume lags · cyclical date features. Target:
`Gold_Close`. All computed chronologically — no leakage.

### Training & evaluation
- Chronological split: **1,545 train** (2018-12-10 → 2025-02-18) / **387 test** (2025-02-19 → 2026-09-10)
- Method: **expanding-window, one-day-ahead walk-forward**, identical test window for both models
- XGBoost tuned via time-series-aware 5-fold CV (best CV RMSE 176.98; max_depth 3, lr 0.03, subsample 0.9, n_estimators 200, …)

### Walk-forward results (test window)

| Model | MAE | RMSE | MAPE | R² |
|-------|-----|------|------|-----|
| XGBoost (primary) | 76.47 | 104.26 | 1.86% | 0.9737 |
| Linear Regression (baseline) | 51.21 | 76.06 | 1.24% | 0.986 |

`evaluation.json`: `better_model = "Linear Regression"` on the test window, but XGBoost remains the
production model per the documented selection policy and is reported transparently in the dashboard.

### Top features (XGBoost)
MA_30 (23.36%), close_lag_7 (13.48%), MA_14, MA_7, close_lag_3 …

### Forecasting behavior
Recursive one-day-ahead · next trading day skips weekends (holidays not modeled) · external market
features held at last observed value · horizons 1–90 (UI uses 3 / 7 / 30) · predictions persisted to DB.

---

## 5. API (all verified)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Service, DB backend/status, dataset & model metadata |
| GET | `/api/gold/latest` | Latest OHLC + daily change (chg % fixed early on) |
| GET | `/api/gold/history` | Paginated/filtered gold price records |
| GET | `/api/forecast?days=` | Recursive forecast + statistics + trend + methodology |
| GET | `/api/models/comparison` | Walk-forward metrics for XGBoost vs Linear Regression |
| GET | `/api/models/feature-importance` | Feature importance (35 items) |
| GET | `/api/analytics/trend?horizon=` | Trend classification (Bullish/Bearish/Neutral) + rules |
| GET | `/api/analytics/statistics` | Dataset statistics |

Recent verified values: latest close 4366.20 (+0.039%) · 7-day forecast Neutral · XGB MAE 76.47 /
LR 51.21 · top feature MA_30.

---

## 6. Frontend

- **Pages:** `/` (home/hero with live price + sparkline), `/about`, `/dashboard`
- **Dashboard sections (8):** Overview, Gold Price, Forecast (3/7/30d + confidence + table),
  Market Trend, Model Comparison, Feature Importance, Historical Data (search/filter/sort/pagination/
  CSV export), Settings
- **UX:** light blue + purple brand, dark mode (`class` strategy, persisted), currency display
  (USD/EUR/GBP symbol), chart accent colors, sidebar + mobile drawer, skeletons/error states,
  `SettingsProvider` (localStorage `goldsense-settings`)
- **Build:** `npm run build` passes — 4 routes, all types valid; `/api/*` proxied to backend
  (`BACKEND_URL` env override)

---

## 7. Database

- **Postgres primary / SQLite fallback.** Local Postgres server exists at `localhost:5432` but
  `postgres:postgres` auth fails → **SQLite currently in use** at `backend/data/goldsense.db`
  (auto-seeded, 2,000 rows).
- Tables: `gold_prices`, `predictions`, `model_metrics`, `model_metadata`.
- Enable Postgres via `GOLDSENSE_DB_URL`.

---

## 8. Issues Encountered & Resolved

| Issue | Resolution |
|-------|-----------|
| pandas 3.0.5 API | Manual pct-change computations (no `.pct_change()` fallback) |
| Postgres auth failure | Automatic SQLite fallback engine |
| Stooq/FRED sources | Switched to Yahoo Finance v8 chart API |
| TestClient + starlette 1.6 | Installed `httpx2` |
| Wrong `daily_change` day-over-day calc | Fixed using two most recent records |
| Frontend type errors (lucide `TrendUp`, Badge variant indexing, closures, heterogeneous arrays) | Fixed during `npm run build` |
| API proxy env collision | Split rewrite base into `BACKEND_URL` |

---

## 9. Run It

**Backend**
```powershell
cd backend
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

**Frontend**
```powershell
cd frontend
npm run dev        # http://localhost:3000
```

**Retrain (optional)**
```powershell
cd backend
.venv\Scripts\python -m app.ml.train
```

---

## 10. Known Gaps / Next Steps

1. **No deployment** — local-only (no Docker, no hosted URL)
2. **PostgreSQL not configured** — provide credentials for `GOLDSENSE_DB_URL`
3. **No committed test suite** — only manual TestClient smoke checks
4. **Holiday calendar** — weekend skipping only; no stock-market holidays
5. **Notebooks** are placeholders — flesh out with real analysis
6. Git repo not initialized — add `.gitignore` (created) and make an initial commit

---

## 11. Verification Status

- [x] Dataset downloaded (2,000 rows, real data)
- [x] Models trained, evaluated, artifacts persisted
- [x] All 10 API endpoints return correct data
- [x] `npm run build` green (no type errors)
- [x] End-to-end: `/`, `/about`, `/dashboard` serve 200; `/api` proxy reaches backend