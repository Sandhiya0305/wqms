import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function MetricCard({ title, value, unit, standardLimit, status, icon: Icon, delta, description }) {
  const isOutOfSpec = status === 'EXCEEDED' || status === 'WARNING' || status === 'CRITICAL';

  return (
    <div className={`p-4 rounded-none border transition-colors ${
      isOutOfSpec 
        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800' 
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500'
    }`}>
      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
        <span className="flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
          {title}
        </span>
        {standardLimit && (
          <span className="font-mono text-[10px] text-slate-400">
            Std: {standardLimit}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between mt-2">
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold tracking-tight font-mono ${
            isOutOfSpec ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
          }`}>
            {value != null ? value : '--'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{unit}</span>
        </div>

        {delta != null && (
          <div className={`flex items-center text-xs font-mono font-semibold ${
            delta > 0 ? 'text-amber-600 dark:text-amber-400' : delta < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
          }`}>
            {delta > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : delta < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <Minus className="w-3 h-3" />}
            {Math.abs(delta)}
          </div>
        )}
      </div>

      {description && (
        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 border-t border-slate-100 dark:border-slate-800/60 pt-2">
          {description}
        </div>
      )}
    </div>
  );
}
