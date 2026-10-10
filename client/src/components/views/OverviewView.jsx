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
  ArrowUpRight 
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import StationMap from '../authority/StationMap';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function OverviewView({ setActiveView }) {
  const { stations, latestTelemetry, activeAlerts } = useTelemetry();

  // Compute live stat metrics
  const totalStations = stations.length > 0 ? stations.length : 24;
  const criticalCount = activeAlerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = activeAlerts.filter(a => a.severity === 'WARNING').length;

  const mock7DayTrend = [
    { date: 'Apr 22', wqi: 79.5 },
    { date: 'Apr 23', wqi: 81.2 },
    { date: 'Apr 24', wqi: 83.0 },
    { date: 'Apr 25', wqi: 80.8 },
    { date: 'Apr 26', wqi: 82.5 },
    { date: 'Apr 27', wqi: 84.1 },
    { date: 'Apr 28', wqi: 82.4 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Water Quality Overview</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Real-time monitoring across all water sources</p>
      </div>

      {/* 4 Top KPI Stat Cards matching Image Screen 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Stations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Stations</span>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">24</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>2 offline</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Safe Quality */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Safe Quality</span>
            <div className="text-2xl font-black text-emerald-600 font-mono mt-1">18</div>
            <div className="text-xs text-emerald-600 font-medium mt-1">
              75% of stations
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* At Risk */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">At Risk</span>
            <div className="text-2xl font-black text-amber-500 font-mono mt-1">4</div>
            <div className="text-xs text-amber-600 font-medium mt-1">
              17% of stations
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Critical */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Critical</span>
            <div className="text-2xl font-black text-rose-600 font-mono mt-1">2</div>
            <div className="text-xs text-rose-600 font-medium mt-1">
              8% of stations
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Grid: Left Map + Right Trend & Health Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Water Quality Map Card */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Water Quality Map</h3>
              <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => setActiveView('map')}>
                View Full Map &gt;
              </span>
            </div>
            
            {/* Embedded GIS Leaflet Map */}
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <StationMap />
            </div>
          </div>

          {/* Map Legend matching Image 1 */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Safe
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Moderate
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> At Risk
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span> Critical
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Updated: Just now</span>
          </div>
        </div>

        {/* Right Column: 7-Day WQI Trend + Sensor Fleet Health + Active Alerts */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* WQI Trend (Last 7 Days) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">WQI Trend (Last 7 Days)</h3>
                <span className="text-xs text-slate-400">Network Average Cleanliness</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold font-mono text-slate-900 flex items-center justify-end gap-1">
                  <span>82.4</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Good</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-medium flex items-center justify-end gap-0.5 mt-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +1.2% this week
                </div>
              </div>
            </div>

            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mock7DayTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wqiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[60, 100]} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(val) => [`${val} WQI`, 'Avg Quality']}
                  />
                  <Area type="monotone" dataKey="wqi" stroke="#0284c7" strokeWidth={2.5} fill="url(#wqiGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Split: Sensor Fleet Health (left) + Active Alerts (right) */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Sensor Fleet Health Ring Card */}
            <div 
              onClick={() => setActiveView('hardware')}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm cursor-pointer hover:border-blue-300 transition"
            >
              <span className="text-xs font-bold text-slate-700 block mb-2">Sensor Fleet Health</span>
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-500"
                      strokeDasharray="92, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute font-mono font-bold text-xs text-slate-800">92%</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">22/24 online</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">2 pending calibration</div>
                </div>
              </div>
            </div>

            {/* Active Alerts Card */}
            <div 
              onClick={() => setActiveView('alerts')}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm cursor-pointer hover:border-rose-300 transition"
            >
              <span className="text-xs font-bold text-slate-700 block mb-2">Active Alerts</span>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-lg font-black font-mono text-slate-900">6</div>
                  <div className="text-[10px] text-rose-600 font-semibold">2 critical</div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
