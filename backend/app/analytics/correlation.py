import numpy as np
import pandas as pd
from typing import Dict, Any, List

def compute_correlation_analysis(df: pd.DataFrame, indicators: List[str] = None) -> Dict[str, Any]:
    if indicators is None:
        indicators = [
            "anc4_or_more_pct",
            "institutional_delivery_pct",
            "skilled_birth_attendance_pct",
            "postnatal_care_pct",
            "ifa_100_days_pct",
            "first_trimester_anc_pct",
            "maternal_mortality_ratio_proxy",
            "female_literacy_rate_pct",
            "phc_chc_density_per_100k",
            "below_poverty_line_pct"
        ]

    valid_cols = [c for c in indicators if c in df.columns and pd.api.types.is_numeric_dtype(df[c])]
    sub_df = df[valid_cols].dropna()

    corr_matrix = sub_df.corr().round(3)
    matrix_values = corr_matrix.values.tolist()

    # Find top pairs
    pairs = []
    n = len(valid_cols)
    for i in range(n):
        for j in range(i + 1, n):
            val = float(matrix_values[i][j])
            pairs.append({
                "var1": valid_cols[i],
                "var2": valid_cols[j],
                "correlation": val,
                "abs_correlation": abs(val)
            })

    pairs_sorted = sorted(pairs, key=lambda x: x["correlation"], reverse=True)
    top_pos = [p for p in pairs_sorted if p["correlation"] > 0][:5]
    top_neg = [p for p in sorted(pairs, key=lambda x: x["correlation"]) if p["correlation"] < 0][:5]

    return {
        "indicators": valid_cols,
        "matrix": matrix_values,
        "top_positive_correlations": top_pos,
        "top_negative_correlations": top_neg
    }
