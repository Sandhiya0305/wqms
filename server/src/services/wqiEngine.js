// Weighted Arithmetic Water Quality Index (WAWQI) Engine
// Implements WHO & BIS standard water quality evaluation

const { STANDARDS, WQI_CLASSES } = require('../config');

// Calculate proportional unit weights (wi) normalized such that sum(wi) = 1.0
function getNormalizedWeights() {
  const params = ['ph', 'turbidity', 'dissolvedOxygen', 'tds', 'temperature'];
  let totalInverse = 0;
  
  params.forEach(param => {
    const std = STANDARDS[param];
    const range = Math.abs(std.standardLimit - std.ideal);
    totalInverse += 1.0 / range;
  });

  const kConstant = 1.0 / totalInverse;
  const weights = {};
  let totalSum = 0;

  params.forEach(param => {
    const std = STANDARDS[param];
    const range = Math.abs(std.standardLimit - std.ideal);
    weights[param] = kConstant / range;
    totalSum += weights[param];
  });

  return weights;
}

const WEIGHTS = getNormalizedWeights();

/**
 * Calculate sub-index quality rating (qi) for a single parameter
 */
function calculateSubIndex(paramName, value) {
  const std = STANDARDS[paramName];
  if (!std) return 0;

  const actual = Number(value);
  const ideal = std.ideal;
  const standardLimit = std.standardLimit;

  // Handle pH specifically (bilateral distance from 7.0)
  if (paramName === 'ph') {
    const denom = standardLimit - ideal; // 8.5 - 7.0 = 1.5
    return 100.0 * (Math.abs(actual - ideal) / denom);
  }

  // Handle Dissolved Oxygen (higher is better, saturation at 14.6 mg/L)
  if (paramName === 'dissolvedOxygen') {
    const denom = ideal - standardLimit; // 14.6 - 5.0 = 9.6
    const deficit = ideal - actual;
    return Math.max(0, 100.0 * (deficit / denom));
  }

  // Standard unidirectional limits (Turbidity, TDS, etc.)
  const denom = Math.abs(standardLimit - ideal);
  return Math.max(0, 100.0 * (Math.abs(actual - ideal) / denom));
}

/**
 * Calculate composite WQI score for a telemetry sample
 * @param {Object} sample - { ph, turbidity_ntu, do_mg_l, tds_ppm, temp_c }
 * @returns {Object} - { wqi_score, wqi_status, class_label, sub_indices, advice, color }
 */
function calculateWQI(sample) {
  const subIndices = {
    ph: calculateSubIndex('ph', sample.ph),
    turbidity: calculateSubIndex('turbidity', sample.turbidity_ntu),
    dissolvedOxygen: calculateSubIndex('dissolvedOxygen', sample.do_mg_l),
    tds: calculateSubIndex('tds', sample.tds_ppm),
    temperature: calculateSubIndex('temperature', sample.temp_c)
  };

  let weightedSum = 0;
  let weightTotal = 0;

  for (const [key, subIndex] of Object.entries(subIndices)) {
    const weight = WEIGHTS[key] || 0.2;
    weightedSum += subIndex * weight;
    weightTotal += weight;
  }

  const rawWqi = weightedSum / (weightTotal || 1.0);
  const roundedWqi = Math.round(rawWqi * 10) / 10;

  // Determine classification
  let matchedClass = WQI_CLASSES[WQI_CLASSES.length - 1];
  for (const cls of WQI_CLASSES) {
    if (roundedWqi >= cls.min && roundedWqi <= cls.max) {
      matchedClass = cls;
      break;
    }
  }

  return {
    wqi_score: roundedWqi,
    wqi_status: matchedClass.status,
    class_label: matchedClass.label,
    color: matchedClass.color,
    advice: matchedClass.advice,
    sub_indices: subIndices,
    is_safe: matchedClass.status === 'SAFE'
  };
}

module.exports = {
  calculateWQI,
  calculateSubIndex,
  WEIGHTS
};
