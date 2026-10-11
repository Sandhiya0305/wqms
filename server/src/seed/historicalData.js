// Historical Dataset Generator & Database Seeder
// Multi-City WaterGuard Architecture with Trichy District focus

const { STATIONS } = require('./stationsData');
const { calculateWQI } = require('../services/wqiEngine');
const { detectAnomalies } = require('../services/anomalyDetector');
const { estimateOperationalRisk } = require('../services/riskEngine');

function seedDatabaseIfEmpty(db) {
  const existingStations = db.getStations();
  if (existingStations.length >= STATIONS.length) {
    console.log(`[Database] Database already fully seeded with ${existingStations.length} stations.`);
    return;
  }

  console.log('[Database] Seeding multi-city stations, historical telemetry, and role-specific data...');

  // 1. Insert Stations
  for (const st of STATIONS) {
    db.upsertStation(st);

    // Seed default threshold overrides & valve status for Municipal Engineer
    db.upsertThresholdOverride({
      station_id: st.id,
      ph_min: 6.5,
      ph_max: 8.5,
      turbidity_max: 5.0,
      do_min: 5.0,
      tds_max: 500.0,
      valve_status: 'OPEN',
      last_calibrated_by: 'R. Sharma (Municipal Engineer)'
    });
  }

  // 2. Generate 48 hours of historical readings (60 points per station)
  const now = Date.now();
  const thirtyMin = 30 * 60 * 1000;
  const numPoints = 50;

  for (const station of STATIONS) {
    const historyForStation = [];

    for (let i = numPoints - 1; i >= 0; i--) {
      const timestamp = new Date(now - i * thirtyMin).toISOString();
      const timeHour = new Date(now - i * thirtyMin).getHours();

      // Diurnal temperature variations
      const tempVariation = Math.sin((timeHour - 8) * (Math.PI / 12)) * 2.5;
      let basePh, baseTurb, baseDo, baseTds, baseTemp, baseChlorine, baseNitrate;

      switch (station.type) {
        case 'RIVER':
          basePh = 7.45 + (Math.random() * 0.3 - 0.15);
          baseTurb = 3.4 + (Math.random() * 1.5 - 0.6);
          baseDo = 8.1 + (Math.random() * 0.6 - 0.3);
          baseTds = 160 + (Math.random() * 20 - 10);
          baseTemp = 26.5 + tempVariation;
          baseChlorine = 0.1;
          baseNitrate = 8.5;
          break;

        case 'TREATMENT_PLANT':
          basePh = 7.25 + (Math.random() * 0.2 - 0.1);
          baseTurb = 0.8 + (Math.random() * 0.3 - 0.15);
          baseDo = 8.3 + (Math.random() * 0.4 - 0.2);
          baseTds = 180 + (Math.random() * 15 - 7);
          baseTemp = 25.5 + tempVariation * 0.5;
          baseChlorine = 0.8;
          baseNitrate = 5.2;
          break;

        case 'TAP_NETWORK':
          basePh = 7.2 + (Math.random() * 0.25 - 0.1);
          baseTurb = 1.2 + (Math.random() * 0.5 - 0.2);
          baseDo = 7.8 + (Math.random() * 0.5 - 0.25);
          baseTds = 210 + (Math.random() * 18 - 9);
          baseTemp = 26.0 + tempVariation * 0.5;
          baseChlorine = 0.5;
          baseNitrate = 9.0;
          break;

        case 'RESERVOIR':
          basePh = 7.6 + (Math.random() * 0.25 - 0.1);
          baseTurb = 2.4 + (Math.random() * 0.6 - 0.3);
          baseDo = 8.5 + (Math.random() * 0.5 - 0.25);
          baseTds = 150 + (Math.random() * 15 - 7);
          baseTemp = 25.0 + tempVariation;
          baseChlorine = 0.2;
          baseNitrate = 7.0;
          break;

        case 'BOREWELL':
        default:
          basePh = 7.1 + (Math.random() * 0.2 - 0.1);
          baseTurb = 0.7 + (Math.random() * 0.3 - 0.1);
          baseDo = 5.4 + (Math.random() * 0.4 - 0.2);
          baseTds = 390 + (Math.random() * 30 - 15);
          baseTemp = 27.0;
          baseChlorine = 0.0;
          baseNitrate = 18.0;
          break;
      }

      // Add a controlled historical anomaly for Rockfort Tap Grid (e.g. 6 hours ago)
      if (station.id === 'TRICHY_ROCKFORT_04' && i === 12) {
        baseTurb = 8.2;
        basePh = 6.3;
      }

      const sample = {
        station_id: station.id,
        timestamp,
        ph: Math.round(basePh * 100) / 100,
        turbidity_ntu: Math.round(baseTurb * 100) / 100,
        do_mg_l: Math.round(baseDo * 100) / 100,
        tds_ppm: Math.round(baseTds * 10) / 10,
        temp_c: Math.round(baseTemp * 10) / 10,
        chlorine_mg_l: Math.round(baseChlorine * 100) / 100,
        nitrate_mg_l: Math.round(baseNitrate * 10) / 10,
        battery_pct: Math.max(75, Math.round(100 - (i * 0.2))),
        signal_rssi: -58 - Math.floor(Math.random() * 10)
      };

      const wqiResult = calculateWQI(sample);
      const anomalies = detectAnomalies(sample, historyForStation);
      const isAnomaly = anomalies.length > 0;

      sample.wqi_score = wqiResult.wqi_score;
      sample.wqi_status = wqiResult.wqi_status;
      sample.is_anomaly = isAnomaly ? 1 : 0;

      const readingId = db.insertTelemetry(sample);
      sample.id = readingId;
      historyForStation.push(sample);

      if (isAnomaly) {
        anomalies.forEach(a => {
          db.insertAnomaly({
            telemetry_id: readingId,
            station_id: station.id,
            ...a,
            timestamp
          });
        });
      }

      // Latest reading: compute current operational risk
      if (i === 0) {
        const risk = estimateOperationalRisk(station, wqiResult, anomalies, historyForStation);
        db.saveRiskAssessment({
          station_id: station.id,
          ...risk,
          timestamp
        });
      }
    }
  }

  // 3. Seed Realistic Alerts for Trichy & other areas
  const alertsToSeed = [
    {
      station_id: 'TRICHY_ROCKFORT_04',
      title: 'Elevated Turbidity in Rockfort Commercial Tap Network',
      description: 'Turbidity registered at 7.8 NTU exceeding WHO permissible limit of 5.0 NTU following main pipeline maintenance.',
      severity: 'WARNING',
      status: 'NEW',
      source: 'SYSTEM'
    },
    {
      station_id: 'TRICHY_KAVERI_01',
      title: 'Monsoon Runoff Watch on Kaveri River Intake',
      description: 'Upstream rainfall elevated river sediment intake. Telemetry shows slight turbidity fluctuation within manageable filter margins.',
      severity: 'INFO',
      status: 'ACKNOWLEDGED',
      source: 'SYSTEM'
    },
    {
      station_id: 'TRICHY_KKNAGAR_07',
      title: 'High Nitrate Concentration in K.K. Nagar Borewell',
      description: 'Nitrate measured at 48.2 mg/L exceeding guideline threshold of 45 mg/L in groundwater sample.',
      severity: 'WARNING',
      status: 'NEW',
      source: 'SYSTEM'
    },
    {
      station_id: 'CHENNAI_CHEMBAR_09',
      title: 'Chembarambakkam Seasonal Algal Turbidity Alert',
      description: 'Reservoir surface turbidity reached 8.4 NTU. Coagulant dosing escalated.',
      severity: 'WARNING',
      status: 'NEW',
      source: 'SYSTEM'
    }
  ];

  for (const alt of alertsToSeed) {
    db.createAlert(alt);
  }

  // 4. Seed Official Public Health Advisories (Health Officer distinct feature)
  db.createPublicAdvisory({
    title: 'Precautionary Filtration Notice: Rockfort / Teppakulam',
    area: 'Rockfort & Teppakulam Commercial Ward',
    city: 'Trichy',
    type: 'HIGH_TURBIDITY',
    severity: 'WARNING',
    message: 'Temporary elevated turbidity observed in distribution lines due to scheduled pipeline flushing. Tap water is safe for washing and cooking.',
    guidelines: 'Boil or run tap water through in-home ceramic or cloth filters before direct drinking until 6:00 PM today.',
    issued_by: 'Dr. S. Patel (Chief Health Officer)'
  });

  db.createPublicAdvisory({
    title: 'Drinking Water Quality Certified Safe: Srirangam & Thillai Nagar',
    area: 'Srirangam Island & Thillai Nagar Residential',
    city: 'Trichy',
    type: 'SAFE_RESTORED',
    severity: 'INFO',
    message: 'Comprehensive automated laboratory testing confirms municipal tap water meets all standard WHO and BIS IS 10500 drinking standards.',
    guidelines: 'Safe for direct consumption from all authorized municipal connection lines.',
    issued_by: 'Dr. S. Patel (Chief Health Officer)'
  });

  // 5. Seed Citizen Reports for Trichy District
  db.createCitizenReport({
    station_id: 'TRICHY_ROCKFORT_04',
    city: 'Trichy',
    citizen_name: 'Priya Sharma',
    contact_info: '+91 94431 82910',
    issue_type: 'MURKY_COLOR',
    severity: 'MEDIUM',
    latitude: 10.8290,
    longitude: 78.6970,
    address: 'Near Teppakulam West Gate, Trichy',
    description: 'Light yellow water noticed in kitchen tap for about 10 minutes this morning.',
    status: 'INVESTIGATING',
    assigned_team: 'Ward 12 Quick Response Plumbers'
  });

  db.createCitizenReport({
    station_id: 'TRICHY_THILLAI_05',
    city: 'Trichy',
    citizen_name: 'R. Venkatesh',
    contact_info: 'venkat.trichy@gmail.com',
    issue_type: 'PIPE_LEAK',
    severity: 'HIGH',
    latitude: 10.8250,
    longitude: 78.6830,
    address: '11th Cross, Thillai Nagar East, Trichy',
    description: 'Minor underground pipe leakage seen near roadside water meter junction.',
    status: 'VERIFIED',
    assigned_team: 'Trichy Corporation Maintenance Unit'
  });

  // 6. Seed Calibration Logs for Field Operations Lead
  db.logCalibration({
    device_id: 'ESP32-TRICHY-01',
    station_id: 'TRICHY_KAVERI_01',
    technician: 'A. Kumar (Field Ops Lead)',
    ph_slope: 3.52,
    ph_offset: 0.02,
    turbidity_baseline_v: 4.12,
    notes: 'Kaveri Intake probe cleaned of river silt and recalibrated with pH 7.00 buffer.'
  });

  db.logCalibration({
    device_id: 'ESP32-TRICHY-03',
    station_id: 'TRICHY_WTP_KAMBAR_03',
    technician: 'A. Kumar (Field Ops Lead)',
    ph_slope: 3.49,
    ph_offset: -0.01,
    turbidity_baseline_v: 4.10,
    notes: 'WTP headworks telemetry calibrated; backup lithium battery verified at 100% capacity.'
  });

  console.log(`[Database] Seed complete: ${STATIONS.length} stations across Trichy, Chennai, Bengaluru, and Madurai with full historical telemetry and role data.`);
}

module.exports = {
  seedDatabaseIfEmpty
};
