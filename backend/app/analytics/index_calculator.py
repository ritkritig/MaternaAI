import numpy as np
import pandas as pd
from typing import Dict, Any, List
from app.services.data_service import data_service

# Directionality map: specify if indicator is positive (higher = better accessibility)
# or negative (higher = worse accessibility / vulnerability)
NEGATIVE_DIRECTION_INDICATORS = {
    "maternal_mortality_ratio_proxy",
    "below_poverty_line_pct",
    "rural_population_pct"
}

def calculate_accessibility_index(
    df: pd.DataFrame,
    weights: Dict[str, float] = None,
    scale: str = "0_to_100"
) -> Dict[str, Any]:
    """
    Computes the MaternaAI Experimental Accessibility Index using Min-Max normalization
    with indicator directionality correction and sensitivity analysis.
    """
    if weights is None or len(weights) == 0:
        weights = {
            "anc4_or_more_pct": 0.25,
            "institutional_delivery_pct": 0.25,
            "skilled_birth_attendance_pct": 0.20,
            "postnatal_care_pct": 0.15,
            "ifa_100_days_pct": 0.15
        }

    # Normalize weights so they sum to 1.0
    weight_sum = sum(weights.values())
    if weight_sum <= 0:
        weight_sum = 1.0
    normalized_weights = {k: v / weight_sum for k, v in weights.items()}

    working_df = df.copy()

    # Calculate normalized component scores (0 to 100) with directionality correction
    composite_series = pd.Series(0.0, index=working_df.index)

    for indicator, w in normalized_weights.items():
        if indicator in working_df.columns:
            series = working_df[indicator].fillna(working_df[indicator].median())
            min_val = float(series.min())
            max_val = float(series.max())
            denom = (max_val - min_val) if max_val > min_val else 1.0
            
            scaled = (series - min_val) / denom * 100.0

            # Directionality correction: Invert negative indicators so higher score always = better accessibility
            if indicator in NEGATIVE_DIRECTION_INDICATORS:
                scaled = 100.0 - scaled

            working_df[f"norm_{indicator}"] = scaled
            composite_series += scaled * w

    working_df["accessibility_index"] = composite_series.round(2)

    # Classify into Tiers:
    def assign_tier(val: float) -> str:
        if val >= 75.0:
            return "High Accessibility"
        elif val >= 55.0:
            return "Moderate Accessibility"
        elif val >= 40.0:
            return "Vulnerable / Emerging"
        else:
            return "Underserved / Critical Priority"

    working_df["tier"] = working_df["accessibility_index"].apply(assign_tier)
    tier_counts = working_df["tier"].value_counts().to_dict()

    # Sensitivity Analysis: Perturb weights by +/- 20% to assess ranking stability
    base_ranks = working_df["accessibility_index"].rank(ascending=False)
    rank_deltas = []
    
    for test_ind in normalized_weights.keys():
        perturbed_weights = dict(normalized_weights)
        perturbed_weights[test_ind] *= 1.2
        # Renormalize
        p_sum = sum(perturbed_weights.values())
        perturbed_weights = {k: v / p_sum for k, v in perturbed_weights.items()}

        p_composite = pd.Series(0.0, index=working_df.index)
        for ind, pw in perturbed_weights.items():
            if f"norm_{ind}" in working_df.columns:
                p_composite += working_df[f"norm_{ind}"] * pw

        p_ranks = p_composite.rank(ascending=False)
        mean_rank_shift = float(np.abs(base_ranks - p_ranks).mean())
        rank_deltas.append({
            "indicator": test_ind,
            "mean_rank_shift_positions": round(mean_rank_shift, 2)
        })

    # Format District Results
    results = []
    for _, row in working_df.iterrows():
        radar_comp = {}
        ind_vals = {}
        for ind in normalized_weights.keys():
            if ind in row:
                ind_vals[ind] = round(float(row[ind]), 1)
                radar_comp[ind] = round(float(row.get(f"norm_{ind}", 0.0)), 1)

        results.append({
            "district_id": str(row["district_id"]),
            "district_name": str(row["district_name"]),
            "state_name": str(row["state_name"]),
            "region": str(row["region"]),
            "accessibility_index": float(row["accessibility_index"]),
            "tier": str(row["tier"]),
            "indicators": ind_vals,
            "radar_components": radar_comp
        })

    sorted_results = sorted(results, key=lambda x: x["accessibility_index"], reverse=True)
    top_performers = sorted_results[:10]
    underserved = sorted(results, key=lambda x: x["accessibility_index"])[:10]

    # State Rankings
    state_rankings = (
        working_df.groupby("state_name")["accessibility_index"]
        .agg(["mean", "count"])
        .reset_index()
        .rename(columns={"mean": "mean_index", "count": "districts"})
        .sort_values(by="mean_index", ascending=False)
        .round(2)
        .to_dict(orient="records")
    )

    is_synth = data_service.is_synthetic()

    return {
        "total_evaluated": len(working_df),
        "national_mean_index": round(float(working_df["accessibility_index"].mean()), 2),
        "is_synthetic_demonstration": is_synth,
        "weights_applied": {k: round(v, 3) for k, v in normalized_weights.items()},
        "tier_distribution": tier_counts,
        "top_performing_districts": top_performers,
        "underserved_districts": underserved,
        "state_rankings": state_rankings,
        "sensitivity_analysis": rank_deltas,
        "methodology_note": (
            "MATERNAAI EXPERIMENTAL ACCESSIBILITY INDEX: Linear weighted composite model combining "
            "directionality-adjusted Min-Max normalized pillars. "
            + ("DEMONSTRATION RESULTS: Computed on calibrated synthetic demo data; results illustrate "
               "methodological mechanics and cannot be used for official policy or clinical intervention."
               if is_synth else
               "Computed on user-uploaded dataset.")
        )
    }
