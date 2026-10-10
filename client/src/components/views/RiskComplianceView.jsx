import React from 'react';
import OperationalRiskPanel from '../authority/OperationalRiskPanel';
import ComplianceExport from '../authority/ComplianceExport';

export default function RiskComplianceView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Risk & Regulatory Compliance</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Automated triage protocols based on WHO 4th Edition & BIS IS 10500:2012</p>
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
