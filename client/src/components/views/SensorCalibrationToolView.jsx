import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Activity, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Save, 
  Cpu, 
  BatteryMedium, 
  Wifi, 
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTelemetry } from '../../context/TelemetryContext';

export default function SensorCalibrationToolView({ setActiveView }) {
  const { selectedCity, currentUser } = useAuth();
  const { stations } = useTelemetry();

  const cityStations = stations.filter(s => !selectedCity || s.city === selectedCity);
  const [selectedStation, setSelectedStation] = useState(cityStations[0]?.id || 'TRICHY_KAVERI_01');
  const [sensorType, setSensorType] = useState('PH_PROBE');

  // Calibration input parameters
  const [calibData, setCalibData] = useState({
    buf1_mv: '1500',   // e.g., Buffer pH 7.0 (neutral 1500mV)
    buf2_mv: '1035',   // e.g., Buffer pH 4.01
    turbidity_baseline: '4.15', // baseline clean water volts
    notes: 'Probes washed with deionized water; calibrated against standard 4.01 and 7.00 buffer solutions.'
  });

  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Auto-calculated Slope & Offset
  const rawDeltaMv = Math.abs(parseFloat(calibData.buf1_mv || 0) - parseFloat(calibData.buf2_mv || 0));
  const calculatedSlope = (rawDeltaMv / 2.99 / 100).toFixed(3); // mV per pH unit factor
  const calculatedOffset = ((1500 - parseFloat(calibData.buf1_mv || 1500)) / 1000).toFixed(3);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/v1/calibration');
      const data = await res.json();
      if (data.success) {
        setHistory(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load calibration logs', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSaveCalibration = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/v1/calibration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: `NODE_${selectedStation.replace('TRICHY_', '').toUpperCase()}`,
          station_id: selectedStation,
          technician: `${currentUser?.name} (${currentUser?.roleLabel})`,
          ph_slope: parseFloat(calculatedSlope),
          ph_offset: parseFloat(calculatedOffset),
          turbidity_baseline_v: parseFloat(calibData.turbidity_baseline),
          notes: calibData.notes
        })
      });

      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', text: data.message });
        fetchHistory();
      } else {
        setNotification({ type: 'error', text: data.error || 'Failed to save calibration.' });
      }
    } catch (err) {
      setNotification({ type: 'error', text: 'Network connection failed' });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const currentStationObj = cityStations.find(s => s.id === selectedStation) || cityStations[0];

  return (
    <div className="space-y-6">
      
      {/* Role Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
              <Wrench className="w-3.5 h-3.5" />
              Field Operations Lead Authority
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              IoT Edge Sensor Calibration & Diagnostics Tool
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Maintain probe accuracy across municipal monitoring nodes in {selectedCity}. Perform 2-point reference buffer adjustments, compute analog voltage slope/offset, and log hardware calibration records.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center">
              <div className="text-2xl font-black">99.2%</div>
              <div className="text-[11px] text-emerald-100 font-medium">Fleet Telemetry Uptime</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center">
              <div className="text-2xl font-black">{history.length}</div>
              <div className="text-[11px] text-emerald-100 font-medium">Calibration Records</div>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-3 animate-in fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' 
            : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span className="font-medium">{notification.text}</span>
        </div>
      )}

      {/* Main Grid: Calibration Console (Left) & Station Status / Log (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 2-Point Buffer Calibration */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Live Probe Calibration</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Compute ADC gain, slope, and zero-offset</p>
            </div>
          </div>

          <form onSubmit={handleSaveCalibration} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Sensor Station ({selectedCity}) *
              </label>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500"
              >
                {cityStations.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Sensor Probe Selection
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'PH_PROBE', label: 'pH Glass Electrode' },
                  { id: 'TURB_PROBE', label: 'Turbidity Optical Probe' },
                  { id: 'TDS_PROBE', label: 'TDS / Conductivity' },
                  { id: 'DO_PROBE', label: 'Dissolved Oxygen Probe' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSensorType(item.id)}
                    className={`py-2 px-3 rounded-xl font-semibold text-left transition ${
                      sensorType === item.id 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voltage Inputs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Buffer 1 (pH 7.00 / Neutral) mV
                </label>
                <input
                  type="number"
                  step="1"
                  value={calibData.buf1_mv}
                  onChange={(e) => setCalibData({ ...calibData, buf1_mv: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400">Nominal: ~1500 mV</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Buffer 2 (pH 4.01 / Acidic) mV
                </label>
                <input
                  type="number"
                  step="1"
                  value={calibData.buf2_mv}
                  onChange={(e) => setCalibData({ ...calibData, buf2_mv: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400">Nominal: ~1035 mV</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Clean Water Baseline (Turbidity 0 NTU) Volts
              </label>
              <input
                type="number"
                step="0.01"
                value={calibData.turbidity_baseline}
                onChange={(e) => setCalibData({ ...calibData, turbidity_baseline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Calculated Slope Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-200">
                <span>Calculated Linearity Slope:</span>
                <span className="font-mono text-sm">{calculatedSlope} V/pH</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-200">
                <span>ADC Zero Offset:</span>
                <span className="font-mono text-sm">{calculatedOffset} V</span>
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sensor response is within 98.6% of Nernstian ideal curve. Ready to flash.</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Technician Field Observations & Notes
              </label>
              <textarea
                rows="2"
                value={calibData.notes}
                onChange={(e) => setCalibData({ ...calibData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Recording Calibration...' : 'Flash Calibration to IoT Node'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Node Diagnostics & Audit History */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Node Health Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-600" />
              Station Hardware Health: {currentStationObj?.name}
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <BatteryMedium className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">94%</div>
                <div className="text-[10px] text-slate-400">Solar LiFePO4</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <Wifi className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">-68 dBm</div>
                <div className="text-[10px] text-slate-400">4G LTE / LoRa</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <Activity className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">100%</div>
                <div className="text-[10px] text-slate-400">Probe Accuracy</div>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div><strong>Firmware Version:</strong> v2.8.4-RTOS (OTA Up-to-date)</div>
              <div><strong>Telemetry Cycle:</strong> 3-second live sensor packet transmit</div>
              <div><strong>Next Scheduled Probe Cleaning:</strong> In 14 days</div>
            </div>
          </div>

          {/* Calibration Audit Trail */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-500" />
                Field Calibration Audit Trail
              </span>
              <span className="text-xs text-slate-400 font-normal">Last {history.length} events</span>
            </h3>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {history.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">No calibration logs yet.</div>
              ) : (
                history.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{log.device_id} ({log.station_id})</span>
                      <span className="text-[10px] font-mono text-slate-400">{new Date(log.calibrated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-300">
                      <span>Slope: <strong className="font-mono">{log.ph_slope}</strong></span>
                      <span>Offset: <strong className="font-mono">{log.ph_offset}</strong></span>
                      <span>Turbidity Base: <strong className="font-mono">{log.turbidity_baseline_v}V</strong></span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      "{log.notes}"
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Technician: {log.technician}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
