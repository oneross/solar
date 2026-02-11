// calculator.js — Pure financial math, no DOM dependencies

import { DEFAULTS } from './data.js';

/**
 * Annual solar production for a given year, accounting for degradation.
 * Year 0 = first full year of operation.
 */
export function annualProduction(systemSizeKW, productionPerKW, year, degradation = DEFAULTS.degradation, yearOneDeg = DEFAULTS.yearOneDegradation) {
  const base = systemSizeKW * productionPerKW;
  if (year === 0) return base * (1 - yearOneDeg / 100);
  return base * (1 - yearOneDeg / 100) * Math.pow(1 - degradation / 100, year);
}

/**
 * Utility cost for a given year (what you'd pay without solar).
 */
export function utilityCost(annualKWh, ratePerKWh, rateEscalation, year) {
  return annualKWh * ratePerKWh * Math.pow(1 + rateEscalation / 100, year);
}

/**
 * SREC-II income for a given year.
 * Returns 0 if year >= srecTerm.
 */
export function srecIncome(productionKWh, srecRate, year, srecTerm = DEFAULTS.srecTerm) {
  if (year >= srecTerm) return 0;
  return (productionKWh / 1000) * srecRate;
}

/**
 * Monthly loan payment (standard amortization).
 */
export function monthlyLoanPayment(principal, annualRate, termYears) {
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Total interest paid over loan term.
 */
export function totalLoanInterest(principal, annualRate, termYears) {
  const monthly = monthlyLoanPayment(principal, annualRate, termYears);
  return (monthly * termYears * 12) - principal;
}

/**
 * Calculate all scenarios over the analysis period.
 * Returns an object with yearly arrays for each scenario.
 */
export function calculateAllScenarios(params = {}) {
  const p = { ...DEFAULTS, ...params };
  const years = p.analysisPeriod;
  const systemCost = p.systemSize * p.costPerWatt * 1000;

  const results = {
    years: Array.from({ length: years + 1 }, (_, i) => i),
    cash: calculateCashScenario(p, systemCost, years),
    loan: calculateLoanScenario(p, systemCost, years),
    ppa: calculatePPAScenario(p, years),
    lease: calculateLeaseScenario(p, years),
    doNothing: calculateDoNothingScenario(p, years),
    params: p,
    systemCost,
  };

  // Summary metrics
  results.summary = {
    cash: scenarioSummary(results.cash, years, p.discountRate),
    loan: scenarioSummary(results.loan, years, p.discountRate),
    ppa: scenarioSummary(results.ppa, years, p.discountRate),
    lease: scenarioSummary(results.lease, years, p.discountRate),
    doNothing: scenarioSummary(results.doNothing, years, p.discountRate),
  };

  return results;
}

function calculateCashScenario(p, systemCost, years) {
  const data = {
    annualCost: [],
    annualSavings: [],
    srecIncome: [],
    cumulativeCost: [],
    netAnnual: [],
    label: 'Cash Purchase',
  };

  let cumulative = systemCost; // upfront cost at year 0

  for (let y = 0; y <= years; y++) {
    const prod = annualProduction(p.systemSize, p.solarProduction, y, p.degradation, p.yearOneDegradation);
    const utilSaved = prod * p.electricityRate * Math.pow(1 + p.rateEscalation / 100, y);
    const srec = srecIncome(prod, p.srecRate, y, p.srecTerm);

    // Remaining utility cost if system doesn't cover 100%
    const totalUtil = utilityCost(p.annualConsumption, p.electricityRate, p.rateEscalation, y);
    const netUtilCost = Math.max(0, totalUtil - utilSaved);

    const annualNet = y === 0 ? systemCost + netUtilCost - srec : netUtilCost - srec;

    if (y > 0) {
      cumulative += netUtilCost - srec;
    }

    data.annualCost.push(y === 0 ? systemCost + netUtilCost : netUtilCost);
    data.annualSavings.push(utilSaved);
    data.srecIncome.push(srec);
    data.cumulativeCost.push(cumulative);
    data.netAnnual.push(annualNet);
  }

  return data;
}

function calculateLoanScenario(p, systemCost, years) {
  const data = {
    annualCost: [],
    annualSavings: [],
    srecIncome: [],
    cumulativeCost: [],
    netAnnual: [],
    label: 'Solar Loan',
  };

  const monthly = monthlyLoanPayment(systemCost, p.loanAPR, p.loanTerm);
  const annualPayment = monthly * 12;
  let cumulative = 0;

  for (let y = 0; y <= years; y++) {
    const prod = annualProduction(p.systemSize, p.solarProduction, y, p.degradation, p.yearOneDegradation);
    const utilSaved = prod * p.electricityRate * Math.pow(1 + p.rateEscalation / 100, y);
    const srec = srecIncome(prod, p.srecRate, y, p.srecTerm);
    const totalUtil = utilityCost(p.annualConsumption, p.electricityRate, p.rateEscalation, y);
    const netUtilCost = Math.max(0, totalUtil - utilSaved);

    const loanCost = y < p.loanTerm ? annualPayment : 0;
    const annualNet = loanCost + netUtilCost - srec;
    cumulative += annualNet;

    data.annualCost.push(loanCost + netUtilCost);
    data.annualSavings.push(utilSaved);
    data.srecIncome.push(srec);
    data.cumulativeCost.push(cumulative);
    data.netAnnual.push(annualNet);
  }

  return data;
}

function calculatePPAScenario(p, years) {
  const data = {
    annualCost: [],
    annualSavings: [],
    srecIncome: [],
    cumulativeCost: [],
    netAnnual: [],
    label: 'PPA',
  };

  let cumulative = 0;

  for (let y = 0; y <= years; y++) {
    const prod = annualProduction(p.systemSize, p.solarProduction, y, p.degradation, p.yearOneDegradation);
    const ppaRateYear = p.ppaRate * Math.pow(1 + p.ppaEscalator / 100, y);
    const ppaCost = prod * ppaRateYear;

    // Remaining utility for uncovered consumption
    const totalUtil = utilityCost(p.annualConsumption, p.electricityRate, p.rateEscalation, y);
    const utilSaved = prod * p.electricityRate * Math.pow(1 + p.rateEscalation / 100, y);
    const netUtilCost = Math.max(0, totalUtil - utilSaved);

    const annualNet = ppaCost + netUtilCost; // No SREC for homeowner in PPA
    cumulative += annualNet;

    data.annualCost.push(ppaCost + netUtilCost);
    data.annualSavings.push(utilSaved);
    data.srecIncome.push(0);
    data.cumulativeCost.push(cumulative);
    data.netAnnual.push(annualNet);
  }

  return data;
}

function calculateLeaseScenario(p, years) {
  const data = {
    annualCost: [],
    annualSavings: [],
    srecIncome: [],
    cumulativeCost: [],
    netAnnual: [],
    label: 'Lease',
  };

  let cumulative = 0;

  for (let y = 0; y <= years; y++) {
    const prod = annualProduction(p.systemSize, p.solarProduction, y, p.degradation, p.yearOneDegradation);
    const leaseAnnual = p.leaseMonthly * 12 * Math.pow(1 + p.leaseEscalator / 100, y);

    const totalUtil = utilityCost(p.annualConsumption, p.electricityRate, p.rateEscalation, y);
    const utilSaved = prod * p.electricityRate * Math.pow(1 + p.rateEscalation / 100, y);
    const netUtilCost = Math.max(0, totalUtil - utilSaved);

    const annualNet = leaseAnnual + netUtilCost;
    cumulative += annualNet;

    data.annualCost.push(leaseAnnual + netUtilCost);
    data.annualSavings.push(utilSaved);
    data.srecIncome.push(0);
    data.cumulativeCost.push(cumulative);
    data.netAnnual.push(annualNet);
  }

  return data;
}

function calculateDoNothingScenario(p, years) {
  const data = {
    annualCost: [],
    annualSavings: [],
    srecIncome: [],
    cumulativeCost: [],
    netAnnual: [],
    label: 'Do Nothing (Utility Only)',
  };

  let cumulative = 0;

  for (let y = 0; y <= years; y++) {
    const cost = utilityCost(p.annualConsumption, p.electricityRate, p.rateEscalation, y);
    cumulative += cost;

    data.annualCost.push(cost);
    data.annualSavings.push(0);
    data.srecIncome.push(0);
    data.cumulativeCost.push(cumulative);
    data.netAnnual.push(cost);
  }

  return data;
}

/**
 * NPV of a cash flow array at given discount rate.
 */
export function netPresentValue(cashFlows, discountRate) {
  const r = discountRate / 100;
  return cashFlows.reduce((npv, cf, t) => npv + cf / Math.pow(1 + r, t), 0);
}

/**
 * Year where cumulative cost of scenario < cumulative cost of do-nothing.
 * Returns null if never breaks even.
 */
export function breakEvenYear(scenarioCumulative, doNothingCumulative) {
  for (let y = 0; y < scenarioCumulative.length; y++) {
    if (scenarioCumulative[y] <= doNothingCumulative[y]) return y;
  }
  return null;
}

/**
 * Home sale impact: net cost if you sell in year X.
 * For owned systems: value added to home (Zillow: ~4.1% premium).
 * For PPA/lease: buyout cost required.
 */
export function homeSaleImpact(results, sellYear) {
  const p = results.params;
  const systemCost = results.systemCost;

  const owned = {
    cumulativePaid: results.cash.cumulativeCost[sellYear],
    srecEarned: results.cash.srecIncome.slice(0, sellYear + 1).reduce((a, b) => a + b, 0),
    homeValueAdd: systemCost * 0.7 * Math.max(0, 1 - sellYear / 25), // Depreciating asset
    netCost: 0,
  };
  owned.netCost = owned.cumulativePaid - owned.homeValueAdd;

  const leased = {
    cumulativePaid: results.lease.cumulativeCost[sellYear],
    buyoutCost: estimateBuyout(p.leaseMonthly * 12, p.leaseEscalator, sellYear, p.analysisPeriod),
    transferRisk: sellYear < 10 ? 'High' : sellYear < 18 ? 'Medium' : 'Low',
    netCost: 0,
  };
  leased.netCost = leased.cumulativePaid + leased.buyoutCost;

  return { owned, leased, doNothing: results.doNothing.cumulativeCost[sellYear] };
}

function estimateBuyout(firstYearLease, escalator, sellYear, totalTerm) {
  // Estimate remaining value: NPV of remaining lease payments
  let remaining = 0;
  for (let y = sellYear; y < totalTerm; y++) {
    remaining += firstYearLease * Math.pow(1 + escalator / 100, y);
  }
  return remaining * 0.6; // Typical buyout is ~60% of remaining payments
}

function scenarioSummary(scenario, years, discountRate) {
  const totalCost = scenario.cumulativeCost[years];
  const totalSREC = scenario.srecIncome.reduce((a, b) => a + b, 0);
  const npv = netPresentValue(scenario.netAnnual, discountRate);

  return { totalCost, totalSREC, npv };
}

/**
 * Format currency.
 */
export function fmt(value, decimals = 0) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format number with commas.
 */
export function fmtNum(value, decimals = 0) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
