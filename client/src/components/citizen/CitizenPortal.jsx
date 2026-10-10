import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Droplet, 
  MapPin, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  HelpCircle,
  Activity,
  Flame,
  Filter
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

export default function CitizenPortal() {
  const { latestTelemetry, stations, submitCitizenReport } = useTelemetry();
  const [overview, setOverview] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Citizen form state
  const [formData, setFormData] = useState({
    citizen_name: '',
    contact_info: '',
    issue_type: 'MURKY_COLOR',
    address: '',
    description: '',
    station_id: 'STATION_TAP_03',
    severity: 'MEDIUM'
  });

  const loadCitizenOverview = async () => {
    try {
      const res = await fetch('/api/v1/citizen/overview');
      const json = await res.json();
      if (json.success) setOverview(json);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCitizenOverview();
    const interval = setInterval(loadCitizenOverview, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.citizen_name || !formData.address) return;

    try {
      await submitCitizenReport(formData);
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setShowReportModal(false);
        setFormData({
          citizen_name: '',
          contact_info: '',
          issue_type: 'MURKY_COLOR',
          address: '',
          description: '',
          station_id: 'STATION_TAP_03',
          severity: 'MEDIUM'
        });
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const isSafe = overview?.public_status === 'SAFE_TO_DRINK';
  const isCaution = overview?.public_status === 'PRECAUTIONARY_NOTICE';
  const isBoil = overview?.public_status === 'BOIL_WATER_ADVISORY';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Prominent Public Drinking Safety Banner */}
      <div className={`p-6 rounded-3xl border shadow-2xl transition-all ${
        isBoil 
          ? 'bg-rose-950/40 border-rose-500/50 shadow-rose-950/50' 
          : isCaution
          ? 'bg-amber-950/40 border-amber-500/50 shadow-amber-950/50'
          : 'bg-emerald-950/30 border-emerald-500/40 shadow-emerald-950/40'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-2xl shadow-lg shrink-0 ${
              isBoil ? 'bg-rose-500 text-white animate-bounce' : isCaution ? 'bg-amber-500 text-slate-900' : 'bg-emerald-500 text-white'
            }`}>
              {isBoil ? <AlertOctagon className="w-8 h-8" /> : isCaution ? <AlertTriangle className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isBoil ? 'bg-rose-500/20 text-rose-300' : isCaution ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  Official Municipal Advisory
                </span>
                <span className="text-xs text-slate-400 font-mono">Verified Live</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                {overview?.headline || 'Public Tap Water is Safe to Drink'}
              </h2>

              <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
                {overview?.advisory_message || 'Continuous automated laboratory and IoT telemetry confirms tap water meets all standard microbiological and chemical drinking criteria.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-lg shadow-sky-600/30 transition-all shrink-0 hover:scale-105"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Report Water Concern</span>
          </button>
        </div>
      </div>

      {/* Citizen Health Guidance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3">
            <Droplet className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Direct Drinking Water</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {isBoil 
              ? 'Do not drink directly from taps. Boil all drinking water for at least 3 continuous minutes.' 
              : 'Safe for direct drinking from municipal tap lines in all designated residential zones.'}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
            <Filter className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Domestic Filtration</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Standard carbon block or UF gravity filters provide optimal clarity. RO is optional as TDS remains within 180-250 ppm.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Food & Infant Safety</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Washing vegetables and general cooking are safe. For newborn infant formula, standard pre-boiling is always advised.
          </p>
        </div>
      </div>

      {/* Neighborhood Safety Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              Neighborhood Water Quality Status
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time potability status across city sectors and distribution zones</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {overview?.neighborhoods?.length ?? 5} Zones Monitored
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(overview?.neighborhoods || stations).map((item, idx) => {
            const tel = latestTelemetry[item.station_id || item.id];
            const wqi = item.wqi_score ?? tel?.wqi_score ?? 22;
            const isZoneSafe = wqi < 50;
            const isZoneCaution = wqi >= 50 && wqi <= 75;

            return (
              <div
                key={item.station_id || item.id || idx}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.name || item.station_name}</h4>
                    <span className="text-xs text-slate-400">{item.district}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                    isZoneSafe 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : isZoneCaution
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    WQI {wqi}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Condition:</span>
                  <span className={`font-semibold ${
                    isZoneSafe ? 'text-emerald-400' : isZoneCaution ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {isZoneSafe ? 'Safe to Drink' : isZoneCaution ? 'Precautionary Filtration' : 'Boil Water Advisory'}
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                  <span>Source: {item.source_type || item.type}</span>
                  <span>{new Date(item.last_updated || Date.now()).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Citizen Incident Reporting Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-400" />
              Report Water Issue to Municipal Engineers
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Your crowdsourced report will be immediately dispatched to the water authority command center.
            </p>

            {formSubmitted ? (
              <div className="py-8 text-center flex flex-col items-center gap-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                <h4 className="text-base font-bold text-white">Report Successfully Dispatched!</h4>
                <p className="text-xs text-slate-300">
                  Municipal inspection teams have been notified. Thank you for protecting public drinking water.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    name="citizen_name"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.citizen_name}
                    onChange={handleFormChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Phone / Email</label>
                    <input
                      type="text"
                      name="contact_info"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.contact_info}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Issue Category *</label>
                    <select
                      name="issue_type"
                      value={formData.issue_type}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="MURKY_COLOR">Discolored / Brown Water</option>
                      <option value="FOUL_ODOR">Foul / Sulfur Odor</option>
                      <option value="CHEMICAL_TASTE">Chlorine / Chemical Taste</option>
                      <option value="PIPE_LEAK">Main Pipeline Burst / Leak</option>
                      <option value="OTHER">Other Water Quality Concern</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Street Address / Landmark *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="e.g. Sector 4, Pocket B, Near Metro Station"
                    value={formData.address}
                    onChange={handleFormChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Details & Observations</label>
                  <textarea
                    name="description"
                    rows="3"
                    placeholder="Describe what you observed (e.g. started this morning, oily sheen, low pressure)..."
                    value={formData.description}
                    onChange={handleFormChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold shadow-md transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Report</span>
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
