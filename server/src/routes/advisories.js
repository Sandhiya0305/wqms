const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/v1/advisories?city=Trichy&active=true
router.get('/', (req, res) => {
  try {
    const city = req.query.city || null;
    const activeOnly = req.query.active !== 'false';
    const advisories = db.getPublicAdvisories(city, activeOnly);
    res.json({ success: true, count: advisories.length, data: advisories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/advisories (Issue Public Health Advisory)
router.post('/', (req, res) => {
  try {
    const { title, area, city, type, severity, message, guidelines, issued_by } = req.body;
    if (!title || !area || !message) {
      return res.status(400).json({ success: false, error: 'Title, area, and message are required.' });
    }

    const id = db.createPublicAdvisory({
      title,
      area,
      city: city || 'Trichy',
      type: type || 'BOIL_WATER',
      severity: severity || 'WARNING',
      message,
      guidelines: guidelines || '',
      issued_by: issued_by || 'Dr. S. Patel (Chief Health Officer)'
    });

    res.status(201).json({
      success: true,
      message: 'Public Health Advisory officially published and broadcast to citizens.',
      advisory_id: id
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/advisories/:id/revoke (Revoke Advisory when water restored safe)
router.post('/:id/revoke', (req, res) => {
  try {
    db.revokePublicAdvisory(req.params.id);
    res.json({ success: true, message: `Advisory #${req.params.id} has been revoked. Area marked safe.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
