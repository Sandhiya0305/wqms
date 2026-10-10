# AquaIntel: End-to-End Public Water Quality Monitoring & Risk Intelligence Platform

AquaIntel is a production-grade water quality monitoring, risk estimation, and public alerting platform. It continuously receives multi-parameter measurements from public water sources (rivers, reservoirs, treatment plants, tap networks, and community wells), detects anomalies, computes regulatory indices (WHO & BIS Weighted Arithmetic Water Quality Index), estimates operational risk, and presents actionable intelligence to municipal authorities and citizens.

---

## 🌟 Key Features

### 1. Dual-Audience Interactive Dashboards
- **Authority Command Center**:
  - **Interactive GIS Map**: Color-coded geospatial pins (Green = Potable, Amber = Moderate, Red = Critical Hazard).
  - **Multi-Sensor Telemetry Charts**: Real-time time-series streams (pH, Turbidity, DO, TDS, Temperature) with WHO/BIS regulatory threshold guidebands.
  - **Operational Risk Matrix**: Composite 0–100 risk score factoring in WQI severity, anomaly persistence, source criticality, and acute spikes with automated triage recommendations (e.g. chemical dosing adjustments, valve diversions).
  - **Incident Escalation Console**: Real-time alarm triage with acknowledgement and resolution workflows.
  - **IoT Fleet Diagnostics**: Battery %, radio RSSI, and sensor probe calibration drift tracking.
  - **Regulatory Compliance Exporter**: Instant raw CSV downloads and formatted printable PDF water quality audit documentation.
- **Citizen Transparency Portal**:
  - **Public Drinking Safety Banner**: Clear, unambiguous status ("Safe to Drink", "Precautionary Notice", or "Boil Water Advisory").
  - **Neighborhood Water Status**: Hyperlocal cleanliness status for every municipal district.
  - **Health & Precaution Guidelines**: Recommendations for direct drinking, infant formula, cooking, and filtration.
  - **Citizen Incident Reporting**: Public form to report discolored water, foul odors, or pipe leaks directly to the municipal command center.

### 2. Multi-Protocol IoT Ingestion Layer
- **Embedded Aedes MQTT Broker** (port `1883`): Microcontrollers publish directly to `water/sensors/<station_id>/telemetry`.
- **HTTP REST API** (`POST /api/v1/telemetry`): Single or batch ingestion with device token authentication.
- **Native WebSockets** (`ws://localhost:3001/ws`): Real-time bidirectional streaming to connected browser dashboards without polling.
- **ESP32 Edge Firmware**: Complete ready-to-flash C++ sketch with moving average filtering, temperature compensation, WiFi auto-reconnect, and dual MQTT/HTTP failover.

### 3. Analytics & Anomaly Detection Engine
- **Weighted Arithmetic Water Quality Index (WAWQI)**: Compliant with WHO 4th Edition & BIS IS 10500 standards.
- **Multi-Method Anomaly Detection**:
  - Physical boundary violations (pH $< 6.5$ or $> 8.5$, Turbidity $> 5$ NTU, DO $< 5$ mg/L, TDS $> 500$ ppm).
  - Rapid gradient / rate-of-change spikes (chemical flash dumps, acid shock).
  - Rolling statistical Z-Score outlier detection.
  - Multi-sensor composite correlation (detecting organic discharge when DO plummets alongside turbidity/TDS surges).

### 4. Real-World Dataset Simulation & Scenario Replay Engine
- Built-in historical datasets representing 5 diverse hydrological bodies.
- Interactive Replay Engine with variable playback speeds ($1\times, 2\times, 5\times, 10\times$).
- **1-Click Scenario Injectors**:
  - 🚨 *Industrial Chemical Spill*: Acid shock on river intake (pH drops to 4.8).
  - 🌧️ *Monsoon Storm Runoff*: Turbidity surge on reservoir intake (45+ NTU).
  - ⚠️ *Disinfection Failure*: Chlorination drop on municipal tap network.
  - 🔄 *Restore Normal Baseline*: Resets all sources back to pristine drinking standards.

---

## 🔐 Mock Logins & Demo Credentials

The platform includes a 1-click role switcher and mock authentication modal:

| Role | Name & Title | Demo Email | Password | Default Portal |
| :--- | :--- | :--- | :--- | :--- |
| **Municipal Engineer** | **R. Sharma** (Municipal Engineer) | `engineer@waterguard.gov` | `admin123` | Authority Overview |
| **Field Operations Lead** | **A. Kumar** (Field Operations Lead) | `fieldops@waterguard.gov` | `field123` | Hardware Setup |
| **Chief Public Health Officer** | **Dr. S. Patel** (Chief Health Officer) | `health@waterguard.gov` | `health123` | Risk & Compliance |
| **Citizen / Resident** | **Priya Sharma** (Community Resident) | `citizen@waterguard.org` | `citizen123` | Citizen Transparency Portal |

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js (v18+ recommended; v22 native SQLite supported)
- npm or pnpm

### 1. Installation
Install root, server, and client dependencies:
```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Start the Platform
Run the combined production service:
```bash
npm start
```
- Open **http://localhost:3001** in your browser.
- The backend API, WebSocket stream, Aedes MQTT broker (`:1883`), simulation engine, and frontend UI will all be active simultaneously!

For active frontend development with Vite hot reloading:
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run client
# Open http://localhost:5173
```

### 3. Run Automated Tests
```bash
npm test
```

### 4. Run Virtual Multi-Node IoT Simulator (CLI)
To simulate 5 external physical hardware sensor nodes dispatching telemetry:
```bash
npm run simulate:fleet
```

---

## 📡 IoT Hardware Integration (ESP32)

Hardware firmware is located in `firmware/esp32_water_monitor/`.

### Wiring Connections (ESP32 NodeMCU)
| Sensor | Signal Type | ESP32 Pin |
| :--- | :--- | :--- |
| **Analog pH Probe** | Analog (0–3.3V) | **GPIO 34** (ADC1_CH6) |
| **DFRobot Turbidity Sensor** | Analog (0–3.3V) | **GPIO 35** (ADC1_CH7) |
| **Analog TDS Sensor** | Analog (0–2.3V) | **GPIO 32** (ADC1_CH4) |
| **DS18B20 Temp Probe** | Digital OneWire | **GPIO 4** (4.7kΩ pullup) |
| **Status LED** | Digital Output | **GPIO 2** |

See [WIRING_SCHEMATIC.md](file:///d:/water-quality-monitoring-system/firmware/docs/WIRING_SCHEMATIC.md) and [SENSOR_CALIBRATION.md](file:///d:/water-quality-monitoring-system/firmware/docs/SENSOR_CALIBRATION.md) for calibration procedures.

---

## 🔌 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/v1/stations` | List all monitored stations & GPS coordinates |
| `GET` | `/api/v1/stations/:id/history` | Historical time-series telemetry points |
| `POST`| `/api/v1/telemetry` | Ingest sensor telemetry (single or batch) |
| `GET` | `/api/v1/telemetry/latest` | Latest readings across all stations |
| `GET` | `/api/v1/alerts` | Active or historical incident alerts |
| `POST`| `/api/v1/alerts/:id/acknowledge`| Acknowledge alert |
| `POST`| `/api/v1/alerts/:id/resolve` | Resolve alert with notes |
| `GET` | `/api/v1/risk` | Operational risk scores & triage recommendations |
| `GET` | `/api/v1/citizen/overview` | Public drinking safety advisory & zone statuses |
| `POST`| `/api/v1/citizen/report` | Submit citizen water complaint / incident report |
| `POST`| `/api/v1/simulation/inject` | Trigger test scenario (`SPILL`, `RUNOFF`, `RESET`)|

---

## 📊 Standards Reference
- **WHO Guidelines for Drinking-Water Quality (4th Edition)**
- **Bureau of Indian Standards (BIS IS 10500:2012)**
- **Weighted Arithmetic Water Quality Index (Brown et al., 1970)**
