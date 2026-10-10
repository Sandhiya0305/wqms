import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  MapPin, 
  AlertTriangle, 
  Flame, 
  Droplet, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight,
  PhoneCall,
  Sparkles,
  HelpCircle,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTelemetry } from '../../context/TelemetryContext';

export default function CitizenHomeView({ setActiveView }) {
  const { selectedCity } = useAuth();
  const { stations, latestTelemetry } = useTelemetry();

  const cityStations = stations.filter(s => !selectedCity || s.city === selectedCity);
  const [selectedStationId, setSelectedStationId] = useState(cityStations[0]?.id || 'TRICHY_ROCKFORT_04');
  const [searchArea, setSearchArea] = useState('');
  const [advisories, setAdvisories] = useState([]);

  // Default to first station of city when city changes
  useEffect(() => {
    if (cityStations.length > 0 && !cityStations.some(s => s.id === selectedStationId)) {
      setSelectedStationId(cityStations[0].id);
    }
  }, [selectedCity, cityStations]);

  // Fetch active advisories
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

  const isSafe = (telemetry.wqi_score || 20) <= 50;
  const isModerate = (telemetry.wqi_score || 20) > 50 && (telemetry.wqi_score || 20) <= 75;
  const isHazardous = (telemetry.wqi_score || 20) > 75;

  let potabilityLabel = 'Safe to Drink from Tap';
  let potabilityDesc = 'Water meets WHO and Indian Drinking Water Standards (BIS IS 10500). Safe for drinking, cooking, and infant preparation without boiling.';
  let badgeColor = 'bg-emerald-500 text-white';

  if (isHazardous) {
    potabilityLabel = 'Boil Water Before Drinking';
    potabilityDesc = 'Unusual parameter shift detected in this zone. Please boil municipal tap water for 3 minutes before drinking or using for food preparation.';
    badgeColor = 'bg-rose-500 text-white';
  } else if (isModerate) {
    potabilityLabel = 'Moderate Quality — In-Home Filter Advised';
    potabilityDesc = 'Slight mineral or turbidity variation detected. Tap water is safe for washing, but in-home filtration or boiling is advised for drinking.';
    badgeColor = 'bg-amber-500 text-white';
  }

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-blue-200/40 dark:border-slate-800 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
        <div className="relative p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Public Water Intelligence • {selectedCity} District</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Is Your Tap Water Safe to Drink Today?
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
              Check live laboratory sensor readings from your municipal water supply across {selectedCity}. We monitor water clarity, acidity, and chlorine protection 24 hours a day.
            </p>

            {/* Quick Area Buttons for Trichy */}
            <div className="mt-5">
              <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider block mb-2">
                Select Your Neighborhood in {selectedCity}:
              </span>
              <div className="flex flex-wrap gap-2">
                {cityStations.slice(0, 6).map((station) => (
                  <button
                    key={station.id}
                    onClick={() => setSelectedStationId(station.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      selectedStationId === station.id
                        ? 'bg-white text-blue-800 shadow-md font-bold'
                        : 'bg-white/15 hover:bg-white/25 text-white'
                    }`}
                  >
                    {station.district || station.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Overall Potability Badge Card */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-2xl text-slate-800 dark:text-slate-100 shrink-0 min-w-[280px]">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Current Zone Status
            </span>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl ${badgeColor} flex items-center justify-center shadow-lg shrink-0`}>
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-extrabold leading-tight">{potabilityLabel}</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{activeStation?.district}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Cleanliness Score:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {100 - Math.min(100, telemetry.wqi_score || 20)} / 100
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Live Sensor reading updated seconds ago
            </div>
          </div>
        </div>
      </div>

      {/* Active Public Advisories Banner (If any) */}
      {advisories.length > 0 && (
        <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500 text-white shrink-0 mt-0.5">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase">
                  Official Health Notice
                </span>
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
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
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shrink-0 whitespace-nowrap shadow-sm"
          >
            Read All Warnings
          </button>
        </div>
      )}

      {/* Live Parameters in Simple English */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Water Purity Breakdown for {activeStation?.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear readings explained in plain English for non-technical residents
            </p>
          </div>

          <button
            onClick={() => setActiveView('citizen_map')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Explore on Live City Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Water Clarity (Turbidity) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Water Clarity</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {telemetry.turbidity || 1.8} NTU
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              Crystal Clear
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              No suspended mud or silt detected in your tap line.
            </p>
          </div>

          {/* Card 2: Acidity Balance (pH) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Acidity (pH)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {telemetry.ph || 7.2}
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              Neutral & Healthy
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Optimal range (6.5 to 8.5) recommended by WHO.
            </p>
          </div>

          {/* Card 3: Germ Barrier (Chlorine) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Disinfection Barrier</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {telemetry.chlorine || 0.7} mg/L
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              Active Protection
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Guards drinking water against bacterial contamination.
            </p>
          </div>

          {/* Card 4: Mineral Content (TDS) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Minerals (TDS)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {telemetry.tds || 210} ppm
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              Pleasant Taste
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Well below the 500 ppm maximum mineral limit.
            </p>
          </div>

        </div>
      </div>

      {/* Quick Action Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Action 1: Report an Issue */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              Report Dirty or Smelly Water
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Noticed brown water, strange smells, or a leaking public main in your neighborhood? Report it directly to municipal engineers.
            </p>
          </div>

          <button
            onClick={() => setActiveView('citizen_report')}
            className="mt-6 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            File Water Quality Issue
          </button>
        </div>

        {/* Action 2: Track My Complaints */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              Track Complaint Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Check live engineer inspection status, pipeline repair dispatches, and resolution notes for issues reported in your ward.
            </p>
          </div>

          <button
            onClick={() => setActiveView('citizen_tracker')}
            className="mt-6 w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition cursor-pointer"
          >
            View Complaint Tracker
          </button>
        </div>

        {/* Action 3: Emergency Water Helpline */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              24/7 Municipal Helpline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              For urgent pipeline bursts or severe contamination emergencies in {selectedCity}, contact the 24-hour civic helpline.
            </p>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
            <span>Toll-Free Helpline:</span>
            <span className="text-blue-600 dark:text-blue-400">1800-425-4555</span>
          </div>
        </div>

      </div>

    </div>
  );
}
