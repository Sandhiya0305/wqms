import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useAuth } from '../../context/AuthContext';

export default function ReportsView() {
  const { stations, latestTelemetry } = useTelemetry();
  const { selectedCity, currentUser } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const cityStations = stations.filter(s => !selectedCity || s.city === selectedCity);

  const safeCount = cityStations.filter(s => {
    const wqi = latestTelemetry[s.id]?.wqi_score || 20;
    return wqi <= 50;
  }).length;

  const cautionCount = cityStations.filter(s => {
    const wqi = latestTelemetry[s.id]?.wqi_score || 20;
    return wqi > 50 && wqi <= 75;
  }).length;

  const criticalCount = cityStations.filter(s => {
    const wqi = latestTelemetry[s.id]?.wqi_score || 20;
    return wqi > 75;
  }).length;

  const handleExportCSV = () => {
    setDownloading(true);
    setTimeout(() => {
      const headers = ['Station_Name', 'City', 'District', 'Turbidity_NTU', 'pH', 'Chlorine_mgL', 'Cleanliness_Score', 'Status'];
      const rows = cityStations.map(s => {
        const tel = latestTelemetry[s.id] || {};
        const score = 100 - Math.min(100, tel.wqi_score || 20);
        const status = (tel.wqi_score || 20) <= 50 ? 'Safe' : (tel.wqi_score || 20) <= 75 ? 'Caution' : 'Boil Notice';
        return [
          `"${s.name}"`,
          `"${s.city || selectedCity}"`,
          `"${s.district}"`,
          tel.turbidity || 1.8,
          tel.ph || 7.2,
          tel.chlorine || 0.8,
          score,
          `"${status}"`
        ];
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Report_${selectedCity}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloading(false);
    }, 300);
  };

  return (
    <div className="space-y-4 font-sans">
      
      {/* Header - Boxy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Water Quality Audit Report
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Jurisdiction: {selectedCity} District
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={downloading}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 border border-blue-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Summary Row - Boxy */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white dark:bg-slate-900 p-3 border border-slate-300 dark:border-slate-800">
          <div className="text-slate-500 font-bold uppercase text-[10px]">Total Stations</div>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">{cityStations.length}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 border border-slate-300 dark:border-slate-800">
          <div className="text-emerald-600 font-bold uppercase text-[10px]">Safe Zones</div>
          <div className="text-lg font-bold font-mono text-emerald-600 mt-1">{safeCount}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 border border-slate-300 dark:border-slate-800">
          <div className="text-amber-600 font-bold uppercase text-[10px]">Caution Zones</div>
          <div className="text-lg font-bold font-mono text-amber-600 mt-1">{cautionCount}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 border border-slate-300 dark:border-slate-800">
          <div className="text-red-600 font-bold uppercase text-[10px]">Boil Notices</div>
          <div className="text-lg font-bold font-mono text-red-600 mt-1">{criticalCount}</div>
        </div>
      </div>

      {/* Audit Table - Boxy */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
              <tr>
                <th className="p-3">Station & Ward</th>
                <th className="p-3">Turbidity</th>
                <th className="p-3">pH</th>
                <th className="p-3">Chlorine</th>
                <th className="p-3">Score</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {cityStations.map((station) => {
                const tel = latestTelemetry[station.id] || { turbidity: 1.8, ph: 7.2, chlorine: 0.8, wqi_score: 22 };
                const score = 100 - Math.min(100, tel.wqi_score || 20);
                const isSafe = (tel.wqi_score || 20) <= 50;
                const isModerate = (tel.wqi_score || 20) > 50 && (tel.wqi_score || 20) <= 75;

                return (
                  <tr key={station.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-medium">
                      <div className="font-bold text-slate-900 dark:text-white">{station.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{station.district}</div>
                    </td>

                    <td className="p-3 font-mono">{tel.turbidity} NTU</td>
                    <td className="p-3 font-mono">{tel.ph}</td>
                    <td className="p-3 font-mono">{tel.chlorine} mg/L</td>
                    <td className="p-3 font-mono font-bold text-blue-600">{score}%</td>

                    <td className="p-3 text-right font-bold text-[11px]">
                      <span className={isSafe ? 'text-emerald-600' : isModerate ? 'text-amber-600' : 'text-red-600'}>
                        {isSafe ? 'Safe' : isModerate ? 'Filter Advised' : 'Boil Notice'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
