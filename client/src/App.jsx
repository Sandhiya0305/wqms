import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TelemetryProvider } from './context/TelemetryContext';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginModal from './components/auth/LoginModal';

import OverviewView from './components/views/OverviewView';
import StationDetailsView from './components/views/StationDetailsView';
import AlertsTriageView from './components/views/AlertsTriageView';
import SimulationView from './components/views/SimulationView';
import CitizenPortalView from './components/views/CitizenPortalView';
import HardwareSetupView from './components/views/HardwareSetupView';
import MapView from './components/views/MapView';
import RiskComplianceView from './components/views/RiskComplianceView';
import ReportsView from './components/views/ReportsView';

function MainLayout() {
  const { currentUser, isCitizen } = useAuth();
  const [activeView, setActiveView] = useState(() => isCitizen ? 'citizen_home' : 'overview');
  const [searchQuery, setSearchQuery] = useState('');

  // When role changes, switch view to appropriate default
  useEffect(() => {
    if (isCitizen) {
      setActiveView('citizen_home');
    } else {
      setActiveView(currentUser?.defaultView || 'overview');
    }
  }, [currentUser?.id, isCitizen]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased overflow-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Dark Navy Sidebar from Image */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {activeView === 'overview' && <OverviewView setActiveView={setActiveView} />}
            {activeView === 'stations' && <StationDetailsView setActiveView={setActiveView} />}
            {activeView === 'alerts' && <AlertsTriageView setActiveView={setActiveView} />}
            {activeView === 'simulation' && <SimulationView setActiveView={setActiveView} />}
            {activeView === 'hardware' && <HardwareSetupView setActiveView={setActiveView} />}
            {activeView === 'map' && <MapView setActiveView={setActiveView} />}
            {activeView === 'telemetry' && <StationDetailsView setActiveView={setActiveView} />}
            {activeView === 'risk' && <RiskComplianceView setActiveView={setActiveView} />}
            {activeView === 'reports' && <ReportsView setActiveView={setActiveView} />}
            {activeView === 'settings' && <HardwareSetupView setActiveView={setActiveView} />}

            {/* Citizen Views */}
            {(activeView.startsWith('citizen')) && (
              <CitizenPortalView setActiveView={setActiveView} />
            )}
          </div>
        </main>
      </div>

      {/* Mock Login / Role Switcher Modal */}
      <LoginModal />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TelemetryProvider>
        <MainLayout />
      </TelemetryProvider>
    </AuthProvider>
  );
}
