// Multi-Method Anomaly Detection Engine

const { STANDARDS, ANOMALY_THRESHOLDS } = require('../config');

/**
 * Detect anomalies in a telemetry sample against historical context
 * @param {Object} current - cleaned telemetry reading
 * @param {Array} historyWindow - recent readings for this station (ordered oldest to newest)
 * @returns {Array} - list of detected anomalies
 */
function detectAnomalies(current, historyWindow = []) {
  const anomalies = [];
  const prevReading = historyWindow.length > 0 ? historyWindow[historyWindow.length - 1] : null;

  // 1. Static Threshold Violations (Regulatory exceedances)
  // pH Check
  if (current.ph < STANDARDS.ph.minPermissible) {
    anomalies.push({
      parameter: 'ph',
      detected_value: current.ph,
      baseline_value: STANDARDS.ph.minPermissible,
      anomaly_type: 'THRESHOLD_EXCEEDED',
      severity: current.ph < 5.5 ? 'CRITICAL' : 'HIGH',
      description: `Acidic water detected: pH ${current.ph} is below the WHO permissible minimum of ${STANDARDS.ph.minPermissible}`
    });
  } else if (current.ph > STANDARDS.ph.maxPermissible) {
    anomalies.push({
      parameter: 'ph',
      detected_value: current.ph,
      baseline_value: STANDARDS.ph.maxPermissible,
      anomaly_type: 'THRESHOLD_EXCEEDED',
      severity: current.ph > 9.5 ? 'CRITICAL' : 'MEDIUM',
      description: `Alkaline water detected: pH ${current.ph} exceeds WHO permissible limit of ${STANDARDS.ph.maxPermissible}`
    });
  }

  // Turbidity Check
  if (current.turbidity_ntu > STANDARDS.turbidity.standardLimit) {
    const isSevere = current.turbidity_ntu > 25.0;
    anomalies.push({
      parameter: 'turbidity',
      detected_value: current.turbidity_ntu,
      baseline_value: STANDARDS.turbidity.standardLimit,
      anomaly_type: 'THRESHOLD_EXCEEDED',
      severity: isSevere ? 'CRITICAL' : 'HIGH',
      description: `Elevated turbidity: ${current.turbidity_ntu} NTU exceeds maximum allowable limit of ${STANDARDS.turbidity.standardLimit} NTU`
    });
  }

  // Dissolved Oxygen Check
  if (current.do_mg_l < STANDARDS.dissolvedOxygen.minPermissible) {
    const isHypoxic = current.do_mg_l < 3.0;
    anomalies.push({
      parameter: 'dissolved_oxygen',
      detected_value: current.do_mg_l,
      baseline_value: STANDARDS.dissolvedOxygen.minPermissible,
      anomaly_type: 'THRESHOLD_EXCEEDED',
      severity: isHypoxic ? 'CRITICAL' : 'HIGH',
      description: `Low dissolved oxygen: ${current.do_mg_l} mg/L indicates hypoxia risk (standard min: ${STANDARDS.dissolvedOxygen.minPermissible} mg/L)`
    });
  }

  // TDS Check
  if (current.tds_ppm > STANDARDS.tds.standardLimit) {
    const isSevere = current.tds_ppm > 1000.0;
    anomalies.push({
      parameter: 'tds',
      detected_value: current.tds_ppm,
      baseline_value: STANDARDS.tds.standardLimit,
      anomaly_type: 'THRESHOLD_EXCEEDED',
      severity: isSevere ? 'CRITICAL' : 'MEDIUM',
      description: `High dissolved solids: ${current.tds_ppm} ppm exceeds recommended limit of ${STANDARDS.tds.standardLimit} ppm`
    });
  }

  // 2. Rate-of-Change / Gradient Spikes (Immediate delta from previous reading)
  if (prevReading) {
    const deltaPh = Math.abs(current.ph - prevReading.ph);
    if (deltaPh >= ANOMALY_THRESHOLDS.rateOfChange.ph) {
      anomalies.push({
        parameter: 'ph',
        detected_value: current.ph,
        baseline_value: prevReading.ph,
        anomaly_type: 'RATE_OF_CHANGE',
        severity: 'HIGH',
        description: `Rapid pH fluctuation: shifted by ${deltaPh.toFixed(2)} units since previous reading`
      });
    }

    const deltaTurb = Math.abs(current.turbidity_ntu - prevReading.turbidity_ntu);
    if (deltaTurb >= ANOMALY_THRESHOLDS.rateOfChange.turbidity) {
      anomalies.push({
        parameter: 'turbidity',
        detected_value: current.turbidity_ntu,
        baseline_value: prevReading.turbidity_ntu,
        anomaly_type: 'RATE_OF_CHANGE',
        severity: 'HIGH',
        description: `Sudden turbidity surge: jumped by +${deltaTurb.toFixed(1)} NTU`
      });
    }

    const deltaDO = Math.abs(current.do_mg_l - prevReading.do_mg_l);
    if (deltaDO >= ANOMALY_THRESHOLDS.rateOfChange.do && current.do_mg_l < prevReading.do_mg_l) {
      anomalies.push({
        parameter: 'dissolved_oxygen',
        detected_value: current.do_mg_l,
        baseline_value: prevReading.do_mg_l,
        anomaly_type: 'RATE_OF_CHANGE',
        severity: 'HIGH',
        description: `Rapid DO depletion: plunged by -${deltaDO.toFixed(2)} mg/L`
      });
    }

    const deltaTds = Math.abs(current.tds_ppm - prevReading.tds_ppm);
    if (deltaTds >= ANOMALY_THRESHOLDS.rateOfChange.tds) {
      anomalies.push({
        parameter: 'tds',
        detected_value: current.tds_ppm,
        baseline_value: prevReading.tds_ppm,
        anomaly_type: 'RATE_OF_CHANGE',
        severity: 'HIGH',
        description: `Sudden TDS spike: increased by +${deltaTds.toFixed(1)} ppm`
      });
    }
  }

  // 3. Statistical Z-Score Outlier Detection
  if (historyWindow.length >= 8) {
    const params = [
      { key: 'ph', val: current.ph, label: 'pH' },
      { key: 'turbidity_ntu', val: current.turbidity_ntu, label: 'Turbidity' },
      { key: 'do_mg_l', val: current.do_mg_l, label: 'Dissolved Oxygen' },
      { key: 'tds_ppm', val: current.tds_ppm, label: 'TDS' }
    ];

    params.forEach(p => {
      const values = historyWindow.map(h => Number(h[p.key])).filter(v => !isNaN(v));
      if (values.length >= 8) {
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        if (stdDev > 0.05) {
          const zScore = Math.abs(p.val - mean) / stdDev;
          if (zScore >= ANOMALY_THRESHOLDS.zScoreThreshold) {
            // Avoid duplicate if already tagged
            const alreadyTagged = anomalies.some(a => a.parameter === p.key && a.anomaly_type === 'RATE_OF_CHANGE');
            if (!alreadyTagged) {
              anomalies.push({
                parameter: p.key,
                detected_value: p.val,
                baseline_value: Math.round(mean * 100) / 100,
                anomaly_type: 'STATISTICAL_ZSCORE',
                severity: zScore > 4.0 ? 'HIGH' : 'MEDIUM',
                description: `Statistical outlier in ${p.label}: Z-Score ${zScore.toFixed(2)} exceeds baseline standard deviation`
              });
            }
          }
        }
      }
    });
  }

  // 4. Composite Correlation: Organic/Industrial Contamination
  if (current.do_mg_l <= 3.5 && (current.turbidity_ntu >= 15.0 || current.tds_ppm >= 600.0)) {
    anomalies.push({
      parameter: 'composite_health',
      detected_value: current.do_mg_l,
      baseline_value: null,
      anomaly_type: 'COMPOSITE_SHOCK',
      severity: 'CRITICAL',
      description: 'Critical Composite Event: Low DO combined with elevated Turbidity/TDS indicates active organic or industrial discharge'
    });
  }

  return anomalies;
}

module.exports = {
  detectAnomalies
};
