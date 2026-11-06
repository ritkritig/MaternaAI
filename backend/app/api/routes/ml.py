from fastapi import APIRouter, HTTPException
from app.services.data_service import data_service
from app.schemas.data_models import ClusteringRequest, TrainModelRequest
from app.ml.clustering import run_kmeans_clustering
from app.ml.prediction import train_predictive_model

router = APIRouter()

@router.post("/ml/clustering")
def perform_clustering(req: ClusteringRequest):
    try:
        df = data_service.get_dataframe()
        res = run_kmeans_clustering(
            df=df,
            features=req.features,
            n_clusters=req.n_clusters,
            random_state=req.random_state
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/ml/train")
def train_model(req: TrainModelRequest):
    try:
        df = data_service.get_dataframe()
        res = train_predictive_model(
            df=df,
            target_variable=req.target_variable,
            feature_variables=req.feature_variables,
            model_type=req.model_type,
            test_size=req.test_size,
            n_estimators=req.n_estimators,
            random_state=req.random_state
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/ml/features")
def get_available_ml_features():
    df = data_service.get_dataframe()
    numeric_cols = [c for c in df.columns if df[c].dtype in ['float64', 'int64'] and not c.endswith('_id')]
    return {
        "candidate_features": numeric_cols,
        "recommended_targets": [
            "institutional_delivery_pct",
            "anc4_or_more_pct",
            "skilled_birth_attendance_pct",
            "postnatal_care_pct"
        ],
        "recommended_predictors": [
            "female_literacy_rate_pct",
            "rural_population_pct",
            "below_poverty_line_pct",
            "phc_chc_density_per_100k",
            "first_trimester_anc_pct",
            "ifa_100_days_pct"
        ]
    }
