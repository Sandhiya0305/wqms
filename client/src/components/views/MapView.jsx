import React from 'react';
import StationMap from '../authority/StationMap';
import { useTelemetry } from '../../context/TelemetryContext';
import { useAuth } from '../../context/AuthContext';
import { MapPin } from 'lucide-react';

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
    <div className="space-y-4 font-sans">
      
      {/* Header - Boxy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>GIS Map • {selectedCity}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Geospatial Sensor Network
          </h1>
        </div>

        {/* City Switcher - Boxy */}
        <div className="flex items-center border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold">
          {['Trichy', 'Chennai', 'Bengaluru', 'Madurai'].map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 transition cursor-pointer border-r last:border-r-0 border-slate-300 dark:border-slate-700 ${
                selectedCity === city
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Station Summary Metrics - Boxy */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3 border border-slate-300 dark:border-slate-800">
          <div className="text-xs text-slate-500 font-bold uppercase">Stations</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">{cityStations.length}</div>
          <div className="text-[10px] text-slate-400 font-mono">{selectedCity} Network</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 border border-slate-300 dark:border-slate-800">
          <div className="text-xs text-emerald-600 font-bold uppercase">Safe / Potable</div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{safeCount}</div>
          <div className="text-[10px] text-emerald-600 font-mono">WQI &lt; 50</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 border border-slate-300 dark:border-slate-800">
          <div className="text-xs text-amber-600 font-bold uppercase">Filter Advised</div>
          <div className="text-xl font-bold font-mono text-amber-600 mt-0.5">{cautionCount}</div>
          <div className="text-[10px] text-amber-600 font-mono">WQI 50-75</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 border border-slate-300 dark:border-slate-800">
          <div className="text-xs text-red-600 font-bold uppercase">Boil Water</div>
          <div className="text-xl font-bold font-mono text-red-600 mt-0.5">{criticalCount}</div>
          <div className="text-[10px] text-red-600 font-mono">WQI &gt; 75</div>
        </div>
      </div>

      {/* Map Container - Boxy */}
      <div className="bg-white dark:bg-slate-900 p-2 border border-slate-300 dark:border-slate-800">
        <StationMap />
      </div>

    </div>
  );
}
