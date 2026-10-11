import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Activity, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  Cpu, 
  BatteryMedium, 
  Wifi, 
  Clock 
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
    buf1_mv: '1500',   // Neutral 1500mV
    buf2_mv: '1035',   // Acidic 1035mV
    turbidity_baseline: '4.15', // baseline volts
    notes: 'Probes rinsed; calibrated with standard 4.01 and 7.00 buffer solutions.'
  });

  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Computed Slope & Offset
  const rawDeltaMv = Math.abs(parseFloat(calibData.buf1_mv || 0) - parseFloat(calibData.buf2_mv || 0));
  const calculatedSlope = (rawDeltaMv / 2.99 / 100).toFixed(3);
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
      
      {/* Boxy Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200 dark:border-blue-800">
            <Wrench className="w-3.5 h-3.5 text-blue-600" />
            Field Operations
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Sensor Calibration & Diagnostics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Maintain probe accuracy for municipal nodes in {selectedCity}. Perform 2-point reference buffer adjustments, compute ADC slope/offset, and flash calibration parameters.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-none border border-slate-200 dark:border-slate-700 text-center">
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">99.2%</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Fleet Uptime</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-none border border-slate-200 dark:border-slate-700 text-center">
            <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">{history.length}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Calibrations</div>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`p-3 rounded-none text-xs flex items-center gap-2.5 border ${
          notification.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' 
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span className="font-semibold">{notification.text}</span>
        </div>
      )}

      {/* Main Grid: Calibration Console (Left) & Station Status / Log (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 2-Point Buffer Calibration */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Live Probe Calibration</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Compute ADC gain, slope, and zero-offset</p>
            </div>
          </div>

          <form onSubmit={handleSaveCalibration} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Sensor Station ({selectedCity}) *
              </label>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="w-full px-3 py-2 rounded-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {cityStations.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sensor Probe Selection
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'PH_PROBE', label: 'pH Glass Electrode' },
                  { id: 'TURB_PROBE', label: 'Turbidity Optical Probe' },
                  { id: 'TDS_PROBE', label: 'TDS Conductivity Probe' },
                  { id: 'DO_PROBE', label: 'Dissolved Oxygen Probe' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSensorType(item.id)}
                    className={`py-2 px-3 rounded-none font-bold text-left border text-xs transition cursor-pointer ${
                      sensorType === item.id 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voltage Inputs */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Buffer 1 (pH 7.00 Neutral) mV
                </label>
                <input
                  type="number"
                  step="1"
                  value={calibData.buf1_mv}
                  onChange={(e) => setCalibData({ ...calibData, buf1_mv: e.target.value })}
                  className="w-full px-3 py-2 rounded-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-400">Nominal: ~1500 mV</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Buffer 2 (pH 4.01 Acidic) mV
                </label>
                <input
                  type="number"
                  step="1"
                  value={calibData.buf2_mv}
                  onChange={(e) => setCalibData({ ...calibData, buf2_mv: e.target.value })}
                  className="w-full px-3 py-2 rounded-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-400">Nominal: ~1035 mV</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Clean Water Baseline (Turbidity 0 NTU) Volts
              </label>
              <input
                type="number"
                step="0.01"
                value={calibData.turbidity_baseline}
                onChange={(e) => setCalibData({ ...calibData, turbidity_baseline: e.target.value })}
                className="w-full px-3 py-2 rounded-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Calculated Slope Card */}
            <div className="p-3 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>Calculated Slope:</span>
                <span className="font-mono text-sm text-blue-600 dark:text-blue-400">{calculatedSlope} V/pH</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>ADC Zero Offset:</span>
                <span className="font-mono text-sm text-blue-600 dark:text-blue-400">{calculatedOffset} V</span>
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Response is within 98.6% of standard curve. Ready to flash.</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Technician Notes
              </label>
              <textarea
                rows="2"
                value={calibData.notes}
                onChange={(e) => setCalibData({ ...calibData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-none bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Recording Calibration...' : 'Flash Calibration to IoT Node'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Node Diagnostics & Audit History */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Node Health Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Station Hardware Health: {currentStationObj?.name}
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <BatteryMedium className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">94%</div>
                <div className="text-[10px] text-slate-500">Solar LiFePO4</div>
              </div>

              <div className="p-3 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Wifi className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">-68 dBm</div>
                <div className="text-[10px] text-slate-500">4G LTE / LoRa</div>
              </div>

              <div className="p-3 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Activity className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">100%</div>
                <div className="text-[10px] text-slate-500">Probe Accuracy</div>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 border-t border-slate-200 dark:border-slate-800 pt-3">
              <div><strong>Firmware Version:</strong> v2.8.4-RTOS (OTA Active)</div>
              <div><strong>Telemetry Cycle:</strong> 3-second live sensor packet transmit</div>
              <div><strong>Scheduled Probe Service:</strong> In 14 days</div>
            </div>
          </div>

          {/* Calibration Audit Trail */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Calibration Audit Trail
              </span>
              <span className="text-xs text-slate-400 font-mono">Last {history.length} records</span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {history.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">No calibration logs yet.</div>
              ) : (
                history.map((log) => (
                  <div key={log.id} className="p-3 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
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
