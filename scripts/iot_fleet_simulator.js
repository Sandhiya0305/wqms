/**
 * Multi-Node IoT Sensor Hardware Simulator
 * Simulates 5 distributed physical hardware sensor nodes publishing telemetry packets.
 * Supports both HTTP REST and MQTT modes.
 */

const http = require('http');

const SERVER_HOST = process.env.SERVER_HOST || 'localhost';
const HTTP_PORT = process.env.HTTP_PORT || 3001;
const API_KEY = process.env.API_KEY || 'wq_device_token_demo_2026';

const STATIONS = [
  { id: 'STATION_RIVERSIDE_01', name: 'Riverside Monitoring Station', basePh: 7.4, baseTurb: 3.2, baseDo: 8.1, baseTds: 142, baseTemp: 24.8 },
  { id: 'STATION_NORTH_02', name: 'North Plant Monitoring Station', basePh: 7.2, baseTurb: 0.8, baseDo: 8.3, baseTds: 165, baseTemp: 23.5 },
  { id: 'STATION_EAST_03', name: 'East Reservoir Station', basePh: 7.6, baseTurb: 2.2, baseDo: 8.5, baseTds: 155, baseTemp: 23.0 },
  { id: 'STATION_WEST_04', name: 'West Tap Distribution Station', basePh: 7.15, baseTurb: 1.1, baseDo: 7.8, baseTds: 195, baseTemp: 24.0 },
  { id: 'STATION_CENTRAL_05', name: 'Central WTP Monitoring Station', basePh: 7.2, baseTurb: 0.8, baseDo: 8.3, baseTds: 165, baseTemp: 23.5 },
  { id: 'STATION_SOUTH_06', name: 'South Borewell Community Station', basePh: 7.05, baseTurb: 0.6, baseDo: 5.3, baseTds: 380, baseTemp: 24.5 }
];

console.log('====================================================');
console.log('  AquaIntel Multi-Node IoT Hardware Edge Simulator  ');
console.log(`  Targeting Gateway: http://${SERVER_HOST}:${HTTP_PORT}/api/v1/telemetry`);
console.log('====================================================');

function sendTelemetryHTTP(reading) {
  const payload = JSON.stringify(reading);

  const options = {
    hostname: SERVER_HOST,
    port: HTTP_PORT,
    path: '/api/v1/telemetry',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'x-api-key': API_KEY
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(body);
        if (json.success) {
          console.log(`[IoT Node ${reading.station_id}] Dispatched OK -> WQI: ${json.wqi.wqi_score} (${json.wqi.wqi_status}), Anomalies: ${json.anomalies.length}`);
        } else {
          console.warn(`[IoT Node ${reading.station_id}] Ingestion Error:`, json.errors);
        }
      } catch (e) {
        console.error('Failed to parse response:', body);
      }
    });
  });

  req.on('error', (err) => {
    console.error(`[IoT Node ${reading.station_id}] Connection error: ${err.message}`);
  });

  req.write(payload);
  req.end();
}

function simulateTick() {
  STATIONS.forEach(st => {
    // Generate slight stochastic fluctuation representing analog sensor jitter
    const ph = Math.round((st.basePh + (Math.random() * 0.2 - 0.1)) * 100) / 100;
    const turb = Math.round((st.baseTurb + (Math.random() * 0.4 - 0.2)) * 100) / 100;
    const doVal = Math.round((st.baseDo + (Math.random() * 0.3 - 0.15)) * 100) / 100;
    const tds = Math.round((st.baseTds + (Math.random() * 10 - 5)) * 10) / 10;
    const temp = Math.round((st.baseTemp + (Math.random() * 0.4 - 0.2)) * 10) / 10;

    const sample = {
      station_id: st.id,
      ph,
      turbidity_ntu: turb,
      do_mg_l: doVal,
      tds_ppm: tds,
      temp_c: temp,
      battery_pct: Math.floor(90 + Math.random() * 10),
      signal_rssi: Math.floor(-55 - Math.random() * 15),
      timestamp: new Date().toISOString()
    };

    sendTelemetryHTTP(sample);
  });
}

// Tick every 5 seconds
const INTERVAL_MS = 5000;
console.log(`Starting telemetry dispatch loop (every ${INTERVAL_MS / 1000}s)...`);
simulateTick();
setInterval(simulateTick, INTERVAL_MS);
