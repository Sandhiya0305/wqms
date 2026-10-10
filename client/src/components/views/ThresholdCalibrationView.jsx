import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  ShieldAlert, 
  Check, 
  RotateCcw, 
  AlertTriangle, 
  Power, 
  Activity, 
  SlidersHorizontal 
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useAuth } from '../../context/AuthContext';

export default function ThresholdCalibrationView() {
  const { stations, selectedStationId, setSelectedStationId } = useTelemetry();
  const { selectedCity, currentUser } = useAuth();

  const cityStations = stations.filter(s => s.city === selectedCity);
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
      setTimeout(() => setSavedFeedback(false), 3000);
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
      setTimeout(() => setSavedFeedback(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
              Municipal Engineering Authority
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Threshold Calibration & Emergency Network Valves
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Calibrate regulatory alarm triggers and operate emergency sluice gate valves for {selectedCity} water distribution.
          </p>
        </div>

        {/* Station Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Target Station:</label>
          <select
            value={activeStation?.id}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {cityStations.map(st => (
              <option key={st.id} value={st.id}>{st.name} ({st.district})</option>
            ))}
          </select>
        </div>
      </div>

      {savedFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>Operational parameters and valve commands successfully transmitted to station edge gateway.</span>
        </div>
      )}

      {/* Grid: Threshold Controls (Left) + Emergency Valve Override (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Threshold Parameters Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Regulatory Anomaly Alarm Limits
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Readings exceeding these ranges will automatically trigger high-severity alarms and alert operators.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            
            {/* pH Range */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                <span>pH Permissible Range</span>
                <span className="font-mono text-blue-600">{thresholds.ph_min} - {thresholds.ph_max} pH</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Lower Floor Limit</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thresholds.ph_min}
                    onChange={(e) => setThresholds({ ...thresholds, ph_min: parseFloat(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Upper Ceiling Limit</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thresholds.ph_max}
                    onChange={(e) => setThresholds({ ...thresholds, ph_max: parseFloat(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Turbidity Max */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                <span>Turbidity Alarm Threshold (WHO Max: 5.0 NTU)</span>
                <span className="font-mono text-amber-600">{thresholds.turbidity_max} NTU</span>
              </div>
              <input
                type="number"
                step="0.5"
                value={thresholds.turbidity_max}
                onChange={(e) => setThresholds({ ...thresholds, turbidity_max: parseFloat(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            {/* Dissolved Oxygen Min */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                <span>Minimum Healthy Dissolved Oxygen (Hypoxia Floor)</span>
                <span className="font-mono text-emerald-600">{thresholds.do_min} mg/L</span>
              </div>
              <input
                type="number"
                step="0.2"
                value={thresholds.do_min}
                onChange={(e) => setThresholds({ ...thresholds, do_min: parseFloat(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            {/* TDS Max */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                <span>Total Dissolved Solids Permissible Limit</span>
                <span className="font-mono text-purple-600">{thresholds.tds_max} ppm</span>
              </div>
              <input
                type="number"
                step="25"
                value={thresholds.tds_max}
                onChange={(e) => setThresholds({ ...thresholds, tds_max: parseFloat(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Apply Operational Threshold Calibration</span>
            </button>
          </form>
        </div>

        {/* Right: Emergency Valve Override Controls */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Power className="w-5 h-5 text-rose-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Emergency Valve Actuator</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct physical command sent to motorized motorized intake sluice gates in <strong>{activeStation?.name}</strong>.
            </p>

            {/* Current Valve State Card */}
            <div className={`mt-6 p-5 rounded-2xl border text-center ${
              thresholds.valve_status === 'CLOSED'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                : thresholds.valve_status === 'THROTTLED'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
            }`}>
              <span className="text-[11px] font-bold uppercase tracking-wider block mb-1">Current Actuator Status</span>
              <div className="text-2xl font-black font-mono">
                {thresholds.valve_status}
              </div>
              <p className="text-[11px] mt-1 opacity-80">
                {thresholds.valve_status === 'CLOSED' ? 'Water intake completely halted to isolate contamination.' :
                 thresholds.valve_status === 'THROTTLED' ? 'Intake flow throttled to 35% capacity for filter backwash.' :
                 'Intake valve fully open for normal city supply.'}
              </p>
            </div>

            {/* 3 State Toggle Buttons */}
            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={() => handleValveToggle('OPEN')}
                className={`w-full py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                  thresholds.valve_status === 'OPEN'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>OPEN VALVE (Full Inflow)</span>
              </button>

              <button
                type="button"
                onClick={() => handleValveToggle('THROTTLED')}
                className={`w-full py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                  thresholds.valve_status === 'THROTTLED'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>THROTTLE TO 35% (Cautionary Flow)</span>
              </button>

              <button
                type="button"
                onClick={() => handleValveToggle('CLOSED')}
                className={`w-full py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                  thresholds.valve_status === 'CLOSED'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>EMERGENCY SHUTOFF (Close Inflow)</span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Authorization: Municipal Engineer Level 3 Override
          </div>
        </div>

      </div>

    </div>
  );
}
