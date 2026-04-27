"use client";
import { useState } from 'react';
import Map, { Source, Layer, Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapComponent({ trucks = [], activeAlerts = [] }) {
  const [viewState, setViewState] = useState({ longitude: 77.2090, latitude: 22.5, zoom: 4 });
  const [selectedVehicle, setSelectedVehicle] = useState(null); 
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Layer styles to segregate the network
  const terrestrialLayer = { id: 'road', type: 'line', paint: { 'line-color': '#10b981', 'line-width': 4 } };
  const maritimeLayer = { id: 'sea', type: 'line', paint: { 'line-color': '#3b82f6', 'line-width': 3, 'line-dasharray': [2, 2] } };
  const threatLayer = { id: 'threat', type: 'fill', paint: { 'fill-color': '#ef4444', 'fill-opacity': 0.3 } };

  if (!MAPBOX_TOKEN) return <div className="p-4 text-red-500">Missing Mapbox Token</div>;

  return (
    <div className="w-full h-full relative">
      <Map {...viewState} onMove={e => setViewState(e.viewState)} mapStyle="mapbox://styles/mapbox/navigation-night-v1" mapboxAccessToken={MAPBOX_TOKEN}>
        {/* Draw Red Threat Zones */}
        {activeAlerts.map((a, i) => a.geojson_polygon && (
          <Source key={i} type="geojson" data={a.geojson_polygon}><Layer {...threatLayer} /></Source>
        ))}

        {/* Draw Road and Sea Routes */}
        {trucks.map(t => t.safe_geojson && (
          <Source key={t.id} type="geojson" data={t.safe_geojson}>
            <Layer {...(t.mode === "maritime" ? maritimeLayer : terrestrialLayer)} />
          </Source>
        ))}

        {/* Vehicle Markers */}
        {trucks.map(t => (
          <Marker key={t.id} longitude={t.lng} latitude={t.lat} onClick={e => { e.originalEvent.stopPropagation(); setSelectedVehicle(t); }}>
            <div className={`w-4 h-4 rounded-full border-2 border-white shadow-xl ${t.status === 'at-risk' ? 'bg-red-500 animate-pulse' : t.status === 'delayed' ? 'bg-yellow-500' : 'bg-emerald-500'}`} />
          </Marker>
        ))}

        {/* AI Decision Popup */}
        {selectedVehicle && (
          <Popup longitude={selectedVehicle.lng} latitude={selectedVehicle.lat} anchor="bottom" onClose={() => setSelectedVehicle(null)}>
            <div className="bg-[#0b0f1a] p-3 rounded border border-[#1e2a3a]">
              <p className="text-white font-bold text-xs">{selectedVehicle.id} ({selectedVehicle.mode})</p>
              <div className="flex justify-between mt-2"><span className="text-gray-400 text-[10px]">Action:</span><span className="text-red-400 text-[10px] font-bold">{selectedVehicle.action}</span></div>
              <div className="flex justify-between mt-1"><span className="text-gray-400 text-[10px]">Cost:</span><span className="text-emerald-400 text-[10px] font-mono">{selectedVehicle.estimated_cost}</span></div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}