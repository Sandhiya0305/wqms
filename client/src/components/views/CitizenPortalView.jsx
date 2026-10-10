import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  MapPin, 
  AlertTriangle, 
  Flame, 
  Droplet, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import StationMap from '../authority/StationMap';

export default function CitizenPortalView({ setActiveView }) {
  const { submitCitizenReport } = useTelemetry();
  
  const [areaSearch, setAreaSearch] = useState('');
  const [areaSafetyResult, setAreaSafetyResult] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const [reportForm, setReportForm] = useState({
    citizen_name: '',
    contact_info: '',
    issue_type: 'MURKY_COLOR',
    address: '',
    description: ''
  });

  const handleCheckArea = (e) => {
    e.preventDefault();
    if (!areaSearch.trim()) return;
    setAreaSafetyResult({
      area: areaSearch,
      status: 'Safe to Drink',
      wqi: 86,
      message: 'All chemical and microbiological indicators meet WHO drinking criteria in this area.'
    });
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    try {
      await submitCitizenReport({
        ...reportForm,
        station_id: 'STATION_WEST_04',
        severity: 'MEDIUM'
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setShowReportModal(false);
        setReportForm({ citizen_name: '', contact_info: '', issue_type: 'MURKY_COLOR', address: '', description: '' });
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Banner with Water Background from Image 5 */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/75 to-blue-950/60" />
        </div>

        <div className="relative p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 text-white">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Clean Water. Safer Communities.
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-2">
              Check your local water quality, view safety status and report issues.
            </p>

            {/* Area Search Input */}
            <form onSubmit={handleCheckArea} className="mt-6 flex items-center gap-2 max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Enter your area or location"
                  value={areaSearch}
                  onChange={(e) => setAreaSearch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-md shrink-0"
              >
                Check
              </button>
            </form>

            {areaSafetyResult && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-950/70 border border-emerald-400/40 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>{areaSafetyResult.area}</strong>: {areaSafetyResult.status} (WQI {areaSafetyResult.wqi})</span>
              </div>
            )}
          </div>

          {/* Floating Overall Safety Card from Image 5 */}
          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/40 shadow-xl text-slate-800 shrink-0 min-w-[240px]">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Overall Safety</span>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">Safe to Drink</h3>
                <span className="text-xs text-slate-500 font-medium">For your area</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
              Last updated: Apr 28, 2025, 10:42 AM
            </div>
          </div>
        </div>
      </div>

      {/* Lower Row: 3 Cards from Image 5 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Water Safety Map */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Water Safety Map</h3>
              <button 
                onClick={() => setActiveView('citizen_map')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                View Full Map
              </button>
            </div>

            <div className="h-44 rounded-xl overflow-hidden border border-slate-200">
              <StationMap />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-500 font-medium">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Safe</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Moderate</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> At Risk</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical</span>
          </div>
        </div>

        {/* Card 2: Latest Advisories */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Latest Advisories</h3>
              <button 
                onClick={() => setActiveView('citizen_advisories')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Flame className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Boil Water Advisory</div>
                  <div className="text-[11px] text-slate-500">East Reservoir • Apr 28, 2025</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900">High Turbidity Detected</div>
                  <div className="text-[11px] text-slate-500">Riverside • Apr 28, 2025</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Droplet className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Chlorine Level Low</div>
                  <div className="text-[11px] text-slate-500">Central WTP • Apr 28, 2025</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-400">
            Automated alerts issued by Municipal Health Directorate
          </div>
        </div>

        {/* Card 3: Report an Issue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between text-center items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Report an Issue</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              See something unusual? Help us keep your community water safe.
            </p>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition"
          >
            Submit Report
          </button>
        </div>

      </div>

      {/* Citizen Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Report Water Issue to Authorities
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Your observation helps city engineers take immediate corrective action.
            </p>

            {reportSuccess ? (
              <div className="py-8 text-center flex flex-col items-center gap-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <h4 className="text-sm font-bold text-slate-900">Report Dispatched Successfully!</h4>
                <p className="text-xs text-slate-500">Thank you for contributing to public water safety.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={reportForm.citizen_name}
                    onChange={(e) => setReportForm({ ...reportForm, citizen_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location / Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5th Cross, Indiranagar, Ward 7"
                    value={reportForm.address}
                    onChange={(e) => setReportForm({ ...reportForm, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issue Category</label>
                  <select
                    value={reportForm.issue_type}
                    onChange={(e) => setReportForm({ ...reportForm, issue_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MURKY_COLOR">Discolored / Murky Water</option>
                    <option value="FOUL_ODOR">Foul / Chemical Odor</option>
                    <option value="CHEMICAL_TASTE">Unusual Taste</option>
                    <option value="PIPE_LEAK">Main Pipeline Leak</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Observation Notes</label>
                  <textarea
                    rows="3"
                    placeholder="Provide any details about what you observed..."
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
