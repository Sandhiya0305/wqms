import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  SlidersHorizontal, 
  Check, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  Send,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

export default function AlertsTriageView({ setActiveView }) {
  const { activeAlerts, acknowledgeAlert, resolveAlert } = useTelemetry();
  
  const [searchParam, setSearchParam] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [stationFilter, setStationFilter] = useState('ALL');
  const [activeModalAction, setActiveModalAction] = useState(null);

  // Seed table matching exact entries from Image 3
  const tableData = [
    {
      id: 1,
      time: 'Apr 28, 10:24',
      station: 'East Reservoir',
      parameter: 'Turbidity',
      value: '12.5 NTU',
      threshold: '> 5 NTU',
      severity: 'Critical',
      status: 'Open',
      action: 'Investigate'
    },
    {
      id: 2,
      time: 'Apr 28, 09:17',
      station: 'North Plant',
      parameter: 'Chlorine',
      value: '0.1 mg/L',
      threshold: '< 0.3 mg/L',
      severity: 'High',
      status: 'Open',
      action: 'Dispatch Team'
    },
    {
      id: 3,
      time: 'Apr 28, 08:42',
      station: 'West Tap',
      parameter: 'pH',
      value: '5.8',
      threshold: '< 6.5',
      severity: 'High',
      status: 'Open',
      action: 'Notify'
    },
    {
      id: 4,
      time: 'Apr 28, 07:56',
      station: 'Central WTP',
      parameter: 'TDS',
      value: '620 ppm',
      threshold: '> 500 ppm',
      severity: 'Medium',
      status: 'Acknowledged',
      action: 'Monitor'
    },
    {
      id: 5,
      time: 'Apr 28, 06:33',
      station: 'South Borewell',
      parameter: 'Nitrate',
      value: '58 mg/L',
      threshold: '> 45 mg/L',
      severity: 'Medium',
      status: 'Open',
      action: 'Investigate'
    },
    {
      id: 6,
      time: 'Apr 27, 22:11',
      station: 'Riverside',
      parameter: 'Turbidity',
      value: '18.7 NTU',
      threshold: '> 5 NTU',
      severity: 'Critical',
      status: 'Open',
      action: 'Dispatch Team'
    }
  ];

  const handleActionClick = (item) => {
    setActiveModalAction(item);
  };

  const executeTriageAction = () => {
    if (activeModalAction) {
      alert(`Action '${activeModalAction.action}' executed for ${activeModalAction.station}. Field teams notified.`);
      setActiveModalAction(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Top Right Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Alerts & Triage</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">View and manage water quality alerts across all stations</p>
        </div>

        <button
          onClick={() => setActiveView('simulation')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Simulation Controls</span>
        </button>
      </div>

      {/* Filter & Search Bar matching Image 3 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts, station or parameter..."
            value={searchParam}
            onChange={(e) => setSearchParam(e.target.value)}
            className="w-full bg-slate-50 pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Severity Filter Dropdown */}
        <div className="flex items-center gap-2">
          <select 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Severity</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
          </select>

          {/* Station Filter Dropdown */}
          <select 
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Stations</option>
            <option value="Riverside">Riverside</option>
            <option value="North Plant">North Plant</option>
            <option value="East Reservoir">East Reservoir</option>
            <option value="West Tap">West Tap</option>
            <option value="Central WTP">Central WTP</option>
            <option value="South Borewell">South Borewell</option>
          </select>

          {/* Date Range Picker */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Apr 21, 2025 - Apr 28, 2025</span>
          </div>
        </div>

      </div>

      {/* Alerts Table matching Image 3 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Station</th>
                <th className="py-3 px-4">Parameter</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableData.map((row) => {
                let sevBg = 'bg-amber-50 text-amber-600 border-amber-200';
                if (row.severity === 'Critical') sevBg = 'bg-rose-50 text-rose-600 border-rose-200';
                if (row.severity === 'High') sevBg = 'bg-orange-50 text-orange-600 border-orange-200';

                return (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-500 font-medium">{row.time}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.station}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{row.parameter}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{row.value}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{row.threshold}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sevBg}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {row.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        row.status === 'Acknowledged' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleActionClick(row)}
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-blue-600 font-semibold rounded-lg border border-blue-200 text-[11px] shadow-sm transition"
                      >
                        {row.action}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Showing 1 - 6 of 24 alerts</span>
          
          <div className="flex items-center gap-1 font-semibold">
            <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-7 h-7 rounded bg-blue-600 text-white font-bold flex items-center justify-center">1</button>
            <button className="w-7 h-7 rounded hover:bg-slate-100 text-slate-600 flex items-center justify-center">2</button>
            <button className="w-7 h-7 rounded hover:bg-slate-100 text-slate-600 flex items-center justify-center">3</button>
            <button className="p-1 rounded hover:bg-slate-100 text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Triage Modal */}
      {activeModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Execute Incident Action</h3>
            <p className="text-xs text-slate-500 mt-1">
              You are executing <strong>{activeModalAction.action}</strong> for {activeModalAction.station} on parameter {activeModalAction.parameter} ({activeModalAction.value}).
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-600"><span>Severity:</span> <span className="font-bold text-rose-600">{activeModalAction.severity}</span></div>
              <div className="flex justify-between text-slate-600"><span>Threshold Exceeded:</span> <span className="font-mono">{activeModalAction.threshold}</span></div>
              <div className="flex justify-between text-slate-600"><span>Incident Timestamp:</span> <span>{activeModalAction.time}</span></div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button 
                onClick={() => setActiveModalAction(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={executeTriageAction}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition"
              >
                Confirm & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
