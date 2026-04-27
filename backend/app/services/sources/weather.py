"""
weather.py — Open-Meteo weather threat detection for supply chain corridors.

Batches ALL checkpoint locations in a single API call using comma-separated
lat/lng arrays. Checks only the current hour index to minimise latency.
No API key required.
"""

import os
import httpx
from datetime import datetime
from typing import List, Dict, Any

# ---------------------------------------------------------------------------
# Corridor Checkpoints
# ---------------------------------------------------------------------------
CHECKPOINTS = [
    {"name": "Mumbai",   "lat": 19.0760, "lng": 72.8777, "corridor": "MUM_PUNE"},
    {"name": "Khopoli",  "lat": 18.7860, "lng": 73.3442, "corridor": "MUM_PUNE"},
    {"name": "Khandala", "lat": 18.7642, "lng": 73.3626, "corridor": "MUM_PUNE"},
    {"name": "Lonavala", "lat": 18.7481, "lng": 73.4072, "corridor": "MUM_PUNE"},
    {"name": "Pune",     "lat": 18.5204, "lng": 73.8567, "corridor": "MUM_PUNE"},
    {"name": "Delhi",    "lat": 28.7041, "lng": 77.1025, "corridor": "DEL_JAI"},
    {"name": "Gurugram", "lat": 28.4595, "lng": 77.0266, "corridor": "DEL_JAI"},
    {"name": "Jaipur",   "lat": 26.9124, "lng": 75.7873, "corridor": "DEL_JAI"},
]

# ---------------------------------------------------------------------------
# Severity helper
# ---------------------------------------------------------------------------
def _classify_severity(rain_mm: float, wind_kmh: float, visibility_m: float):
    """Return (severity, reason) tuple or (None, None) if below threshold."""

    reasons = []

    if rain_mm > 30 or wind_kmh > 90 or visibility_m < 100:
        severity = "CRITICAL"
    elif rain_mm > 10 or wind_kmh > 70 or visibility_m < 300:
        severity = "HIGH"
    elif rain_mm > 5 or wind_kmh > 45 or visibility_m < 1000:
        severity = "MEDIUM"
    else:
        return None, None

    if rain_mm > 5:
        reasons.append(f"heavy rain {rain_mm:.1f} mm/hr")
    if wind_kmh > 45:
        reasons.append(f"strong winds {wind_kmh:.1f} km/h")
    if visibility_m < 1000:
        reasons.append(f"low visibility {visibility_m:.0f} m")

    reason = f"Adverse weather detected: {', '.join(reasons)}"
    return severity, reason


# ---------------------------------------------------------------------------
# Main async function
# ---------------------------------------------------------------------------
async def fetch_weather_threats() -> List[Dict[str, Any]]:
    """
    Batch-fetch Open-Meteo forecasts for all CHECKPOINTS in one HTTP call.
    Returns a list of unified-schema threat dicts (only entries above MEDIUM).
    """
    threats: List[Dict[str, Any]] = []

    try:
        # Build comma-separated coordinate lists for batch request
        lats = ",".join(str(cp["lat"]) for cp in CHECKPOINTS)
        lngs = ",".join(str(cp["lng"]) for cp in CHECKPOINTS)

        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lats,
            "longitude": lngs,
            "hourly": "precipitation,wind_speed_10m,visibility,weather_code",
            "forecast_days": 1,
            "wind_speed_unit": "kmh",
            "timezone": "auto",
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

        # Open-Meteo returns a list when multiple locations are requested
        if isinstance(data, dict):
            data = [data]  # single location edge-case

        now_hour = datetime.now().hour

        for idx, location_data in enumerate(data):
            cp = CHECKPOINTS[idx]

            hourly = location_data.get("hourly", {})
            times = hourly.get("time", [])

            # Find current hour index safely
            hour_idx = None
            for i, t in enumerate(times):
                # Format: "2024-07-01T13:00" — match hour
                try:
                    if datetime.fromisoformat(t).hour == now_hour:
                        hour_idx = i
                        break
                except Exception:
                    pass

            if hour_idx is None:
                # Fallback: use index == now_hour (first 24 entries = today)
                hour_idx = min(now_hour, len(times) - 1)

            def _safe(key: str, default: float = 0.0) -> float:
                vals = hourly.get(key, [])
                if hour_idx < len(vals) and vals[hour_idx] is not None:
                    return float(vals[hour_idx])
                return default

            rain_mm = _safe("precipitation", 0.0)
            wind_kmh = _safe("wind_speed_10m", 0.0)
            # Open-Meteo visibility is in metres
            visibility_m = _safe("visibility", 10000.0)

            print(f"[Weather] {cp['name']:12s} -> rain={rain_mm:.1f}mm  wind={wind_kmh:.1f}km/h  vis={visibility_m:.0f}m")

            severity, reason = _classify_severity(rain_mm, wind_kmh, visibility_m)
            if severity is None:
                continue

            # Derive certainty from severity
            certainty_map = {"MEDIUM": 0.6, "HIGH": 0.8, "CRITICAL": 0.95}
            certainty = certainty_map.get(severity, 0.6)

            threats.append({
                "source": "Open-Meteo",
                "source_type": "weather",
                "is_disruption": True,
                "severity": severity,
                "location": cp["name"],
                "lat": cp["lat"],
                "lng": cp["lng"],
                "reason": reason,
                "detected_at": datetime.now().isoformat(),
                "category": "Met",
                "certainty": certainty,
                "corridor": cp["corridor"],
            })

    except Exception as e:
        # Never crash the pipeline — swallow silently
        print(f"[Weather] X Exception: {e}")

    return threats
