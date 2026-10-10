import React from 'react';
import StationMap from '../authority/StationMap';
import { useTelemetry } from '../../context/TelemetryContext';
import { useAuth } from '../../context/AuthContext';
import { MapPin, ShieldCheck, AlertTriangle, Layers } from 'lucide-react';

export default function MapView({ setActiveView }) {
  const { stations, latestTelemetry } = useTelemetry();
  const { selectedCity, setSelectedCity } = useAuth();

  const cityStations = stations.filter(s => !selectedCity || s.city === selectedCity);
  
  const safeCount = cityStations.filter(s => {
    const wqi = latestTelemetry[s.id]?.wqi_score || 20;
    return wqi <= 50;
  }).length;

  const cautionCount = cityStations.filter(s => {
    const wqi = latestTelemetry[s.id]?.wqi_score || 20;
    return wqi > 50 && wqi <= 75;
  }).length;

  const criticalCount = cityStations.filter(s => {
    const wqi = latestTelemetry[s.id]?.wqi_score || 20;
    return wqi > 75;
  }).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>GIS Water Grid • {selectedCity}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Live Water Quality GIS Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Geospatial sensor nodes positioned across river intakes, treatment plants, and urban neighborhood tap networks.
          </p>
        </div>

        {/* City Switcher Quick Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold">
          {['Trichy', 'Chennai', 'Bengaluru', 'Madurai'].map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-xl transition ${
                selectedCity === city
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Station Summary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monitored Stations</div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{cityStations.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">In {selectedCity} District</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Safe Drinking Tap Zones</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{safeCount}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400/80 mt-0.5">WQI &lt; 50 (Potable)</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Moderate / Caution</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{cautionCount}</div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400/80 mt-0.5">Filter Advised</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Boil Advisories</div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{criticalCount}</div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400/80 mt-0.5">High Turbidity / Runoff</div>
        </div>
      </div>

      {/* Embedded Leaflet Map */}
      <div className="bg-white dark:bg-slate-900 p-2 sm:p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <StationMap />
      </div>

    </div>
  );
}
