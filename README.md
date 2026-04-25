# LogiSense AI 🚛🔮

**Google Solution Challenge 2026 Submission**

LogiSense AI is an intelligent disruption intelligence platform built on Google Cloud that shifts supply chain management from *reactive* to *predictive*. By ingesting unstructured local data and leveraging Google's optimization algorithms, we detect bottlenecks up to 72 hours before they cascade and automatically reroute fleets.

Built specifically for the underserved logistics markets in India and the Global South, LogiSense democratizes enterprise-grade supply chain intelligence.

---

## 🛑 The Problem

Modern global supply chains operate with massive blind spots. Logistics companies rely on isolated, static systems and only discover disruptions—like a flooded highway or a port strike—*after* a driver is already stuck. This reactive approach costs the global economy over $1.5 trillion annually and generates massive amounts of wasted CO2 from idling fleets.

Current enterprise solutions (like Blue Yonder or FarEye) are prohibitively expensive for small fleet owners, require complex hardware integrations, and force drivers to use clunky proprietary apps.

## 💡 The Solution: LogiSense AI

We built an autonomous air-traffic controller for trucks. Here is how we outperform the legacy titans:

* **Unstructured Risk Parsing (The Gemini Advantage):** Instead of relying solely on structured GPS telemetry, our backend uses **Vertex AI (Gemini 1.5 Pro)** to parse unstructured local data—vernacular news, Twitter/X alerts about local strikes, and text-based port advisories—converting chaos into structured risk scores.
* **Disruption Simulation Sandbox:** A Next.js/React digital twin interface that allows dispatchers to click on any road segment on the Google Maps embed, mark it as "blocked," and watch the system instantly recalculate affected shipments.
* **Zero-Friction Driver Adoption:** No battery-draining apps required. When a disruption is detected, the system triggers a **WhatsApp API** message to the driver with a 1-tap Google Maps reroute link.
* **Carbon-Aware Optimization:** Using **Google OR-Tools**, every rerouting calculation simultaneously balances time, fuel cost, driver shift constraints, and CO2 emissions. 
* **Disruption Intelligence Network:** When any LogiSense user reports a disruption, that signal is anonymized and shared across the network. Every fleet operator benefits from collective real-world experience.

---

## 🛠️ Technology Stack

**Backend & AI Engine**
* **Framework:** Python / FastAPI
* **AI/ML:** Google Vertex AI (Gemini 1.5 Pro)
* **Optimization:** Google OR-Tools (Vehicle Routing Problem Solver)
* **Data Pipelines:** Simulated telemetry & external API ingestion (Weather, Maps)

**Frontend & Visuals**
* **Framework:** React / Next.js
* **Maps & Routing:** Google Maps JavaScript SDK / Routes API
* **Alerting:** WhatsApp Business Cloud API (or Twilio for testing)

---

## 📂 Project Structure

This repository is strictly decoupled to allow concurrent development on the frontend and backend. 

```text
logisense-ai/
├── backend/                       # Python / FastAPI Engine Room
│   ├── app/
│   │   ├── api/routes/            # API endpoints (fleet status, alert triggers)
│   │   ├── core/                  # Configuration and environment variables
│   │   ├── models/                # Database models (SQLAlchemy)
│   │   ├── schemas/               # Data validation (Pydantic)
│   │   ├── services/              # Business logic (where the magic happens)
│   │   │   ├── gemini_parser.py   # Vertex AI unstructured data parsing
│   │   │   ├── or_tools_optimizer.py # Route constraint solver
│   │   │   └── simulator.py       # Synthetic fleet telemetry generator
│   │   ├── main.py                # FastAPI application entry point
│   │   └── __init__.py
│   ├── tests/                     # Unit testing
│   ├── .env                       # Backend secrets (DO NOT COMMIT)
│   └── requirements.txt           # Python dependencies
│
├── frontend/                      # React / Next.js Command Center
│   ├── src/
│   │   ├── assets/                # Images, icons, static files
│   │   ├── components/            # Reusable UI (Map views, Alert cards)
│   │   ├── pages/                 # Main views (Dispatcher Dashboard, Sandbox)
│   │   ├── services/              # API callers (Axios/Fetch to FastAPI)
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json               # Node dependencies
│   └── vite.config.js             # Build configuration
│
└── .gitignore                     # Git ignore rules