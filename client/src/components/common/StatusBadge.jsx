import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export default function StatusBadge({ status, score, size = 'sm' }) {
  const norm = String(status || '').toUpperCase();

  let bg = 'bg-slate-700 text-slate-300 border-slate-600';
  let Icon = Info;
  let label = status || 'Unknown';

  if (norm === 'SAFE' || norm === 'EXCELLENT' || norm === 'GOOD' || norm === 'ONLINE') {
    bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    Icon = CheckCircle2;
    if (norm === 'SAFE') label = 'Safe / Potable';
  } else if (norm === 'CAUTION' || norm === 'POOR' || norm === 'WARNING' || norm === 'MODERATE') {
    bg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    Icon = AlertTriangle;
    if (norm === 'CAUTION') label = 'Caution / Moderate';
  } else if (norm === 'CRITICAL' || norm === 'VERY_POOR' || norm === 'HAZARDOUS' || norm === 'UNSUITABLE') {
    bg = 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse';
    Icon = AlertOctagon;
    if (norm === 'CRITICAL') label = 'Critical / Hazard';
  }

  const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-sm gap-2' : 'px-2 py-0.5 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center font-medium rounded-md border ${bg} ${sizeClasses}`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
      <span>{label}</span>
      {score != null && (
        <span className="font-mono font-semibold ml-0.5 opacity-90">({score})</span>
      )}
    </span>
  );
}
