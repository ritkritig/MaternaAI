import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

backend_path = Path(__file__).resolve().parent.parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.main import app

client = TestClient(app)

def test_upload_missing_required_column():
    csv_content = b"district_name,some_col\nDistrict 1,12.5"
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("invalid.csv", csv_content, "text/csv")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert "missing mandatory column" in data["error"]

def test_upload_missing_indicator_column():
    csv_content = b"state_name,random_col\nKerala,42"
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("no_indicators.csv", csv_content, "text/csv")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert "must include at least one maternal healthcare indicator" in data["error"]

def test_upload_valid_with_imputation():
    csv_content = (
        b"district_name,state_name,anc4_or_more_pct,institutional_delivery_pct\n"
        b"Kollam,Kerala,80.5,99.0\n"
        b"Wayanad,Kerala,,98.5\n"
        b"Alappuzha,Kerala,75.0,99.2\n"
    )
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("valid_sample.csv", csv_content, "text/csv")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["metadata"]["is_synthetic"] is False
    assert data["metadata"]["imputed_cells"] == 1

    # Reset back to default demo dataset
    reset_res = client.post("/api/datasets/reset")
    assert reset_res.status_code == 200
    assert reset_res.json()["metadata"]["is_synthetic"] is True
