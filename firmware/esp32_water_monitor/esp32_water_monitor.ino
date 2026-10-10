/*
 * Water Quality Monitoring System - ESP32 IoT Edge Node Firmware
 * Continuous multi-parameter telemetry via MQTT and HTTP REST
 * Compatible with Arduino IDE & PlatformIO
 */

#include <WiFi.h>
#include <WiFiClient.h>
#include <PubSubClient.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "config.h"

// OneWire setup for DS18B20 Temperature
OneWire oneWire(PIN_DS18B20_ONEWIRE);
DallasTemperature tempSensors(&oneWire);

// WiFi and MQTT clients
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Timing variables
unsigned long lastTelemetryTime = 0;
unsigned long lastReconnectAttempt = 0;

// Sampling buffers for moving averages
const int NUM_SAMPLES = 10;

float readSmoothedAnalog(int pin) {
  long sum = 0;
  for (int i = 0; i < NUM_SAMPLES; i++) {
    sum += analogRead(pin);
    delay(10);
  }
  float avgRaw = (float)sum / NUM_SAMPLES;
  // Convert 12-bit ADC (0-4095) to Voltage (0-3.3V)
  return (avgRaw / 4095.0f) * 3.3f;
}

// Convert voltage to pH value
float calculatePH(float voltage) {
  // Standard pH sensor board output ~2.5V at pH 7.0
  float ph = 7.0f + ((2.5f - voltage) * PH_CALIBRATION_SLOPE);
  if (ph < 0.0f) ph = 0.0f;
  if (ph > 14.0f) ph = 14.0f;
  return ph;
}

// Convert voltage to Turbidity in NTU
float calculateTurbidity(float voltage) {
  // DFRobot typical curve: NTU = -1120.4*V^2 + 5742.3*V - 4352.9
  float ntu = 0.0f;
  if (voltage < 2.5f) {
    ntu = 3000.0f;
  } else if (voltage >= 4.1f) {
    ntu = 0.0f;
  } else {
    ntu = -1120.4f * voltage * voltage + 5742.3f * voltage - 4352.9f;
  }
  if (ntu < 0.0f) ntu = 0.0f;
  return ntu;
}

// Convert voltage and temperature to TDS (ppm)
float calculateTDS(float voltage, float tempC) {
  // Temperature compensation formula
  float compensationCoefficient = 1.0f + TDS_TEMP_COEFFICIENT * (tempC - 25.0f);
  float compensationVoltage = voltage / compensationCoefficient;
  // Convert voltage to TDS value
  float tds = (133.42f * pow(compensationVoltage, 3) - 255.86f * pow(compensationVoltage, 2) + 857.39f * compensationVoltage) * 0.5f;
  if (tds < 0.0f) tds = 0.0f;
  return tds;
}

// Estimate Dissolved Oxygen (mg/L) using DO probe voltage & temperature
float estimateDO(float voltage, float tempC) {
  // Typical galvanic DO sensor: output proportional to saturation
  // 0.0V - 3.0V mapping to 0.0 - 12.0 mg/L with temperature dependency
  float saturationDO = 14.652f - 0.41022f * tempC + 0.007991f * (tempC * tempC);
  float doMgL = (voltage / 2.5f) * saturationDO;
  if (doMgL < 0.0f) doMgL = 0.0f;
  if (doMgL > 15.0f) doMgL = 15.0f;
  return doMgL;
}

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected! IP: " + WiFi.localIP().toString());
    digitalWrite(PIN_STATUS_LED, HIGH);
  } else {
    Serial.println("\nWiFi connection failed! Will retry in main loop.");
    digitalWrite(PIN_STATUS_LED, LOW);
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived on [");
  Serial.print(topic);
  Serial.print("]: ");
  for (unsigned int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

bool connectMQTT() {
  if (mqttClient.connected()) return true;
  
  Serial.print("Connecting to MQTT Broker at ");
  Serial.print(SERVER_HOST);
  Serial.print(":");
  Serial.println(MQTT_PORT);

  String clientId = "ESP32_WaterSensor_" + String(DEVICE_STATION_ID) + "_" + String(random(0xffff), HEX);
  if (mqttClient.connect(clientId.c_str())) {
    Serial.println("MQTT connected!");
    mqttClient.subscribe(MQTT_TOPIC_COMMANDS);
    return true;
  } else {
    Serial.print("MQTT connect failed, rc=");
    Serial.println(mqttClient.state());
    return false;
  }
}

// Fallback HTTP POST if MQTT is unreachable
void sendTelemetryHTTP(String jsonPayload) {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  String url = "http://" + String(SERVER_HOST) + ":" + String(HTTP_PORT) + "/api/v1/telemetry";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", DEVICE_API_KEY);
  
  int httpResponseCode = http.POST(jsonPayload);
  if (httpResponseCode > 0) {
    Serial.print("HTTP Telemetry Sent! Response: ");
    Serial.println(httpResponseCode);
  } else {
    Serial.print("HTTP POST Error: ");
    Serial.println(http.errorToString(httpResponseCode));
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("=== Starting Water Quality IoT Monitor ===");
  
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_PH_ANALOG, INPUT);
  pinMode(PIN_TURBIDITY_ANALOG, INPUT);
  pinMode(PIN_TDS_ANALOG, INPUT);

  tempSensors.begin();
  
  connectWiFi();
  
  mqttClient.setServer(SERVER_HOST, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
}

void loop() {
  // Ensure WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    digitalWrite(PIN_STATUS_LED, LOW);
    if (millis() - lastReconnectAttempt > 10000) {
      lastReconnectAttempt = millis();
      connectWiFi();
    }
  } else {
    digitalWrite(PIN_STATUS_LED, HIGH);
    if (!mqttClient.connected()) {
      if (millis() - lastReconnectAttempt > 5000) {
        lastReconnectAttempt = millis();
        connectMQTT();
      }
    } else {
      mqttClient.loop();
    }
  }

  // Periodic Telemetry Dispatch
  if (millis() - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = millis();
    
    // Read Temperature
    tempSensors.requestTemperatures();
    float tempC = tempSensors.getTempCByIndex(0);
    if (tempC < -50.0f || tempC > 100.0f) {
      tempC = 25.0f; // Default fallback if sensor unplugged
    }

    // Read Voltages
    float phVoltage = readSmoothedAnalog(PIN_PH_ANALOG);
    float turbidityVoltage = readSmoothedAnalog(PIN_TURBIDITY_ANALOG);
    float tdsVoltage = readSmoothedAnalog(PIN_TDS_ANALOG);

    // Compute Physical Quantities
    float ph = calculatePH(phVoltage);
    float turbidityNTU = calculateTurbidity(turbidityVoltage);
    float tdsPPM = calculateTDS(tdsVoltage, tempC);
    float doMgL = estimateDO(phVoltage * 0.8f, tempC); // Simulated DO correlation or second analog channel
    float conductivityUS = tdsPPM * 1.56f; // Standard TDS to EC approx

    int rssi = WiFi.RSSI();
    int batteryPct = 95; // Simulated 95% battery or read via voltage divider

    // Build JSON Payload
    String payload = "{";
    payload += "\"station_id\":\"" + String(DEVICE_STATION_ID) + "\",";
    payload += "\"ph\":" + String(ph, 2) + ",";
    payload += "\"turbidity_ntu\":" + String(turbidityNTU, 2) + ",";
    payload += "\"do_mg_l\":" + String(doMgL, 2) + ",";
    payload += "\"tds_ppm\":" + String(tdsPPM, 1) + ",";
    payload += "\"temp_c\":" + String(tempC, 1) + ",";
    payload += "\"conductivity_us\":" + String(conductivityUS, 1) + ",";
    payload += "\"battery_pct\":" + String(batteryPct) + ",";
    payload += "\"signal_rssi\":" + String(rssi) + ",";
    payload += "\"timestamp\":\"" + String(millis()) + "\"";
    payload += "}";

    Serial.println("Telemetry Reading: " + payload);

    // Transmission: Try MQTT first, fallback to HTTP
    bool published = false;
    if (mqttClient.connected()) {
      published = mqttClient.publish(MQTT_TOPIC_TELEMETRY, payload.c_str());
    }
    
    if (!published) {
      Serial.println("MQTT publish unavailable, dispatching via HTTP fallback...");
      sendTelemetryHTTP(payload);
    }
  }
}
