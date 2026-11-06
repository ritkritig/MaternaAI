from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class IndicatorSummary(BaseModel):
    mean: float
    median: float
    std: float
    min: float
    max: float
    q25: float
    q75: float
    skewness: float
    outlier_count: int

class DescriptiveResponse(BaseModel):
    total_records: int
    features_analyzed: List[str]
    summary: Dict[str, IndicatorSummary]
    distribution_bins: Dict[str, List[Dict[str, Any]]]

class CorrelationResponse(BaseModel):
    indicators: List[str]
    matrix: List[List[float]]
    top_positive_correlations: List[Dict[str, Any]]
    top_negative_correlations: List[Dict[str, Any]]

class AccessibilityIndexRequest(BaseModel):
    weights: Dict[str, float] = Field(
        default_factory=lambda: {
            "anc4_or_more_pct": 0.25,
            "institutional_delivery_pct": 0.25,
            "skilled_birth_attendance_pct": 0.20,
            "postnatal_care_pct": 0.15,
            "ifa_100_days_pct": 0.15
        }
    )
    scale: str = "0_to_100"

class DistrictIndexResult(BaseModel):
    district_id: str
    district_name: str
    state_name: str
    region: str
    accessibility_index: float
    tier: str
    indicators: Dict[str, float]
    radar_components: Dict[str, float]

class AccessibilityIndexResponse(BaseModel):
    total_evaluated: int
    national_mean_index: float
    is_synthetic_demonstration: Optional[bool] = None
    weights_applied: Dict[str, float]
    tier_distribution: Dict[str, int]
    top_performing_districts: List[DistrictIndexResult]
    underserved_districts: List[DistrictIndexResult]
    state_rankings: List[Dict[str, Any]]
    sensitivity_analysis: Optional[List[Dict[str, Any]]] = None
    methodology_note: Optional[str] = None

class ClusteringRequest(BaseModel):
    features: List[str] = Field(
        default_factory=lambda: [
            "anc4_or_more_pct",
            "institutional_delivery_pct",
            "skilled_birth_attendance_pct",
            "postnatal_care_pct",
            "ifa_100_days_pct"
        ]
    )
    n_clusters: int = Field(default=3, ge=2, le=8)
    random_state: int = 42

class ClusterProfile(BaseModel):
    cluster_id: int
    name: str
    description: str
    count: int
    percentage: float
    mean_indicators: Dict[str, float]

class ClusteringResponse(BaseModel):
    n_clusters: int
    silhouette_score: float
    features_used: List[str]
    cluster_profiles: List[ClusterProfile]
    pca_data: List[Dict[str, Any]]
    silhouette_comparison: Dict[int, float]

class TrainModelRequest(BaseModel):
    target_variable: str = "institutional_delivery_pct"
    feature_variables: List[str] = Field(
        default_factory=lambda: [
            "anc4_or_more_pct",
            "first_trimester_anc_pct",
            "ifa_100_days_pct",
            "female_literacy_rate_pct",
            "rural_population_pct",
            "below_poverty_line_pct",
            "phc_chc_density_per_100k"
        ]
    )
    model_type: str = "random_forest"
    test_size: float = 0.2
    n_estimators: int = 100
    random_state: int = 42

class ModelEvaluationMetrics(BaseModel):
    mae: float
    rmse: float
    r2_score: float
    cross_val_r2_mean: float
    cross_val_r2_std: float

class TrainModelResponse(BaseModel):
    model_name: str
    target_variable: str
    features_used: List[str]
    train_samples: int
    test_samples: int
    is_synthetic_demonstration: Optional[bool] = None
    metrics: ModelEvaluationMetrics
    feature_importances: List[Dict[str, Any]]
    predictions_vs_actual: List[Dict[str, float]]
    baseline_linear_r2: Optional[float] = None
    scientific_note: Optional[str] = None

class ResearchInsight(BaseModel):
    id: str
    category: str
    title: str
    finding: str
    supporting_metric: str
    relevant_regions: List[str]
    methodology: str
    limitations: str
    confidence_level: str

class InsightsResponse(BaseModel):
    total_insights: int
    generated_at: str
    is_synthetic_demonstration: Optional[bool] = None
    dataset_coverage: str
    insights: List[ResearchInsight]
