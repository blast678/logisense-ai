"use client";

import Sidebar from "../../components/layout/Sidebar";
import { Settings, Check, ChevronDown } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-[#080c13] text-white font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-6 flex flex-col overflow-y-auto">
        <header className="mb-8 border-b border-[#1e2a3a] pb-4 flex items-center gap-3">
          <div className="p-2 bg-slate-500/20 rounded-lg border border-slate-500/50">
            <Settings className="text-slate-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Engine Configuration</h1>
            <p className="text-[#4a6580] text-sm mt-0.5">Control panel for LogiSense AI core modules.</p>
          </div>
        </header>

        <div className="max-w-4xl space-y-8 pb-10">
          
          <section className="bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl overflow-hidden shadow-lg shadow-black/50">
            <div className="px-5 py-4 border-b border-[#1e2a3a] bg-[#111825]">
              <h2 className="text-[#94a3b8] text-sm font-bold uppercase tracking-widest">Machine Learning Models</h2>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Enable ST-GCN Message Passing</h3>
                </div>
                <div className="w-11 h-6 bg-emerald-500 rounded-full relative cursor-pointer flex items-center shrink-0">
                  <div className="absolute left-[22px] w-5 h-5 bg-white rounded-full transition-all shadow-sm"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Use Gemini 1.5 Pro Context Layer</h3>
                </div>
                <div className="w-11 h-6 bg-emerald-500 rounded-full relative cursor-pointer flex items-center shrink-0">
                  <div className="absolute left-[22px] w-5 h-5 bg-white rounded-full transition-all shadow-sm"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Dynamic Bounding Box Math</h3>
                </div>
                <div className="w-11 h-6 bg-emerald-500 rounded-full relative cursor-pointer flex items-center shrink-0">
                  <div className="absolute left-[22px] w-5 h-5 bg-white rounded-full transition-all shadow-sm"></div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl overflow-hidden shadow-lg shadow-black/50">
            <div className="px-5 py-4 border-b border-[#1e2a3a] bg-[#111825]">
              <h2 className="text-[#94a3b8] text-sm font-bold uppercase tracking-widest">Data Ingestion APIs</h2>
            </div>
            <div className="p-5 space-y-4">
              {['Mapbox', 'TomTom', 'Open-Meteo', 'GDACS', 'AISstream'].map(api => (
                <div key={api} className="flex items-center gap-4">
                  <label className="text-[#94a3b8] text-sm font-semibold w-32 shrink-0">{api}</label>
                  <div className="flex-1 relative">
                    <input type="password" value="••••••••••••••••" readOnly className="w-full bg-[#111825] border border-[#1e2a3a] rounded-lg px-3 py-2 text-[#4a6580] font-mono text-sm focus:outline-none" />
                    <Check size={16} className="absolute right-3 top-2.5 text-emerald-400" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl overflow-hidden shadow-lg shadow-black/50">
            <div className="px-5 py-4 border-b border-[#1e2a3a] bg-[#111825]">
              <h2 className="text-[#94a3b8] text-sm font-bold uppercase tracking-widest">Autonomous Dispatch</h2>
            </div>
            <div className="p-5 space-y-6">
              <div>
                <div className="relative max-w-sm">
                  <select className="w-full bg-[#111825] border border-[#1e2a3a] rounded-lg px-4 py-2.5 text-[#e2e8f0] appearance-none focus:outline-none focus:border-[#4a6580]">
                    <option>WhatsApp Business API</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3 text-[#4a6580] pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#1e2a3a] pt-5">
                <div>
                  <h3 className="text-white font-semibold">Require Human Approval</h3>
                </div>
                <div className="w-11 h-6 bg-[#1e2a3a] rounded-full relative cursor-pointer flex items-center shrink-0">
                  <div className="absolute left-1 w-5 h-5 bg-[#4a6580] rounded-full transition-all shadow-sm"></div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
