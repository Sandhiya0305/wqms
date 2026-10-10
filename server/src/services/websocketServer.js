// WebSocket Server for Real-Time Streaming to Dashboards

const { WebSocketServer, WebSocket } = require('ws');
const db = require('../db');

function setupWebSocketServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Set();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(`[WebSocket] Dashboard client connected (Total: ${clients.size})`);

    // Send initial snapshot to client immediately upon connect
    try {
      const latestTelemetry = db.getLatestTelemetryAllStations();
      const activeAlerts = db.getActiveAlerts();
      const riskScores = db.getLatestRiskForStations();

      ws.send(JSON.stringify({
        type: 'INITIAL_SNAPSHOT',
        data: {
          stations: db.getStations(),
          latestTelemetry,
          activeAlerts,
          riskScores
        }
      }));
    } catch (err) {
      console.error('[WebSocket] Error sending initial snapshot:', err.message);
    }

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message);
        if (parsed.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
        }
      } catch (e) {
        // Ignore
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`[WebSocket] Dashboard client disconnected (Total: ${clients.size})`);
    });

    ws.on('error', (err) => {
      console.error('[WebSocket] Socket error:', err.message);
      clients.delete(ws);
    });
  });

  // Broadcast function
  const broadcast = (data) => {
    const payloadStr = JSON.stringify(data);
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(payloadStr);
        } catch (e) {
          console.error('[WebSocket] Failed to send to client:', e.message);
        }
      }
    }
  };

  return { wss, broadcast };
}

module.exports = {
  setupWebSocketServer
};
