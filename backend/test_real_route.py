import asyncio
import httpx

async def fetch_real_world_route():
    print("🌍 Pinging Open Source Routing Machine (OSRM)...")
    
    # 1. Real World GPS Coordinates
    mumbai_lon, mumbai_lat = 72.8777, 19.0760
    pune_lon, pune_lat = 73.8567, 18.5204
    
    # OSRM expects coordinates in Longitude,Latitude format
    coordinates = f"{mumbai_lon},{mumbai_lat};{pune_lon},{pune_lat}"
    
    # We ask OSRM for the driving route, including turn-by-turn steps
    url = f"http://router.project-osrm.org/route/v1/driving/{coordinates}?steps=true"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            
            if response.status_code == 200:
                data = response.json()
                route = data['routes'][0]
                
                # Convert raw data into human-readable metrics
                distance_km = route['distance'] / 1000
                duration_mins = route['duration'] / 60
                
                # 'Steps' are the actual turn-by-turn directions (the real nodes!)
                steps = route['legs'][0]['steps']
                
                print(f"✅ SUCCESS: OSRM mapped the real physical road!")
                print(f"🛣️  Total Distance: {distance_km:.2f} kilometers")
                print(f"⏱️  Estimated Driving Time: {duration_mins:.0f} minutes")
                print(f"🕸️  Number of Intersections/Nodes processed: {len(steps)}")
                
                print("\n📍 Sneak Peek at the first 3 turn-by-turn directions:")
                for i, step in enumerate(steps[:3]):
                    # OSRM actually gives us the real street names!
                    instruction = step['maneuver']['type']
                    road_name = step.get('name', 'Unnamed Road')
                    print(f"   Step {i+1}: {instruction} onto {road_name}")
            else:
                print(f"❌ OSRM API Error: {response.status_code}")
                
    except Exception as e:
        print(f"💥 Network Crash: {e}")

if __name__ == "__main__":
    asyncio.run(fetch_real_world_route())