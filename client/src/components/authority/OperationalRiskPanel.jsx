import React from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

export default function OperationalRiskPanel() {
  const { selectedStationId, riskScores, stations } = useTelemetry();

  const currentRisk = riskScores.find(r => r.station_id === selectedStationId);
  const activeStation = stations.find(s => s.id === selectedStationId);

  const riskScore = currentRisk?.risk_score ?? 15;
  const riskLevel = currentRisk?.risk_level ?? 'LOW';
  const factors = currentRisk?.contributing_factors ?? [];
  const recommendations = currentRisk?.recommended_actions ?? [];

  // Color mapping based on 0-100 score
  let scoreColor = 'text-emerald-600 dark:text-emerald-400';
  let barBg = 'bg-emerald-600';
  let badgeBorder = 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300';

  if (riskScore >= 75) {
    scoreColor = 'text-rose-600 dark:text-rose-400';
    barBg = 'bg-rose-600';
    badgeBorder = 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300';
  } else if (riskScore >= 50) {
    scoreColor = 'text-amber-600 dark:text-amber-400';
    barBg = 'bg-amber-500';
    badgeBorder = 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300';
  } else if (riskScore >= 25) {
    scoreColor = 'text-blue-600 dark:text-blue-400';
    barBg = 'bg-blue-600';
    badgeBorder = 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300';
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Operational Risk Assessment
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Automated triage: {activeStation?.name || selectedStationId}</p>
          </div>
          <span className={`px-2 py-0.5 text-xs font-bold rounded-none border font-mono ${badgeBorder}`}>
            {riskLevel} RISK
          </span>
        </div>

        {/* Score Meter */}
        <div className="mt-4 p-4 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Composite Risk Index</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-black font-mono tracking-tight ${scoreColor}`}>
                {riskScore}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-none overflow-hidden">
            <div 
              className={`h-full rounded-none transition-all duration-300 ${barBg}`}
              style={{ width: `${Math.max(5, Math.min(100, riskScore))}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
            <span>0 Low</span>
            <span>25 Moderate</span>
            <span>50 High</span>
            <span>75+ Critical</span>
          </div>
        </div>

        {/* Contributing Factors */}
        <div className="mt-4">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Contributing Factors</h4>
          {factors.length === 0 ? (
            <div className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-none border border-slate-200 dark:border-slate-800">
              No elevated risk factors detected. Parameters are within normal baseline.
            </div>
          ) : (
            <ul className="space-y-1.5">
              {factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-none border border-slate-200 dark:border-slate-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actionable Recommendations */}
        <div className="mt-4">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Recommended Actions</h4>
          {recommendations.length === 0 ? (
            <div className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-none border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Routine monitoring. No operator intervention required.</span>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-blue-50/50 dark:bg-blue-950/20 p-2 rounded-none border border-blue-200 dark:border-blue-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
