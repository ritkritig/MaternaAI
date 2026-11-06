import io
from fastapi import APIRouter, UploadFile, File, Query, Response
from typing import Optional
from app.services.data_service import data_service

router = APIRouter()

@router.get("/datasets")
def list_datasets():
    metadata = data_service.get_metadata()
    return {
        "active_dataset": metadata,
        "available_presets": [
            {
                "id": "synthetic_demo_nfhs5_anchored",
                "name": "Synthetic Demonstration Dataset (State-Anchored NFHS-5 Simulation)",
                "records": 751,
                "coverage": "All 36 States/UTs",
                "is_synthetic": True,
                "survey_year": "2019-2021 Reference Period",
                "description": (
                    "Algorithmic demonstration dataset calibrated around published NFHS-5 state anchors. "
                    "599 unseeded districts carry generic placeholder names. Intended strictly for software "
                    "demonstration and methodological prototyping."
                )
            }
        ]
    }

@router.get("/datasets/preview")
def preview_dataset(
    state: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    return data_service.filter_data(
        state=state,
        region=region,
        search=search,
        limit=limit,
        offset=offset
    )

@router.get("/datasets/summary")
def get_dataset_summary():
    return data_service.get_summary_stats()

@router.post("/datasets/upload")
async def upload_dataset(file: UploadFile = File(...)):
    contents = await file.read()
    res = data_service.load_user_csv(contents, file.filename)
    return res

@router.get("/datasets/download")
def download_dataset():
    df = data_service.get_dataframe()
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    filename = "materna_ai_synthetic_demo_dataset.csv" if data_service.is_synthetic() else "materna_ai_cleaned_dataset.csv"
    response = Response(
        content=stream.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
    return response

@router.post("/datasets/reset")
def reset_dataset():
    data_service.load_default_dataset()
    return {
        "message": "Dataset reset to calibrated synthetic demonstration dataset",
        "metadata": data_service.get_metadata()
    }
