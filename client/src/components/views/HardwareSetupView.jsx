import React, { useState } from 'react';
import { 
  Cpu, 
  Download, 
  FileText, 
  BookOpen, 
  Sliders, 
  CheckCircle2, 
  Wifi, 
  ExternalLink,
  Code2
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

export default function HardwareSetupView({ setActiveView }) {
  const [activeSubTab, setActiveSubTab] = useState('Devices');

  const devices = [
    { id: 'ESP32-001', station: 'Riverside', type: 'Multi-parameter', status: 'Online', lastSeen: '10:42 AM' },
    { id: 'ESP32-002', station: 'North Plant', type: 'pH + Turbidity', status: 'Online', lastSeen: '10:41 AM' },
    { id: 'ESP32-003', station: 'East Reservoir', type: 'TDS + Temperature', status: 'Online', lastSeen: '10:41 AM' },
    { id: 'ESP32-004', station: 'West Tap', type: 'Multi-parameter', status: 'Online', lastSeen: '10:40 AM' },
    { id: 'ESP32-005', station: 'Central WTP', type: 'pH + Chlorine', status: 'Online', lastSeen: '10:39 AM' },
    { id: 'ESP32-006', station: 'South Borewell', type: 'Nitrate + TDS', status: 'Online', lastSeen: '10:38 AM' }
  ];

  const handleDownloadFirmware = () => {
    window.open('/firmware/esp32_water_monitor/esp32_water_monitor.ino', '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">IoT Device & Hardware Setup</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Manage sensor devices, firmware and connectivity</p>
      </div>

      {/* Sub-tabs matching Image 6 */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-semibold">
        {['Devices', 'Firmware', 'Wiring Guide', 'Simulator'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-3 transition relative ${
              activeSubTab === tab 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Grid: Connected Devices Table (left) + Quick Links (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Connected Devices Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Connected Devices</h3>
                <span className="text-xs text-slate-400">Edge hardware nodes transmitting over MQTT (1883) & HTTP REST</span>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                6/6 Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Device ID</th>
                    <th className="py-3 px-4">Station</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Last Seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {devices.map((dev) => (
                    <tr key={dev.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{dev.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{dev.station}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{dev.type}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {dev.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-right">{dev.lastSeen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Aedes MQTT Broker: <code>localhost:1883</code></span>
            <span>REST Gateway: <code>POST /api/v1/telemetry</code></span>
          </div>
        </div>

        {/* Right Column: Quick Links matching Image 6 (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Links</h3>

            <div className="space-y-3">
              
              {/* ESP32 Firmware */}
              <div 
                onClick={handleDownloadFirmware}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">ESP32 Firmware</div>
                    <div className="text-[11px] text-slate-500">C++ Sketch & Config Header</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600">Download</span>
              </div>

              {/* Wiring Schematics */}
              <div 
                onClick={() => setActiveSubTab('Wiring Guide')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Wiring Schematics</div>
                    <div className="text-[11px] text-slate-500">Pinouts & Resistor Values</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600">View Doc</span>
              </div>

              {/* Hardware Compatibility */}
              <div 
                onClick={() => setActiveSubTab('Firmware')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Hardware Compatibility</div>
                    <div className="text-[11px] text-slate-500">Sensor Calibration Specs</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600">Wiki Guide</span>
              </div>

              {/* Virtual Sensor Simulator */}
              <div 
                onClick={() => setActiveView('simulation')}
                className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Virtual Sensor Simulator</div>
                    <div className="text-[11px] text-blue-600 font-medium">Test Edge Packet Ingestion</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600">Launch</span>
              </div>

            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Supports ESP32, ESP8266, Arduino UNO WiFi & STM32
          </div>
        </div>

      </div>

      {/* Embedded Documentation for Wiring & Calibration if tab selected */}
      {activeSubTab === 'Wiring Guide' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in">
          <h3 className="text-sm font-bold text-slate-900 mb-2">ESP32 Pinout & Connection Mapping</h3>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr><th className="p-3">Sensor</th><th className="p-3">Sensor Board Pin</th><th className="p-3">ESP32 Pin</th><th className="p-3">Voltage Logic</th><th className="p-3">Notes</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                <tr><td className="p-3 font-sans font-bold">Analog pH Sensor</td><td className="p-3">Po (Analog Out)</td><td className="p-3 text-blue-600 font-bold">GPIO 34</td><td className="p-3">0 - 3.3V ADC1</td><td className="p-3 font-sans">Neutral ~2.5V</td></tr>
                <tr><td className="p-3 font-sans font-bold">Turbidity Sensor</td><td className="p-3">AOUT</td><td className="p-3 text-blue-600 font-bold">GPIO 35</td><td className="p-3">0 - 3.3V ADC1</td><td className="p-3 font-sans">Clear water ~4.1V</td></tr>
                <tr><td className="p-3 font-sans font-bold">Analog TDS Meter</td><td className="p-3">AOUT</td><td className="p-3 text-blue-600 font-bold">GPIO 32</td><td className="p-3">0 - 2.3V ADC1</td><td className="p-3 font-sans">Temp compensated</td></tr>
                <tr><td className="p-3 font-sans font-bold">DS18B20 Temp</td><td className="p-3">DATA</td><td className="p-3 text-blue-600 font-bold">GPIO 4</td><td className="p-3">OneWire Digital</td><td className="p-3 font-sans">4.7kΩ pull-up to 3.3V</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
