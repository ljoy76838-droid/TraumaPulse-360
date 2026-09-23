import React, { useState, useMemo } from 'react';

const hospitalsData = [
  {
    id: 1,
    name: 'KGMU Level-1 Apex Trauma Center',
    area: 'Chowk, Old Lucknow',
    distance: 2.8,
    eta: 7,
    fastest: true,
    corridorStatus: 'Ready & Synchronized',
    inventory: { 'O-': 4, 'O+': 15, 'A-': 3, 'A+': 18, 'B-': 6, 'B+': 14, 'AB-': 2, 'AB+': 8 }
  },
  {
    id: 2,
    name: 'Dr. RML Institute of Medical Sciences (RMLIMS)',
    area: 'Vibhuti Khand, Gomti Nagar',
    distance: 4.6,
    eta: 10,
    fastest: false,
    corridorStatus: 'Green Corridor Verified',
    inventory: { 'O-': 2, 'O+': 8, 'A-': 1, 'A+': 9, 'B-': 2, 'B+': 11, 'AB-': 0, 'AB+': 5 }
  },
  {
    id: 3,
    name: 'Apollo Medics Emergency Transfusion Wing',
    area: 'Kanpur - Lucknow Express Corridor',
    distance: 6.9,
    eta: 14,
    fastest: false,
    corridorStatus: 'Escort Vehicle Assigned',
    inventory: { 'O-': 5, 'O+': 12, 'A-': 2, 'A+': 10, 'B-': 3, 'B+': 9, 'AB-': 1, 'AB+': 6 }
  },
  {
    id: 4,
    name: 'SGPGI Transfusion Medicine Apex Cryo-Hub',
    area: 'Raebareli Road',
    distance: 9.4,
    eta: 18,
    fastest: false,
    corridorStatus: 'Direct Air/Road Cleared',
    inventory: { 'O-': 8, 'O+': 24, 'A-': 5, 'A+': 20, 'B-': 11, 'B+': 19, 'AB-': 4, 'AB+': 12 }
  }
];

const assetsData = [
  { id: 'REC-101', item: 'Packed Red Blood Cells (O-Neg Reserve)', category: 'Resuscitation', phase: 'Immediate (0-24h)', urgency: 'CRITICAL', status: 'Allocated' },
  { id: 'REC-102', item: 'Celox Hemostatic Gauze & Junctional Tourniquets', category: 'Hemorrhage Control', phase: 'Immediate (0-24h)', urgency: 'CRITICAL', status: 'In Transit' },
  { id: 'REC-103', item: 'Invasive Arterial Line & Transducer Kit', category: 'Critical Care ICU', phase: 'Acute Phase', urgency: 'HIGH', status: 'Allocated' },
  { id: 'REC-104', item: 'Negative Pressure Wound Therapy Pump', category: 'DME / Rehab', phase: 'Discharge / Home', urgency: 'HIGH', status: 'Dispatched' },
  { id: 'REC-105', item: 'Intracranial Pressure (ICP) Fiberoptic Probe', category: 'Neurotrauma', phase: 'Immediate (0-24h)', urgency: 'CRITICAL', status: 'Operational' },
  { id: 'REC-106', item: 'Chest Tube Thoracostomy Autotransfusion Canister', category: 'Thoracic Care', phase: 'Immediate (0-24h)', urgency: 'HIGH', status: 'Allocated' },
  { id: 'REC-107', item: 'Low-Air-Loss Microclimate Pressure Mattress', category: 'Acute Nursing', phase: 'Acute Phase', urgency: 'MEDIUM', status: 'Standby' },
  { id: 'REC-108', item: 'Neuromuscular Electrical Gait Retraining Unit', category: 'Physical Rehab', phase: 'Rehabilitation', urgency: 'MEDIUM', status: 'Scheduled' }
];

const telemetryData = [
  { id: 'BAY-01', patient: 'Trauma Code #4491 (Polytrauma)', gcs: '8/15', hr: 118, bp: '82/48', map: 59, spo2: '93%', vent: 'PRVC FiO2 60%', status: 'UNSTABLE', color: '#f59e0b' },
  { id: 'BAY-02', patient: 'Trauma Code #4489 (Post-Op Lap)', gcs: '14/15', hr: 78, bp: '118/74', map: 88, spo2: '99%', vent: 'Nasal Cannula 2L', status: 'STABLE', color: '#10b981' },
  { id: 'BAY-03', patient: 'Trauma Code #4502 (Splenic Rupture)', gcs: '5/15', hr: 136, bp: '74/38', map: 50, spo2: '88%', vent: 'SIMV PEEP 12', status: 'CRITICAL', color: '#ef4444' },
  { id: 'BAY-04', patient: 'Trauma Code #4477 (Flail Chest)', gcs: '12/15', hr: 88, bp: '124/82', map: 96, spo2: '97%', vent: 'CPAP Weaning', status: 'STABLE', color: '#10b981' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('radar');
  const [selectedBlood, setSelectedBlood] = useState('O+');
  const [units, setUnits] = useState(2);
  const [hospitals, setHospitals] = useState(hospitalsData);
  const [selectedHospId, setSelectedHospId] = useState(1);
  const [destination, setDestination] = useState('Civil Hospital Trauma OT #01');
  const [escort, setEscort] = useState('Police Siren Green Corridor Escort');
  const [search, setSearch] = useState('');
  const [urgency, setUrgency] = useState('ALL');
  const [dispatchedAlert, setDispatchedAlert] = useState(false);

  const [dispatches, setDispatches] = useState([
    {
      id: 'MTP-8921-COR',
      supplier: 'Apollo Medics Emergency Transfusion Wing',
      destination: 'Civil Hospital Trauma OT #01',
      units: 2,
      group: 'B-',
      eta: '14 Mins',
      temp: '3.8 C',
      status: 'CORRIDOR ACTIVE',
      escort: 'Police Siren Green Corridor Escort'
    }
  ]);

  const [triageNotes, setTriageNotes] = useState('34yo male, high-speed collision. SBP 75, HR 135, GCS 7. Rigid abdomen with FAST ultrasound positive.');
  const [triageResult, setTriageResult] = useState({
    level: 'LEVEL 1 RED (IMMEDIATE RESUSCITATION)',
    shockIndex: 1.8,
    gcs: 7,
    action: 'Activate Massive Transfusion Protocol (1:1:1 PRBC, FFP, Platelets). Direct transit to Damage Control Laparotomy OR #1.'
  });

  const bloodGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const activeSupplier = useMemo(() => hospitals.find(h => h.id === selectedHospId) || hospitals[0], [hospitals, selectedHospId]);

  const handleMTP = () => {
    const stock = activeSupplier.inventory[selectedBlood] || 0;
    if (stock < units) {
      alert(`Critical Shortage: ${activeSupplier.name} only has ${stock} units of ${selectedBlood}.`);
      return;
    }

    setHospitals(prev => prev.map(h => {
      if (h.id === activeSupplier.id) {
        return {
          ...h,
          inventory: { ...h.inventory, [selectedBlood]: h.inventory[selectedBlood] - units }
        };
      }
      return h;
    }));

    const newDispatch = {
      id: `MTP-${Math.floor(1000 + Math.random() * 9000)}-MTC`,
      supplier: activeSupplier.name,
      destination: destination,
      units: units,
      group: selectedBlood,
      eta: `${activeSupplier.eta} Mins`,
      temp: '3.7 C',
      status: 'DISPATCHED',
      escort: escort
    };

    setDispatches([newDispatch, ...dispatches]);
    setDispatchedAlert(true);
    setTimeout(() => setDispatchedAlert(false), 3000);
  };

  const handleTriage = () => {
    const isCritical = triageNotes.toLowerCase().includes('sbp 7') || triageNotes.toLowerCase().includes('sbp 8') || triageNotes.toLowerCase().includes('fast');
    if (isCritical) {
      setTriageResult({
        level: 'LEVEL 1 RED (IMMEDIATE RESUSCITATION)',
        shockIndex: 1.8,
        gcs: 7,
        action: 'Mandate Level-1 MTP Activation. Prepare 4 units O-Neg/B- PRBC + 4 units FFP. Mobilize Trauma Surgical Bay.'
      });
    } else {
      setTriageResult({
        level: 'LEVEL 2 AMBER (EMERGENT)',
        shockIndex: 0.88,
        gcs: 14,
        action: 'Arterial line surveillance. Reserve 2 units crossmatched blood on standby.'
      });
    }
  };

  const filteredAssets = assetsData.filter(a => {
    const mSearch = a.item.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase());
    const mUrg = urgency === 'ALL' || a.urgency === urgency;
    return mSearch && mUrg;
  });

  return (
    <div style={{ backgroundColor: '#060a14', minHeight: '100vh', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '70px' }}>
      
      {/* Visual Animation CSS */}
      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(0.9); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 1; filter: drop-shadow(0 0 6px #ef4444); }
          100% { transform: scale(0.9); opacity: 0.7; }
        }
        @keyframes glowBtn {
          0%, 100% { box-shadow: 0 0 15px rgba(225, 29, 72, 0.35); }
          50% { box-shadow: 0 0 30px rgba(225, 29, 72, 0.75); }
        }
        @keyframes ecgMotion {
          0% { stroke-dashoffset: 600; }
          100% { stroke-dashoffset: 0; }
        }
        .hud-card {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        .hud-card:hover {
          border-color: rgba(225, 29, 72, 0.45);
          transform: translateY(-2px);
        }
        .ecg-anim {
          stroke-dasharray: 600;
          animation: ecgMotion 2.8s linear infinite;
        }
      `}</style>

      {/* Top Banner */}
      <div style={{ background: 'linear-gradient(90deg, #7f1d1d, #e11d48, #7f1d1d)', color: '#fff', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', padding: '7px 16px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fff', animation: 'pulseDot 1.1s infinite' }}></span>
        TRAUMAPULSE 360 CRISIS PROTOCOL ACTIVE • LEVEL-1 EMERGENCY CORRIDORS SYNCHRONIZED
      </div>

      {/* Main Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(10, 16, 30, 0.9)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #e11d48, #9f1239)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 0 20px rgba(225, 29, 72, 0.5)' }}>
              ♥
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px' }}>TraumaPulse 360</span>
                <span style={{ background: 'rgba(225, 29, 72, 0.15)', color: '#f43f5e', border: '1px solid rgba(225, 29, 72, 0.4)', fontSize: '10px', padding: '2px 7px', borderRadius: '4px', fontWeight: '800' }}>
                  TACTICAL APEX
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Multi-Hospital Emergency Blood Radar & Resuscitation Hub</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ background: 'rgba(2, 6, 23, 0.6)', border: '1px solid #1e293b', padding: '6px 12px', borderRadius: '8px', fontSize: '11px' }}>
              <span style={{ color: '#64748b', fontSize: '9px', fontWeight: '800', display: 'block' }}>CORRIDORS</span>
              <span style={{ color: '#10b981', fontWeight: '800' }}>● 100% CLEAR</span>
            </div>
            <div style={{ background: 'rgba(2, 6, 23, 0.6)', border: '1px solid #1e293b', padding: '6px 12px', borderRadius: '8px', fontSize: '11px' }}>
              <span style={{ color: '#64748b', fontSize: '9px', fontWeight: '800', display: 'block' }}>DISPATCHES</span>
              <span style={{ color: '#38bdf8', fontWeight: '800' }}>{dispatches.length} Active</span>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{ maxWidth: '1180px', margin: '14px auto 0 auto', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'radar', label: 'Extreme Blood Radar', icon: '⚡' },
            { id: 'recovery', label: 'Recovery Grid (1020 Assets)', icon: '∿' },
            { id: 'icu', label: 'ICU Telemetry HUD', icon: '🖵' },
            { id: 'triage', label: 'AI Triage Parser', icon: '✦' }
          ].map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  border: active ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.06)',
                  background: active ? 'linear-gradient(135deg, #e11d48, #be123c)' : 'rgba(15, 23, 42, 0.6)',
                  color: active ? '#fff' : '#94a3b8',
                  boxShadow: active ? '0 4px 14px rgba(225, 29, 72, 0.4)' : 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: '1180px', margin: '20px auto 0 auto', padding: '0 18px' }}>
        
        {/* ================= TAB 1: RADAR ================= */}
        {activeTab === 'radar' && (
          <div>
            {/* Control HUD */}
            <div className="hud-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>Units Required:</span>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#020617', border: '1px solid #334155', borderRadius: '6px' }}>
                    <button onClick={() => setUnits(Math.max(1, units - 1))} style={{ background: 'none', border: 'none', color: '#cbd5e1', fontSize: '15px', padding: '4px 10px', cursor: 'pointer' }}>-</button>
                    <span style={{ fontSize: '15px', fontWeight: '900', color: '#38bdf8', minWidth: '28px', textAlign: 'center' }}>{units}</span>
                    <button onClick={() => setUnits(Math.min(10, units + 1))} style={{ background: 'none', border: 'none', color: '#cbd5e1', fontSize: '15px', padding: '4px 10px', cursor: 'pointer' }}>+</button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700', marginRight: '6px' }}>Target Blood Group:</span>
                  {bloodGroups.map(grp => {
                    const active = selectedBlood === grp;
                    return (
                      <button
                        key={grp}
                        onClick={() => setSelectedBlood(grp)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          border: active ? '1px solid #f43f5e' : '1px solid #1e293b',
                          background: active ? 'linear-gradient(135deg, #e11d48, #9f1239)' : '#0f172a',
                          color: active ? '#fff' : '#94a3b8',
                          boxShadow: active ? '0 0 10px rgba(225, 29, 72, 0.4)' : 'none'
                        }}
                      >
                        {grp}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', letterSpacing: '1px' }}>EXTREME-LEVEL PROXIMITY MATCHER</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Dynamic rank ordered strictly by transit arrival time and certified cold-chain protocol.</div>
              </div>
              <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>● GPS SATELLITE RADAR ONLINE</div>
            </div>

            {/* Hospital Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginBottom: '22px' }}>
              {hospitals.map(h => {
                const stock = h.inventory[selectedBlood] ?? 0;
                const isSelected = h.id === activeSupplier.id;
                return (
                  <div
                    key={h.id}
                    className="hud-card"
                    style={{
                      padding: '16px',
                      position: 'relative',
                      border: isSelected ? '2px solid #f43f5e' : h.fastest ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.06)',
                      background: isSelected ? 'rgba(30, 18, 28, 0.85)' : 'rgba(13, 20, 36, 0.7)'
                    }}
                  >
                    {h.fastest && (
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#dc2626',
                        color: '#fff',
                        fontSize: '9px',
                        fontWeight: '900',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        boxShadow: '0 0 10px rgba(220, 38, 38, 0.5)'
                      }}>
                        ⚡ FASTEST LEVEL-1
                      </span>
                    )}

                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#f8fafc', marginBottom: '2px', paddingRight: h.fastest ? '110px' : '0' }}>
                      {h.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px' }}>{h.area}</div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                      <span style={{ background: '#020617', color: '#38bdf8', padding: '3px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: '700', border: '1px solid #1e293b' }}>
                        📍 {h.distance} km
                      </span>
                      <span style={{ background: '#020617', color: '#34d399', padding: '3px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: '700', border: '1px solid #1e293b' }}>
                        ⏱ ~{h.eta} Mins
                      </span>
                      <span style={{ background: '#020617', color: '#c084fc', padding: '3px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: '700', border: '1px solid #1e293b' }}>
                        🛡 {h.corridorStatus}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>STOCK AVAILABLE</div>
                        <div style={{ fontSize: '15px', fontWeight: '900', color: stock >= units ? '#10b981' : '#ef4444' }}>
                          {stock} <span style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>Units of {selectedBlood}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedHospId(h.id)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700',
                          border: 'none',
                          cursor: 'pointer',
                          background: isSelected ? '#10b981' : '#1e293b',
                          color: '#fff',
                          boxShadow: isSelected ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
                        }}
                      >
                        {isSelected ? '✓ Selected Supplier' : 'Allocate Units'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* MTP Code Red Terminal */}
            <div className="hud-card" style={{
              padding: '18px',
              border: '1px solid rgba(225, 29, 72, 0.4)',
              background: 'linear-gradient(180deg, rgba(35, 10, 20, 0.6) 0%, rgba(13, 20, 36, 0.8) 100%)',
              marginBottom: '22px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulseDot 0.9s infinite' }}></span>
                  <span style={{ fontSize: '15px', fontWeight: '900', color: '#f87171', letterSpacing: '0.5px' }}>
                    MTP CODE RED AUTHORIZATION
                  </span>
                </div>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>AUTH: POLICE-DISPATCH-SYNC</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', marginBottom: '4px' }}>TARGET TRAUMA WARD / DESTINATION</div>
                  <input
                    type="text"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', background: '#020617', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', marginBottom: '4px' }}>EMERGENCY ESCORT ROUTE</div>
                  <select
                    value={escort}
                    onChange={e => setEscort(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', background: '#020617', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                  >
                    <option>Police Siren Green Corridor Escort</option>
                    <option>Autonomous Blood Drone Air-Corridor</option>
                    <option>Paramedic Rapid Response Carrier</option>
                  </select>
                </div>
              </div>

              <div style={{ background: '#020617', padding: '10px 14px', borderRadius: '8px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                <div style={{ fontSize: '12px' }}>
                  ORDER SUMMARY: <strong style={{ color: '#ef4444' }}>{units} Units of {selectedBlood}</strong> from <span style={{ color: '#38bdf8' }}>{activeSupplier.name}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>
                  ❄ Cold-Chain: 3.8°C Regulated
                </div>
              </div>

              <button
                onClick={handleMTP}
                style={{
                  width: '100%',
                  padding: '13px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '900',
                  letterSpacing: '1px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  animation: 'glowBtn 2s infinite'
                }}
              >
                {dispatchedAlert ? '✓ DISPATCH CONFIRMED — SIRENS ACTIVE' : 'TRIGGER MTP DISPATCH & CLEAR GREEN CORRIDOR'}
              </button>
            </div>

            {/* Live Dispatches */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#f1f5f9', marginBottom: '10px' }}>
                Live Regional Cold-Chain Dispatches ({dispatches.length})
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {dispatches.map(item => (
                  <div key={item.id} className="hud-card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '900', color: '#ef4444' }}>{item.id}</span>
                        <span style={{ background: '#020617', border: '1px solid #334155', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' }}>
                          {item.units} Units of {item.group}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                        {item.supplier} ➔ <strong style={{ color: '#e2e8f0' }}>{item.destination}</strong>
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>{item.escort}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>
                        {item.status}
                      </span>
                      <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700', marginTop: '4px' }}>
                        ETA: {item.eta} | {item.temp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: RECOVERY GRID ================= */}
        {activeTab === 'recovery' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '17px', fontWeight: '900' }}>Post-Resuscitation Asset Continuum</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Tracking from emergency resuscitation to durable medical equipment and rehabilitation.</div>
              </div>
              <span style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.25)', fontSize: '11px', padding: '3px 9px', borderRadius: '6px', fontWeight: '800' }}>
                1,020 Assets Cataloged
              </span>
            </div>

            <div className="hud-card" style={{ padding: '12px', marginBottom: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search trauma assets or care phases..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, minWidth: '200px', padding: '8px 12px', background: '#020617', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(urg => (
                  <button
                    key={urg}
                    onClick={() => setUrgency(urg)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      border: '1px solid #334155',
                      background: urgency === urg ? '#e11d48' : '#0f172a',
                      color: urgency === urg ? '#fff' : '#94a3b8'
                    }}
                  >
                    {urg}
                  </button>
                ))}
              </div>
            </div>

            <div className="hud-card" style={{ overflowX: 'auto', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#020617', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 14px' }}>Asset ID</th>
                    <th style={{ padding: '12px 14px' }}>Item Description</th>
                    <th style={{ padding: '12px 14px' }}>Category</th>
                    <th style={{ padding: '12px 14px' }}>Care Phase</th>
                    <th style={{ padding: '12px 14px' }}>Urgency</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map(asset => (
                    <tr key={asset.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: '700' }}>{asset.id}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#f8fafc' }}>{asset.item}</td>
                      <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{asset.category}</td>
                      <td style={{ padding: '12px 14px', color: '#cbd5e1' }}>{asset.phase}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          backgroundColor: asset.urgency === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : asset.urgency === 'HIGH' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: asset.urgency === 'CRITICAL' ? '#f87171' : asset.urgency === 'HIGH' ? '#fb923c' : '#34d399',
                          border: `1px solid ${asset.urgency === 'CRITICAL' ? '#ef4444' : asset.urgency === 'HIGH' ? '#f97316' : '#10b981'}`,
                          fontSize: '10px',
                          fontWeight: '800',
                          padding: '2px 7px',
                          borderRadius: '4px'
                        }}>
                          {asset.urgency}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#e2e8f0' }}>{asset.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: ICU TELEMETRY ================= */}
        {activeTab === 'icu' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '17px', fontWeight: '900' }}>Trauma ICU Physiological Surveillance HUD</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Real-time Mean Arterial Pressure (MAP), invasive ICP, and hemodynamic stability.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#34d399', fontWeight: '700' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', animation: 'pulseDot 1.1s infinite' }}></span>
                TELEMETRY SYNCHRONIZED
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {telemetryData.map(bed => (
                <div key={bed.id} className="hud-card" style={{ padding: '16px', borderLeft: `4px solid ${bed.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '900', fontSize: '15px' }}>{bed.id}</span>
                    <span style={{
                      backgroundColor: `${bed.color}22`,
                      color: bed.color,
                      border: `1px solid ${bed.color}55`,
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: '800'
                    }}>
                      {bed.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '10px' }}>{bed.patient}</div>

                  {/* Animated ECG Waveform */}
                  <div style={{ height: '34px', width: '100%', marginBottom: '10px', background: '#020617', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                    <svg viewBox="0 0 300 40" style={{ width: '100%', height: '100%' }}>
                      <path
                        className="ecg-anim"
                        d="M 0,20 L 50,20 L 60,8 L 70,32 L 80,12 L 90,24 L 100,20 L 150,20 L 160,5 L 170,35 L 180,10 L 190,26 L 200,20 L 300,20"
                        fill="none"
                        stroke={bed.color}
                        strokeWidth="2"
                      />
                    </svg>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                    <div style={{ background: '#020617', padding: '8px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                      <div style={{ color: '#64748b', fontSize: '9px', fontWeight: '700' }}>HEART RATE</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#ef4444' }}>{bed.hr} <span style={{ fontSize: '10px', color: '#94a3b8' }}>bpm</span></div>
                    </div>
                    <div style={{ background: '#020617', padding: '8px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                      <div style={{ color: '#64748b', fontSize: '9px', fontWeight: '700' }}>BP / (MAP)</div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#38bdf8' }}>{bed.bp} <span style={{ fontSize: '10px', color: '#94a3b8' }}>({bed.map})</span></div>
                    </div>
                    <div style={{ background: '#020617', padding: '8px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                      <div style={{ color: '#64748b', fontSize: '9px', fontWeight: '700' }}>SPO2 (OXYGEN)</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#34d399' }}>{bed.spo2}</div>
                    </div>
                    <div style={{ background: '#020617', padding: '8px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                      <div style={{ color: '#64748b', fontSize: '9px', fontWeight: '700' }}>GCS SCORE</div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#e2e8f0' }}>{bed.gcs}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                    Ventilator: <strong style={{ color: '#f8fafc' }}>{bed.vent}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: AI TRIAGE PARSER ================= */}
        {activeTab === 'triage' && (
          <div>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '17px', fontWeight: '900' }}>AI Pre-Hospital & ED Triage Parser</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Extract shock index (HR/SBP), revised trauma score, and surgical directives from clinical run-sheets.</div>
            </div>

            <div className="hud-card" style={{ padding: '18px', marginBottom: '18px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', marginBottom: '8px' }}>CLINICAL NOTES / PARAMEDIC RUN SHEET:</div>
              <textarea
                rows="4"
                value={triageNotes}
                onChange={e => setTriageNotes(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', background: '#020617', border: '1px solid #334155', borderRadius: '6px', color: '#fff', padding: '12px', fontSize: '13px', lineHeight: '1.5' }}
              />
              <button
                onClick={handleTriage}
                style={{
                  marginTop: '10px',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #e11d48, #be123c)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '800',
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)'
                }}
              >
                ✦ CALCULATE TRIAGE & CLINICAL ESCALATION
              </button>
            </div>

            {triageResult && (
              <div className="hud-card" style={{ padding: '18px', border: '1px solid #38bdf8', background: 'rgba(13, 20, 36, 0.9)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '900', color: '#f87171' }}>{triageResult.level}</span>
                  <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '700' }}>Shock Index: <strong>{triageResult.shockIndex}</strong></span>
                </div>
                <div style={{ fontSize: '13px', color: '#e2e8f0', marginBottom: '10px' }}>
                  <strong>Assessed GCS:</strong> {triageResult.gcs} / 15
                </div>
                <div style={{ background: '#020617', padding: '12px', borderRadius: '6px', fontSize: '13px', color: '#cbd5e1', borderLeft: '4px solid #ef4444', lineHeight: '1.5' }}>
                  <strong>Immediate Action:</strong> {triageResult.action}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
