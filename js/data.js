// data.js — Provider data, calculator defaults, presets, questions, red flags

export const PROVIDERS = [
  {
    id: 'trinityNJ',
    name: 'Trinity Solar',
    tier: 1,
    tierLabel: 'Recommended',
    location: 'Wall Township, NJ (~65mi)',
    google: { rating: 4.2, count: 3500 },
    founded: 1994,
    highlights: [
      'Largest NJ installer — 30+ years',
      'In-house installation crews',
      'Strong PPA/lease offerings',
      'BBB A+ rated'
    ],
    panels: 'REC, Canadian Solar',
    inverters: 'Enphase IQ8',
    warranty: '25yr performance, 10yr workmanship',
    financing: ['PPA', 'Lease', 'Loan', 'Cash'],
    concerns: ['Some inconsistent post-install service reports', 'High-volume may mean less personalized attention'],
    website: 'https://www.trinitysolar.com'
  },
  {
    id: 'publicService',
    name: 'Public Service Solar',
    tier: 1,
    tierLabel: 'Recommended',
    location: 'Burlington, NJ (~70mi)',
    google: { rating: 4.7, count: 176 },
    founded: 2015,
    highlights: [
      'EnergySage Elite+ installer',
      'In-house crews (no subcontractors)',
      'Lifetime workmanship warranty',
      'Transparent pricing, no high-pressure sales'
    ],
    panels: 'REC Alpha, Q Cells',
    inverters: 'Enphase IQ8+',
    warranty: '25yr panel, lifetime workmanship',
    financing: ['Loan', 'Cash'],
    concerns: ['Farther from Bergen County', 'Smaller company — capacity limits'],
    website: 'https://www.publicservicesolar.com'
  },
  {
    id: 'greenHouse',
    name: 'Green House Solar',
    tier: 2,
    tierLabel: 'Consider',
    location: 'Madison, NJ (~25mi)',
    google: { rating: 4.5, count: 85 },
    founded: 2009,
    highlights: [
      'NABCEP-certified installers',
      'SunPower Maxeon panels available',
      'Closest to Bergen County',
      'Strong local reputation'
    ],
    panels: 'SunPower Maxeon, REC',
    inverters: 'Enphase, SolarEdge',
    warranty: '25yr panel, 10yr workmanship',
    financing: ['Loan', 'Cash', 'Lease'],
    concerns: ['Smaller team', 'Premium pricing with SunPower panels'],
    website: 'https://www.greenhousesolar.com'
  },
  {
    id: 'teslaSolar',
    name: 'Tesla Solar',
    tier: 3,
    tierLabel: 'National',
    location: 'National (remote design)',
    google: { rating: 3.5, count: 2000 },
    founded: 2016,
    highlights: [
      'Lowest $/W in market (~$2.00/W)',
      'Powerwall battery integration',
      'Strong brand & financial stability',
      'Sleek panel aesthetics'
    ],
    panels: 'Tesla T-Series (rebranded)',
    inverters: 'Tesla (string)',
    warranty: '25yr panel, 10yr system',
    financing: ['Cash', 'Loan'],
    concerns: ['6-12 month install timelines', 'Poor customer service ratings', 'No local presence', 'String inverters (not micro)'],
    website: 'https://www.tesla.com/solarpanels'
  },
  {
    id: 'sunrun',
    name: 'SunRun',
    tier: 4,
    tierLabel: 'Avoid',
    location: 'National',
    google: { rating: 1.5, count: 5000 },
    founded: 2007,
    highlights: [
      'Largest US residential solar company',
      'Vivint Solar acquisition (2020)',
    ],
    panels: 'Various',
    inverters: 'Various',
    warranty: '20yr PPA/lease',
    financing: ['PPA', 'Lease'],
    concerns: [
      'Deceptive sales practices lawsuit',
      '1-star dominant Google reviews',
      'Terrible post-sale support',
      'Aggressive door-to-door sales',
      'Difficult lease transfer on home sale'
    ],
    website: 'https://www.sunrun.com'
  },
  {
    id: 'momentum',
    name: 'Momentum Solar',
    tier: 4,
    tierLabel: 'Avoid',
    location: 'South Plainfield, NJ (~30mi)',
    google: { rating: 2.66, count: 482 },
    founded: 2009,
    highlights: [
      'NJ-based company',
    ],
    panels: 'Various',
    inverters: 'Various',
    warranty: '25yr panel, limited workmanship',
    financing: ['PPA', 'Lease', 'Loan'],
    concerns: [
      'Aggressive telemarketing spam',
      'Misleading savings claims',
      '2.66 Google rating (482 reviews)',
      'BBB complaint volume',
      'High-pressure sales tactics'
    ],
    website: 'https://www.momentumsolar.com'
  },
  {
    id: 'solarMe',
    name: 'Solar Me',
    tier: 2,
    tierLabel: 'Consider',
    location: 'Paramus, NJ (~5mi)',
    google: { rating: 4.8, count: 120 },
    founded: 2010,
    highlights: [
      'Closest to Hawthorne — Bergen County based',
      'High Google rating',
      'Local knowledge of NJ incentives',
      'Responsive communication'
    ],
    panels: 'REC, Canadian Solar, Silfab',
    inverters: 'Enphase IQ8',
    warranty: '25yr panel, 10yr workmanship',
    financing: ['Loan', 'Cash', 'PPA'],
    concerns: ['Smaller operation', 'Less track record than larger installers'],
    website: 'https://www.solarmeus.com'
  }
];

export const DEFAULTS = {
  systemSize: 8,          // kW
  costPerWatt: 2.90,      // $/W
  electricityRate: 0.225,  // $/kWh (PSE&G)
  rateEscalation: 3.5,    // %/yr
  annualConsumption: 8500, // kWh
  solarProduction: 1150,   // kWh/kW/yr (Northern NJ)
  loanAPR: 7.0,           // %
  loanTerm: 20,           // years
  ppaRate: 0.15,          // $/kWh
  ppaEscalator: 1.99,     // %/yr
  leaseMonthly: 120,      // $/month
  leaseEscalator: 2.9,    // %/yr
  srecRate: 85,           // $/MWh
  srecTerm: 15,           // years
  degradation: 0.5,       // %/yr
  yearOneDegradation: 2,  // %
  analysisPeriod: 25,     // years
  buyoutYear: 10,         // year
  buyoutCost: 12000,      // $
  discountRate: 5,        // % for NPV
  homeValuePremium: 4.1,  // % increase per $1 electricity savings (Zillow)
};

export const SLIDER_RANGES = {
  systemSize:       { min: 3,     max: 15,    step: 0.5,   unit: 'kW' },
  costPerWatt:      { min: 2.00,  max: 4.50,  step: 0.05,  unit: '$/W' },
  electricityRate:  { min: 0.10,  max: 0.40,  step: 0.005, unit: '$/kWh' },
  rateEscalation:   { min: 1,     max: 8,     step: 0.5,   unit: '%/yr' },
  annualConsumption: { min: 4000, max: 20000, step: 500,   unit: 'kWh' },
  loanAPR:          { min: 3,     max: 12,    step: 0.25,  unit: '%' },
  loanTerm:         { min: 10,    max: 25,    step: 1,     unit: 'yr' },
  ppaRate:          { min: 0.08,  max: 0.25,  step: 0.01,  unit: '$/kWh' },
  ppaEscalator:     { min: 0,     max: 5,     step: 0.1,   unit: '%/yr' },
  leaseMonthly:     { min: 50,    max: 300,   step: 10,    unit: '$/mo' },
  leaseEscalator:   { min: 0,     max: 5,     step: 0.1,   unit: '%/yr' },
  srecRate:         { min: 50,    max: 120,   step: 0.5,   unit: '$/MWh' },
  degradation:      { min: 0.25,  max: 1.0,   step: 0.05,  unit: '%/yr' },
  analysisPeriod:   { min: 15,    max: 30,    step: 1,     unit: 'yr' },
  buyoutYear:       { min: 3,     max: 20,    step: 1,     unit: 'yr' },
  buyoutCost:       { min: 3000,  max: 30000, step: 500,   unit: '$' },
};

export const PRESETS = {
  conservative: {
    label: 'Conservative',
    description: 'Higher costs, lower savings assumptions',
    values: {
      costPerWatt: 3.50,
      electricityRate: 0.20,
      rateEscalation: 2.5,
      solarProduction: 1050,
      loanAPR: 8.5,
      ppaRate: 0.18,
      ppaEscalator: 2.9,
      leaseMonthly: 160,
      srecRate: 76.50,
      degradation: 0.7,
    }
  },
  moderate: {
    label: 'Moderate',
    description: 'Balanced — current market conditions',
    values: {
      costPerWatt: 2.90,
      electricityRate: 0.225,
      rateEscalation: 3.5,
      solarProduction: 1150,
      loanAPR: 7.0,
      ppaRate: 0.15,
      ppaEscalator: 1.99,
      leaseMonthly: 120,
      srecRate: 85,
      degradation: 0.5,
    }
  },
  aggressive: {
    label: 'Aggressive',
    description: 'Lower costs, higher savings — best-case',
    values: {
      costPerWatt: 2.50,
      electricityRate: 0.25,
      rateEscalation: 5.0,
      solarProduction: 1250,
      loanAPR: 5.5,
      ppaRate: 0.12,
      ppaEscalator: 0.99,
      leaseMonthly: 90,
      srecRate: 85,
      degradation: 0.4,
    }
  }
};

export const QUESTIONS = [
  {
    category: 'System & Equipment',
    items: [
      'What panel brand/model and wattage do you recommend?',
      'Microinverters or string inverter? Which brand?',
      'What is the total system size (kW) and expected annual production (kWh)?',
      'Do you use in-house crews or subcontractors?',
      'What is your NABCEP certification status?',
      'How do you handle roof penetrations and waterproofing?',
    ]
  },
  {
    category: 'Financial Terms',
    items: [
      'What is the all-in cost per watt (before/after any incentives)?',
      'For PPA: what is the starting rate and annual escalator?',
      'For lease: what is the monthly payment and escalator?',
      'Who files for and receives the SREC-II credits?',
      'Is there a dealer fee built into the loan pricing?',
      'What happens to my rate if I produce less than projected?',
    ]
  },
  {
    category: 'Warranty & Service',
    items: [
      'What does the workmanship warranty cover and for how long?',
      'Who handles warranty claims — you or the manufacturer?',
      'What is your average response time for service calls?',
      'Do you provide production monitoring? Which platform?',
      'What happens if your company goes out of business?',
    ]
  },
  {
    category: 'Home Sale & Transfer',
    items: [
      'Can the PPA/lease be transferred to a new homeowner?',
      'What is the transfer process and are there fees?',
      'What is the buyout schedule? Can I see the full table?',
      'What if the buyer refuses to assume the agreement?',
      'Does the system affect my homeowner\'s insurance?',
    ]
  },
  {
    category: 'Timeline & Process',
    items: [
      'What is your typical timeline from contract to power-on?',
      'How long does permitting take in Hawthorne/Ramsey?',
      'Do you handle all permitting and utility interconnection?',
      'What is the cancellation policy and cooling-off period?',
      'Can I see references from installations in Bergen County?',
    ]
  },
  {
    category: 'NJ-Specific',
    items: [
      'Are you registered with the NJ BPU as a solar installer?',
      'How do you handle SREC-II registration and sales?',
      'Are you familiar with PSE&G net metering policies?',
      'Will you help file the NJ sales tax exemption?',
      'What is your experience with NJ property tax exemption?',
    ]
  }
];

export const RED_FLAGS = [
  {
    flag: 'Pressure to sign today / "limited time" offers',
    severity: 'high',
    explanation: 'Legitimate solar companies give you time to compare. NJ has a 3-day cooling-off period by law.'
  },
  {
    flag: 'Won\'t provide written contract before signing',
    severity: 'high',
    explanation: 'You should always review the full contract at home before committing.'
  },
  {
    flag: 'Claims you\'ll get the federal tax credit (ITC)',
    severity: 'high',
    explanation: 'The residential ITC was eliminated January 1, 2026. Only TPO providers can claim Section 48E.'
  },
  {
    flag: 'Promises specific dollar savings without seeing your roof/bills',
    severity: 'high',
    explanation: 'Accurate projections require shade analysis, roof assessment, and actual consumption data.'
  },
  {
    flag: 'Uses subcontractors for installation',
    severity: 'medium',
    explanation: 'Not disqualifying, but in-house crews typically deliver better quality and accountability.'
  },
  {
    flag: 'Vague about who receives SREC-II income',
    severity: 'medium',
    explanation: 'With PPA/lease, the company typically keeps SRECs. With purchase/loan, you should receive them.'
  },
  {
    flag: 'No local office or all-remote operations',
    severity: 'medium',
    explanation: 'Local presence matters for service calls and long-term support.'
  },
  {
    flag: 'Escalator above 2.9%/year on PPA or lease',
    severity: 'medium',
    explanation: 'Escalators above 2.9% may cause solar costs to exceed utility rates within the contract term.'
  },
  {
    flag: 'Company less than 5 years old with no references',
    severity: 'low',
    explanation: 'Solar is a 25-year commitment. Company longevity and financial health matter.'
  },
  {
    flag: 'Door-to-door sales with aggressive follow-up',
    severity: 'low',
    explanation: 'Reputable installers rely on referrals and online quotes, not cold-calling.'
  }
];

export const INDUSTRY_CONTEXT = [
  { company: 'SunPower', event: 'Chapter 11 bankruptcy', date: 'August 2024' },
  { company: 'Sunnova', event: 'Chapter 11 bankruptcy', date: 'June 2025' },
  { company: 'PosiGen', event: 'Chapter 11 bankruptcy', date: 'November 2025' },
  { company: 'Mosaic (lender)', event: 'Chapter 11 bankruptcy', date: 'June 2025' },
];

export const CHART_COLORS = {
  cash: '#22c55e',      // green-500
  loan: '#3b82f6',      // blue-500
  ppa: '#f59e0b',       // amber-500
  lease: '#a855f7',     // purple-500
  doNothing: '#ef4444', // red-500
  grid: '#334155',      // slate-700
  text: '#94a3b8',      // slate-400
  tooltipBg: '#1e293b', // slate-800
};
