import { useState } from "react";
import {
  CloudRain,
  Users,
  Car,
  Flame,
  Construction,
  Zap,
  Play,
  RotateCcw,
  MapPin,
  ChevronDown,
  Info,
} from "lucide-react";

const DISRUPTION_TYPES = [
  {
    value: "flood",
    label: "Flood",
    icon: CloudRain,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    desc: "Water-logged roads, bridge closures",
    severity: "High",
    sevColor: "text-red-400",
  },
  {
    value: "protest",
    label: "Protest / Blockade",
    icon: Users,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    desc: "Road occupation, diversions required",
    severity: "Medium",
    sevColor: "text-amber-400",
  },
  {
    value: "accident",
    label: "Road Accident",
    icon: Car,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    desc: "Multi-vehicle collision, lane closures",
    severity: "High",
    sevColor: "text-red-400",
  },
  {
    value: "fire",
    label: "Fire / Hazmat",
    icon: Flame,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    desc: "Emergency perimeter, hazardous material",
    severity: "Critical",
    sevColor: "text-red-400 font-bold",
  },
  {
    value: "construction",
    label: "Construction",
    icon: Construction,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    desc: "Road works, temporary closures",
    severity: "Low",
    sevColor: "text-green-400",
  },
  {
    value: "power_outage",
    label: "Power Outage",
    icon: Zap,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    desc: "Traffic signal failure, tunnel closures",
    severity: "Medium",
    sevColor: "text-amber-400",
  },
];

export default function SimulationControls({
  disruptionType,
  onDisruptionTypeChange,
  blockadeCoords,
  onClearBlockade,
  onRunSimulation,
  isRunning,
  hasResult,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selected = DISRUPTION_TYPES.find((d) => d.value === disruptionType) ?? DISRUPTION_TYPES[0];
  const SelectedIcon = selected.icon;
  const canRun = blockadeCoords && disruptionType;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-700/60">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
          <Zap size={14} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-white text-sm font-bold tracking-tight">Simulation Controls</h2>
          <p className="text-slate-500 text-[10px]">Digital Twin Engine · OR-Tools</p>
        </div>
      </div>

      {/* Step 1 — Place disruption */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">1</span>
          <p className="text-slate-300 text-xs font-semibold">Place Disruption on Map</p>
        </div>

        <div
          className={`rounded-xl border px-3 py-3 flex items-center gap-3 transition-all duration-200 ${
            blockadeCoords
              ? "border-red-500/40 bg-red-500/8"
              : "border-slate-700 bg-slate-800/50 border-dashed"
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
            blockadeCoords ? "bg-red-500/15 border border-red-500/30" : "bg-slate-700/50"
          }`}>
            <MapPin size={15} className={blockadeCoords ? "text-red-400" : "text-slate-500"} />
          </div>
          <div className="flex-1 min-w-0">
            {blockadeCoords ? (
              <>
                <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider">Disruption Placed</p>
                <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                  {blockadeCoords.lat.toFixed(4)}°N, {blockadeCoords.lng.toFixed(4)}°E
                </p>
              </>
            ) : (
              <>
                <p className="text-slate-400 text-xs font-medium">No location selected</p>
                <p className="text-slate-600 text-[10px]">Click on the map to drop a pin</p>
              </>
            )}
          </div>
          {blockadeCoords && (
            <button
              onClick={onClearBlockade}
              className="flex-shrink-0 text-slate-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
              title="Clear pin"
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Step 2 — Select disruption type */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">2</span>
          <p className="text-slate-300 text-xs font-semibold">Disruption Type</p>
        </div>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-150
              ${dropdownOpen ? "border-indigo-500/50 bg-slate-800" : "border-slate-700 bg-slate-800/50 hover:border-slate-600"}`}
          >
            <div className={`w-8 h-8 rounded-lg ${selected.bg} border ${selected.border} flex items-center justify-center flex-shrink-0`}>
              <SelectedIcon size={15} className={selected.color} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-white text-xs font-semibold">{selected.label}</p>
              <p className="text-slate-500 text-[10px] truncate">{selected.desc}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[9px] font-bold uppercase tracking-wide ${selected.sevColor}`}>
                {selected.severity}
              </span>
              <ChevronDown size={13} className={`text-slate-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </div>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
              {DISRUPTION_TYPES.map((d) => {
                const Icon = d.icon;
                return (
                  <button
                    key={d.value}
                    onClick={() => {
                      onDisruptionTypeChange(d.value);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-700/50 transition-colors
                      ${disruptionType === d.value ? "bg-slate-700/30" : ""}`}
                  >
                    <div className={`w-7 h-7 rounded-lg ${d.bg} border ${d.border} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={13} className={d.color} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-slate-200 text-xs font-medium">{d.label}</p>
                      <p className="text-slate-500 text-[9px] truncate">{d.desc}</p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase ${d.sevColor}`}>{d.severity}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Step 3 — Fleet selection (static for now) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">3</span>
          <p className="text-slate-300 text-xs font-semibold">Affected Route</p>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {["NH-48 Corridor", "NH-44 Delhi", "NH-8 Rajasthan", "Coastal SH-66"].map((route, i) => (
            <button
              key={route}
              className={`px-2.5 py-2 rounded-lg border text-[10px] font-medium transition-colors text-left
                ${i === 0
                  ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
                  : "border-slate-700 bg-slate-800/30 text-slate-500 hover:border-slate-600 hover:text-slate-400"
                }`}
            >
              {route}
            </button>
          ))}
        </div>
      </div>

      {/* Info box */}
      <div className="flex gap-2 bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
        <Info size={13} className="text-indigo-400 flex-shrink-0 mt-0.5" />
        <p className="text-slate-500 text-[10px] leading-relaxed">
          The Digital Twin will compute an alternate path using{" "}
          <span className="text-indigo-400 font-semibold">Google OR-Tools</span> and validate it with{" "}
          <span className="text-indigo-400 font-semibold">Gemini 1.5 Pro</span> for contextual reasoning.
        </p>
      </div>

      {/* Run button */}
      <button
        onClick={onRunSimulation}
        disabled={!canRun || isRunning}
        className={`
          relative w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5
          transition-all duration-200 overflow-hidden
          ${canRun && !isRunning
            ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50 hover:shadow-indigo-800/60 hover:-translate-y-0.5 active:translate-y-0"
            : "bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed"
          }
        `}
      >
        {isRunning ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span>Computing Routes…</span>
          </>
        ) : (
          <>
            <Play size={16} strokeWidth={2.5} />
            <span>Run Simulation</span>
          </>
        )}
        {/* shimmer on hover */}
        {canRun && !isRunning && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
        )}
      </button>

      {!canRun && !isRunning && (
        <p className="text-center text-slate-600 text-[10px]">
          {!blockadeCoords ? "Place a disruption pin first" : "Select a disruption type"}
        </p>
      )}
    </div>
  );
}
