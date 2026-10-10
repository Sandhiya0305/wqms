const test = require('node:test');
const assert = require('node:assert');
const { detectAnomalies } = require('../src/services/anomalyDetector');

test('Anomaly Detector: Flags threshold violations', () => {
  const reading = {
    ph: 5.2, // Below 6.5
    turbidity_ntu: 28.0, // Above 5.0
    do_mg_l: 7.0,
    tds_ppm: 200,
    temp_c: 22.0
  };

  const anomalies = detectAnomalies(reading, []);
  assert.ok(anomalies.length >= 2, `Expected at least 2 anomalies, got ${anomalies.length}`);
  
  const phAnomaly = anomalies.find(a => a.parameter === 'ph');
  assert.ok(phAnomaly);
  assert.strictEqual(phAnomaly.anomaly_type, 'THRESHOLD_EXCEEDED');

  const turbAnomaly = anomalies.find(a => a.parameter === 'turbidity');
  assert.ok(turbAnomaly);
  assert.strictEqual(turbAnomaly.anomaly_type, 'THRESHOLD_EXCEEDED');
  assert.strictEqual(turbAnomaly.severity, 'CRITICAL');
});

test('Anomaly Detector: Flags sudden rate-of-change spikes', () => {
  const previous = {
    ph: 7.4,
    turbidity_ntu: 2.0,
    do_mg_l: 8.0,
    tds_ppm: 200,
    temp_c: 22.0
  };

  const current = {
    ph: 7.4,
    turbidity_ntu: 22.0, // Jumped by +20 NTU
    do_mg_l: 8.0,
    tds_ppm: 200,
    temp_c: 22.0
  };

  const anomalies = detectAnomalies(current, [previous]);
  const rateAnomaly = anomalies.find(a => a.anomaly_type === 'RATE_OF_CHANGE');
  assert.ok(rateAnomaly, 'Expected RATE_OF_CHANGE anomaly');
  assert.strictEqual(rateAnomaly.parameter, 'turbidity');
});

test('Anomaly Detector: Flags composite organic shock event', () => {
  const shockSample = {
    ph: 7.1,
    turbidity_ntu: 25.0,
    do_mg_l: 2.8, // Low DO
    tds_ppm: 750, // High TDS
    temp_c: 24.0
  };

  const anomalies = detectAnomalies(shockSample, []);
  const composite = anomalies.find(a => a.anomaly_type === 'COMPOSITE_SHOCK');
  assert.ok(composite, 'Expected COMPOSITE_SHOCK anomaly');
  assert.strictEqual(composite.severity, 'CRITICAL');
});
