import json
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.core.config import settings
from app.services.data_service import data_service

router = APIRouter()

@router.get("/map/geojson")
def get_india_geojson():
    if not settings.GEOJSON_PATH.exists():
        raise HTTPException(status_code=404, detail="India GeoJSON not found on server.")
    with open(settings.GEOJSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

@router.get("/map/indicators")
def get_map_indicators(
    indicator: str = Query("anc4_or_more_pct", description="Selected indicator key")
):
    df = data_service.get_dataframe()
    if indicator not in df.columns:
        indicator = "anc4_or_more_pct"

    # Compute state averages for choropleth mapping
    state_agg = df.groupby(["state_name", "state_code"])[indicator].agg(["mean", "count", "min", "max"]).reset_index()
    state_agg.rename(columns={"mean": "value", "count": "districts_reported"}, inplace=True)
    state_agg["value"] = state_agg["value"].round(1)

    # National benchmark for this indicator
    national_mean = round(float(df[indicator].mean()), 1)
    national_min = round(float(df[indicator].min()), 1)
    national_max = round(float(df[indicator].max()), 1)

    return {
        "indicator": indicator,
        "national_mean": national_mean,
        "range": {"min": national_min, "max": national_max},
        "states": state_agg.to_dict(orient="records")
    }

@router.get("/map/district-detail")
def get_district_map_detail(
    state_name: str = Query(..., description="State name")
):
    df = data_service.get_dataframe()
    districts = df[df["state_name"].str.lower() == state_name.lower()]
    if districts.empty:
        raise HTTPException(status_code=404, detail=f"No district records found for state '{state_name}'")

    state_avg = districts[[
        "anc4_or_more_pct", "institutional_delivery_pct", "skilled_birth_attendance_pct",
        "postnatal_care_pct", "ifa_100_days_pct"
    ]].mean().round(1).to_dict()

    return {
        "state_name": state_name,
        "total_districts": len(districts),
        "state_averages": state_avg,
        "districts": districts.to_dict(orient="records")
    }
