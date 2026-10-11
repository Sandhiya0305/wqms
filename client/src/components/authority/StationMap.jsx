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
    map.flyTo(target.center, target.zoom, { duration: 1.0 });
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

      let pinColor = '#10B981'; // Green
      let statusWord = 'Safe';

      if (wqi > 75 || station.status === 'CRITICAL') {
        pinColor = '#EF4444'; // Red
        statusWord = 'Hazardous';
      } else if (wqi > 50 || station.status === 'WARNING') {
        pinColor = '#F59E0B'; // Amber
        statusWord = 'Caution';
      }

      const size = isSelected ? 30 : isCurrentCity ? 24 : 16;

      const iconHtml = `
        <div style="width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="width: ${size}px; height: ${size}px; background-color: ${pinColor}; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);">
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

      // Boxy, clean popup
      const popupHtml = `
        <div style="padding: 4px; min-width: 190px; font-family: sans-serif;">
          <div style="font-weight: 700; font-size: 13px; color: ${isDark ? '#f8fafc' : '#0f172a'}; margin-bottom: 2px;">
            ${station.name}
          </div>
          <div style="font-size: 11px; color: ${isDark ? '#94a3b8' : '#64748b'}; margin-bottom: 6px;">
            ${station.district} • <span style="font-weight: 600; color: #0284c7;">${station.city || 'Trichy'}</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: ${isDark ? '#1e293b' : '#f1f5f9'}; padding: 4px 8px; margin-bottom: 6px; border-left: 3px solid ${pinColor};">
            <span style="font-size: 11px; font-weight: 600; color: ${isDark ? '#cbd5e1' : '#475569'};">Status:</span>
            <span style="font-size: 11px; font-weight: 700; color: ${pinColor};">${statusWord}</span>
          </div>

          <div style="font-size: 11px; color: ${isDark ? '#94a3b8' : '#475569'}; margin-bottom: 6px; line-height: 1.4;">
            <div>Turbidity: <strong>${tel ? tel.turbidity : 1.8} NTU</strong></div>
            <div>pH: <strong>${tel ? tel.ph : 7.2}</strong></div>
            <div>WQI Score: <strong>${100 - Math.min(100, wqi)} / 100</strong></div>
          </div>

          <button style="width: 100%; padding: 4px 8px; font-size: 11px; background: #2563eb; color: white; border: none; cursor: pointer; font-weight: 600;" onclick="window.selectAquaStation('${station.id}')">
            Select Station
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
    <div className="relative w-full h-[460px] border border-slate-300 dark:border-slate-800 bg-slate-900">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Boxy Map Legend */}
      <div className="absolute top-3 right-3 z-[1000] bg-white dark:bg-slate-900 px-3 py-2 border border-slate-300 dark:border-slate-700 text-xs shadow space-y-1">
        <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
          Quality Status
        </div>
        <div className="flex flex-col gap-1 text-[11px] text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 inline-block"></span> Safe (&lt;50)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-amber-500 inline-block"></span> Caution (50-75)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-rose-500 inline-block"></span> Critical (&gt;75)
          </span>
        </div>
      </div>

      {/* Boxy City Pill */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white dark:bg-slate-900 px-3 py-1 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow">
        Grid: {selectedCity}
      </div>
    </div>
  );
}
