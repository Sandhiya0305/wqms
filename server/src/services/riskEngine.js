// Operational Risk Estimation & Action Recommendation Engine

const { RISK_WEIGHTS } = require('../config');

/**
 * Estimate operational risk score (0 to 100) and generate triage action plan
 * @param {Object} station - station record with criticality_weight, type, name
 * @param {Object} wqiResult - result from wqiEngine
 * @param {Array} anomalies - array of detected anomalies from current reading
 * @param {Array} historyWindow - recent readings for persistence estimation
 * @returns {Object} - { risk_score, risk_level, contributing_factors, recommended_actions }
 */
function estimateOperationalRisk(station, wqiResult, anomalies = [], historyWindow = []) {
  const factors = [];
  const actions = [];

  // 1. WQI Score Severity Factor (0 to 100)
  // Normalizes WQI (0-25 -> ~5, 50 -> ~40, 75 -> ~70, 100+ -> 100)
  let wqiScoreComponent = Math.min(100, Math.max(0, (wqiResult.wqi_score / 100) * 100));
  if (wqiResult.wqi_score > 75) {
    factors.push(`Severe WQI degradation: score is ${wqiResult.wqi_score} (${wqiResult.class_label})`);
  } else if (wqiResult.wqi_score > 50) {
    factors.push(`Moderate WQI degradation: score is ${wqiResult.wqi_score} (${wqiResult.class_label})`);
  }

  // 2. Anomaly Shock Component (0 to 100)
  let anomalyScoreComponent = 0;
  if (anomalies.length > 0) {
    const hasCritical = anomalies.some(a => a.severity === 'CRITICAL');
    const hasHigh = anomalies.some(a => a.severity === 'HIGH');
    
    if (hasCritical) {
      anomalyScoreComponent = 100;
      factors.push('Critical anomaly detected (hazardous chemical or physical threshold violation)');
    } else if (hasHigh) {
      anomalyScoreComponent = 70;
      factors.push('High-severity anomaly triggered (abnormal rate of change or standard exceedance)');
    } else {
      anomalyScoreComponent = 40;
      factors.push('Statistical deviation flagged by anomaly detection engine');
    }
  }

  // 3. Persistence Component (0 to 100)
  // Measures what percentage of recent window readings were in unsafe / caution state
  let persistenceScoreComponent = 0;
  if (historyWindow.length > 0) {
    const unsafeCount = historyWindow.filter(h => h.wqi_status !== 'SAFE').length;
    const unsafeRatio = unsafeCount / historyWindow.length;
    persistenceScoreComponent = Math.min(100, Math.round(unsafeRatio * 100));
    
    if (unsafeRatio > 0.6) {
      factors.push(`High persistence: ${Math.round(unsafeRatio * 100)}% of recent readings remain in non-potable condition`);
    }
  }

  // 4. Source Criticality Weight Multiplier (0.5 to 1.0)
  const criticality = station.criticality_weight || 1.0;
  if (criticality >= 0.9) {
    factors.push(`High infrastructure criticality: ${station.name} directly impacts public drinking supply`);
  }

  // Weighted Composite Risk Calculation
  const rawRisk = (
    wqiScoreComponent * RISK_WEIGHTS.wqiSeverity +
    persistenceScoreComponent * RISK_WEIGHTS.persistenceHours +
    anomalyScoreComponent * RISK_WEIGHTS.acuteSpike +
    (criticality * 100) * RISK_WEIGHTS.sourceCriticality
  );

  const riskScore = Math.min(100, Math.max(0, Math.round(rawRisk * 10) / 10));

  // Determine Risk Level
  let riskLevel = 'LOW';
  if (riskScore >= 75) {
    riskLevel = 'CRITICAL';
  } else if (riskScore >= 50) {
    riskLevel = 'HIGH';
  } else if (riskScore >= 25) {
    riskLevel = 'MODERATE';
  }

  // Generate Concrete Triage Recommendations
  if (riskLevel === 'CRITICAL') {
    if (station.type === 'TREATMENT_PLANT' || station.type === 'RIVER') {
      actions.push('EMERGENCY: Halt intake pumps or divert raw river water to retention holding pond immediately.');
      actions.push('Increase primary coagulant dosing (Alum/Polymer) and prepare secondary emergency chlorination.');
      actions.push('Dispatch hazardous materials rapid response inspection team to upstream coordinates.');
    } else if (station.type === 'TAP_NETWORK') {
      actions.push('PUBLIC HEALTH NOTICE: Issue immediate Boil Water Advisory to consumers in the affected district.');
      actions.push('Isolate affected distribution sector valve and initiate high-pressure main line flushing.');
    } else {
      actions.push('Emergency containment: Restrict public access and trigger manual laboratory verification.');
    }
  } else if (riskLevel === 'HIGH') {
    actions.push('Elevate operational monitoring frequency to 1-minute intervals.');
    actions.push('Inspect filtration beds for clogging or breakthrough (backwash cycles recommended).');
    actions.push('Notify district water quality supervisor and prepare auxiliary dosing pumps.');
  } else if (riskLevel === 'MODERATE') {
    actions.push('Routine preventive watch: verify sensor calibration and check upstream weather/runoff forecast.');
    actions.push('Log minor parameter variance in daily utility shift logbook.');
  } else {
    actions.push('System optimal: Maintain standard baseline monitoring and automated telemetry.');
  }

  return {
    risk_score: riskScore,
    risk_level: riskLevel,
    contributing_factors: factors,
    recommended_actions: actions
  };
}

module.exports = {
  estimateOperationalRisk
};
