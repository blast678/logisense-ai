import math

# 1. THE REAL WORLD ROUTES 
PRIMARY_ROUTE = [
    {"name": "Mumbai", "lat": 19.0760, "lng": 72.8777},
    {"name": "Navi Mumbai", "lat": 19.0330, "lng": 73.0297},
    {"name": "Expressway Toll (Khandala)", "lat": 18.7500, "lng": 73.4000},
    {"name": "Pune", "lat": 18.5204, "lng": 73.8567}
]

ALTERNATE_ROUTE = [
    {"name": "Mumbai", "lat": 19.0760, "lng": 72.8777},
    {"name": "Panvel", "lat": 18.9894, "lng": 73.1175},
    {"name": "Old Highway (Khopoli)", "lat": 18.7833, "lng": 73.3500},
    {"name": "Pune", "lat": 18.5204, "lng": 73.8567}
]

# 2. LIVE FLEET DATA (Mocked for MVP)
ACTIVE_SHIPMENTS = [
    {
        "id": "TRK-001",
        "cargo": "Vaccines & Pharmaceuticals",
        "priority": "CRITICAL",
        "current_lat": 19.0330, # Near Navi Mumbai
        "current_lng": 73.0297
    },
    {
        "id": "TRK-002", 
        "cargo": "Consumer Electronics",
        "priority": "HIGH",
        "current_lat": 19.0760, # Still in Mumbai
        "current_lng": 72.8777
    },
    {
        "id": "TRK-003", 
        "cargo": "Office Furniture",
        "priority": "LOW",
        "current_lat": 19.0760,
        "current_lng": 72.8777
    }
]

def haversine(lat1, lng1, lat2, lng2):
    R = 6371 
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

def calculate_detour(threat_gps=None):
    
    # Base response
    response = {
        "status": "Clear",
        "optimal_route": " -> ".join([n["name"] for n in PRIMARY_ROUTE]),
        "fleet_status": []
    }

    if threat_gps:
        threat_lat = threat_gps['latitude']
        threat_lng = threat_gps['longitude']
        is_route_blocked = False

        # 1. Check if the road itself is blocked
        for node in PRIMARY_ROUTE:
            distance = haversine(threat_lat, threat_lng, node['lat'], node['lng'])
            if distance < 15.0: 
                is_route_blocked = True
                response["status"] = "Rerouted"
                response["optimal_route"] = " -> ".join([n["name"] for n in ALTERNATE_ROUTE])
                break 

        # 2. If blocked, calculate RISK SCORE for each specific truck
        if is_route_blocked:
            priority_weights = {"CRITICAL": 1.0, "HIGH": 0.7, "LOW": 0.3}
            
            for truck in ACTIVE_SHIPMENTS:
                # How close is the truck to the disaster?
                dist_to_disaster = haversine(truck['current_lat'], truck['current_lng'], threat_lat, threat_lng)
                
                # Math: High priority + Close proximity = Massive Risk Score
                base_score = priority_weights[truck['priority']] * 100
                proximity_multiplier = max(0.1, 1 - (dist_to_disaster / 100)) # Closer = higher multiplier
                
                final_risk_score = round(base_score * proximity_multiplier)
                
                # Determine action based on score
                if final_risk_score > 80:
                    action = "IMMEDIATE REROUTE - PING DRIVER"
                elif final_risk_score > 50:
                    action = "PREPARE ALTERNATE ROUTE"
                else:
                    action = "HOLD AT WAREHOUSE"
                    
                response["fleet_status"].append({
                    "truck_id": truck['id'],
                    "cargo": truck['cargo'],
                    "distance_to_threat_km": round(dist_to_disaster, 1),
                    "risk_score": final_risk_score,
                    "action": action
                })

    return response