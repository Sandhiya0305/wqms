import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTelemetry } from '../../context/TelemetryContext';

export default function CitizenReportView({ setActiveView }) {
  const { selectedCity, currentUser } = useAuth();
  const { stations } = useTelemetry();

  const cityStations = stations.filter(s => !selectedCity || s.city === selectedCity);

  const [form, setForm] = useState({
    citizen_name: currentUser?.name || 'Priya Sharma',
    contact_info: '98402-12345',
    city: selectedCity || 'Trichy',
    station_id: cityStations[0]?.id || 'TRICHY_ROCKFORT_04',
    address: 'No. 14, 4th Cross, Thillai Nagar West, Trichy',
    issue_type: 'MURKY_COLOR',
    severity: 'MEDIUM',
    description: 'Tap water has visible yellowish-brown tint. Silt settling in drinking vessels.'
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg(null);

      const res = await fetch('/api/v1/citizen/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          city: selectedCity
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedReport({
          id: data.report_id,
          ...form
        });
      } else {
        setErrorMsg(data.error || 'Failed to submit report.');
      }
    } catch (err) {
      setErrorMsg('Network error. Could not connect to server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Boxy Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 text-left">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200 dark:border-blue-800">
          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
          <span>Civic Incident Report • {selectedCity}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Report Water Quality Issue
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Submit observed issues to municipal dispatch for inspection and water line testing.
        </p>
      </div>

      {/* Success State */}
      {submittedReport ? (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-emerald-300 dark:border-emerald-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-none bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              Report Logged Successfully
            </span>
            <h2 className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
              Reference #{submittedReport.id}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              Ticket for <strong>{submittedReport.address}</strong> forwarded to {selectedCity} Municipal Water Division.
            </p>
          </div>

          <div className="p-4 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-slate-500">Issue Category:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{submittedReport.issue_type.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">NEW — In Triage</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Division:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCity} Central Division</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveView('citizen_tracker')}
              className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-none transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Track Complaint Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSubmittedReport(null)}
              className="w-full sm:w-auto px-5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-none border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      ) : (
        /* Report Form */
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 space-y-4 text-xs text-left">
          
          {errorMsg && (
            <div className="p-3 rounded-none bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={form.citizen_name}
                onChange={(e) => setForm({ ...form, citizen_name: e.target.value })}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3 py-2 rounded-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone / SMS *
              </label>
              <input
                type="text"
                required
                value={form.contact_info}
                onChange={(e) => setForm({ ...form, contact_info: e.target.value })}
                placeholder="e.g. 98402-12345"
                className="w-full px-3 py-2 rounded-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nearest Monitored Area in {selectedCity}
              </label>
              <select
                value={form.station_id}
                onChange={(e) => setForm({ ...form, station_id: e.target.value })}
                className="w-full px-3 py-2 rounded-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium"
              >
                {cityStations.map(s => (
                  <option key={s.id} value={s.id}>{s.district} ({s.name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Observed Issue *
              </label>
              <select
                value={form.issue_type}
                onChange={(e) => setForm({ ...form, issue_type: e.target.value })}
                className="w-full px-3 py-2 rounded-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium"
              >
                <option value="MURKY_COLOR">Brown / Cloudy / Discolored Tap Water</option>
                <option value="FOUL_ODOR">Foul, Sewage, or Chemical Smell</option>
                <option value="CHEMICAL_TASTE">Bitter, Metallic, or Salty Taste</option>
                <option value="LOW_PRESSURE">Extreme Low Pressure / Air in Line</option>
                <option value="PIPE_LEAK">Main Pipeline Burst or Street Leak</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Street Address & Door Number *
            </label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="e.g. 14, 4th Cross, Thillai Nagar West, Trichy"
              className="w-full px-3 py-2 rounded-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Severity Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'LOW', label: 'Minor', desc: 'Slight odor / clear' },
                { id: 'MEDIUM', label: 'Moderate', desc: 'Discolored / unpotable' },
                { id: 'HIGH', label: 'Severe', desc: 'Sewage leak / burst' }
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setForm({ ...form, severity: s.id })}
                  className={`p-2.5 rounded-none border text-left transition cursor-pointer ${
                    form.severity === s.id
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="font-bold">{s.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Observation Notes
            </label>
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe when the issue started, whether nearby buildings are affected, etc."
              className="w-full px-3 py-2 rounded-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-none bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting to Dispatch...' : 'Submit Incident Report'}</span>
          </button>
        </form>
      )}

    </div>
  );
}
