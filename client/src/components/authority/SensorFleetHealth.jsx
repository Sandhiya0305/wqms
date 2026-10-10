import React from 'react';
import { Battery, Wifi, Wrench, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

export default function SensorFleetHealth() {
  const { stations, latestTelemetry, selectedStationId, setSelectedStationId } = useTelemetry();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            IoT Sensor Fleet & Telemetry Diagnostics
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Hardware battery levels, radio signal strength, and probe calibration</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {stations.map(station => {
          const tel = latestTelemetry[station.id];
          const isSelected = station.id === selectedStationId;
          const battery = tel?.battery_pct ?? station.battery_level ?? 90;
          const rssi = tel?.signal_rssi ?? station.signal_rssi ?? -65;

          // Battery color
          let batColor = 'text-emerald-400';
          if (battery < 25) batColor = 'text-rose-400';
          else if (battery < 50) batColor = 'text-amber-400';

          // RSSI quality
          let signalLabel = 'Excellent';
          let signalColor = 'text-emerald-400';
          if (rssi < -80) { signalLabel = 'Weak'; signalColor = 'text-rose-400'; }
          else if (rssi < -70) { signalLabel = 'Fair'; signalColor = 'text-amber-400'; }

          return (
            <div
              key={station.id}
              onClick={() => setSelectedStationId(station.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-sky-950/30 border-sky-500 shadow-md shadow-sky-900/20'
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white truncate max-w-[120px]">
                  {station.name.split(' ')[0]} {station.name.split(' ')[1]}
                </span>
                <span className={`w-2 h-2 rounded-full ${station.status === 'CRITICAL' ? 'bg-rose-500 animate-ping' : station.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              </div>

              <div className="text-[11px] text-slate-400 truncate mb-3">
                {station.district}
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                {/* Battery */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Battery className={`w-3.5 h-3.5 ${batColor}`} />
                    Power
                  </span>
                  <span className={batColor}>{battery}%</span>
                </div>

                {/* RSSI */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Wifi className={`w-3.5 h-3.5 ${signalColor}`} />
                    Signal
                  </span>
                  <span className={signalColor}>{rssi} dBm</span>
                </div>

                {/* Calibration */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-slate-400" /> Calib
                  </span>
                  <span>OK (Nominal)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
