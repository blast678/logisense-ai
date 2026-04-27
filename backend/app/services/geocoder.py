import httpx

async def convert_text_to_gps(location_name: str) -> dict:
    """Takes text, bypasses Google, and uses free OpenStreetMap to get GPS coordinates."""
    if not location_name:
        return None
        
    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": f"{location_name}, Maharashtra, India", # Keeps the search focused on your region
            "format": "json",
            "limit": 1
        }
        # OSM requires a User-Agent header so they don't block our requests
        headers = {
            "User-Agent": "LogiSense-Hackathon-App/1.0" 
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    return {
                        "latitude": float(data[0]["lat"]),
                        "longitude": float(data[0]["lon"]),
                        "exact_address": data[0]["display_name"]
                    }
        return None
        
    except Exception as e:
        print(f"OSM Geocoding Error: {e}")
        return None