// Alert Management and Notification Service

const db = require('../db');

// Cache to prevent duplicate alert spam within 5 minutes for the same station and parameter
const recentAlertCache = new Map();
const ALERT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

function shouldSuppressAlert(stationId, parameter) {
  const key = `${stationId}_${parameter}`;
  const now = Date.now();
  if (recentAlertCache.has(key)) {
    const lastSent = recentAlertCache.get(key);
    if (now - lastSent < ALERT_COOLDOWN_MS) {
      return true; // Suppress
    }
  }
  recentAlertCache.set(key, now);
  return false;
}

/**
 * Evaluate reading and generate alert if appropriate
 */
function processAlertsForReading(station, telemetry, wqiResult, anomalies, riskResult, wsBroadcaster = null) {
  const generatedAlerts = [];

  // 1. Process Anomalies
  anomalies.forEach(anomaly => {
    if (shouldSuppressAlert(station.id, anomaly.parameter)) {
      return;
    }

    let alertSeverity = 'WARNING';
    if (anomaly.severity === 'CRITICAL' || riskResult.risk_level === 'CRITICAL') {
      alertSeverity = 'CRITICAL';
    } else if (anomaly.severity === 'LOW') {
      alertSeverity = 'INFO';
    }

    const title = `${alertSeverity} Alert: ${station.name} - ${anomaly.parameter.toUpperCase()} Anomaly`;
    const alertId = db.createAlert({
      station_id: station.id,
      title,
      description: anomaly.description,
      severity: alertSeverity,
      status: 'NEW',
      source: 'SYSTEM'
    });

    const createdAlert = {
      id: alertId,
      station_id: station.id,
      station_name: station.name,
      district: station.district,
      title,
      description: anomaly.description,
      severity: alertSeverity,
      status: 'NEW',
      created_at: new Date().toISOString()
    };

    generatedAlerts.push(createdAlert);

    // Broadcast live over WebSockets
    if (wsBroadcaster) {
      wsBroadcaster({
        type: 'ALERT_RAISED',
        data: createdAlert
      });
    }
  });

  // 2. High Risk Alert if no anomalies triggered but cumulative risk is critical
  if (riskResult.risk_level === 'CRITICAL' && anomalies.length === 0) {
    if (!shouldSuppressAlert(station.id, 'CUMULATIVE_RISK')) {
      const title = `CRITICAL Risk Alert: ${station.name} Operational Risk Exceeded`;
      const description = `Operational risk score reached ${riskResult.risk_score}/100. Recommendations: ${riskResult.recommended_actions.join('; ')}`;
      const alertId = db.createAlert({
        station_id: station.id,
        title,
        description,
        severity: 'CRITICAL',
        status: 'NEW',
        source: 'SYSTEM'
      });

      const createdAlert = {
        id: alertId,
        station_id: station.id,
        station_name: station.name,
        district: station.district,
        title,
        description,
        severity: 'CRITICAL',
        status: 'NEW',
        created_at: new Date().toISOString()
      };

      generatedAlerts.push(createdAlert);

      if (wsBroadcaster) {
        wsBroadcaster({
          type: 'ALERT_RAISED',
          data: createdAlert
        });
      }
    }
  }

  return generatedAlerts;
}

module.exports = {
  processAlertsForReading
};
