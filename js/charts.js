// charts.js — Chart.js rendering with dark theme

import { CHART_COLORS } from './data.js';
import { fmt, breakEvenYear, netPresentValue, homeSaleImpact } from './calculator.js';

const C = CHART_COLORS;

function tooltipLabel(ctx) {
  const val = ctx.parsed.y !== undefined ? ctx.parsed.y : ctx.parsed.x;
  return `${ctx.dataset.label}: ${fmt(val)}`;
}

function yTickFmt(v) { return fmt(v); }
function yTickFmtMonthly(v) { return fmt(v) + '/mo'; }

function basePlugins(legendDisplay = true) {
  return {
    legend: {
      display: legendDisplay,
      labels: { color: C.text, font: { size: 11 }, boxWidth: 12, padding: 16 },
    },
    tooltip: {
      backgroundColor: C.tooltipBg,
      titleColor: '#e2e8f0',
      bodyColor: '#e2e8f0',
      borderColor: C.grid,
      borderWidth: 1,
      padding: 10,
      displayColors: true,
      mode: 'index',
      intersect: false,
      callbacks: { label: tooltipLabel },
    },
  };
}

function xScale() {
  return { grid: { color: C.grid, drawBorder: false }, ticks: { color: C.text, font: { size: 11 } } };
}
function yScale(cb) {
  return { grid: { color: C.grid, drawBorder: false }, ticks: { color: C.text, font: { size: 11 }, callback: cb || yTickFmt } };
}

let charts = {};

export function createCharts() {
  Object.values(charts).forEach(c => c.destroy?.());
  charts = {};

  charts.cumulative = new Chart(document.getElementById('chart-cumulative'), {
    type: 'line',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: basePlugins(),
      scales: { x: xScale(), y: yScale() },
    },
  });

  charts.cashflow = new Chart(document.getElementById('chart-cashflow'), {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: basePlugins(),
      scales: { x: xScale(), y: yScale() },
    },
  });

  charts.total = new Chart(document.getElementById('chart-total'), {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true, maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: basePlugins(false),
      scales: {
        x: { grid: { color: C.grid, drawBorder: false }, ticks: { color: C.text, font: { size: 11 }, callback: yTickFmt } },
        y: { grid: { display: false }, ticks: { color: C.text, font: { size: 11 } } },
      },
    },
  });

  charts.monthly = new Chart(document.getElementById('chart-monthly'), {
    type: 'line',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: basePlugins(),
      scales: { x: xScale(), y: yScale(yTickFmtMonthly) },
    },
  });

  charts.npv = new Chart(document.getElementById('chart-npv'), {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true, maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: basePlugins(false),
      scales: {
        x: { grid: { color: C.grid, drawBorder: false }, ticks: { color: C.text, font: { size: 11 }, callback: yTickFmt } },
        y: { grid: { display: false }, ticks: { color: C.text, font: { size: 11 } } },
      },
    },
  });

  charts.homesale = new Chart(document.getElementById('chart-homesale'), {
    type: 'line',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: basePlugins(),
      scales: { x: xScale(), y: yScale() },
    },
  });

  return charts;
}

export function updateCharts(results) {
  const labels = results.years.map(y => `Yr ${y}`);

  // Chart 1: Cumulative Cost
  charts.cumulative.data = {
    labels,
    datasets: [
      { label: 'Cash', data: results.cash.cumulativeCost, borderColor: C.cash, fill: false, tension: 0.3, pointRadius: 0 },
      { label: 'Loan', data: results.loan.cumulativeCost, borderColor: C.loan, fill: false, tension: 0.3, pointRadius: 0 },
      { label: 'PPA', data: results.ppa.cumulativeCost, borderColor: C.ppa, fill: false, tension: 0.3, pointRadius: 0 },
      { label: 'Lease', data: results.lease.cumulativeCost, borderColor: C.lease, fill: false, tension: 0.3, pointRadius: 0 },
      { label: 'Utility Only', data: results.doNothing.cumulativeCost, borderColor: C.doNothing, fill: false, tension: 0.3, pointRadius: 0, borderDash: [6, 3] },
    ],
  };
  charts.cumulative.update('none');

  // Chart 2: Annual Cash Flow (cash scenario)
  charts.cashflow.data = {
    labels,
    datasets: [
      { label: 'Utility Cost (remaining)', data: results.cash.annualCost.map((c, i) => i === 0 ? c - results.systemCost : c), backgroundColor: C.doNothing + '80' },
      { label: 'SREC Income', data: results.cash.srecIncome.map(v => -v), backgroundColor: C.cash + '80' },
      { label: 'Net Annual', data: results.cash.netAnnual, type: 'line', borderColor: C.loan, fill: false, tension: 0.3, pointRadius: 0, order: 0 },
    ],
  };
  charts.cashflow.update('none');

  // Chart 3: Total Cost Horizontal Bar
  const scenarios = ['Cash', 'Loan', 'PPA', 'Lease', 'Utility Only'];
  charts.total.data = {
    labels: scenarios,
    datasets: [{
      data: [
        results.summary.cash.totalCost,
        results.summary.loan.totalCost,
        results.summary.ppa.totalCost,
        results.summary.lease.totalCost,
        results.summary.doNothing.totalCost,
      ],
      backgroundColor: [C.cash + 'CC', C.loan + 'CC', C.ppa + 'CC', C.lease + 'CC', C.doNothing + 'CC'],
      borderColor: [C.cash, C.loan, C.ppa, C.lease, C.doNothing],
      borderWidth: 1,
    }],
  };
  charts.total.update('none');

  // Chart 4: Monthly Payment Timeline
  charts.monthly.data = {
    labels,
    datasets: [
      { label: 'Utility Only', data: results.doNothing.annualCost.map(c => c / 12), borderColor: C.doNothing, borderDash: [6, 3], fill: false, tension: 0.3, pointRadius: 0 },
      { label: 'Loan', data: results.loan.annualCost.map(c => c / 12), borderColor: C.loan, fill: false, tension: 0.3, pointRadius: 0 },
      { label: 'PPA', data: results.ppa.annualCost.map(c => c / 12), borderColor: C.ppa, fill: false, tension: 0.3, pointRadius: 0 },
      { label: 'Lease', data: results.lease.annualCost.map(c => c / 12), borderColor: C.lease, fill: false, tension: 0.3, pointRadius: 0 },
    ],
  };
  charts.monthly.update('none');

  // Chart 5: NPV
  charts.npv.data = {
    labels: scenarios,
    datasets: [{
      data: [
        results.summary.cash.npv,
        results.summary.loan.npv,
        results.summary.ppa.npv,
        results.summary.lease.npv,
        results.summary.doNothing.npv,
      ],
      backgroundColor: [C.cash + 'CC', C.loan + 'CC', C.ppa + 'CC', C.lease + 'CC', C.doNothing + 'CC'],
      borderColor: [C.cash, C.loan, C.ppa, C.lease, C.doNothing],
      borderWidth: 1,
    }],
  };
  charts.npv.update('none');

  return charts;
}

export function updateHomeSaleChart(results) {
  const maxYear = results.params.analysisPeriod;
  const labels = [];
  const ownedData = [];
  const leasedData = [];
  const nothingData = [];

  for (let y = 1; y <= maxYear; y++) {
    labels.push(`Yr ${y}`);
    const impact = homeSaleImpact(results, y);
    ownedData.push(impact.owned.netCost);
    leasedData.push(impact.leased.netCost);
    nothingData.push(impact.doNothing);
  }

  charts.homesale.data = {
    labels,
    datasets: [
      { label: 'Owned (Cash)', data: ownedData, borderColor: C.cash, fill: false, tension: 0.3, pointRadius: 0 },
      { label: 'Leased', data: leasedData, borderColor: C.lease, fill: false, tension: 0.3, pointRadius: 0 },
      { label: 'Utility Only', data: nothingData, borderColor: C.doNothing, borderDash: [6, 3], fill: false, tension: 0.3, pointRadius: 0 },
    ],
  };
  charts.homesale.update('none');
}

export function getCharts() {
  return charts;
}
