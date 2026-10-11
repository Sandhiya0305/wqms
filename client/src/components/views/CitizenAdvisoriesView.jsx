import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  HelpCircle
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
      
      {/* Boxy Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider mb-2 border border-rose-200 dark:border-rose-800">
          <Flame className="w-3.5 h-3.5 text-rose-600" />
          <span>Health Bulletins • {selectedCity}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Drinking Water Advisories & Notices
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Official precautionary notices issued by the Municipal Health Directorate.
        </p>
      </div>

      {/* Active Advisories Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-none bg-rose-600 animate-pulse"></span>
          Active Notices in {selectedCity} ({active.length})
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Checking health bulletins...</div>
        ) : active.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-none bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                No Active Health Advisories in {selectedCity}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Public tap supplies meet potable health guidelines. Tap water consumption is safe.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {active.map(item => (
              <div 
                key={item.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-none border border-rose-300 dark:border-rose-900/60 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-none text-[10px] font-bold uppercase bg-rose-600 text-white">
                      {item.type?.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      {item.area}, {item.city}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Issued: {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {item.message}
                  </p>
                </div>

                {item.guidelines && (
                  <div className="p-3 rounded-none bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Required Precautions:
                    </div>
                    <p>{item.guidelines}</p>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                  Authorized by: {item.issued_by}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guidelines in Simple English */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          Precautions During Boil Water Advisories
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">1. Boil for 3 Minutes</span>
            <p className="text-slate-500 dark:text-slate-400">
              Bring tap water to a rolling boil for 3 minutes before drinking, cooking, or tooth brushing.
            </p>
          </div>

          <div className="p-3 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">2. In-Home Filters</span>
            <p className="text-slate-500 dark:text-slate-400">
              Standard mesh/pitcher filters do not remove microbiological pathogens. Boil water during active alerts.
            </p>
          </div>

          <div className="p-3 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">3. Infant Feeding</span>
            <p className="text-slate-500 dark:text-slate-400">
              Always use boiled and cooled water or bottled water when preparing baby formula.
            </p>
          </div>
        </div>
      </div>

      {/* Past Resolved Notices */}
      {resolved.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Past Resolved Advisories
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {resolved.map(item => (
              <div key={item.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 line-through opacity-70">{item.title}</div>
                  <div className="text-[11px] text-slate-400">{item.area}, {item.city}</div>
                </div>
                <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
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
