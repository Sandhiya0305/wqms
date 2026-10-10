const http = require('http');
const express = require('express');
const cors = require('cors');
const { PORT, MQTT_PORT } = require('./config');

const db = require('./db');
const { seedDatabaseIfEmpty } = require('./seed/historicalData');
const { setupWebSocketServer } = require('./services/websocketServer');
const { startMqttBroker } = require('./services/mqttBroker');
const simulator = require('./services/simulator');

// Route imports
const telemetryRoutes = require('./routes/telemetry');
const stationsRoutes = require('./routes/stations');
const alertsRoutes = require('./routes/alerts');
const riskRoutes = require('./routes/risk');
const citizenRoutes = require('./routes/citizen');
const simulationRoutes = require('./routes/simulation');

// 1. Initialize DB and Seed data
seedDatabaseIfEmpty(db);

// 2. Setup Express
const app = express();
app.use(cors());
app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  if (req.method !== 'GET' || !req.url.startsWith('/api/v1/telemetry/latest')) {
    // console.log(`[HTTP] ${req.method} ${req.url}`);
  }
  next();
});

// Mount Routes
app.use('/api/v1/telemetry', telemetryRoutes);
app.use('/api/v1/stations', stationsRoutes);
app.use('/api/v1/alerts', alertsRoutes);
app.use('/api/v1/risk', riskRoutes);
app.use('/api/v1/citizen', citizenRoutes);
app.use('/api/v1/simulation', simulationRoutes);

// Root healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    version: '1.0.0',
    service: 'Water Quality Intelligence & Monitoring Platform',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend client dist bundle statically if built
const fs = require('fs');
const path = require('path');
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/ws')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
  console.log(`[Static] Serving frontend from ${clientDistPath}`);
}

// 3. Create HTTP & WebSocket Server
const httpServer = http.createServer(app);
const { broadcast } = setupWebSocketServer(httpServer);

// Connect WebSocket broadcast to the simulator and ingestion pipeline
simulator.setBroadcaster(broadcast);

// 4. Start IoT Aedes MQTT Broker
startMqttBroker(MQTT_PORT);

// 5. Start Server Listen
httpServer.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  Water Quality Intelligence Platform Online!`);
  console.log(`  HTTP REST API:    http://localhost:${PORT}`);
  console.log(`  WebSocket Stream: ws://localhost:${PORT}/ws`);
  console.log(`  IoT MQTT Broker:  mqtt://localhost:${MQTT_PORT}`);
  console.log(`=======================================================`);

  // Start background simulation replay automatically
  simulator.start();
});

// Handle graceful exit
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down Water Quality server...');
  simulator.stop();
  process.exit(0);
});
