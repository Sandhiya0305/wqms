# ESP32 IoT Water Quality Sensor Node - Hardware Wiring Guide

This guide details how to wire analog and digital water quality sensors to an **ESP32 NodeMCU / ESP-WROOM-32** board.

## Pinout & Connection Table

| Sensor | Sensor Pin | ESP32 Pin | Logic / Voltage | Function |
| :--- | :--- | :--- | :--- | :--- |
| **Analog pH Sensor Board** | VCC | 5V (VIN) / 3.3V | 5.0V / 3.3V | Power Supply |
| | GND | GND | 0V | Ground Reference |
| | AOUT / Po | **GPIO34** | 0 - 3.3V (ADC1_CH6) | Analog pH Voltage Signal |
| **DFRobot Turbidity Sensor**| VCC | 5V (VIN) | 5.0V | Power Supply |
| | GND | GND | 0V | Ground Reference |
| | AOUT | **GPIO35** | 0 - 3.3V (ADC1_CH7) | Analog Turbidity Voltage Signal |
| **Analog TDS Sensor Meter** | VCC | 3.3V or 5V | 3.3V | Power Supply |
| | GND | GND | 0V | Ground Reference |
| | AOUT | **GPIO32** | 0 - 2.3V (ADC1_CH4) | Total Dissolved Solids Signal |
| **DS18B20 Temp Probe** | VDD (Red) | 3.3V | 3.3V | Power Supply |
| | GND (Black) | GND | 0V | Ground Reference |
| | DATA (Yellow) | **GPIO4** | Digital OneWire | 4.7kΩ pull-up to 3.3V required |
| **Status LED** | Anode (+) | **GPIO2** | 3.3V Digital Out | High = Connected, Blink = Sync |

> [!IMPORTANT]
> **ADC Pin Selection Warning on ESP32:**
> Always connect analog sensors to **ADC1** pins (GPIO 32, 33, 34, 35, 36, 39).
> Do **NOT** use ADC2 pins (GPIO 0, 2, 4, 12, 13, 14, 15, 25, 26, 27) for analog sensors when WiFi is active, because the ESP32 WiFi driver locks ADC2 for radio operations.

---

## Power Considerations
- If powering all 4 sensors concurrently in the field, power the ESP32 via a regulated 5V 2A micro-USB or external 5V step-down buck converter (e.g., LM2596 from a 12V solar panel battery setup).
- Use a common ground between the sensor interface boards and the ESP32 ground pins.
