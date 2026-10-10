import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine, 
  AreaChart, 
  Area 
} from 'recharts';
import { useTelemetry } from '../../context/TelemetryContext';
import { Activity, ShieldCheck, Thermometer, Droplet, Zap, AlertCircle } from 'lucide-react';

const PARAMETERS = [
  { key: 'wqi_score', name: 'Water Quality Index', unit: 'WQI', color: '#38bdf8', minLimit: null, maxLimit: 50, criticalLimit: 75, icon: Activity },
  { key: 'ph', name: 'pH Balance', unit: 'pH', color: '#a855f7', minLimit: 6.5, maxLimit: 8.5, criticalLimit: null, icon: Droplet },
  { key: 'turbidity_ntu', name: 'Turbidity', unit: 'NTU', color: '#f59e0b', minLimit: null, maxLimit: 5.0, criticalLimit: 15.0, icon: AlertCircle },
  { key: 'do_mg_l', name: 'Dissolved Oxygen', unit: 'mg/L', color: '#10b981', minLimit: 5.0, maxLimit: null, criticalLimit: 3.5, icon: ShieldCheck },
  { key: 'tds_ppm', name: 'Total Dissolved Solids', unit: 'ppm', color: '#ec4899', minLimit: null, maxLimit: 500, criticalLimit: 1000, icon: Zap },
  { key: 'temp_c', name: 'Water Temperature', unit: '°C', color: '#f97316', minLimit: null, maxLimit: 30, criticalLimit: null, icon: Thermometer },
];

export default function TelemetryCharts() {
  const { selectedStationId, stationHistories, stations } = useTelemetry();
  const [selectedParamKey, setSelectedParamKey] = useState('wqi_score');

  const history = stationHistories[selectedStationId] || [];
  const activeStation = stations.find(s => s.id === selectedStationId);
  const currentParam = PARAMETERS.find(p => p.key === selectedParamKey) || PARAMETERS[0];

  // Format data points for chart
  const formattedData = history.map(item => {
    const time = new Date(item.timestamp);
    return {
      ...item,
      timeLabel: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      dateLabel: time.toLocaleDateString([], { month: 'short', day: 'numeric' })
    };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">Time-Series Telemetry Analysis</h3>
            <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono">
              {activeStation?.name || selectedStationId}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Live sub-second streaming with WHO/BIS standard reference thresholds</p>
        </div>

        {/* Parameter Selector Pills */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          {PARAMETERS.map(param => {
            const Icon = param.icon;
            const isSelected = selectedParamKey === param.key;
            return (
              <button
                key={param.key}
                onClick={() => setSelectedParamKey(param.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{param.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-5 h-[320px] w-full">
        {formattedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Waiting for telemetry data points...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad_${currentParam.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentParam.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={currentParam.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              
              <XAxis 
                dataKey="timeLabel" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
              />
              
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                domain={['auto', 'auto']}
                unit={` ${currentParam.unit}`}
              />

              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '10px', 
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}
                formatter={(val) => [`${val} ${currentParam.unit}`, currentParam.name]}
                labelFormatter={(lbl) => `Recorded: ${lbl}`}
              />

              {/* Standard Limits Reference Lines */}
              {currentParam.maxLimit && (
                <ReferenceLine 
                  y={currentParam.maxLimit} 
                  stroke="#ef4444" 
                  strokeDasharray="4 4" 
                  label={{ value: `Max Permissible (${currentParam.maxLimit})`, fill: '#ef4444', fontSize: 10, position: 'top' }} 
                />
              )}

              {currentParam.minLimit && (
                <ReferenceLine 
                  y={currentParam.minLimit} 
                  stroke="#f59e0b" 
                  strokeDasharray="4 4" 
                  label={{ value: `Min Threshold (${currentParam.minLimit})`, fill: '#f59e0b', fontSize: 10, position: 'bottom' }} 
                />
              )}

              <Area 
                type="monotone" 
                dataKey={currentParam.key} 
                stroke={currentParam.color} 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill={`url(#grad_${currentParam.key})`} 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Guide Footer */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>Active Metric: <strong className="text-slate-200">{currentParam.name} ({currentParam.unit})</strong></span>
          {currentParam.maxLimit && <span>WHO Standard Ceiling: <span className="text-rose-400 font-mono">{currentParam.maxLimit} {currentParam.unit}</span></span>}
          {currentParam.minLimit && <span>WHO Standard Floor: <span className="text-amber-400 font-mono">{currentParam.minLimit} {currentParam.unit}</span></span>}
        </div>
        <div className="text-[11px] text-slate-400">
          Showing last {formattedData.length} readings (Auto-scrolling)
        </div>
      </div>
    </div>
  );
}
