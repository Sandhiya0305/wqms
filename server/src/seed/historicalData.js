// Historical Dataset Generator & Database Seeder (Aligned with WaterGuard Architecture)

const { STATIONS } = require('./stationsData');
const { calculateWQI } = require('../services/wqiEngine');
const { detectAnomalies } = require('../services/anomalyDetector');
const { estimateOperationalRisk } = require('../services/riskEngine');

function seedDatabaseIfEmpty(db) {
  const existingStations = db.getStations();
  if (existingStations.length > 0) {
    console.log(`[Database] Database already seeded with ${existingStations.length} stations.`);
    return;
  }

  console.log('[Database] Seeding initial stations and historical datasets...');

  // 1. Insert Stations
  for (const st of STATIONS) {
    db.upsertStation(st);
  }

  // 2. Generate 48 hours of historical readings (1 reading every 30 minutes = 96 readings per station)
  const now = Date.now();
  const thirtyMin = 30 * 60 * 1000;
  const numPoints = 60;

  for (const station of STATIONS) {
    const historyForStation = [];

    for (let i = numPoints - 1; i >= 0; i--) {
      const timestamp = new Date(now - i * thirtyMin).toISOString();
      const timeHour = new Date(now - i * thirtyMin).getHours();

      // Diurnal variations
      const tempVariation = Math.sin((timeHour - 8) * (Math.PI / 12)) * 2.5; // warmest at 2 PM
      let basePh, baseTurb, baseDo, baseTds, baseTemp;

      switch (station.type) {
        case 'RIVER':
          basePh = 7.4 + (Math.random() * 0.3 - 0.15);
          baseTurb = 3.2 + (Math.random() * 1.5 - 0.6);
          baseDo = 8.1 + (Math.random() * 0.6 - 0.3);
          baseTds = 142 + (Math.random() * 20 - 10);
          baseTemp = 24.8 + tempVariation;
          break;

        case 'TREATMENT_PLANT':
          basePh = 7.2 + (Math.random() * 0.2 - 0.1);
          baseTurb = 0.8 + (Math.random() * 0.3 - 0.15);
          baseDo = 8.3 + (Math.random() * 0.4 - 0.2);
          baseTds = 165 + (Math.random() * 15 - 7);
          baseTemp = 23.5 + tempVariation * 0.5;
          break;

        case 'TAP_NETWORK':
          basePh = 7.15 + (Math.random() * 0.25 - 0.1);
          baseTurb = 1.1 + (Math.random() * 0.5 - 0.2);
          baseDo = 7.8 + (Math.random() * 0.5 - 0.25);
          baseTds = 195 + (Math.random() * 18 - 9);
          baseTemp = 24.0 + tempVariation * 0.5;
          break;

        case 'RESERVOIR':
          basePh = 7.6 + (Math.random() * 0.25 - 0.1);
          baseTurb = 2.2 + (Math.random() * 0.6 - 0.3);
          baseDo = 8.5 + (Math.random() * 0.5 - 0.25);
          baseTds = 155 + (Math.random() * 15 - 7);
          baseTemp = 23.0 + tempVariation;
          break;

        case 'BOREWELL':
        default:
          basePh = 7.05 + (Math.random() * 0.2 - 0.1);
          baseTurb = 0.6 + (Math.random() * 0.3 - 0.1);
          baseDo = 5.3 + (Math.random() * 0.4 - 0.2);
          baseTds = 380 + (Math.random() * 30 - 15);
          baseTemp = 24.5;
          break;
      }

      const sample = {
        station_id: station.id,
        timestamp,
        ph: Math.round(basePh * 100) / 100,
        turbidity_ntu: Math.round(baseTurb * 100) / 100,
        do_mg_l: Math.round(baseDo * 100) / 100,
        tds_ppm: Math.round(baseTds * 10) / 10,
        temp_c: Math.round(baseTemp * 10) / 10,
        battery_pct: Math.max(70, Math.round(100 - (i * 0.2))),
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

  // 3. Seed Alerts directly aligned with WaterGuard Alerts & Triage Screen (Screen 3)
  const alertsToSeed = [
    {
      station_id: 'STATION_EAST_03',
      title: 'High Turbidity Detected (12.5 NTU)',
      description: 'Turbidity measured at 12.5 NTU exceeding permissible regulatory threshold of > 5.0 NTU.',
      severity: 'CRITICAL',
      status: 'NEW',
      source: 'SYSTEM'
    },
    {
      station_id: 'STATION_NORTH_02',
      title: 'Low Free Chlorine Residual (0.1 mg/L)',
      description: 'Chlorine disinfectant residual fell to 0.1 mg/L below safe threshold of < 0.3 mg/L.',
      severity: 'WARNING',
      status: 'NEW',
      source: 'SYSTEM'
    },
    {
      station_id: 'STATION_WEST_04',
      title: 'Acidic pH Deviation (5.8 pH)',
      description: 'pH level dropped to 5.8 in municipal tap distribution below minimum standard limit of 6.5.',
      severity: 'WARNING',
      status: 'NEW',
      source: 'SYSTEM'
    },
    {
      station_id: 'STATION_CENTRAL_05',
      title: 'Elevated Total Dissolved Solids (620 ppm)',
      description: 'TDS concentration reached 620 ppm exceeding guideline limit of > 500 ppm.',
      severity: 'INFO',
      status: 'ACKNOWLEDGED',
      source: 'SYSTEM'
    },
    {
      station_id: 'STATION_SOUTH_06',
      title: 'Nitrate Exceedance in Aquifer (58 mg/L)',
      description: 'Nitrate levels measured at 58 mg/L exceeding permissible maximum limit of > 45 mg/L.',
      severity: 'WARNING',
      status: 'NEW',
      source: 'SYSTEM'
    },
    {
      station_id: 'STATION_RIVERSIDE_01',
      title: 'Severe Turbidity Surge in River Intake (18.7 NTU)',
      description: 'Upstream sediment surge elevated river intake turbidity to 18.7 NTU.',
      severity: 'CRITICAL',
      status: 'NEW',
      source: 'SYSTEM'
    }
  ];

  for (const alt of alertsToSeed) {
    db.createAlert(alt);
  }

  // 4. Seed Citizen Reports
  db.createCitizenReport({
    station_id: 'STATION_WEST_04',
    citizen_name: 'Priya Sharma',
    contact_info: 'priya.sharma@example.org',
    issue_type: 'MURKY_COLOR',
    severity: 'MEDIUM',
    latitude: 12.9610,
    longitude: 77.5320,
    address: 'Indiranagar 5th Main, Sector 4, Bengaluru',
    description: 'Slight discoloration noticed in morning kitchen tap water. Cleared up after 5 minutes of running.'
  });

  db.createCitizenReport({
    station_id: 'STATION_RIVERSIDE_01',
    citizen_name: 'Amit Verma',
    contact_info: '+91 98765 43210',
    issue_type: 'FOUL_ODOR',
    severity: 'HIGH',
    latitude: 12.9730,
    longitude: 77.5960,
    address: 'Near Riverside Bridge Pier #3, Bengaluru',
    description: 'Strong sulfur/chemical odor observed near water intake bank following overnight rain.'
  });

  console.log('[Database] Database successfully seeded with 6 WaterGuard stations, historical telemetry, alerts, and citizen reports.');
}

module.exports = {
  seedDatabaseIfEmpty
};
