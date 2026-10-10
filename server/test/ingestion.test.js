const test = require('node:test');
const assert = require('node:assert');
const { validateTelemetryPayload } = require('../src/services/validator');
const simulator = require('../src/services/simulator');
const db = require('../src/db');
const { seedDatabaseIfEmpty } = require('../src/seed/historicalData');

// Ensure DB is initialized for testing
seedDatabaseIfEmpty(db);

test('Validator: Rejects invalid or out-of-range payloads', () => {
  const invalid = {
    station_id: 'TRICHY_KAVERI_01',
    ph: 19.5, // impossible pH
    turbidity_ntu: 'not-a-number'
  };

  const result = validateTelemetryPayload(invalid);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.length >= 2);
});

test('Ingestion Pipeline: Processes valid reading end-to-end', () => {
  const valid = {
    station_id: 'TRICHY_KAVERI_01',
    ph: 7.35,
    turbidity_ntu: 2.1,
    do_mg_l: 7.8,
    tds_ppm: 210,
    temp_c: 21.5,
    battery_pct: 94,
    signal_rssi: -60
  };

  const outcome = simulator.processIngestion(valid);
  assert.strictEqual(outcome.success, true);
  assert.ok(outcome.telemetry_id > 0);
  assert.ok(outcome.wqi.wqi_score > 0);
  assert.ok(outcome.risk.risk_score >= 0);
});
