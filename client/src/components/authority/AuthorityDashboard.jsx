import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import MetricCard from '../common/MetricCard';
import StatusBadge from '../common/StatusBadge';
import StationMap from './StationMap';
import TelemetryCharts from './TelemetryCharts';
import OperationalRiskPanel from './OperationalRiskPanel';
import AlertManager from './AlertManager';
import SensorFleetHealth from './SensorFleetHealth';
import ComplianceExport from './ComplianceExport';
import { Droplet, AlertCircle, ShieldCheck, Zap, Thermometer, Activity, Layers } from 'lucide-react';

export default function AuthorityDashboard() {
  const { stations, selectedStationId, setSelectedStationId, latestTelemetry, activeAlerts, riskScores } = useTelemetry();

  const currentStation = stations.find(s => s.id === selectedStationId);
  const currentTel = latestTelemetry[selectedStationId];
  const currentRisk = riskScores.find(r => r.station_id === selectedStationId);

  return (
    <div className="space-y-6">
      {/* Station Selector Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Municipal Command Center</h2>
            <StatusBadge status={currentTel?.wqi_status || 'ONLINE'} score={currentTel?.wqi_score} />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoring Station: <strong className="text-sky-400">{currentStation?.name}</strong> • {currentStation?.district}
          </p>
        </div>

        {/* Station Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          {stations.map(st => {
            const isSel = st.id === selectedStationId;
            const tel = latestTelemetry[st.id];
            const wqi = tel?.wqi_score;

            return (
              <button
                key={st.id}
                onClick={() => setSelectedStationId(st.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  isSel
                    ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{st.name.split(' ')[0]} {st.name.split(' ')[1]}</span>
                {wqi != null && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    wqi > 75 ? 'bg-red-500/20 text-red-300' : wqi > 50 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {wqi}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time KPI Metric Cards for Selected Station */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Water Quality Index"
          value={currentTel?.wqi_score ?? '--'}
          unit="WQI"
          standardLimit="< 50"
          status={currentTel?.wqi_score > 75 ? 'CRITICAL' : currentTel?.wqi_score > 50 ? 'WARNING' : 'SAFE'}
          icon={Activity}
          description={currentTel?.wqi_status || 'Good'}
        />

        <MetricCard
          title="pH Level"
          value={currentTel?.ph ?? '--'}
          unit="pH"
          standardLimit="6.5 - 8.5"
          status={(currentTel?.ph < 6.5 || currentTel?.ph > 8.5) ? 'WARNING' : 'SAFE'}
          icon={Droplet}
          description="Alkalinity / Acidity"
        />

        <MetricCard
          title="Turbidity"
          value={currentTel?.turbidity_ntu ?? '--'}
          unit="NTU"
          standardLimit="< 5.0"
          status={currentTel?.turbidity_ntu > 5.0 ? 'WARNING' : 'SAFE'}
          icon={AlertCircle}
          description="Water Clarity"
        />

        <MetricCard
          title="Dissolved Oxygen"
          value={currentTel?.do_mg_l ?? '--'}
          unit="mg/L"
          standardLimit="> 5.0"
          status={currentTel?.do_mg_l < 5.0 ? 'WARNING' : 'SAFE'}
          icon={ShieldCheck}
          description="Aeration & Biology"
        />

        <MetricCard
          title="Total Dissolved Solids"
          value={currentTel?.tds_ppm ?? '--'}
          unit="ppm"
          standardLimit="< 500"
          status={currentTel?.tds_ppm > 500 ? 'WARNING' : 'SAFE'}
          icon={Zap}
          description="Mineral Concentration"
        />

        <MetricCard
          title="Temperature"
          value={currentTel?.temp_c ?? '--'}
          unit="°C"
          standardLimit="< 30"
          status={currentTel?.temp_c > 30 ? 'WARNING' : 'SAFE'}
          icon={Thermometer}
          description="Ambient Water Temp"
        />
      </div>

      {/* Middle Row: GIS Map (left) + Telemetry Charts (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <StationMap />
        </div>

        <div className="lg:col-span-7">
          <TelemetryCharts />
        </div>
      </div>

      {/* Lower Row: Operational Risk & Recommendations + Alert Escalations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <OperationalRiskPanel />
        </div>

        <div className="lg:col-span-7">
          <AlertManager />
        </div>
      </div>

      {/* Bottom Row: Hardware Fleet Diagnostics + Compliance Exporter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <SensorFleetHealth />
        </div>

        <div className="lg:col-span-4">
          <ComplianceExport />
        </div>
      </div>
    </div>
  );
}
