// Seed Data: Multi-City Water Quality Monitoring Stations
// Comprehensive real-world mapping across Trichy District (Tamil Nadu) and surrounding metropolitan hubs

const STATIONS = [
  // ==========================================
  // Tiruchirappalli (Trichy) District, Tamil Nadu, India
  // ==========================================
  {
    id: 'TRICHY_KAVERI_01',
    name: 'Kaveri River Intake (Srirangam / Amma Mandapam)',
    city: 'Trichy',
    type: 'RIVER',
    latitude: 10.8622,
    longitude: 78.6920,
    district: 'Srirangam Island Zone',
    watershed_basin: 'Cauvery River Delta Main Basin',
    criticality_weight: 1.0,
    status: 'ONLINE',
    battery_level: 95,
    signal_rssi: -58,
    last_calibrated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'TRICHY_KOLLIDAM_02',
    name: 'Kollidam River Infiltration Intake (Thiruvanaikaval)',
    city: 'Trichy',
    type: 'RIVER',
    latitude: 10.8540,
    longitude: 78.7110,
    district: 'Thiruvanaikaval North',
    watershed_basin: 'Coleroon River Sub-basin',
    criticality_weight: 1.0,
    status: 'ONLINE',
    battery_level: 92,
    signal_rssi: -62,
    last_calibrated_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'TRICHY_WTP_KAMBAR_03',
    name: 'Kambarasampettai Central Water Works & WTP',
    city: 'Trichy',
    type: 'TREATMENT_PLANT',
    latitude: 10.8420,
    longitude: 78.6470,
    district: 'Kambarasampettai Water Works',
    watershed_basin: 'Trichy City Corporation Main Pumping Complex',
    criticality_weight: 1.0,
    status: 'ONLINE',
    battery_level: 100, // Grid powered
    signal_rssi: -45,
    last_calibrated_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'TRICHY_ROCKFORT_04',
    name: 'Rockfort Urban Tap Grid (Teppakulam & Main Guard)',
    city: 'Trichy',
    type: 'TAP_NETWORK',
    latitude: 10.8280,
    longitude: 78.6960,
    district: 'Rockfort Heritage Commercial Ward',
    watershed_basin: 'Old City Gravity Distribution Grid',
    criticality_weight: 0.95,
    status: 'ONLINE',
    battery_level: 89,
    signal_rssi: -66,
    last_calibrated_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'TRICHY_THILLAI_05',
    name: 'Thillai Nagar Residential Distribution Grid',
    city: 'Trichy',
    type: 'TAP_NETWORK',
    latitude: 10.8240,
    longitude: 78.6820,
    district: 'Thillai Nagar West & Cross Roads',
    watershed_basin: 'Municipal High-Pressure Pipeline Sector',
    criticality_weight: 0.90,
    status: 'ONLINE',
    battery_level: 91,
    signal_rssi: -64,
    last_calibrated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'TRICHY_PONMALAI_06',
    name: 'Ponmalai (Golden Rock) Railway Colony Reservoir',
    city: 'Trichy',
    type: 'RESERVOIR',
    latitude: 10.7890,
    longitude: 78.7190,
    district: 'Golden Rock Workshop & Colony',
    watershed_basin: 'Ponmalai Elevated Service Reservoir',
    criticality_weight: 0.85,
    status: 'ONLINE',
    battery_level: 87,
    signal_rssi: -72,
    last_calibrated_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'TRICHY_KKNAGAR_07',
    name: 'K.K. Nagar Community Borewells & Overhead Tank',
    city: 'Trichy',
    type: 'BOREWELL',
    latitude: 10.7950,
    longitude: 78.6980,
    district: 'K.K. Nagar Ward 42',
    watershed_basin: 'Trichy South Deep Aquifer System',
    criticality_weight: 0.75,
    status: 'ONLINE',
    battery_level: 84,
    signal_rssi: -75,
    last_calibrated_at: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'TRICHY_NIT_08',
    name: 'NIT Trichy & Thuvakudi Catchment Station',
    city: 'Trichy',
    type: 'BOREWELL',
    latitude: 10.7580,
    longitude: 78.8140,
    district: 'Thuvakudi Industrial & Campus Aquifer',
    watershed_basin: 'Tanjore Highway Eastern Basin',
    criticality_weight: 0.70,
    status: 'ONLINE',
    battery_level: 88,
    signal_rssi: -78,
    last_calibrated_at: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString()
  },

  // ==========================================
  // Chennai, Tamil Nadu
  // ==========================================
  {
    id: 'CHENNAI_CHEMBAR_09',
    name: 'Chembarambakkam Lake Intake Station',
    city: 'Chennai',
    type: 'RESERVOIR',
    latitude: 13.0110,
    longitude: 80.0570,
    district: 'Kanchipuram - Chennai West',
    watershed_basin: 'Adyar Catchment Basin',
    criticality_weight: 1.0,
    status: 'ONLINE',
    battery_level: 93,
    signal_rssi: -60,
    last_calibrated_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'CHENNAI_KILPAUK_10',
    name: 'Kilpauk Water Works & Treatment Plant',
    city: 'Chennai',
    type: 'TREATMENT_PLANT',
    latitude: 13.0827,
    longitude: 80.2407,
    district: 'Kilpauk Central Works',
    watershed_basin: 'Chennai Metro Water Zone',
    criticality_weight: 1.0,
    status: 'ONLINE',
    battery_level: 100,
    signal_rssi: -48,
    last_calibrated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'CHENNAI_ADYAR_11',
    name: 'Adyar Coastal Tap Distribution Grid',
    city: 'Chennai',
    type: 'TAP_NETWORK',
    latitude: 13.0012,
    longitude: 80.2565,
    district: 'Adyar - Besant Nagar Zone',
    watershed_basin: 'South Chennai Coastal Sector',
    criticality_weight: 0.90,
    status: 'ONLINE',
    battery_level: 90,
    signal_rssi: -67,
    last_calibrated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },

  // ==========================================
  // Bengaluru, Karnataka
  // ==========================================
  {
    id: 'BLR_RIVERSIDE_12',
    name: 'Riverside Monitoring Station (Cauvery Intake)',
    city: 'Bengaluru',
    type: 'RIVER',
    latitude: 12.9716,
    longitude: 77.5946,
    district: 'Riverside River Basin',
    watershed_basin: 'Vrishabhavathi Catchment',
    criticality_weight: 1.0,
    status: 'ONLINE',
    battery_level: 94,
    signal_rssi: -62,
    last_calibrated_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'BLR_EAST_13',
    name: 'East Reservoir Station (Bellandur Catchment)',
    city: 'Bengaluru',
    type: 'RESERVOIR',
    latitude: 12.9783,
    longitude: 77.6408,
    district: 'East Lake Catchment',
    watershed_basin: 'Bellandur Highland Basin',
    criticality_weight: 0.95,
    status: 'ONLINE',
    battery_level: 91,
    signal_rssi: -70,
    last_calibrated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },

  // ==========================================
  // Madurai, Tamil Nadu
  // ==========================================
  {
    id: 'MADURAI_VAIGAI_14',
    name: 'Vaigai River Infiltration Intake Station',
    city: 'Madurai',
    type: 'RIVER',
    latitude: 9.9252,
    longitude: 78.1198,
    district: 'Vaigai North Bank',
    watershed_basin: 'Vaigai River Basin',
    criticality_weight: 1.0,
    status: 'ONLINE',
    battery_level: 92,
    signal_rssi: -65,
    last_calibrated_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'MADURAI_KOCHADAI_15',
    name: 'Kochadai Water Treatment & Pumping Plant',
    city: 'Madurai',
    type: 'TREATMENT_PLANT',
    latitude: 9.9380,
    longitude: 78.0820,
    district: 'Kochadai West Zone',
    watershed_basin: 'Madurai Corporation Head Works',
    criticality_weight: 1.0,
    status: 'ONLINE',
    battery_level: 100,
    signal_rssi: -52,
    last_calibrated_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  }
];

module.exports = {
  STATIONS
};
