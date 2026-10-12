import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Send, 
  MapPin, 
  Flame, 
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTelemetry } from '../../context/TelemetryContext';

export default function HealthAdvisoriesManagerView() {
  const { selectedCity, currentUser } = useAuth();
  const { stations } = useTelemetry();

  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const cityStations = stations.filter(s => !selectedCity || s.city === selectedCity);

  const [formData, setFormData] = useState({
    title: 'Precautionary Boil Water Notice',
    city: selectedCity || 'Trichy',
    area: cityStations[0]?.district || 'Srirangam / Amma Mandapam',
    type: 'BOIL_WATER',
    severity: 'WARNING',
    message: 'Elevated river turbidity detected. Boil water before drinking.',
    guidelines: 'Boil tap water for at least 3 minutes before drinking or cooking.'
  });

  const fetchAdvisories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/advisories?city=${encodeURIComponent(selectedCity)}&active=false`);
      const data = await res.json();
      if (data.success) {
        setAdvisories(data.data || []);
      }
    } catch (err) {
      console.error(err);
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
        setNotification({ type: 'success', text: 'Advisory published successfully.' });
        fetchAdvisories();
        setFormData({
          title: 'Boil Water Advisory',
          city: selectedCity,
          area: cityStations[0]?.district || 'Srirangam / Amma Mandapam',
          type: 'BOIL_WATER',
          severity: 'WARNING',
          message: 'Boil municipal tap water prior to consumption.',
          guidelines: 'Boil for 3 minutes.'
        });
      } else {
        setNotification({ type: 'error', text: data.error || 'Failed to issue advisory' });
      }
    } catch (err) {
      setNotification({ type: 'error', text: 'Network connection failed' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleRevoke = async (id) => {
    try {
      const res = await fetch(`/api/v1/advisories/${id}/revoke`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', text: 'Advisory revoked. Area marked safe.' });
        fetchAdvisories();
      }
    } catch (err) {
      setNotification({ type: 'error', text: 'Failed to revoke advisory.' });
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const activeAdvisories = advisories.filter(a => a.is_active === 1);
  const pastAdvisories = advisories.filter(a => a.is_active === 0);

  return (
    <div className="space-y-4 font-sans">
      
      {/* Header - Boxy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300 dark:border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Public Health Directorate
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Public Health Advisories & Boil Notices
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
            {activeAdvisories.length} Active in {selectedCity}
          </span>
        </div>
      </div>

      {notification && (
        <div className={`p-2.5 border text-xs font-semibold ${
          notification.type === 'success'
            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200'
            : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
        }`}>
          {notification.text}
        </div>
      )}

      {/* Grid: Form (Left) & Active Notices (Right) - Boxy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-4 border border-slate-300 dark:border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
            Issue Public Health Notice
          </h2>

          <form onSubmit={handleIssueAdvisory} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Target Area ({selectedCity})</label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
              >
                {cityStations.map(s => (
                  <option key={s.id} value={s.district}>{s.district} ({s.name})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  <option value="BOIL_WATER">Boil Water</option>
                  <option value="HIGH_TURBIDITY">High Turbidity</option>
                  <option value="CHEMICAL_SPILL">Runoff Warning</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  <option value="WARNING">Warning</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="INFO">Info</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Headline</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Reason</label>
              <textarea
                rows="2"
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Citizen Directive</label>
              <textarea
                rows="2"
                value={formData.guidelines}
                onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
                className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs border border-blue-700 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Broadcasting...' : 'Publish Health Notice'}
            </button>
          </form>
        </div>

        {/* Right: Active Notices */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-4 border border-slate-300 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Active Health Bulletins ({selectedCity})
            </h2>
            <span className="font-mono text-xs font-bold text-blue-600">{activeAdvisories.length} Active</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading notices...</div>
          ) : activeAdvisories.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 border border-slate-200 dark:border-slate-800">
              No active boil notices. Water quality in {selectedCity} meets health standards.
            </div>
          ) : (
            <div className="space-y-3">
              {activeAdvisories.map((advisory) => (
                <div key={advisory.id} className="p-3 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.2 bg-red-600 text-white font-bold text-[10px]">
                          {advisory.type?.replace('_', ' ')}
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                          {advisory.area}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white mt-1">
                        {advisory.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleRevoke(advisory.id)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Revoke Notice
                    </button>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-xs">
                    {advisory.message}
                  </p>

                  {advisory.guidelines && (
                    <div className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px]">
                      <strong>Directive:</strong> {advisory.guidelines}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 font-mono flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span>Issued by: {advisory.issued_by}</span>
                    <span>{new Date(advisory.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
