from fastapi import APIRouter, Query
from typing import Optional, List
from app.services.data_service import data_service
from app.analytics.descriptive import compute_descriptive_analysis
from app.analytics.correlation import compute_correlation_analysis
from app.analytics.regional import compute_regional_comparison

router = APIRouter()

@router.get("/analysis/descriptive")
def get_descriptive():
    df = data_service.get_dataframe()
    return compute_descriptive_analysis(df)

@router.get("/analysis/correlation")
def get_correlation():
    df = data_service.get_dataframe()
    return compute_correlation_analysis(df)

@router.get("/analysis/regional-comparison")
def get_regional_comparison(
    states: Optional[str] = Query(None, description="Comma-separated state names"),
    districts: Optional[str] = Query(None, description="Comma-separated district names")
):
    df = data_service.get_dataframe()
    state_list = [s.strip() for s in states.split(",")] if states else None
    district_list = [d.strip() for d in districts.split(",")] if districts else None
    result = compute_regional_comparison(df, states=state_list, districts=district_list)
    result["is_synthetic_demonstration"] = data_service.is_synthetic()
    return result
