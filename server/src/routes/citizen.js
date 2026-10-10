const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/v1/citizen/overview?city=Trichy
router.get('/overview', (req, res) => {
  try {
    const city = req.query.city || 'Trichy';
    const latestTelemetry = db.getLatestTelemetryAllStations(city);
    const activeAlerts = db.getActiveAlerts(city);
    const activeAdvisories = db.getPublicAdvisories(city, true);

    // Check if any drinking source or tap network is in hazardous / critical state
    const criticalTapOrWtp = latestTelemetry.find(t => 
      (t.station_type === 'TAP_NETWORK' || t.station_type === 'TREATMENT_PLANT') && 
      (t.wqi_status === 'CRITICAL' || t.wqi_status === 'WARNING')
    );

    let generalPublicStatus = 'SAFE_TO_DRINK';
    let headline = `Public Tap Water is Safe to Drink in ${city}`;
    let advisoryMessage = `Continuous automated sensor telemetry confirms municipal drinking water meets or exceeds WHO and BIS IS 10500 safety standards across all monitored zones in ${city}.`;
    let bannerColor = '#10B981';

    if (activeAdvisories.length > 0) {
      const topAdvisory = activeAdvisories[0];
      if (topAdvisory.type === 'BOIL_WATER') {
        generalPublicStatus = 'BOIL_WATER_ADVISORY';
        headline = `Boil Water Advisory: ${topAdvisory.area}`;
        advisoryMessage = `${topAdvisory.message} ${topAdvisory.guidelines}`;
        bannerColor = '#EF4444';
      } else {
        generalPublicStatus = 'PRECAUTIONARY_NOTICE';
        headline = topAdvisory.title;
        advisoryMessage = `${topAdvisory.message} ${topAdvisory.guidelines}`;
        bannerColor = '#F59E0B';
      }
    } else if (criticalTapOrWtp) {
      generalPublicStatus = 'BOIL_WATER_ADVISORY';
      headline = 'Precautionary Boil Water Advisory Active';
      advisoryMessage = `Elevated parameter reading detected in ${criticalTapOrWtp.district}. Please boil municipal tap water for at least 3 minutes before direct drinking.`;
      bannerColor = '#EF4444';
    } else if (activeAlerts.length > 0) {
      const hasWarning = activeAlerts.some(a => a.severity === 'WARNING' || a.severity === 'CRITICAL');
      if (hasWarning) {
        generalPublicStatus = 'PRECAUTIONARY_NOTICE';
        headline = 'Minor Precautionary Notice in Effect';
        advisoryMessage = 'Routine maintenance or transient parameter variation observed in upstream supply. Tap water remains safe, but in-home filtration is recommended.';
        bannerColor = '#F59E0B';
      }
    }

    // Neighborhood breakdowns with simple comprehensible summaries
    const neighborhoods = latestTelemetry.map(t => {
      let potabilityStatus = 'Safe for Direct Drinking';
      let statusBadge = 'SAFE';
      let iconColor = '#10B981';

      if (t.wqi_score > 75) {
        potabilityStatus = 'Unsafe: Boil Before Drinking';
        statusBadge = 'CRITICAL';
        iconColor = '#EF4444';
      } else if (t.wqi_score > 50) {
        potabilityStatus = 'Moderate: In-Home Filter Advised';
        statusBadge = 'CAUTION';
        iconColor = '#F59E0B';
      }

      return {
        station_id: t.station_id,
        name: t.station_name,
        city: t.city,
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
      city,
      public_status: generalPublicStatus,
      headline,
      advisory_message: advisoryMessage,
      banner_color: bannerColor,
      neighborhoods,
      active_advisories: activeAdvisories,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/citizen/report
router.post('/report', (req, res) => {
  try {
    const { citizen_name, contact_info, issue_type, severity, latitude, longitude, address, description, station_id, city } = req.body;

    if (!citizen_name || !issue_type || !address) {
      return res.status(400).json({ success: false, error: 'Name, address, and issue category are required' });
    }

    const reportId = db.createCitizenReport({
      citizen_name,
      contact_info,
      city: city || 'Trichy',
      issue_type,
      severity: severity || 'MEDIUM',
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      address,
      description,
      station_id: station_id || null
    });

    // Also raise an incident alert for municipal authorities
    db.createAlert({
      station_id: station_id || 'TRICHY_ROCKFORT_04',
      title: `Citizen Report in ${city || 'Trichy'}: ${issue_type.replace('_', ' ')}`,
      description: `Reported by ${citizen_name} at ${address}: "${description || 'No additional note'}"`,
      severity: severity === 'HIGH' ? 'WARNING' : 'INFO',
      status: 'NEW',
      source: 'CITIZEN'
    });

    res.status(201).json({
      success: true,
      message: 'Your report has been logged with municipal water engineers. Reference ID #' + reportId,
      report_id: reportId
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/citizen/reports?city=Trichy
router.get('/reports', (req, res) => {
  try {
    const city = req.query.city || null;
    const reports = db.getCitizenReports(50, city);
    res.json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/citizen/reports/:id/status (Update report status & assigned team)
router.post('/reports/:id/status', (req, res) => {
  try {
    const { status, assigned_team, resolution_summary } = req.body;
    db.updateCitizenReportStatus(req.params.id, status, assigned_team, resolution_summary);
    res.json({ success: true, message: `Report #${req.params.id} updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
