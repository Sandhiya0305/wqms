import React, { useState } from 'react';
import { 
  MapPin, 
  Radio, 
  Sun, 
  Moon, 
  LogOut, 
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTelemetry } from '../../context/TelemetryContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const viewTitles = {
  overview: 'Overview',
  map: 'Station map',
  stations: 'Stations',
  alerts: 'Alerts',
  thresholds: 'Thresholds',
  reports: 'Reports',
  hardware: 'Fleet health',
  calibration: 'Probe calibration',
  health_advisories: 'Advisories',
  citizen_tracker: 'Citizen reports',
  citizen_home: 'Water status',
  citizen_map: 'Safety map',
  citizen_report: 'Report a problem',
  citizen_advisories: 'Advisories'
};

export default function Header({ activeView }) {
  const { currentUser, logout, selectedCity, setSelectedCity } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { connected } = useTelemetry();
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  const availableCities = ['Trichy', 'Chennai', 'Bengaluru', 'Madurai'];

  return (
    <header className="h-16 bg-white dark:bg-[#172033] border-b border-slate-200 dark:border-slate-700/70 px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {currentUser?.roleLabel}
        </p>
        <h1 className="text-sm font-semibold text-slate-900 dark:text-white">
          {viewTitles[activeView] || 'WaterGuard'}
        </h1>
      </div>

      {/* Right Controls - Boxy */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* City Selector Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{selectedCity}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </Button>

          {cityDropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-md py-1 z-50 text-xs">
              {availableCities.map(city => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    setCityDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 font-medium transition cursor-pointer ${
                    selectedCity === city
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live IoT Status */}
        <Badge variant={connected ? 'success' : 'danger'} className="hidden md:inline-flex gap-1.5 px-2.5 py-1.5">
          <Radio className={`w-3.5 h-3.5 ${connected ? 'text-blue-600' : 'text-red-500'}`} />
          {connected ? 'Live data' : 'Offline'}
        </Badge>

        {/* Theme Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          className="justify-center"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </Button>

        {/* User Card */}
        <div className="flex items-center gap-2 pl-2 pr-1 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
          <div className="w-6 h-6 bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
            {currentUser?.avatar || 'U'}
          </div>
        </div>

        {/* Identity Text */}
        <div className="hidden lg:block text-left pr-1">
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
            {currentUser?.name}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight font-mono">
            {currentUser?.roleLabel}
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="icon"
          className="justify-center"
          onClick={logout}
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

    </header>
  );
}
