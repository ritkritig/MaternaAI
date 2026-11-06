from fastapi import APIRouter
from app.services.data_service import data_service
from app.schemas.data_models import AccessibilityIndexRequest
from app.analytics.index_calculator import calculate_accessibility_index

router = APIRouter()

@router.post("/accessibility/calculate")
def compute_index(req: AccessibilityIndexRequest):
    df = data_service.get_dataframe()
    return calculate_accessibility_index(
        df=df,
        weights=req.weights,
        scale=req.scale
    )

@router.get("/accessibility/default")
def get_default_index():
    df = data_service.get_dataframe()
    return calculate_accessibility_index(df)
