from fastapi import APIRouter
from pydantic import BaseModel
from app.services.gemini_parser import analyze_unstructured_alert
from app.services.geocoder import convert_text_to_gps
# 👇 THIS IS THE LINE THAT WAS MISSING! 👇
from app.services.live_ingestion import hunt_for_disruptions 
#from app.services.or_tools_optimizer import calculate_detour
from app.services.or_tools_optimizer import evaluate_fleet_resilience
router = APIRouter()

# 1. Our manual testing endpoint
class AlertInput(BaseModel):
    text: str

@router.post("/analyze-alert")
def analyze_alert(alert: AlertInput):
    """Send an unstructured string to get a structured risk profile."""
    result = analyze_unstructured_alert(alert.text)
    return {"data": result}

# 2. Our Real-World Live Hunt endpoint
@router.get("/trigger-live-hunt")
async def trigger_live_hunt():
    # 1. Mocking a threat detected by your data ingestion layer (e.g., Cyclone off the coast of Mumbai)
    mock_threat_lng = 70.5
    mock_threat_lat = 19.5
    blast_radius_polygon = {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[72.5, 18.5], [73.5, 18.5], [73.5, 19.5], [72.5, 19.5], [72.5, 18.5]]]
        }
    }
    # 2. Pass the threat coordinates to the mathematical optimizer we built
    decision_payload = evaluate_fleet_resilience(mock_threat_lng, mock_threat_lat)
    
    # 3. Create a GeoJSON polygon to represent the "Blast Radius" visually on the Mapbox frontend
    blast_radius_polygon = {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[69.5, 18.5], [71.5, 18.5], [71.5, 20.5], [69.5, 20.5], [69.5, 18.5]]]
        }
    }
    
    # 4. Return the massive, highly-optimized JSON payload to React
    return {
        "status": "Hunt Complete",
        "active_threats": [{
            "location": "Arabian Sea (Cyclone Warning)",
            "geojson_polygon": blast_radius_polygon
        }],
        "routing_engine_decision": decision_payload
    }