"use client";

import Sidebar from "../../components/layout/Sidebar";
import { Truck } from "lucide-react";

const mockFleet = [
  { id: "TRK-001", cargo: "FMCG Goods", mode: "Terrestrial", route: "Mumbai → Nashik", status: "REROUTED (WADA)", statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", eta: "Apr 28, 23:30" },
  { id: "SHP-991", cargo: "Electronics", mode: "Maritime", route: "Colombo → JNPT", status: "SLOW STEAMING", statusColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30", eta: "May 06, 08:00" },
  { id: "IND-S-884", cargo: "Cold Chain Medical", mode: "Terrestrial", route: "Bengaluru → Hyderabad", status: "ON-TIME", statusColor: "text-slate-300 bg-slate-500/10 border-slate-500/30", eta: "Apr 29, 14:15" },
  { id: "IND-N-334", cargo: "Auto Parts", mode: "Terrestrial", route: "Delhi → Jaipur", status: "AT-RISK (TRAFFIC)", statusColor: "text-red-400 bg-red-500/10 border-red-500/30", eta: "Apr 29, 09:00" },
  { id: "AER-X-99", cargo: "High-Value Silicon", mode: "Aviation", route: "Taiwan → Mumbai", status: "ON-TIME", statusColor: "text-slate-300 bg-slate-500/10 border-slate-500/30", eta: "Apr 28, 22:15" }
];

export default function FleetPage() {
  return (
    <div className="flex h-screen bg-[#080c13] text-white font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-6 flex flex-col overflow-hidden">
        <header className="mb-6 border-b border-[#1e2a3a] pb-4 flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/50">
            <Truck className="text-blue-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Active Fleet Registry</h1>
            <p className="text-[#4a6580] text-sm font-mono mt-0.5">Tracking 12,408 concurrent shipments globally.</p>
          </div>
        </header>

        <div className="flex-1 bg-[#0b0f1a] border border-[#1e2a3a] rounded-xl overflow-hidden shadow-lg shadow-black/50 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#111825] border-b border-[#1e2a3a]">
                  <th className="p-4 text-xs font-bold text-[#94a3b8] uppercase tracking-wider">Tracking ID</th>
                  <th className="p-4 text-xs font-bold text-[#94a3b8] uppercase tracking-wider">Cargo Details</th>
                  <th className="p-4 text-xs font-bold text-[#94a3b8] uppercase tracking-wider">Transit Mode</th>
                  <th className="p-4 text-xs font-bold text-[#94a3b8] uppercase tracking-wider">Origin &rarr; Destination</th>
                  <th className="p-4 text-xs font-bold text-[#94a3b8] uppercase tracking-wider">Live Status</th>
                  <th className="p-4 text-xs font-bold text-[#94a3b8] uppercase tracking-wider">ETA (IST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a3a]">
                {mockFleet.map((row) => (
                  <tr key={row.id} className="hover:bg-[#111825]/50 transition-colors">
                    <td className="p-4 font-mono text-sm text-[#e2e8f0] font-semibold">{row.id}</td>
                    <td className="p-4 text-sm text-[#94a3b8]">{row.cargo}</td>
                    <td className="p-4 text-sm text-[#94a3b8]">{row.mode}</td>
                    <td className="p-4 text-sm text-[#94a3b8] font-mono">{row.route}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${row.statusColor}`}>
                        [{row.status}]
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[#4a6580] font-mono">{row.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
