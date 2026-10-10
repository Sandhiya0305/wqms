const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'water_quality.db');
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for high concurrency
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables from schema.sql
const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);

console.log(`[Database] SQLite database initialized at ${DB_PATH}`);

// Helper methods
const dbService = {
  // Direct DB instance access
  raw: db,

  // Stations
  getStations() {
    return db.prepare('SELECT * FROM stations ORDER BY name ASC').all();
  },

  getStationById(id) {
    return db.prepare('SELECT * FROM stations WHERE id = ?').get(id);
  },

  upsertStation(station) {
    const stmt = db.prepare(`
      INSERT INTO stations (id, name, type, latitude, longitude, district, watershed_basin, criticality_weight, status, battery_level, signal_rssi, last_calibrated_at, last_seen_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        type = excluded.type,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        district = excluded.district,
        watershed_basin = excluded.watershed_basin,
        criticality_weight = excluded.criticality_weight,
        status = excluded.status,
        battery_level = excluded.battery_level,
        signal_rssi = excluded.signal_rssi,
        last_calibrated_at = excluded.last_calibrated_at,
        last_seen_at = excluded.last_seen_at
    `);
    return stmt.run(
      station.id,
      station.name,
      station.type,
      station.latitude,
      station.longitude,
      station.district,
      station.watershed_basin || null,
      station.criticality_weight ?? 1.0,
      station.status || 'ONLINE',
      station.battery_level ?? 100,
      station.signal_rssi ?? -65,
      station.last_calibrated_at || null,
      station.last_seen_at || new Date().toISOString()
    );
  },

  updateStationStatus(stationId, status, batteryLevel, signalRssi) {
    const stmt = db.prepare(`
      UPDATE stations 
      SET status = ?, 
          battery_level = COALESCE(?, battery_level), 
          signal_rssi = COALESCE(?, signal_rssi), 
          last_seen_at = ?
      WHERE id = ?
    `);
    return stmt.run(status, batteryLevel, signalRssi, new Date().toISOString(), stationId);
  },

  // Telemetry
  insertTelemetry(data) {
    const stmt = db.prepare(`
      INSERT INTO telemetry (
        station_id, timestamp, ph, turbidity_ntu, do_mg_l, tds_ppm, temp_c, 
        conductivity_us, wqi_score, wqi_status, battery_pct, signal_rssi, is_anomaly, raw_payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const res = stmt.run(
      data.station_id,
      data.timestamp || new Date().toISOString(),
      data.ph,
      data.turbidity_ntu,
      data.do_mg_l,
      data.tds_ppm,
      data.temp_c,
      data.conductivity_us || (data.tds_ppm * 1.56),
      data.wqi_score,
      data.wqi_status,
      data.battery_pct ?? 95,
      data.signal_rssi ?? -65,
      data.is_anomaly ? 1 : 0,
      data.raw_payload ? JSON.stringify(data.raw_payload) : null
    );
    return res.lastInsertRowid;
  },

  getLatestTelemetryForStation(stationId) {
    return db.prepare(`
      SELECT * FROM telemetry 
      WHERE station_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 1
    `).get(stationId);
  },

  getLatestTelemetryAllStations() {
    return db.prepare(`
      SELECT t.*, s.name as station_name, s.type as station_type, s.latitude, s.longitude, s.district
      FROM telemetry t
      INNER JOIN (
        SELECT station_id, MAX(id) as max_id
        FROM telemetry
        GROUP BY station_id
      ) latest ON t.id = latest.max_id
      INNER JOIN stations s ON t.station_id = s.id
      ORDER BY s.name ASC
    `).all();
  },

  getTelemetryHistory(stationId, limit = 50) {
    const rows = db.prepare(`
      SELECT * FROM telemetry 
      WHERE station_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `).all(stationId, limit);
    return rows.reverse(); // Return in chronological order
  },

  getRecentTelemetryWindow(stationId, count = 30) {
    const rows = db.prepare(`
      SELECT * FROM telemetry 
      WHERE station_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `).all(stationId, count);
    return rows.reverse();
  },

  // Anomalies
  insertAnomaly(anomaly) {
    const stmt = db.prepare(`
      INSERT INTO anomalies (telemetry_id, station_id, parameter, detected_value, baseline_value, anomaly_type, severity, description, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      anomaly.telemetry_id || null,
      anomaly.station_id,
      anomaly.parameter,
      anomaly.detected_value,
      anomaly.baseline_value || null,
      anomaly.anomaly_type,
      anomaly.severity || 'MEDIUM',
      anomaly.description || null,
      anomaly.timestamp || new Date().toISOString()
    );
  },

  getRecentAnomalies(limit = 20) {
    return db.prepare(`
      SELECT a.*, s.name as station_name 
      FROM anomalies a
      JOIN stations s ON a.station_id = s.id
      ORDER BY a.timestamp DESC 
      LIMIT ?
    `).all(limit);
  },

  // Alerts
  createAlert(alert) {
    const stmt = db.prepare(`
      INSERT INTO alerts (station_id, title, description, severity, status, source)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const res = stmt.run(
      alert.station_id,
      alert.title,
      alert.description,
      alert.severity || 'WARNING',
      alert.status || 'NEW',
      alert.source || 'SYSTEM'
    );
    return res.lastInsertRowid;
  },

  getActiveAlerts() {
    return db.prepare(`
      SELECT al.*, s.name as station_name, s.district
      FROM alerts al
      JOIN stations s ON al.station_id = s.id
      WHERE al.status != 'RESOLVED'
      ORDER BY 
        CASE al.severity
          WHEN 'CRITICAL' THEN 1
          WHEN 'WARNING' THEN 2
          ELSE 3
        END,
        al.created_at DESC
    `).all();
  },

  getAllAlerts(limit = 50) {
    return db.prepare(`
      SELECT al.*, s.name as station_name, s.district
      FROM alerts al
      JOIN stations s ON al.station_id = s.id
      ORDER BY al.created_at DESC
      LIMIT ?
    `).all(limit);
  },

  updateAlertStatus(alertId, status, acknowledgedBy, resolutionNotes) {
    const resolvedAt = status === 'RESOLVED' ? new Date().toISOString() : null;
    const stmt = db.prepare(`
      UPDATE alerts
      SET status = ?,
          acknowledged_by = COALESCE(?, acknowledged_by),
          resolution_notes = COALESCE(?, resolution_notes),
          resolved_at = COALESCE(?, resolved_at)
      WHERE id = ?
    `);
    return stmt.run(status, acknowledgedBy, resolutionNotes, resolvedAt, alertId);
  },

  // Risk Assessments
  saveRiskAssessment(risk) {
    const stmt = db.prepare(`
      INSERT INTO risk_assessments (station_id, risk_score, risk_level, contributing_factors, recommended_actions, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      risk.station_id,
      risk.risk_score,
      risk.risk_level,
      JSON.stringify(risk.contributing_factors || []),
      JSON.stringify(risk.recommended_actions || []),
      risk.timestamp || new Date().toISOString()
    );
  },

  getLatestRiskForStations() {
    return db.prepare(`
      SELECT r.*, s.name as station_name, s.type as station_type, s.district
      FROM risk_assessments r
      INNER JOIN (
        SELECT station_id, MAX(id) as max_id
        FROM risk_assessments
        GROUP BY station_id
      ) latest ON r.id = latest.max_id
      INNER JOIN stations s ON r.station_id = s.id
      ORDER BY r.risk_score DESC
    `).all().map(row => ({
      ...row,
      contributing_factors: JSON.parse(row.contributing_factors || '[]'),
      recommended_actions: JSON.parse(row.recommended_actions || '[]')
    }));
  },

  // Citizen Reports
  createCitizenReport(report) {
    const stmt = db.prepare(`
      INSERT INTO citizen_reports (station_id, citizen_name, contact_info, issue_type, severity, latitude, longitude, address, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const res = stmt.run(
      report.station_id || null,
      report.citizen_name,
      report.contact_info || null,
      report.issue_type,
      report.severity || 'MEDIUM',
      report.latitude || null,
      report.longitude || null,
      report.address || null,
      report.description || null,
      'PENDING'
    );
    return res.lastInsertRowid;
  },

  getCitizenReports(limit = 50) {
    return db.prepare(`
      SELECT c.*, s.name as station_name 
      FROM citizen_reports c
      LEFT JOIN stations s ON c.station_id = s.id
      ORDER BY c.created_at DESC 
      LIMIT ?
    `).all(limit);
  },

  updateCitizenReportStatus(id, status) {
    return db.prepare('UPDATE citizen_reports SET status = ? WHERE id = ?').run(status, id);
  }
};

module.exports = dbService;
