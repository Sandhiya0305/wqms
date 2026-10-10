import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  Send, 
  RotateCcw, 
  MapPin, 
  Users, 
  Building2,
  FileCheck2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTelemetry } from '../../context/TelemetryContext';

export default function HealthAdvisoriesManagerView({ setActiveView }) {
  const { selectedCity, currentUser } = useAuth();
  const { stations } = useTelemetry();

  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: 'Precautionary Boil Water Notice',
    city: selectedCity || 'Trichy',
    area: 'Srirangam / Amma Mandapam',
    type: 'BOIL_WATER',
    severity: 'WARNING',
    message: 'Elevated river turbidity detected following heavy upstream monsoon flow. Tap water should be boiled prior to drinking.',
    guidelines: 'Boil tap water vigorously for at least 3 minutes before drinking, cooking, or infant formula preparation.'
  });

  const cityStations = stations.filter(s => !selectedCity || s.city === selectedCity);

  const fetchAdvisories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/advisories?city=${encodeURIComponent(selectedCity)}&active=false`);
      const data = await res.json();
      if (data.success) {
        setAdvisories(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch advisories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisories();
  }, [selectedCity]);

  const handleIssueAdvisory = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch('/api/v1/advisories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          city: selectedCity,
          issued_by: `${currentUser?.name} (${currentUser?.roleLabel})`
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', text: data.message });
        fetchAdvisories();
        // Reset form
        setFormData({
          title: 'Precautionary Boil Water Notice',
          city: selectedCity,
          area: cityStations[0]?.district || 'Srirangam / Amma Mandapam',
          type: 'BOIL_WATER',
          severity: 'WARNING',
          message: 'Water quality parameter shifted outside optimal range. Boil water before drinking.',
          guidelines: 'Boil for 3 minutes before consuming.'
        });
      } else {
        setNotification({ type: 'error', text: data.error || 'Failed to issue advisory' });
      }
    } catch (err) {
      setNotification({ type: 'error', text: 'Network connection failed' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleRevoke = async (id, title) => {
    try {
      const res = await fetch(`/api/v1/advisories/${id}/revoke`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', text: `Advisory for "${title}" revoked. Area marked safe.` });
        fetchAdvisories();
      }
    } catch (err) {
      setNotification({ type: 'error', text: 'Failed to revoke advisory.' });
    } finally {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const activeAdvisories = advisories.filter(a => a.is_active === 1);
  const pastAdvisories = advisories.filter(a => a.is_active === 0);

  return (
    <div className="space-y-6">
      
      {/* Exclusive Role Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              Chief Public Health Officer Authority
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Public Health Advisories & Boil Water Notices
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Statutory authority to broadcast emergency drinking water warnings to residents of {selectedCity} and revoke notices once laboratory parameters meet WHO and BIS standards.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center">
              <div className="text-2xl font-black">{activeAdvisories.length}</div>
              <div className="text-[11px] text-amber-100 font-medium">Active Notices in {selectedCity}</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center">
              <div className="text-2xl font-black">{cityStations.length}</div>
              <div className="text-[11px] text-amber-100 font-medium">Monitored Zones</div>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-3 animate-in fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' 
            : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span className="font-medium">{notification.text}</span>
        </div>
      )}

      {/* Main Grid: Issue Form (Left) & Active Advisories (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form to Issue New Advisory */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Broadcast New Health Notice</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Instantly appears on citizen portals & SMS feeds</p>
            </div>
          </div>

          <form onSubmit={handleIssueAdvisory} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target City & Municipality
              </label>
              <input
                type="text"
                disabled
                value={`${selectedCity} District`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Area / Zone in {selectedCity} *
              </label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                {cityStations.length > 0 ? (
                  cityStations.map(s => (
                    <option key={s.id} value={s.district}>{s.district} ({s.name})</option>
                  ))
                ) : (
                  <>
                    <option value="Srirangam / Amma Mandapam">Srirangam / Amma Mandapam</option>
                    <option value="Rockfort & Teppakulam">Rockfort & Teppakulam</option>
                    <option value="Thillai Nagar">Thillai Nagar</option>
                    <option value="Golden Rock (Ponmalai)">Golden Rock (Ponmalai)</option>
                  </>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Advisory Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="BOIL_WATER">Boil Water Advisory</option>
                  <option value="HIGH_TURBIDITY">High Turbidity Alert</option>
                  <option value="CHEMICAL_SPILL">Chemical / Runoff Alert</option>
                  <option value="PRECAUTIONARY">Precautionary Notice</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Severity Level
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="WARNING">Warning (Elevated Risk)</option>
                  <option value="CRITICAL">Critical (Immediate Hazard)</option>
                  <option value="INFO">Informational (Advisory)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Notice Headline *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Boil Tap Water Before Drinking"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Cause / Health Explanation *
              </label>
              <textarea
                rows="2"
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Explain the water quality issue in simple words..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Citizen Safety Action Steps
              </label>
              <textarea
                rows="2"
                value={formData.guidelines}
                onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
                placeholder="e.g. Boil water for at least 3 minutes; avoid drinking directly from taps."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-md shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Broadcasting Notice...' : 'Publish Public Health Notice'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Live Active Advisories & Revoke Controls */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Advisories Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Currently Active Advisories in {selectedCity}
                </h2>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-900">
                {activeAdvisories.length} Active
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading health notices...</div>
            ) : activeAdvisories.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">No Active Advisories</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                  Public drinking water in {selectedCity} currently meets potable safety standards with no open health alerts.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeAdvisories.map((advisory) => (
                  <div 
                    key={advisory.id} 
                    className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-600 text-white">
                            {advisory.type?.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            {advisory.area}, {advisory.city}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-1.5">
                          {advisory.title}
                        </h3>
                      </div>

                      <button
                        onClick={() => handleRevoke(advisory.id, advisory.title)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 shrink-0"
                        title="Mark water quality safe and revoke public notice"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Revoke & Mark Safe</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {advisory.message}
                    </p>

                    {advisory.guidelines && (
                      <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-rose-100 dark:border-rose-900/40 text-[11px] text-slate-600 dark:text-slate-300">
                        <span className="font-bold text-rose-700 dark:text-rose-400">Citizen Directive: </span>
                        {advisory.guidelines}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-rose-100 dark:border-rose-900/30 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>Issued by: {advisory.issued_by}</span>
                      <span>{new Date(advisory.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Revoked Advisories Log */}
          {pastAdvisories.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Recent Resolved / Revoked Notices
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {pastAdvisories.slice(0, 3).map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 line-through opacity-75">{item.title}</div>
                      <div className="text-[11px] text-slate-400">{item.area} • Revoked by Health Directorate</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Resolved Safe
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
