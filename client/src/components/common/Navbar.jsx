import React from 'react';
import { Droplets, ShieldAlert, Activity, Users, Cpu, Radio } from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { connected, activeAlerts, lastUpdated, simulationStatus } = useTelemetry();

  const criticalAlertsCount = activeAlerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
  const totalActiveAlerts = activeAlerts.filter(a => a.status !== 'RESOLVED').length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">Aqua<span className="text-sky-400">Intel</span></span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">v1.0 IoT</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Public Water Quality & Risk Intelligence Platform</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('authority')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'authority'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Authority Command</span>
              {totalActiveAlerts > 0 && (
                <span className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${criticalAlertsCount > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500 text-slate-900'}`}>
                  {totalActiveAlerts}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('citizen')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'citizen'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Citizen Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'simulator'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span className="hidden md:inline">IoT Lab & Replay</span>
              <span className="md:hidden">IoT Lab</span>
              {simulationStatus?.isRunning && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </button>
          </nav>

          {/* Live Stream Connectivity Status */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
              <Radio className={`w-3.5 h-3.5 ${connected ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`} />
              <span className="hidden lg:inline text-slate-300">{connected ? 'Live WS Connected' : 'Connecting...'}</span>
            </div>
            <div className="hidden xl:block text-right text-xs text-slate-400 font-mono">
              {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
