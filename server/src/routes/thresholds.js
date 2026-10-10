const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/v1/thresholds
router.get('/', (req, res) => {
  try {
    const data = db.getThresholdOverrides();
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/thresholds (Calibrate thresholds or change valve status)
router.post('/', (req, res) => {
  try {
    const { station_id, ph_min, ph_max, turbidity_max, do_min, tds_max, valve_status, calibrated_by } = req.body;
    if (!station_id) {
      return res.status(400).json({ success: false, error: 'station_id is required' });
    }

    db.upsertThresholdOverride({
      station_id,
      ph_min: ph_min != null ? parseFloat(ph_min) : undefined,
      ph_max: ph_max != null ? parseFloat(ph_max) : undefined,
      turbidity_max: turbidity_max != null ? parseFloat(turbidity_max) : undefined,
      do_min: do_min != null ? parseFloat(do_min) : undefined,
      tds_max: tds_max != null ? parseFloat(tds_max) : undefined,
      valve_status: valve_status || 'OPEN',
      last_calibrated_by: calibrated_by || 'R. Sharma (Municipal Engineer)'
    });

    res.json({
      success: true,
      message: `Operational thresholds and valve status (${valve_status || 'OPEN'}) updated for ${station_id}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
