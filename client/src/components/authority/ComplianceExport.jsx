import React, { useState } from 'react';
import { Download, FileText, Check } from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

export default function ComplianceExport() {
  const { selectedStationId, stationHistories, stations, latestTelemetry } = useTelemetry();
  const [downloading, setDownloading] = useState(false);

  const activeStation = stations.find(s => s.id === selectedStationId);
  const history = stationHistories[selectedStationId] || [];

  const handleExportCSV = () => {
    setDownloading(true);
    setTimeout(() => {
      const headers = ['Station_ID', 'Station_Name', 'Timestamp', 'pH', 'Turbidity_NTU', 'DO_mg_L', 'TDS_ppm', 'Temp_C', 'WQI_Score', 'WQI_Status', 'Battery_Pct'];
      const rows = history.map(item => [
        item.station_id,
        `"${activeStation?.name || item.station_id}"`,
        item.timestamp,
        item.ph,
        item.turbidity_ntu,
        item.do_mg_l,
        item.tds_ppm,
        item.temp_c,
        item.wqi_score,
        item.wqi_status,
        item.battery_pct
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `WaterQuality_Audit_${selectedStationId}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloading(false);
    }, 400);
  };

  const handlePrintAuditReport = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          Regulatory Compliance & Audit Export
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Generate formal audit documentation complying with WHO, EPA & BIS municipal reporting guidelines.
        </p>

        <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
          <div className="flex justify-between text-slate-300">
            <span>Selected Station:</span>
            <span className="font-semibold text-white">{activeStation?.name}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Jurisdiction / District:</span>
            <span className="font-semibold text-sky-400">{activeStation?.district}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Historical Records:</span>
            <span className="font-mono text-slate-200">{history.length} time-series samples</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2.5">
        <button
          onClick={handleExportCSV}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold transition"
        >
          {downloading ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
          Export Raw CSV
        </button>

        <button
          onClick={handlePrintAuditReport}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
        >
          <FileText className="w-3.5 h-3.5" />
          Print / PDF Audit
        </button>
      </div>
    </div>
  );
}
