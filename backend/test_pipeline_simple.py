# test_pipeline_simple.py
# Single end-to-end test that calls the live server running at localhost:8000
# Run with: pytest -q -s test_pipeline_simple.py
# (Make sure: uvicorn app.main:app --reload  is running in another terminal)

import asyncio
import json
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_full_pipeline_endpoint():
    """
    Real-world end-to-end pipeline test.

    Calls /api/run-pipeline on the live server and validates:
      1. HTTP 200 response
      2. All required top-level keys present
      3. Sources list is a non-empty list
      4. threat count matches the threats array length
      5. fleet_actions block is well-formed
    """
    from unittest.mock import patch
    
    mock_threat = {
        "source": "TomTom Traffic",
        "source_type": "traffic",
        "is_disruption": True,
        "severity": "CRITICAL",
        "location": "Navi Mumbai Junction",
        "lat": 19.0330,
        "lng": 73.0297,
        "reason": "Simulated Severe congestion: 100% below free-flow",
        "detected_at": "2026-04-27T00:00:00",
        "category": "Transport",
        "certainty": 0.95,
        "corridor": "MUM_PUNE",
    }

    with patch("app.api.routes.disruptions.fetch_traffic_threats", return_value=[mock_threat]):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver", timeout=120) as client:
            resp = await client.get("/api/run-pipeline")

    # 1. HTTP status
    assert resp.status_code == 200, (
        f"Expected 200 but got {resp.status_code}. "
        f"Response body: {resp.text[:500]}"
    )

    payload = resp.json()

    # 2. Top-level schema
    required_keys = {
        "pipeline_run_at",
        "sources_checked",
        "sources_succeeded",
        "sources_failed",
        "total_threats_detected",
        "multi_source_confirmed",
        "threats",
        "fleet_actions",
    }
    missing = required_keys - set(payload.keys())
    assert not missing, f"Response is missing keys: {missing}"

    # 3. Sources
    assert isinstance(payload["sources_checked"], list), "sources_checked must be a list"
    assert len(payload["sources_checked"]) > 0, "At least one source must be checked"

    # 4. Threats count consistency
    assert payload["total_threats_detected"] == len(payload["threats"]), (
        "total_threats_detected does not match length of threats array"
    )

    # 5. Fleet actions
    fleet = payload["fleet_actions"]
    assert isinstance(fleet, dict), "fleet_actions must be a dict"
    assert "status" in fleet, "fleet_actions missing 'status'"
    assert "optimal_route" in fleet, "fleet_actions missing 'optimal_route'"

    # Pretty-print for visual confirmation
    print("\n\n========== PIPELINE RESULT ==========")
    print(f"Run at        : {payload['pipeline_run_at']}")
    print(f"Sources OK    : {payload['sources_succeeded']}")
    print(f"Sources FAILED: {payload['sources_failed']}")
    print(f"Threats found : {payload['total_threats_detected']}")
    print(f"Fleet status  : {fleet['status']}")
    print(f"Optimal route : {fleet['optimal_route']}")
    if payload["threats"]:
        print("\nTop threat:")
        print(json.dumps(payload["threats"][0], indent=2))
    print("=====================================\n")
