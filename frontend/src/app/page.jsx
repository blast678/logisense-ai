"use client";

import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import MapComponent from "../components/map/MapComponent";
import {
  Package,
  ShieldAlert,
  Leaf,
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

const MOCK_TRUCKS = [
  { id: "TRK-001", lat: 28.6139, lng: 77.209, status: "on-time",  destination: "Delhi Warehouse, NH-44" },
  { id: "TRK-002", lat: 19.076,  lng: 72.8777, status: "at-risk",  destination: "Mumbai Port, JNPT" },
  { id: "TRK-003", lat: 12.9716, lng: 77.5946, status: "delayed",  destination: "Bengaluru Hub, ORR" },
  { id: "TRK-004", lat: 22.5726, lng: 88.3639, status: "on-time",  destination: "Kolkata ICD, NH-12" },
  { id: "TRK-005", lat: 17.385,  lng: 78.4867, status: "delayed",  destination: "Hyderabad FC, ORR W" },
  { id: "TRK-006", lat: 26.9124, lng: 75.7873, status: "on-time",  destination: "Jaipur DC, NH-48" },
  { id: "TRK-007", lat: 23.0225, lng: 72.5714, status: "at-risk",  destination: "Ahmedabad CEZ, NH-8" },
  { id: "TRK-008", lat: 13.0827, lng: 80.2707, status: "on-time",  destination: "Chennai Port, Ennore" },
];

const MOCK_ALERTS = [
  {
    id: "ALT-001",
    severity: "critical",
    icon: "🌧️",
    title: "Heavy rain on NH-48",
    detail: "Gemini predicts 94mm rainfall · ETA impact +2.4h · 2 trucks affected",
    time: "2 min ago",
    trucks: ["TRK-002", "TRK-007"],
  },
  {
    id: "ALT-002",
    severity: "warning",
    icon: "🚧",
    title: "Road closure: NH-44 km 186",
    detail: "Accident reported · OR-Tools rerouting TRK-001 via SH-57",
    time: "11 min ago",
    trucks: ["TRK-001"],
  },
  {
    id: "ALT-003",
    severity: "warning",
    icon: "🌫️",
    title: "Dense fog advisory — Kolkata region",
    detail: "Visibility < 50m until 08:00 IST · Low-speed protocol active",
    time: "34 min ago",
    trucks: ["TRK-004"],
  },
  {
    id: "ALT-004",
    severity: "info",
    icon: "⛽",
    title: "Fuel stop recommended: TRK-005",
    detail: "Tank at 18% · Nearest approved station 14 km ahead",
    time: "52 min ago",
    trucks: ["TRK-005"],
  },
  {
    id: "ALT-005",
    severity: "info",
    icon: "✅",
    title: "TRK-008 arrived at Chennai Port",
    detail: "Delivered on schedule · Dwell time estimate: 45 min",
    time: "1 hr ago",
    trucks: ["TRK-008"],
  },
];

const KPI_CARDS = [
  {
    label: "Active Shipments",
    value: "8",
    sub: "↑ 2 since last hour",
    trend: "up",
    icon: Package,
    accent: "blue",
  },
  {
    label: "Disruptions Detected",
    value: "4",
    sub: "2 critical · 2 warnings",
    trend: "down",
    icon: ShieldAlert,
    accent: "amber",
  },
  {
    label: "Est. CO₂ Saved",
    value: "1.84 t",
    sub: "Via AI rerouting today",
    trend: "neutral",
    icon: Leaf,
    accent: "emerald",
  },
];

const ACCENT = {
  blue:    { bg: "bg-[#0ea5e9]/10", border: "border-[#0ea5e9]/20", icon: "text-[#38bdf8]", val: "text-[#38bdf8]" },
  amber:   { bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: "text-amber-400",  val: "text-amber-400"  },
  emerald: { bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: "text-emerald-400",val: "text-emerald-400"},
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
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [alertFilter, setAlertFilter] = useState("all");
  const [lastRefresh] = useState(() =>
    new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );

  const filteredAlerts =
    alertFilter === "all"
      ? MOCK_ALERTS
      : MOCK_ALERTS.filter((a) => a.severity === alertFilter);

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
            <button className="flex items-center gap-1.5 text-[#4a6580] hover:text-white text-[11px] border border-[#1e2a3a] rounded-md px-2.5 py-1.5 hover:border-[#2a3a4d] transition-colors">
              <RefreshCw size={12} />
              Refresh
            </button>
            <button className="relative text-[#4a6580] hover:text-white p-1.5 rounded-md hover:bg-[#111825] transition-colors">
              <Bell size={16} />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-[#0b0f1a]" />
            </button>
          </div>
        </header>

        {/* ── KPI row ── */}
        <section className="grid grid-cols-3 gap-3 px-5 pt-4 pb-3 shrink-0">
          {KPI_CARDS.map(({ label, value, sub, trend, icon: Icon, accent }) => {
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
                trucks={MOCK_TRUCKS}
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
                <span className="text-[#2a3a4d] text-[9px] font-mono">{MOCK_TRUCKS.length} vehicles</span>
              </div>
              <div className="max-h-[168px] overflow-y-auto divide-y divide-[#111825]">
                {MOCK_TRUCKS.map((truck) => {
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
      </main>
    </div>
  );
}
