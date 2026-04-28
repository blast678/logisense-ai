import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class FleetDatabase:
    def __init__(self):
        # Support either SUPABASE_URL or SUPABASE_ID
        url = os.environ.get("SUPABASE_URL")
        project_id = os.environ.get("SUPABASE_ID")
        if not url and project_id:
            url = f"https://{project_id}.supabase.co"
            
        # Support either SUPABASE_SERVICE_ROLE_KEY (bypasses RLS) or SUPABASE_KEY/SUPABASE_API_KEY
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_API_KEY")
        
        if not url or not key:
            print("⚠️ SUPABASE CREDENTIALS MISSING FROM .env FILE. UI WILL CRASH.")
            self.supabase = None
            return

        self.supabase: Client = create_client(url, key)
        self._seed_initial_data()

    def _seed_initial_data(self):
        """Seeds the Supabase Postgres DB for the demo if it's empty."""
        if not self.supabase: return
        
        try:
            response = self.supabase.table('active_shipments').select("id").limit(1).execute()
            if not response.data:
                print("[SYSTEM] Seeding Supabase PostgreSQL with initial fleet state...")
            
            initial_truck = {
                "id": "TRK-001", "truck_id": "TRK-001", "mode": "terrestrial",
                "cargo": "FMCG Goods — Nashik FC", "status": "on_time",
                "lat": 19.0760, "lng": 72.8777,
                "action": "En Route — Normal Operations"
            }
            initial_ship = {
                "id": "SHP-991", "truck_id": "SHP-991", "mode": "maritime",
                "cargo": "Electronics — JNPT", "status": "on_time",
                "action": "En Route — Normal Operations"
            }
            
            # Using JSONB payload column to mimic NoSQL flexibility
            self.supabase.table('active_shipments').upsert({"id": "TRK-001", "payload": initial_truck}).execute()
            self.supabase.table('active_shipments').upsert({"id": "SHP-991", "payload": initial_ship}).execute()
        except Exception as e:
            print(f"⚠️ SUPABASE ERROR during initialization: {e}")
            print("Server will continue booting in Offline Mode (Mocked).")
            self.supabase = None

    def get_all_active_shipments(self) -> list:
        """Simulates SELECT * FROM shipments WHERE status = 'active'"""
        if not self.supabase: return []
        response = self.supabase.table('active_shipments').select("payload").execute()
        # Extract the payload dicts from the rows so the API remains identical to the frontend
        return [row["payload"] for row in response.data]

    def update_vehicle_state(self, vehicle_id: str, updates: dict) -> dict:
        """Performs a JSONB merge update on a specific vehicle document."""
        if not self.supabase: return {}
        
        # 1. Fetch current payload
        response = self.supabase.table('active_shipments').select("payload").eq("id", vehicle_id).execute()
        if not response.data: return {}
        
        current_payload = response.data[0]["payload"]
        
        # 2. Merge new updates into the dict
        current_payload.update(updates)
        
        # 3. Upsert back to Postgres
        self.supabase.table('active_shipments').upsert({"id": vehicle_id, "payload": current_payload}).execute()
        
        return current_payload

# Instantiate the singleton
db = FleetDatabase()
