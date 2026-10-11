import React from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Droplet, 
  Thermometer, 
  Activity, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function StationDetailsView({ setActiveView }) {
  const { stations, selectedStationId, setSelectedStationId, latestTelemetry } = useTelemetry();
  const { selectedCity } = useAuth();
  const { isDark } = useTheme();

  const cityStations = stations.filter(s => !selectedCity || s.city === selectedCity);
  const currentStation = cityStations.find(s => s.id === selectedStationId) || cityStations[0] || stations[0];
  const tel = latestTelemetry[currentStation?.id] || {};

  // Current readings table data
  const readings = [
    { name: 'Water Clarity (Turbidity)', value: tel.turbidity ?? 1.8, unit: 'NTU', status: 'Clear', icon: Activity },
    { name: 'Acidity (pH)', value: tel.ph ?? 7.3, unit: 'pH', status: 'Balanced', icon: Droplet },
    { name: 'Disinfection Barrier', value: tel.chlorine ?? 0.8, unit: 'mg/L', status: 'Protected', icon: ShieldCheck },
    { name: 'Mineral Content (TDS)', value: tel.tds ?? 190, unit: 'ppm', status: 'Normal', icon: Zap },
    { name: 'Dissolved Oxygen', value: tel.dissolved_oxygen ?? 7.4, unit: 'mg/L', status: 'Good', icon: Droplet },
    { name: 'Water Temperature', value: tel.temperature ?? 26.5, unit: '°C', status: 'Normal', icon: Thermometer },
  ];

  // 24h multi-line trend mock for Recharts
  const trendData = [
    { time: '00:00', ph: 7.2, turbidity: 1.7, tds: 185 },
    { time: '04:00', ph: 7.3, turbidity: 1.8, tds: 188 },
    { time: '08:00', ph: 7.4, turbidity: 2.1, tds: 192 },
    { time: '12:00', ph: 7.3, turbidity: 1.9, tds: 190 },
    { time: '16:00', ph: 7.2, turbidity: 1.8, tds: 189 },
    { time: '20:00', ph: 7.3, turbidity: 1.8, tds: 191 },
    { time: 'Now', ph: tel.ph || 7.3, turbidity: tel.turbidity || 1.8, tds: tel.tds || 190 },
  ];

  const wqiScore = 100 - Math.min(100, tel.wqi_score ?? 20);

  return (
    <div className="space-y-6">
      
      {/* Station Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => setActiveView('overview')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Command Overview</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Station Telemetry & Diagnostics
          </h1>
        </div>

        {/* Station Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Select Station:</span>
          <select
            value={currentStation?.id}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="px-3 py-2 rounded-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {cityStations.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.district})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Station Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {currentStation?.name}
            </h2>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-none border border-emerald-300 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse"></span> Telemetry Online
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {currentStation?.district} • {currentStation?.city} • Latitude: <span className="font-mono">{currentStation?.latitude}</span> • Longitude: <span className="font-mono">{currentStation?.longitude}</span>
          </p>
        </div>

        <button 
          onClick={() => setActiveView('map')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-none border border-slate-300 dark:border-slate-700 transition shrink-0 cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>View on GIS Map</span>
        </button>
      </div>

      {/* 3 Main Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Card 1: Current Readings Table */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              Real-time Sensor Readings
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {readings.map((r, i) => {
                const Icon = r.icon;
                return (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      {r.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{r.value}</span>
                      <span className="text-[11px] text-slate-400 font-mono w-8">{r.unit}</span>
                      <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        {r.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 font-mono">
            Direct IoT transmission • 3-second intervals
          </div>
        </div>

        {/* Card 2: Cleanliness Score Gauge */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-between text-center">
          <div className="w-full text-left">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-200 dark:border-slate-800">
              Cleanliness Score
            </h3>
          </div>

          <div className="my-4 relative w-36 h-36 flex items-center justify-center">
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray={`${wqiScore}, 100`}
                strokeWidth="3.2"
                strokeLinecap="butt"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black font-mono text-slate-900 dark:text-slate-100">{wqiScore}%</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Potable</span>
            </div>
          </div>

          <div className="w-full">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">WHO & BIS Drinking Standard</p>
            <button 
              onClick={() => setActiveView('reports')}
              className="w-full py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-none border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            >
              Export Station Audit
            </button>
          </div>
        </div>

        {/* Card 3: Real-time Multi-line Trend */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Live Trend</h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-none border border-slate-200 dark:border-slate-700 font-mono">
              24-Hour Cycle
            </span>
          </div>

          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0f172a' : '#fff', 
                    color: isDark ? '#fff' : '#000', 
                    borderRadius: '0px', 
                    fontSize: '11px',
                    borderColor: isDark ? '#334155' : '#cbd5e1'
                  }} 
                />
                <Line type="monotone" dataKey="ph" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="turbidity" stroke="#d97706" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Turbidity & pH Linearity</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Stable</span>
          </div>
        </div>

      </div>

    </div>
  );
}
