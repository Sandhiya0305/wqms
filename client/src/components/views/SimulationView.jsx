import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  UploadCloud, 
  Bell, 
  AlertTriangle,
  Flame,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useAuth } from '../../context/AuthContext';

export default function SimulationView() {
  const { 
    simulationStatus, 
    toggleSimulation, 
    setSimulationSpeed, 
    triggerScenario 
  } = useTelemetry();
  const { selectedCity } = useAuth();

  const [selectedScenarioKey, setSelectedScenarioKey] = useState('SPILL');
  const [activeNotification, setActiveNotification] = useState(null);

  const isRunning = simulationStatus?.isRunning ?? true;
  const currentSpeed = simulationStatus?.playbackSpeed ?? 1;

  const scenarios = [
    { 
      id: 'SPILL', 
      label: 'Industrial Acid Runoff (Kaveri Intake / Srirangam)', 
      description: 'pH drops to 4.8 and chemical minerals spike at the river intake.' 
    },
    { 
      id: 'RUNOFF', 
      label: 'Monsoon Silt Inflow (Kollidam River Basin)', 
      description: 'Turbidity exceeds 45 NTU due to heavy upstream soil runoff.' 
    },
    { 
      id: 'CHLORINE_DROP', 
      label: 'Disinfection Failure (Kambarasampettai WTP)', 
      description: 'Chlorine residual drops to 0.05 mg/L, triggering boil water advisory.' 
    },
    { 
      id: 'RESET', 
      label: 'Normal Baseline (All Parameters Nominal)', 
      description: 'Restores all sensors across the water grid to safe WHO standards.' 
    },
  ];

  const handleApplyScenario = async () => {
    try {
      await triggerScenario(selectedScenarioKey);
      const chosen = scenarios.find(s => s.id === selectedScenarioKey);
      setActiveNotification(`Injected scenario: ${chosen?.label}`);
      setTimeout(() => setActiveNotification(null), 4000);
    } catch (e) {
      setActiveNotification('Failed to trigger scenario');
    }
  };

  const handleReset = async () => {
    await triggerScenario('RESET');
    setSelectedScenarioKey('RESET');
    setActiveNotification('System reset to nominal baseline conditions.');
    setTimeout(() => setActiveNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Boxy Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200 dark:border-blue-800">
            <Flame className="w-3.5 h-3.5 text-blue-600" />
            <span>Stress Testing • {selectedCity}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Scenario Simulation & Stress Testing
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Simulate chemical spills, storm runoff, and disinfection failures to verify automated alerts and emergency workflows.
          </p>
        </div>
      </div>

      {activeNotification && (
        <div className="p-3 rounded-none bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-100 text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{activeNotification}</span>
        </div>
      )}

      {/* Grid: Left Controls + Right Active Scenario & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Simulation Controls & Scenario Selector */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Card: Simulation Controls */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Live Simulation Speed</h3>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleSimulation}
                className="w-12 h-12 rounded-none bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shrink-0 cursor-pointer"
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{isRunning ? 'Simulator Active' : 'Simulation Paused'}</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 text-[11px]">Continuous Stream</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden">
                  <div className={`h-full bg-blue-600 ${isRunning ? 'w-full animate-pulse' : 'w-1/2'}`}></div>
                </div>
              </div>

              <div className="shrink-0">
                <select
                  value={currentSpeed}
                  onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 rounded-none px-3 py-2.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>1x Normal</option>
                  <option value={2}>2x Fast</option>
                  <option value={5}>5x Rush</option>
                  <option value={10}>10x Max</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card: Current Scenario Selector */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Inject Synthetic Hazard Event</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an emergency condition to test automated threshold alarms and health advisory workflows.
            </p>

            <div className="space-y-2">
              {scenarios.map(s => (
                <div
                  key={s.id}
                  onClick={() => setSelectedScenarioKey(s.id)}
                  className={`p-3.5 rounded-none border text-xs cursor-pointer transition ${
                    selectedScenarioKey === s.id
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-medium'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{s.label}</span>
                    {selectedScenarioKey === s.id && <span className="w-2 h-2 rounded-none bg-blue-600"></span>}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{s.description}</div>
                </div>
              ))}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleApplyScenario}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-none transition cursor-pointer"
                >
                  Inject Synthetic Scenario
                </button>

                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-none border border-slate-300 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Safe</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Active Scenario Badge, Data Flow, Recent Events */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Active Scenario Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Target Municipal Network</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-none bg-emerald-500 animate-pulse"></span>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{selectedCity} District Grid</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Synthetic sensor packets stream into database and WebSocket clients at 3-second intervals.
            </p>
          </div>

          {/* Data Flow Metrics (3 cards) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">IoT Stream Telemetry</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div className="w-8 h-8 rounded-none bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-black font-mono text-slate-900 dark:text-slate-100">8 Nodes</div>
                  <div className="text-[10px] text-slate-500 font-medium leading-tight">{selectedCity} Fleet</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div className="w-8 h-8 rounded-none bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-black font-mono text-slate-900 dark:text-slate-100">160/min</div>
                  <div className="text-[10px] text-slate-500 font-medium leading-tight">Packet Stream</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div className="w-8 h-8 rounded-none bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-black font-mono text-slate-900 dark:text-slate-100">Active</div>
                  <div className="text-[10px] text-slate-500 font-medium leading-tight">Threshold Alarms</div>
                </div>
              </div>

            </div>
          </div>

          {/* Verification Directive */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-none border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Scenario Loop:</span>
            </div>
            <p className="leading-relaxed">
              When an emergency scenario is injected, the IoT pipeline detects abnormal parameters, estimates operational risk, raises real-time alerts, and triggers citizen boil-water advisories across {selectedCity}.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
