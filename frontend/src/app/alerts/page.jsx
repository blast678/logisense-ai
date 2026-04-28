"use client";

import Sidebar from "../../components/layout/Sidebar";
import { Bell } from "lucide-react";

const timeline = [
  { time: "22:15:02", source: "RECOVERY", message: "TRK-001 re-joined primary corridor after Wada bypass.", color: "bg-blue-500", border: "border-blue-500/30", text: "text-blue-400" },
  { time: "22:15:00", source: "DISPATCH", message: "Autonomous Recommendation sent to Driver Rajesh.", color: "bg-emerald-500", border: "border-emerald-500/30", text: "text-emerald-400" },
  { time: "21:55:00", source: "ANOMALY", message: "TomTom & NewsAPI confirm multi-vehicle collision at Shahapur.", color: "bg-red-500", border: "border-red-500/30", text: "text-red-400" },
  { time: "18:40:00", source: "GNN", message: "Predictive bottleneck at JNPT Mumbai forecasted for May 6.", color: "bg-indigo-500", border: "border-indigo-500/30", text: "text-indigo-400" },
];

export default function AlertsPage() {
  return (
    <div className="flex h-screen bg-[#080c13] text-white font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-6 flex flex-col overflow-y-auto">
        <header className="mb-8 border-b border-[#1e2a3a] pb-4 flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/50">
            <Bell className="text-amber-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Control Tower - Intelligence Feed</h1>
            <p className="text-[#4a6580] text-sm mt-0.5">Chronological trace of multifaceted transit data analysis.</p>
          </div>
        </header>

        <div className="flex-1 max-w-4xl mx-auto w-full">
          <div className="relative border-l-2 border-[#1e2a3a] ml-4 pl-8 space-y-10 py-6">
            {timeline.map((item, i) => (
              <div key={i} className="relative group">
                <span className={`absolute -left-[41px] top-1.5 w-4 h-4 rounded-full ${item.color} shadow-[0_0_15px_currentColor] border-4 border-[#0b0f1a] transition-transform duration-300 group-hover:scale-125`} style={{ color: item.color.replace('bg-', '') }}></span>
                
                <div className={`bg-[#0b0f1a] border ${item.border} rounded-xl p-5 shadow-lg shadow-black/50 hover:bg-[#111825] transition-all duration-300 hover:shadow-[0_0_20px_currentColor] group-hover:-translate-y-1`} style={{ color: item.color.replace('bg-', '').replace('/30', '/10') }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white font-mono text-sm font-bold tracking-widest bg-[#111825] px-2 py-0.5 rounded-md border border-[#1e2a3a]">{item.time}</span>
                    <span className="text-[#1e2a3a]">|</span>
                    <span className={`${item.text} font-bold text-xs uppercase tracking-widest`}>{item.source}</span>
                  </div>
                  <p className="text-[#e2e8f0] text-[15px] leading-relaxed mt-3">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
