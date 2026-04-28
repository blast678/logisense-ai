"use client";

import Sidebar from "../components/layout/Sidebar";
import MapComponent from "../components/map/MapComponent";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Package,
  ShieldAlert,
  Leaf,
  GitBranch,
  ChevronRight,
  Clock,
  RefreshCw,
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  Bell,
} from "lucide-react";

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────

// Pre-built GeoJSON for the Mumbai→Nashik Kasara Ghat scenario (TRK-001)
// Shown immediately on load — no backend poll needed for the demo
const TRK001_ORIGINAL = {
  type:"Feature",
  geometry:{ type:"LineString", coordinates:[
    [72.8777,19.0760],[72.9780,19.2180],[73.1640,19.2960],
    [73.4750,19.6430],[73.5530,19.7060],[73.7898,19.9975]
  ]}
};
const TRK001_SAFE = {
  type:"Feature",
  geometry:{ type:"LineString", coordinates:[
    [72.8777,19.0760],[72.9780,19.2180],[73.0540,19.3540],
    [73.1360,19.6540],[73.3210,19.8210],[73.7898,19.9975]
  ]}
};
const MOCK_TRUCKS = [
  { id:"TRK-001", lat:19.0760, lng:72.8777, status:"at-risk", destination:"Nashik FC, NH160", original_geojson:TRK001_ORIGINAL, safe_geojson:null, mode:"terrestrial", action:"IMMEDIATE REROUTE via Wada Bypass" },
  { id:"IND-S-884", lat:12.9716, lng:77.5946,  status:"delayed", destination:"Bengaluru Hub, ORR" },
  { id:"IND-E-902", lat:22.5726, lng:88.3639,  status:"on-time", destination:"Kolkata ICD, NH-12" },
  { id:"IND-S-771", lat:17.385,  lng:78.4867,  status:"delayed", destination:"Hyderabad FC, ORR W" },
  { id:"IND-N-334", lat:26.9124, lng:75.7873,  status:"on-time", destination:"Jaipur DC, NH-48" },
  { id:"TRK-008", lat:13.0827, lng:80.2707,  status:"on-time", destination:"Chennai Port, Ennore" },
];

const MOCK_ALERTS = [
  {
    id:"ALT-DEMO-01", severity:"critical", icon:"🚨",
    title:"Mumbai–Nashik Route Deviation: Shahapur Accident",
    detail:"Local News + Open-Meteo confirm major accident on NH160 at Shahapur (19.4497°N, 73.3341°E). NHAI closed both lanes. Mapbox API executed DYNAMIC BYPASS for TRK-001. Stoppage of 4h 15m avoided.",
    time:"Real-time", trucks:["TRK-001"],
    center_lat:19.4497, center_lng:73.3341,
    stoppage_details:{ duration:"4h 15m", reason:"Major accident detected via Local News", type:"Unplanned Stoppage Avoided", ai_action:"Dynamic API Deviation Executed" },
  },
  {
    id:"ALT-DEMO-02", severity:"critical", icon:"🌀",
    title:"Cyclone Alert: Arabian Sea",
    detail:"GDACS Red Alert active. IMD tracking Cyclone 'Tej' at 18.2°N, 70.1°E, 145 km/h. AISstream shows 12 ships at anchor off JNPT. AI executing Slow Steam for SHP-992, ETA +31hrs.",
    time:"4 min ago", trucks:["SHP-992"],
    center_lat:19.5, center_lng:70.5,
    stoppage_details:{ start_time:"06:14 AM", duration:"41.2 hrs (Est.)", type:"Maritime Corridor Closure", ai_action:"Slow Steam + Port Diversion to Mundra" },
  },
  {
    id:"ALT-DEMO-03", severity:"warning", icon:"🚧",
    title:"Road Block: NH-44 Nagpur",
    detail:"Multi-vehicle collision near Nagpur bypass — 3 HGVs. TomTom shows 8km queue. TRK-004 rerouted via SH-269. ETA impact: +55 mins.",
    time:"9 min ago", trucks:["TRK-004"],
  },
  {
    id:"ALT-DEMO-04", severity:"warning", icon:"⚓",
    title:"Port Congestion: JNPT Mumbai",
    detail:"Vessel queue exceeds 18 ships. Berth wait 41hrs. Gemini recommends Mundra diversion. Cost delta: ₹2.1L.",
    time:"18 min ago", trucks:["SHP-882", "SHP-991"],
  },
  {
    id:"ALT-DEMO-05", severity:"info", icon:"❄️",
    title:"Cold Chain: Reefer Alert — TRK-003",
    detail:"IoT spike: cargo bay 6.8°C (threshold 4°C) for 18 mins. Gemini root-causes traffic delay. Pre-cooling initiated at next depot.",
    time:"34 min ago", trucks:["TRK-003"],
  },
];

const KPI_CARDS = [
  { label:"Active Shipments",    value:"8",    sub:"6 Road · 1 Maritime · 1 Air",     trend:"neutral", icon:Package,    accent:"blue"    },
  { label:"Disruptions Detected", value:"2",    sub:"Kasara Ghat + Arabian Sea",        trend:"up",      icon:ShieldAlert, accent:"amber"   },
  { label:"Deviations Executed",  value:"2",    sub:"OR-Tools reroutes active",          trend:"up",      icon:GitBranch,   accent:"violet"  },
  { label:"Est. CO₂ Saved",       value:"4.2 t",sub:"Via AI Route Optimisation",         trend:"up",      icon:Leaf,        accent:"emerald" },
];
const ACCENT = {
  blue:    { bg:"bg-[#0ea5e9]/10",   border:"border-[#0ea5e9]/20",   icon:"text-[#38bdf8]",  val:"text-[#38bdf8]"  },
  amber:   { bg:"bg-amber-500/10",   border:"border-amber-500/20",   icon:"text-amber-400",  val:"text-amber-400"  },
  violet:  { bg:"bg-violet-500/10",  border:"border-violet-500/20",  icon:"text-violet-400", val:"text-violet-400" },
  emerald: { bg:"bg-emerald-500/10", border:"border-emerald-500/20", icon:"text-emerald-400",val:"text-emerald-400" },
};

const SEV_STYLES = {
  critical: { bar: "bg-red-500",    badge: "bg-red-500/15 text-red-400 border-red-500/25",    dot: "bg-red-500"    },
  warning:  { bar: "bg-amber-500",  badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",  dot: "bg-amber-400"  },
  info:     { bar: "bg-[#0ea5e9]",  badge: "bg-[#0ea5e9]/10 text-[#38bdf8] border-[#0ea5e9]/20", dot: "bg-[#38bdf8]"  },
};

const TREND_ICON = {
  up:      <TrendingUp size={12} className="text-emerald-400" />,
  down:    <TrendingDown size={12} className="text-red-400" />,
  neutral: <Minus size={12} className="text-[#4a6580]" />,
};

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default function DashboardPage() {
  const [selectedTruck,  setSelectedTruck]  = useState(null);
  const [alertFilter,    setAlertFilter]    = useState("all");
  const [liveTrucks,     setLiveTrucks]     = useState(MOCK_TRUCKS); // original route shown on load
  const [liveAlerts,     setLiveAlerts]     = useState(MOCK_ALERTS);
  const [isLoading,      setIsLoading]      = useState(false);
  const [lastRefresh,    setLastRefresh]    = useState("--:--:--");
  const [kpiCards,       setKpiCards]       = useState(KPI_CARDS);
  const [showToast,      setShowToast]      = useState(false);

  // Tracks the Stage-2 GNN reveal timer so cleanup can cancel it on unmount
  const revealTimerRef = useRef(null);

  // Set real clock on mount
  useEffect(() => {
    setLastRefresh(new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit" }));
  }, []);

  // fetchLiveLogistics — manual Refresh click triggers the GNN ripple reveal:
  //   Stage 1 (instant): sea route line appears, SHP-991 looks ON-TIME — no drama
  //   Stage 2 (5 s later): vessel flips to OPTIMIZED + both GNN pins drop + metrics show
  const fetchLiveLogistics = useCallback(async () => {
    // Cancel any previous pending Stage-2 timer
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);

    setIsLoading(true);
    try {
      const res = await fetch("https://logisense-ai.onrender.com/api/disruptions/trigger-live-hunt");
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data = await res.json();

      const fleetStatus = data.routing_engine_decision?.fleet_status ?? [];

      // ── STAGE 1 (Instant): Draw sea route, but SHP-991 looks normal ────────
      setLiveTrucks(fleetStatus.map(t => ({
        id:               t.truck_id,
        lat:              t.lat,
        lng:              t.lng,
        // Override SHP-991 to ON-TIME so no red pin yet
        status:           t.truck_id === "SHP-991" ? "on-time"
                            : t.action?.includes("REROUTE") ? "at-risk"
                            : t.action?.includes("HOLD")   ? "delayed" : "on-time",
        destination:      t.cargo,
        action:           t.truck_id === "SHP-991" ? "En Route — Normal Operations" : t.action,
        mode:             t.mode,
        original_geojson: t.original_geojson,
        safe_geojson:     t.truck_id === "SHP-991" ? t.safe_geojson : null, // Hide the detour for trucks, but draw the sea route for the ship
        metrics:          null,              // metrics hidden in Stage 1
        estimated_cost:   t.estimated_cost,
      })));
      setLiveAlerts([]);  // no pins in Stage 1

      // ── STAGE 2 (5-second delay): GNN ripple effect reveals ───────────────
      revealTimerRef.current = setTimeout(() => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 6000);
        
        // Re-map fleet: SHP-991 flips to OPTIMIZED with full metrics
        setLiveTrucks(fleetStatus.map(t => ({
          id:               t.truck_id,
          lat:              t.lat,
          lng:              t.lng,
          status:           t.truck_id === "SHP-991" ? "optimized"
                              : t.action?.includes("REROUTE") ? "at-risk"
                              : t.action?.includes("HOLD")   ? "delayed" : "on-time",
          destination:      t.cargo,
          action:           t.action,
          mode:             t.mode,
          original_geojson: t.original_geojson,
          safe_geojson:     t.safe_geojson,
          metrics:          t.metrics ?? null,  // ← fuel_saved, cost_saved, ETA now visible
          estimated_cost:   t.estimated_cost,
        })));

        // Drop both GNN alert pins simultaneously
        if (data.active_threats?.length > 0) {
          const mappedAlerts = (data.active_threats || []).map((threat, index) => ({
            id: threat.id || `LIVE-ALT-${index}`,
            severity: (threat.severity || "warning").toLowerCase(),
            icon: threat.icon || (threat.severity === "INFO" ? "🟡" : "🚨"),
            title: threat.location || "Unknown Disruption",
            detail: threat.stoppage_details?.action || threat.stoppage_details?.reason || threat.description || "System processing...",
            geojson_polygon: threat.geojson_polygon || null,
            center_lat: threat.center_lat || threat.lat,
            center_lng: threat.center_lng || threat.lng,
            stoppage_details: threat.stoppage_details || null,
            timestamp: threat.timestamp || null,
            time: threat.timestamp || new Date().toLocaleTimeString(),
            trucks: threat.id?.includes("GNN") ? ["SHP-991"] : ["TRK-001"],
            lat: threat.lat,
            lng: threat.lng
          }));
          setLiveAlerts(mappedAlerts);
        }

        const shp = fleetStatus.find(t => t.truck_id === "SHP-991");
        if (shp && shp.metrics) {
          setKpiCards([
            { label:"Active Shipments",    value:"8",    sub:"6 Road · 1 Maritime · 1 Air",     trend:"neutral", icon:Package,    accent:"blue"    },
            { label:"Disruptions Detected", value:"3",    sub:"GNN + API alerts active",        trend:"up",      icon:ShieldAlert, accent:"amber"   },
            { label:"Deviations Executed",  value:"2",    sub:"OR-Tools + Slow Steaming",          trend:"up",      icon:GitBranch,   accent:"violet"  },
            { label:"Fuel & Cost Saved",   value: shp.metrics.fuel_saved, sub:`${shp.metrics.cost_saved} via Optimization`, trend:"up",      icon:Leaf,        accent:"emerald" },
          ]);
        }

        setLastRefresh(new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit" }));
      }, 5000);

    } catch (err) {
      console.error("Live hunt failed — keeping mock data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // No auto-polling — user clicks Refresh to trigger the GNN ripple reveal
  // Cleanup cancels any pending Stage-2 timer on unmount
  useEffect(() => {
    setLastRefresh(new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit" }));
    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, []);

  const filteredAlerts =
    alertFilter === "all"
      ? liveAlerts
      : liveAlerts.filter((a) => a.severity === alertFilter);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080c13] font-sans text-white">

      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="flex flex-col flex-1 overflow-hidden min-w-0">

        {/* ── Top bar ── */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-[#1e2a3a] bg-[#0b0f1a] shrink-0">
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
              <span className="text-[#38bdf8]">The Pulse</span>
              <span className="text-[#1e2a3a]">/</span>
              <span className="text-[#4a6580] font-normal text-sm">Dispatcher Dashboard</span>
            </h1>
            <p className="text-[#2a3a4d] text-[10px] font-mono mt-0.5">
              LogiSense AI · Fleet Operations · Real-time
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Live pulse */}
            <div className="flex items-center gap-1.5 text-[10px] text-[#34d399] font-mono bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </div>
            <div className="flex items-center gap-1.5 text-[#2a3a4d] text-[11px] font-mono">
              <Clock size={11} />
              {lastRefresh} IST
            </div>
            <button 
              onClick={fetchLiveLogistics}
              disabled={isLoading}
              className={`flex items-center gap-1.5 text-[#4a6580] hover:text-white text-[11px] border border-[#1e2a3a] rounded-md px-2.5 py-1.5 hover:border-[#2a3a4d] transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw size={12} className={isLoading ? "animate-spin text-[#38bdf8]" : ""} />
              {isLoading ? "Hunting..." : "Refresh"}
            </button>
            <button className="relative text-[#4a6580] hover:text-white p-1.5 rounded-md hover:bg-[#111825] transition-colors">
              <Bell size={16} />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-[#0b0f1a]" />
            </button>
          </div>
        </header>

        {/* ── KPI row ── */}
        <section className="grid grid-cols-4 gap-3 px-5 pt-4 pb-3 shrink-0">
          {kpiCards.map(({ label, value, sub, trend, icon: Icon, accent }) => {
            const a = ACCENT[accent];
            return (
              <div
                key={label}
                className={`relative overflow-hidden rounded-xl border ${a.border} ${a.bg} px-4 py-3.5 flex items-center gap-4`}
              >
                <div className={`w-10 h-10 rounded-lg ${a.bg} border ${a.border} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={a.icon} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#4a6580] text-[10px] font-semibold uppercase tracking-widest">{label}</p>
                  <p className={`${a.val} text-2xl font-bold font-mono leading-tight mt-0.5`}>{value}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {TREND_ICON[trend]}
                    <p className="text-[#2a3a4d] text-[10px]">{sub}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* ── Map + Alerts ── */}
        <div className="flex flex-1 gap-3 px-5 pb-4 overflow-hidden min-h-0">

          {/* Map — 70% */}
          <div className="flex-[7] min-w-0 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[#4a6580] text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1 h-3 bg-[#0ea5e9] rounded-full inline-block" />
                Fleet Map — India Network
              </span>
              <div className="flex gap-1.5">
                {["on-time","delayed","at-risk"].map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedTruck(null)}
                    className="text-[10px] text-[#4a6580] hover:text-[#94a3b8] border border-[#1e2a3a] rounded px-2 py-1 hover:border-[#2a3a4d] transition-colors capitalize"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <MapComponent
                trucks={liveTrucks} 
                activeAlerts={liveAlerts}
                selectedTruckId={selectedTruck}
                onTruckSelect={setSelectedTruck}
              />
            </div>
          </div>

          {/* Alerts panel — 30% */}
          <div className="flex-[3] min-w-0 flex flex-col gap-2 overflow-hidden">

            {/* Gemini badge + filter */}
            <div className="flex items-center justify-between">
              <span className="text-[#4a6580] text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1 h-3 bg-amber-400 rounded-full inline-block" />
                Live Alerts &amp; Metrics
              </span>
              <div className="flex items-center gap-1.5 bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 rounded-full px-2 py-0.5">
                <BrainCircuit size={10} className="text-[#38bdf8]" />
                <span className="text-[#38bdf8] text-[9px] font-bold tracking-wide">GEMINI 1.5 PRO</span>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 shrink-0">
              {["all", "critical", "warning", "info"].map((f) => (
                <button
                  key={f}
                  onClick={() => setAlertFilter(f)}
                  className={`flex-1 text-[9px] font-bold uppercase tracking-wider py-1 rounded-md border transition-all
                    ${alertFilter === f
                      ? "bg-[#1e2a3a] border-[#2a3a4d] text-white"
                      : "border-transparent text-[#2a3a4d] hover:text-[#4a6580]"
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Alert feed */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1e2a3a]">
              {filteredAlerts.map((alert) => {
                const sev = SEV_STYLES[alert.severity];
                return (
                  <div
                    key={alert.id}
                    className="relative rounded-xl border border-[#1e2a3a] bg-[#0b0f1a] overflow-hidden hover:border-[#2a3a4d] transition-all cursor-pointer group"
                  >
                    {/* Severity left bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${sev.bar}`} />

                    <div className="pl-4 pr-3 py-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="text-sm leading-none flex-shrink-0">{alert.icon}</span>
                          <p className="text-[#e2e8f0] text-xs font-semibold leading-tight truncate">
                            {alert.title}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 text-[9px] font-bold uppercase tracking-wider border rounded px-1.5 py-0.5 ${sev.badge}`}>
                          {alert.severity}
                        </span>
                      </div>

                      <p className="text-[#4a6580] text-[10px] leading-relaxed">{alert.detail}</p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex gap-1 flex-wrap">
                          {alert.trucks.map((tid) => (
                            <button
                              key={tid}
                              onClick={() => setSelectedTruck(tid === selectedTruck ? null : tid)}
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors
                                ${selectedTruck === tid
                                  ? "bg-[#0ea5e9]/20 text-[#38bdf8] border-[#0ea5e9]/40"
                                  : "bg-[#111825] text-[#4a6580] border-[#1e2a3a] hover:text-[#94a3b8]"
                                }`}
                            >
                              {tid}
                            </button>
                          ))}
                        </div>
                        <span className="text-[#2a3a4d] text-[9px] font-mono flex-shrink-0">{alert.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredAlerts.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 text-[#2a3a4d]">
                  <Filter size={20} className="mb-2" />
                  <p className="text-xs">No alerts for this filter</p>
                </div>
              )}
            </div>

            {/* Fleet roster mini-table */}
            <div className="shrink-0 border border-[#1e2a3a] rounded-xl bg-[#0b0f1a] overflow-hidden">
              <div className="px-3 py-2 border-b border-[#1e2a3a] flex items-center justify-between">
                <span className="text-[#4a6580] text-[10px] font-semibold uppercase tracking-widest">Fleet Roster</span>
                <span className="text-[#2a3a4d] text-[9px] font-mono">{liveTrucks.length} vehicles</span>
              </div>
              <div className="max-h-[168px] overflow-y-auto divide-y divide-[#111825]">
                {liveTrucks.map((truck) => {
                  const sev = {
                    "on-time": "text-emerald-400 bg-emerald-500/10",
                    delayed:   "text-amber-400 bg-amber-500/10",
                    "at-risk": "text-red-400 bg-red-500/10",
                  }[truck.status];
                  return (
                    <button
                      key={truck.id}
                      onClick={() => setSelectedTruck(truck.id === selectedTruck ? null : truck.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#111825] transition-colors text-left
                        ${selectedTruck === truck.id ? "bg-[#111825]" : ""}`}
                    >
                      <span className="text-[#94a3b8] text-[10px] font-mono font-semibold w-16 flex-shrink-0">{truck.id}</span>
                      <span className="text-[#4a6580] text-[10px] truncate flex-1">{truck.destination.split(",")[0]}</span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${sev}`}>
                        {truck.status}
                      </span>
                      <ChevronRight size={10} className="text-[#2a3a4d] flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Autonomous Dispatch Toast */}
        <div className={`absolute bottom-6 right-6 z-50 transition-all duration-500 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
          <div className="bg-[#0b0f1a] border border-emerald-500/40 rounded-xl p-4 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-start gap-3 w-80">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
              <span className="text-emerald-400 text-lg">📱</span>
            </div>
            <div>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-0.5">Zero-Touch Dispatch</p>
              <p className="text-white text-sm font-semibold leading-tight">Recommendation sent to Rajesh (TRK-001)</p>
              <p className="text-[#94a3b8] text-[10px] mt-1 line-clamp-2">"Major Accident detected. Follow Mapbox OR-Tools bypass via Wada."</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
