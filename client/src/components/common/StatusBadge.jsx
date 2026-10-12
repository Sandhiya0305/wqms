import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export default function StatusBadge({ status, score, size = 'sm' }) {
  const norm = String(status || '').toUpperCase();

  let bg = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  let Icon = Info;
  let label = status || 'Unknown';

  if (norm === 'SAFE' || norm === 'EXCELLENT' || norm === 'GOOD' || norm === 'ONLINE') {
    bg = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    Icon = CheckCircle2;
    if (norm === 'SAFE') label = 'Safe / Potable';
  } else if (norm === 'CAUTION' || norm === 'POOR' || norm === 'WARNING' || norm === 'MODERATE') {
    bg = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    Icon = AlertTriangle;
    if (norm === 'CAUTION') label = 'Caution / Moderate';
  } else if (norm === 'CRITICAL' || norm === 'VERY_POOR' || norm === 'HAZARDOUS' || norm === 'UNSUITABLE') {
    bg = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    Icon = AlertOctagon;
    if (norm === 'CRITICAL') label = 'Critical / Hazard';
  }

  const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-xs gap-2' : 'px-2 py-0.5 text-[11px] gap-1.5';

  return (
    <span className={`inline-flex items-center font-semibold rounded-none border ${bg} ${sizeClasses}`}>
      <Icon className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
      <span>{label}</span>
      {score != null && (
        <span className="font-mono ml-0.5 opacity-90">({score})</span>
      )}
    </span>
  );
}
