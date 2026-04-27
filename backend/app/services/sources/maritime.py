"""
maritime.py -- AISstream.io WebSocket ingestion for critical maritime chokepoints.

Connects to the AISstream WebSocket, collects vessel position reports for 30 seconds,
counts anchored vessels (NavigationalStatus == 1) per chokepoint, then disconnects.
This avoids holding a permanent WebSocket connection open.

Requires env var: AIS_KEY
"""

import os
import json
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Tuple

# ---------------------------------------------------------------------------
# Critical maritime chokepoints with bounding boxes [[sw_lat, sw_lng], [ne_lat, ne_lng]]
# ---------------------------------------------------------------------------
CHOKEPOINTS = [
    {
        "name": "JNPT Mumbai Port (Anchorage)",
        "bbox": [[18.8, 72.7], [19.2, 73.0]],  # Broader box covering Mumbai coastal waters
    },
]

_AIS_WS_URL = "wss://stream.aisstream.io/v0/stream"
_COLLECTION_SECONDS = 30  # collect data for 30 s then disconnect


def _in_bbox(lat: float, lng: float, bbox: List[List[float]]) -> bool:
    """Return True if (lat, lng) falls within the bounding box [[min_lat, min_lng], [max_lat, max_lng]]."""
    (min_lat, min_lng), (max_lat, max_lng) = bbox
    return min_lat <= lat <= max_lat and min_lng <= lng <= max_lng


def _classify_congestion(anchor_count: int) -> Tuple[str | None, float]:
    """Return (severity, certainty) based on anchored vessel count. Thresholds lowered for demo."""
    if anchor_count >= 10:
        return "CRITICAL", 0.90
    elif anchor_count >= 5:
        return "HIGH", 0.75
    elif anchor_count >= 1:
        return "MEDIUM", 0.60
    return None, 0.0


async def fetch_maritime_threats() -> List[Dict[str, Any]]:
    """
    Subscribe to AISstream WebSocket for 30 seconds, tally anchored vessels per
    chokepoint, and return unified-schema threats for congested chokepoints.
    Returns [] immediately if AIS_KEY is missing or connection fails.
    """
    api_key = os.getenv("AIS_KEY", "")
    if not api_key:
        print("[AIS] FAILED AIS_KEY not set -- skipping maritime source")
        return []

    # anchor_counts[chokepoint_name] = count of anchored vessels seen
    anchor_counts: Dict[str, int] = {cp["name"]: 0 for cp in CHOKEPOINTS}

    try:
        # websockets is already in the venv
        import websockets  # type: ignore

        subscribe_msg = json.dumps({
            "APIKey": api_key,
            "BoundingBoxes": [cp["bbox"] for cp in CHOKEPOINTS],
            "FilterMessageTypes": ["PositionReport"],
        })

        async def _collect():
            async with websockets.connect(_AIS_WS_URL) as ws:
                await ws.send(subscribe_msg)
                deadline = asyncio.get_event_loop().time() + _COLLECTION_SECONDS

                while asyncio.get_event_loop().time() < deadline:
                    try:
                        raw = await asyncio.wait_for(ws.recv(), timeout=5.0)
                        msg = json.loads(raw)

                        # Extract PositionReport sub-message
                        pos = (
                            msg.get("Message", {}).get("PositionReport")
                            or msg.get("PositionReport")
                        )
                        if not pos:
                            continue

                        nav_status = pos.get("NavigationalStatus")
                        lat = pos.get("Latitude")
                        lng = pos.get("Longitude")

                        if nav_status != 1 or lat is None or lng is None:
                            continue  # only count anchored vessels

                        for cp in CHOKEPOINTS:
                            if _in_bbox(float(lat), float(lng), cp["bbox"]):
                                anchor_counts[cp["name"]] += 1
                                break  # a vessel can only be in one chokepoint

                    except asyncio.TimeoutError:
                        continue  # no message received in 5 s -- keep waiting
                    except Exception:
                        break  # connection error -- exit inner loop

        await _collect()

    except ImportError:
        print("[AIS] FAILED websockets library not installed -- run: pip install websockets")
        return []
    except Exception as e:
        print(f"[AIS] FAILED WebSocket connection failed: {e}")
        return []

    # Build threat list
    threats: List[Dict[str, Any]] = []
    for cp in CHOKEPOINTS:
        count = anchor_counts[cp["name"]]
        severity, certainty = _classify_congestion(count)

        if severity is None:
            continue

        # Derive a representative lat/lng from the bbox centre
        (min_lat, min_lng), (max_lat, max_lng) = cp["bbox"]
        centre_lat = (min_lat + max_lat) / 2
        centre_lng = (min_lng + max_lng) / 2

        threats.append({
            "source": "AISstream",
            "source_type": "maritime",
            "is_disruption": True,
            "severity": severity,
            "location": cp["name"],
            "lat": centre_lat,
            "lng": centre_lng,
            "reason": (
                f"Maritime congestion at {cp['name']}: "
                f"{count} vessels at anchor (NavigationalStatus=1)"
            ),
            "detected_at": datetime.now().isoformat(),
            "category": "Maritime",
            "certainty": certainty,
            "anchored_vessel_count": count,
        })

    return threats
