import React from 'react';
import ComplianceExport from '../authority/ComplianceExport';

export default function ReportsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Compliance & Audit Reports</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Export certified documentation for public health regulators</p>
      </div>

      <div className="max-w-2xl">
        <ComplianceExport />
      </div>
    </div>
  );
}
