const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/v1/calibration
router.get('/', (req, res) => {
  try {
    const logs = db.getCalibrationLogs(50);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/calibration
router.post('/', (req, res) => {
  try {
    const { device_id, station_id, technician, ph_slope, ph_offset, turbidity_baseline_v, notes } = req.body;
    if (!device_id || !station_id) {
      return res.status(400).json({ success: false, error: 'device_id and station_id are required' });
    }

    const id = db.logCalibration({
      device_id,
      station_id,
      technician: technician || 'A. Kumar (Field Ops Lead)',
      ph_slope: ph_slope != null ? parseFloat(ph_slope) : 3.5,
      ph_offset: ph_offset != null ? parseFloat(ph_offset) : 0.0,
      turbidity_baseline_v: turbidity_baseline_v != null ? parseFloat(turbidity_baseline_v) : 4.1,
      notes: notes || 'Edge probe recalibrated against reference buffer solutions'
    });

    res.status(201).json({
      success: true,
      message: `Field calibration log #${id} saved for device ${device_id}.`,
      log_id: id
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
