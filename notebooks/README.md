# Notebooks

Interactive workspaces for exploration and prototyping around the GoldSense AI pipeline:

| Notebook | Purpose |
|----------|---------|
| `data_analysis.ipynb` | Explore the real gold dataset (`backend/data/raw/gold_daily.csv`) |
| `feature_engineering.ipynb` | Prototype the 35-feature engineering pipeline |
| `model_comparison.ipynb` | Compare XGBoost vs Linear Regression walk-forward evaluation |

All production code lives in `backend/app/`; these notebooks reuse the same modules so results stay
consistent. Launch with `jupyter notebook` (needs `jupyter` and the backend venv's packages).