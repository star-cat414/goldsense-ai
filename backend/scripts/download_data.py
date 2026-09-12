import argparse
import json
import time
from pathlib import Path
from urllib.request import Request, urlopen

import pandas as pd

BACKEND_DIR = Path(__file__).resolve().parents[1]
RAW_DIR = BACKEND_DIR / "data" / "raw"
SOURCES_DIR = RAW_DIR / "sources"

YAHOO_URL = (
    "https://query1.finance.yahoo.com/v8/finance/chart/"
    "{symbol}?range={rng}&interval=1d&events=history"
)

SYMBOLS = {
    "gold": "GC=F",
    "silver": "SI=F",
    "crude_oil": "CL=F",
    "sp500": "^GSPC",
    "usd_index": "DX-Y.NYB",
}

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Accept": "application/json"}


def fetch_symbol(symbol: str, rng: str, retries: int = 3) -> dict:
    url = YAHOO_URL.format(symbol=symbol, rng=rng.replace("+", "%2B"))
    for attempt in range(retries):
        try:
            req = Request(url, headers=HEADERS)
            with urlopen(req, timeout=45) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as exc:
            if attempt == retries - 1:
                raise RuntimeError(f"Failed to fetch {symbol}: {exc}") from exc
            time.sleep(2 * (attempt + 1))


def symbol_frame(symbol: str, rng: str) -> pd.DataFrame:
    payload = fetch_symbol(symbol, rng)
    result = payload["chart"]["result"][0]
    timestamps = result.get("timestamp") or []
    quote = result["indicators"]["quote"][0]
    frame = pd.DataFrame(
        {
            "Date": pd.to_datetime(timestamps, unit="s", utc=True).tz_convert(None),
            "Open": quote.get("open"),
            "High": quote.get("high"),
            "Low": quote.get("low"),
            "Close": quote.get("close"),
            "Volume": quote.get("volume"),
        }
    )
    frame["Date"] = frame["Date"].dt.strftime("%Y-%m-%d")
    frame = frame[frame["Close"].notna()]
    frame = frame.drop_duplicates(subset=["Date"], keep="last")
    frame = frame.sort_values("Date").reset_index(drop=True)
    return frame


def main() -> None:
    parser = argparse.ArgumentParser(description="Download gold price data and market indicators.")
    parser.add_argument("--range", default="10y", help="Yahoo chart range (default 10y)")
    parser.add_argument("--records", type=int, default=2000, help="Max records to keep (default 2000)")
    args = parser.parse_args()

    SOURCES_DIR.mkdir(parents=True, exist_ok=True)

    frames: dict[str, pd.DataFrame] = {}
    for key, symbol in SYMBOLS.items():
        try:
            frame = symbol_frame(symbol, args.range)
            frames[key] = frame
            frame.to_csv(SOURCES_DIR / f"{key}.csv", index=False)
            print(f"Downloaded {key} ({symbol}): {len(frame)} rows from {frame['Date'].iloc[0]} to {frame['Date'].iloc[-1]}")
        except Exception as exc:
            print(f"Skipped {key} ({symbol}): {exc}")

    if "gold" not in frames:
        raise SystemExit("Gold data download failed. Check network access and retry.")

    gold = frames["gold"].rename(columns={"Open": "Open", "High": "High", "Low": "Low", "Close": "Close", "Volume": "Volume"})
    gold = gold[["Date", "Open", "High", "Low", "Close", "Volume"]].copy()

    joined = gold.set_index("Date")
    for key in ("silver", "crude_oil", "sp500", "usd_index"):
        if key not in frames:
            continue
        extra = frames[key][["Date", "Close", "Volume"]].rename(
            columns={"Close": f"{key}_close", "Volume": f"{key}_volume"}
        )
        extra = extra.set_index("Date")
        joined = joined.join(extra, how="left")
        carried = joined[f"{key}_close"].isna().sum()
        joined[[f"{key}_close", f"{key}_volume"]] = joined[[f"{key}_close", f"{key}_volume"]].ffill()
        print(f"Merged {key}: forward-filled {carried} missing days")

    joined = joined.reset_index()
    joined = joined.sort_values("Date").drop_duplicates(subset=["Date"], keep="last")
    if len(joined) > args.records:
        joined = joined.iloc[-args.records:].reset_index(drop=True)

    joined.to_csv(RAW_DIR / "gold_daily.csv", index=False)
    print(f"\nSaved combined dataset: {RAW_DIR / 'gold_daily.csv'} ({len(joined)} rows)")
    print("Columns:", list(joined.columns))
    print("Period:", joined["Date"].iloc[0], "->", joined["Date"].iloc[-1])


if __name__ == "__main__":
    main()