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

// Column migrations for pre-existing databases
try {
  const stationCols = db.prepare('PRAGMA table_info(stations)').all().map(c => c.name);
  if (!stationCols.includes('city')) {
    db.exec("ALTER TABLE stations ADD COLUMN city TEXT NOT NULL DEFAULT 'Trichy';");
  }
  const reportCols = db.prepare('PRAGMA table_info(citizen_reports)').all().map(c => c.name);
  if (!reportCols.includes('city')) {
    db.exec("ALTER TABLE citizen_reports ADD COLUMN city TEXT NOT NULL DEFAULT 'Trichy';");
  }
  const telCols = db.prepare('PRAGMA table_info(telemetry)').all().map(c => c.name);
  if (!telCols.includes('chlorine_mg_l')) {
    db.exec("ALTER TABLE telemetry ADD COLUMN chlorine_mg_l REAL DEFAULT 0.5;");
  }
  if (!telCols.includes('nitrate_mg_l')) {
    db.exec("ALTER TABLE telemetry ADD COLUMN nitrate_mg_l REAL DEFAULT 10.0;");
  }
} catch (migErr) {
  console.warn('[Database Migration Notice]', migErr.message);
}

console.log(`[Database] SQLite database initialized at ${DB_PATH}`);

// Helper methods
const dbService = {
  raw: db,

  // Stations
  getStations(city = null) {
    if (city && city !== 'ALL') {
      return db.prepare('SELECT * FROM stations WHERE city = ? ORDER BY name ASC').all(city);
    }
    return db.prepare('SELECT * FROM stations ORDER BY city ASC, name ASC').all();
  },

  getStationById(id) {
    return db.prepare('SELECT * FROM stations WHERE id = ?').get(id);
  },

  upsertStation(station) {
    const stmt = db.prepare(`
      INSERT INTO stations (id, name, city, type, latitude, longitude, district, watershed_basin, criticality_weight, status, battery_level, signal_rssi, last_calibrated_at, last_seen_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        city = excluded.city,
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
      station.city || 'Trichy',
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
        chlorine_mg_l, nitrate_mg_l, conductivity_us, wqi_score, wqi_status, 
        battery_pct, signal_rssi, is_anomaly, raw_payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const res = stmt.run(
      data.station_id,
      data.timestamp || new Date().toISOString(),
      data.ph,
      data.turbidity_ntu,
      data.do_mg_l,
      data.tds_ppm,
      data.temp_c,
      data.chlorine_mg_l ?? 0.6,
      data.nitrate_mg_l ?? 12.0,
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

  getLatestTelemetryAllStations(city = null) {
    let sql = `
      SELECT t.*, s.name as station_name, s.city, s.type as station_type, s.latitude, s.longitude, s.district
      FROM telemetry t
      INNER JOIN (
        SELECT station_id, MAX(id) as max_id
        FROM telemetry
        GROUP BY station_id
      ) latest ON t.id = latest.max_id
      INNER JOIN stations s ON t.station_id = s.id
    `;
    if (city && city !== 'ALL') {
      sql += ` WHERE s.city = ? ORDER BY s.name ASC`;
      return db.prepare(sql).all(city);
    }
    sql += ` ORDER BY s.city ASC, s.name ASC`;
    return db.prepare(sql).all();
  },

  getTelemetryHistory(stationId, limit = 50) {
    const rows = db.prepare(`
      SELECT * FROM telemetry 
      WHERE station_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `).all(stationId, limit);
    return rows.reverse();
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
      SELECT a.*, s.name as station_name, s.city 
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

  getActiveAlerts(city = null) {
    let sql = `
      SELECT al.*, s.name as station_name, s.city, s.district
      FROM alerts al
      JOIN stations s ON al.station_id = s.id
      WHERE al.status != 'RESOLVED'
    `;
    if (city && city !== 'ALL') {
      sql += ` AND s.city = ?`;
      return db.prepare(sql + ` ORDER BY al.created_at DESC`).all(city);
    }
    return db.prepare(sql + ` ORDER BY al.created_at DESC`).all();
  },

  getAllAlerts(limit = 50) {
    return db.prepare(`
      SELECT al.*, s.name as station_name, s.city, s.district
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

  getLatestRiskForStations(city = null) {
    let sql = `
      SELECT r.*, s.name as station_name, s.city, s.type as station_type, s.district
      FROM risk_assessments r
      INNER JOIN (
        SELECT station_id, MAX(id) as max_id
        FROM risk_assessments
        GROUP BY station_id
      ) latest ON r.id = latest.max_id
      INNER JOIN stations s ON r.station_id = s.id
    `;
    if (city && city !== 'ALL') {
      sql += ` WHERE s.city = ? ORDER BY r.risk_score DESC`;
      return db.prepare(sql).all(city).map(row => ({
        ...row,
        contributing_factors: JSON.parse(row.contributing_factors || '[]'),
        recommended_actions: JSON.parse(row.recommended_actions || '[]')
      }));
    }
    sql += ` ORDER BY r.risk_score DESC`;
    return db.prepare(sql).all().map(row => ({
      ...row,
      contributing_factors: JSON.parse(row.contributing_factors || '[]'),
      recommended_actions: JSON.parse(row.recommended_actions || '[]')
    }));
  },

  // Citizen Reports
  createCitizenReport(report) {
    const stmt = db.prepare(`
      INSERT INTO citizen_reports (station_id, city, citizen_name, contact_info, issue_type, severity, latitude, longitude, address, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const res = stmt.run(
      report.station_id || null,
      report.city || 'Trichy',
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

  getCitizenReports(limit = 50, city = null) {
    let sql = `
      SELECT c.*, s.name as station_name 
      FROM citizen_reports c
      LEFT JOIN stations s ON c.station_id = s.id
    `;
    if (city && city !== 'ALL') {
      sql += ` WHERE c.city = ? ORDER BY c.created_at DESC LIMIT ?`;
      return db.prepare(sql).all(city, limit);
    }
    sql += ` ORDER BY c.created_at DESC LIMIT ?`;
    return db.prepare(sql).all(limit);
  },

  updateCitizenReportStatus(id, status, assignedTeam, resolutionSummary) {
    return db.prepare(`
      UPDATE citizen_reports 
      SET status = ?,
          assigned_team = COALESCE(?, assigned_team),
          resolution_summary = COALESCE(?, resolution_summary)
      WHERE id = ?
    `).run(status, assignedTeam, resolutionSummary, id);
  },

  // Public Health Advisories (Chief Health Officer distinct feature)
  getPublicAdvisories(city = null, activeOnly = true) {
    let sql = `SELECT * FROM public_advisories`;
    const params = [];
    const conditions = [];

    if (activeOnly) {
      conditions.push(`status = 'ACTIVE'`);
    }
    if (city && city !== 'ALL') {
      conditions.push(`city = ?`);
      params.push(city);
    }
    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }
    sql += ` ORDER BY created_at DESC`;
    return db.prepare(sql).all(...params);
  },

  createPublicAdvisory(advisory) {
    const stmt = db.prepare(`
      INSERT INTO public_advisories (title, area, city, type, severity, message, guidelines, issued_by, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const res = stmt.run(
      advisory.title,
      advisory.area,
      advisory.city || 'Trichy',
      advisory.type || 'BOIL_WATER',
      advisory.severity || 'WARNING',
      advisory.message,
      advisory.guidelines || '',
      advisory.issued_by || 'Chief Public Health Officer',
      'ACTIVE'
    );
    return res.lastInsertRowid;
  },

  revokePublicAdvisory(id) {
    return db.prepare(`UPDATE public_advisories SET status = 'REVOKED' WHERE id = ?`).run(id);
  },

  // Threshold Overrides & Valve Controls (Municipal Engineer distinct feature)
  getThresholdOverrides(stationId = null) {
    if (stationId) {
      return db.prepare(`SELECT * FROM threshold_overrides WHERE station_id = ?`).get(stationId);
    }
    return db.prepare(`SELECT t.*, s.name as station_name, s.city, s.district FROM threshold_overrides t JOIN stations s ON t.station_id = s.id`).all();
  },

  upsertThresholdOverride(data) {
    const stmt = db.prepare(`
      INSERT INTO threshold_overrides (station_id, ph_min, ph_max, turbidity_max, do_min, tds_max, valve_status, last_calibrated_by, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(station_id) DO UPDATE SET
        ph_min = excluded.ph_min,
        ph_max = excluded.ph_max,
        turbidity_max = excluded.turbidity_max,
        do_min = excluded.do_min,
        tds_max = excluded.tds_max,
        valve_status = excluded.valve_status,
        last_calibrated_by = excluded.last_calibrated_by,
        updated_at = excluded.updated_at
    `);
    return stmt.run(
      data.station_id,
      data.ph_min ?? 6.5,
      data.ph_max ?? 8.5,
      data.turbidity_max ?? 5.0,
      data.do_min ?? 5.0,
      data.tds_max ?? 500.0,
      data.valve_status || 'OPEN',
      data.last_calibrated_by || 'Municipal Engineer',
      new Date().toISOString()
    );
  },

  // Edge Calibration Logs (Field Operations distinct feature)
  logCalibration(entry) {
    const stmt = db.prepare(`
      INSERT INTO calibration_logs (device_id, station_id, technician, ph_slope, ph_offset, turbidity_baseline_v, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      entry.device_id,
      entry.station_id,
      entry.technician || 'Field Operations Lead',
      entry.ph_slope ?? 3.5,
      entry.ph_offset ?? 0.0,
      entry.turbidity_baseline_v ?? 4.1,
      entry.notes || 'Routine two-point buffer calibration completed'
    );
  },

  getCalibrationLogs(limit = 20) {
    return db.prepare(`
      SELECT c.*, s.name as station_name, s.city
      FROM calibration_logs c
      JOIN stations s ON c.station_id = s.id
      ORDER BY c.created_at DESC
      LIMIT ?
    `).all(limit);
  }
};

module.exports = dbService;
