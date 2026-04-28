"use client";
import { useState, useEffect, useRef } from 'react';
import Map, { Source, Layer, Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AlertOctagon } from 'lucide-react';

export default function MapComponent({
  trucks       = [],
  activeAlerts = [],
  originalPath = [],   // Digital Twin: blocked expressway array
  optimizedPath = [],  // Digital Twin: OR-Tools detour array
  originalGeojson = null,
  safeGeojson = null,
  blockadeCoords = null,
  disruptionType = 'none',
  bbox = null,
}) {
  const mapRef = useRef(null);
  const [viewState,      setViewState]      = useState({ longitude: 85.0, latitude: 10.0, zoom: 3.5 });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [hoveredThreat,   setHoveredThreat]   = useState(null);  // Oorjaa-style hover popup

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Re-center when Digital Twin paths arrive
  useEffect(() => {
    if (bbox && mapRef.current) {
      mapRef.current.fitBounds(
        [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
        { padding: 50, duration: 1000 }
      );
    } else if (originalPath.length > 0 || optimizedPath.length > 0 || originalGeojson || safeGeojson) {
      setViewState(prev => ({ ...prev, longitude: 73.4, latitude: 18.8, zoom: 8 }));
    }
  }, [originalPath, optimizedPath, originalGeojson, safeGeojson, bbox]);

  // ── Layer style factories (unique id per truck via suffix) ───────────────
  const makePlannedLayer = (id) => ({
    id:   `planned-layer-${id}`,
    type: 'line',
    paint: {
      'line-color':     '#94a3b8',   // slate-400 — "planned / compromised"
      'line-width':     3,
      'line-dasharray': [2, 2],
      'line-opacity':   0.65,
    },
  });

  const makeSafeLayer = (id, mode) => ({
    id:   `safe-layer-${id}`,
    type: 'line',
    paint: {
      'line-color': mode === 'maritime' ? '#3b82f6' : '#10b981',
      'line-width': 5,
    },
  });

  // Dashboard threat zone fill
  const threatFillLayer = {
    id:   'threat-fill',
    type: 'fill',
    paint: { 'fill-color': '#ef4444', 'fill-opacity': 0.15, 'fill-outline-color': '#b91c1c' },
  };

  // Digital Twin simulator layers (fixed IDs — only one active at a time)
  const dtOrigLayer = {
    id: 'dt-orig',
    type: 'line',
    paint: { 'line-color': '#ef4444', 'line-width': 4, 'line-dasharray': [1, 2] },
  };
  const dtOptLayer = {
    id: 'dt-opt',
    type: 'line',
    paint: { 'line-color': '#8b5cf6', 'line-width': 5 },
  };

  const makeGeoJSON = (coords) => ({
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: coords.map(c => [c.lng, c.lat]) },
  });

  if (!MAPBOX_TOKEN) {
    return <div className="p-4 text-red-500 text-sm">Missing Mapbox Token (NEXT_PUBLIC_MAPBOX_TOKEN)</div>;
  }

  return (
    <div className="w-full h-full relative border border-[#1e2a3a] rounded-xl overflow-hidden">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={e => setViewState(e.viewState)}
        mapStyle="mapbox://styles/mapbox/navigation-night-v1"
        mapboxAccessToken={MAPBOX_TOKEN}
      >

        {/* ── DASHBOARD: Threat zone polygons (translucent fill) ─────────── */}
        {activeAlerts.map((a, i) => a.geojson_polygon && (
          <Source key={`threat-poly-${i}`} id={`threat-poly-src-${i}`} type="geojson" data={a.geojson_polygon}>
            <Layer {...threatFillLayer} id={`threat-fill-${i}`} />
          </Source>
        ))}

        {/* ── DASHBOARD: Threat markers — pulsing Oorjaa-style red pins ─── */}
        {activeAlerts.map((a, i) => (
          a.center_lat && a.center_lng && (
            <Marker
              key={`threat-pin-${i}`}
              longitude={a.center_lng}
              latitude={a.center_lat}
              anchor="center"
            >
              <div
                className="relative flex items-center justify-center cursor-pointer"
                onMouseEnter={() => setHoveredThreat(a)}
                onMouseLeave={() => setHoveredThreat(null)}
              >
                <span className="absolute inline-flex w-8 h-8 rounded-full bg-red-500/30 animate-ping" />
                <span className="relative inline-flex w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-lg shadow-red-500/50" />
              </div>
            </Marker>
          )
        ))}

        {/* ── DASHBOARD: Threat Popup on hover (Oorjaa-style white card) ── */}
        {hoveredThreat && hoveredThreat.center_lat && (
          <Popup
            longitude={hoveredThreat.center_lng}
            latitude={hoveredThreat.center_lat}
            anchor="bottom"
            offset={20}
            closeButton={false}
            closeOnClick={false}
          >
            <div
              className="bg-white rounded-lg shadow-xl border border-red-200 min-w-[220px]"
              onMouseEnter={() => setHoveredThreat(hoveredThreat)}
              onMouseLeave={() => setHoveredThreat(null)}
            >
              {/* Red header bar */}
              <div className="bg-red-500 rounded-t-lg px-3 py-2 flex items-center gap-2">
                <span className="text-white text-xs font-bold">⚠ Unplanned Stoppage Avoided</span>
              </div>
              <div className="px-3 py-2.5 space-y-1.5">
                <p className="text-gray-800 text-[11px] font-semibold leading-tight">{hoveredThreat.location}</p>
                {hoveredThreat.stoppage_details && (() => {
                  const s = hoveredThreat.stoppage_details;
                  return (
                    <>
                      {s.duration && (
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-[10px]">Duration</span>
                          <span className="text-red-600 text-[10px] font-bold">{s.duration}</span>
                        </div>
                      )}
                      {s.reason && (
                        <div className="flex justify-between gap-3">
                          <span className="text-gray-400 text-[10px] flex-shrink-0">Reason</span>
                          <span className="text-gray-700 text-[10px] font-medium text-right">{s.reason}</span>
                        </div>
                      )}
                      {s.start_time && (
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-[10px]">Detected</span>
                          <span className="text-gray-800 text-[10px] font-semibold">{s.start_time}</span>
                        </div>
                      )}
                      {s.type && (
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-[10px]">Type</span>
                          <span className="text-amber-600 text-[10px] font-semibold">{s.type}</span>
                        </div>
                      )}
                      <div className="pt-1.5 mt-1 border-t border-gray-100">
                        <p className="text-gray-400 text-[9px] uppercase tracking-wide mb-0.5">AI Action</p>
                        <p className="text-emerald-700 text-[10px] font-bold leading-tight">
                          {s.ai_action || s.action}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </Popup>
        )}


        {/* ── DASHBOARD: Dual-route lines per truck ──────────────────────── */}
        {trucks.map(t => (
          <span key={`routes-${t.id}`}>
            {/* 1. Planned/original route — dashed slate (drawn first, underneath) */}
            {t.original_geojson && (
              <Source id={`planned-src-${t.id}`} type="geojson" data={t.original_geojson}>
                <Layer {...makePlannedLayer(t.id)} />
              </Source>
            )}
            {/* 2. AI-safe route — solid green/blue (drawn on top) */}
            {t.safe_geojson && (
              <Source id={`safe-src-${t.id}`} type="geojson" data={t.safe_geojson}>
                <Layer {...makeSafeLayer(t.id, t.mode)} />
              </Source>
            )}
          </span>
        ))}

        {/* ── DASHBOARD: Vehicle dot markers ────────────────────────────── */}
        {trucks.map(t => (
          <Marker
            key={`dot-${t.id}`}
            longitude={t.lng}
            latitude={t.lat}
            onClick={e => { e.originalEvent.stopPropagation(); setSelectedVehicle(t); }}
          >
            <div className={`
              w-3.5 h-3.5 rounded-full border-2 border-white shadow-xl cursor-pointer
              ${t.status === 'at-risk' ? 'bg-red-500 animate-pulse'
                : t.status === 'delayed' ? 'bg-yellow-400'
                : 'bg-emerald-400'}
            `} />
          </Marker>
        ))}

        {/* Vehicle info popup */}
        {selectedVehicle && (
          <Popup
            longitude={selectedVehicle.lng}
            latitude={selectedVehicle.lat}
            anchor="bottom"
            onClose={() => setSelectedVehicle(null)}
            closeButton={false}
          >
            <div className="bg-[#0b0f1a] px-3 py-2.5 rounded-lg border border-[#1e2a3a] min-w-[160px]">
              <p className="text-white font-bold text-xs mb-1">{selectedVehicle.id}</p>
              <p className="text-[#4a6580] text-[10px] mb-1.5">{selectedVehicle.destination}</p>
              <div className="flex justify-between items-center">
                <span className="text-[#4a6580] text-[10px]">Action:</span>
                <span className="text-amber-400 text-[10px] font-bold max-w-[110px] text-right leading-tight">
                  {selectedVehicle.action || '—'}
                </span>
              </div>
            </div>
          </Popup>
        )}

        {/* ── DIGITAL TWIN SIMULATOR: Blocked expressway (red dashed) ──── */}
        {originalPath.length > 0 && !originalGeojson && (
          <Source id="dt-orig-src" type="geojson" data={makeGeoJSON(originalPath)}>
            <Layer {...dtOrigLayer} id="original-route-legacy" />
          </Source>
        )}
        {originalGeojson && (
          <Source id="dt-orig-src-json" type="geojson" data={originalGeojson}>
            <Layer {...dtOrigLayer} id="original-route" />
          </Source>
        )}

        {/* ── DIGITAL TWIN SIMULATOR: OR-Tools detour (solid purple) ────── */}
        {optimizedPath.length > 0 && !safeGeojson && (
          <Source id="dt-opt-src" type="geojson" data={makeGeoJSON(optimizedPath)}>
            <Layer {...dtOptLayer} id="safe-route-legacy" />
          </Source>
        )}
        {safeGeojson && (
          <Source id="dt-opt-src-json" type="geojson" data={safeGeojson}>
            <Layer {...dtOptLayer} id="safe-route" />
          </Source>
        )}

        {/* ── DIGITAL TWIN SIMULATOR: Disruption pin ────────────────────── */}
        {blockadeCoords && disruptionType !== 'none' && (
          <Marker longitude={blockadeCoords.lng} latitude={blockadeCoords.lat}>
            <div className="relative flex items-center justify-center cursor-pointer scale-125">
              <span className="absolute inline-flex w-12 h-12 rounded-full bg-red-500/40 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
              <span className="absolute inline-flex w-10 h-10 rounded-full bg-red-500/60 animate-pulse" />
              <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-[0_0_15px_rgba(239,68,68,0.8)] text-white">
                 <AlertOctagon size={14} />
              </div>
            </div>
          </Marker>
        )}

      </Map>

      {/* ── Map legend overlay ─────────────────────────────────────────── */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1 bg-[#0b0f1a]/90 backdrop-blur-sm border border-[#1e2a3a] rounded-lg px-3 py-2 pointer-events-none">
        <p className="text-[#4a6580] text-[8px] font-bold uppercase tracking-widest mb-0.5">Route Legend</p>
        <div className="flex items-center gap-2">
          <svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="4 3" /></svg>
          <span className="text-[#94a3b8] text-[9px]">Planned Route</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke="#10b981" strokeWidth="3" /></svg>
          <span className="text-emerald-400 text-[9px]">AI-Optimised Route</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          <span className="text-red-400 text-[9px]">Threat / Stoppage</span>
        </div>
      </div>
    </div>
  );
}