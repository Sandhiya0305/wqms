-- Water Quality Monitoring System - SQLite Schema

CREATE TABLE IF NOT EXISTS stations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT DEFAULT 'Trichy',           -- 'Trichy', 'Chennai', 'Bengaluru', 'Madurai'
  type TEXT NOT NULL,                   -- 'RIVER', 'RESERVOIR', 'TREATMENT_PLANT', 'TAP_NETWORK', 'BOREWELL'
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  district TEXT NOT NULL,
  watershed_basin TEXT,
  criticality_weight REAL DEFAULT 1.0,  -- 0.5 (low impact) to 1.0 (major metro intake)
  status TEXT DEFAULT 'ONLINE',         -- 'ONLINE', 'WARNING', 'CRITICAL', 'MAINTENANCE'
  battery_level INTEGER DEFAULT 100,
  signal_rssi INTEGER DEFAULT -65,
  last_calibrated_at TEXT,
  last_seen_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS telemetry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  station_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  ph REAL NOT NULL,
  turbidity_ntu REAL NOT NULL,
  do_mg_l REAL NOT NULL,
  tds_ppm REAL NOT NULL,
  temp_c REAL NOT NULL,
  chlorine_mg_l REAL DEFAULT 0.5,
  nitrate_mg_l REAL DEFAULT 10.0,
  conductivity_us REAL,
  wqi_score REAL NOT NULL,
  wqi_status TEXT NOT NULL,              -- 'EXCELLENT', 'GOOD', 'POOR', 'VERY_POOR', 'HAZARDOUS'
  battery_pct INTEGER,
  signal_rssi INTEGER,
  is_anomaly INTEGER DEFAULT 0,
  raw_payload TEXT,
  FOREIGN KEY (station_id) REFERENCES stations(id)
);

CREATE INDEX IF NOT EXISTS idx_telemetry_station_time ON telemetry(station_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS anomalies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telemetry_id INTEGER,
  station_id TEXT NOT NULL,
  parameter TEXT NOT NULL,
  detected_value REAL NOT NULL,
  baseline_value REAL,
  anomaly_type TEXT NOT NULL,            -- 'THRESHOLD_EXCEEDED', 'RATE_OF_CHANGE', 'STATISTICAL_ZSCORE', 'COMPOSITE_SHOCK', 'FLATLINE'
  severity TEXT NOT NULL,                -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  description TEXT,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (station_id) REFERENCES stations(id)
);

CREATE INDEX IF NOT EXISTS idx_anomalies_station_time ON anomalies(station_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  station_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,                -- 'INFO', 'WARNING', 'CRITICAL'
  status TEXT DEFAULT 'NEW',             -- 'NEW', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED'
  source TEXT DEFAULT 'SYSTEM',          -- 'SYSTEM', 'CITIZEN', 'MANUAL'
  acknowledged_by TEXT,
  resolution_notes TEXT,
  resolved_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (station_id) REFERENCES stations(id)
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status, created_at DESC);

CREATE TABLE IF NOT EXISTS risk_assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  station_id TEXT NOT NULL,
  risk_score REAL NOT NULL,              -- 0 to 100
  risk_level TEXT NOT NULL,              -- 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'
  contributing_factors TEXT NOT NULL,    -- JSON
  recommended_actions TEXT NOT NULL,     -- JSON
  timestamp TEXT NOT NULL,
  FOREIGN KEY (station_id) REFERENCES stations(id)
);

CREATE TABLE IF NOT EXISTS citizen_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  station_id TEXT,
  city TEXT DEFAULT 'Trichy',
  citizen_name TEXT NOT NULL,
  contact_info TEXT,
  issue_type TEXT NOT NULL,              -- 'MURKY_COLOR', 'FOUL_ODOR', 'CHEMICAL_TASTE', 'PIPE_LEAK', 'OTHER'
  severity TEXT DEFAULT 'MEDIUM',
  latitude REAL,
  longitude REAL,
  address TEXT,
  description TEXT,
  status TEXT DEFAULT 'PENDING',         -- 'PENDING', 'INVESTIGATING', 'VERIFIED', 'RESOLVED'
  assigned_team TEXT,
  resolution_summary TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Distinct feature for Chief Health Officer: Public health advisory broadcasts
CREATE TABLE IF NOT EXISTS public_advisories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  area TEXT NOT NULL,
  city TEXT DEFAULT 'Trichy',
  type TEXT NOT NULL,                    -- 'BOIL_WATER', 'HIGH_TURBIDITY', 'CHLORINE_LOW', 'PRECAUTION', 'SAFE_RESTORED'
  severity TEXT DEFAULT 'WARNING',
  message TEXT NOT NULL,
  guidelines TEXT NOT NULL,
  issued_by TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE',          -- 'ACTIVE', 'REVOKED'
  created_at TEXT DEFAULT (datetime('now'))
);

-- Distinct feature for Municipal Engineer: Threshold calibration & emergency valve controls
CREATE TABLE IF NOT EXISTS threshold_overrides (
  station_id TEXT PRIMARY KEY,
  ph_min REAL DEFAULT 6.5,
  ph_max REAL DEFAULT 8.5,
  turbidity_max REAL DEFAULT 5.0,
  do_min REAL DEFAULT 5.0,
  tds_max REAL DEFAULT 500.0,
  valve_status TEXT DEFAULT 'OPEN',      -- 'OPEN', 'THROTTLED', 'CLOSED'
  last_calibrated_by TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Distinct feature for Field Operations Lead: Edge node calibration logs
CREATE TABLE IF NOT EXISTS calibration_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  station_id TEXT NOT NULL,
  technician TEXT NOT NULL,
  ph_slope REAL,
  ph_offset REAL,
  turbidity_baseline_v REAL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
