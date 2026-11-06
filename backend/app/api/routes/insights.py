from fastapi import APIRouter
from app.services.data_service import data_service
from app.analytics.insights import generate_research_insights

router = APIRouter()

@router.get("/insights")
def get_insights():
    df = data_service.get_dataframe()
    return generate_research_insights(df)
