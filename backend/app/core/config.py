import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_DIR = BASE_DIR.parent
DATA_DIR = PROJECT_DIR / "datasets"

class Settings(BaseModel):
    PROJECT_NAME: str = "MaternaAI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DESCRIPTION: str = "Maternal Healthcare Accessibility & Predictive Analytics Research Platform"
    BASE_DIR: Path = BASE_DIR
    PROJECT_DIR: Path = PROJECT_DIR
    DATA_DIR: Path = DATA_DIR
    DEMO_DATA_PATH: Path = DATA_DIR / "demo" / "india_maternal_health_district_data.csv"
    CLEANED_DATA_PATH: Path = DATA_DIR / "demo" / "cleaned_maternal_health_data.csv"
    GEOJSON_PATH: Path = DATA_DIR / "india_states.geojson"

settings = Settings()
