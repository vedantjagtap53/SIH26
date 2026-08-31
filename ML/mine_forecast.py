import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.model_selection import GroupKFold
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.inspection import permutation_importance
from openpyxl import load_workbook
from openpyxl.styles import Font, PatternFill
INPUT_FILE = 'SIH-Dataset__4_.xlsx'
OUTPUT_FILE = 'SIH-Dataset_with_scores_2526_2627.xlsx'
SCORE_COLS = ['score1819', 'score1920', 'score2021', 'score2122', 'score2223', 'score2324', 'score2425']
STAR_COLS = ['star1819', 'star1920', 'star2021', 'star2122', 'star2223', 'star2324', 'Star2425']
DEATH_ALIGNED_COLS = [None, 'death2019', 'death2020', 'death2021', 'death2022', 'death2023', 'fatalAccidents2425']
WINDOW = 2
CAT_FEATURE_IDX = [11]

def load_and_prepare(path):
    df = pd.read_excel(path)
    for c in SCORE_COLS + STAR_COLS:
        df[c] = pd.to_numeric(df[c], errors='coerce')
    df['subsidiary_norm'] = df['Subsidiary\n/Company'].str.upper().str.strip()
    df['subsidiary_code'] = pd.Categorical(df['subsidiary_norm']).codes.astype(float)
    df['ec'] = pd.to_numeric(df['ec'], errors='coerce')
    df['fc'] = pd.to_numeric(df['fc'], errors='coerce')
    death_arr = np.full((len(df), 7), np.nan)
    for idx, col in enumerate(DEATH_ALIGNED_COLS):
        if col is not None:
            death_arr[:, idx] = pd.to_numeric(df[col], errors='coerce').values
    df.attrs['death_arr'] = death_arr
    return df

def build_training_windows(df):
    score_arr = df[SCORE_COLS].values
    star_arr = df[STAR_COLS].values
    death_arr = df.attrs['death_arr']
    ec_arr = df['ec'].values
    fc_arr = df['fc'].values
    sub_arr = df['subsidiary_code'].values
    X_rows, y_rows, groups = ([], [], [])
    for i in range(len(df)):
        for start in range(0, 7 - WINDOW):
            s_win = score_arr[i, start:start + WINDOW]
            st_win = star_arr[i, start:start + WINDOW]
            d_win = death_arr[i, start:start + WINDOW]
            target = score_arr[i, start + WINDOW]
            if np.isnan(target):
                continue
            feats = list(s_win) + list(st_win) + list(d_win) + [np.nanmean(s_win), np.nanmean(st_win), np.nanmean(d_win), ec_arr[i], fc_arr[i], sub_arr[i]]
            X_rows.append(feats)
            y_rows.append(target)
            groups.append(i)
    X = np.array(X_rows, dtype=float)
    y = np.array(y_rows, dtype=float)
    groups = np.array(groups)
    return (X, y, groups)

def make_model():
    return HistGradientBoostingRegressor(max_depth=3, learning_rate=0.03, max_iter=200, l2_regularization=1.0, random_state=42, categorical_features=CAT_FEATURE_IDX)

def blended_predict(model, X, last_score_col_idx=1):
    model_pred = model.predict(X)
    naive = X[:, last_score_col_idx].copy()
    nan_mask = np.isnan(naive)
    naive[nan_mask] = model_pred[nan_mask]
    return 0.5 * model_pred + 0.5 * naive

def cross_validate(X, y, groups, n_splits=5):
    gkf = GroupKFold(n_splits=n_splits)
    maes, r2s = ([], [])
    for train_idx, test_idx in gkf.split(X, y, groups):
        model = make_model()
        model.fit(X[train_idx], y[train_idx])
        pred = blended_predict(model, X[test_idx])
        maes.append(mean_absolute_error(y[test_idx], pred))
        r2s.append(r2_score(y[test_idx], pred))
    return (np.mean(maes), np.mean(r2s))

def report_feature_importance(model, X, y):
    feat_names = ['score_t1', 'score_t2', 'star_t1', 'star_t2', 'death_t1', 'death_t2', 'mean_score', 'mean_star', 'mean_death', 'ec', 'fc', 'subsidiary_code']
    result = permutation_importance(model, X, y, n_repeats=10, random_state=42)
    ranked = sorted(zip(feat_names, result.importances_mean), key=lambda t: -t[1])
    for name, imp in ranked:
        print(f'  {name:15s} {imp:.4f}')

def predict_score2526(df, model):
    score_arr = df[SCORE_COLS].values
    star_arr = df[STAR_COLS].values
    death_arr = df.attrs['death_arr']
    s_win = score_arr[:, [5, 6]]
    st_win = star_arr[:, [5, 6]]
    d_win = death_arr[:, [5, 6]]
    X_pred = np.column_stack([s_win, st_win, d_win, np.nanmean(s_win, axis=1), np.nanmean(st_win, axis=1), np.nanmean(d_win, axis=1), df['ec'].values, df['fc'].values, df['subsidiary_code'].values])
    pred = blended_predict(model, X_pred)
    return np.clip(np.round(pred, 1), 0, 100)

def predict_score2627(df, model, score2526):
    score_arr = df[SCORE_COLS].values
    star_arr = df[STAR_COLS].values
    death_arr = df.attrs['death_arr']
    s_win = np.column_stack([score_arr[:, 6], score2526])
    st_win = np.column_stack([star_arr[:, 6], np.full(len(df), np.nan)])
    d_win = np.column_stack([death_arr[:, 6], np.full(len(df), np.nan)])
    X_pred = np.column_stack([s_win, st_win, d_win, np.nanmean(s_win, axis=1), np.nanmean(st_win, axis=1), np.nanmean(d_win, axis=1), df['ec'].values, df['fc'].values, df['subsidiary_code'].values])
    pred = blended_predict(model, X_pred)
    return np.clip(np.round(pred, 1), 0, 100)

def write_output(df, path_in, path_out):
    wb = load_workbook(path_in)
    ws = wb.active
    header_font = Font(name='Arial', bold=True)
    fill_2526 = PatternFill(start_color='FFF2CC', end_color='FFF2CC', fill_type='solid')
    fill_2627 = PatternFill(start_color='D9E1F2', end_color='D9E1F2', fill_type='solid')
    next_col = ws.max_column + 1
    ws.cell(row=1, column=next_col, value='score2526').font = header_font
    for i, val in enumerate(df['score2526'].values, start=2):
        c = ws.cell(row=i, column=next_col, value=float(val))
        c.font = Font(name='Arial')
        c.fill = fill_2526
    next_col += 1
    ws.cell(row=1, column=next_col, value='score2627').font = header_font
    for i, val in enumerate(df['score2627'].values, start=2):
        c = ws.cell(row=i, column=next_col, value=float(val))
        c.font = Font(name='Arial')
        c.fill = fill_2627
    wb.save(path_out)

def main():
    df = load_and_prepare(INPUT_FILE)
    X, y, groups = build_training_windows(df)
    print(f'Training examples: {X.shape}')
    mae, r2 = cross_validate(X, y, groups)
    print(f'Cross-validated (GroupKFold, mine-grouped) blended MAE: {mae:.2f}, R2: {r2:.3f}')
    final_model = make_model()
    final_model.fit(X, y)
    print('\nPermutation feature importance:')
    report_feature_importance(final_model, X, y)
    df['score2526'] = predict_score2526(df, final_model)
    df['score2627'] = predict_score2627(df, final_model, df['score2526'].values)
    write_output(df, INPUT_FILE, OUTPUT_FILE)
    print(f'\nSaved: {OUTPUT_FILE}')
if __name__ == '__main__':
    main()