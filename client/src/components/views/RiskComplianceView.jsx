import React from 'react';
import OperationalRiskPanel from '../authority/OperationalRiskPanel';
import ComplianceExport from '../authority/ComplianceExport';

export default function RiskComplianceView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Risk & Compliance</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Automated triage protocols based on WHO & BIS IS 10500 standards</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <OperationalRiskPanel />
        </div>
        <div className="lg:col-span-6">
          <ComplianceExport />
        </div>
      </div>
    </div>
  );
}
