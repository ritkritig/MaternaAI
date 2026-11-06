import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure backend path is in sys.path
backend_path = Path(__file__).resolve().parent.parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.main import app
from app.services.data_service import data_service

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_dashboard_summary():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert data["kpis"]["total_districts"] >= 700
    assert data["kpis"]["total_states"] == 36
    assert "indicator_distributions" in data
    assert "disparities" in data

def test_datasets_endpoints():
    response = client.get("/api/datasets")
    assert response.status_code == 200
    assert "active_dataset" in response.json()

    preview = client.get("/api/datasets/preview?limit=10")
    assert preview.status_code == 200
    assert len(preview.json()["records"]) == 10

def test_analysis_endpoints():
    desc = client.get("/api/analysis/descriptive")
    assert desc.status_code == 200
    assert "summary" in desc.json()
    assert "anc4_or_more_pct" in desc.json()["summary"]

    corr = client.get("/api/analysis/correlation")
    assert corr.status_code == 200
    assert "matrix" in corr.json()

def test_accessibility_index():
    payload = {
        "weights": {
            "anc4_or_more_pct": 0.3,
            "institutional_delivery_pct": 0.3,
            "skilled_birth_attendance_pct": 0.2,
            "postnatal_care_pct": 0.1,
            "ifa_100_days_pct": 0.1
        }
    }
    res = client.post("/api/accessibility/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total_evaluated"] >= 700
    assert "national_mean_index" in data
    assert len(data["top_performing_districts"]) == 10
    assert len(data["underserved_districts"]) == 10

def test_ml_clustering():
    payload = {
        "features": ["anc4_or_more_pct", "institutional_delivery_pct", "skilled_birth_attendance_pct"],
        "n_clusters": 3,
        "random_state": 42
    }
    res = client.post("/api/ml/clustering", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["n_clusters"] == 3
    assert len(data["cluster_profiles"]) == 3
    assert "silhouette_score" in data

def test_ml_prediction():
    payload = {
        "target_variable": "institutional_delivery_pct",
        "feature_variables": ["anc4_or_more_pct", "female_literacy_rate_pct", "rural_population_pct"],
        "model_type": "random_forest",
        "n_estimators": 50,
        "random_state": 42
    }
    res = client.post("/api/ml/train", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "metrics" in data
    assert data["metrics"]["r2_score"] > 0
    assert len(data["feature_importances"]) > 0

def test_research_insights():
    res = client.get("/api/insights")
    assert res.status_code == 200
    data = res.json()
    assert data["total_insights"] >= 4
    assert len(data["insights"]) >= 4
