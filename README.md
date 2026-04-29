# LogiSense AI 🚛🔮
### *Autonomous Logistics Digital Twin for the Global South*

**A Google Solution Challenge 2026 Submission**

---

## 📺 [Watch the Video Submission](https://drive.google.com/drive/folders/1ZWnPNqls9krx2UZ_sMipdt4N56hq1064)
Website Link - https://logisense-ai-1.onrender.com

---

LogiSense AI is an enterprise-grade disruption intelligence platform that shifts supply chain management from **reactive** to **predictive**. By ingesting unstructured local data and leveraging Google's Gemini AI and Mapbox's geospatial engine, we detect bottlenecks up to 72 hours before they cascade and autonomously re-route fleets to preserve SLAs and minimize carbon footprints.

Built specifically for the underserved logistics markets in India and the Global South, LogiSense democratizes high-fidelity supply chain intelligence without the need for expensive hardware.

---

## 🛑 The Problem: The "Visibility Gap"
Modern global supply chains operate with massive blind spots. Logistics companies discovery disruptions—like a monsoon flood in the Khandala Ghats or a local protest—only *after* a driver is already stuck. This reactive approach costs the global economy over $1.5 trillion annually and generates massive amounts of wasted CO2 from idling fleets.

## 💡 The Solution: LogiSense AI
We built an autonomous "Air Traffic Controller" for trucks. Our platform acts as a **Digital Twin** of the physical supply chain:

*   **Unstructured Risk Parsing (The Gemini Advantage):** Our backend uses **Google Gemini 2.0 Flash** to parse unstructured local data—vernacular news, social media alerts, and text-based port advisories—converting chaotic text into structured, actionable risk scores.
*   **Digital Twin Scenario Studio:** A high-fidelity Next.js interface that allows dispatchers to simulate "What-If" scenarios (Monsoon Floods, Chemical Spills, Highway Protests) and instantly calculate the ROI of an AI-optimized detour.
*   **Carbon-Aware Optimization:** Every rerouting calculation balances time, fuel cost, and CO2 emissions, directly supporting **UN Sustainable Development Goal 13 (Climate Action)**.
*   **Zero-Touch Execution:** Once a detour is calculated, the system autonomously authorizes dispatch and sends a 1-tap reroute link to the driver.

---

## 🛠️ Technology Stack

**Backend & AI Engine**
*   **Framework:** Python / FastAPI
*   **AI/ML:** Google Gemini (via `google-genai` SDK)
*   **Optimization:** Mapbox Directions API (with dynamic Exclusion Polygons)
*   **Database:** Supabase (PostgreSQL with JSONB for high-density telemetry)
*   **Geospatial:** OpenStreetMap (OSM) Nominatim for global geocoding

**Frontend & Visuals**
*   **Framework:** Next.js 14 / React
*   **Styling:** Tailwind CSS (Enterprise Dark Mode / Glassmorphism)
*   **Maps:** Mapbox GL JS / React-Map-GL (Dual-layer route rendering)
*   **Animations:** Framer Motion & Lucide Micro-animations

---

## 📂 Project Structure

```text
logisense-ai/
├── backend/                       # Python / FastAPI Engine Room
│   ├── app/
│   │   ├── api/routes/            # /simulate and /trigger-live-hunt
│   │   ├── services/              # The "Magic" layer
│   │   │   ├── gemini_parser.py   # Gemini 2.0 unstructured analysis
│   │   │   ├── routing_api.py     # Real-world Mapbox detour logic
│   │   │   └── fleet_db.py        # Supabase Repository Pattern
│   │   └── main.py                # FastAPI entry point & scheduler
│   └── requirements.txt           # Optimized for Python 3.14 (Render)
│
├── frontend/                      # Next.js Command Center
│   ├── src/app/
│   │   ├── disruptions/           # The Digital Twin Scenario Studio
│   │   ├── analytics/             # UN SDG 13 / Sustainability Dashboard
│   │   ├── fleet/                 # Live Data Grid of active shipments
│   │   └── page.jsx               # The Pulse (Live Ingestion Dashboard)
│   ├── src/components/
│   │   ├── map/                   # Advanced Mapbox component with fitBounds
│   │   └── disruptions/           # Simulation controls & animated Results
│   └── next.config.mjs            # Optimized for Static Site Export
└── README.md
```

---


---

## 🚀 Impact & UN SDG Alignment
LogiSense AI is designed to drive significant impact in two key areas:
1.  **SDG 13 (Climate Action):** By reducing idling time and optimizing routes for fuel efficiency, we have demonstrated an average **18.4% reduction in CO2 emissions** per shipment in our pilot simulations.
2.  **SDG 9 (Industry, Innovation, and Infrastructure):** We provide a low-cost, software-only intelligence layer that empowers small-scale logistics operators in developing nations to compete with global titans.

---

## 🏁 Getting Started
1. **Live Backend:** `https://logisense-ai.onrender.com`
2. **Setup:**
   - Run `npm install` in the frontend and `pip install -r requirements.txt` in the backend.
   - Configure your `.env` with `GEMINI_API_KEY`, `MAPBOX_TOKEN`, and `SUPABASE_URL`.
   - Start the engine: `uvicorn app.main:app` (Backend) and `npm run dev` (Frontend).

---
**LogiSense AI — Turning Disruption into Competitive Advantage.**
