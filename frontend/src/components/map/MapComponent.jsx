import React from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { AlertTriangle, MapPin, Navigation } from "lucide-react";

// Fix for default marker icons in Leaflet
import "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/images/marker-shadow.png";

const CENTER = [20.5937, 78.9629]; // India

// Custom Icon for Blockade
const blockadeIcon = L.divIcon({
  html: `<div class="w-9 h-9 rounded-full bg-red-600/90 border-2 border-red-400 flex items-center justify-center shadow-lg animate-pulse">⛔</div>`,
  className: "custom-div-icon",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Helper component to handle Map Clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapComponent({
  onMapClick,
  blockadeCoords,
  originalPath = [],
  optimizedPath = [],
  simulationRunning = false,
}) {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
      <MapContainer
        center={CENTER}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        {/* Dark Mode Tiles (CartoDB Dark Matter) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapClickHandler onMapClick={onMapClick} />

        {/* Original Route (Red Dashed) */}
        {originalPath.length > 1 && (
          <Polyline 
            positions={originalPath} 
            pathOptions={{ color: "#ef4444", dashArray: "10, 10", weight: 4 }} 
          />
        )}

        {/* Optimized Route (Green Solid) */}
        {optimizedPath.length > 1 && (
          <Polyline 
            positions={optimizedPath} 
            pathOptions={{ color: "#22c55e", weight: 5 }} 
          />
        )}

        {/* Blockade Marker */}
        {blockadeCoords && (
          <Marker position={[blockadeCoords.lat, blockadeCoords.lng]} icon={blockadeIcon} />
        )}
      </MapContainer>

      {/* ── UI Overlays (Stay the same) ────────────────────────────────── */}
      {!blockadeCoords && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/90 backdrop-blur-sm border border-indigo-500/30 rounded-full px-4 py-2 flex items-center gap-2 shadow-xl">
          <MapPin size={13} className="text-indigo-400" />
          <span className="text-slate-300 text-xs font-medium">Click to place disruption</span>
        </div>
      )}

      {/* Legend */}
      {(originalPath.length > 1 || optimizedPath.length > 1) && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-xl p-3 space-y-2 shadow-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-red-500 border-dashed border-t border-red-400" />
            <span className="text-red-400 text-[10px] font-semibold">Blocked Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-green-500" />
            <span className="text-green-400 text-[10px] font-semibold">Optimized Route</span>
          </div>
        </div>
      )}
    </div>
  );
}