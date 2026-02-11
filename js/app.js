// app.js — State management, DOM bindings, interactivity

import { PROVIDERS, DEFAULTS, SLIDER_RANGES, PRESETS, QUESTIONS, RED_FLAGS } from './data.js';
import { calculateAllScenarios, breakEvenYear, homeSaleImpact, fmt, fmtNum } from './calculator.js';
import { createCharts, updateCharts, updateHomeSaleChart } from './charts.js';

// ─── State ────────────────────────────────────────────────────────
let state = { ...DEFAULTS };
let results = null;
let savedScenarios = JSON.parse(localStorage.getItem('solar-scenarios') || '[]');
let checklistState = JSON.parse(localStorage.getItem('solar-checklist') || '{}');

// ─── Init ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSliders();
  renderProviders();
  renderChecklist();
  renderRedFlags();
  createCharts();
  recalculate();
  initScrollBehavior();
  initProviderFilters();
  initPresets();
  initScenarioSlots();
  initHomeSaleSlider();
  restoreSavedScenarios();
});

// ─── Slider ↔ Input Binding ──────────────────────────────────────
function initSliders() {
  document.querySelectorAll('.input-group[data-key]').forEach(group => {
    const key = group.dataset.key;
    const range = group.querySelector('input[type="range"]');
    const number = group.querySelector('input[type="number"]');
    if (!range || !number || !SLIDER_RANGES[key]) return;

    const cfg = SLIDER_RANGES[key];
    range.min = cfg.min;
    range.max = cfg.max;
    range.step = cfg.step;
    range.value = state[key];
    number.value = state[key];
    number.step = cfg.step;

    range.addEventListener('input', () => {
      const val = parseFloat(range.value);
      number.value = val;
      state[key] = val;
      debouncedRecalc();
    });

    number.addEventListener('input', () => {
      let val = parseFloat(number.value);
      if (isNaN(val)) return;
      val = Math.max(cfg.min, Math.min(cfg.max, val));
      range.value = val;
      state[key] = val;
      debouncedRecalc();
    });
  });
}

function syncSlidersToState() {
  document.querySelectorAll('.input-group[data-key]').forEach(group => {
    const key = group.dataset.key;
    const range = group.querySelector('input[type="range"]');
    const number = group.querySelector('input[type="number"]');
    if (!range || !number || state[key] === undefined) return;
    range.value = state[key];
    number.value = state[key];
  });
}

// ─── Debounced Recalculation ─────────────────────────────────────
let recalcTimer = null;
function debouncedRecalc() {
  clearTimeout(recalcTimer);
  recalcTimer = setTimeout(recalculate, 80);
}

function recalculate() {
  results = calculateAllScenarios(state);
  updateSummaryCards(results);
  updateCharts(results);
  updateHomeSale();
}

function updateSummaryCards(r) {
  const dn = r.doNothing.cumulativeCost;
  const period = r.params.analysisPeriod;

  document.getElementById('sum-cash').textContent = fmt(r.summary.cash.totalCost);
  document.getElementById('sum-loan').textContent = fmt(r.summary.loan.totalCost);
  document.getElementById('sum-ppa').textContent = fmt(r.summary.ppa.totalCost);
  document.getElementById('sum-lease').textContent = fmt(r.summary.lease.totalCost);
  document.getElementById('sum-nothing').textContent = fmt(r.summary.doNothing.totalCost);

  const cashBE = breakEvenYear(r.cash.cumulativeCost, dn);
  const loanBE = breakEvenYear(r.loan.cumulativeCost, dn);
  const ppaBE = breakEvenYear(r.ppa.cumulativeCost, dn);
  const leaseBE = breakEvenYear(r.lease.cumulativeCost, dn);

  document.getElementById('sum-cash-be').textContent = cashBE !== null ? `break-even yr ${cashBE}` : 'no break-even';
  document.getElementById('sum-loan-be').textContent = loanBE !== null ? `break-even yr ${loanBE}` : 'no break-even';
  document.getElementById('sum-ppa-be').textContent = ppaBE !== null ? `break-even yr ${ppaBE}` : 'no break-even';
  document.getElementById('sum-lease-be').textContent = leaseBE !== null ? `break-even yr ${leaseBE}` : 'no break-even';
}

// ─── Provider Cards ──────────────────────────────────────────────
function renderProviders(filter = 'all') {
  const grid = document.getElementById('provider-grid');
  const filtered = filter === 'all' ? PROVIDERS : PROVIDERS.filter(p => p.tier === parseInt(filter));

  // Sort by tier
  const sorted = [...filtered].sort((a, b) => a.tier - b.tier);

  grid.innerHTML = sorted.map(p => `
    <div class="provider-card bg-slate-800 rounded-lg border border-slate-700 overflow-hidden reveal visible" data-tier="${p.tier}">
      <div class="p-5">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-semibold text-white">${p.name}</h3>
            <p class="text-xs text-slate-500">${p.location}</p>
          </div>
          <span class="tier-${p.tier} text-xs font-medium px-2 py-1 rounded">${p.tierLabel}</span>
        </div>
        <div class="flex items-center gap-3 mb-3 text-sm">
          <span class="text-yellow-400">${'&#9733;'.repeat(Math.round(p.google.rating))}</span>
          <span class="text-slate-400">${p.google.rating} (${fmtNum(p.google.count)})</span>
        </div>
        <ul class="space-y-1 mb-3">
          ${p.highlights.map(h => `<li class="text-xs text-slate-400 flex gap-2"><span class="text-green-400 shrink-0">+</span>${h}</li>`).join('')}
        </ul>
        ${p.concerns.length ? `
        <ul class="space-y-1 mb-3">
          ${p.concerns.slice(0, 2).map(c => `<li class="text-xs text-slate-500 flex gap-2"><span class="text-red-400 shrink-0">-</span>${c}</li>`).join('')}
        </ul>` : ''}
        <button class="text-xs text-solar-500 hover:text-solar-400 mt-1" onclick="this.closest('.provider-card').querySelector('.provider-details').classList.toggle('open')">
          Show details
        </button>
      </div>
      <div class="provider-details border-t border-slate-700 px-5 bg-slate-800/50">
        <div class="grid grid-cols-2 gap-y-2 text-xs">
          <div><span class="text-slate-500">Panels:</span></div>
          <div class="text-slate-300">${p.panels}</div>
          <div><span class="text-slate-500">Inverters:</span></div>
          <div class="text-slate-300">${p.inverters}</div>
          <div><span class="text-slate-500">Warranty:</span></div>
          <div class="text-slate-300">${p.warranty}</div>
          <div><span class="text-slate-500">Financing:</span></div>
          <div class="text-slate-300">${p.financing.join(', ')}</div>
          <div><span class="text-slate-500">Founded:</span></div>
          <div class="text-slate-300">${p.founded}</div>
        </div>
        ${p.concerns.length > 2 ? `
        <div class="mt-3">
          <p class="text-xs text-slate-500 font-medium mb-1">All Concerns:</p>
          <ul class="space-y-1">
            ${p.concerns.map(c => `<li class="text-xs text-slate-500 flex gap-2"><span class="text-red-400 shrink-0">-</span>${c}</li>`).join('')}
          </ul>
        </div>` : ''}
      </div>
    </div>
  `).join('');
}

function initProviderFilters() {
  document.getElementById('provider-filters').addEventListener('click', e => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    document.querySelectorAll('#provider-filters button').forEach(b => {
      b.className = 'px-3 py-1 text-xs rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600';
    });
    btn.className = 'px-3 py-1 text-xs rounded-full bg-solar-500 text-slate-900 font-medium';
    renderProviders(btn.dataset.filter);
  });
}

// ─── Presets ─────────────────────────────────────────────────────
function initPresets() {
  document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = PRESETS[btn.dataset.preset];
      if (!preset) return;

      // Update state with preset values
      Object.entries(preset.values).forEach(([key, val]) => {
        if (state[key] !== undefined) state[key] = val;
      });
      syncSlidersToState();
      recalculate();

      // Update active button
      document.querySelectorAll('[data-preset]').forEach(b => {
        b.className = 'preset-btn px-4 py-2 text-sm rounded-lg bg-slate-700 text-slate-300 border border-slate-600 hover:border-solar-500';
      });
      btn.className = 'preset-btn px-4 py-2 text-sm rounded-lg bg-solar-500/20 text-solar-400 border border-solar-500 font-medium';
    });
  });
}

// ─── Scenario Save/Compare ──────────────────────────────────────
function initScenarioSlots() {
  document.getElementById('save-scenario').addEventListener('click', () => {
    if (savedScenarios.length >= 3) {
      savedScenarios.shift(); // Remove oldest
    }
    savedScenarios.push({
      state: { ...state },
      summary: results.summary,
      systemCost: results.systemCost,
      timestamp: Date.now(),
    });
    localStorage.setItem('solar-scenarios', JSON.stringify(savedScenarios));
    renderScenarioSlots();
  });
}

function restoreSavedScenarios() {
  renderScenarioSlots();
}

function renderScenarioSlots() {
  const container = document.getElementById('scenario-slots');
  const slots = container.querySelectorAll('.scenario-slot');

  slots.forEach((slot, i) => {
    const scenario = savedScenarios[i];
    if (!scenario) {
      slot.className = 'scenario-slot rounded-lg p-5 bg-slate-800 min-h-[200px] flex items-center justify-center';
      slot.innerHTML = '<span class="text-slate-500 text-sm">Empty — save a scenario</span>';
      return;
    }

    slot.className = 'scenario-slot filled rounded-lg p-5 bg-slate-800 min-h-[200px]';
    const s = scenario.summary;
    const dt = new Date(scenario.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    slot.innerHTML = `
      <div class="flex justify-between items-center mb-3">
        <span class="text-xs text-slate-500">Saved ${dt}</span>
        <button class="text-xs text-red-400 hover:text-red-300" data-remove="${i}">Remove</button>
      </div>
      <div class="text-xs text-slate-400 mb-2">${scenario.state.systemSize}kW @ ${fmt(scenario.state.costPerWatt, 2)}/W = ${fmt(scenario.systemCost)}</div>
      <div class="space-y-1 text-xs">
        <div class="flex justify-between"><span class="text-green-400">Cash</span><span>${fmt(s.cash.totalCost)}</span></div>
        <div class="flex justify-between"><span class="text-blue-400">Loan</span><span>${fmt(s.loan.totalCost)}</span></div>
        <div class="flex justify-between"><span class="text-amber-400">PPA</span><span>${fmt(s.ppa.totalCost)}</span></div>
        <div class="flex justify-between"><span class="text-purple-400">Lease</span><span>${fmt(s.lease.totalCost)}</span></div>
        <div class="flex justify-between"><span class="text-red-400">Utility</span><span>${fmt(s.doNothing.totalCost)}</span></div>
      </div>
      <button class="mt-3 text-xs text-solar-500 hover:text-solar-400" data-load="${i}">Load this scenario</button>
    `;
  });

  // Event delegation for remove/load
  container.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      savedScenarios.splice(parseInt(btn.dataset.remove), 1);
      localStorage.setItem('solar-scenarios', JSON.stringify(savedScenarios));
      renderScenarioSlots();
    });
  });

  container.querySelectorAll('[data-load]').forEach(btn => {
    btn.addEventListener('click', () => {
      const scenario = savedScenarios[parseInt(btn.dataset.load)];
      if (!scenario) return;
      state = { ...DEFAULTS, ...scenario.state };
      syncSlidersToState();
      recalculate();
    });
  });
}

// ─── Home Sale ──────────────────────────────────────────────────
function initHomeSaleSlider() {
  const slider = document.getElementById('sell-year-slider');
  const display = document.getElementById('sell-year-display');

  slider.addEventListener('input', () => {
    display.textContent = slider.value;
    updateHomeSale();
  });
}

function updateHomeSale() {
  if (!results) return;
  const sellYear = parseInt(document.getElementById('sell-year-slider').value);
  const impact = homeSaleImpact(results, sellYear);

  document.getElementById('hs-owned-paid').textContent = fmt(impact.owned.cumulativePaid);
  document.getElementById('hs-owned-value').textContent = '+' + fmt(impact.owned.homeValueAdd);
  document.getElementById('hs-owned-net').textContent = fmt(impact.owned.netCost);

  document.getElementById('hs-lease-paid').textContent = fmt(impact.leased.cumulativePaid);
  document.getElementById('hs-lease-buyout').textContent = fmt(impact.leased.buyoutCost);
  document.getElementById('hs-lease-risk').textContent = impact.leased.transferRisk;
  document.getElementById('hs-lease-net').textContent = fmt(impact.leased.netCost);

  document.getElementById('hs-nothing-paid').textContent = fmt(impact.doNothing);
  document.getElementById('hs-nothing-net').textContent = fmt(impact.doNothing);

  updateHomeSaleChart(results);
}

// ─── Checklist ──────────────────────────────────────────────────
function renderChecklist() {
  const container = document.getElementById('checklist-container');
  let totalItems = 0;
  let checkedItems = 0;

  container.innerHTML = QUESTIONS.map((cat, ci) => `
    <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden reveal">
      <button class="w-full text-left p-4 flex justify-between items-center hover:bg-slate-700/50 transition-colors" onclick="this.nextElementSibling.classList.toggle('hidden')">
        <h3 class="font-semibold text-sm text-slate-300">${cat.category}</h3>
        <span class="text-xs text-slate-500">${cat.items.length} questions</span>
      </button>
      <div class="${ci > 2 ? 'hidden' : ''} border-t border-slate-700 p-4 space-y-2">
        ${cat.items.map((item, qi) => {
          const id = `q-${ci}-${qi}`;
          const checked = checklistState[id] || false;
          totalItems++;
          if (checked) checkedItems++;
          return `
            <div class="checklist-item ${checked ? 'checked' : ''} flex items-start gap-3 py-1">
              <input type="checkbox" id="${id}" ${checked ? 'checked' : ''} class="mt-1 accent-amber-500 shrink-0" data-check-id="${id}">
              <label for="${id}" class="text-sm text-slate-400 cursor-pointer">${item}</label>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');

  updateChecklistProgress(checkedItems, totalItems);

  // Checkbox event delegation
  container.addEventListener('change', e => {
    if (e.target.type !== 'checkbox') return;
    const id = e.target.dataset.checkId;
    checklistState[id] = e.target.checked;
    localStorage.setItem('solar-checklist', JSON.stringify(checklistState));

    const item = e.target.closest('.checklist-item');
    item.classList.toggle('checked', e.target.checked);

    // Recount
    const total = container.querySelectorAll('input[type="checkbox"]').length;
    const done = container.querySelectorAll('input[type="checkbox"]:checked').length;
    updateChecklistProgress(done, total);
  });
}

function updateChecklistProgress(done, total) {
  const pct = total > 0 ? (done / total * 100) : 0;
  document.getElementById('checklist-progress').style.width = `${pct}%`;
  document.getElementById('checklist-count').textContent = `${done} / ${total}`;
}

// ─── Red Flags ──────────────────────────────────────────────────
function renderRedFlags() {
  const container = document.getElementById('redflags-container');
  container.innerHTML = RED_FLAGS.map(rf => `
    <div class="reveal bg-slate-800 rounded-lg p-4 border border-slate-700 flex items-start gap-4">
      <span class="severity-${rf.severity} text-xs font-medium px-2 py-1 rounded shrink-0 uppercase">${rf.severity}</span>
      <div>
        <p class="text-sm text-white font-medium">${rf.flag}</p>
        <p class="text-xs text-slate-400 mt-1">${rf.explanation}</p>
      </div>
    </div>
  `).join('');
}

// ─── Scroll Behavior ────────────────────────────────────────────
function initScrollBehavior() {
  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Scroll progress bar
  const progressBar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${pct}%`;
  }, { passive: true });

  // Active nav link
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active', 'text-white'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) {
          active.classList.add('active', 'text-white');
        }
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));

  // Reveal on scroll
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}
