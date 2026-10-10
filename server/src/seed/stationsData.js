// Seed Data: Public Water Quality Monitoring Stations (Aligned with WaterGuard Architecture)

const STATIONS = [
  {
    id: 'STATION_RIVERSIDE_01',
    name: 'Riverside Monitoring Station',
    type: 'RIVER',
    latitude: 12.9716,
    longitude: 77.5946,
    district: 'Riverside River Basin',
    watershed_basin: 'Cauvery - Vrishabhavathi Catchment',
    criticality_weight: 1.0,
    status: 'ONLINE',
    battery_level: 94,
    signal_rssi: -62,
    last_calibrated_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'STATION_NORTH_02',
    name: 'North Plant Monitoring Station',
    type: 'TREATMENT_PLANT',
    latitude: 13.0358,
    longitude: 77.5970,
    district: 'North Industrial & Urban Sector',
    watershed_basin: 'Hebbal Water Works Zone',
    criticality_weight: 1.0,
    status: 'ONLINE',
    battery_level: 100,
    signal_rssi: -50,
    last_calibrated_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'STATION_EAST_03',
    name: 'East Reservoir Station',
    type: 'RESERVOIR',
    latitude: 12.9783,
    longitude: 77.6408,
    district: 'East Lake Catchment',
    watershed_basin: 'Bellandur - Varthur Highland Basin',
    criticality_weight: 0.95,
    status: 'ONLINE',
    battery_level: 91,
    signal_rssi: -70,
    last_calibrated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'STATION_WEST_04',
    name: 'West Tap Distribution Station',
    type: 'TAP_NETWORK',
    latitude: 12.9600,
    longitude: 77.5300,
    district: 'West Municipal Tap Grid',
    watershed_basin: 'Nagarbhavi Distribution Sector',
    criticality_weight: 0.9,
    status: 'ONLINE',
    battery_level: 88,
    signal_rssi: -68,
    last_calibrated_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'STATION_CENTRAL_05',
    name: 'Central WTP Monitoring Station',
    type: 'TREATMENT_PLANT',
    latitude: 12.9400,
    longitude: 77.5800,
    district: 'Central Metro Zone',
    watershed_basin: 'Core Urban Water Treatment Complex',
    criticality_weight: 1.0,
    status: 'ONLINE',
    battery_level: 100,
    signal_rssi: -48,
    last_calibrated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'STATION_SOUTH_06',
    name: 'South Borewell Community Station',
    type: 'BOREWELL',
    latitude: 12.9100,
    longitude: 77.6100,
    district: 'South Valley Community Wells',
    watershed_basin: 'BTM - Bannerghatta Aquifer',
    criticality_weight: 0.75,
    status: 'ONLINE',
    battery_level: 86,
    signal_rssi: -76,
    last_calibrated_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString()
  }
];

module.exports = {
  STATIONS
};
