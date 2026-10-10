// Embedded Aedes MQTT Broker for IoT Sensor Hardware

const aedes = require('aedes')();
const net = require('net');
const simulator = require('./simulator');

let server = null;

function startMqttBroker(port = 1883) {
  server = net.createServer(aedes.handle);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[MQTT Broker] Warning: Port ${port} is already in use. Physical IoT hardware can alternatively use the HTTP REST endpoint /api/v1/telemetry.`);
    } else {
      console.error('[MQTT Broker] Error:', err.message);
    }
  });

  server.listen(port, () => {
    console.log(`[MQTT Broker] IoT Aedes MQTT Broker listening on port ${port}`);
  });

  // Client connection logging
  aedes.on('client', (client) => {
    console.log(`[MQTT Broker] Client connected: ${client ? client.id : 'unknown'}`);
  });

  aedes.on('clientDisconnect', (client) => {
    console.log(`[MQTT Broker] Client disconnected: ${client ? client.id : 'unknown'}`);
  });

  // Telemetry message handler
  aedes.on('publish', (packet, client) => {
    if (!packet || !packet.topic) return;

    // Filter out internal broker telemetry topics ($SYS/...)
    if (packet.topic.startsWith('$SYS')) return;

    // Pattern: water/sensors/<station_id>/telemetry
    const match = packet.topic.match(/^water\/sensors\/([^\/]+)\/telemetry$/);
    if (match) {
      const stationId = match[1];
      try {
        const payloadStr = packet.payload.toString('utf8');
        const json = JSON.parse(payloadStr);
        if (!json.station_id) {
          json.station_id = stationId;
        }
        console.log(`[MQTT Broker] Ingested telemetry for ${stationId} via MQTT:`, json);
        simulator.processIngestion(json);
      } catch (err) {
        console.error(`[MQTT Broker] Failed to parse MQTT telemetry packet from ${stationId}:`, err.message);
      }
    }
  });

  return server;
}

module.exports = {
  startMqttBroker,
  aedes
};
