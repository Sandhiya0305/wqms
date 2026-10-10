#ifndef CONFIG_H
#define CONFIG_H

// ==========================================
// WiFi Network Configuration
// ==========================================
#define WIFI_SSID       "Your_WiFi_SSID"
#define WIFI_PASSWORD   "Your_WiFi_Password"

// ==========================================
// Backend & MQTT Server Configuration
// ==========================================
// Replace with the IP address of the machine running the Water Quality platform
#define SERVER_HOST     "192.168.1.100" 
#define HTTP_PORT       3001
#define MQTT_PORT       1883

#define DEVICE_STATION_ID "STATION_RIVER_01"
#define DEVICE_API_KEY    "wq_device_token_demo_2026"
#define TELEMETRY_INTERVAL_MS 10000 // 10 seconds between transmissions

// MQTT Topics
#define MQTT_TOPIC_TELEMETRY "water/sensors/" DEVICE_STATION_ID "/telemetry"
#define MQTT_TOPIC_COMMANDS  "water/sensors/" DEVICE_STATION_ID "/command"

// ==========================================
// Pin Allocations on ESP32 NodeMCU / WROOM
// ==========================================
#define PIN_PH_ANALOG        34  // ADC1_CH6 (Analog pH Probe Sensor)
#define PIN_TURBIDITY_ANALOG 35  // ADC1_CH7 (DFRobot Turbidity Sensor)
#define PIN_TDS_ANALOG       32  // ADC1_CH4 (Analog TDS Sensor)
#define PIN_DS18B20_ONEWIRE  4   // GPIO4 (Dallas DS18B20 Temp Probe)
#define PIN_STATUS_LED       2   // GPIO2 (Onboard Blue LED)

// ==========================================
// Calibration Offsets & Multipliers
// ==========================================
// 2-point pH calibration: pH = slope * voltage + intercept
#define PH_CALIBRATION_SLOPE     3.50f
#define PH_CALIBRATION_INTERCEPT 0.00f

// Turbidity calibration curve (DFRobot NTU approximation from ADC volts)
#define TURBIDITY_VOLTAGE_CLEAR  4.10f

// TDS calibration temperature coefficient
#define TDS_TEMP_COEFFICIENT     0.02f // 2% per degree C

#endif // CONFIG_H
