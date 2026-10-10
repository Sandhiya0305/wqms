import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Clock, ShieldAlert, Check, X } from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

export default function AlertManager() {
  const { activeAlerts, acknowledgeAlert, resolveAlert } = useTelemetry();
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [resolvingId, setResolvingId] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const filtered = activeAlerts.filter(a => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  const handleResolveSubmit = (id) => {
    resolveAlert(id, resolutionNote);
    setResolvingId(null);
    setResolutionNote('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Active Alerts & Incident Escalation
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Real-time anomaly notifications requiring operational response</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterSeverity === sev
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Feed */}
      <div className="mt-4 space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-emerald-500/40" />
            <span>No active alerts under this filter. All telemetry parameters in nominal status.</span>
          </div>
        ) : (
          filtered.map(alert => {
            const isCrit = alert.severity === 'CRITICAL';
            const isWarn = alert.severity === 'WARNING';
            const isAck = alert.status === 'ACKNOWLEDGED';

            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCrit
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : isWarn
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-slate-800/40 border-slate-700/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isCrit ? 'text-rose-400' : isWarn ? 'text-amber-400' : 'text-sky-400'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{alert.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                          isCrit ? 'bg-rose-500/20 text-rose-300' : isWarn ? 'bg-amber-500/20 text-amber-300' : 'bg-sky-500/20 text-sky-300'
                        }`}>
                          {alert.severity}
                        </span>
                        {isAck && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono">
                            ACKNOWLEDGED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-mono">
                        <span>Station: {alert.station_name || alert.station_id}</span>
                        <span>•</span>
                        <span>{new Date(alert.created_at || Date.now()).toLocaleTimeString()}</span>
                        {alert.source && (
                          <>
                            <span>•</span>
                            <span>Source: {alert.source}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isAck && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition font-medium"
                      >
                        Acknowledge
                      </button>
                    )}

                    <button
                      onClick={() => setResolvingId(resolvingId === alert.id ? null : alert.id)}
                      className="px-2.5 py-1 text-xs bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg transition font-medium"
                    >
                      Resolve
                    </button>
                  </div>
                </div>

                {/* Inline Resolve Note Box */}
                {resolvingId === alert.id && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add brief resolution notes (e.g. valve adjusted, verified normal)..."
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      className="flex-1 bg-slate-950 text-xs text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      onClick={() => handleResolveSubmit(alert.id)}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Submit
                    </button>
                    <button
                      onClick={() => setResolvingId(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
