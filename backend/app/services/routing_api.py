import httpx
import os

# You get this free from mapbox.com
MAPBOX_TOKEN = os.getenv("MAPBOX_TOKEN", os.getenv("NEXT_PUBLIC_MAPBOX_TOKEN", ""))

async def fetch_production_routes(start_coords, end_coords, detour_coords=None):
    """
    REAL WORLD PRODUCTION: Calls Mapbox Directions API dynamically.
    start_coords: [lng, lat]
    end_coords: [lng, lat]
    detour_coords: [lng, lat] (The safe node calculated by OR-Tools)
    """
    base_url = "https://api.mapbox.com/directions/v5/mapbox/driving"
    
    async with httpx.AsyncClient() as client:
        # 1. Fetch the Original Planned Route (Direct)
        orig_url = f"{base_url}/{start_coords[0]},{start_coords[1]};{end_coords[0]},{end_coords[1]}?geometries=geojson&access_token={MAPBOX_TOKEN}"
        orig_res = await client.get(orig_url)
        orig_data = orig_res.json()
        
        # Mapbox returns a highly complex GeoJSON LineString (hundreds of coordinates tracing the real highway)
        original_geojson = orig_data['routes'][0]['geometry'] 
        
        # 2. Fetch the AI Deviated Route (Passing through the OR-Tools Detour Waypoint)
        safe_geojson = None
        if detour_coords:
            # We inject the OR-Tools output (the Wada Bypass node) into the middle of the API call
            safe_url = f"{base_url}/{start_coords[0]},{start_coords[1]};{detour_coords[0]},{detour_coords[1]};{end_coords[0]},{end_coords[1]}?geometries=geojson&access_token={MAPBOX_TOKEN}"
            safe_res = await client.get(safe_url)
            safe_data = safe_res.json()
            safe_geojson = safe_data['routes'][0]['geometry']
            
        return original_geojson, safe_geojson

async def get_route(start_coords, end_coords, exclude_polygon=None):
    """
    Fetches route dynamically using Mapbox. Optionally excludes a polygon.
    start_coords: [lng, lat]
    end_coords: [lng, lat]
    """
    base_url = "https://api.mapbox.com/directions/v5/mapbox/driving"
    url = f"{base_url}/{start_coords[0]},{start_coords[1]};{end_coords[0]},{end_coords[1]}?geometries=geojson&access_token={MAPBOX_TOKEN}"
    if exclude_polygon:
        url += f"&exclude=polygon({exclude_polygon})"
        
    async with httpx.AsyncClient() as client:
        res = await client.get(url)
        if res.status_code == 200:
            data = res.json()
            if 'routes' in data and len(data['routes']) > 0:
                return data['routes'][0]
        return None