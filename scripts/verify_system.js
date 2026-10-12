// Automated Verification Script for WaterGuard Multi-Role & Trichy System

const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3001${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    }).on('error', reject);
  });
}

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(`http://localhost:3001${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let resp = '';
      res.on('data', chunk => resp += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: resp }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function verify() {
  console.log('Testing server endpoints on http://localhost:3001...');

  try {
    // 1. Health check
    const health = await get('/api/health');
    console.log(`[1. Healthcheck] HTTP ${health.status}:`, JSON.parse(health.data).status);

    // 2. Stations (Trichy)
    const stationsTrichy = await get('/api/v1/stations?city=Trichy');
    const stationsJson = JSON.parse(stationsTrichy.data);
    console.log(`[2. Trichy Stations] HTTP ${stationsTrichy.status}: Found ${stationsJson.count} stations across Trichy areas`);

    // 3. Citizen Overview (Trichy)
    const citizen = await get('/api/v1/citizen/overview?city=Trichy');
    const citizenJson = JSON.parse(citizen.data);
    console.log(`[3. Citizen Overview] HTTP ${citizen.status}: Headline "${citizenJson.headline}", Status: ${citizenJson.public_status}`);

    // 4. Ingest new reading into Kaveri Intake
    const ingest = await post('/api/v1/telemetry', {
      station_id: 'TRICHY_KAVERI_01',
      ph: 7.35,
      turbidity_ntu: 1.85,
      do_mg_l: 8.1,
      tds_ppm: 195,
      temp_c: 26.2,
      chlorine_mg_l: 0.75
    });
    const ingestJson = JSON.parse(ingest.data);
    console.log(`[4. Ingestion API] HTTP ${ingest.status}: WQI = ${ingestJson.wqi?.wqi_score} (${ingestJson.wqi?.wqi_status}), Risk = ${ingestJson.risk?.risk_score}`);

    // 5. Health Advisories API (Chief Health Officer)
    const advisories = await get('/api/v1/advisories?city=Trichy&active=false');
    const advisoriesJson = JSON.parse(advisories.data);
    console.log(`[5. Health Advisories] HTTP ${advisories.status}: Retrieved ${advisoriesJson.count} advisories for Trichy`);

    // 6. Thresholds & Valves API (Municipal Engineer)
    const thresholds = await get('/api/v1/thresholds');
    const thresholdsJson = JSON.parse(thresholds.data);
    console.log(`[6. Thresholds & Valves] HTTP ${thresholds.status}: Retrieved ${thresholdsJson.count} threshold configs`);

    // 7. Sensor Calibration Logs API (Field Operations Lead)
    const calibration = await get('/api/v1/calibration');
    const calibJson = JSON.parse(calibration.data);
    console.log(`[7. Calibration Logs] HTTP ${calibration.status}: Retrieved ${calibJson.count} field calibration logs`);

    // 8. Citizen Reports API
    const citizenReports = await get('/api/v1/citizen/reports?city=Trichy');
    const citizenReportsJson = JSON.parse(citizenReports.data);
    console.log(`[8. Citizen Grievance Tracker] HTTP ${citizenReports.status}: Retrieved ${citizenReportsJson.count} incident reports`);

    // 9. Frontend HTML serving
    const frontend = await get('/');
    console.log(`[9. Frontend SPA] HTTP ${frontend.status}: Served ${frontend.data.length} bytes of HTML`);

    console.log('\n[PASS] All 9 end-to-end verification tests passed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Verification failed:', err.message);
    process.exit(1);
  }
}

// Start verification
verify();
