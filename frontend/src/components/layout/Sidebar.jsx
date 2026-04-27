"use client";

import {
  LayoutDashboard,
  Truck,
  BrainCircuit,
  BarChart3,
  Settings,
  Bell,
  ShieldAlert,
  LogOut,
  Zap,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "The Pulse", href: "#", active: true },
  { icon: Truck, label: "Fleet View", href: "#" },
  { icon: BrainCircuit, label: "AI Predictions", href: "#", badge: "NEW" },
  { icon: ShieldAlert, label: "Disruptions", href: "/disruptions", badge: 4 },
  { icon: BarChart3, label: "Analytics", href: "#" },
  { icon: Bell, label: "Alerts", href: "#", badge: 7 },
  { icon: Settings, label: "Settings", href: "#" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        flex flex-col bg-[#0b0f1a] border-r border-[#1e2a3a]
        transition-all duration-300 ease-in-out relative z-20
        ${collapsed ? "w-[68px]" : "w-[220px]"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1e2a3a] min-h-[64px]">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] flex items-center justify-center shadow-lg shadow-blue-900/40">
          <Zap size={16} className="text-white" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm tracking-wide leading-none font-mono">
              LogiSense
            </p>
            <p className="text-[#0ea5e9] text-[10px] font-semibold tracking-[0.15em] mt-0.5 uppercase">
              AI
            </p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[76px] w-6 h-6 rounded-full bg-[#1e2a3a] border border-[#2a3a4d] flex items-center justify-center text-[#4a6580] hover:text-white hover:bg-[#2a3a4d] transition-colors z-30"
        aria-label="Toggle sidebar"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="currentColor"
          className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
        >
          <path d="M6.5 1L3 5l3.5 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-hidden">
        {!collapsed && (
          <p className="text-[#2a3a4d] text-[9px] font-bold tracking-[0.2em] uppercase px-3 pb-2 pt-1">
            Navigation
          </p>
        )}
        {NAV_ITEMS.map(({ icon: Icon, label, href, active, badge }) => (
          <a
            key={label}
            href={href}
            className={`
              group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
              ${
                active
                  ? "bg-[#0ea5e9]/10 text-[#38bdf8] border border-[#0ea5e9]/20"
                  : "text-[#4a6580] hover:bg-[#111825] hover:text-[#94a3b8]"
              }
            `}
          >
            <Icon
              size={17}
              className={`flex-shrink-0 ${active ? "text-[#38bdf8]" : "text-[#2a3a4d] group-hover:text-[#4a6580]"}`}
              strokeWidth={active ? 2.5 : 2}
            />
            {!collapsed && (
              <>
                <span className="truncate flex-1">{label}</span>
                {badge !== undefined && (
                  <span
                    className={`
                      text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto leading-none
                      ${typeof badge === "number"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/30"
                      }
                    `}
                  >
                    {badge}
                  </span>
                )}
              </>
            )}
          </a>
        ))}
      </nav>

      {/* User */}
      <div className={`border-t border-[#1e2a3a] p-3 ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-xs font-bold text-white">
            A
          </div>
        ) : (
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              A
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-[#94a3b8] text-xs font-semibold truncate">Admin User</p>
              <p className="text-[#2a3a4d] text-[10px] truncate">Fleet Manager</p>
            </div>
            <LogOut size={14} className="text-[#2a3a4d] group-hover:text-[#4a6580] transition-colors" />
          </div>
        )}
      </div>
    </aside>
  );
}
