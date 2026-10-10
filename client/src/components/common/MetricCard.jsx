import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function MetricCard({ title, value, unit, standardLimit, status, icon: Icon, delta, description }) {
  const isOutOfSpec = status === 'EXCEEDED' || status === 'WARNING' || status === 'CRITICAL';

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isOutOfSpec 
        ? 'bg-rose-950/20 border-rose-500/40 shadow-sm shadow-rose-950/40' 
        : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
    }`}>
      <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
        <span className="flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-sky-400" />}
          {title}
        </span>
        {standardLimit && (
          <span className="font-mono text-[11px] text-slate-400">
            Std: {standardLimit}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between mt-2">
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold tracking-tight font-mono ${isOutOfSpec ? 'text-rose-400' : 'text-white'}`}>
            {value != null ? value : '--'}
          </span>
          <span className="text-xs text-slate-400 font-medium">{unit}</span>
        </div>

        {delta != null && (
          <div className={`flex items-center text-xs font-mono ${delta > 0 ? 'text-amber-400' : delta < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
            {delta > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : delta < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <Minus className="w-3 h-3" />}
            {Math.abs(delta)}
          </div>
        )}
      </div>

      {description && (
        <div className="mt-2 text-[11px] text-slate-400 line-clamp-1">
          {description}
        </div>
      )}
    </div>
  );
}
