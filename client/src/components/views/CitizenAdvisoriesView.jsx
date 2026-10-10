import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  HelpCircle,
  PhoneCall,
  Droplet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CitizenAdvisoriesView() {
  const { selectedCity } = useAuth();
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/advisories?city=${encodeURIComponent(selectedCity)}&active=false`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setAdvisories(data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCity]);

  const active = advisories.filter(a => a.is_active === 1);
  const resolved = advisories.filter(a => a.is_active === 0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-2">
          <Flame className="w-3.5 h-3.5" />
          <span>Public Safety Bulletins • {selectedCity}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Drinking Water Advisories & Precautionary Notices
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Official health advisories issued by the Municipal Directorate of Public Health. Follow safety directives to safeguard your family's health.
        </p>
      </div>

      {/* Active Advisories Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          Active Notices in {selectedCity} ({active.length})
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Checking health bulletins...</div>
        ) : active.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                No Active Health Advisories in {selectedCity}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All public tap water supplies in {selectedCity} meet potable health guidelines. Normal tap water consumption is safe.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {active.map(item => (
              <div 
                key={item.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-md space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-600 text-white">
                      {item.type?.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {item.area}, {item.city}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Issued: {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                {item.guidelines && (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Required Health Precautions:
                    </div>
                    <p className="leading-relaxed">{item.guidelines}</p>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  Authorized by: {item.issued_by}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Educational Guidelines in Simple English */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          What to Do During a Boil Water Advisory?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">1. Boil for 3 Minutes</span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Bring tap water to a rolling boil for at least 3 minutes before drinking, cooking, brushing teeth, or washing produce.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">2. In-Home Filters</span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Most standard pitcher or charcoal filters do not remove bacteria or viruses. Only boil or use certified RO systems during alerts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">3. Infant & Child Care</span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Always use boiled and cooled water or bottled water when preparing baby formula or giving water to young children.
            </p>
          </div>
        </div>
      </div>

      {/* Past Resolved Notices */}
      {resolved.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Past Resolved Advisories
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {resolved.map(item => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 line-through opacity-70">{item.title}</div>
                  <div className="text-[11px] text-slate-400">{item.area}, {item.city}</div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  Rescinded Safe
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
