import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Layers, 
  Bell, 
  Activity, 
  ShieldCheck, 
  FileText, 
  Settings, 
  Cpu, 
  Droplet,
  Home,
  MessageSquare,
  AlertTriangle,
  Info,
  SlidersHorizontal,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTelemetry } from '../../context/TelemetryContext';

export default function Sidebar({ activeView, setActiveView }) {
  const { currentUser, isCitizen, isAuthority, setIsAuthModalOpen } = useAuth();
  const { activeAlerts } = useTelemetry();

  const totalActiveAlerts = activeAlerts.filter(a => a.status !== 'RESOLVED').length;

  const authorityNavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'stations', label: 'Stations', icon: Layers },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: totalActiveAlerts },
    { id: 'telemetry', label: 'Telemetry', icon: Activity },
    { id: 'risk', label: 'Risk & Compliance', icon: ShieldCheck },
    { id: 'hardware', label: 'Hardware Setup', icon: Cpu },
    { id: 'simulation', label: 'Simulation', icon: SlidersHorizontal },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const citizenNavItems = [
    { id: 'citizen_home', label: 'Home', icon: Home },
    { id: 'citizen_map', label: 'Water Safety Map', icon: Map },
    { id: 'citizen_report', label: 'Report an Issue', icon: MessageSquare },
    { id: 'citizen_advisories', label: 'Advisories', icon: AlertTriangle },
    { id: 'citizen_about', label: 'About', icon: Info },
  ];

  const items = isCitizen ? citizenNavItems : authorityNavItems;

  return (
    <aside className="w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800/80 z-30 select-none">
      
      {/* Top Branding */}
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Droplet className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>WaterGuard</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {isCitizen ? 'Citizen Transparency Portal' : 'Authority Command Center'}
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge != null && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Role Card & Switcher at Bottom */}
      <div className="p-3 border-t border-slate-800/60 bg-slate-900/50">
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-8 h-8 rounded-full ${currentUser?.avatarBg || 'bg-blue-600'} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
              {currentUser?.avatar || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{currentUser?.name}</div>
              <div className="text-[10px] text-blue-400 truncate font-medium">{currentUser?.roleLabel}</div>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            title="Switch Demo Role"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition shrink-0"
          >
            <UserCheck className="w-4 h-4" />
          </button>
        </div>
      </div>

    </aside>
  );
}
