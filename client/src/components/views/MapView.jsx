import React from 'react';
import StationMap from '../authority/StationMap';
import { useTelemetry } from '../../context/TelemetryContext';

export default function MapView({ setActiveView }) {
  const { stations, latestTelemetry } = useTelemetry();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Geospatial Water Quality Network</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Real-time GPS sensor node placement across municipal water bodies</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <StationMap />
      </div>
    </div>
  );
}
