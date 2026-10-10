// Telemetry Validator & Data Cleanser

function validateTelemetryPayload(payload) {
  const errors = [];
  const cleaned = {};

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Invalid payload format: expected JSON object'] };
  }

  // Station ID
  if (!payload.station_id || typeof payload.station_id !== 'string') {
    errors.push('Missing or invalid station_id');
  } else {
    cleaned.station_id = payload.station_id.trim();
  }

  // pH (0.0 to 14.0)
  const ph = Number(payload.ph);
  if (isNaN(ph) || ph < 0 || ph > 14) {
    errors.push(`Invalid pH reading: ${payload.ph} (must be between 0.0 and 14.0)`);
  } else {
    cleaned.ph = Math.round(ph * 100) / 100;
  }

  // Turbidity (0.0 to 1000 NTU)
  const turbidity = Number(payload.turbidity_ntu ?? payload.turbidity);
  if (isNaN(turbidity) || turbidity < 0 || turbidity > 2000) {
    errors.push(`Invalid turbidity reading: ${payload.turbidity_ntu} (must be >= 0 NTU)`);
  } else {
    cleaned.turbidity_ntu = Math.round(turbidity * 100) / 100;
  }

  // Dissolved Oxygen (0.0 to 20.0 mg/L)
  const doVal = Number(payload.do_mg_l ?? payload.do);
  if (isNaN(doVal) || doVal < 0 || doVal > 30) {
    errors.push(`Invalid dissolved oxygen reading: ${payload.do_mg_l} (must be 0-30 mg/L)`);
  } else {
    cleaned.do_mg_l = Math.round(doVal * 100) / 100;
  }

  // TDS (0 to 5000 ppm)
  const tds = Number(payload.tds_ppm ?? payload.tds);
  if (isNaN(tds) || tds < 0 || tds > 10000) {
    errors.push(`Invalid TDS reading: ${payload.tds_ppm} (must be >= 0 ppm)`);
  } else {
    cleaned.tds_ppm = Math.round(tds * 10) / 10;
  }

  // Temperature (-5 to 60 °C)
  const temp = Number(payload.temp_c ?? payload.temperature);
  if (isNaN(temp) || temp < -10 || temp > 70) {
    errors.push(`Invalid temperature reading: ${payload.temp_c}`);
  } else {
    cleaned.temp_c = Math.round(temp * 10) / 10;
  }

  // Conductivity (optional, defaults to tds * 1.56)
  if (payload.conductivity_us != null && !isNaN(Number(payload.conductivity_us))) {
    cleaned.conductivity_us = Math.round(Number(payload.conductivity_us) * 10) / 10;
  } else {
    cleaned.conductivity_us = Math.round(cleaned.tds_ppm * 1.56 * 10) / 10;
  }

  // Device telemetry metadata
  cleaned.battery_pct = payload.battery_pct != null ? Math.min(100, Math.max(0, parseInt(payload.battery_pct))) : 95;
  cleaned.signal_rssi = payload.signal_rssi != null ? parseInt(payload.signal_rssi) : -65;
  cleaned.timestamp = payload.timestamp ? new Date(payload.timestamp).toISOString() : new Date().toISOString();
  cleaned.raw_payload = payload;

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? cleaned : null
  };
}

module.exports = {
  validateTelemetryPayload
};
