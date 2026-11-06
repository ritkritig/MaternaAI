from fastapi import APIRouter
from app.services.data_service import data_service
from app.analytics.regional import compute_regional_comparison
from app.analytics.correlation import compute_correlation_analysis
from app.analytics.index_calculator import calculate_accessibility_index

router = APIRouter()

@router.get("/dashboard/summary")
def get_dashboard_summary():
    df = data_service.get_dataframe()
    metadata = data_service.get_metadata()
    is_synth = data_service.is_synthetic()

    total_districts = int(df["district_id"].nunique())
    total_states = int(df["state_name"].nunique())
    
    indicators = [
        "anc4_or_more_pct",
        "institutional_delivery_pct",
        "skilled_birth_attendance_pct",
        "postnatal_care_pct",
        "ifa_100_days_pct",
        "first_trimester_anc_pct"
    ]
    total_indicators = len(indicators)

    index_res = calculate_accessibility_index(df)
    tier_dist = index_res.get("tier_distribution", {})
    underserved_count = int(
        tier_dist.get("Underserved / Critical Priority", 0) + 
        tier_dist.get("Vulnerable / Emerging", 0)
    )

    regional_data = compute_regional_comparison(df)
    disparities = regional_data.get("disparities", [])
    corr = compute_correlation_analysis(df, indicators)

    indicator_distributions = []
    for ind in indicators:
        mean_val = round(float(df[ind].mean()), 1)
        median_val = round(float(df[ind].median()), 1)
        min_val = round(float(df[ind].min()), 1)
        max_val = round(float(df[ind].max()), 1)
        indicator_distributions.append({
            "indicator": ind,
            "mean": mean_val,
            "median": median_val,
            "min": min_val,
            "max": max_val
        })

    return {
        "kpis": {
            "total_districts": total_districts,
            "total_states": total_states,
            "total_indicators": total_indicators,
            "underserved_regions": underserved_count,
            "national_mean_accessibility_index": index_res.get("national_mean_index", 0.0),
            "is_synthetic": is_synth
        },
        "metadata": metadata,
        "disclaimer": (
            "NOTICE: The active dataset is a calibrated synthetic simulation generated from state-level "
            "NFHS-5 benchmarks. The displayed findings represent prototype demonstration values, not actual "
            "field-validated clinical observations." if is_synth else "Authentic user-uploaded dataset active."
        ),
        "indicator_distributions": indicator_distributions,
        "region_aggregates": regional_data.get("region_aggregates", []),
        "state_aggregates": regional_data.get("state_aggregates", [])[:15],
        "disparities": disparities,
        "correlation": corr
    }
