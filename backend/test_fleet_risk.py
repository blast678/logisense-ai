import json
# Import your newly upgraded math engine
from app.services.or_tools_optimizer import calculate_detour

print("🚦 LOGISENSE AI - FLEET TRIAGE SIMULATION 🚦\n")

# --- SCENARIO 1: PEACEFUL DAY ---
print("==================================================")
print("SCENARIO 1: No threats detected.")
print("==================================================")
normal_route = calculate_detour(threat_gps=None)
print(f"Status: {normal_route['status']}")
print(f"Route:  {normal_route['optimal_route']}\n")


# --- SCENARIO 2: DISASTER STRIKES ---
print("==================================================")
print("SCENARIO 2: Massive Landslide hits the Expressway!")
print("Location: Khandala Ghat (Lat: 18.7500, Lng: 73.4000)")
print("==================================================")

# We manually inject the GPS coordinates of the Khandala Expressway Node
simulated_threat = {"latitude": 18.7500, "longitude": 73.4000}

emergency_response = calculate_detour(threat_gps=simulated_threat)

print(f"Status: {emergency_response['status']}")
print(f"Route:  {emergency_response['optimal_route']}\n")

print("🚚 FLEET TRIAGE COMMANDS 🚚")
# Print out the calculated risk score for every truck
for truck in emergency_response.get("fleet_status", []):
    print(f"\n🚛 Truck ID: {truck['truck_id']} ({truck['cargo']})")
    print(f"   Distance to Threat: {truck['distance_to_threat_km']} km")
    print(f"   Risk Score: {truck['risk_score']}/100")
    print(f"   AI Command: >> {truck['action']} <<")