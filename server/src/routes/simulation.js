const express = require('express');
const router = express.Router();
const simulator = require('../services/simulator');

// GET /api/v1/simulation/status
router.get('/status', (req, res) => {
  res.json({ success: true, data: simulator.getStatus() });
});

// POST /api/v1/simulation/start
router.post('/start', (req, res) => {
  simulator.start();
  res.json({ success: true, message: 'Simulation started', data: simulator.getStatus() });
});

// POST /api/v1/simulation/stop
router.post('/stop', (req, res) => {
  simulator.stop();
  res.json({ success: true, message: 'Simulation stopped', data: simulator.getStatus() });
});

// POST /api/v1/simulation/speed
router.post('/speed', (req, res) => {
  const { multiplier } = req.body;
  simulator.setSpeed(multiplier);
  res.json({ success: true, message: `Speed set to ${simulator.playbackSpeed}x`, data: simulator.getStatus() });
});

// POST /api/v1/simulation/inject
router.post('/inject', (req, res) => {
  const { scenario } = req.body;
  if (!scenario) {
    return res.status(400).json({ success: false, error: 'Scenario name is required (SPILL, RUNOFF, CHLORINE_DROP, RESET)' });
  }
  simulator.injectScenario(scenario);
  res.json({ success: true, message: `Scenario '${scenario}' applied to simulation stream`, data: simulator.getStatus() });
});

module.exports = router;
