import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TelemetryProvider } from './context/TelemetryContext';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginPage from './components/auth/LoginPage';

// Views
import OverviewView from './components/views/OverviewView';
import StationDetailsView from './components/views/StationDetailsView';
import AlertsTriageView from './components/views/AlertsTriageView';
import SimulationView from './components/views/SimulationView';
import HardwareSetupView from './components/views/HardwareSetupView';
import MapView from './components/views/MapView';
import ReportsView from './components/views/ReportsView';
import ThresholdCalibrationView from './components/views/ThresholdCalibrationView';
import HealthAdvisoriesManagerView from './components/views/HealthAdvisoriesManagerView';
import SensorCalibrationToolView from './components/views/SensorCalibrationToolView';

// Citizen Views
import CitizenHomeView from './components/views/CitizenHomeView';
import CitizenReportView from './components/views/CitizenReportView';
import CitizenTrackerView from './components/views/CitizenTrackerView';
import CitizenAdvisoriesView from './components/views/CitizenAdvisoriesView';

function MainLayout() {
  const { currentUser, isCitizen } = useAuth();
  const [activeView, setActiveView] = useState(() => currentUser?.defaultView || 'overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Switch default view when user changes
  useEffect(() => {
    if (currentUser) {
      setActiveView(currentUser.defaultView || 'overview');
    }
  }, [currentUser?.id]);

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-slate-800 dark:text-slate-100 font-sans antialiased overflow-hidden selection:bg-blue-600 selection:text-white transition-colors duration-200">
      
      {/* Sidebar with strictly filtered role items */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header with City Selector, Theme Toggle & Logout */}
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            
            {/* Common & Authority Views */}
            {activeView === 'overview' && <OverviewView setActiveView={setActiveView} />}
            {activeView === 'map' && <MapView setActiveView={setActiveView} />}
            {activeView === 'stations' && <StationDetailsView setActiveView={setActiveView} />}
            {activeView === 'alerts' && <AlertsTriageView setActiveView={setActiveView} />}
            {activeView === 'telemetry' && <StationDetailsView setActiveView={setActiveView} />}
            {activeView === 'reports' && <ReportsView setActiveView={setActiveView} />}
            {activeView === 'hardware' && <HardwareSetupView setActiveView={setActiveView} />}

            {/* Role-Exclusive Views */}
            {activeView === 'thresholds' && <ThresholdCalibrationView setActiveView={setActiveView} />}
            {activeView === 'simulation' && <SimulationView setActiveView={setActiveView} />}
            {activeView === 'health_advisories' && <HealthAdvisoriesManagerView setActiveView={setActiveView} />}
            {activeView === 'calibration' && <SensorCalibrationToolView setActiveView={setActiveView} />}
            {activeView === 'citizen_tracker' && <CitizenTrackerView setActiveView={setActiveView} />}

            {/* Citizen Portal Views */}
            {activeView === 'citizen_home' && <CitizenHomeView setActiveView={setActiveView} />}
            {activeView === 'citizen_map' && <MapView setActiveView={setActiveView} />}
            {activeView === 'citizen_report' && <CitizenReportView setActiveView={setActiveView} />}
            {activeView === 'citizen_advisories' && <CitizenAdvisoriesView setActiveView={setActiveView} />}

          </div>
        </main>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TelemetryProvider>
          <MainLayout />
        </TelemetryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
