const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/v1/citizen/overview
router.get('/overview', (req, res) => {
  try {
    const latestTelemetry = db.getLatestTelemetryAllStations();
    const activeAlerts = db.getActiveAlerts();

    // Check if any drinking source or tap network is in hazardous / critical state
    const criticalTapOrWtp = latestTelemetry.find(t => 
      (t.station_type === 'TAP_NETWORK' || t.station_type === 'TREATMENT_PLANT') && 
      (t.wqi_status === 'CRITICAL' || t.wqi_status === 'WARNING')
    );

    let generalPublicStatus = 'SAFE_TO_DRINK';
    let headline = 'Public Tap Water is Safe to Drink';
    let advisoryMessage = 'Continuous sensor telemetry confirms municipal drinking water meets or exceeds WHO and BIS safety standards across all monitored zones.';
    let bannerColor = '#10B981';

    if (criticalTapOrWtp) {
      generalPublicStatus = 'BOIL_WATER_ADVISORY';
      headline = 'Precautionary Boil Water Advisory Active';
      advisoryMessage = `Elevated contamination detected in ${criticalTapOrWtp.district}. Please boil municipal tap water for at least 3 minutes before direct drinking or food preparation.`;
      bannerColor = '#EF4444';
    } else if (activeAlerts.length > 0) {
      const hasWarning = activeAlerts.some(a => a.severity === 'WARNING' || a.severity === 'CRITICAL');
      if (hasWarning) {
        generalPublicStatus = 'PRECAUTIONARY_NOTICE';
        headline = 'Minor Precautionary Notice in Effect';
        advisoryMessage = 'Routine maintenance or transient parameter variances observed in upstream supply. Tap water remains safe, but in-home ceramic or RO filtration is recommended.';
        bannerColor = '#F59E0B';
      }
    }

    // Neighborhood breakdowns with citizen-friendly summaries
    const neighborhoods = latestTelemetry.map(t => {
      let potabilityStatus = 'Safe for Direct Consumption';
      let statusBadge = 'SAFE';
      let iconColor = '#10B981';

      if (t.wqi_score > 75) {
        potabilityStatus = 'Unsafe: Boil Before Use';
        statusBadge = 'CRITICAL';
        iconColor = '#EF4444';
      } else if (t.wqi_score > 50) {
        potabilityStatus = 'Moderate: Filtration Advised';
        statusBadge = 'CAUTION';
        iconColor = '#F59E0B';
      }

      return {
        station_id: t.station_id,
        name: t.station_name,
        district: t.district,
        source_type: t.station_type,
        latitude: t.latitude,
        longitude: t.longitude,
        wqi_score: t.wqi_score,
        potability_status: potabilityStatus,
        status_badge: statusBadge,
        icon_color: iconColor,
        last_updated: t.timestamp
      };
    });

    res.json({
      success: true,
      public_status: generalPublicStatus,
      headline,
      advisory_message: advisoryMessage,
      banner_color: bannerColor,
      neighborhoods,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/citizen/report
router.post('/report', (req, res) => {
  try {
    const { citizen_name, contact_info, issue_type, severity, latitude, longitude, address, description, station_id } = req.body;

    if (!citizen_name || !issue_type) {
      return res.status(400).json({ success: false, error: 'Citizen name and issue type are required' });
    }

    const reportId = db.createCitizenReport({
      citizen_name,
      contact_info,
      issue_type,
      severity: severity || 'MEDIUM',
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      address,
      description,
      station_id: station_id || null
    });

    // Also raise an informational alert for authorities
    db.createAlert({
      station_id: station_id || 'STATION_TAP_03',
      title: `Citizen Incident Report: ${issue_type.replace('_', ' ')}`,
      description: `Reported by ${citizen_name} at ${address || 'Local Zone'}: "${description || 'No comment provided'}"`,
      severity: severity === 'HIGH' ? 'WARNING' : 'INFO',
      status: 'NEW',
      source: 'CITIZEN'
    });

    res.status(201).json({
      success: true,
      message: 'Thank you. Your water quality report has been logged with municipal authorities.',
      report_id: reportId
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/citizen/reports
router.get('/reports', (req, res) => {
  try {
    const reports = db.getCitizenReports(50);
    res.json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
