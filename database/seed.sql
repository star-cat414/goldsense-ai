-- GoldSense AI seed data
-- The backend automatically seeds gold_prices from backend/data/raw/gold_daily.csv
-- on startup when the table is empty. This file is a manual reference for the
-- expected structure; the canonical dataset lives in backend/data/raw/gold_daily.csv.

-- Example (values below are illustrative placeholders, replaced at seed time):
-- INSERT INTO gold_prices (date, open, high, low, close, volume)
-- VALUES ('2026-09-11', 4390.1, 4425.3, 4362.8, 4408.9, 183421.0);

-- To seed manually from the CSV use the backend script:
--   .venv\Scripts\python.exe -m app.services.gold_service  (or via FastAPI startup lifecycle).