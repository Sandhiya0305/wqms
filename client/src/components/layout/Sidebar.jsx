import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Layers, 
  Bell, 
  Activity, 
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
  LogOut,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTelemetry } from '../../context/TelemetryContext';

export default function Sidebar({ activeView, setActiveView }) {
  const { currentUser, isCitizen, isEngineer, isFieldOps, isHealthOfficer, logout } = useAuth();
  const { activeAlerts } = useTelemetry();

  const totalActiveAlerts = activeAlerts.filter(a => a.status !== 'RESOLVED').length;

  // Role-specific navigation items
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
    <aside className="w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800/80 z-30 select-none">
      
      {/* Top Branding */}
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
            <Droplet className="w-6 h-6 text-white fill-white" />
          </div>
          <div className="overflow-hidden">
            <div className="text-lg font-black text-white tracking-tight leading-tight">
              WaterGuard
            </div>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider truncate">
              {currentUser?.roleLabel || 'Public Water System'}
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.exclusive && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      Role
                    </span>
                  )}
                  {item.badge != null && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Role Card & Logout at Bottom */}
      <div className="p-3 border-t border-slate-800/60 bg-slate-900/60">
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-8 h-8 rounded-full ${currentUser?.avatarBg || 'bg-blue-600'} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
              {currentUser?.avatar || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{currentUser?.name}</div>
              <div className="text-[10px] text-slate-400 truncate font-medium">{currentUser?.title}</div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log out and return to login"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </aside>
  );
}
