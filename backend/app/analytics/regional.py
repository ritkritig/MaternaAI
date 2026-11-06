import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional

INDICATOR_COLS = [
    "anc4_or_more_pct",
    "institutional_delivery_pct",
    "skilled_birth_attendance_pct",
    "postnatal_care_pct",
    "ifa_100_days_pct",
    "first_trimester_anc_pct",
    "maternal_mortality_ratio_proxy",
    "female_literacy_rate_pct"
]

def compute_regional_comparison(
    df: pd.DataFrame,
    regions: Optional[List[str]] = None,
    states: Optional[List[str]] = None,
    districts: Optional[List[str]] = None
) -> Dict[str, Any]:
    # Calculate National Averages
    national_avg = df[INDICATOR_COLS].mean().round(2).to_dict()

    # State Aggregations
    state_agg = df.groupby("state_name")[INDICATOR_COLS].mean().round(2).reset_index()
    state_agg["district_count"] = df.groupby("state_name")["district_id"].count().values
    state_list = state_agg.to_dict(orient="records")

    # Regional Aggregations
    region_agg = df.groupby("region")[INDICATOR_COLS].mean().round(2).reset_index()
    region_list = region_agg.to_dict(orient="records")

    # Selected Items Comparison
    comparisons = []

    if states:
        for s in states:
            sdf = df[df["state_name"].str.lower() == s.lower()]
            if not sdf.empty:
                s_mean = sdf[INDICATOR_COLS].mean().round(2).to_dict()
                comparisons.append({
                    "entity_type": "state",
                    "name": sdf["state_name"].iloc[0],
                    "region": sdf["region"].iloc[0],
                    "district_count": len(sdf),
                    "indicators": s_mean,
                    "diff_from_national": {
                        k: round(s_mean[k] - national_avg[k], 2) for k in INDICATOR_COLS if k in s_mean
                    }
                })

    if districts:
        for d in districts:
            ddf = df[df["district_name"].str.lower() == d.lower()]
            if not ddf.empty:
                row = ddf.iloc[0]
                dist_data = {col: float(row[col]) for col in INDICATOR_COLS if col in row}
                state_name = row["state_name"]
                state_mean = df[df["state_name"] == state_name][INDICATOR_COLS].mean().round(2).to_dict()
                
                comparisons.append({
                    "entity_type": "district",
                    "name": row["district_name"],
                    "state": state_name,
                    "region": row["region"],
                    "indicators": dist_data,
                    "diff_from_state": {
                        k: round(dist_data[k] - state_mean[k], 2) for k in INDICATOR_COLS if k in dist_data
                    },
                    "diff_from_national": {
                        k: round(dist_data[k] - national_avg[k], 2) for k in INDICATOR_COLS if k in dist_data
                    }
                })

    # Disparity metrics (inter-state variance)
    disparities = []
    for col in INDICATOR_COLS:
        col_min = float(state_agg[col].min())
        col_max = float(state_agg[col].max())
        col_std = float(state_agg[col].std())
        best_state = state_agg.loc[state_agg[col].idxmax()]["state_name"]
        worst_state = state_agg.loc[state_agg[col].idxmin()]["state_name"]

        disparities.append({
            "indicator": col,
            "min_val": col_min,
            "max_val": col_max,
            "gap": round(col_max - col_min, 2),
            "std_dev": round(col_std, 2),
            "highest_state": best_state,
            "lowest_state": worst_state
        })

    return {
        "national_averages": national_avg,
        "state_aggregates": state_list,
        "region_aggregates": region_list,
        "comparisons": comparisons,
        "disparities": disparities
    }
