"""
global_alerts.py -- GDACS (Global Disaster Alert and Coordination System) RSS ingestion.

Parses the GDACS RSS feed using feedparser.
Filters for Orange/Red alerts published within the last 48 hours.
No API key required.
"""

import feedparser
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any

GDACS_RSS_URL = "https://www.gdacs.org/xml/rss.xml"

# GDACS alert level -> unified severity
_ALERT_SEVERITY_MAP = {
    "Red":    "CRITICAL",
    "Orange": "HIGH",
    "Green":  "LOW",
}

# GDACS event type codes -> human readable
_EVENT_TYPE_MAP = {
    "EQ": "Earthquake",
    "TC": "Tropical Cyclone",
    "FL": "Flood",
    "VO": "Volcanic Eruption",
    "DR": "Drought",
    "WF": "Wild Fire",
}


def _extract_tag(entry, *candidates: str, default: str = "") -> str:
    """
    Try multiple attribute name variants on a feedparser entry.
    feedparser normalises 'gdacs:alertlevel' -> 'gdacs_alertlevel'
    but also exposes raw tags via entry.tags and entry.get().
    """
    for key in candidates:
        val = entry.get(key)
        if val:
            return str(val).strip()
    # Fallback: scan the raw 'tags' list for term matches
    for tag in getattr(entry, "tags", []):
        term = tag.get("term", "")
        for key in candidates:
            if key.lower() in term.lower():
                return term.strip()
    return default


def _get_alert_level(entry) -> str:
    """Extract GDACS alert level from an entry using all known attribute paths."""
    # feedparser replaces ':' with '_' for namespace prefixes
    for attr in (
        "gdacs_alertlevel",
        "gdacs:alertlevel",
        "cap_severity",          # some feeds use CAP namespace
    ):
        val = entry.get(attr, "")
        if val:
            return str(val).strip()
    # Last resort: look inside entry.summary or title for known keywords
    text = (entry.get("summary", "") + " " + entry.get("title", "")).lower()
    if "red" in text:
        return "Red"
    if "orange" in text:
        return "Orange"
    return ""


def _get_event_type(entry) -> str:
    for attr in ("gdacs_eventtype", "gdacs:eventtype"):
        val = entry.get(attr, "")
        if val:
            return str(val).strip()
    return "Unknown"


def _parse_georss_point(entry) -> tuple:
    """
    Try multiple ways to extract lat/lng from a feedparser entry.
    Returns (lat, lng) floats or (0.0, 0.0) as last resort.
    """
    # 1. Standard GeoRSS Simple parsed by feedparser into entry.where
    where = getattr(entry, "where", None)
    if where:
        coords = getattr(where, "coordinates", None)
        if coords and len(coords) >= 2:
            # GeoJSON order: (lng, lat)
            try:
                return float(coords[1]), float(coords[0])
            except (TypeError, ValueError):
                pass

    # 2. feedparser sometimes puts it in entry.georss_point as "lat lng"
    for attr in ("georss_point", "georss:point"):
        raw = entry.get(attr, "")
        if raw:
            parts = raw.strip().split()
            if len(parts) >= 2:
                try:
                    return float(parts[0]), float(parts[1])
                except ValueError:
                    pass

    # 3. geo_lat / geo_long
    try:
        lat = float(entry.get("geo_lat", 0) or 0)
        lng = float(entry.get("geo_long", 0) or 0)
        if lat != 0 or lng != 0:
            return lat, lng
    except (TypeError, ValueError):
        pass

    return 0.0, 0.0


def _parse_published(entry) -> datetime | None:
    try:
        t = entry.get("published_parsed") or entry.get("updated_parsed")
        if t:
            return datetime(*t[:6], tzinfo=timezone.utc)
    except Exception:
        pass
    return None


async def fetch_global_alerts() -> List[Dict[str, Any]]:
    """
    Parse GDACS RSS feed and return Orange/Red alerts from the last 48 hours
    as unified-schema threat dicts.
    """
    threats: List[Dict[str, Any]] = []
    cutoff = datetime.now(timezone.utc) - timedelta(hours=48)

    try:
        feed = feedparser.parse(GDACS_RSS_URL)

        if not feed.entries:
            print("[GDACS] Feed returned 0 entries -- possible network issue")
            return []

        total = len(feed.entries)
        passed = 0

        for entry in feed.entries:
            try:
                alert_level = _get_alert_level(entry)

                # Filter: only Orange or Red
                if alert_level not in ("Orange", "Red"):
                    continue

                # Filter: only last 48 hours
                pub_dt = _parse_published(entry)
                if pub_dt and pub_dt < cutoff:
                    continue

                passed += 1

                event_type_code = _get_event_type(entry)
                event_type_label = _EVENT_TYPE_MAP.get(event_type_code, event_type_code)

                lat, lng = _parse_georss_point(entry)

                title = entry.get("title", "No details available").strip()
                clean_title = title.split(" - ")[0] if " - " in title else title

                reason = f"{event_type_label} alert: {clean_title}"
                severity = _ALERT_SEVERITY_MAP.get(alert_level, "HIGH")
                certainty_map = {"LOW": 0.4, "MEDIUM": 0.65, "HIGH": 0.80, "CRITICAL": 0.95}
                certainty = certainty_map.get(severity, 0.75)

                threats.append({
                    "source": "GDACS",
                    "source_type": "disaster",
                    "is_disruption": True,
                    "severity": severity,
                    "location": clean_title,
                    "lat": lat,
                    "lng": lng,
                    "reason": reason,
                    "detected_at": datetime.now().isoformat(),
                    "category": "Geo",
                    "certainty": certainty,
                    "gdacs_event_type": event_type_label,
                    "source_url": entry.get("link", ""),
                })

            except Exception:
                continue

        print(f"[GDACS] Feed has {total} entries -> {passed} passed Orange/Red + 48h filter")

    except Exception as e:
        print(f"[GDACS] FAILED Exception: {e}")

    return threats
