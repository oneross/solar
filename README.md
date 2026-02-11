# NJ Solar Analysis — Hawthorne/Ramsey 2026

Interactive financial comparison for residential solar in Bergen County, NJ.

**Live:** [oneross.github.io/solar](https://oneross.github.io/solar)

## What This Does

Compares 5 financing scenarios (cash, loan, PPA, lease, do-nothing) over 25 years with real 2026 NJ data:
- No federal ITC (eliminated Jan 1, 2026)
- NJ SREC-II at $85/MWh for 15 years
- PSE&G net metering, property/sales tax exemptions

## Features

- **Provider comparison** — 7 providers evaluated, sorted by tier
- **Financial calculator** — Adjustable sliders, 6 interactive charts
- **Scenario save/compare** — Save up to 3 configurations side by side
- **Home sale impact** — Owned vs leased with sell-year slider
- **Meeting checklist** — 32 questions, progress persisted in localStorage
- **Red flags** — Warning signs with severity levels

## Tech Stack

- Vanilla ES6 modules (no framework, no build step)
- Tailwind CSS via CDN
- Chart.js 4.x via CDN
- GitHub Pages compatible (pure static)

## Local Development

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Data Sources

- EnergySage (cost/watt, provider ratings)
- EIA (electricity rates)
- DSIRE / NJ BPU (SREC-II, incentives)
- Zillow (home value premium)
