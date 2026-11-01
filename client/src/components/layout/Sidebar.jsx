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
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTelemetry } from '../../context/TelemetryContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export default function Sidebar({ activeView, setActiveView }) {
  const { currentUser, isEngineer, isFieldOps, isHealthOfficer } = useAuth();
  const { activeAlerts } = useTelemetry();

  const totalActiveAlerts = activeAlerts.filter(a => a.status !== 'RESOLVED').length;

  const engineerNavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Station map', icon: Map },
    { id: 'stations', label: 'Stations', icon: Layers },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: totalActiveAlerts },
    { id: 'thresholds', label: 'Thresholds', icon: SlidersHorizontal },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const fieldOpsNavItems = [
    { id: 'hardware', label: 'Fleet health', icon: Cpu },
    { id: 'calibration', label: 'Calibration', icon: Wrench },
    { id: 'map', label: 'Station map', icon: Map },
    { id: 'stations', label: 'Stations', icon: Layers },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: totalActiveAlerts },
  ];

  const healthOfficerNavItems = [
    { id: 'health_advisories', label: 'Advisories', icon: ShieldAlert },
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'citizen_tracker', label: 'Citizen reports', icon: ClipboardList },
    { id: 'map', label: 'Station map', icon: Map },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: totalActiveAlerts },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const citizenNavItems = [
    { id: 'citizen_home', label: 'Water status', icon: Home },
    { id: 'citizen_map', label: 'Safety map', icon: Map },
    { id: 'citizen_report', label: 'Report a problem', icon: MessageSquare },
    { id: 'citizen_tracker', label: 'My reports', icon: ClipboardList },
    { id: 'citizen_advisories', label: 'Advisories', icon: AlertTriangle },
  ];

  let items = citizenNavItems;
  if (isEngineer) items = engineerNavItems;
  else if (isFieldOps) items = fieldOpsNavItems;
  else if (isHealthOfficer) items = healthOfficerNavItems;

  return (
    <aside className="w-60 bg-[#111827] text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-700/70 z-30 select-none font-sans">
      
      {/* Top Branding - Boxy */}
      <div>
        <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-700/70">
          <div className="w-8 h-8 rounded-md bg-cyan-500 flex items-center justify-center shrink-0">
            <Droplet className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-white tracking-tight">
              AquaWatch
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">
              {currentUser?.roleLabel || 'Municipal System'}
            </div>
          </div>
        </div>

        {/* Navigation Menu - Boxy */}
        <nav className="p-3 space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <Button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                variant="ghost"
                className={`w-full justify-start rounded-md px-3 text-left h-10 ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/15 hover:text-cyan-300'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {item.badge != null && item.badge > 0 && (
                    <Badge variant="danger" className="ml-auto bg-red-600 text-white">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </Button>
            );
          })}
        </nav>
      </div>

      {/* User Info at Bottom - Boxy */}
      <div className="p-3 border-t border-slate-800">
        <div className="p-3 border border-slate-800 rounded-md flex items-center bg-slate-900">
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
