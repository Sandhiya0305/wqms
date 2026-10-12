import React, { useState } from 'react';
import { 
  Search, 
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

export default function Header({ searchQuery, setSearchQuery }) {
  const { currentUser, logout, selectedCity, setSelectedCity, isCitizen } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { connected, activeAlerts } = useTelemetry();
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  const availableCities = ['Trichy', 'Chennai', 'Bengaluru', 'Madurai'];

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 px-5 flex items-center justify-between sticky top-0 z-20">
      
      {/* Search Input Bar - Boxy */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isCitizen ? "Search neighborhood in " + selectedCity + "..." : "Search stations, alerts, or parameters..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 pl-9 pr-3 py-1.5 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>
      </div>

      {/* Right Controls - Boxy */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* City Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-500 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{selectedCity}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

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
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-mono">
          <Radio className={`w-3.5 h-3.5 ${connected ? 'text-blue-600' : 'text-red-500'}`} />
          <span className="text-[11px]">{connected ? 'Live' : 'Offline'}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

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
        <button
          onClick={logout}
          title="Log out"
          className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

    </header>
  );
}
