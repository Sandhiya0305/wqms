import React from 'react';
import { Search, Bell, MapPin, Radio, UserCheck, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTelemetry } from '../../context/TelemetryContext';

export default function Header({ searchQuery, setSearchQuery }) {
  const { currentUser, setIsAuthModalOpen, isCitizen } = useAuth();
  const { connected, activeAlerts } = useTelemetry();

  const activeAlertCount = activeAlerts.filter(a => a.status !== 'RESOLVED').length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      
      {/* Search Input Bar */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isCitizen ? "Search your area or station..." : "Search stations, alerts, or location..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Right Controls: City Selector, WS Status, Bell, Profile */}
      <div className="flex items-center gap-4">
        
        {/* City Selector */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>Bengaluru</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </div>

        {/* Live IoT WebSocket connection dot */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <Radio className={`w-3.5 h-3.5 ${connected ? 'text-emerald-500 animate-pulse' : 'text-rose-500'}`} />
          <span className="hidden md:inline text-[11px] font-mono">{connected ? 'Live IoT Stream' : 'Connecting...'}</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative cursor-pointer p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition">
          <Bell className="w-4 h-4" />
          {activeAlertCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 animate-ping" />
          )}
        </div>

        {/* User Profile Pill from Image: [ (R)  R. Sharma / Municipal Engineer ] */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition text-left"
        >
          <div className={`w-8 h-8 rounded-full ${currentUser?.avatarBg || 'bg-slate-900'} text-white font-bold text-xs flex items-center justify-center shadow-sm`}>
            {currentUser?.avatar || 'R'}
          </div>

          <div className="hidden md:block">
            <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
              <span>{currentUser?.name || 'R. Sharma'}</span>
            </div>
            <div className="text-[10px] text-slate-500 leading-tight">
              {currentUser?.title || 'Municipal Engineer'}
            </div>
          </div>

          <span className="hidden lg:inline text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold border border-blue-200/60 ml-1">
            Switch Role
          </span>
        </button>

      </div>
    </header>
  );
}
