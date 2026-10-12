import React, { useState } from 'react';
import { 
  Cpu, 
  Download, 
  FileText, 
  CheckCircle2, 
  Wifi, 
  Code2, 
  Wrench,
  Radio
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useAuth } from '../../context/AuthContext';

export default function HardwareSetupView({ setActiveView }) {
  const { stations } = useTelemetry();
  const { selectedCity, isFieldOps } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('Devices');

  const cityStations = stations.filter(s => !selectedCity || s.city === selectedCity);

  const devices = cityStations.map((s, idx) => ({
    id: `NODE_ESP32_${s.id.replace('TRICHY_', '').replace('BLR_', '').replace('CHN_', '').toUpperCase()}`,
    station: s.name,
    district: s.district,
    type: s.type === 'TAP_NETWORK' ? 'Tap Grid Multi-Probe' : s.type === 'TREATMENT_PLANT' ? 'WTP Dual Line Optical' : 'River Basin Floating Probe',
    status: 'Online',
    battery: idx % 2 === 0 ? '94%' : '98%',
    signal: '-68 dBm (4G LTE)',
    lastSeen: 'Live (3s ago)'
  }));

  const handleDownloadFirmware = () => {
    window.open('/firmware/esp32_water_monitor/esp32_water_monitor.ino', '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Boxy Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200 dark:border-blue-800">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Hardware Fleet • {selectedCity}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            IoT Edge Hardware & Firmware Setup
          </h1>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-6 text-xs font-bold">
        {['Devices', 'Firmware', 'Wiring Guide'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-3 transition relative cursor-pointer ${
              activeSubTab === tab 
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Grid: Connected Devices Table (left) + Quick Links (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Connected Devices Table */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Active Edge Sensor Nodes ({selectedCity})
                </h3>
                <span className="text-[11px] text-slate-400">Transmitting telemetry over MQTT (1883) & HTTP REST</span>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-none bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                {devices.length}/{devices.length} Live
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Device Node ID</th>
                    <th className="py-3 px-4">Monitored Zone</th>
                    <th className="py-3 px-4">Telemetry Bus</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Heartbeat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {devices.map((dev) => (
                    <tr key={dev.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{dev.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        <div>{dev.station}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{dev.district}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">{dev.type}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse"></span>
                          {dev.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-right">{dev.lastSeen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
            <span>MQTT Broker: <code>localhost:1883</code></span>
            <span>REST Telemetry: <code>POST /api/v1/telemetry</code></span>
          </div>
        </div>

        {/* Right Column: Quick Links */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 rounded-none border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              Field Tools & Downloads
            </h3>

            <div className="space-y-3">
              
              {/* Probe Calibration Tool */}
              <div 
                onClick={() => setActiveView('calibration')}
                className="p-3 rounded-none border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 hover:border-blue-400 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-none bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Probe Calibration Tool</div>
                    <div className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">ADC mV & Slope Calculator</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Launch</span>
              </div>

              {/* ESP32 Firmware */}
              <div 
                onClick={handleDownloadFirmware}
                className="p-3 rounded-none border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-blue-400 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-none bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-slate-200 dark:border-slate-600 shrink-0">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">ESP32 Firmware</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">C++ Sketch & Config Header</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Download</span>
              </div>

              {/* Wiring Schematics */}
              <div 
                onClick={() => setActiveSubTab('Wiring Guide')}
                className="p-3 rounded-none border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-blue-400 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-none bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-600 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Wiring Pinout Guide</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">ADC Pins & Resistor Values</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">View</span>
              </div>

            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
            Compatible with ESP32-WROOM, ESP8266 & Arduino LoRa Shield
          </div>
        </div>

      </div>

      {/* Embedded Documentation for Wiring */}
      {activeSubTab === 'Wiring Guide' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-200 dark:border-slate-800">
            ESP32 Microcontroller GPIO Pinout for Multi-Sensor Nodes
          </h3>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="p-3">Sensor Type</th>
                  <th className="p-3">Sensor Board Pin</th>
                  <th className="p-3">ESP32 Pin</th>
                  <th className="p-3">Voltage Logic</th>
                  <th className="p-3">Calibration Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="p-3 font-sans font-bold">Analog pH Sensor</td>
                  <td className="p-3">Po (Analog Out)</td>
                  <td className="p-3 text-blue-600 dark:text-blue-400 font-bold">GPIO 34</td>
                  <td className="p-3">0 - 3.3V ADC1</td>
                  <td className="p-3 font-sans">Buffer 4.01 & 7.00</td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-bold">Turbidity Sensor</td>
                  <td className="p-3">AOUT</td>
                  <td className="p-3 text-blue-600 dark:text-blue-400 font-bold">GPIO 35</td>
                  <td className="p-3">0 - 3.3V ADC1</td>
                  <td className="p-3 font-sans">Clean Water ~4.1V</td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-bold">Analog TDS Meter</td>
                  <td className="p-3">AOUT</td>
                  <td className="p-3 text-blue-600 dark:text-blue-400 font-bold">GPIO 32</td>
                  <td className="p-3">0 - 2.3V ADC1</td>
                  <td className="p-3 font-sans">1413 µS/cm Solution</td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-bold">DS18B20 Temp Probe</td>
                  <td className="p-3">DATA</td>
                  <td className="p-3 text-blue-600 dark:text-blue-400 font-bold">GPIO 4</td>
                  <td className="p-3">OneWire Digital</td>
                  <td className="p-3 font-sans">4.7kΩ pullup to 3.3V</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
