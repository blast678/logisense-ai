from fastapi import APIRouter
from pydantic import BaseModel
from app.services.gemini_parser import analyze_unstructured_alert
from app.services.geocoder import convert_text_to_gps
# 👇 THIS IS THE LINE THAT WAS MISSING! 👇
from app.services.live_ingestion import hunt_for_disruptions 
from app.services.or_tools_optimizer import calculate_detour
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
    print("Starting live hunt...")
    
    # 1. HUNT (NewsAPI -> Gemini)
    threats = await hunt_for_disruptions()
    route_plan = calculate_detour(threat_gps=None)
    
    if len(threats) > 0:
        threat_text = threats[0]['location']
        
        # 2. GEOCODE (Text -> OpenStreetMap API -> GPS Coordinates)
        print(f"🌍 Translating '{threat_text}' to GPS coordinates...")
        gps_data = await convert_text_to_gps(threat_text)
        
        if gps_data:
            threats[0]['exact_gps'] = gps_data
            print(f"🚨 Threat Locked On: Lat {gps_data['latitude']}, Lng {gps_data['longitude']}")
            
            # 3. REROUTE (Pass GPS Coordinates -> OR-Tools Math Engine)
            route_plan = calculate_detour(threat_gps=gps_data)
        else:
            print("⚠️ Could not resolve GPS. Using default routing.")
            
    return {
        "status": "Hunt complete",
        "threats_detected": len(threats),
        "active_threats": threats,
        "routing_engine_decision": route_plan
    }