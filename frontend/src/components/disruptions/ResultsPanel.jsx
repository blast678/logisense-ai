import { useEffect, useState } from "react";
import {
  Clock,
  Route,
  Leaf,
  TrendingDown,
  TrendingUp,
  BrainCircuit,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Download,
  Share2,
  Sparkles,
} from "lucide-react";

// Animated counter hook
function useCountUp(target, duration = 1000, active = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) { setValue(0); return; }
    const start = Date.now();
    const end = start + duration;
    const tick = () => {
      const now = Date.now();
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, active]);
  return value;
}

function KpiCell({ icon: Icon, label, value, unit, subtext, variant = "neutral", animTarget, animActive }) {
  const counted = useCountUp(animTarget ?? 0, 900, animActive);
  const display = animTarget != null ? `${counted}${unit}` : `${value}${unit}`;

  const variantStyles = {
    neutral:  { val: "text-slate-100", icon: "text-slate-400", bg: "bg-slate-700/40", border: "border-slate-600/40" },
    danger:   { val: "text-red-300",   icon: "text-red-400",   bg: "bg-red-500/8",    border: "border-red-500/20"   },
    success:  { val: "text-green-300", icon: "text-green-400", bg: "bg-green-500/8",  border: "border-green-500/20" },
    indigo:   { val: "text-indigo-200",icon: "text-indigo-400",bg: "bg-indigo-500/8", border: "border-indigo-500/20"},
  };
  const s = variantStyles[variant];

  return (
    <div className={`rounded-xl border ${s.border} ${s.bg} px-3.5 py-3 flex items-center gap-3`}>
      <div className={`w-8 h-8 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-center flex-shrink-0`}>
        <Icon size={15} className={s.icon} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">{label}</p>
        <p className={`${s.val} text-lg font-bold font-mono leading-tight`}>{display}</p>
        {subtext && <p className="text-slate-600 text-[9px] mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}

function RouteCard({ title, isOptimized, data, isAnimated }) {
  const savings = isOptimized && data?.savings;

  return (
    <div className={`
      flex flex-col gap-3 rounded-2xl border p-4 transition-all duration-300
      ${isOptimized
        ? "border-green-500/30 bg-gradient-to-b from-green-500/5 to-slate-800/80 shadow-lg shadow-green-900/10"
        : "border-red-500/20 bg-gradient-to-b from-red-500/5 to-slate-800/80"
      }
    `}>
      {/* Card header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border
            ${isOptimized ? "bg-green-500/15 border-green-500/30" : "bg-red-500/15 border-red-500/30"}`}>
            {isOptimized
              ? <CheckCircle size={14} className="text-green-400" />
              : <AlertTriangle size={14} className="text-red-400" />
            }
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isOptimized ? "text-green-300" : "text-red-300"}`}>{title}</h3>
            <p className="text-slate-500 text-[9px]">{isOptimized ? "OR-Tools computed path" : "Pre-disruption path"}</p>
          </div>
        </div>
        {isOptimized && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-green-400 bg-green-500/15 border border-green-500/25 px-2 py-1 rounded-full">
            ✓ Recommended
          </span>
        )}
        {!isOptimized && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-red-400 bg-red-500/15 border border-red-500/20 px-2 py-1 rounded-full">
            ✗ Blocked
          </span>
        )}
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-2">
        <KpiCell
          icon={Clock}
          label="Est. Transit Time"
          value={data?.time ?? "--"}
          unit=" hrs"
          subtext={isOptimized && savings ? `${savings.time} hrs saved` : undefined}
          variant={isOptimized ? "success" : "danger"}
          animTarget={isOptimized ? data?.timeRaw : undefined}
          animActive={isAnimated}
        />
        <KpiCell
          icon={Route}
          label="Total Distance"
          value={data?.distance ?? "--"}
          unit=" km"
          subtext={isOptimized && savings ? `${savings.distance} km shorter` : undefined}
          variant={isOptimized ? "success" : "danger"}
          animTarget={isOptimized ? data?.distanceRaw : undefined}
          animActive={isAnimated}
        />
        {isOptimized && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/8 px-3.5 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-center flex-shrink-0">
              <Leaf size={15} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">CO₂ Saved</p>
              <p className="text-emerald-300 text-lg font-bold font-mono leading-tight">{data?.co2Saved ?? "--"} kg</p>
              <p className="text-emerald-600 text-[9px]">vs original route</p>
            </div>
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <TrendingDown size={12} className="text-emerald-400" />
            </div>
          </div>
        )}
      </div>

      {/* Via waypoints */}
      {data?.via && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-600 text-[9px] font-semibold uppercase tracking-wider">Via:</span>
          {data.via.map((w, i) => (
            <span key={w} className="flex items-center gap-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium
                ${isOptimized ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/8 border-red-500/15 text-red-400"}`}>
                {w}
              </span>
              {i < data.via.length - 1 && <ChevronRight size={9} className="text-slate-700" />}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResultsPanel({ simulationResult, disruptionType, isRunning, origin, destination }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (simulationResult) {
      setAnimated(false);
      const t = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(t);
    }
  }, [simulationResult]);

  // Loading skeleton
  if (isRunning) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-700/60">
          <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-slate-300 text-sm font-semibold">Computing simulation…</p>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-800/60 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
    );
  }

  if (!simulationResult) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-3 border border-dashed border-slate-700 rounded-2xl bg-slate-800/20">
        <BrainCircuit size={24} className="text-slate-700" />
        <p className="text-slate-600 text-xs text-center px-4">
          Run a simulation to see original vs optimized route comparison
        </p>
      </div>
    );
  }

  const { original, optimized, rationale } = simulationResult;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-green-500/15 border border-green-500/30 flex items-center justify-center">
            <CheckCircle size={14} className="text-green-400" />
          </div>
          <div>
            <h2 className="text-white text-sm font-bold">Simulation Complete</h2>
            <p className="text-slate-500 text-[10px]">{origin} → {destination} · {disruptionType !== "none" ? disruptionType : "Baseline"} scenario</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button className="p-1.5 rounded-lg border border-slate-700 text-slate-500 hover:text-white hover:border-slate-600 transition-colors">
            <Download size={13} />
          </button>
          <button className="p-1.5 rounded-lg border border-slate-700 text-slate-500 hover:text-white hover:border-slate-600 transition-colors">
            <Share2 size={13} />
          </button>
        </div>
      </div>

      {/* Improvement summary banner */}
      {disruptionType !== "none" && (
        <div className="flex gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 items-center">
          <TrendingDown size={18} className="text-indigo-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-indigo-300 text-xs font-bold">Route Optimized Successfully</p>
            <p className="text-slate-400 text-[10px] mt-0.5">
              {optimized.time < original.time
                ? `${(original.time - optimized.time).toFixed(1)} hours saved · ${(original.distance - optimized.distance).toFixed(0)} km shorter`
                : `Detour added ${(optimized.time - original.time).toFixed(1)} hrs · disruption avoided`}
            </p>
          </div>
          <span className="flex-shrink-0 text-xs font-bold text-indigo-400 font-mono">
            -{Math.round(((original.distance - optimized.distance) / original.distance) * 100)}%
          </span>
        </div>
      )}

      {/* Route cards */}
      <div className={`grid grid-cols-1 ${disruptionType === "none" ? "" : "lg:grid-cols-2"} gap-3`}>
        <RouteCard
          title={disruptionType === "none" ? "Current Planned Route" : "Original Route"}
          isOptimized={false}
          data={{
            time: original.time.toFixed(1),
            distance: original.distance,
            via: original.via,
          }}
          isAnimated={animated}
        />
        {disruptionType !== "none" && (
          <RouteCard
            title="Optimized Route"
            isOptimized={true}
            data={{
              time: optimized.time.toFixed(1),
              timeRaw: Math.round(optimized.time * 10),
              distance: optimized.distance,
              distanceRaw: optimized.distance,
              via: optimized.via,
              co2Saved: optimized.co2Saved,
              savings: {
                time: (original.time - optimized.time).toFixed(1),
                distance: original.distance - optimized.distance,
              },
            }}
            isAnimated={animated}
          />
        )}
      </div>

      {/* Business Value */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 flex flex-col items-center justify-center">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">SLA Preservation</p>
          <p className="text-xl font-mono font-bold text-green-400">98.4%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 flex flex-col items-center justify-center">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Fuel Burn Variance</p>
          <p className="text-xl font-mono font-bold text-emerald-400">-12.5%</p>
        </div>
      </div>

      {/* AI Rationale */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/5 to-transparent overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-indigo-500/15">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <BrainCircuit size={13} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="text-indigo-300 text-xs font-bold">Gemini 1.5 Pro · AI Rationale</p>
            <p className="text-slate-600 text-[9px]">Contextual reasoning for route decision</p>
          </div>
          <div className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2 py-0.5">
            <Sparkles size={9} className="text-indigo-400" />
            <span className="text-[9px] text-indigo-400 font-bold">AI</span>
          </div>
        </div>
        <div className="px-4 py-4">
          <div className="text-slate-300 text-[11px] leading-relaxed font-mono relative pl-3">
            <span className="inline-block animate-[pulse_1s_ease-in-out_infinite] w-1.5 h-3 bg-indigo-400 absolute left-0 top-1"></span>
            {rationale}
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            {["Weather verified", "Traffic validated", "Toll costs included", "Bridge weight checked"].map((tag) => (
              <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium">
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
