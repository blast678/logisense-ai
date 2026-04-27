"""
traffic.py -- TomTom Traffic Flow threat detection for supply chain chokepoints.

Uses TomTom Flow Segment Data API (v4).  Requires env var TOMTOM_KEY.
Limits concurrent requests with asyncio.Semaphore(5).
"""

import os
import asyncio
import httpx
from datetime import datetime
from typing import List, Dict, Any

# ---------------------------------------------------------------------------
# Monitoring points -- major chokepoints on each corridor
# ---------------------------------------------------------------------------
MONITORING_POINTS = [
    {"name": "Navi Mumbai Junction", "lat": 19.0330, "lng": 73.0297, "corridor": "MUM_PUNE"},
    {"name": "Expressway Toll (Khandala)", "lat": 18.7500, "lng": 73.4000, "corridor": "MUM_PUNE"},
    {"name": "Pune City Entry", "lat": 18.5204, "lng": 73.8567, "corridor": "MUM_PUNE"},
]

_TOMTOM_FLOW_URL = (
    "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
)

# ---------------------------------------------------------------------------
# Per-point fetch helper (runs inside the semaphore)
# ---------------------------------------------------------------------------
async def _fetch_point(
    client: httpx.AsyncClient,
    sem: asyncio.Semaphore,
    point: Dict[str, Any],
    api_key: str,
) -> Dict[str, Any] | None:
    """Fetch TomTom flow data for a single lat/lng. Returns a threat dict or None."""
    async with sem:
        try:
            params = {
                "point": f"{point['lat']},{point['lng']}",
                "key": api_key,
            }
            response = await client.get(_TOMTOM_FLOW_URL, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()

            flow = data.get("flowSegmentData", {})
            current_speed = float(flow.get("currentSpeed", 0))
            free_flow_speed = float(flow.get("freeFlowSpeed", 1))  # avoid /0
            road_closure = flow.get("roadClosure", False)

            # Guard against zero free-flow speed from API noise
            if free_flow_speed <= 0:
                free_flow_speed = 1.0

            congestion_ratio = (free_flow_speed - current_speed) / free_flow_speed
            congestion_ratio = max(0.0, congestion_ratio)

            # Severity classification
            if road_closure or congestion_ratio > 0.80:
                severity = "CRITICAL"
                certainty = 0.95
                if road_closure:
                    reason = f"Road closure detected at {point['name']}"
                else:
                    reason = (
                        f"Severe congestion at {point['name']}: "
                        f"speed dropped {congestion_ratio * 100:.0f}% below free-flow"
                    )
            elif congestion_ratio > 0.50:
                severity = "HIGH"
                certainty = 0.80
                reason = (
                    f"Heavy traffic at {point['name']}: "
                    f"speed {current_speed:.0f} km/h vs free-flow {free_flow_speed:.0f} km/h"
                )
            elif congestion_ratio > 0.25:
                severity = "MEDIUM"
                certainty = 0.65
                reason = (
                    f"Moderate congestion at {point['name']}: "
                    f"congestion ratio {congestion_ratio * 100:.0f}%"
                )
            else:
                return None  # Below threshold -- no threat

            return {
                "source": "TomTom Traffic",
                "source_type": "traffic",
                "is_disruption": True,
                "severity": severity,
                "location": point["name"],
                "lat": point["lat"],
                "lng": point["lng"],
                "reason": reason,
                "detected_at": datetime.now().isoformat(),
                "category": "Transport",
                "certainty": certainty,
                "corridor": point["corridor"],
            }

        except Exception:
            # Silently skip failures for individual points
            return None


# ---------------------------------------------------------------------------
# Main async function
# ---------------------------------------------------------------------------
async def fetch_traffic_threats() -> List[Dict[str, Any]]:
    """
    Check all MONITORING_POINTS for congestion/closures using TomTom Traffic API.
    Returns a list of unified-schema threat dicts (only MEDIUM+ events).
    Requires env var TOMTOM_KEY; returns [] immediately if key is missing.
    """
    api_key = os.getenv("TOMTOM_KEY", "")
    if not api_key:
        print("[Traffic] FAILED TOMTOM_KEY not set -- skipping traffic source")
        return []

    threats: List[Dict[str, Any]] = []
    sem = asyncio.Semaphore(5)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            tasks = [
                _fetch_point(client, sem, point, api_key)
                for point in MONITORING_POINTS
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)

        for result in results:
            if isinstance(result, dict):
                threats.append(result)

    except Exception as e:
        print(f"[Traffic] FAILED Exception: {e}")

    return threats
