# Execution Record

Captured on 2026-10-28 from the redesigned local application at `http://localhost:5173`.

This record reflects the navy/cyan theme, aligned sidebar, shared page names, actionable overview cards, and reduced simulation emphasis. The Leaflet map was verified on the overview, station map, field operations map, health officer map, and citizen safety map pages.

## Login

![Login](./screenshots/01-login.png)

## Municipal engineer

| Page | Screenshot |
|---|---|
| Command overview | ![Engineer overview](./screenshots/02-engineer-overview.png) |
| Live water map | ![Engineer map](./screenshots/03-engineer-map.png) |
| Sensor stations | ![Engineer stations](./screenshots/04-engineer-stations.png) |
| Alerts and incidents | ![Engineer alerts](./screenshots/05-engineer-alerts.png) |
| Thresholds | ![Engineer thresholds](./screenshots/06-engineer-thresholds.png) |
| Reports | ![Engineer reports](./screenshots/08-engineer-reports.png) |

## Field operations

| Page | Screenshot |
|---|---|
| Fleet health | ![Field fleet health](./screenshots/09-field-fleet-health.png) |
| Probe calibration | ![Field calibration](./screenshots/10-field-calibration.png) |
| Station map | ![Field map](./screenshots/11-field-map.png) |
| Probe readings | ![Field readings](./screenshots/12-field-readings.png) |
| Equipment alerts | ![Field alerts](./screenshots/13-field-alerts.png) |

## Public health officer

| Page | Screenshot |
|---|---|
| Public advisories | ![Public advisories](./screenshots/14-health-advisories.png) |
| Health overview | ![Health overview](./screenshots/15-health-overview.png) |
| Citizen reports | ![Citizen reports](./screenshots/16-health-grievances.png) |
| Risk map | ![Health risk map](./screenshots/17-health-map.png) |
| Contamination alerts | ![Contamination alerts](./screenshots/18-health-alerts.png) |
| Compliance reports | ![Compliance reports](./screenshots/19-health-reports.png) |

## Citizen portal

| Page | Screenshot |
|---|---|
| Water status | ![Water status](./screenshots/20-citizen-home.png) |
| Safety map | ![Safety map](./screenshots/21-citizen-map.png) |
| Report a problem | ![Report a problem](./screenshots/22-citizen-report.png) |
| My reports | ![My reports](./screenshots/23-citizen-tracker.png) |
| Advisories | ![Advisories](./screenshots/24-citizen-advisories.png) |

## Verification

- `npm run build:client` passed.
- Backend station API responded with live station data.
- Vite client responded successfully at `http://localhost:5173`.
- 23 screenshots refreshed after the theme, navigation, and overview interaction changes.
