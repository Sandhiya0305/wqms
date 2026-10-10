const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/v1/alerts
router.get('/', (req, res) => {
  try {
    const onlyActive = req.query.active === 'true' || req.query.status !== 'all';
    const alerts = onlyActive ? db.getActiveAlerts() : db.getAllAlerts(100);
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/alerts/:id/acknowledge
router.post('/:id/acknowledge', (req, res) => {
  try {
    const alertId = req.params.id;
    const { acknowledged_by } = req.body;
    db.updateAlertStatus(alertId, 'ACKNOWLEDGED', acknowledged_by || 'Duty Engineer');
    res.json({ success: true, message: `Alert #${alertId} acknowledged.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/alerts/:id/resolve
router.post('/:id/resolve', (req, res) => {
  try {
    const alertId = req.params.id;
    const { resolution_notes, resolved_by } = req.body;
    db.updateAlertStatus(alertId, 'RESOLVED', resolved_by, resolution_notes || 'Issue inspected and mitigated.');
    res.json({ success: true, message: `Alert #${alertId} resolved.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
