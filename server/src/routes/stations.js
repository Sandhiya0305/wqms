const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/v1/stations?city=Trichy
router.get('/', (req, res) => {
  try {
    const city = req.query.city || null;
    const stations = db.getStations(city);
    res.json({ success: true, count: stations.length, data: stations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/stations/:id
router.get('/:id', (req, res) => {
  try {
    const station = db.getStationById(req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, error: 'Station not found' });
    }
    const latest = db.getLatestTelemetryForStation(req.params.id);
    res.json({ success: true, data: { ...station, latest_telemetry: latest } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/stations/:id/history
router.get('/:id/history', (req, res) => {
  try {
    const limit = Math.min(200, Math.max(5, parseInt(req.query.limit) || 50));
    const history = db.getTelemetryHistory(req.params.id, limit);
    res.json({ success: true, count: history.length, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
