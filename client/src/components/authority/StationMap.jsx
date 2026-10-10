import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useTelemetry } from '../../context/TelemetryContext';

export default function StationMap() {
  const { stations, latestTelemetry, selectedStationId, setSelectedStationId } = useTelemetry();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Initialize only once

    // Center coordinates around Delhi NCR public water stations
    const map = L.map(mapContainerRef.current, {
      center: [28.6250, 77.2000],
      zoom: 12,
      zoomControl: true,
      attributionControl: false
    });

    // Dark cartographic tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when stations or telemetry change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    stations.forEach(station => {
      const tel = latestTelemetry[station.id];
      const wqi = tel ? tel.wqi_score : 20;
      const isSelected = station.id === selectedStationId;

      // Color based on WQI and station status
      let pinColor = '#10B981'; // green
      let pingClass = '';
      if (wqi > 75 || station.status === 'CRITICAL') {
        pinColor = '#EF4444'; // red
        pingClass = 'animate-ping';
      } else if (wqi > 50 || station.status === 'WARNING') {
        pinColor = '#F59E0B'; // amber
      }

      const iconHtml = `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="position: absolute; width: ${isSelected ? '32px' : '24px'}; height: ${isSelected ? '32px' : '24px'}; border-radius: 9999px; background-color: ${pinColor}; opacity: 0.3;" class="${pingClass}"></div>
          <div style="width: ${isSelected ? '20px' : '16px'}; height: ${isSelected ? '20px' : '16px'}; border-radius: 9999px; background-color: ${pinColor}; border: 2px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center;">
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-station-pin',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (markersRef.current[station.id]) {
        // Update existing marker
        markersRef.current[station.id].setIcon(customIcon);
        markersRef.current[station.id].setLatLng([station.latitude, station.longitude]);
      } else {
        // Create new marker
        const marker = L.marker([station.latitude, station.longitude], { icon: customIcon }).addTo(map);

        marker.on('click', () => {
          setSelectedStationId(station.id);
        });

        markersRef.current[station.id] = marker;
      }

      // Popup Content
      const popupHtml = `
        <div style="padding: 4px; min-width: 180px;">
          <div style="font-weight: 700; font-size: 13px; color: #ffffff; margin-bottom: 2px;">${station.name}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${station.district} • <span style="color: #38bdf8;">${station.type}</span></div>
          <div style="display: flex; justify-content: space-between; align-items: center; background: #0f172a; padding: 6px 8px; border-radius: 6px; margin-bottom: 6px;">
            <span style="font-size: 11px; color: #94a3b8;">Water Quality Index:</span>
            <span style="font-size: 13px; font-weight: bold; font-family: monospace; color: ${pinColor};">${wqi ?? '--'}</span>
          </div>
          <div style="font-size: 10px; color: #64748b; margin-bottom: 6px;">Lat: ${station.latitude.toFixed(4)}, Lng: ${station.longitude.toFixed(4)}</div>
          <button style="width: 100%; padding: 4px 8px; font-size: 11px; background: #0284c7; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;" onclick="window.selectAquaStation('${station.id}')">
            View Live Telemetry
          </button>
        </div>
      `;

      markersRef.current[station.id].bindPopup(popupHtml);
    });

    // Expose select function to global window for popup button
    window.selectAquaStation = (id) => {
      setSelectedStationId(id);
    };
  }, [stations, latestTelemetry, selectedStationId, setSelectedStationId]);

  return (
    <div className="relative w-full h-[380px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 text-xs shadow-lg">
        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Station Quality</div>
        <div className="flex flex-col gap-1 text-[11px]">
          <span className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Safe / Potable (&lt;50)
          </span>
          <span className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Caution / Moderate (50-75)
          </span>
          <span className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span> Critical / Hazard (&gt;75)
          </span>
        </div>
      </div>
    </div>
  );
}
