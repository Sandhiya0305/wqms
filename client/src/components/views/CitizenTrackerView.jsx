import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  CheckCircle2, 
  MapPin, 
  User, 
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CitizenTrackerView({ setActiveView }) {
  const { selectedCity, isHealthOfficer, isEngineer } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState(null);

  // Resolution modal / form state for Authority
  const [updateStatus, setUpdateStatus] = useState('INVESTIGATING');
  const [assignedTeam, setAssignedTeam] = useState('Trichy Zone 3 Field Inspection Unit');
  const [resolutionSummary, setResolutionSummary] = useState('Line flushed; chlorine residual restored to 0.8 ppm.');
  const [updating, setUpdating] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/citizen/reports?city=${encodeURIComponent(selectedCity)}`);
      const data = await res.json();
      if (data.success) {
        setReports(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedCity]);

  const handleUpdateStatus = async (reportId) => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/v1/citizen/reports/${reportId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateStatus,
          assigned_team: assignedTeam,
          resolution_summary: resolutionSummary
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchReports();
        setSelectedReport(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredReports = reports.filter(r => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Boxy Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200 dark:border-blue-800">
            <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
            <span>{isHealthOfficer ? 'Public Health Grievance Triage' : 'Incident Complaint Tracker'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Water Quality Complaint Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {isHealthOfficer 
              ? `Triage and dispatch inspection teams for drinking water complaints across ${selectedCity}.`
              : `Real-time progress on water quality issues logged by residents in ${selectedCity}.`
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReports}
            className="p-2 rounded-none border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            title="Refresh reports"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {!isHealthOfficer && (
            <button
              onClick={() => setActiveView('citizen_report')}
              className="px-4 py-2 rounded-none bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
            >
              + File Incident Report
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['ALL', 'NEW', 'INVESTIGATING', 'RESOLVED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-none font-bold text-xs border transition cursor-pointer whitespace-nowrap ${
              filterStatus === status
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-800'
            }`}
          >
            {status === 'ALL' ? 'All Reports' : status === 'NEW' ? 'Pending' : status === 'INVESTIGATING' ? 'Under Inspection' : 'Resolved'}
            {' '}({status === 'ALL' ? reports.length : reports.filter(r => r.status === status).length})
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">Loading incident reports...</div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-none border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">No Reports in Category</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            All distribution lines in {selectedCity} are operating nominally.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const isResolved = report.status === 'RESOLVED';
            const isInvestigating = report.status === 'INVESTIGATING';

            return (
              <div 
                key={report.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-none border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">#{report.id}</span>
                      <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase border ${
                        isResolved
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : isInvestigating
                          ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {report.issue_type?.replace('_', ' ')}
                    </h3>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-medium truncate">{report.address}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Reported by: {report.citizen_name}</span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-none border border-slate-200 dark:border-slate-700 italic">
                    "{report.description}"
                  </p>
                </div>

                {/* Assigned Team & Resolution Info */}
                <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Assigned Unit:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {report.assigned_team || 'Pending Assignment'}
                    </span>
                  </div>

                  {report.resolution_summary && (
                    <div className="p-2 rounded-none bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-200">
                      <strong>Resolution Note: </strong>{report.resolution_summary}
                    </div>
                  )}

                  {/* Authority Action Button */}
                  {(isHealthOfficer || isEngineer) && (
                    <div className="pt-1">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="w-full py-1.5 rounded-none bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                      >
                        Update Inspection & Dispatch
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Authority Update Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-none max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Manage Incident #{selectedReport.id}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {selectedReport.address} • Reported by {selectedReport.citizen_name}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Change Status
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                >
                  <option value="NEW">NEW (Pending)</option>
                  <option value="INVESTIGATING">INVESTIGATING (Inspection Dispatched)</option>
                  <option value="RESOLVED">RESOLVED (Water Restored)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Team / Inspector
                </label>
                <input
                  type="text"
                  value={assignedTeam}
                  onChange={(e) => setAssignedTeam(e.target.value)}
                  className="w-full px-3 py-2 rounded-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Resolution Notes
                </label>
                <textarea
                  rows="3"
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-3 py-1.5 rounded-none text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => handleUpdateStatus(selectedReport.id)}
                className="px-4 py-1.5 rounded-none bg-blue-600 hover:bg-blue-700 text-white font-bold transition cursor-pointer"
              >
                {updating ? 'Updating...' : 'Save & Notify'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
