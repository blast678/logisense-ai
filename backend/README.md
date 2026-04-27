# LogiSense AI – Supply‑Chain Disruption Detection

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Folder Layout](#folder-layout)
4. [Environment Variables](#environment-variables)
5. [Data Sources & How They Work](#data-sources--how-they-work)
   - [1️⃣ Google News RSS (live_ingestion)](#google-news-rss)
   - [2️⃣ Open‑Meteo Weather](#open‑meteo-weather)
   - [3️⃣ TomTom Traffic Flow](#tomtom-traffic-flow)
   - [4️⃣ GDACS Global Disaster Alerts](#gdacs-global-disaster-alerts)
   - [5️⃣ AISstream Maritime](#aisstream-maritime)
6. [Pipeline Execution Flow](#pipeline-execution-flow)
7. [Running the API Locally](#running-the-api-locally)
8. [Testing Individual Sources](#testing-individual-sources)
9. [Adding New Sources (Guidelines)](#adding-new-sources)
10. [Troubleshooting & FAQ](#troubleshooting--faq)
11. [License & Acknowledgements](#license--acknowledgements)

---

## Overview
LogiSense AI is a **FastAPI‑based backend** that continuously monitors multiple external feeds to detect supply‑chain disruptions (weather, traffic, natural disasters, maritime congestion, and news).  Every 15 minutes a scheduled job runs the **five‑source pipeline**, merges results, de‑duplicates nearby alerts, and passes the unified threat list to an OR‑Tools optimizer that calculates rerouting actions for a fleet of trucks.

The system is **fully async/await** – all I/O (HTTP, WebSocket, RSS) is performed with `httpx`, `websockets`, and `feedparser` inside `async` functions, keeping the event loop responsive.

---

## Technology Stack
| Layer | Package | Why it was chosen |
|---|---|---|
| **Web framework** | **FastAPI** (v0.136) | High‑performance async API, automatic OpenAPI docs, easy dependency injection |
| **Scheduler** | **APScheduler** | Fires the pipeline every 15 min without blocking the event loop |
| **HTTP client** | **httpx** (async) | Modern async‑compatible HTTP client, supports time‑outs & connection pools |
| **RSS parser** | **feedparser** | Robust parsing of the GDACS and Google News RSS feeds |
| **Geocoding** | **OpenStreetMap Nominatim** (via `httpx`) | Free, no‑key geocoding for human‑readable locations |
| **AI parsing** | **Gemini 2.5 Flash** (via `google-generativeai`) | Turns free‑form text into the unified threat schema |
| **Optimization** | **OR‑Tools** | Computes alternative routes based on detected threats |
| **WebSocket** | **websockets** | Used to pull live AIS vessel positions for maritime congestion |
| **Environment handling** | **python‑dotenv** | Loads `.env` variables automatically on import (important for source modules) |

---

## Folder Layout
```
backend/
│   .env                # API keys & config (see below)
│   requirements.txt    # pip dependencies
│   README.md           # <‑‑ you are reading this now
│
└─ app/
   │   main.py          # FastAPI entry point, includes APScheduler job
   │   __init__.py
   │
   ├─ api/
   │   └─ routes/
   │       └─ disruptions.py   # New `/run-pipeline` endpoint & legacy endpoints
   │
   ├─ services/
   │   │   gemini_parser.py    # AI analysis (unchanged)
   │   │   geocoder.py         # OSM geocoding (unchanged)
   │   │   live_ingestion.py   # Google News RSS ingestion (unchanged)
   │   │   notifer.py          # WhatsApp payload builder (unchanged)
   │   │   or_tools_optimizer.py (unchanged)
   │   │
   │   └─ sources/            # ★ NEW: all five external‑source modules live here
   │       │   __init__.py     # loads .env on import
   │       │   weather.py      # Open‑Meteo weather scan
   │       │   traffic.py      # TomTom traffic flow
   │       │   global_alerts.py# GDACS RSS feed
   │       │   maritime.py     # AISstream WebSocket
   │
   └─ ...
```

---

## Environment Variables
Create a **`.env`** file at the project root (`backend/.env`).  The file is **loaded automatically** by `app/services/sources/__init__.py` *and* by FastAPI startup.
```dotenv
# Existing keys (already in your repo)
NEWS_API_KEY=...   # used by live_ingestion (Google News RSS)
GEMINI_API_KEY=... # Gemini 2.5 Flash

# ❗ NEW keys required for the multi‑source pipeline ❗
# – TomTom Traffic Flow API – free tier available at https://developer.tomtom.com/
TOMTOM_KEY=your_tomtom_api_key_here

# – AISstream WebSocket – free tier available at https://aisstream.io/
AIS_KEY=your_aisstream_api_key_here
```
*All source modules read their keys via `os.getenv()` so **no hard‑coded secrets** are ever committed.*

---

## Data Sources & How They Work
### 1️⃣ Google News RSS (`live_ingestion.py`)
* **What** – Scrapes Marathi‑language Google News RSS for keywords like *Landslide*, *Accident*, *Road Closed*.
* **How** – `feedparser` parses the RSS, the latest 2 entries are sent to `gemini_parser.analyze_unstructured_alert` which returns a threat dict in the unified schema.
* **When** – Executed every 15 min by the APScheduler job **and** on demand via `/trigger-live-hunt`.
* **Why** – News is the fastest indicator of emerging local disruptions.

### 2️⃣ Open‑Meteo Weather (`weather.py`)
* **What** – Pulls hourly `precipitation`, `wind_speed_10m`, `visibility` for **all eight corridor checkpoints** in a **single API call**.
* **How** – Batch request via `httpx.AsyncClient` (10 sec timeout).  Only the current hour is examined; severity is derived using the thresholds you specified (CRITICAL, HIGH, MEDIUM).  Returns only MEDIUM+ threats.
* **When** – Called inside the pipeline (`/run-pipeline`).
* **Why** – Weather directly impacts road safety and travel time.

### 3️⃣ TomTom Traffic Flow (`traffic.py`)
* **What** – Queries TomTom’s *Flow Segment Data* for the three major chokepoints.
* **How** – `httpx.AsyncClient` with an `asyncio.Semaphore(5)` limits concurrent calls.  From the response we extract `currentSpeed`, `freeFlowSpeed`, and `roadClosure`.  Congestion ratio = `(free‑flow – current) / free‑flow`.  Severity is mapped (CRITICAL >80 % or roadClosure, HIGH >50 %, MEDIUM >25 %).
* **When** – Part of the pipeline; skips entirely if `TOMTOM_KEY` is missing.
* **Why** – Traffic jams or closures are a primary cause of truck delays.

### 4️⃣ GDACS Global Disaster Alerts (`global_alerts.py`)
* **What** – Reads the GDACS RSS feed (`https://www.gdacs.org/xml/rss.xml`).
* **How** – `feedparser` parses each entry; we extract `gdacs:alertlevel` (mapped to CRITICAL/HIGH/LOW) and `gdacs:eventtype`.  Only **Orange** or **Red** alerts from the **last 48 h** are kept.  Coordinates are extracted from the `georss:point` field, with multiple fall‑backs for robustness.
* **When** – Executed in the pipeline; no API key needed.
* **Why** – Provides early warnings for natural‑disaster events that could block highways or ports.

### 5️⃣ AISstream Maritime (`maritime.py`)
* **What** – Connects to `wss://stream.aisstream.io/v0/stream` and watches three strategic maritime chokepoints.
* **How** – Sends a subscription JSON containing our API key and the bounding boxes.  For **30 seconds** we collect `PositionReport` messages, count vessels with `NavigationalStatus == 1` (anchored).  Congestion severity: >20 → CRITICAL, >10 → HIGH, >5 → MEDIUM.
* **When** – Runs in the pipeline; skips if `AIS_KEY` is missing.
* **Why** – Anchored vessels indicate a traffic jam that can affect shipping lanes and downstream truck deliveries.

---

## Pipeline Execution Flow
1. **Scheduler** (APScheduler) triggers `run_pipeline` every 15 min **or** you call `/api/run-pipeline` manually.
2. **Parallel async fetch** via `asyncio.gather(..., return_exceptions=True)`:
   - `hunt_for_disruptions()` (Google News)
   - `fetch_weather_threats()`
   - `fetch_traffic_threats()`
   - `fetch_global_alerts()`
   - `fetch_maritime_threats()`
3. **Result handling**
   - Each source’s list is logged (`✓ n threats` or `✗ key missing`).
   - All threat dicts are concatenated.
4. **Deduplication** – Haversine distance ≤ 10 km merges alerts, keeps the highest severity, adds `confirmed_by_multiple_sources: true`.
5. **Routing decision** – The most severe threat is converted to a GPS dict and fed to `or_tools_optimizer.calculate_detour`.
6. **WhatsApp payload** – For each affected truck, a markdown message is generated via `generate_whatsapp_payload`.
7. **API response** – Returns a rich JSON object containing:
   - timestamps, source status, total threats, multi‑source confirmations, the unified threat list, and fleet actions.

---

## Running the API Locally
```powershell
# 1️⃣ Clone / navigate to the repo
cd C:\Projects\logisense-ai\backend

# 2️⃣ Create a virtual‑env (already present as `venv/`)
# Activate
.\venv\Scripts\activate

# 3️⃣ Install dependencies (if you added new ones)
pip install -r requirements.txt

# 4️⃣ Populate .env (see the section above) – include TOMTOM_KEY and AIS_KEY.

# 5️⃣ Start the server (the APScheduler job will start automatically)
uvicorn app.main:app --reload
```
Open **`http://127.0.0.1:8000/docs`** – Swagger UI lists:
- `GET /api/run-pipeline` (full 5‑source scan)
- `GET /api/trigger-live-hunt` (news only)
- `POST /api/analyze-alert` (raw Gemini parsing)

---

## Testing Individual Sources
Run the snippets below **after activating the venv**.  They print diagnostic messages so you can see exactly what each source is doing.
```powershell
# Weather – shows per‑checkpoint values
venv\Scripts\python.exe -c "import asyncio; from app.services.sources.weather import fetch_weather_threats; print(asyncio.run(fetch_weather_threats()))"

# GDACS – reports total entries and filtered count
venv\Scripts\python.exe -c "import asyncio; from app.services.sources.global_alerts import fetch_global_alerts; r=asyncio.run(fetch_global_alerts()); print('GDACS result:', len(r), 'threats'); print(r)"

# Traffic – requires TOMTOM_KEY
venv\Scripts\python.exe -c "import asyncio; from app.services.sources.traffic import fetch_traffic_threats; print(asyncio.run(fetch_traffic_threats()))"

# Maritime – requires AIS_KEY (30‑sec collection)
venv\Scripts\python.exe -c "import asyncio; from app.services.sources.maritime import fetch_maritime_threats; print(asyncio.run(fetch_maritime_threats()))"
```
If a key is missing, the module prints a friendly message and returns an empty list – **the pipeline never crashes**.

---

## Adding New Sources (Guidelines)
1. **Create a new module** under `app/services/sources/` with an **async `fetch_<name>() -> List[Dict]`** signature.
2. **Return unified‑schema dictionaries** (same keys as in the README).  The function should **never raise**; wrap external calls in `try/except` and return `[]` on failure.
3. **Add the module to `disruptions.py`** – import the function and include it in the `asyncio.gather` call.
4. **Update the terminal logs** to mirror the format used by the other sources.
5. **Update `sources/__init__.py`** if you need additional environment loading.
6. **Write tests** under `tests/` that mock the external HTTP/WebSocket calls.

---

## Troubleshooting & FAQ
| Symptom | Likely Cause | Fix |
|---|---|---|
| `✗ TOMTOM_KEY not set` | `.env` missing or not loaded | Ensure `TOMTOM_KEY` is defined; the `sources/__init__.py` now runs `load_dotenv()` automatically. |
| `✗ AIS_KEY not set` | Same as above for AIS | Add `AIS_KEY` to `.env`. |
| No threats from Weather even though it’s raining | Current hour may be clear; the API only checks **current hour**.  You can adjust `now_hour` logic for testing. |
| UnicodeEncodeError when printing symbols | Windows console uses cp1252. | All source modules now use pure ASCII (`->`, `FAILED`). |
| `[]` from GDADS even though you expect alerts | No Orange/Red alerts in the last 48 h.  The feed is live; try again later or lower the filter for testing. |
| Pipeline hangs >30 s | Likely the AIS WebSocket collection hasn't finished.  It deliberately runs for 30 s; you can temporarily comment it out for faster debugging. |

---

## License & Acknowledgements
* This project is **open source** under the MIT License.
* Thanks to the free APIs that make the pipeline possible:
  - **Open‑Meteo** – weather forecasts
  - **TomTom** – traffic flow data (free tier)
  - **GDACS** – disaster alerts
  - **AISstream** – AIS vessel positions
  - **Google News RSS** – news aggregation
* The AI component uses **Google Gemini 2.5 Flash** (subject to its own terms of service).

---

*Happy hacking!*  🎯🚀

---

*Last updated: 2026‑04‑26*
