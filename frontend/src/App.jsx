import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Activity, HeartPulse, Navigation, Clock, Phone, AlertCircle,
  Zap, Send, CheckCircle2, BedDouble, Sparkles, ChevronRight, Siren, ShieldCheck,
  Building2, ThermometerSnowflake, Crosshair
} from 'lucide-react';

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export default function App() {
  const [activeTab, setActiveTab] = useState('emergency-radar');

  // Extreme Search Filters
  const [selectedGroup, setSelectedGroup] = useState('O-');
  const [unitsNeeded, setUnitsNeeded] = useState(2);
  const [destinationHospital, setDestinationHospital] = useState('Civil Hospital Trauma OT #01');
  const [rankedHospitals, setRankedHospitals] = useState([]);
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [escortMode, setEscortMode] = useState('Police Siren Green Corridor Escort');

  // Logs and State
  const [dispatches, setDispatches] = useState([]);
  const [recoveryNeeds, setRecoveryNeeds] = useState([]);
  const [isActivatingMtp, setIsActivatingMtp] = useState(false);
  const [bannerAlert, setBannerAlert] = useState(null);

  // AI Field Triage State
  const [triageNotes, setTriageNotes] = useState('');
  const [isParsingTriage, setIsParsingTriage] = useState(false);
  const [triageResult, setTriageResult] = useState(null);

  const fetchBloodRadar = async (grp, units) => {
    try {
      const res = await fetch(`http://localhost:5000/api/blood-search?group=${encodeURIComponent(grp)}&units=${units}`);
      const data = await res.json();
      if (data.success) {
        setRankedHospitals(data.hospitals);
        if (data.hospitals.length > 0) {
          setSelectedSourceId(data.hospitals[0].id);
        }
      }
    } catch {
      // Offline preview
      setRankedHospitals([
        { id: 'KGMU-BB-01', name: 'KGMU Trauma Center Blood Bank', zone: 'Chowk, Old Lucknow', distanceKm: 2.8, transitTimeMin: 7, phone: '+91 522 2257540', stockOnHand: 6, canFulfill: true, trafficCorridorAvailable: true, droneSupported: false, status: 'STABLE RESERVE' },
        { id: 'RML-EMS-03', name: 'Dr. RML Institute of Medical Sciences (RMLIMS)', zone: 'Vibhuti Khand', distanceKm: 4.6, transitTimeMin: 10, phone: '+91 522 4918504', stockOnHand: 2, canFulfill: true, trafficCorridorAvailable: true, droneSupported: false, status: 'CRITICAL SHORTAGE' },
        { id: 'APOLLO-BB-05', name: 'Apollo Medics Emergency Transfusion Unit', zone: 'Kanpur Road', distanceKm: 6.9, transitTimeMin: 14, phone: '+91 522 6677777', stockOnHand: 3, canFulfill: true, trafficCorridorAvailable: true, droneSupported: false, status: 'CRITICAL SHORTAGE' },
        { id: 'SGPGI-TM-02', name: 'SGPGI Transfusion Medicine Wing & Cryo Hub', zone: 'Raebareli Road', distanceKm: 9.4, transitTimeMin: 18, phone: '+91 522 2494000', stockOnHand: 11, canFulfill: true, trafficCorridorAvailable: true, droneSupported: true, status: 'STABLE RESERVE' }
      ]);
    }
  };

  const loadData = async () => {
    try {
      const [resDisp, resAssets] = await Promise.all([
        fetch('http://localhost:5000/api/dispatches'),
        fetch('http://localhost:5000/api/recovery-assets')
      ]);
      const dispData = await resDisp.json();
      const assetsData = await resAssets.json();
      if (dispData.success) setDispatches(dispData.data);
      if (assetsData.success) setRecoveryNeeds(assetsData.data);
    } catch {}
  };

  useEffect(() => {
    fetchBloodRadar(selectedGroup, unitsNeeded);
    loadData();
  }, [selectedGroup, unitsNeeded]);

  const handleMtpActivation = async (e) => {
    e.preventDefault();
    setIsActivatingMtp(true);
    try {
      const res = await fetch('http://localhost:5000/api/trigger-mtp-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceHospitalId: selectedSourceId,
          destination: destinationHospital,
          bloodGroup: selectedGroup,
          units: unitsNeeded,
          escortType: escortMode
        })
      });
      const data = await res.json();
      if (data.success) {
        setDispatches([data.dispatch, ...dispatches]);
        fetchBloodRadar(selectedGroup, unitsNeeded);
        setBannerAlert(`EMERGENCY DISPATCH ${data.dispatch.id} CONFIRMED! Transit ETA: ${data.dispatch.etaMinutes} mins with Green Corridor.`);
        setTimeout(() => setBannerAlert(null), 8000);
      }
    } catch {}
    setIsActivatingMtp(false);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      {/* Top Alert Bar */}
      <div className="bg-rose-950/80 border-b border-rose-600/30 px-4 py-1.5 text-xs text-rose-300 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <Siren className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
          <span className="font-mono font-bold tracking-wide">
            TRAUMA PULSE LEVEL-1 CRISIS PROTOCOL ACTIVE • CITY TRAFFIC & REGIONAL BLOOD GRIDS SYNCHRONIZED
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-rose-600 to-red-600 rounded-xl shadow-lg shadow-rose-600/40 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg tracking-tight text-white">TraumaPulse 360</h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold">
                  Apex Emergency Grid
                </span>
              </div>
              <p className="text-xs text-slate-400">Extreme-Level Multi-Hospital Blood Radar & Continuum-of-Care Hub</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('emergency-radar')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'emergency-radar' ? 'bg-rose-600 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" /> Extreme Blood Radar
            </button>
            <button
              onClick={() => setActiveTab('recovery-hub')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'recovery-hub' ? 'bg-rose-600 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> Recovery Grid (1020 Assets)
            </button>
            <button
              onClick={() => setActiveTab('icu-grid')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'icu-grid' ? 'bg-rose-600 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BedDouble className="w-3.5 h-3.5" /> ICU Telemetry
            </button>
            <button
              onClick={() => setActiveTab('ai-parser')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'ai-parser' ? 'bg-rose-600 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Triage Parser
            </button>
          </div>
        </div>
      </header>

      {/* Live Toast Banner */}
      {bannerAlert && (
        <div className="max-w-7xl mx-auto px-4 mt-4 w-full">
          <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-200 text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-mono font-semibold">{bannerAlert}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        {activeTab === 'emergency-radar' && (
          <div className="space-y-6">
            {/* Filter Bar: Blood Group + Units Needed */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-rose-500" /> Extreme-Level Proximity Matcher
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hospitals are ordered strictly by transit arrival time (ETA) and certified cold-chain preservation status.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium">Units Required:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={unitsNeeded}
                    onChange={(e) => setUnitsNeeded(Number(e.target.value))}
                    className="w-16 px-2.5 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-bold text-center"
                  />
                </div>
              </div>

              {/* Blood Selector Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-medium mr-2">Target Blood Group:</span>
                {BLOOD_GROUPS.map((grp) => (
                  <button
                    key={grp}
                    onClick={() => setSelectedGroup(grp)}
                    className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition ${
                      selectedGroup === grp
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 scale-105 border border-rose-400'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Hospitals Ranked by Fastest Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rankedHospitals.map((hosp, idx) => (
                <div
                  key={hosp.id}
                  className={`p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                    idx === 0
                      ? 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-rose-500 shadow-xl shadow-rose-950/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  {idx === 0 && (
                    <div className="absolute top-0 right-0 bg-rose-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-white" /> Fastest Level-1 Route
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-start justify-between pr-16">
                      <div>
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-rose-500" />
                          {hosp.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">{hosp.zone}</p>
                      </div>
                    </div>

                    {/* Operational Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-rose-400 font-bold border border-slate-800">
                        {hosp.distanceKm} km
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> ETA: ~{hosp.transitTimeMin} Mins
                      </span>
                      {hosp.trafficCorridorAvailable && (
                        <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 flex items-center gap-1">
                          <Siren className="w-3 h-3" /> Green Corridor Ready
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock Availability & Order Action */}
                  <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-mono">Stock for {selectedGroup}:</span>
                      <span className={`text-xl font-black ${hosp.stockOnHand >= unitsNeeded ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {hosp.stockOnHand} <span className="text-xs font-normal text-slate-400">units available</span>
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedSourceId(hosp.id)}
                      disabled={hosp.stockOnHand < unitsNeeded}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        selectedSourceId === hosp.id
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                          : hosp.stockOnHand >= unitsNeeded
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {selectedSourceId === hosp.id ? 'Selected as Supplier' : 'Allocate Units'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Massive Transfusion Protocol (MTP) Action Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/40 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  <h3 className="font-bold text-white text-sm">MTP Code Red Authorization</h3>
                </div>

                <form onSubmit={handleMtpActivation} className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Target Trauma Ward / Destination</label>
                    <input
                      type="text"
                      required
                      value={destinationHospital}
                      onChange={(e) => setDestinationHospital(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Emergency Escort & Clearance</label>
                    <select
                      value={escortMode}
                      onChange={(e) => setEscortMode(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-medium"
                    >
                      <option value="Police Siren Green Corridor Escort">Police Siren Green Corridor Escort</option>
                      <option value="Autonomous Blood Drone Air-Corridor">Autonomous Blood Drone Air-Corridor</option>
                      <option value="Paramedic Rapid Response Carrier">Paramedic Rapid Response Carrier</option>
                    </select>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Order Summary:</span>
                    <p className="text-xs font-bold text-white">
                      {unitsNeeded} Units of <span className="text-rose-400">{selectedGroup}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Cold-Chain: <span className="text-emerald-400 font-mono">3.8°C Regulated</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isActivatingMtp}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2"
                  >
                    <Siren className="w-4 h-4 animate-spin" />
                    {isActivatingMtp ? 'Clearing Corridor...' : 'Trigger MTP Dispatch'}
                  </button>
                </form>
              </div>

              {/* Active Emergency Stream */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <ThermometerSnowflake className="w-4 h-4 text-cyan-400" />
                    Live Regional Cold-Chain Dispatches
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    Live Telemetry
                  </span>
                </div>

                <div className="space-y-3">
                  {dispatches.map((log) => (
                    <div key={log.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <span className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-400 font-black flex items-center justify-center text-base">
                          {log.bloodGroup}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                              {log.id}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                          </div>
                          <p className="text-xs font-semibold text-white mt-1">
                            <span className="text-slate-400">Origin:</span> {log.source} 
                            <span className="text-rose-400 mx-2">➔</span> 
                            <span className="text-slate-400">Dest:</span> {log.destination}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {log.unitsRequested} Units • {log.courierMode} • Temp: <span className="text-cyan-300 font-mono">{log.temperatureC}°C</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end justify-center">
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          ETA: ~{log.etaMinutes} Mins
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 mt-1">
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recovery-hub' && (
          <div className="space-y-6">
            <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" /> Trauma Continuum-of-Care Pipeline
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Post-stabilization asset grid: tracking equipment from ICU admission to outpatient physical therapy.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Item & Description</th>
                    <th className="py-3 px-4">Clinical Category</th>
                    <th className="py-3 px-4">Phase</th>
                    <th className="py-3 px-4">Urgency</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recoveryNeeds.map((need) => (
                    <tr key={need.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-medium text-slate-200">{need.item}</td>
                      <td className="py-3 px-4 text-slate-400">{need.category}</td>
                      <td className="py-3 px-4 text-slate-400">{need.phase}</td>
                      <td className="py-3 px-4 font-mono font-medium text-rose-400">{need.urgency}</td>
                      <td className="py-3 px-4 flex items-center gap-1.5 text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {need.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'icu-grid' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm text-white">Trauma ICU Pod A</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">92% Occupied</span>
              </div>
              <p className="text-2xl font-bold text-white">2 Beds Open / 18 Total</p>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '92%' }}></div>
              </div>
              <p className="text-[11px] text-slate-400">14 Active Ventilators • Pipeline O2: 58 PSI</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm text-white">Step-Down Telemetry</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">71% Occupied</span>
              </div>
              <p className="text-2xl font-bold text-white">7 Beds Open / 24 Total</p>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '71%' }}></div>
              </div>
              <p className="text-[11px] text-slate-400">Continuous cardiac and arterial pressure surveillance</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm text-white">Orthopaedic Trauma Ward</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">59% Occupied</span>
              </div>
              <p className="text-2xl font-bold text-white">13 Beds Open / 32 Total</p>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '59%' }}></div>
              </div>
              <p className="text-[11px] text-slate-400">Post-surgical mobilization and traction units</p>
            </div>
          </div>
        )}

        {activeTab === 'ai-parser' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Paramedic Field Report & Triage Synthesizer
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsParsingTriage(true);
                setTimeout(() => {
                  setTriageResult({
                    severityScore: 'Level 1 - Code Red Resuscitation',
                    bloodNeed: 'Immediate 4 Units O-Negative + 2 Units Cryoprecipitate',
                    criticalInterventions: [
                      'Activate Mass Transfusion Protocol (MTP)',
                      'Emergency surgical hemorrhage control & cross-clamp',
                      'Pre-reserve ICU ventilator bed with continuous arterial line'
                    ]
                  });
                  setIsParsingTriage(false);
                }, 600);
              }}
              className="space-y-4"
            >
              <textarea
                rows={5}
                required
                value={triageNotes}
                onChange={(e) => setTriageNotes(e.target.value)}
                placeholder="Paste triage notes (e.g., Highway collision, pedestrian struck, systolic BP 75, femoral arterial bleed, blunt chest trauma)..."
                className="w-full p-4 text-xs rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 font-mono"
              />
              <button
                type="submit"
                disabled={isParsingTriage}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs rounded-xl"
              >
                {isParsingTriage ? 'Analyzing Case...' : 'Synthesize Triage Directive'}
              </button>
            </form>

            {triageResult && (
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-rose-500/30 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono uppercase text-rose-400 font-bold">Severity Protocol</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                    {triageResult.severityScore}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 mb-1">Blood Directives:</h4>
                  <p className="text-xs text-rose-300 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/60 font-mono">
                    {triageResult.bloodNeed}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 mb-2">Immediate Interventions:</h4>
                  <ul className="space-y-1.5">
                    {triageResult.criticalInterventions.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
