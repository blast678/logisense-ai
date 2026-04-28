"use client";

import React, { useState, useEffect } from 'react';
import { Network, Terminal, Activity, BrainCircuit } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Sidebar from "../../components/layout/Sidebar";

const chartData = [
  { day: 'Day 1', score: 20 },
  { day: 'Day 2', score: 25 },
  { day: 'Day 3', score: 22 },
  { day: 'Day 4', score: 30 },
  { day: 'Day 5', score: 45 },
  { day: 'Day 6', score: 65 },
  { day: 'Day 7', score: 85 },
  { day: 'Day 8', score: 98 },
  { day: 'Day 9', score: 80 },
  { day: 'Day 10', score: 60 },
  { day: 'Day 11', score: 40 },
  { day: 'Day 12', score: 35 },
  { day: 'Day 13', score: 30 },
  { day: 'Day 14', score: 25 }
];

const logLines = [
  "[21:45:01] INGEST: Pulling AIS telemetry for 12,400 active vessels...",
  "[21:45:02] INGEST: Scraping TOS data from Node 0 (Singapore)...",
  "[21:45:03] ANOMALY DETECTED: 300% departure surge at Node 0.",
  "[21:45:04] ST-GCN: Computing Adjacency Matrix (A) x Feature Matrix (X)...",
  "[21:45:05] MESSAGE PASSING: Surge propagating through Edge 0->1 and 1->2...",
  "[21:45:06] CRITICAL: Downstream bottleneck predicted at Node 2 (JNPT) on May 6, 2026.",
  "[21:45:07] EXECUTION: Dispatching v_opt reduction (-2.4 knots) to SHP-991."
];

export default function PredictionsDashboard() {
  const [logs, setLogs] = useState([]);
  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-IN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLiveTime(`Tuesday, April 28, 2026 - ${timeString} IST`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logLines.length) {
        setLogs((prev) => [...prev, logLines[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-[#080c13] text-white overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col p-6 overflow-y-auto">
        {/* Header & Context */}
        <header className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e2a3a]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/50">
              <BrainCircuit className="text-indigo-400 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Global Graph Neural Network (ST-GCN)</h1>
              <p className="text-[#4a6580] text-sm">Spatio-Temporal Message Passing · Live Inference</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono text-[#94a3b8] mb-1">Location Context: Mumbai, Maharashtra</div>
            <div className="text-emerald-400 font-mono font-bold tracking-tight bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block">
              {liveTime || "Loading..."}
            </div>
          </div>
        </header>

        {/* Action Triggered Hero Banner */}
        <div className="mb-6 relative overflow-hidden bg-red-900/20 border border-red-500/40 rounded-xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
          <div className="relative z-10 flex items-center gap-4">
            <span className="text-2xl animate-bounce">🚨</span>
            <span className="text-red-400 font-bold tracking-wide text-[15px]">
              PREDICTIVE INTERVENTION: <span className="text-white font-normal">JNPT Port Capacity Exhaustion detected in 8 Days. Autonomous Slow-Steaming Protocol executed for SHP-991.</span>
            </span>
          </div>
          <div className="relative z-10 bg-emerald-500/10 border border-emerald-500/30 rounded px-4 py-2 text-right">
            <div className="text-emerald-400 font-bold text-[13px] uppercase tracking-wide">
              Estimated Fuel Saved: 42.5 Tons <span className="text-emerald-500/50 mx-2">|</span> Capital Saved: $31,500
            </div>
          </div>
        </div>

        {/* Panels Grid */}
        <div className="grid grid-cols-3 gap-6 flex-1 min-h-[500px]">
          {/* Left Column (Panel 1 & Panel 2) */}
          <div className="col-span-1 flex flex-col gap-6">
            
            {/* Panel 1: Global Port Adjacency Graph */}
            <div className="bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl flex-1 flex flex-col overflow-hidden shadow-lg shadow-black/50">
              <div className="px-4 py-3 border-b border-[#1e2a3a] flex items-center gap-2 bg-[#111825]">
                <Network className="text-indigo-400 w-4 h-4" />
                <h2 className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest">Global Port Adjacency Graph</h2>
              </div>
              <div className="flex-1 p-8 flex flex-col justify-center relative pl-10">
                {/* Node 0 */}
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse">
                    <span className="text-xs font-bold text-red-400">N0</span>
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-white">Singapore</div>
                    <div className="text-[11px] text-red-400 font-mono uppercase mt-0.5 font-semibold">Origin Surge</div>
                  </div>
                </div>

                {/* Edge 0->1 */}
                <div className="flex items-center relative z-0 -mt-2 -mb-2">
                  <div className="w-0.5 h-16 bg-gradient-to-b from-red-500 to-amber-500 ml-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/30 animate-[slide_1.5s_ease-in-out_infinite]" style={{ animationName: 'slideDown' }}></div>
                  </div>
                </div>

                {/* Node 1 */}
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-amber-400">N1</span>
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-white">Colombo</div>
                    <div className="text-[11px] text-[#4a6580] font-mono uppercase mt-0.5 font-semibold">Transit Node</div>
                  </div>
                </div>

                {/* Edge 1->2 */}
                <div className="flex items-center relative z-0 -mt-2 -mb-2">
                  <div className="w-0.5 h-16 bg-gradient-to-b from-amber-500 to-orange-500 ml-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/30 animate-[slide_1.5s_ease-in-out_infinite]" style={{ animationName: 'slideDown', animationDelay: '0.5s' }}></div>
                  </div>
                </div>

                {/* Node 2 */}
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                    <span className="text-xs font-bold text-orange-400">N2</span>
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-white">JNPT Mumbai</div>
                    <div className="text-[11px] text-orange-400 font-mono uppercase mt-0.5 font-semibold">Downstream Bottleneck</div>
                  </div>
                </div>

                <style jsx>{`
                  @keyframes slideDown {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                  }
                `}</style>
              </div>
            </div>

            {/* Panel 2: Live Inference Terminal */}
            <div className="bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl flex-1 flex flex-col overflow-hidden max-h-72 shadow-lg shadow-black/50">
              <div className="px-4 py-3 border-b border-[#1e2a3a] flex items-center gap-2 bg-[#111825]">
                <Terminal className="text-emerald-400 w-4 h-4" />
                <h2 className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest">Live Inference Feed</h2>
              </div>
              <div className="flex-1 bg-black p-5 font-mono text-[11px] text-green-400 overflow-y-auto leading-loose shadow-inner">
                {logs.map((log, index) => (
                  <div key={index} className={`mb-1 opacity-90 hover:opacity-100 transition-opacity ${
                    log.includes('CRITICAL') || log.includes('ANOMALY') 
                      ? 'text-red-400 font-bold' 
                      : log.includes('MESSAGE PASSING') 
                        ? 'text-amber-400' 
                        : log.includes('EXECUTION')
                          ? 'text-emerald-400 font-bold'
                          : ''
                  }`}>
                    {log}
                  </div>
                ))}
                {logs.length < logLines.length && (
                  <div className="animate-pulse font-bold mt-1 inline-block">_</div>
                )}
              </div>
            </div>
            
          </div>

          {/* Right Column (Panel 3) */}
          <div className="col-span-2 bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl flex flex-col overflow-hidden shadow-lg shadow-black/50">
            <div className="px-4 py-3 border-b border-[#1e2a3a] flex items-center gap-2 bg-[#111825]">
              <Activity className="text-indigo-400 w-4 h-4" />
              <h2 className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest">Prediction Confidence Metrics</h2>
            </div>
            <div className="flex-1 p-8 flex flex-col">
              <h3 className="text-center text-[#94a3b8] text-sm font-semibold mb-8 border border-[#1e2a3a] rounded-lg py-3 bg-[#111825] shadow-inner">
                JNPT Predicted Congestion Score (14-Day Horizon)
              </h3>
              <div className="flex-1 min-h-0 w-full pl-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 30, right: 30, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      stroke="#4a6580" 
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} 
                      tickMargin={12}
                      axisLine={{ stroke: '#1e2a3a' }}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#4a6580" 
                      tick={{ fill: '#4a6580', fontSize: 11 }} 
                      domain={[0, 100]} 
                      tickFormatter={(val) => `${val}%`} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0b0f1a', borderColor: '#1e2a3a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} 
                      itemStyle={{ color: '#818cf8', fontWeight: 'bold' }} 
                      cursor={{ stroke: '#1e2a3a', strokeWidth: 2 }}
                    />
                    <ReferenceLine 
                      x="Day 8" 
                      stroke="#ef4444" 
                      strokeDasharray="4 4" 
                      strokeWidth={2}
                      label={{ position: 'top', value: 'Predicted Chokepoint', fill: '#ef4444', fontSize: 12, fontWeight: 'bold', offset: 15 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#818cf8" 
                      strokeWidth={3.5} 
                      dot={{ fill: '#0b0f1a', stroke: '#818cf8', strokeWidth: 2.5, r: 4.5 }} 
                      activeDot={{ r: 7, fill: '#818cf8', stroke: '#fff', strokeWidth: 2 }} 
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
