#include <OneWire.h>
#include <DallasTemperature.h>

const int OneWireBus = 4;

OneWire oneWire(OneWireBus);
DallasTemperature sensors(&oneWire);

float generateTds(float temperatureC) {
  const float baseTds = 135.0f;
  const float slowVariation = 8.0f * sin(millis() / 45000.0f);
  const float fastVariation = 2.0f * sin(millis() / 17000.0f);
  const float temperatureEffect = 0.8f * (temperatureC - 25.0f);

  return baseTds + slowVariation + fastVariation + temperatureEffect;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  sensors.begin();

  Serial.println("AquaIntel: DS18B20 + simulated TDS test");
  Serial.println("TDS is generated in software; no TDS sensor is read.");
}

void loop() {
  sensors.requestTemperatures();
  const float temperatureC = sensors.getTempCByIndex(0);
  const bool tempSensorError = temperatureC == DEVICE_DISCONNECTED_C
    || temperatureC == 85.0f;
  const float safeTemperatureC = tempSensorError ? 25.0f : temperatureC;
  const float simulatedTds = generateTds(safeTemperatureC);

  if (tempSensorError) {
    Serial.print("[ERROR] DS18B20 disconnected/failed | ");
    Serial.print("Using 25.0 C for simulated TDS | ");
  } else {
    Serial.print("Temp: ");
    Serial.print(temperatureC, 1);
    Serial.print(" C | ");
  }

  Serial.print("Simulated TDS: ");
  Serial.print(simulatedTds, 0);
  Serial.println(" ppm");

  delay(1000);
}
