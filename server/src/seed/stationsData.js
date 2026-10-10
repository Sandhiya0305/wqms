// Seed Data: Public Water Quality Monitoring Stations

const STATIONS = [
  {
    id: 'STATION_RIVER_01',
    name: 'River Source Intake Station #1',
    type: 'RIVER',
    latitude: 28.6139,
    longitude: 77.2090,
    district: 'Riverfront North',
    watershed_basin: 'Upper Valley River Basin',
    criticality_weight: 1.0,
    status: 'ONLINE',
    battery_level: 94,
    signal_rssi: -62,
    last_calibrated_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'STATION_WTP_02',
    name: 'Central Municipal Water Treatment Plant',
    type: 'TREATMENT_PLANT',
    latitude: 28.6304,
    longitude: 77.2177,
    district: 'Central Metro',
    watershed_basin: 'Municipal Water Works Zone',
    criticality_weight: 1.0,
    status: 'ONLINE',
    battery_level: 100, // Grid powered
    signal_rssi: -50,
    last_calibrated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'STATION_TAP_03',
    name: 'Ward 7 Urban Tap Distribution Grid',
    type: 'TAP_NETWORK',
    latitude: 28.6450,
    longitude: 77.2300,
    district: 'Residential North East',
    watershed_basin: 'Municipal Pipe Network',
    criticality_weight: 0.9,
    status: 'ONLINE',
    battery_level: 88,
    signal_rssi: -68,
    last_calibrated_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'STATION_RES_04',
    name: 'Blue Ridge Highland Reservoir',
    type: 'RESERVOIR',
    latitude: 28.5800,
    longitude: 77.1700,
    district: 'South Hills Basin',
    watershed_basin: 'Highland Catchment Area',
    criticality_weight: 0.85,
    status: 'ONLINE',
    battery_level: 92,
    signal_rssi: -74,
    last_calibrated_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'STATION_WELL_05',
    name: 'Green Valley Community Groundwater Well',
    type: 'BOREWELL',
    latitude: 28.6600,
    longitude: 77.1500,
    district: 'West Agro Zone',
    watershed_basin: 'Valley Aquifer Sector 4',
    criticality_weight: 0.7,
    status: 'ONLINE',
    battery_level: 85,
    signal_rssi: -79,
    last_calibrated_at: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString()
  }
];

module.exports = {
  STATIONS
};
