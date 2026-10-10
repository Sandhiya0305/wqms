import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useTelemetry } from '../../context/TelemetryContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const CITY_COORDINATES = {
  Trichy: { center: [10.8280, 78.6960], zoom: 13 },
  Chennai: { center: [13.0400, 80.2000], zoom: 12 },
  Bengaluru: { center: [12.9716, 77.5946], zoom: 12 },
  Madurai: { center: [9.9252, 78.1198], zoom: 12 }
};

export default function StationMap() {
  const { stations, latestTelemetry, selectedStationId, setSelectedStationId } = useTelemetry();
  const { selectedCity } = useAuth();
  const { isDark } = useTheme();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef({});

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCity = CITY_COORDINATES[selectedCity] || CITY_COORDINATES['Trichy'];

    const map = L.map(mapContainerRef.current, {
      center: initialCity.center,
      zoom: initialCity.zoom,
      zoomControl: true,
      attributionControl: false
    });

    const tileUrl = isDark 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer on Theme Change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl = isDark 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const newTileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [isDark]);

  // Recenter when city changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const target = CITY_COORDINATES[selectedCity] || CITY_COORDINATES['Trichy'];
    map.flyTo(target.center, target.zoom, { duration: 1.2 });
  }, [selectedCity]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    stations.forEach(station => {
      const tel = latestTelemetry[station.id];
      const wqi = tel ? tel.wqi_score : 20;
      const isSelected = station.id === selectedStationId;
      const isCurrentCity = !selectedCity || station.city === selectedCity;

      // Color coding: Safe (<50), Moderate (50-75), Critical (>75)
      let pinColor = '#10B981'; // Green
      let pingClass = '';
      let statusWord = 'Safe';

      if (wqi > 75 || station.status === 'CRITICAL') {
        pinColor = '#EF4444'; // Red
        pingClass = 'animate-ping';
        statusWord = 'Hazardous';
      } else if (wqi > 50 || station.status === 'WARNING') {
        pinColor = '#F59E0B'; // Amber
        statusWord = 'Caution';
      }

      const size = isSelected ? 36 : isCurrentCity ? 28 : 20;

      const iconHtml = `
        <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background-color: ${pinColor}; opacity: ${isCurrentCity ? 0.35 : 0.15};" class="${pingClass}"></div>
          <div style="width: ${size * 0.65}px; height: ${size * 0.65}px; border-radius: 9999px; background-color: ${pinColor}; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center;">
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-station-pin',
        html: iconHtml,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      if (markersRef.current[station.id]) {
        markersRef.current[station.id].setIcon(customIcon);
        markersRef.current[station.id].setLatLng([station.latitude, station.longitude]);
      } else {
        const marker = L.marker([station.latitude, station.longitude], { icon: customIcon }).addTo(map);
        marker.on('click', () => {
          setSelectedStationId(station.id);
        });
        markersRef.current[station.id] = marker;
      }

      // Readable popup in simple English
      const popupHtml = `
        <div style="padding: 6px; min-width: 200px; font-family: sans-serif;">
          <div style="font-weight: 800; font-size: 13px; color: ${isDark ? '#f8fafc' : '#0f172a'}; margin-bottom: 2px;">
            ${station.name}
          </div>
          <div style="font-size: 11px; color: ${isDark ? '#94a3b8' : '#64748b'}; margin-bottom: 8px;">
            ${station.district} • <span style="font-weight: 600; color: #0284c7;">${station.city || 'Trichy'}</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: ${isDark ? '#1e293b' : '#f1f5f9'}; padding: 6px 10px; border-radius: 8px; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 600; color: ${isDark ? '#cbd5e1' : '#475569'};">Water Status:</span>
            <span style="font-size: 12px; font-weight: 800; color: ${pinColor};">${statusWord}</span>
          </div>

          <div style="font-size: 11px; color: ${isDark ? '#94a3b8' : '#475569'}; margin-bottom: 8px; line-height: 1.4;">
            <div>• Clarity (Turbidity): <strong>${tel ? tel.turbidity : 1.8} NTU</strong></div>
            <div>• Acidity (pH): <strong>${tel ? tel.ph : 7.2}</strong></div>
            <div>• Cleanliness Score: <strong>${100 - Math.min(100, wqi)} / 100</strong></div>
          </div>

          <button style="width: 100%; padding: 6px 10px; font-size: 11px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 700;" onclick="window.selectAquaStation('${station.id}')">
            View Live Sensor Telemetry
          </button>
        </div>
      `;

      markersRef.current[station.id].bindPopup(popupHtml);
    });

    window.selectAquaStation = (id) => {
      setSelectedStationId(id);
    };
  }, [stations, latestTelemetry, selectedStationId, setSelectedStationId, selectedCity, isDark]);

  return (
    <div className="relative w-full h-[480px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-900">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Map Legend Overlay */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-xs shadow-xl space-y-1.5">
        <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">
          Water Quality Legend
        </div>
        <div className="flex flex-col gap-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></span> Safe to Drink (&lt;50)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></span> In-Home Filter Advised (50-75)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm animate-pulse"></span> Boil Water / Critical (&gt;75)
          </span>
        </div>
      </div>

      {/* City Center Pill */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-semibold shadow-md">
        📍 {selectedCity} Municipal Water Network
      </div>
    </div>
  );
}
