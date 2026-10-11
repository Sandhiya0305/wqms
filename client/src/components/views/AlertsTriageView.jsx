import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Check, 
  AlertTriangle, 
  AlertOctagon, 
  Bell
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useAuth } from '../../context/AuthContext';

export default function AlertsTriageView({ setActiveView }) {
  const { activeAlerts, acknowledgeAlert, resolveAlert, stations } = useTelemetry();
  const { selectedCity, isEngineer } = useAuth();
  
  const [searchParam, setSearchParam] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [activeModalAction, setActiveModalAction] = useState(null);

  // Filter alerts by current city
  const cityStations = stations.filter(s => !selectedCity || s.city === selectedCity);
  const cityStationIds = new Set(cityStations.map(s => s.id));

  const displayAlerts = activeAlerts.filter(a => {
    const inCity = cityStationIds.has(a.station_id) || a.station_id?.startsWith(selectedCity.toUpperCase());
    if (!inCity && cityStations.length > 0) return false;

    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (searchParam) {
      const q = searchParam.toLowerCase();
      return (
        a.title?.toLowerCase().includes(q) || 
        a.description?.toLowerCase().includes(q) || 
        a.station_id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleActionClick = (alertItem, actionName) => {
    setActiveModalAction({ ...alertItem, actionName });
  };

  const confirmAction = async () => {
    if (!activeModalAction) return;
    if (activeModalAction.actionName === 'ACKNOWLEDGE') {
      await acknowledgeAlert(activeModalAction.id);
    } else if (activeModalAction.actionName === 'RESOLVE') {
      await resolveAlert(activeModalAction.id);
    }
    setActiveModalAction(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Boxy Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200 dark:border-blue-800">
            <Bell className="w-3.5 h-3.5 text-blue-600" />
            <span>Incident Triage • {selectedCity}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Water Quality Alerts & Incident Triage
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Sensor anomalies and threshold violation tickets logged across {selectedCity}.
          </p>
        </div>

        {isEngineer && (
          <button
            onClick={() => setActiveView('thresholds')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-none transition self-start sm:self-auto cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Calibrate Thresholds</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-none border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts, parameters or stations..."
            value={searchParam}
            onChange={(e) => setSearchParam(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 pl-10 pr-4 py-2 rounded-none border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium"
          />
        </div>

        {/* Severity Filter Dropdown */}
        <div className="flex items-center gap-2">
          <select 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-none px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="WARNING">Warning Only</option>
            <option value="INFO">Informational</option>
          </select>
        </div>

      </div>

      {/* Alerts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Alert Headline</th>
                <th className="py-3 px-4">Station ID</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayAlerts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 text-xs">
                    No active incident alerts for {selectedCity}. All drinking water parameters are nominal.
                  </td>
                </tr>
              ) : (
                displayAlerts.map((row) => {
                  let sevBg = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
                  if (row.severity === 'CRITICAL') sevBg = 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800';
                  if (row.severity === 'INFO') sevBg = 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800';

                  const st = stations.find(s => s.id === row.station_id);

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{row.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{row.description}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        <div>{row.station_id}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{st?.district || st?.name}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-bold border ${sevBg}`}>
                          <span className="w-1.5 h-1.5 rounded-none bg-current"></span>
                          {row.severity}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold border ${
                          row.status === 'RESOLVED' 
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' 
                            : row.status === 'ACKNOWLEDGED'
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                            : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse'
                        }`}>
                          {row.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {new Date(row.created_at || Date.now()).toLocaleTimeString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {row.status !== 'RESOLVED' && (
                            <>
                              {row.status !== 'ACKNOWLEDGED' && (
                                <button
                                  onClick={() => handleActionClick(row, 'ACKNOWLEDGE')}
                                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-none border border-slate-300 dark:border-slate-700 text-[11px] transition cursor-pointer"
                                >
                                  Acknowledge
                                </button>
                              )}
                              <button
                                onClick={() => handleActionClick(row, 'RESOLVE')}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none text-[11px] transition cursor-pointer"
                              >
                                Resolve
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {activeModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-none max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Confirm Action: {activeModalAction.actionName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You are updating incident ticket: <strong>{activeModalAction.title}</strong> at {activeModalAction.station_id}.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setActiveModalAction(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-none border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAction}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-none transition cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
