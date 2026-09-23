import React, { useState, useEffect } from 'react';
import {
  Activity, Droplets, HeartPulse, AlertTriangle, Sparkles, CheckCircle2,
  Clock, BedDouble, Search, Send, ChevronRight, ThermometerSnowflake, ShieldCheck
} from 'lucide-react';

const FALLBACK_STOCK = [
  { group: 'O-', units: 4, status: 'Critical Shortage', temp: 3.8, type: 'Rare Universal Donor' },
  { group: 'O+', units: 16, status: 'Stable', temp: 4.1, type: 'High Demand' },
  { group: 'A-', units: 6, status: 'Low Stock', temp: 3.7, type: 'Emergency Reserve' },
  { group: 'A+', units: 24, status: 'Sufficient', temp: 4.0, type: 'Stable Stock' },
  { group: 'B-', units: 3, status: 'Critical Shortage', temp: 3.6, type: 'Emergency Reserve' },
  { group: 'B+', units: 19, status: 'Stable', temp: 3.9, type: 'Stable Stock' },
  { group: 'AB-', units: 2, status: 'Critical Shortage', temp: 3.5, type: 'Universal Plasma Donor' },
  { group: 'AB+', units: 11, status: 'Stable', temp: 4.2, type: 'Universal Recipient' }
];

const FALLBACK_NEEDS = [
  { id: 1, phase: 'Immediate (0-24 Hours)', category: 'Primary Medical / Equipment', item: 'Emergency blood transfusion (O-negative)', urgency: 'CRITICAL', status: 'Allocated' },
  { id: 2, phase: 'Immediate (0-24 Hours)', category: 'Primary Medical / Equipment', item: 'Haemorrhage control (tourniquets, pressure dressings)', urgency: 'CRITICAL', status: 'In Transit' },
  { id: 3, phase: 'Immediate (0-24 Hours)', category: 'Primary Medical / Equipment', item: 'Airway stabilization (intubation, oxygen masks)', urgency: 'CRITICAL', status: 'Delivered' },
  { id: 4, phase: 'Acute Hospitalization', category: 'Hospitalization & Acute Care', item: 'Intensive Care Unit (ICU) specialized bed', urgency: 'HIGH', status: 'Allocated' },
  { id: 5, phase: 'Acute Hospitalization', category: 'Hospitalization & Acute Care', item: 'Step-down telemetry unit bed', urgency: 'HIGH', status: 'Requested' },
  { id: 6, phase: 'Discharge / Home Recovery', category: 'Durable Medical Equipment', item: 'Standard manual transport wheelchair', urgency: 'MEDIUM', status: 'Pending' },
  { id: 7, phase: 'Ongoing Home Recovery', category: 'Pharmaceuticals & Supplies', item: 'Prescription oral opioid medications & pain therapy', urgency: 'HIGH', status: 'Dispatched' },
  { id: 8, phase: 'Rehabilitation Phase', category: 'Therapeutic & Rehabilitation', item: 'Outpatient physical therapy sessions', urgency: 'MEDIUM', status: 'Scheduled' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('blood-sos');
  const [bloodStock, setBloodStock] = useState(FALLBACK_STOCK);
  const [sosLogs, setSosLogs] = useState([
    { id: 'SOS-801', hospital: 'Apex Trauma Center', group: 'O-', units: 2, priority: 'Code Red P1', time: '4 mins ago' },
    { id: 'SOS-802', hospital: 'General Emergency Care', group: 'AB-', units: 1, priority: 'Urgent P2', time: '18 mins ago' }
  ]);
  const [recoveryNeeds, setRecoveryNeeds] = useState(FALLBACK_NEEDS);

  const [reqHospital, setReqHospital] = useState('');
  const [reqGroup, setReqGroup] = useState('O-');
  const [reqUnits, setReqUnits] = useState(2);

  const [selectedPhase, setSelectedPhase] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [triageNotes, setTriageNotes] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/blood-inventory')
      .then(res => res.json())
      .then(data => { if (data.success) setBloodStock(data.data); })
      .catch(() => {});

    fetch('http://localhost:5000/api/recovery-assets')
      .then(res => res.json())
      .then(data => { if (data.success) setRecoveryNeeds(data.data); })
      .catch(() => {});
  }, []);

  const handleBroadcastSOS = (e) => {
    e.preventDefault();
    if (!reqHospital.trim()) return;

    const newSos = {
      id: `SOS-${Math.floor(100 + Math.random() * 900)}`,
      hospital: reqHospital,
      group: reqGroup,
      units: Number(reqUnits),
      priority: 'Immediate P1',
      time: 'Just now'
    };

    setSosLogs([newSos, ...sosLogs]);
    setBloodStock(bloodStock.map(b => b.group === reqGroup ? { ...b, units: Math.max(0, b.units - reqUnits) } : b));
    setReqHospital('');
  };

  const handleAIParse = (e) => {
    e.preventDefault();
    if (!triageNotes.trim()) return;
    setIsParsing(true);

    setTimeout(() => {
      setAiReport({
        severityScore: 'Level 1 - Code Red Resuscitation',
        bloodNeed: 'Immediate 3 Units O-Negative + 2 Units Fresh Frozen Plasma',
        criticalInterventions: [
          'Immediate surgical haemorrhage control & arterial line placement',
          'Reserve ICU Bed #04 with mechanical ventilation telemetry',
          'Requisition post-op vacuum wound therapy (NPWT) & splinting'
        ]
      });
      setIsParsing(false);
    }, 900);
  };

  const filteredNeeds = recoveryNeeds.filter(item => {
    const matchesPhase = selectedPhase === 'All' || item.phase.toLowerCase().includes(selectedPhase.toLowerCase());
    const matchesSearch = item.item.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPhase && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-rose-600 to-red-600 rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white">TraumaPulse 360</h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Active Crisis Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">Emergency Blood, Plasma & Continuous Injury Recovery Command</p>
            </div>
          </div>

          <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs font-medium">
            <button
              onClick={() => setActiveTab('blood-sos')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'blood-sos' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" /> Blood & SOS
            </button>
            <button
              onClick={() => setActiveTab('recovery-hub')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'recovery-hub' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> Recovery Grid (1020 Assets)
            </button>
            <button
              onClick={() => setActiveTab('icu-grid')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'icu-grid' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BedDouble className="w-3.5 h-3.5" /> ICU Telemetry
            </button>
            <button
              onClick={() => setActiveTab('ai-parser')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'ai-parser' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Triage Parser
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {activeTab === 'blood-sos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bloodStock.map((b) => (
                <div
                  key={b.group}
                  className={`p-4 rounded-2xl border transition relative overflow-hidden ${
                    b.units <= 3 ? 'bg-rose-950/30 border-rose-500/50 shadow-lg shadow-rose-950/20' : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-2xl font-black text-white">{b.group}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                      b.units <= 3 ? 'bg-rose-500/30 text-rose-300' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-100">{b.units} <span className="text-xs font-normal text-slate-400">units</span></p>
                      <p className="text-[11px] text-slate-400">{b.type}</p>
                    </div>
                    <span className="text-[10px] text-sky-400 flex items-center gap-1 font-mono">
                      <ThermometerSnowflake className="w-3 h-3" /> {b.temp}°C
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                <h2 className="font-bold text-white text-base flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="w-5 h-5 text-rose-500" /> Direct SOS Unit Requisition
                </h2>
                <form onSubmit={handleBroadcastSOS} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Target Trauma Center</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Metro Emergency Hospital"
                      value={reqHospital}
                      onChange={(e) => setReqHospital(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Blood / Plasma</label>
                      <select
                        value={reqGroup}
                        onChange={(e) => setReqGroup(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                      >
                        {bloodStock.map(b => (
                          <option key={b.group} value={b.group}>{b.group} ({b.units} units)</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Units</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={reqUnits}
                        onChange={(e) => setReqUnits(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30"
                  >
                    <Send className="w-3.5 h-3.5" /> Dispatch Emergency Units
                  </button>
                </form>
              </div>

              <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-white text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-500" /> Active Emergency Dispatch Stream
                  </h2>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    Live Telemetry
                  </span>
                </div>
                <div className="space-y-3">
                  {sosLogs.map(log => (
                    <div key={log.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-10 h-10 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-400 font-black flex items-center justify-center text-sm">
                          {log.group}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">{log.hospital}</p>
                          <p className="text-xs text-slate-400">{log.units} Units Requisitioned • <span className="text-rose-400">{log.priority}</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500 font-mono block">{log.time}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">Cold-Chain En Route</span>
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-500" /> Comprehensive Trauma Recovery Inventory
                </h2>
                <p className="text-xs text-slate-400">Standardized injury recovery dataset covering the entire clinical lifecycle.</p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="All">All Phases</option>
                  <option value="Immediate">Immediate (0-24 Hours)</option>
                  <option value="Acute">Acute Hospitalization</option>
                  <option value="Discharge">Discharge & Early Home</option>
                  <option value="Rehabilitation">Rehabilitation</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Item & Description</th>
                    <th className="py-3 px-4">Clinical Category</th>
                    <th className="py-3 px-4">Phase</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredNeeds.map((need) => (
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
              <p className="text-[11px] text-slate-400">14 Active Ventilators • O2 Pressure 58 PSI</p>
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
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Paramedic Field Report & Triage Synthesizer
            </h2>
            <form onSubmit={handleAIParse} className="space-y-4">
              <textarea
                rows={5}
                required
                value={triageNotes}
                onChange={(e) => setTriageNotes(e.target.value)}
                placeholder="Paste triage notes (e.g., Male victim, arterial bleed, blood pressure 80/50, pelvis fracture)..."
                className="w-full p-4 text-xs rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={isParsing}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white font-medium text-xs rounded-xl"
              >
                {isParsing ? 'Processing Triage...' : 'Analyze Case & Trigger Protocol'}
              </button>
            </form>

            {aiReport && (
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-rose-500/30 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono uppercase text-rose-400 font-bold">Clinical Priority</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">
                    {aiReport.severityScore}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 mb-1">Blood Directives:</h4>
                  <p className="text-xs text-rose-300 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/60 font-mono">
                    {aiReport.bloodNeed}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 mb-2">Immediate Interventions:</h4>
                  <ul className="space-y-1.5">
                    {aiReport.criticalInterventions.map((item, idx) => (
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
