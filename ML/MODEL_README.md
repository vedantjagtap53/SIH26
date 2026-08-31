# Mine Safety Score Model — `mine_score_model.joblib`

A trained `HistGradientBoostingRegressor` (scikit-learn) that predicts a
mine's safety score for the next fiscal year, given its 2 most recent
years of score/star/death history plus a few static mine attributes.

Trained on: `SIH-Dataset__4_.xlsx` (382 mines, sliding-window reframed into
1,734 training examples). Full training pipeline: `mine_forecast.py`.

## Requirements

```
python >= 3.9
scikit-learn == 1.8.0
joblib
numpy
```

The model was pickled with scikit-learn 1.8.0. Loading it with a
significantly different sklearn version may raise a version-mismatch
warning or fail — if that happens, retrain using `mine_forecast.py`
against your installed version instead of relying on the pickle.

## Quick start

```python
import joblib
import numpy as np

model = joblib.load("mine_score_model.joblib")

# See "Input format" below for what each column means
row = np.array([[
    96.0, 99.0,     # score_t1, score_t2
    np.nan, np.nan, # star_t1, star_t2
    np.nan, np.nan, # death_t1, death_t2
    97.5, np.nan,   # mean_score, mean_star
    np.nan,         # mean_death
    1.0, np.nan,    # ec, fc
    0.0,            # subsidiary_code
]])

prediction = model.predict(row)
print(prediction[0])
```

See `use_saved_model.py` for a runnable version of this example.

## Input format

The model expects a 2D array with **exactly 12 columns, in this order**:

| # | Feature | Description |
|---|---------|--------------|
| 0 | `score_t1` | Score in the earlier of the 2 window years |
| 1 | `score_t2` | Score in the later of the 2 window years (most recent known) |
| 2 | `star_t1` | Star rating matching `score_t1`'s year |
| 3 | `star_t2` | Star rating matching `score_t2`'s year |
| 4 | `death_t1` | Death count aligned to `score_t1`'s year |
| 5 | `death_t2` | Death count aligned to `score_t2`'s year |
| 6 | `mean_score` | Mean of `score_t1`, `score_t2` |
| 7 | `mean_star` | Mean of `star_t1`, `star_t2` |
| 8 | `mean_death` | Mean of `death_t1`, `death_t2` |
| 9 | `ec` | Static mine-level flag (0/1) |
| 10 | `fc` | Static mine-level flag (0/1) |
| 11 | `subsidiary_code` | Categorical code for the mine's subsidiary/company |

**Missing values:** `NaN` is fine in any column except `subsidiary_code`
(column 11) — `HistGradientBoostingRegressor` handles missing values
natively, no imputation required.

**Output:** the model returns a raw predicted score. In the full
pipeline this is not used directly — it's blended 50/50 with a naive
"last known score" baseline (see `blended_predict()` in
`mine_forecast.py`), then clipped to `[0, 100]` and rounded to 1
decimal. Calling `model.predict()` alone skips that blending step.

## ⚠️ About `subsidiary_code`

This column was generated with `pandas.Categorical(...).codes` during
training, meaning the mapping from company name → integer is specific
to that training run's data. **Do not hardcode subsidiary codes.** If
you need to score a mine's subsidiary against this model later, re-run
`load_and_prepare()` from `mine_forecast.py` on the full dataset so the
same categories are re-derived consistently — or retrain from scratch
if new subsidiaries have since been added.

## What this model does NOT do

- It does not use the full 12-column feature set correctly unless you
  build the window exactly as `mine_forecast.py` does (`score_arr[:, [5, 6]]`
  for a `score2526`-style one-step prediction). Malformed feature order
  will produce silently wrong predictions — the model won't error out,
  it will just be wrong.
- It was trained on `WINDOW = 2` years of history. It was never
  validated on 1-year or 3-year windows and should not be assumed to
  generalize to a different feature layout.
- It does not know about years beyond what it was trained on. For a
  2-step-ahead forecast (e.g. `score2627`), see `predict_score2627()`
  in `mine_forecast.py` — this recursively feeds a *predicted* value
  back in, which compounds error and is meaningfully less reliable
  than a 1-step prediction.

## Accuracy (honest numbers, not marketing)

Evaluated with 5-fold `GroupKFold` cross-validation (grouped by mine,
so no mine's data leaks across train/test):

| Metric | Value | Meaning |
|--------|-------|---------|
| MAE | 8.68 | Predictions are off by ~8.7 points on average (0–100 scale) |
| R² | 0.163 | Explains only ~16% of year-to-year score variation |

**Treat predictions as directional signals** (is this mine trending up
or down) rather than precise forecasts. Year-to-year safety scores are
influenced by real-world events (accidents, inspections, policy
changes) that aren't captured in score history alone — no model built
purely from past scores will close that gap.

## Files in this bundle

| File | Purpose |
|------|---------|
| `mine_score_model.joblib` | The trained model (this file) |
| `use_saved_model.py` | Minimal example of loading and calling it |
| `mine_forecast.py` | Full pipeline: data prep, training, cross-validation, prediction, Excel output |
| `Mine_Safety_Forecast_Model_Report.docx` | Full methodology writeup + line-by-line code walkthrough |

## Retraining

If the underlying dataset changes (new mines, new years, corrected
data), retrain rather than reuse this pickle:

```bash
python mine_forecast.py
```

This regenerates the model from scratch, re-derives `subsidiary_code`
consistently, prints updated cross-validated accuracy, and saves a new
`.joblib` if you add a `joblib.dump(...)` call (see the model-saving
snippet used to produce this file).
