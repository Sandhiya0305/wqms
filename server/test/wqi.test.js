const test = require('node:test');
const assert = require('node:assert');
const { calculateWQI, calculateSubIndex } = require('../src/services/wqiEngine');

test('WQI Engine: Sub-index for pH', () => {
  // Neutral pH 7.0 should produce sub-index 0
  const subIndexNeutral = calculateSubIndex('ph', 7.0);
  assert.strictEqual(subIndexNeutral, 0);

  // Limit pH 8.5 should produce sub-index 100
  const subIndexLimit = calculateSubIndex('ph', 8.5);
  assert.strictEqual(Math.round(subIndexLimit), 100);

  // Acidic pH 5.5 should produce sub-index 100
  const subIndexAcid = calculateSubIndex('ph', 5.5);
  assert.strictEqual(Math.round(subIndexAcid), 100);
});

test('WQI Engine: Pristine water results in Excellent rating', () => {
  const sample = {
    ph: 7.1,
    turbidity_ntu: 0.5,
    do_mg_l: 8.5,
    tds_ppm: 150,
    temp_c: 21.0
  };

  const result = calculateWQI(sample);
  assert.ok(result.wqi_score < 25, `Expected score < 25, got ${result.wqi_score}`);
  assert.strictEqual(result.wqi_status, 'SAFE');
  assert.strictEqual(result.class_label, 'Excellent');
  assert.strictEqual(result.is_safe, true);
});

test('WQI Engine: Severe contamination results in Hazardous rating', () => {
  const pollutedSample = {
    ph: 4.2,             // Very acidic
    turbidity_ntu: 45.0, // Highly turbid
    do_mg_l: 1.5,        // Severe hypoxia
    tds_ppm: 1200,       // Very high dissolved solids
    temp_c: 28.0
  };

  const result = calculateWQI(pollutedSample);
  assert.ok(result.wqi_score > 100, `Expected score > 100, got ${result.wqi_score}`);
  assert.strictEqual(result.wqi_status, 'CRITICAL');
  assert.strictEqual(result.is_safe, false);
});
