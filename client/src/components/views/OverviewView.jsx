import React from 'react';
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Bell, 
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
    <div className="space-y-4 font-sans">
      
      {/* Top Bar - Boxy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>Command Center • {selectedCity}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Water Quality Overview
          </h1>
        </div>

        {/* City Filter Tabs - Boxy */}
        <div className="flex items-center border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold">
          {['Trichy', 'Chennai', 'Bengaluru', 'Madurai'].map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 transition cursor-pointer border-r last:border-r-0 border-slate-300 dark:border-slate-700 ${
                selectedCity === city
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Stat Cards - Boxy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Total Stations */}
        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-300 dark:border-slate-800 flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Stations</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">
              {cityStations.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Active in {selectedCity}
            </div>
          </div>
          <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* Safe Quality */}
        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-300 dark:border-slate-800 flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Safe Potable</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              {safeCount}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1">
              WQI &lt; 50 (Meets Standards)
            </div>
          </div>
          <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Filter Recommended */}
        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-300 dark:border-slate-800 flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Filter Recommended</span>
            <div className="text-2xl font-bold text-amber-500 font-mono mt-1">
              {cautionCount}
            </div>
            <div className="text-[11px] text-amber-600 mt-1">
              WQI 50-75 (Moderate)
            </div>
          </div>
          <div className="w-8 h-8 bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        {/* Boil Advisories */}
        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-300 dark:border-slate-800 flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Boil Notices</span>
            <div className="text-2xl font-bold text-red-600 font-mono mt-1">
              {criticalCount}
            </div>
            <div className="text-[11px] text-red-600 mt-1">
              WQI &gt; 75 (Critical)
            </div>
          </div>
          <div className="w-8 h-8 bg-red-50 dark:bg-red-950 text-red-600 flex items-center justify-center">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Main Grid: Left Map + Right Trend & Alerts - Boxy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Water Quality Map Card - Boxy */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-4 border border-slate-300 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Geospatial Network ({selectedCity})
              </h3>
              <span 
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline" 
                onClick={() => setActiveView('map')}
              >
                Expand Map &gt;
              </span>
            </div>
            
            <StationMap />
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Sensors updating via IoT stream</span>
            <span className="font-mono text-[11px] text-blue-600">3s interval</span>
          </div>
        </div>

        {/* Right Column: 7-Day Trend + Active Alerts - Boxy */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Trend Chart - Boxy */}
          <div className="bg-white dark:bg-slate-900 p-4 border border-slate-300 dark:border-slate-800 flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  7-Day Quality Trend
                </h3>
                <span className="text-[11px] text-slate-500">Average WQI Score</span>
              </div>
              <div className="text-right">
                <span className="text-base font-bold font-mono text-blue-600">85.4%</span>
                <span className="text-[10px] text-emerald-600 font-bold block">+1.4% change</span>
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
                      borderColor: isDark ? '#334155' : '#cbd5e1',
                      color: isDark ? '#fff' : '#000', 
                      borderRadius: '0px', 
                      fontSize: '11px' 
                    }}
                    formatter={(val) => [`${val}%`, 'WQI']}
                  />
                  <Area type="monotone" dataKey="wqi" stroke="#2563eb" strokeWidth={2} fill="url(#wqiGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Row - Boxy */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Fleet Health */}
            <div 
              onClick={() => setActiveView('hardware')}
              className="bg-white dark:bg-slate-900 p-3 border border-slate-300 dark:border-slate-800 cursor-pointer hover:border-blue-500"
            >
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Fleet Status</span>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                {cityStations.length}/{cityStations.length}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold">All Probes Online</div>
            </div>

            {/* Alerts */}
            <div 
              onClick={() => setActiveView('alerts')}
              className="bg-white dark:bg-slate-900 p-3 border border-slate-300 dark:border-slate-800 cursor-pointer hover:border-red-500"
            >
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Active Alerts</span>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                {cityAlerts.length}
              </div>
              <div className="text-[10px] text-red-600 font-bold">{criticalAlertsCount} Critical</div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
