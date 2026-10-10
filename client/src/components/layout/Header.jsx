import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  MapPin, 
  Radio, 
  Sun, 
  Moon, 
  LogOut, 
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTelemetry } from '../../context/TelemetryContext';

export default function Header({ searchQuery, setSearchQuery }) {
  const { currentUser, logout, selectedCity, setSelectedCity, isCitizen } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { connected, activeAlerts } = useTelemetry();
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  const activeAlertCount = activeAlerts.filter(a => a.status !== 'RESOLVED').length;
  const availableCities = ['Trichy', 'Chennai', 'Bengaluru', 'Madurai'];

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm transition-colors duration-200">
      
      {/* Search Input Bar */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isCitizen ? "Search your neighborhood in " + selectedCity + "..." : "Search stations, alerts, or water parameters..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/70 focus:bg-white dark:focus:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* City Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-400 transition cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{selectedCity} District</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {cityDropdownOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs animate-in fade-in">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Municipal Area
              </div>
              {availableCities.map(city => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    setCityDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 font-medium flex items-center justify-between transition ${
                    selectedCity === city
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{city}</span>
                  {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live IoT WebSocket dot */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
          <Radio className={`w-3.5 h-3.5 ${connected ? 'text-emerald-500 animate-pulse' : 'text-rose-500'}`} />
          <span className="text-[11px] font-mono">{connected ? 'Live IoT Stream' : 'Connecting...'}</span>
        </div>

        {/* Theme Toggle (Sun/Moon) */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Card Pill */}
        <div className="flex items-center gap-2.5 pl-2 pr-2 py-1 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <div className={`w-8 h-8 rounded-full ${currentUser?.avatarBg || 'bg-blue-600'} text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0`}>
            {currentUser?.avatar || 'U'}
          </div>

          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {currentUser?.name || 'Authorized User'}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              {currentUser?.roleLabel || 'Operator'}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Log Out & Switch User"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition ml-1 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
