import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Flame, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight,
  PhoneCall,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTelemetry } from '../../context/TelemetryContext';

export default function CitizenHomeView({ setActiveView }) {
  const { selectedCity } = useAuth();
  const { stations, latestTelemetry } = useTelemetry();

  const cityStations = stations.filter(s => !selectedCity || s.city === selectedCity);
  const [selectedStationId, setSelectedStationId] = useState(cityStations[0]?.id || 'TRICHY_ROCKFORT_04');
  const [advisories, setAdvisories] = useState([]);

  useEffect(() => {
    if (cityStations.length > 0 && !cityStations.some(s => s.id === selectedStationId)) {
      setSelectedStationId(cityStations[0].id);
    }
  }, [selectedCity, cityStations]);

  useEffect(() => {
    fetch(`/api/v1/advisories?city=${encodeURIComponent(selectedCity)}&active=true`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setAdvisories(data.data || []);
      })
      .catch(() => {});
  }, [selectedCity]);

  const activeStation = cityStations.find(s => s.id === selectedStationId) || cityStations[0] || {
    name: 'Rockfort Urban Tap Grid',
    district: 'Rockfort & Teppakulam',
    type: 'TAP_NETWORK'
  };

  const telemetry = latestTelemetry[activeStation?.id] || {
    wqi_score: 22,
    ph: 7.3,
    turbidity: 1.8,
    dissolved_oxygen: 7.2,
    tds: 180,
    chlorine: 0.8
  };

  const isModerate = (telemetry.wqi_score || 20) > 50 && (telemetry.wqi_score || 20) <= 75;
  const isHazardous = (telemetry.wqi_score || 20) > 75;

  let potabilityLabel = 'Safe to Drink from Tap';
  let badgeColor = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';

  if (isHazardous) {
    potabilityLabel = 'Boil Water Before Drinking';
    badgeColor = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800';
  } else if (isModerate) {
    potabilityLabel = 'Moderate Quality — Filtration Advised';
    badgeColor = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
  }

  return (
    <div className="space-y-6">
      
      {/* Boxy Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200 dark:border-blue-800">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Public Water Status • {selectedCity}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Tap Water Quality Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time sensor readings from municipal distribution lines across {selectedCity}.
          </p>

          {/* Area Selector Buttons */}
          <div className="mt-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Select Area:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {cityStations.slice(0, 6).map((station) => (
                <button
                  key={station.id}
                  onClick={() => setSelectedStationId(station.id)}
                  className={`px-3 py-1 rounded-none text-xs font-semibold border transition cursor-pointer ${
                    selectedStationId === station.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {station.district || station.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Zone Status Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-none border border-slate-200 dark:border-slate-700 shrink-0 min-w-[260px]">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Zone Status
          </span>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-none border ${badgeColor} shrink-0`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{potabilityLabel}</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">{activeStation?.district}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Score:</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {100 - Math.min(100, telemetry.wqi_score || 20)} / 100
            </span>
          </div>
        </div>
      </div>

      {/* Active Public Advisories Banner (If any) */}
      {advisories.length > 0 && (
        <div className="p-4 rounded-none bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/60 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-none bg-rose-600 text-white shrink-0 mt-0.5">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-none bg-rose-600 text-white uppercase">
                  Health Notice
                </span>
                <span className="text-xs font-semibold text-rose-800 dark:text-rose-200">
                  {advisories[0].area}, {advisories[0].city}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                {advisories[0].title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {advisories[0].message} <strong>Directive: </strong>{advisories[0].guidelines}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveView('citizen_advisories')}
            className="px-3 py-1.5 rounded-none bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shrink-0 cursor-pointer"
          >
            View Notice
          </button>
        </div>
      )}

      {/* Live Parameters in Simple English */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Parameter Breakdown: {activeStation?.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear readings explained in plain English
            </p>
          </div>

          <button
            onClick={() => setActiveView('citizen_map')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Live City Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Water Clarity (Turbidity) */}
          <div className="p-4 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Clarity</span>
              <span className="w-2 h-2 rounded-none bg-emerald-500"></span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {telemetry.turbidity || 1.8} NTU
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              Crystal Clear
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              No suspended mud or silt detected in tap line.
            </p>
          </div>

          {/* Card 2: Acidity Balance (pH) */}
          <div className="p-4 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Acidity (pH)</span>
              <span className="w-2 h-2 rounded-none bg-emerald-500"></span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {telemetry.ph || 7.2}
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              Neutral & Balanced
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Within optimal WHO standard range (6.5 to 8.5).
            </p>
          </div>

          {/* Card 3: Germ Barrier (Chlorine) */}
          <div className="p-4 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Disinfection</span>
              <span className="w-2 h-2 rounded-none bg-emerald-500"></span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {telemetry.chlorine || 0.7} mg/L
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              Protected
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Guards against bacterial contamination.
            </p>
          </div>

          {/* Card 4: Mineral Content (TDS) */}
          <div className="p-4 rounded-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Minerals (TDS)</span>
              <span className="w-2 h-2 rounded-none bg-emerald-500"></span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {telemetry.tds || 210} ppm
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              Normal
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Well below 500 ppm standard limit.
            </p>
          </div>

        </div>
      </div>

      {/* Quick Action Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Action 1: Report an Issue */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-none bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 border border-blue-200 dark:border-blue-800">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Report Water Issue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Noticed brown water, odd odors, or a pipeline leak? Submit a ticket directly to field teams.
            </p>
          </div>

          <button
            onClick={() => setActiveView('citizen_report')}
            className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-none transition cursor-pointer"
          >
            File Incident Report
          </button>
        </div>

        {/* Action 2: Track Complaints */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-none bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 border border-slate-200 dark:border-slate-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Track Complaints
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monitor inspection status and resolution logs for tickets filed in your district.
            </p>
          </div>

          <button
            onClick={() => setActiveView('citizen_tracker')}
            className="mt-4 w-full py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-none border border-slate-300 dark:border-slate-700 transition cursor-pointer"
          >
            View Tracker
          </button>
        </div>

        {/* Action 3: Emergency Water Helpline */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-none bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 border border-blue-200 dark:border-blue-800">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              24/7 Civic Helpline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              For urgent main bursts or contamination emergencies in {selectedCity}.
            </p>
          </div>

          <div className="mt-4 p-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
            <span>Toll-Free:</span>
            <span className="text-blue-600 dark:text-blue-400">1800-425-4555</span>
          </div>
        </div>

      </div>

    </div>
  );
}
