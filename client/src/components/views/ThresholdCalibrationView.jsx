import React, { useState } from 'react';
import { 
  Check, 
  Power 
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useAuth } from '../../context/AuthContext';

export default function ThresholdCalibrationView() {
  const { stations, selectedStationId, setSelectedStationId } = useTelemetry();
  const { selectedCity, currentUser } = useAuth();

  const cityStations = stations.filter(s => !selectedCity || s.city === selectedCity);
  const activeStation = cityStations.find(s => s.id === selectedStationId) || cityStations[0] || stations[0];

  const [thresholds, setThresholds] = useState({
    ph_min: 6.5,
    ph_max: 8.5,
    turbidity_max: 5.0,
    do_min: 5.0,
    tds_max: 500.0,
    valve_status: 'OPEN'
  });

  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/v1/thresholds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station_id: activeStation.id,
          ...thresholds,
          calibrated_by: `${currentUser?.name} (${currentUser?.title})`
        })
      });
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleValveToggle = async (status) => {
    setThresholds(prev => ({ ...prev, valve_status: status }));
    try {
      await fetch('/api/v1/thresholds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station_id: activeStation.id,
          ...thresholds,
          valve_status: status,
          calibrated_by: `${currentUser?.name} (${currentUser?.title})`
        })
      });
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      
      {/* Header - Boxy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300 dark:border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Municipal Engineer Control
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Threshold Calibration & Valve Control
          </h1>
        </div>

        {/* Station Selector - Boxy */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500">Station:</label>
          <select
            value={activeStation?.id}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white px-2.5 py-1.5 focus:outline-none"
          >
            {cityStations.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        </div>
      </div>

      {savedFeedback && (
        <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0 text-blue-600" />
          <span>Parameters updated for {activeStation?.name}.</span>
        </div>
      )}

      {/* Grid: Threshold Controls + Valve Controls - Boxy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-4 border border-slate-300 dark:border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
            Alarm Threshold Limits
          </h2>

          <form onSubmit={handleSave} className="space-y-3 text-xs">
            
            {/* pH Range */}
            <div className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-2">
                <span>pH Safe Range</span>
                <span className="font-mono text-blue-600">{thresholds.ph_min} - {thresholds.ph_max}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Min pH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thresholds.ph_min}
                    onChange={(e) => setThresholds({ ...thresholds, ph_min: parseFloat(e.target.value) })}
                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Max pH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thresholds.ph_max}
                    onChange={(e) => setThresholds({ ...thresholds, ph_max: parseFloat(e.target.value) })}
                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Turbidity Max */}
            <div className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                <span>Turbidity Ceiling Limit</span>
                <span className="font-mono text-amber-600">{thresholds.turbidity_max} NTU</span>
              </div>
              <input
                type="number"
                step="0.5"
                value={thresholds.turbidity_max}
                onChange={(e) => setThresholds({ ...thresholds, turbidity_max: parseFloat(e.target.value) })}
                className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
              />
            </div>

            {/* DO Min */}
            <div className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                <span>Dissolved Oxygen Floor Limit</span>
                <span className="font-mono text-emerald-600">{thresholds.do_min} mg/L</span>
              </div>
              <input
                type="number"
                step="0.2"
                value={thresholds.do_min}
                onChange={(e) => setThresholds({ ...thresholds, do_min: parseFloat(e.target.value) })}
                className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
              />
            </div>

            {/* TDS Max */}
            <div className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                <span>Total Dissolved Solids Max Limit</span>
                <span className="font-mono text-purple-600">{thresholds.tds_max} ppm</span>
              </div>
              <input
                type="number"
                step="25"
                value={thresholds.tds_max}
                onChange={(e) => setThresholds({ ...thresholds, tds_max: parseFloat(e.target.value) })}
                className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs border border-blue-700 cursor-pointer"
            >
              Save Operational Thresholds
            </button>
          </form>
        </div>

        {/* Right: Emergency Valves */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-4 border border-slate-300 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Power className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Emergency Network Valve
            </h2>
          </div>

          <div className="p-4 border border-slate-300 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-950">
            <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Valve Status</span>
            <div className={`text-xl font-bold font-mono ${
              thresholds.valve_status === 'CLOSED' ? 'text-red-600' :
              thresholds.valve_status === 'THROTTLED' ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {thresholds.valve_status}
            </div>
          </div>

          {/* Valve Buttons - Boxy */}
          <div className="space-y-2 text-xs">
            <button
              type="button"
              onClick={() => handleValveToggle('OPEN')}
              className={`w-full py-2 font-bold border transition cursor-pointer ${
                thresholds.valve_status === 'OPEN'
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              OPEN VALVE (100% Inflow)
            </button>

            <button
              type="button"
              onClick={() => handleValveToggle('THROTTLED')}
              className={`w-full py-2 font-bold border transition cursor-pointer ${
                thresholds.valve_status === 'THROTTLED'
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              THROTTLE VALVE (35% Capacity)
            </button>

            <button
              type="button"
              onClick={() => handleValveToggle('CLOSED')}
              className={`w-full py-2 font-bold border transition cursor-pointer ${
                thresholds.valve_status === 'CLOSED'
                  ? 'bg-red-600 text-white border-red-700'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              EMERGENCY SHUTOFF (0% Flow)
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
