from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler

# Import your routes and hunter
from app.api.routes import disruptions
from app.services.live_ingestion import hunt_for_disruptions

# 1. Initialize the Scheduler
scheduler = AsyncIOScheduler()

async def background_threat_hunter():
    """This is the robotic job that runs while everyone is asleep."""
    print("\n🤖 [AUTO-SCAN] Waking up to hunt for supply chain threats...")
    
    threats = await hunt_for_disruptions()
    
    if len(threats) > 0:
        print(f"🚨 [AUTO-SCAN] THREAT DETECTED: {threats[0]['location']}!")
    else:
        print("✅ [AUTO-SCAN] Coast is clear. Going back to sleep.\n")

# 2. Define the Server Lifespan (The Robotic Heartbeat)
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Booting up LogiSense AI Core...")
    
    # Set to 1 minute for hackathon testing!
    scheduler.add_job(background_threat_hunter, 'interval', minutes=15, id='live_monitor')
    scheduler.start()
    
    yield # Server is running
    
    print("🛑 Shutting down LogiSense AI Core...")
    scheduler.shutdown()

# 3. Create the ONE AND ONLY FastAPI app, combining all settings!
app = FastAPI(
    title="LogiSense AI API",
    description="Backend for supply chain disruption prediction.",
    version="1.0.0",
    lifespan=lifespan # <-- Here is the robotic heart!
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Register the router
app.include_router(disruptions.router, prefix="/api", tags=["Disruptions"])

# Health-check endpoint
@app.get("/")
def read_root():
    return {"status": "LogiSense AI Engine is running! 🚛🚀"}