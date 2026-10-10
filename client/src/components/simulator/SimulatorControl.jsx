import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  FastForward, 
  RotateCcw, 
  AlertTriangle, 
  CloudRain, 
  FlaskConical, 
  Radio, 
  Send, 
  Sliders,
  CheckCircle,
  Cpu
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

export default function SimulatorControl() {
  const { 
    simulationStatus, 
    toggleSimulation, 
    setSimulationSpeed, 
    triggerScenario,
    stations,
    selectedStationId,
    latestTelemetry
  } = useTelemetry();

  // Virtual Sensor manual slider state
  const [targetStation, setTargetStation] = useState(selectedStationId);
  const [sliderPh, setSliderPh] = useState(7.3);
  const [sliderTurbidity, setSliderTurbidity] = useState(2.5);
  const [sliderDO, setSliderDO] = useState(7.8);
  const [sliderTDS, setSliderTDS] = useState(210);
  const [sliderTemp, setSliderTemp] = useState(22.0);
  const [dispatchStatus, setDispatchStatus] = useState(null);

  const isRunning = simulationStatus?.isRunning ?? true;
  const currentSpeed = simulationStatus?.playbackSpeed ?? 1;
  const activeScenarios = simulationStatus?.activeScenarios ?? [];

  const handleManualDispatch = async () => {
    try {
      const payload = {
        station_id: targetStation,
        ph: parseFloat(sliderPh),
        turbidity_ntu: parseFloat(sliderTurbidity),
        do_mg_l: parseFloat(sliderDO),
        tds_ppm: parseFloat(sliderTDS),
        temp_c: parseFloat(sliderTemp),
        battery_pct: 96,
        signal_rssi: -58,
        timestamp: new Date().toISOString()
      };

      const res = await fetch('/api/v1/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (json.success) {
        setDispatchStatus({ success: true, message: `Packet received! Telemetry ID #${json.telemetry_id}, WQI: ${json.wqi.wqi_score}` });
      } else {
        setDispatchStatus({ success: false, message: json.errors?.join(', ') || 'Validation error' });
      }

      setTimeout(() => setDispatchStatus(null), 4000);
    } catch (err) {
      setDispatchStatus({ success: false, message: err.message });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Simulation Replay Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Cpu className="w-5 h-5 text-sky-400" />
                Real-World Dataset Simulation & Replay Engine
              </h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                isRunning ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}>
                {isRunning ? 'REPLAY ACTIVE' : 'PAUSED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Continuously streams multi-parameter sensor readings modeled after public river, reservoir, and tap data.
            </p>
          </div>

          {/* Play/Pause & Speed Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSimulation}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Pause Replay' : 'Resume Replay'}</span>
            </button>

            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {[1, 2, 5, 10].map(spd => (
                <button
                  key={spd}
                  onClick={() => setSimulationSpeed(spd)}
                  className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition ${
                    currentSpeed === spd
                      ? 'bg-sky-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 1-Click Scenario Injectors */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Trigger Real-World Contamination Scenarios
            </span>
            <span className="text-[11px] text-slate-500">Injects acute physical & chemical changes to test detection & alerting</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => triggerScenario('SPILL')}
              className="p-4 rounded-2xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/40 text-left transition group shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <FlaskConical className="w-5 h-5 text-rose-400 group-hover:scale-110 transition" />
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">pH 4.8 Acid</span>
              </div>
              <h4 className="text-xs font-bold text-white">Industrial Acid Spill</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Simulates hazardous chemical dumping into River Intake. Causes pH plunge and TDS surge.
              </p>
            </button>

            <button
              onClick={() => triggerScenario('RUNOFF')}
              className="p-4 rounded-2xl bg-amber-950/20 hover:bg-amber-950/40 border border-amber-500/40 text-left transition group shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <CloudRain className="w-5 h-5 text-amber-400 group-hover:scale-110 transition" />
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">45+ NTU</span>
              </div>
              <h4 className="text-xs font-bold text-white">Monsoon Storm Runoff</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Simulates heavy catchment rain. Turbidity spikes, organic solids increase, DO declines.
              </p>
            </button>

            <button
              onClick={() => triggerScenario('CHLORINE_DROP')}
              className="p-4 rounded-2xl bg-orange-950/20 hover:bg-orange-950/40 border border-orange-500/40 text-left transition group shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-400 group-hover:scale-110 transition" />
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300">Tap Ward #7</span>
              </div>
              <h4 className="text-xs font-bold text-white">Disinfection Failure</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Simulates treatment plant chlorinator failure affecting downstream tap distribution.
              </p>
            </button>

            <button
              onClick={() => triggerScenario('RESET')}
              className="p-4 rounded-2xl bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/40 text-left transition group shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <RotateCcw className="w-5 h-5 text-emerald-400 group-hover:rotate-180 transition duration-500" />
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">WHO Compliant</span>
              </div>
              <h4 className="text-xs font-bold text-white">Restore Normal Baseline</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Clears active shock scenarios and resets all stations back to nominal drinking standards.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Virtual IoT Hardware Sensor Node */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="pb-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sky-400" />
                Virtual IoT Hardware Sensor Node (ESP32 Edge Simulator)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulates physical probe inputs and serializes JSON packets directly into the ingestion gateway.
              </p>
            </div>

            <select
              value={targetStation}
              onChange={(e) => setTargetStation(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-sky-500"
            >
              {stations.map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* pH Slider */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-300 font-semibold">Analog pH Probe</span>
              <span className="font-mono text-sky-400 font-bold">{sliderPh} pH</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="12.0"
              step="0.1"
              value={sliderPh}
              onChange={(e) => setSliderPh(e.target.value)}
              className="w-full accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>Acidic (2.0)</span>
              <span>Neutral (7.0)</span>
              <span>Alkaline (12.0)</span>
            </div>
          </div>

          {/* Turbidity Slider */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-300 font-semibold">DFRobot Turbidity</span>
              <span className="font-mono text-amber-400 font-bold">{sliderTurbidity} NTU</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="100.0"
              step="0.5"
              value={sliderTurbidity}
              onChange={(e) => setSliderTurbidity(e.target.value)}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>Crystal (0.1)</span>
              <span>WHO Max (5.0)</span>
              <span>Muddy (100)</span>
            </div>
          </div>

          {/* DO Slider */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-300 font-semibold">Dissolved Oxygen Probe</span>
              <span className="font-mono text-emerald-400 font-bold">{sliderDO} mg/L</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="14.0"
              step="0.1"
              value={sliderDO}
              onChange={(e) => setSliderDO(e.target.value)}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>Hypoxic (0.5)</span>
              <span>Min Safe (5.0)</span>
              <span>Saturated (14.0)</span>
            </div>
          </div>

          {/* TDS Slider */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-300 font-semibold">Analog TDS Meter</span>
              <span className="font-mono text-pink-400 font-bold">{sliderTDS} ppm</span>
            </div>
            <input
              type="range"
              min="50"
              max="1500"
              step="10"
              value={sliderTDS}
              onChange={(e) => setSliderTDS(e.target.value)}
              className="w-full accent-pink-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>Pure (50)</span>
              <span>Standard (500)</span>
              <span>Saline (1500)</span>
            </div>
          </div>

          {/* Temperature Slider */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-300 font-semibold">DS18B20 Temp</span>
              <span className="font-mono text-orange-400 font-bold">{sliderTemp} °C</span>
            </div>
            <input
              type="range"
              min="5.0"
              max="45.0"
              step="0.5"
              value={sliderTemp}
              onChange={(e) => setSliderTemp(e.target.value)}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>Cold (5°C)</span>
              <span>Ideal (20°C)</span>
              <span>Warm (45°C)</span>
            </div>
          </div>

          {/* Dispatch Action Box */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-300">Transmit Packet</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Dispatches telemetry packet to HTTP REST / MQTT broker.
              </p>
            </div>

            <button
              onClick={handleManualDispatch}
              className="mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md shadow-sky-600/30 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Reading</span>
            </button>
          </div>
        </div>

        {/* Live Packet Feedback */}
        {dispatchStatus && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-mono border ${
            dispatchStatus.success 
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
          }`}>
            {dispatchStatus.message}
          </div>
        )}
      </div>

    </div>
  );
}
