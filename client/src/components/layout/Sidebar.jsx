import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Layers, 
  Bell, 
  ShieldAlert, 
  FileText, 
  Cpu, 
  Droplet, 
  Home, 
  MessageSquare, 
  AlertTriangle, 
  SlidersHorizontal, 
  Wrench, 
  ClipboardList, 
  Flame 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTelemetry } from '../../context/TelemetryContext';

export default function Sidebar({ activeView, setActiveView }) {
  const { currentUser, isCitizen, isEngineer, isFieldOps, isHealthOfficer } = useAuth();
  const { activeAlerts } = useTelemetry();

  const totalActiveAlerts = activeAlerts.filter(a => a.status !== 'RESOLVED').length;

  const engineerNavItems = [
    { id: 'overview', label: 'Command Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Live Water Map', icon: Map },
    { id: 'stations', label: 'Sensor Stations', icon: Layers },
    { id: 'alerts', label: 'Alerts & Incidents', icon: Bell, badge: totalActiveAlerts },
    { id: 'thresholds', label: 'Thresholds & Valves', icon: SlidersHorizontal, exclusive: true },
    { id: 'simulation', label: 'Emergency Simulator', icon: Flame, exclusive: true },
    { id: 'reports', label: 'Quality Reports', icon: FileText },
  ];

  const fieldOpsNavItems = [
    { id: 'hardware', label: 'IoT Fleet Health', icon: Cpu },
    { id: 'calibration', label: 'Probe Calibration', icon: Wrench, exclusive: true },
    { id: 'map', label: 'Sensor Station Map', icon: Map },
    { id: 'stations', label: 'Live Probe Readings', icon: Layers },
    { id: 'alerts', label: 'Equipment Alerts', icon: Bell, badge: totalActiveAlerts },
  ];

  const healthOfficerNavItems = [
    { id: 'health_advisories', label: 'Health Advisories', icon: ShieldAlert, exclusive: true },
    { id: 'overview', label: 'City Health Overview', icon: LayoutDashboard },
    { id: 'citizen_tracker', label: 'Incident Grievances', icon: ClipboardList, exclusive: true },
    { id: 'map', label: 'Water Risk GIS Map', icon: Map },
    { id: 'alerts', label: 'Contamination Alerts', icon: Bell, badge: totalActiveAlerts },
    { id: 'reports', label: 'WHO Audit Reports', icon: FileText },
  ];

  const citizenNavItems = [
    { id: 'citizen_home', label: 'Ward Water Checker', icon: Home },
    { id: 'citizen_map', label: 'Water Safety Map', icon: Map },
    { id: 'citizen_report', label: 'Report an Issue', icon: MessageSquare },
    { id: 'citizen_tracker', label: 'Track My Complaints', icon: ClipboardList },
    { id: 'citizen_advisories', label: 'Health Advisories', icon: AlertTriangle },
  ];

  let items = citizenNavItems;
  if (isEngineer) items = engineerNavItems;
  else if (isFieldOps) items = fieldOpsNavItems;
  else if (isHealthOfficer) items = healthOfficerNavItems;

  return (
    <aside className="w-60 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800 z-30 select-none font-sans">
      
      {/* Top Branding - Boxy */}
      <div>
        <div className="p-4 flex items-center gap-2.5 border-b border-slate-800 bg-slate-950">
          <div className="w-8 h-8 bg-blue-600 flex items-center justify-center shrink-0">
            <Droplet className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-white tracking-wider uppercase">
              WaterGuard
            </div>
            <div className="text-[10px] text-blue-400 font-mono truncate">
              {currentUser?.roleLabel || 'Municipal System'}
            </div>
          </div>
        </div>

        {/* Navigation Menu - Boxy */}
        <nav className="p-2 space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition cursor-pointer text-left border-l-2 ${
                  isActive
                    ? 'bg-blue-600 text-white border-white font-bold'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {item.exclusive && (
                    <span className="text-[9px] font-mono px-1 py-0.2 bg-blue-900 text-blue-200 border border-blue-700">
                      {/* role label removed */}
                    </span>
                  )}
                  {item.badge != null && item.badge > 0 && (
                    <span className="px-1 py-0.2 text-[10px] font-mono font-bold bg-red-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info at Bottom - Boxy */}
      <div className="p-2 border-t border-slate-800 bg-slate-950">
        <div className="p-2 border border-slate-800 flex items-center bg-slate-900">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {currentUser?.avatar || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{currentUser?.name}</div>
              <div className="text-[10px] text-slate-400 truncate font-mono">{currentUser?.title}</div>
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
}
