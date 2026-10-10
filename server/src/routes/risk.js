const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/v1/risk
router.get('/', (req, res) => {
  try {
    const riskScores = db.getLatestRiskForStations();
    
    // Calculate network-wide aggregate risk metrics
    let totalRisk = 0;
    let criticalCount = 0;
    let highCount = 0;

    riskScores.forEach(r => {
      totalRisk += r.risk_score;
      if (r.risk_level === 'CRITICAL') criticalCount++;
      if (r.risk_level === 'HIGH') highCount++;
    });

    const avgRisk = riskScores.length > 0 ? Math.round((totalRisk / riskScores.length) * 10) / 10 : 0;

    res.json({
      success: true,
      summary: {
        average_risk_score: avgRisk,
        critical_stations: criticalCount,
        high_risk_stations: highCount,
        total_monitored_stations: riskScores.length
      },
      data: riskScores
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
