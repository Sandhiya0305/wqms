// Water Quality Monitoring Platform - Central Configuration & Standards

module.exports = {
  PORT: process.env.PORT || 3001,
  MQTT_PORT: process.env.MQTT_PORT || 1883,
  WS_PATH: '/ws',
  API_KEY: process.env.API_KEY || 'wq_device_token_demo_2026',

  // WHO & BIS Drinking Water Quality Standard Permissible Limits (Si)
  STANDARDS: {
    ph: {
      minPermissible: 6.5,
      maxPermissible: 8.5,
      ideal: 7.0,
      standardLimit: 8.5,
      unitWeight: 0.22, // Unit weight (wi) in WAWQI calculation
      unit: 'pH'
    },
    turbidity: {
      ideal: 0.0,
      standardLimit: 5.0, // WHO max recommended is 5 NTU (1 NTU ideal)
      maxPermissible: 5.0,
      unitWeight: 0.25,
      unit: 'NTU'
    },
    dissolvedOxygen: {
      ideal: 14.6, // Saturation at 20°C
      standardLimit: 5.0, // Minimum healthy DO is 5.0 mg/L (below 4 is hypoxia)
      minPermissible: 5.0,
      unitWeight: 0.28,
      unit: 'mg/L'
    },
    tds: {
      ideal: 0.0,
      standardLimit: 500.0, // WHO recommended limit 500 ppm
      maxPermissible: 500.0,
      unitWeight: 0.15,
      unit: 'ppm'
    },
    temperature: {
      ideal: 20.0,
      standardLimit: 30.0,
      maxPermissible: 30.0,
      unitWeight: 0.10,
      unit: '°C'
    }
  },

  // WQI Grading Scales
  WQI_CLASSES: [
    { min: 0, max: 25, label: 'Excellent', status: 'SAFE', color: '#10B981', advice: 'Pristine water. Safe for direct consumption after standard disinfection.' },
    { min: 25.01, max: 50, label: 'Good', status: 'SAFE', color: '#3B82F6', advice: 'Potable water. Meets standard municipal drinking criteria.' },
    { min: 50.01, max: 75, label: 'Poor', status: 'CAUTION', color: '#F59E0B', advice: 'Substandard quality. Requires enhanced filtration and purification.' },
    { min: 75.01, max: 100, label: 'Very Poor', status: 'WARNING', color: '#F97316', advice: 'Unsafe for direct drinking. Suitable only for irrigation or industrial cooling.' },
    { min: 100.01, max: Infinity, label: 'Unsuitable / Hazardous', status: 'CRITICAL', color: '#EF4444', advice: 'Severe hazard. Immediate boil water / shut-off advisory required.' }
  ],

  // Anomaly Detection Thresholds
  ANOMALY_THRESHOLDS: {
    // Sudden change over 5-minute interval
    rateOfChange: {
      ph: 1.2,          // Delta > 1.2 pH units in 5 min
      turbidity: 15.0,  // Delta > 15 NTU in 5 min
      do: 2.5,          // Delta > 2.5 mg/L in 5 min
      tds: 150.0        // Delta > 150 ppm in 5 min
    },
    zScoreThreshold: 2.8, // Statistical outlier threshold (>2.8 std deviations)
    rollingWindowSize: 30 // 30 reading window for rolling stats
  },

  // Operational Risk Weights
  RISK_WEIGHTS: {
    wqiSeverity: 0.40,
    persistenceHours: 0.25,
    sourceCriticality: 0.20,
    acuteSpike: 0.15
  }
};
