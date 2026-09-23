const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Accredited Regional Blood Hubs & Transfusion Centers (Lucknow Trauma Grid)
let regionalBloodBanks = [
  {
    id: 'KGMU-BB-01',
    name: 'KGMU Trauma Center Blood Bank (Level 1 Apex)',
    zone: 'Chowk, Old Lucknow',
    distanceKm: 2.8,
    transitTimeMin: 7,
    phone: '+91 522 2257540',
    trafficCorridorAvailable: true,
    droneSupported: false,
    inventory: { 'O-': 6, 'O+': 28, 'A-': 8, 'A+': 32, 'B-': 4, 'B+': 24, 'AB-': 3, 'AB+': 14 }
  },
  {
    id: 'SGPGI-TM-02',
    name: 'SGPGI Transfusion Medicine Wing & Cryo Hub',
    zone: 'Raebareli Road',
    distanceKm: 9.4,
    transitTimeMin: 18,
    phone: '+91 522 2494000',
    trafficCorridorAvailable: true,
    droneSupported: true,
    inventory: { 'O-': 11, 'O+': 35, 'A-': 10, 'A+': 40, 'B-': 7, 'B+': 31, 'AB-': 5, 'AB+': 19 }
  },
  {
    id: 'RML-EMS-03',
    name: 'Dr. RML Institute of Medical Sciences (RMLIMS)',
    zone: 'Vibhuti Khand, Gomti Nagar',
    distanceKm: 4.6,
    transitTimeMin: 10,
    phone: '+91 522 4918504',
    trafficCorridorAvailable: true,
    droneSupported: false,
    inventory: { 'O-': 2, 'O+': 16, 'A-': 4, 'A+': 19, 'B-': 2, 'B+': 22, 'AB-': 1, 'AB+': 9 }
  },
  {
    id: 'MEDANTA-BB-04',
    name: 'Medanta Super Specialty Emergency Depot',
    zone: 'Sushant Golf City',
    distanceKm: 12.1,
    transitTimeMin: 22,
    phone: '+91 522 4505050',
    trafficCorridorAvailable: false,
    droneSupported: true,
    inventory: { 'O-': 5, 'O+': 21, 'A-': 6, 'A+': 25, 'B-': 4, 'B+': 18, 'AB-': 2, 'AB+': 11 }
  },
  {
    id: 'APOLLO-BB-05',
    name: 'Apollo Medics Emergency Transfusion Unit',
    zone: 'Kanpur Road, Bargawan',
    distanceKm: 6.9,
    transitTimeMin: 14,
    phone: '+91 522 6677777',
    trafficCorridorAvailable: true,
    droneSupported: false,
    inventory: { 'O-': 3, 'O+': 14, 'A-': 3, 'A+': 17, 'B-': 1, 'B+': 15, 'AB-': 1, 'AB+': 8 }
  }
];

// Active Dispatches with Cold-Chain & Police Escort status
let activeDispatches = [
  {
    id: 'MTP-CODE-RED-801',
    timestamp: '2 mins ago',
    source: 'KGMU Trauma Center Blood Bank',
    destination: 'Emergency Trauma OT #02, Civil Hospital',
    bloodGroup: 'O-',
    unitsRequested: 4,
    priority: 'CODE RED - MTP LEVEL 1',
    courierMode: 'Police Siren Green Corridor Escort',
    temperatureC: 3.8,
    etaMinutes: 5,
    status: 'IN TRANSIT'
  },
  {
    id: 'MTP-URGENT-802',
    timestamp: '14 mins ago',
    source: 'SGPGI Transfusion Medicine Wing',
    destination: 'Pediatric ICU Bay 4',
    bloodGroup: 'AB-',
    unitsRequested: 2,
    priority: 'Urgent P2 Cross-Match',
    courierMode: 'Rapid Medical Transit Unit',
    temperatureC: 4.1,
    etaMinutes: 2,
    status: 'ARRIVING AT TRAUMA BAY'
  }
];

// Recovery Assets Database
let recoveryAssets = [
  { id: 1, phase: 'Immediate (0-24 Hours)', category: 'Resuscitation & Hemorrhage', item: 'Emergency blood transfusion (O-negative packed cells)', urgency: 'CRITICAL', status: 'Allocated' },
  { id: 2, phase: 'Immediate (0-24 Hours)', category: 'Hemorrhage Control', item: 'Celox Hemostatic Gauze & Junctional Tourniquets', urgency: 'CRITICAL', status: 'In Transit' },
  { id: 3, phase: 'Acute Hospitalization', category: 'Critical Care ICU', item: 'Dedicated Trauma Mechanical Ventilator + Telemetry Bed', urgency: 'HIGH', status: 'Allocated' },
  { id: 4, phase: 'Discharge / Home Recovery', category: 'Durable Medical Equipment', item: 'Negative Pressure Wound Therapy (NPWT Vacuum Pump)', urgency: 'HIGH', status: 'Dispatched' },
  { id: 5, phase: 'Rehabilitation Phase', category: 'Physical Rehabilitation', item: 'Post-Trauma Gait Retraining & Neuromuscular Physical Therapy', urgency: 'MEDIUM', status: 'Scheduled' }
];

// 1. Extreme-Level Search: Rank hospitals by fastest ETA, stock readiness, and green corridor viability
app.get('/api/blood-search', (req, res) => {
  const bloodGroup = req.query.group || 'O-';
  const unitsNeeded = parseInt(req.query.units) || 1;

  const rankedFacilities = regionalBloodBanks.map(hospital => {
    const stockOnHand = hospital.inventory[bloodGroup] || 0;
    const canFulfill = stockOnHand >= unitsNeeded;

    return {
      id: hospital.id,
      name: hospital.name,
      zone: hospital.zone,
      distanceKm: hospital.distanceKm,
      transitTimeMin: hospital.transitTimeMin,
      phone: hospital.phone,
      stockOnHand,
      canFulfill,
      trafficCorridorAvailable: hospital.trafficCorridorAvailable,
      droneSupported: hospital.droneSupported,
      coldChainRating: 'Certified ISO-15189 (2°C - 6°C)',
      status: stockOnHand === 0 ? 'DEPLETED' : stockOnHand < 4 ? 'CRITICAL SHORTAGE' : 'STABLE RESERVE'
    };
  }).sort((a, b) => a.transitTimeMin - b.transitTimeMin); // Nearest time first

  res.json({
    success: true,
    searchedGroup: bloodGroup,
    unitsNeeded,
    hospitals: rankedFacilities
  });
});

// 2. Trigger Extreme Level MTP Emergency Dispatch
app.post('/api/trigger-mtp-dispatch', (req, res) => {
  const { sourceHospitalId, destination, bloodGroup, units, escortType } = req.body;
  const source = regionalBloodBanks.find(h => h.id === sourceHospitalId) || regionalBloodBanks[0];
  const requestedUnits = parseInt(units) || 2;

  // Immediate stock decrement
  if (source.inventory[bloodGroup] !== undefined) {
    source.inventory[bloodGroup] = Math.max(0, source.inventory[bloodGroup] - requestedUnits);
  }

  const dispatchToken = {
    id: `MTP-${Math.floor(1000 + Math.random() * 9000)}-MTC`,
    timestamp: 'Just now',
    source: source.name,
    destination: destination || 'Apex Emergency Resuscitation Bay #01',
    bloodGroup,
    unitsRequested: requestedUnits,
    priority: 'CODE RED - MTP LEVEL 1',
    courierMode: escortType || 'Police Siren Green Corridor Escort',
    temperatureC: 3.9,
    etaMinutes: source.transitTimeMin,
    status: 'DISPATCHED & CORRIDOR CLEARED'
  };

  activeDispatches.unshift(dispatchToken);

  res.status(201).json({
    success: true,
    message: 'Massive Transfusion Protocol Dispatched successfully',
    dispatch: dispatchToken,
    remainingStock: source.inventory[bloodGroup]
  });
});

app.get('/api/dispatches', (req, res) => res.json({ success: true, data: activeDispatches }));
app.get('/api/recovery-assets', (req, res) => res.json({ success: true, data: recoveryAssets }));

app.listen(PORT, () => {
  console.log(`TraumaPulse Extreme Emergency Engine live on port ${PORT}`);
});
