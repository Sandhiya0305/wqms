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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-5 flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Regulatory Compliance Export
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Generate formal audit documentation complying with WHO and BIS IS 10500 standards.
        </p>

        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-none border border-slate-200 dark:border-slate-700 text-xs space-y-2">
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>Selected Station:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{activeStation?.name}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>Jurisdiction:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">{activeStation?.district}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>Sample Records:</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{history.length} data points</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <button
          onClick={handleExportCSV}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-none border border-slate-300 dark:border-slate-700 text-xs font-bold transition cursor-pointer"
        >
          {downloading ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5 text-blue-600" />}
          <span>Export CSV</span>
        </button>

        <button
          onClick={handlePrintAuditReport}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-none text-xs font-bold transition cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Print Audit</span>
        </button>
      </div>
    </div>
  );
}
