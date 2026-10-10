import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  SlidersHorizontal, 
  CheckCircle2, 
  UploadCloud, 
  Bell, 
  Clock, 
  AlertTriangle,
  FlaskConical,
  CloudRain
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

export default function SimulationView() {
  const { 
    simulationStatus, 
    toggleSimulation, 
    setSimulationSpeed, 
    triggerScenario 
  } = useTelemetry();

  const [activeSubTab, setActiveSubTab] = useState('Real-time Replay');
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('NORMAL');

  const isRunning = simulationStatus?.isRunning ?? true;
  const currentSpeed = simulationStatus?.playbackSpeed ?? 1;

  const scenarios = [
    { id: 'RESET', label: 'Normal Operation (Baseline)', description: 'System running with baseline nominal data.' },
    { id: 'SPILL', label: 'Industrial Acid Spill (Riverside)', description: 'pH plunges to 4.8 and TDS spikes at river intake.' },
    { id: 'RUNOFF', label: 'Monsoon Storm Runoff (East Reservoir)', description: 'Turbidity surges above 45 NTU with organic wash-in.' },
    { id: 'CHLORINE_DROP', label: 'Disinfection Failure (Central WTP)', description: 'Chlorine residual depleted; tap network alerts triggered.' },
  ];

  const recentEvents = [
    { time: '11:42', station: "Station 'Riverside'", desc: 'Normal parameters verified' },
    { time: '10:27', station: "Station 'East Reservoir'", desc: 'Turbidity spike registered (12.5 NTU)' },
    { time: '10:01', station: "Station 'Central WTP'", desc: 'Chlorine level restored to 0.6 mg/L' },
    { time: '09:34', station: "Station 'North Plant'", desc: 'Automated coagulation dosing active' },
    { time: '08:50', station: "Station 'West Tap'", desc: 'Baseline pressure and TDS stabilized' },
  ];

  const handleApplyScenario = () => {
    triggerScenario(selectedScenarioKey);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Simulation & Scenario Injection</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Test system response with realistic scenarios</p>
      </div>

      {/* Sub-tabs matching Image 4 */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-semibold">
        {['Real-time Replay', 'Scenario Injection', 'Settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-3 transition relative ${
              activeSubTab === tab 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid: Left Controls + Right Active Scenario & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Simulation Controls & Scenario Selector */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Card: Simulation Controls */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Simulation Controls</h3>

            <div className="flex items-center gap-4">
              {/* Play / Pause Big Button */}
              <button
                onClick={toggleSimulation}
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition shrink-0"
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                  <span className="font-semibold text-slate-900">{isRunning ? 'Playing' : 'Paused'}</span>
                  <span className="font-mono">00:16:32 / 02:00:00</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-[28%] transition-all"></div>
                </div>
              </div>

              {/* Speed selector dropdown */}
              <div className="shrink-0">
                <select
                  value={currentSpeed}
                  onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1x Speed</option>
                  <option value={2}>2x Speed</option>
                  <option value={5}>5x Speed</option>
                  <option value={10}>10x Speed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card: Current Scenario Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Current Scenario</h3>
            <p className="text-xs text-slate-500 mb-4">Select an operational baseline or inject a synthetic contamination event.</p>

            <div className="space-y-3">
              <select
                value={selectedScenarioKey}
                onChange={(e) => setSelectedScenarioKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {scenarios.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleApplyScenario}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition"
                >
                  Change Scenario
                </button>

                <button
                  onClick={() => triggerScenario('RESET')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                >
                  Reset
                </button>

                <button
                  onClick={toggleSimulation}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                >
                  {isRunning ? 'Pause >' : 'Resume >'}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Active Scenario Badge, Data Flow, Recent Events */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Active Scenario Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Active Scenario</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 className="text-base font-bold text-slate-900">Normal Operation</h4>
            </div>
            <p className="text-xs text-slate-500 mt-1">System running with baseline municipal water quality data.</p>
          </div>

          {/* Data Flow Metrics (3 cards) matching Image 4 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Data Flow</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-black font-mono text-slate-900">12</div>
                  <div className="text-[10px] text-slate-500 font-medium leading-tight">Stations Ingesting</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-black font-mono text-slate-900">240</div>
                  <div className="text-[10px] text-slate-500 font-medium leading-tight">Readings/min Rate</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-black font-mono text-slate-900">1</div>
                  <div className="text-[10px] text-slate-500 font-medium leading-tight">Active Alert</div>
                </div>
              </div>

            </div>
          </div>

          {/* Recent Events Log matching Image 4 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Events</h4>
            <div className="space-y-2.5">
              {recentEvents.map((evt, idx) => (
                <div key={idx} className="flex items-start justify-between text-xs py-1.5 border-b border-slate-50 last:border-none">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400 text-[11px]">{evt.time}</span>
                    <span className="font-bold text-slate-800">{evt.station}</span>
                    <span className="text-slate-500 text-[11px]">- {evt.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
