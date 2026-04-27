import math
import searoute as sr
from shapely.geometry import shape, Point

# 1. THE ENTERPRISE DATABUS (Our live shipments)
ACTIVE_SHIPMENTS = [
    {
        "id": "TRK-001",
        "mode": "terrestrial",
        "cargo": "Critical Medical Supplies",
        "priority": 100, # Critical
        "start": [72.8777, 19.0760], # Mumbai
        "end": [77.1025, 28.7041],   # Delhi
    },
    {
        "id": "SHP-992", 
        "mode": "maritime",
        "cargo": "Consumer Electronics",
        "priority": 40, # Standard
        "start": [121.4737, 31.2304], # Shanghai
        "end": [72.9460, 18.9400],    # JNPT Mumbai
    }
]

# 2. THE FINANCIAL PRICING ENGINE
def calculate_logistics_cost(mode, distance_km, action_type):
    """
    Calculates exact financial impact based on physics and current commodity prices.
    """
    diesel_price_per_liter = 1.10
    bunker_price_per_ton = 600.0

    if mode == "terrestrial":
        # Trucks burn ~0.35L per KM
        base_cost = distance_km * 0.35 * diesel_price_per_liter
        # Detours incur a 30% penalty due to sub-optimal traffic conditions
        return base_cost * 1.3 if action_type == "DETOUR" else base_cost 
    
    elif mode == "maritime":
        # Ships burn ~0.15 Tons per KM at standard cruising speed
        base_cost = distance_km * 0.15 * bunker_price_per_ton
        if action_type == "DETOUR":
            return base_cost * 1.5 # Massive fuel burn for ocean detours
        elif action_type == "SLOW_STEAM":
            # Slowing down by 20% drastically cuts fuel burn (F ∝ v^3)
            return base_cost * 0.6 
        return base_cost

# 3. THE SPATIAL TRIAGE ENGINE
def evaluate_fleet_resilience(threat_lng, threat_lat):
    """
    Evaluates all shipments against a detected threat and outputs optimization commands.
    """
    response_payload = {"fleet_status": []}
    threat_pt = Point(threat_lng, threat_lat)

    for shipment in ACTIVE_SHIPMENTS:
        # Step A: Generate Base Geometry
        if shipment["mode"] == "maritime":
            # Real ocean routing calculation
            route_geojson = sr.searoute(shipment["start"], shipment["end"], units="km")
            route_geom = shape(route_geojson['geometry'])
            distance_km = route_geojson['properties']['length']
        else:
            # Simulated terrestrial route (straight line for prototype speed)
            route_geojson = {
                "type": "Feature",
                "geometry": {"type": "LineString", "coordinates": [shipment["start"], [74.0, 22.0], shipment["end"]]}
            }
            route_geom = shape(route_geojson['geometry'])
            distance_km = 1400.0 

        # Step B: Spatial Collision Detection (50km blast radius)
        distance_to_threat = route_geom.distance(threat_pt)
        is_threatened = distance_to_threat < 0.5 # ~50km in decimal degrees

        # Step C: Context-Aware Cost-Benefit Analysis
        action = "PROCEED NORMALLY"
        final_cost = calculate_logistics_cost(shipment["mode"], distance_km, "STANDARD")

        if is_threatened:
            detour_cost = calculate_logistics_cost(shipment["mode"], distance_km, "DETOUR")
            wait_cost = calculate_logistics_cost(shipment["mode"], distance_km, "SLOW_STEAM" if shipment["mode"] == "maritime" else "STANDARD")

            if shipment["priority"] >= 80:
                # Critical cargo must arrive, regardless of detour fuel cost
                action = "IMMEDIATE REROUTE"
                final_cost = detour_cost
            elif wait_cost < detour_cost:
                # Prevent secondary cascades by holding non-critical cargo
                action = "SLOW STEAM / HOLD" if shipment["mode"] == "maritime" else "HOLD AT WAREHOUSE"
                final_cost = wait_cost

        # Step D: Package the data for the frontend Mapbox UI
        response_payload["fleet_status"].append({
            "truck_id": shipment["id"],
            "cargo": shipment["cargo"],
            "mode": shipment["mode"],
            "action": action,
            "risk_score": shipment["priority"] if is_threatened else 0,
            "estimated_cost": f"${round(final_cost, 2):,}", 
            "safe_geojson": route_geojson,
            "lat": shipment["start"][1], 
            "lng": shipment["start"][0]
        })

    return response_payload