import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
from app.services.data_service import data_service

def train_predictive_model(
    df: pd.DataFrame,
    target_variable: str = "institutional_delivery_pct",
    feature_variables: List[str] = None,
    model_type: str = "random_forest",
    test_size: float = 0.2,
    n_estimators: int = 100,
    random_state: int = 42
) -> Dict[str, Any]:
    # Scientifically sound default predictors (pre-delivery, socioeconomic & structural)
    # Excludes post-delivery variables (e.g., postnatal_care_pct) to prevent temporal target leakage
    if feature_variables is None:
        feature_variables = [
            "anc4_or_more_pct",
            "first_trimester_anc_pct",
            "ifa_100_days_pct",
            "female_literacy_rate_pct",
            "rural_population_pct",
            "below_poverty_line_pct",
            "phc_chc_density_per_100k"
        ]

    # Validate target
    if target_variable not in df.columns:
        raise ValueError(f"Target variable '{target_variable}' not found in dataset.")

    # Validate features (excluding target and non-numeric)
    valid_features = [
        f for f in feature_variables 
        if f in df.columns and f != target_variable and pd.api.types.is_numeric_dtype(df[f])
    ]
    if len(valid_features) == 0:
        raise ValueError("At least one valid numeric predictor feature is required for modeling.")

    # Extract raw subset
    sub_df = df[[target_variable] + valid_features].copy()

    # Step 1: Perform Train / Test Split FIRST to avoid preprocessing data leakage
    X_raw = sub_df[valid_features]
    y_raw = sub_df[target_variable]

    # Check if target has missing values and drop only those rows
    valid_mask = ~y_raw.isnull()
    X_raw = X_raw[valid_mask]
    y_raw = y_raw[valid_mask]

    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X_raw, y_raw, test_size=test_size, random_state=random_state
    )

    # Step 2: Fit Imputer Strictly on X_train (No Test Leakage)
    train_medians = X_train_raw.median()
    X_train = X_train_raw.fillna(train_medians)
    X_test = X_test_raw.fillna(train_medians)

    # Step 3: Feature Scaling (Required for fair Linear Regression coefficient comparison)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Baseline Model: Linear Regression (fitted on scaled features for standardized coefficients)
    lr = LinearRegression()
    lr.fit(X_train_scaled, y_train)
    lr_pred = lr.predict(X_test_scaled)
    baseline_r2 = round(float(r2_score(y_test, lr_pred)), 3)

    # Primary Model Training & Cross-Validation on Training Fold
    if model_type == "linear_regression":
        model = lr
        # Standardized coefficients represent relative feature influence
        importances = [
            {
                "feature": f, 
                "importance": round(abs(float(coef)), 4), 
                "raw_coefficient": round(float(coef), 4)
            }
            for f, coef in zip(valid_features, lr.coef_)
        ]
        importances = sorted(importances, key=lambda x: x["importance"], reverse=True)
        cv_scores = cross_val_score(LinearRegression(), X_train_scaled, y_train, cv=5, scoring="r2")
        y_pred = lr.predict(X_test_scaled)
    else:
        rf = RandomForestRegressor(n_estimators=n_estimators, random_state=random_state)
        rf.fit(X_train, y_train)
        model = rf
        importances = [
            {"feature": f, "importance": round(float(imp), 4)}
            for f, imp in zip(valid_features, rf.feature_importances_)
        ]
        importances = sorted(importances, key=lambda x: x["importance"], reverse=True)
        cv_scores = cross_val_score(
            RandomForestRegressor(n_estimators=n_estimators, random_state=random_state),
            X_train, y_train, cv=5, scoring="r2"
        )
        y_pred = rf.predict(X_test)

    # Evaluation on Holdout Test Set
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(root_mean_squared_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))

    # Holdout predictions vs actual samples (up to 50 points)
    pred_vs_actual = []
    for actual, predicted in zip(y_test.iloc[:50], y_pred[:50]):
        pred_vs_actual.append({
            "actual": round(float(actual), 2),
            "predicted": round(float(predicted), 2),
            "residual": round(float(predicted - actual), 2)
        })

    is_synth = data_service.is_synthetic()

    disclaimer = (
        "DEMONSTRATION RESULTS ONLY: Model was evaluated on a synthetic demonstration dataset "
        "calibrated to state-level benchmarks. Metrics (R², MAE, RMSE) reflect simulated mathematical "
        "structure and cannot be interpreted as actual maternal healthcare predictive performance in India."
        if is_synth else
        "Model evaluated on user-uploaded observations using an 80/20 train/test holdout split and 5-fold CV. "
        "Associations do not establish direct clinical or policy causation."
    )

    return {
        "model_name": "Random Forest Regressor" if model_type == "random_forest" else "Linear Regression",
        "target_variable": target_variable,
        "features_used": valid_features,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "is_synthetic_demonstration": is_synth,
        "metrics": {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "r2_score": round(r2, 3),
            "cross_val_r2_mean": round(float(np.mean(cv_scores)), 3),
            "cross_val_r2_std": round(float(np.std(cv_scores)), 3)
        },
        "feature_importances": importances,
        "predictions_vs_actual": pred_vs_actual,
        "baseline_linear_r2": baseline_r2,
        "scientific_note": disclaimer
    }
