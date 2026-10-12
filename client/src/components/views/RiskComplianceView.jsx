import React from 'react';
import OperationalRiskPanel from '../authority/OperationalRiskPanel';
import ComplianceExport from '../authority/ComplianceExport';

export default function RiskComplianceView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Risk & Compliance</h1>
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
