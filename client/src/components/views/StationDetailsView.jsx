import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  Droplet, 
  Thermometer, 
  Activity, 
  ShieldCheck, 
  Zap, 
  AlertTriangle 
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function StationDetailsView({ setActiveView }) {
  const { stations, selectedStationId, setSelectedStationId, latestTelemetry, stationHistories } = useTelemetry();
  const [activeSubTab, setActiveSubTab] = useState('Overview');

  const currentStation = stations.find(s => s.id === selectedStationId) || stations[0];
  const tel = latestTelemetry[currentStation?.id] || {};
  const history = stationHistories[currentStation?.id] || [];

  const subTabs = ['Overview', 'Telemetry', 'WQI & Risk', 'Alerts', 'History'];

  // Current readings table data
  const readings = [
    { name: 'pH', value: tel.ph ?? 7.4, unit: 'pH', status: 'Normal', icon: Droplet },
    { name: 'Turbidity', value: tel.turbidity_ntu ?? 3.2, unit: 'NTU', status: 'Normal', icon: Activity },
    { name: 'Temperature', value: tel.temp_c ?? 24.8, unit: '°C', status: 'Normal', icon: Thermometer },
    { name: 'TDS', value: tel.tds_ppm ?? 142, unit: 'ppm', status: 'Normal', icon: Zap },
    { name: 'Dissolved Oxygen', value: tel.do_mg_l ?? 8.1, unit: 'mg/L', status: 'Normal', icon: ShieldCheck },
    { name: 'Chlorine', value: '0.6', unit: 'mg/L', status: 'Normal', icon: Droplet },
  ];

  // 24h multi-line trend mock for Recharts
  const trendData = [
    { time: '00:00', ph: 7.3, turbidity: 2.8, tds: 140, temp: 23.5 },
    { time: '04:00', ph: 7.4, turbidity: 3.0, tds: 142, temp: 22.8 },
    { time: '08:00', ph: 7.5, turbidity: 3.4, tds: 145, temp: 24.2 },
    { time: '12:00', ph: 7.4, turbidity: 3.2, tds: 142, temp: 25.4 },
    { time: '16:00', ph: 7.3, turbidity: 3.1, tds: 141, temp: 25.1 },
    { time: '20:00', ph: 7.4, turbidity: 3.3, tds: 143, temp: 24.0 },
    { time: '24:00', ph: 7.4, turbidity: 3.2, tds: 142, temp: 23.8 },
  ];

  const wqiScore = tel.wqi_score ?? 86;

  return (
    <div className="space-y-6">
      
      {/* Breadcrumb */}
      <div>
        <button 
          onClick={() => setActiveView('overview')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Stations</span>
        </button>
      </div>

      {/* Station Header Card from Image 2 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Station Photo Thumbnail */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150&auto=format&fit=crop&q=80" 
              alt="Riverside Water Body" 
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {currentStation?.name || 'Riverside Monitoring Station'}
              </h2>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {currentStation?.district || 'Riverside River'} • Latitude: <span className="font-mono text-slate-700">{currentStation?.latitude || 12.9716}</span> • Longitude: <span className="font-mono text-slate-700">{currentStation?.longitude || 77.5946}</span>
            </p>
          </div>
        </div>

        {/* View on Map Button */}
        <button 
          onClick={() => setActiveView('map')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition shrink-0"
        >
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>View on Map</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-semibold">
        {subTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-3 transition relative ${
              activeSubTab === tab 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3 Main Cards Grid from Image 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Card 1: Current Readings Table (3.5 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Current Readings</h3>
            <div className="divide-y divide-slate-100">
              {readings.map((r, i) => {
                const Icon = r.icon;
                return (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-600 font-medium">
                      <Icon className="w-3.5 h-3.5 text-blue-500" />
                      {r.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-slate-900">{r.value}</span>
                      <span className="text-[11px] text-slate-400 font-mono w-8">{r.unit}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                        {r.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Last reading updated 4s ago via ESP32 telemetry
          </div>
        </div>

        {/* Card 2: Circular WQI Gauge (3.5 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-between text-center">
          <div className="w-full text-left">
            <h3 className="text-sm font-bold text-slate-900">WQI</h3>
          </div>

          {/* Large Circular Gauge */}
          <div className="my-4 relative w-36 h-36 flex items-center justify-center">
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray="86, 100"
                strokeWidth="3.2"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black font-mono text-slate-900">{wqiScore}</span>
              <span className="text-xs font-bold text-emerald-600">Good</span>
            </div>
          </div>

          <div className="w-full">
            <p className="text-[11px] text-slate-500 mb-3">WQI based on WHO & BIS standards</p>
            <button 
              onClick={() => setActiveView('risk')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-blue-600 text-xs font-semibold rounded-xl border border-slate-200 transition"
            >
              View Details &gt;
            </button>
          </div>
        </div>

        {/* Card 3: Real-time Trend Last 24 Hours (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">Real-time Trend</h3>
            <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              Last 24 hours
            </span>
          </div>

          {/* Parameter Legend */}
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 mb-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> pH</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Turbidity</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> TDS</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Temperature</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="ph" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="turbidity" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Nominal Range: Optimal</span>
            <span>Sensor Drift: None</span>
          </div>
        </div>

      </div>

    </div>
  );
}
