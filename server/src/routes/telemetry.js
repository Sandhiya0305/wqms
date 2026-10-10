const express = require('express');
const router = express.Router();
const db = require('../db');
const simulator = require('../services/simulator');
const { API_KEY } = require('../config');

// Ingest single reading via HTTP REST
// POST /api/v1/telemetry
router.post('/', (req, res) => {
  try {
    // API Key Authentication (Optional in local dev, but verified if provided)
    const clientKey = req.headers['x-api-key'] || req.query.api_key;
    if (clientKey && clientKey !== API_KEY) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid API Key' });
    }

    const payload = req.body;
    if (Array.isArray(payload)) {
      // Batch ingestion
      const results = payload.map(p => simulator.processIngestion(p));
      return res.status(201).json({
        success: true,
        batch_count: results.length,
        results
      });
    }

    const result = simulator.processIngestion(payload);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/telemetry/latest
router.get('/latest', (req, res) => {
  try {
    const latest = db.getLatestTelemetryAllStations();
    res.json({ success: true, count: latest.length, data: latest });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/telemetry/anomalies
router.get('/anomalies', (req, res) => {
  try {
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const anomalies = db.getRecentAnomalies(limit);
    res.json({ success: true, count: anomalies.length, data: anomalies });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
