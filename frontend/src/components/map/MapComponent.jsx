"use client";

import { useEffect, useRef, useState } from "react";
import { Navigation, Wifi, WifiOff } from "lucide-react";

/**
 * STATUS CONFIG — maps truck status → color tokens
 * Swap these into real Google Maps Marker icons when the API key is live.
 */
const STATUS_CONFIG = {
  "on-time": {
    color: "bg-emerald-400",
    ring: "ring-emerald-400/30",
    label: "On Time",
    dot: "#34d399",
  },
  delayed: {
    color: "bg-amber-400",
    ring: "ring-amber-400/30",
    label: "Delayed",
    dot: "#fbbf24",
  },
  "at-risk": {
    color: "bg-red-500",
    ring: "ring-red-500/30",
    label: "At Risk",
    dot: "#ef4444",
  },
};

/**
 * useGoogleMap — initializes a Google Map when the API key is available.
 *
 * Usage once you have an API key:
 *   1. Add the Maps JS script to layout.jsx:
 *      <Script src={`https://maps.googleapis.com/maps/api/js?key=${KEY}&libraries=marker`} />
 *   2. This hook will pick it up and initialize the map on the ref container.
 *   3. Call addTruckMarker() for each truck with Advanced Markers (AdvancedMarkerElement).
 */
function useGoogleMap(containerRef, mapOptions) {
  const mapRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    if (typeof window === "undefined") return;
    if (!window.google?.maps) {
      // Maps API not loaded yet — graceful degradation shows the placeholder.
      return;
    }

    const map = new window.google.maps.Map(containerRef.current, {
      zoom: mapOptions?.zoom ?? 6,
      center: mapOptions?.center ?? { lat: 20.5937, lng: 78.9629 }, // India centroid
      mapId: "logisense_fleet_map", // Required for Advanced Markers
      disableDefaultUI: false,
      styles: DARK_MAP_STYLES,
    });

    mapRef.current = map;
    setReady(true);

    return () => {
      mapRef.current = null;
    };
  }, [containerRef]);

  /**
   * addTruckMarker — call this for each truck after `ready === true`.
   * @param {object} truck  — { id, lat, lng, status, destination }
   * @returns AdvancedMarkerElement instance
   */
  function addTruckMarker(truck) {
    if (!mapRef.current || !window.google?.maps?.marker?.AdvancedMarkerElement) return;

    const pinEl = document.createElement("div");
    pinEl.innerHTML = `
      <div style="
        width:14px;height:14px;border-radius:50%;
        background:${STATUS_CONFIG[truck.status]?.dot ?? "#94a3b8"};
        box-shadow:0 0 0 4px ${STATUS_CONFIG[truck.status]?.dot ?? "#94a3b8"}33;
        border:2px solid #0b0f1a;
      "></div>`;

    return new window.google.maps.marker.AdvancedMarkerElement({
      map: mapRef.current,
      position: { lat: truck.lat, lng: truck.lng },
      content: pinEl,
      title: `Truck ${truck.id} → ${truck.destination}`,
    });
  }

  return { map: mapRef.current, ready, addTruckMarker };
}

// ---------------------------------------------------------------------------
// DARK MAP STYLES  (Google Maps JSON style array)
// ---------------------------------------------------------------------------
const DARK_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#0d1117" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d1117" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#3a4a5c" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#131d2a" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1e2a3a" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1a2940" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#070d14" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#1e3050" }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#162030" }] },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function MapComponent({ trucks = [], selectedTruckId, onTruckSelect }) {
  const containerRef = useRef(null);
  const { ready } = useGoogleMap(containerRef, {
    zoom: 6,
    center: { lat: 20.5937, lng: 78.9629 },
  });

  // In a real integration: useEffect watching `trucks` → call addTruckMarker per truck.

  const counts = trucks.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-[#1e2a3a] bg-[#070d14]">

      {/* ── Map container ── When Maps JS API key is provided, this div becomes the live map */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* ── Placeholder overlay (shown until Maps API is loaded) ── */}
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          {/* India outline placeholder blobs */}
          <svg viewBox="0 0 320 380" className="w-52 opacity-10" fill="none">
            <path
              d="M160 20 C90 40 40 100 50 180 C60 250 100 310 160 360 C220 310 260 250 270 180 C280 100 230 40 160 20Z"
              stroke="#38bdf8"
              strokeWidth="1"
              fill="#0ea5e9"
              fillOpacity="0.15"
            />
            <circle cx="160" cy="180" r="4" fill="#38bdf8" />
            {/* Mock truck dots */}
            {trucks.map((t, i) => (
              <circle
                key={t.id}
                cx={80 + ((t.lng - 68) / 30) * 160}
                cy={340 - ((t.lat - 8) / 28) * 320}
                r={selectedTruckId === t.id ? 7 : 5}
                fill={STATUS_CONFIG[t.status]?.dot ?? "#94a3b8"}
                opacity={selectedTruckId === t.id || !selectedTruckId ? 1 : 0.4}
                className="cursor-pointer transition-all duration-200"
                onClick={() => onTruckSelect?.(t.id)}
              />
            ))}
          </svg>
          <div className="flex items-center gap-2 text-[#1e3a50] text-xs font-mono">
            <WifiOff size={12} />
            <span>Maps API key not configured · Showing placeholder</span>
          </div>
        </div>
      )}

      {/* ── Top-left: Status legend ── */}
      <div className="absolute top-3 left-3 flex gap-2 z-10">
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
          <div
            key={status}
            className="flex items-center gap-1.5 bg-[#0b0f1a]/80 backdrop-blur-sm border border-[#1e2a3a] rounded-md px-2.5 py-1"
          >
            <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
            <span className="text-[10px] font-semibold text-[#4a6580] uppercase tracking-wider">
              {cfg.label}
            </span>
            <span className="text-[10px] font-mono text-[#94a3b8] ml-0.5">
              {counts[status] ?? 0}
            </span>
          </div>
        ))}
      </div>

      {/* ── Bottom-right: Attribution / connection status ── */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-[#0b0f1a]/80 backdrop-blur-sm border border-[#1e2a3a] rounded-md px-2.5 py-1.5">
        {ready ? (
          <>
            <Wifi size={11} className="text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-mono">Maps Live</span>
          </>
        ) : (
          <>
            <Navigation size={11} className="text-[#4a6580]" />
            <span className="text-[10px] text-[#4a6580] font-mono">Add GOOGLE_MAPS_API_KEY to enable</span>
          </>
        )}
      </div>

      {/* ── Selected truck detail card ── */}
      {selectedTruckId && (() => {
        const t = trucks.find((t) => t.id === selectedTruckId);
        if (!t) return null;
        const cfg = STATUS_CONFIG[t.status];
        return (
          <div className="absolute bottom-3 left-3 z-10 bg-[#0b0f1a]/90 backdrop-blur-sm border border-[#1e2a3a] rounded-lg p-3 min-w-[180px]">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.color} ring-2 ${cfg.ring}`} />
              <span className="text-white text-xs font-bold font-mono">{t.id}</span>
              <span className={`ml-auto text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded
                ${t.status === "on-time" ? "bg-emerald-500/15 text-emerald-400" :
                  t.status === "delayed" ? "bg-amber-500/15 text-amber-400" :
                  "bg-red-500/15 text-red-400"}`}>
                {cfg.label}
              </span>
            </div>
            <p className="text-[#4a6580] text-[10px]">Destination</p>
            <p className="text-[#94a3b8] text-xs font-medium truncate">{t.destination}</p>
            <p className="text-[#2a3a4d] text-[10px] mt-1 font-mono">{t.lat.toFixed(4)}°N {t.lng.toFixed(4)}°E</p>
          </div>
        );
      })()}
    </div>
  );
}
