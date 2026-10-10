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
  let scoreColor = 'text-emerald-400';
  let barBg = 'bg-emerald-500';
  let badgeBorder = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';

  if (riskScore >= 75) {
    scoreColor = 'text-rose-400';
    barBg = 'bg-rose-500';
    badgeBorder = 'border-rose-500/30 bg-rose-500/10 text-rose-400 animate-pulse';
  } else if (riskScore >= 50) {
    scoreColor = 'text-amber-400';
    barBg = 'bg-amber-500';
    badgeBorder = 'border-amber-500/30 bg-amber-500/10 text-amber-400';
  } else if (riskScore >= 25) {
    scoreColor = 'text-yellow-400';
    barBg = 'bg-yellow-500';
    badgeBorder = 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400';
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Operational Risk & Early Warning
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Automated triage for {activeStation?.name || selectedStationId}</p>
          </div>
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border font-mono ${badgeBorder}`}>
            {riskLevel} RISK
          </span>
        </div>

        {/* Score Meter */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Composite Risk Score</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-black font-mono tracking-tight ${scoreColor}`}>
                {riskScore}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${barBg}`}
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
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Contributing Factors</h4>
          {factors.length === 0 ? (
            <div className="text-xs text-slate-400 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
              No elevated risk factors detected. All physical and chemical readings are within baseline limits.
            </div>
          ) : (
            <ul className="space-y-1.5">
              {factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actionable Recommendations */}
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Recommended Operational Actions</h4>
          <div className="space-y-2">
            {recommendations.map((action, idx) => (
              <div 
                key={idx} 
                className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                  riskScore >= 75 
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-200' 
                    : riskScore >= 50
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                }`}
              >
                <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Source Criticality: <strong>{activeStation?.criticality_weight ?? 1.0}x</strong></span>
        <span>Infrastructure Type: <strong className="text-sky-400">{activeStation?.type}</strong></span>
      </div>
    </div>
  );
}
