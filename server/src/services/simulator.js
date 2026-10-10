// Real-World Dataset Simulation & Scenario Replay Engine

const db = require('../db');
const { validateTelemetryPayload } = require('./validator');
const { calculateWQI } = require('./wqiEngine');
const { detectAnomalies } = require('./anomalyDetector');
const { estimateOperationalRisk } = require('./riskEngine');
const { processAlertsForReading } = require('./alertService');

class SimulationEngine {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.intervalMs = 4000; // 4 seconds per tick by default
    this.playbackSpeed = 1; // 1x, 2x, 5x, 10x
    this.wsBroadcaster = null;
    this.stationStates = new Map();
    this.activeScenarios = new Set();
  }

  setBroadcaster(broadcaster) {
    this.wsBroadcaster = broadcaster;
  }

  initStationStates() {
    const stations = db.getStations();
    stations.forEach(st => {
      const latest = db.getLatestTelemetryForStation(st.id);
      if (latest) {
        this.stationStates.set(st.id, {
          ph: latest.ph,
          turbidity_ntu: latest.turbidity_ntu,
          do_mg_l: latest.do_mg_l,
          tds_ppm: latest.tds_ppm,
          temp_c: latest.temp_c,
          battery_pct: latest.battery_pct || 95,
          signal_rssi: latest.signal_rssi || -65
        });
      }
    });
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.initStationStates();
    console.log(`[Simulator] Started simulation engine (tick interval: ${this.intervalMs}ms, speed: ${this.playbackSpeed}x)`);
    this.scheduleNextTick();
    this.broadcastStatus();
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    console.log('[Simulator] Stopped simulation engine.');
    this.broadcastStatus();
  }

  setSpeed(speedMultiplier) {
    this.playbackSpeed = Math.max(1, Math.min(20, Number(speedMultiplier) || 1));
    this.intervalMs = Math.round(4000 / this.playbackSpeed);
    console.log(`[Simulator] Speed updated to ${this.playbackSpeed}x (${this.intervalMs}ms tick interval)`);
    if (this.isRunning) {
      if (this.intervalId) clearTimeout(this.intervalId);
      this.scheduleNextTick();
    }
    this.broadcastStatus();
  }

  scheduleNextTick() {
    if (!this.isRunning) return;
    this.intervalId = setTimeout(() => {
      this.tick();
      this.scheduleNextTick();
    }, this.intervalMs);
  }

  /**
   * Process a single reading through the unified pipeline
   */
  processIngestion(rawPayload) {
    const validation = validateTelemetryPayload(rawPayload);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const clean = validation.data;
    const station = db.getStationById(clean.station_id);
    if (!station) {
      return { success: false, errors: [`Station not found: ${clean.station_id}`] };
    }

    // Historical window for statistical anomaly detection & persistence
    const historyWindow = db.getRecentTelemetryWindow(clean.station_id, 30);

    // 1. Calculate WQI
    const wqiResult = calculateWQI(clean);
    clean.wqi_score = wqiResult.wqi_score;
    clean.wqi_status = wqiResult.wqi_status;

    // 2. Detect Anomalies
    const anomalies = detectAnomalies(clean, historyWindow);
    clean.is_anomaly = anomalies.length > 0;

    // 3. Store Reading
    const telemetryId = db.insertTelemetry(clean);
    clean.id = telemetryId;

    // Store Anomalies
    const savedAnomalies = [];
    anomalies.forEach(a => {
      const aId = db.insertAnomaly({
        telemetry_id: telemetryId,
        station_id: clean.station_id,
        ...a,
        timestamp: clean.timestamp
      });
      savedAnomalies.push({ id: aId, ...a });
    });

    // 4. Operational Risk Estimation
    const riskResult = estimateOperationalRisk(station, wqiResult, anomalies, historyWindow);
    db.saveRiskAssessment({
      station_id: clean.station_id,
      ...riskResult,
      timestamp: clean.timestamp
    });

    // 5. Update Station status
    let newStationStatus = 'ONLINE';
    if (riskResult.risk_level === 'CRITICAL') {
      newStationStatus = 'CRITICAL';
    } else if (riskResult.risk_level === 'HIGH' || anomalies.length > 0) {
      newStationStatus = 'WARNING';
    }
    db.updateStationStatus(station.id, newStationStatus, clean.battery_pct, clean.signal_rssi);

    // 6. Process & Dispatch Alerts
    const alerts = processAlertsForReading(station, clean, wqiResult, anomalies, riskResult, this.wsBroadcaster);

    // 7. WebSocket Live Broadcast
    if (this.wsBroadcaster) {
      this.wsBroadcaster({
        type: 'TELEMETRY_UPDATE',
        data: {
          reading: {
            ...clean,
            station_name: station.name,
            station_type: station.type,
            district: station.district
          },
          wqi: wqiResult,
          risk: {
            station_id: station.id,
            station_name: station.name,
            ...riskResult
          },
          anomalies: savedAnomalies,
          alerts
        }
      });
    }

    return {
      success: true,
      telemetry_id: telemetryId,
      wqi: wqiResult,
      anomalies: savedAnomalies,
      risk: riskResult,
      alerts
    };
  }

  /**
   * Main simulation tick: slightly fluctuates parameters for all stations or applies active scenario effects
   */
  tick() {
    const stations = db.getStations();
    stations.forEach(station => {
      let state = this.stationStates.get(station.id);
      if (!state) {
        state = {
          ph: 7.3,
          turbidity_ntu: 2.0,
          do_mg_l: 7.5,
          tds_ppm: 220,
          temp_c: 22.0,
          battery_pct: 95,
          signal_rssi: -65
        };
        this.stationStates.set(station.id, state);
      }

      // Natural stochastic brownian drift
      let dPh = (Math.random() - 0.5) * 0.06;
      let dTurb = (Math.random() - 0.5) * 0.15;
      let dDo = (Math.random() - 0.5) * 0.08;
      let dTds = (Math.random() - 0.5) * 2.5;
      let dTemp = (Math.random() - 0.5) * 0.1;

      // Apply Active Scenarios if triggered
      if (this.activeScenarios.has('SPILL') && station.id === 'STATION_RIVERSIDE_01') {
        // Severe Acid Spill: pH plunges, TDS spikes
        dPh = -0.35;
        dTds = 35.0;
        dTurb = 4.0;
        dDo = -0.4;
      }

      if (this.activeScenarios.has('RUNOFF') && station.id === 'STATION_EAST_03') {
        // Monsoon Runoff: Turbidity explodes, DO decreases
        dTurb = 6.0;
        dDo = -0.3;
        dTds = 15.0;
      }

      if (this.activeScenarios.has('CHLORINE_DROP') && station.id === 'STATION_WEST_04') {
        // Disinfection drop & contamination in tap grid
        dPh = 0.2;
        dTurb = 2.5;
        dDo = -0.5;
        dTds = 20.0;
      }

      // Update state with clamping
      state.ph = Math.max(3.0, Math.min(11.0, Math.round((state.ph + dPh) * 100) / 100));
      state.turbidity_ntu = Math.max(0.1, Math.min(250.0, Math.round((state.turbidity_ntu + dTurb) * 100) / 100));
      state.do_mg_l = Math.max(0.5, Math.min(14.0, Math.round((state.do_mg_l + dDo) * 100) / 100));
      state.tds_ppm = Math.max(50.0, Math.min(2000.0, Math.round((state.tds_ppm + dTds) * 10) / 10));
      state.temp_c = Math.max(10.0, Math.min(38.0, Math.round((state.temp_c + dTemp) * 10) / 10));

      // Build payload and ingest through standard pipeline
      const payload = {
        station_id: station.id,
        timestamp: new Date().toISOString(),
        ph: state.ph,
        turbidity_ntu: state.turbidity_ntu,
        do_mg_l: state.do_mg_l,
        tds_ppm: state.tds_ppm,
        temp_c: state.temp_c,
        battery_pct: state.battery_pct,
        signal_rssi: state.signal_rssi
      };

      this.processIngestion(payload);
    });
  }

  injectScenario(scenarioName) {
    console.log(`[Simulator] Injecting scenario: ${scenarioName}`);
    if (scenarioName === 'RESET') {
      this.activeScenarios.clear();
      // Reset station states to normal
      this.stationStates.set('STATION_RIVERSIDE_01', { ph: 7.45, turbidity_ntu: 3.2, do_mg_l: 8.1, tds_ppm: 142, temp_c: 24.8, battery_pct: 94, signal_rssi: -62 });
      this.stationStates.set('STATION_NORTH_02', { ph: 7.20, turbidity_ntu: 0.8, do_mg_l: 8.3, tds_ppm: 165, temp_c: 23.5, battery_pct: 100, signal_rssi: -50 });
      this.stationStates.set('STATION_EAST_03', { ph: 7.60, turbidity_ntu: 2.2, do_mg_l: 8.5, tds_ppm: 155, temp_c: 23.0, battery_pct: 91, signal_rssi: -70 });
      this.stationStates.set('STATION_WEST_04', { ph: 7.15, turbidity_ntu: 1.1, do_mg_l: 7.8, tds_ppm: 195, temp_c: 24.0, battery_pct: 88, signal_rssi: -68 });
      this.stationStates.set('STATION_CENTRAL_05', { ph: 7.20, turbidity_ntu: 0.8, do_mg_l: 8.3, tds_ppm: 165, temp_c: 23.5, battery_pct: 100, signal_rssi: -48 });
      this.stationStates.set('STATION_SOUTH_06', { ph: 7.05, turbidity_ntu: 0.6, do_mg_l: 5.3, tds_ppm: 380, temp_c: 24.5, battery_pct: 86, signal_rssi: -76 });
    } else {
      this.activeScenarios.add(scenarioName);
    }
    // Immediately tick to display effect
    this.tick();
    this.broadcastStatus();
  }

  broadcastStatus() {
    if (this.wsBroadcaster) {
      this.wsBroadcaster({
        type: 'SIMULATION_STATUS',
        data: {
          isRunning: this.isRunning,
          playbackSpeed: this.playbackSpeed,
          intervalMs: this.intervalMs,
          activeScenarios: Array.from(this.activeScenarios)
        }
      });
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      playbackSpeed: this.playbackSpeed,
      intervalMs: this.intervalMs,
      activeScenarios: Array.from(this.activeScenarios)
    };
  }
}

const simulator = new SimulationEngine();

module.exports = simulator;
