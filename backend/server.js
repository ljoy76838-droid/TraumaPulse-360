const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let bloodInventory = [
  { group: 'O-', units: 4, status: 'Critical Shortage', temp: 3.8, threshold: 5, type: 'Rare Universal Donor' },
  { group: 'O+', units: 16, status: 'Stable', temp: 4.1, threshold: 10, type: 'High Demand' },
  { group: 'A-', units: 6, status: 'Low Stock', temp: 3.7, threshold: 8, type: 'Emergency Reserve' },
  { group: 'A+', units: 24, status: 'Sufficient', temp: 4.0, threshold: 12, type: 'Stable Stock' },
  { group: 'B-', units: 3, status: 'Critical Shortage', temp: 3.6, threshold: 6, type: 'Emergency Reserve' },
  { group: 'B+', units: 19, status: 'Stable', temp: 3.9, threshold: 10, type: 'Stable Stock' },
  { group: 'AB-', units: 2, status: 'Critical Shortage', temp: 3.5, threshold: 4, type: 'Universal Plasma Donor' },
  { group: 'AB+', units: 11, status: 'Stable', temp: 4.2, threshold: 8, type: 'Universal Recipient' }
];

let sosDispatches = [
  { id: 'SOS-801', hospital: 'Apex Trauma Center', group: 'O-', units: 2, priority: 'Immediate P1', time: '4 mins ago', status: 'En Route' },
  { id: 'SOS-802', hospital: 'General Emergency Care', group: 'AB-', units: 1, priority: 'Urgent P2', time: '18 mins ago', status: 'Delivered' }
];

let recoveryAssets = [
  { id: 1, phase: 'Immediate (0-24 Hours)', category: 'Primary Medical / Equipment', item: 'Emergency blood transfusion (O-negative)', urgency: 'CRITICAL', status: 'Allocated' },
  { id: 2, phase: 'Immediate (0-24 Hours)', category: 'Primary Medical / Equipment', item: 'Haemorrhage control (tourniquets, pressure dressings)', urgency: 'CRITICAL', status: 'In Transit' },
  { id: 3, phase: 'Immediate (0-24 Hours)', category: 'Primary Medical / Equipment', item: 'Airway stabilization (intubation, oxygen masks)', urgency: 'CRITICAL', status: 'Delivered' },
  { id: 4, phase: 'Acute Hospitalization', category: 'Hospitalization & Acute Care', item: 'Intensive Care Unit (ICU) specialized bed', urgency: 'HIGH', status: 'Allocated' },
  { id: 5, phase: 'Acute Hospitalization', category: 'Hospitalization & Acute Care', item: 'Step-down telemetry unit bed', urgency: 'HIGH', status: 'Requested' },
  { id: 6, phase: 'Discharge / Home Recovery', category: 'Durable Medical Equipment', item: 'Standard manual transport wheelchair', urgency: 'MEDIUM', status: 'Pending' },
  { id: 7, phase: 'Ongoing Home Recovery', category: 'Pharmaceuticals & Supplies', item: 'Prescription oral opioid medications & pain therapy', urgency: 'HIGH', status: 'Dispatched' },
  { id: 8, phase: 'Rehabilitation Phase', category: 'Therapeutic & Rehabilitation', item: 'Outpatient physical therapy sessions', urgency: 'MEDIUM', status: 'Scheduled' }
];

app.get('/api/blood-inventory', (req, res) => {
  res.json({ success: true, data: bloodInventory });
});

app.get('/api/sos-logs', (req, res) => {
  res.json({ success: true, data: sosDispatches });
});

app.post('/api/sos-dispatch', (req, res) => {
  const { hospital, group, units, priority } = req.body;
  const stock = bloodInventory.find(b => b.group === group);
  if (stock) {
    stock.units = Math.max(0, stock.units - Number(units));
    if (stock.units <= 3) stock.status = 'Critical Shortage';
  }

  const newLog = {
    id: `SOS-${Math.floor(100 + Math.random() * 900)}`,
    hospital,
    group,
    units: Number(units),
    priority: priority || 'Immediate P1',
    time: 'Just now',
    status: 'Dispatched'
  };

  sosDispatches.unshift(newLog);
  res.status(201).json({ success: true, dispatch: newLog, stock: bloodInventory });
});

app.get('/api/recovery-assets', (req, res) => {
  res.json({ success: true, data: recoveryAssets });
});

app.post('/api/triage-analyzer', (req, res) => {
  const { text } = req.body;
  const lower = (text || '').toLowerCase();
  const critical = lower.includes('bleed') || lower.includes('shock') || lower.includes('fracture') || lower.includes('arterial');

  res.json({
    success: true,
    protocol: {
      severityScore: critical ? 'Level 1 - Code Red Resuscitation' : 'Level 3 - Urgent Delayed Protocol',
      bloodNeed: critical ? 'Immediate 3 Units O-Negative + 2 Units Fresh Frozen Plasma' : 'Standard Cross-Match Protocol',
      criticalInterventions: [
        'Immediate surgical haemorrhage control & arterial line placement',
        'Reserve ICU Bed #04 with mechanical ventilation telemetry',
        'Requisition post-op vacuum wound therapy (NPWT) & splinting'
      ]
    }
  });
});

app.listen(PORT, () => {
  console.log(`TraumaPulse Core API listening on port ${PORT}`);
});
