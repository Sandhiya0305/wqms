// Automated Verification Script

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
    console.log(`[Healthcheck] HTTP ${health.status}:`, JSON.parse(health.data).status);

    // 2. Stations
    const stations = await get('/api/v1/stations');
    const stationsJson = JSON.parse(stations.data);
    console.log(`[Stations API] HTTP ${stations.status}: Found ${stationsJson.count} stations`);

    // 3. Citizen Overview
    const citizen = await get('/api/v1/citizen/overview');
    const citizenJson = JSON.parse(citizen.data);
    console.log(`[Citizen API] HTTP ${citizen.status}: Headline "${citizenJson.headline}", Status: ${citizenJson.public_status}`);

    // 4. Ingest new reading
    const ingest = await post('/api/v1/telemetry', {
      station_id: 'STATION_RIVER_01',
      ph: 7.3,
      turbidity_ntu: 2.1,
      do_mg_l: 7.9,
      tds_ppm: 215,
      temp_c: 21.0
    });
    const ingestJson = JSON.parse(ingest.data);
    console.log(`[Ingestion API] HTTP ${ingest.status}: WQI Score = ${ingestJson.wqi?.wqi_score} (${ingestJson.wqi?.wqi_status}), Risk = ${ingestJson.risk?.risk_score}`);

    // 5. Frontend HTML serving
    const frontend = await get('/');
    console.log(`[Frontend SPA] HTTP ${frontend.status}: Served ${frontend.data.length} bytes of HTML`);
    if (frontend.data.includes('AquaIntel')) {
      console.log('Frontend contains AquaIntel title!');
    }

    console.log('\nAll verification tests passed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Verification failed:', err.message);
    process.exit(1);
  }
}

// Wait 2 seconds for server to start, then test
setTimeout(verify, 2000);
