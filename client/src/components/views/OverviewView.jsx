import React from 'react';
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  TrendingUp, 
  Activity, 
  Bell, 
  Cpu, 
  ArrowUpRight,
  MapPin
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import StationMap from '../authority/StationMap';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function OverviewView({ setActiveView }) {
  const { stations, latestTelemetry, activeAlerts } = useTelemetry();
  const { selectedCity, setSelectedCity } = useAuth();
  const { isDark } = useTheme();

  const cityStations = stations.filter(s => !selectedCity || s.city === selectedCity);

  const safeCount = cityStations.filter(s => {
    const wqi = latestTelemetry[s.id]?.wqi_score || 20;
    return wqi <= 50;
  }).length;

  const cautionCount = cityStations.filter(s => {
    const wqi = latestTelemetry[s.id]?.wqi_score || 20;
    return wqi > 50 && wqi <= 75;
  }).length;

  const criticalCount = cityStations.filter(s => {
    const wqi = latestTelemetry[s.id]?.wqi_score || 20;
    return wqi > 75;
  }).length;

  const cityAlerts = activeAlerts.filter(a => {
    const st = stations.find(s => s.id === a.station_id);
    return !selectedCity || (st && st.city === selectedCity);
  });

  const criticalAlertsCount = cityAlerts.filter(a => a.severity === 'CRITICAL').length;

  const mock7DayTrend = [
    { date: 'Mon', wqi: 82.5 },
    { date: 'Tue', wqi: 83.2 },
    { date: 'Wed', wqi: 84.0 },
    { date: 'Thu', wqi: 82.8 },
    { date: 'Fri', wqi: 85.5 },
    { date: 'Sat', wqi: 86.1 },
    { date: 'Sun', wqi: 85.4 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Title & City Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Municipal Command Center • {selectedCity}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Water Quality Intelligence Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Continuous automated telemetry and health surveillance across {selectedCity}
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold shrink-0">
          {['Trichy', 'Chennai', 'Bengaluru', 'Madurai'].map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                selectedCity === city
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Top KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Stations */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Monitored Stations</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono mt-1">
              {cityStations.length}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>All stations live</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Safe Quality */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Safe Drinking Water</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              {safeCount}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              {cityStations.length > 0 ? Math.round((safeCount / cityStations.length) * 100) : 100}% of stations
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Moderate / At Risk */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Filter Advised</span>
            <div className="text-2xl font-black text-amber-500 font-mono mt-1">
              {cautionCount}
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
              Slight parameter variance
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Critical / Boil Water */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Boil Water Advisories</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
              {criticalCount}
            </div>
            <div className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
              Active precautions
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Grid: Left Map + Right Trend & Health Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Water Quality Map Card */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Live Water Quality GIS Map ({selectedCity})
              </h3>
              <span 
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline" 
                onClick={() => setActiveView('map')}
              >
                Open Fullscreen GIS Map &gt;
              </span>
            </div>
            
            <StationMap />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Safe Tap Water
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Filter Recommended
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span> Boil Water Alert
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Real-time IoT Feed</span>
          </div>
        </div>

        {/* Right Column: 7-Day Trend + Sensor Health + Active Alerts */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* WQI Trend */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  7-Day Cleanliness Trend ({selectedCity})
                </h3>
                <span className="text-xs text-slate-400">Municipal Drinking Water Index</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 flex items-center justify-end gap-1">
                  <span>85.4%</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">Good</span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-end gap-0.5 mt-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +1.4% improvement
                </div>
              </div>
            </div>

            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mock7DayTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wqiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[60, 100]} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      color: isDark ? '#fff' : '#000', 
                      borderRadius: '12px', 
                      fontSize: '11px' 
                    }}
                    formatter={(val) => [`${val}%`, 'Cleanliness Score']}
                  />
                  <Area type="monotone" dataKey="wqi" stroke="#2563eb" strokeWidth={2.5} fill="url(#wqiGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Split: Sensor Fleet Health (left) + Active Alerts (right) */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Sensor Fleet Health Card */}
            <div 
              onClick={() => setActiveView('hardware')}
              className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition"
            >
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Fleet Health</span>
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-500"
                      strokeDasharray="96, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute font-mono font-bold text-xs text-slate-800 dark:text-slate-200">96%</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{cityStations.length}/{cityStations.length} live</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Calibrated probes</div>
                </div>
              </div>
            </div>

            {/* Active Alerts Card */}
            <div 
              onClick={() => setActiveView('alerts')}
              className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm cursor-pointer hover:border-rose-400 dark:hover:border-rose-500 transition"
            >
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Active Alerts</span>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shrink-0">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-lg font-black font-mono text-slate-900 dark:text-slate-100">{cityAlerts.length}</div>
                  <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">{criticalAlertsCount} critical</div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
