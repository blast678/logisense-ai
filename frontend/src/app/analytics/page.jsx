"use client";

import Sidebar from "../../components/layout/Sidebar";
import { BarChart3, Leaf, Zap, BrainCircuit } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex h-screen bg-[#080c13] text-white font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-6 flex flex-col overflow-y-auto">
        <header className="mb-6 border-b border-[#1e2a3a] pb-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/50">
            <BarChart3 className="text-emerald-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sustainability Impact & ROI Dashboard</h1>
            <p className="text-[#4a6580] text-sm mt-0.5">Aligning with UN Sustainable Development Goal 13</p>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-[#0b0f1a] border border-[#1e2a3a] p-6 rounded-xl shadow-lg shadow-black/50 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-2 mb-3">
              <Leaf size={18} className="text-emerald-400 animate-pulse" />
              <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-widest">Net Carbon Offset</h3>
            </div>
            <div className="text-4xl font-mono font-bold text-emerald-400">42.5 Tons CO₂e</div>
          </div>
          
          <div className="bg-[#0b0f1a] border border-[#1e2a3a] p-6 rounded-xl shadow-lg shadow-black/50 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={18} className="text-blue-400" />
              <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-widest">Fuel Efficiency Delta</h3>
            </div>
            <div className="text-4xl font-mono font-bold text-blue-400">+18.4% <span className="text-sm text-[#4a6580]">across fleet</span></div>
          </div>
          
          <div className="bg-[#0b0f1a] border border-[#1e2a3a] p-6 rounded-xl shadow-lg shadow-black/50 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit size={18} className="text-indigo-400" />
              <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-widest">Bottleneck Prediction Accuracy</h3>
            </div>
            <div className="text-4xl font-mono font-bold text-white">94.2%</div>
          </div>
        </div>

        <div className="bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl p-8 shadow-lg shadow-black/50 flex-1 min-h-[300px]">
          <h3 className="text-[#94a3b8] text-sm font-bold uppercase tracking-widest mb-8">Cumulative Carbon Savings Trajectory</h3>
          
          <div className="h-64 flex items-end justify-between gap-4">
            {[12, 18, 25, 30, 42.5].map((val, i) => (
              <div key={i} className="flex flex-col items-center flex-1 group">
                <div className="text-emerald-400 font-mono text-xs font-bold mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {val}T
                </div>
                <div 
                  className="w-full bg-gradient-to-t from-emerald-900/40 to-emerald-500/80 rounded-t-lg border-t border-emerald-400/50 transition-all duration-1000 ease-out" 
                  style={{ height: `${(val / 42.5) * 100}%` }}
                ></div>
                <div className="text-[#4a6580] text-xs font-mono mt-3">
                  {['Q4 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
