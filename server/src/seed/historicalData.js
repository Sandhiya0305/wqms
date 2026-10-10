// Historical Dataset Generator & Database Seeder

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
      const tempVariation = Math.sin((timeHour - 8) * (Math.PI / 12)) * 3; // warmest at 2 PM
      let basePh, baseTurb, baseDo, baseTds, baseTemp;

      switch (station.type) {
        case 'RIVER':
          basePh = 7.4 + (Math.random() * 0.4 - 0.2);
          baseTurb = 4.2 + (Math.random() * 2.0 - 0.8);
          baseDo = 7.2 + (Math.random() * 0.8 - 0.4);
          baseTds = 240 + (Math.random() * 30 - 15);
          baseTemp = 22.0 + tempVariation;
          break;

        case 'TREATMENT_PLANT':
          basePh = 7.2 + (Math.random() * 0.2 - 0.1);
          baseTurb = 0.9 + (Math.random() * 0.4 - 0.2);
          baseDo = 8.1 + (Math.random() * 0.4 - 0.2);
          baseTds = 180 + (Math.random() * 15 - 7);
          baseTemp = 21.0 + tempVariation * 0.5;
          break;

        case 'TAP_NETWORK':
          basePh = 7.15 + (Math.random() * 0.25 - 0.1);
          baseTurb = 1.2 + (Math.random() * 0.6 - 0.2);
          baseDo = 7.6 + (Math.random() * 0.5 - 0.25);
          baseTds = 210 + (Math.random() * 20 - 10);
          baseTemp = 21.5 + tempVariation * 0.5;
          break;

        case 'RESERVOIR':
          basePh = 7.6 + (Math.random() * 0.3 - 0.15);
          baseTurb = 2.4 + (Math.random() * 0.8 - 0.4);
          baseDo = 8.4 + (Math.random() * 0.6 - 0.3);
          baseTds = 160 + (Math.random() * 15 - 7);
          baseTemp = 20.5 + tempVariation;
          break;

        case 'BOREWELL':
        default:
          basePh = 7.0 + (Math.random() * 0.2 - 0.1);
          baseTurb = 0.6 + (Math.random() * 0.3 - 0.1);
          baseDo = 5.2 + (Math.random() * 0.4 - 0.2);
          baseTds = 380 + (Math.random() * 30 - 15);
          baseTemp = 23.0;
          break;
      }

      // Add a realistic controlled anomaly in the historical timeline for River Station (e.g. 10 hours ago)
      if (station.id === 'STATION_RIVER_01' && i === 12) {
        baseTurb = 16.5; // Rainfall runoff event
        baseDo = 4.8;
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
        signal_rssi: -60 - Math.floor(Math.random() * 10)
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

  // 3. Seed Citizen Reports
  db.createCitizenReport({
    station_id: 'STATION_TAP_03',
    citizen_name: 'Priya Sharma',
    contact_info: 'priya.s@example.com',
    issue_type: 'MURKY_COLOR',
    severity: 'MEDIUM',
    latitude: 28.646,
    longitude: 77.231,
    address: 'Block B, Sector 7, North East',
    description: 'Slight discoloration noticed in morning kitchen tap water. Cleared up after 5 minutes of running.'
  });

  db.createCitizenReport({
    station_id: 'STATION_RIVER_01',
    citizen_name: 'Amit Verma',
    contact_info: '+91 98765 43210',
    issue_type: 'FOUL_ODOR',
    severity: 'HIGH',
    latitude: 28.615,
    longitude: 77.211,
    address: 'Near Old River Bridge Pier #3',
    description: 'Strong sulfur/chemical odor observed near water intake bank following overnight rain.'
  });

  // 4. Seed an active informational alert
  db.createAlert({
    station_id: 'STATION_RIVER_01',
    title: 'INFO: Seasonal Catchment Runoff Watch',
    description: 'Automated advisory: Increased upstream precipitation detected. Sensor telemetry shows slight turbidity shift within acceptable operational margins.',
    severity: 'INFO',
    status: 'ACKNOWLEDGED',
    source: 'SYSTEM'
  });

  console.log('[Database] Database successfully seeded with 5 stations, 300 telemetry readings, initial anomalies, and citizen reports.');
}

module.exports = {
  seedDatabaseIfEmpty
};
