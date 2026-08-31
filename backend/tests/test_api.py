import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_ml_rankings():
    response = client.get("/api/v1/ml/rankings")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 15
    assert data[0]["rank"] == 1
    assert "risk_score" in data[0]
