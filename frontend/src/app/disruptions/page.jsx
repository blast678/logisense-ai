'use client';

import { useState, useCallback } from "react";
import SimulationControls from "../../components/disruptions/SimulationControls";
import ResultsPanel from "../../components/disruptions/ResultsPanel";
import MapComponent from "../../components/map/MapComponent";
import {
  FlaskConical,
  ChevronRight,
  LayoutDashboard,
  Truck,
  BrainCircuit,
  BarChart3,
  Settings,
  Bell,
  ShieldAlert,
  Zap,
  LogOut,
  Activity,
} from "lucide-react";

// ─── Mock route paths (lat/lng arrays) ───────────────────────────────────
// These represent roads through India for demo purposes.
// In production, these come from the Google Directions API + OR-Tools backend.
const ROUTE_PATHS = {
  original: [
    { lat: 28.6139, lng: 77.2090 }, // Delhi
    { lat: 27.1767, lng: 78.0081 }, // Agra
    { lat: 26.4499, lng: 80.3319 }, // Kanpur
    { lat: 25.3176, lng: 82.9739 }, // Varanasi
    { lat: 22.5726, lng: 88.3639 }, // Kolkata
  ],
  optimized: [
    { lat: 28.6139, lng: 77.2090 }, // Delhi
    { lat: 27.5706, lng: 79.0004 }, // Mainpuri (bypass)
    { lat: 26.7606, lng: 83.3732 }, // Gorakhpur (north detour)
    { lat: 25.5788, lng: 85.1216 }, // Patna
    { lat: 22.5726, lng: 88.3639 }, // Kolkata
  ],
};

const DISRUPTION_RATIONALE = {
  flood: `The original NH-48 corridor passes through a low-lying floodplain near Kanpur where NDMA has issued a Red Alert for water levels exceeding 85m above sea level. Gemini's environmental context layer identified 3 submerged bridges and confirmed road closure via satellite cross-reference. The optimized route via Gorakhpur adds 47km but avoids 6 high-risk water crossings, reduces transit risk from Critical to Low, and has been cross-validated with live traffic feeds from NHAI. Historical flood patterns for this region indicate an 89% probability of 18+ hour delays on the original path.`,
  protest: `Civil unrest detected at a major intersection on the primary route, with Gemini parsing social media signals and news APIs confirming road occupation by ~2,000 participants. OR-Tools recomputed a northern bypass avoiding the blockade zone, confirmed by Municipal Corporation public notices. The detour adds 31km but eliminates a projected 4.5-hour wait time. Adjacent routes SH-57 and NH-730 are operational with normal traffic flow.`,
  accident: `A multi-vehicle collision involving 3 heavy goods vehicles was confirmed via real-time NHAI incident feed. Emergency services have established a 2km exclusion perimeter. Gemini estimated clearance time at 5–7 hours based on vehicle types and historical incident data. The optimized route re-paths through State Highway 19, adding 22km but ensuring ETA improvement of 3.2 hours net. Load restrictions on alternate bridges have been pre-validated for this fleet type.`,
  fire: `Hazardous material incident detected with a 5km exclusion zone active. Emergency services have restricted access with no estimated reopening time. Gemini's chemical hazard model flagged CBRN risk for the cargo manifest. The optimized route provides maximum safe distance, uses only verified HAZCHEM-approved corridors, and has been pre-cleared with State PCB emergency contact. All toll plaza operators along the alternate route have been notified.`,
  construction: `NHAI construction works are in progress with lane closures from 06:00–22:00 IST. Average speed reduction of 65% confirmed from probe vehicle data. The optimized route uses a parallel expressway with higher speed limits, resulting in 38 minutes of net time savings despite the added 19km distance. Construction is projected to continue for 14 days.`,
  power_outage: `Grid failure affecting 12 traffic signal clusters along the primary corridor. Manual traffic management is causing 8–12 minute delays per junction. OR-Tools computed an unaffected bypass corridor with uninterrupted signal infrastructure. Estimated time saving of 1.8 hours versus waiting for power restoration (ETA unknown per DISCOM).`,
};

// ─── Sidebar (persisted from Dashboard) ──────────────────────────────────
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "The Pulse",     href: "#"              },
  { icon: Truck,           label: "Fleet View",    href: "#"              },
  { icon: BrainCircuit,    label: "AI Predictions",href: "#", badge: "NEW"},
  { icon: ShieldAlert,     label: "Disruptions",   href: "#", badge: 4, active: true },
  { icon: BarChart3,       label: "Analytics",     href: "#"              },
  { icon: Bell,            label: "Alerts",        href: "#", badge: 7   },
  { icon: Settings,        label: "Settings",      href: "#"              },
];

function Sidebar() {
  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col bg-slate-900 border-r border-slate-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800 min-h-[64px]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
          <Zap size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-white font-bold text-sm tracking-wide leading-none font-mono">LogiSense</p>
          <p className="text-sky-400 text-[10px] font-semibold tracking-[0.15em] mt-0.5 uppercase">AI</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5">
        <p className="text-slate-700 text-[9px] font-bold tracking-[0.2em] uppercase px-3 pb-2 pt-1">Navigation</p>
        {NAV_ITEMS.map(({ icon: Icon, label, href, active, badge }) => (
          <a key={label} href={href}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
              ${active
                ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
              }`}
          >
            <Icon size={17} className={`flex-shrink-0 ${active ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-500"}`} strokeWidth={active ? 2.5 : 2} />
            <span className="truncate flex-1">{label}</span>
            {badge !== undefined && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none
                ${typeof badge === "number"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                }`}>{badge}</span>
            )}
          </a>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">A</div>
          <div className="overflow-hidden flex-1">
            <p className="text-slate-400 text-xs font-semibold truncate">Admin User</p>
            <p className="text-slate-700 text-[10px] truncate">Fleet Manager</p>
          </div>
          <LogOut size={14} className="text-slate-700 group-hover:text-slate-500 transition-colors" />
        </div>
      </div>
    </aside>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function DisruptionsPage() {
  const [disruptionType, setDisruptionType]       = useState("flood");
  const [blockadeCoords, setBlockadeCoords]       = useState(null);
  const [simulationResult, setSimulationResult]  = useState(null);
  const [isRunning, setIsRunning]                = useState(false);

  const handleMapClick = useCallback((coords) => {
    setBlockadeCoords(coords);
    // Clear previous result when pin moves
    setSimulationResult(null);
  }, []);

  const handleClearBlockade = useCallback(() => {
    setBlockadeCoords(null);
    setSimulationResult(null);
  }, []);

  /**
   * handleRunSimulation
   * Mocks a backend call to a Python FastAPI service that runs:
   *   1. Google OR-Tools VRP solver for optimal rerouting
   *   2. Gemini 1.5 Pro for contextual risk rationale
   */
  const handleRunSimulation = useCallback(async () => {
    if (!blockadeCoords || !disruptionType) return;
    setIsRunning(true);
    setSimulationResult(null);

    // ── Simulated network latency ──
    await new Promise((resolve) => setTimeout(resolve, 2200));

    // ── Mock response (replace with real fetch to /api/simulate) ──
    // const res = await fetch("/api/simulate", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ disruptionType, blockadeCoords, routeId: "NH-48-DEL-KOL" }),
    // });
    // const data = await res.json();

    const mockResponse = {
      originalPath:  ROUTE_PATHS.original,
      optimizedPath: ROUTE_PATHS.optimized,
      original: {
        time:     14.5,
        distance: 1480,
        via:      ["Agra", "Kanpur", "Varanasi"],
      },
      optimized: {
        time:     12.2,
        distance: 1412,
        co2Saved: 18.4,
        via:      ["Mainpuri bypass", "Gorakhpur", "Patna"],
      },
      rationale: DISRUPTION_RATIONALE[disruptionType] ?? DISRUPTION_RATIONALE.flood,
    };

    setSimulationResult(mockResponse);
    setIsRunning(false);
  }, [blockadeCoords, disruptionType]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-white">
      <Sidebar />

      <main className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* ── Top bar ── */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <LayoutDashboard size={13} />
            <ChevronRight size={12} />
            <span className="text-slate-400 font-medium">Disruptions</span>
            <ChevronRight size={12} />
            <span className="text-white font-semibold">Digital Twin Simulator</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1">
              <FlaskConical size={11} className="text-indigo-400" />
              <span className="text-indigo-300 text-[10px] font-bold tracking-wide">SIMULATOR MODE</span>
            </div>
            {isRunning && (
              <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                <Activity size={10} className="animate-pulse" />
                COMPUTING
              </div>
            )}
          </div>
        </header>

        {/* ── Page title ── */}
        <div className="px-5 pt-4 pb-3 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FlaskConical size={18} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Disruption Simulator
                <span className="ml-2 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full align-middle">
                  Digital Twin
                </span>
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">
                Place a disruption on the map · select its type · run the OR-Tools simulation to see Gemini-powered rerouting
              </p>
            </div>
          </div>
        </div>

        {/* ── Main content area ── */}
        <div className="flex flex-1 gap-4 px-5 pb-5 overflow-hidden min-h-0">

          {/* Left control column */}
          <div className="w-[280px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
              <SimulationControls
                disruptionType={disruptionType}
                onDisruptionTypeChange={setDisruptionType}
                blockadeCoords={blockadeCoords}
                onClearBlockade={handleClearBlockade}
                onRunSimulation={handleRunSimulation}
                isRunning={isRunning}
                hasResult={!!simulationResult}
              />
            </div>
          </div>

          {/* Center map */}
          <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
            {/* Map fills available space */}
            <div className="flex-1 min-h-0">
              <MapComponent
                onMapClick={handleMapClick}
                blockadeCoords={blockadeCoords}
                originalPath={simulationResult?.originalPath ?? []}
                optimizedPath={simulationResult?.optimizedPath ?? []}
                simulationRunning={isRunning}
              />
            </div>
          </div>

          {/* Right results column */}
          <div className="w-[360px] flex-shrink-0 flex flex-col overflow-y-auto">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex-1">
              <ResultsPanel
                simulationResult={simulationResult}
                disruptionType={disruptionType}
                isRunning={isRunning}
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
