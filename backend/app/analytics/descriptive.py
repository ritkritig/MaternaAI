import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, Any, List

def compute_descriptive_analysis(df: pd.DataFrame, features: List[str] = None) -> Dict[str, Any]:
    if features is None:
        features = [
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

    # Filter to existing numeric columns
    valid_features = [f for f in features if f in df.columns and pd.api.types.is_numeric_dtype(df[f])]
    
    summary = {}
    distribution_bins = {}

    for col in valid_features:
        series = df[col].dropna()
        if len(series) == 0:
            continue

        q25 = float(np.percentile(series, 25))
        q75 = float(np.percentile(series, 75))
        iqr = q75 - q25
        lower_bound = q25 - 1.5 * iqr
        upper_bound = q75 + 1.5 * iqr
        outlier_count = int(((series < lower_bound) | (series > upper_bound)).sum())

        skew = float(stats.skew(series)) if len(series) > 2 else 0.0

        summary[col] = {
            "mean": round(float(series.mean()), 2),
            "median": round(float(series.median()), 2),
            "std": round(float(series.std()), 2),
            "min": round(float(series.min()), 2),
            "max": round(float(series.max()), 2),
            "q25": round(q25, 2),
            "q75": round(q75, 2),
            "skewness": round(skew, 2),
            "outlier_count": outlier_count
        }

        # Generate 10-bin histogram for distribution chart
        hist, bin_edges = np.histogram(series, bins=10)
        bins_data = []
        for i in range(len(hist)):
            label = f"{round(bin_edges[i], 1)}-{round(bin_edges[i+1], 1)}"
            bins_data.append({
                "range": label,
                "count": int(hist[i]),
                "min": round(float(bin_edges[i]), 1),
                "max": round(float(bin_edges[i+1]), 1)
            })
        distribution_bins[col] = bins_data

    return {
        "total_records": len(df),
        "features_analyzed": valid_features,
        "summary": summary,
        "distribution_bins": distribution_bins
    }
