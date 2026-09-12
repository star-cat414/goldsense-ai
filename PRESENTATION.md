# GoldSense AI
### AI-Powered Gold Price Prediction & Market Trend Analysis
Project Presentation — 10 slides

---

## Slide 1 — Title

# GoldSense AI
## AI-Powered Gold Price Prediction & Market Trend Analysis

**A full-stack machine-learning web application**

- Predicts short-term gold prices (3 / 7 / 30 trading days)
- Classifies market trend with transparent rules
- Built on real market data — no fabricated numbers

---

## Slide 2 — The Problem

# Why Forecast Gold?

**Gold is volatile and globally sensitive:**

- Driven by inflation, interest rates, geopolitics, USD strength, oil and equities
- Hard for humans to weigh all variables at once

**Our goal:** Use machine learning to turn 35 engineered market signals into a
short-term price forecast — while *honestly* reporting how good the models really are.

---

## Slide 3 — The Data

# Real Market Data — 2,000 Days

| Aspect | Detail |
|--------|--------|
| Source | Yahoo Finance (`GC=F`) — Stooq blocked, FRED timed out |
| Period | 2018-09-28 → 2026-09-11 |
| Records | **2,000 daily** OHLCV rows |
| Markets | Gold + Silver, Crude Oil, S&P 500, USD Index |
| File | `backend/data/raw/gold_daily.csv` |

> Forecasts are only as good as the data — we used genuine historical prices.

---

## Slide 4 — Feature Engineering

# 35 Features That Drive Prediction

- **Lagged prices** — previous 1/2/3/7/14/30-day closes & volumes
- **Trends** — moving averages (7/14/30/50) and price-vs-MA ratios
- **Volatility** — rolling standard deviation (7/14-day)
- **Momentum** — daily change %, RSI-14, MACD line/signal/histogram
- **Bollinger Bands** — upper/lower band, width, %B
- **Market signals** — silver, oil, S&P 500 and USD-index lags
- **Calendar** — cyclical day-of-week encoding

All computed **chronologically** — no future information ever leaks into a prediction.

---

## Slide 5 — The Models

# Two Models, One Fair Test

### XGBoost Regressor — *Production*
Gradient-boosted decision trees, tuned with 5-fold
time-series-aware cross-validation
*(best CV RMSE 176.98)*

### Linear Regression — *Baseline*
Transparent, interpretable linear baseline

**Identical training & test conditions for both:**

- Train: 1,545 days (2018 → 2025)
- Test: 387 days (2025 → 2026)
- Method: expanding-window, one-day-ahead **walk-forward**

---

## Slide 6 — Evaluation Results

# Honest Walk-Forward Results

| Model | MAE | RMSE | MAPE | R² |
|-------|-----|------|------|-----|
| **XGBoost** (primary) | 76.47 | 104.26 | 1.86% | **0.9737** |
| **Linear Regression** (baseline) | **51.21** | **76.06** | **1.24%** | **0.986** |

> The baseline beat the primary model on the test window.
> We show that openly — evaluation is about truth, not winning.

**XGBoost remains the production model**
(per documented model-selection policy, shown in the app).

**Top features:** MA_30 (23.4%) · close_lag_7 (13.5%) · MA_14 · MA_7 · close_lag_3

---

## Slide 7 — Forecasts

# From Model to Market Insight

**Recursive one-day-ahead forecasting**
Each prediction feeds the next day's features.

| Horizon | Use case |
|---------|----------|
| 3 days | Short-term timing |
| 7 days | Weekly view |
| 30 days | Monthly planning |

**Trend classification rules (documented):**
- +0.5% or more → **Bullish**
- −0.5% or more → **Bearish**
- otherwise → **Neutral**

Weekends are skipped; external indicators held at last value (documented in API `methodology`).

---

## Slide 8 — The Product

# Interactive Dashboard (Next.js 15)

**8 modules, all powered by real API responses:**

1. **Overview** — live price snapshot + trend
2. **Gold Price** — interactive OHLC charts (30/90/180-day)
3. **Forecast** — 3/7/30-day predictions with confidence + table
4. **Market Trend** — direction + classification rules
5. **Model Comparison** — honest XGBoost vs Linear metrics
6. **Feature Importance** — what drives predictions
7. **Historical Data** — search, filter, sort, export CSV
8. **Settings** — currency, chart accent, dark mode

Dark mode · responsive sidebar · graceful error states · no fake data

---

## Slide 9 — Architecture & Tech

# End-to-End Stack

```
Next.js 15 ──/api proxy──> FastAPI ──> SQLAlchemy ──> PostgreSQL
  React 19 · TS                               │        (+ SQLite fallback)
  Tailwind · Recharts                         v
                                      XGBoost / Linear Regression
                                      pandas · numpy · scikit-learn
```

**10 REST endpoints** — all verified end-to-end (200 OK + correct payloads)

| Backend | Frontend | Data |
|---------|----------|------|
| Python 3.14 · FastAPI | Next.js 15 · React 19 | Yahoo Finance API |
| XGBoost 3.4 · sklearn | TypeScript 5.9 | Postgres/SQLite |
| pandas 3.0 · SQLAlchemy | Tailwind · Recharts | 2,000 records |

---

## Slide 10 — Summary & Next Steps

# Built, Verified, and Ready to Demo

**Delivered**
- ✅ 2,000 real records → 35 features → 2 trained models
- ✅ Honest walk-forward evaluation across all 10 API endpoints
- ✅ Polished 3-page Next.js app, production build passes
- ✅ End-to-end verified locally

**Next steps**
- ☐ Deploy (hosting + Postgres via `GOLDSENSE_DB_URL`)
- ☐ Add automated test suite
- ☐ Model market-holiday calendar
- ☐ Complete analysis notebooks

> **GitHub-ready project summary:** `PROJECT_SUMMARY.md`
> **Disclaimer:** Research tool — not financial advice.