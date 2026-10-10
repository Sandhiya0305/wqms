import React, { useState } from 'react';
import { TelemetryProvider } from './context/TelemetryContext';
import Navbar from './components/common/Navbar';
import AuthorityDashboard from './components/authority/AuthorityDashboard';
import CitizenPortal from './components/citizen/CitizenPortal';
import SimulatorControl from './components/simulator/SimulatorControl';

export default function App() {
  const [activeTab, setActiveTab] = useState('authority');

  return (
    <TelemetryProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'authority' && <AuthorityDashboard />}
          {activeTab === 'citizen' && <CitizenPortal />}
          {activeTab === 'simulator' && <SimulatorControl />}
        </main>

        <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-xs text-slate-500 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-slate-400">AquaIntel Water Quality Monitoring & Risk Intelligence Platform</span>
              <p className="text-[11px] text-slate-600 mt-0.5">Compliant with WHO Guidelines for Drinking-Water Quality (4th Ed) & BIS IS 10500:2012</p>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-mono">
              IoT Telemetry Ingestion • Aedes MQTT :1883 • WebSocket :3001
            </div>
          </div>
        </footer>
      </div>
    </TelemetryProvider>
  );
}
