/* ===================================================
   CALCULATOR.JS – TCO Calculator Logic
   =================================================== */

const PRODUCTS = {
  'ecopress-rl12': { name: 'EcoPress RL-12', type: 'refuse', capacity: 12, fuelPer100km: 28, maintenanceCostYear: 8500, bodyWeight: 3200, compactionRatio: 5.5, priceRange: '180 000 – 220 000', lifespanYears: 12 },
  'ecopress-rl18': { name: 'EcoPress RL-18', type: 'refuse', capacity: 18, fuelPer100km: 32, maintenanceCostYear: 9200, bodyWeight: 4100, compactionRatio: 5.8, priceRange: '240 000 – 290 000', lifespanYears: 12 },
  'ecopress-rl22': { name: 'EcoPress RL-22', type: 'refuse', capacity: 22, fuelPer100km: 35, maintenanceCostYear: 10500, bodyWeight: 4800, compactionRatio: 6.0, priceRange: '290 000 – 350 000', lifespanYears: 12 },
  'cleansweep-c5': { name: 'CleanSweep C-5', type: 'sweeper', capacity: 5, fuelPer100km: 18, maintenanceCostYear: 6500, bodyWeight: 2100, compactionRatio: 0, priceRange: '320 000 – 380 000', lifespanYears: 10 },
  'winterguard-p3': { name: 'WinterGuard P-3', type: 'winter', capacity: 3, fuelPer100km: 22, maintenanceCostYear: 5500, bodyWeight: 1800, compactionRatio: 0, priceRange: '85 000 – 120 000', lifespanYears: 15 },
  'hooklift-m20': { name: 'HookLift M-20', type: 'container', capacity: 20, fuelPer100km: 30, maintenanceCostYear: 7000, bodyWeight: 3500, compactionRatio: 0, priceRange: '140 000 – 180 000', lifespanYears: 15 },
};

const COMPETITOR_OVERHEAD = { fuel: 1.12, maintenance: 1.25, downtime: 1.4 };
const DIESEL_PRICE = 6.80;
const CO2_PER_LITER = 2.64;

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('tco-form');
  const resultsSection = document.getElementById('tco-results');
  const modelSelect = document.getElementById('calc-model');

  // Populate model select
  if (modelSelect) {
    Object.entries(PRODUCTS).forEach(([id, p]) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = `${p.name} (${p.capacity} m³)`;
      modelSelect.appendChild(opt);
    });
  }

  // Range inputs live update
  document.querySelectorAll('input[type="range"]').forEach(range => {
    const output = document.getElementById(range.id + '-val');
    if (output) {
      output.textContent = range.value;
      range.addEventListener('input', () => { output.textContent = range.value; });
    }
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      calculate();
    });
  }

  function calculate() {
    const modelId = document.getElementById('calc-model').value;
    const routes = parseInt(document.getElementById('calc-routes').value) || 5;
    const kmPerRoute = parseInt(document.getElementById('calc-km').value) || 80;
    const workDays = parseInt(document.getElementById('calc-days').value) || 250;
    const currentFuel = parseFloat(document.getElementById('calc-current-fuel').value) || 38;
    const currentMaint = parseFloat(document.getElementById('calc-current-maint').value) || 15000;
    const years = parseInt(document.getElementById('calc-years').value) || 5;

    const product = PRODUCTS[modelId];
    if (!product) return;

    const annualKm = routes * kmPerRoute * workDays;

    // Our costs
    const ourFuelYear = (product.fuelPer100km / 100) * annualKm * DIESEL_PRICE;
    const ourMaintYear = product.maintenanceCostYear;
    const ourDowntimeCostYear = annualKm * 0.02;
    const ourTotalYear = ourFuelYear + ourMaintYear + ourDowntimeCostYear;
    const ourTotalPeriod = ourTotalYear * years;

    // Current/competitor costs
    const compFuelYear = (currentFuel / 100) * annualKm * DIESEL_PRICE;
    const compMaintYear = currentMaint;
    const compDowntimeCostYear = annualKm * 0.02 * COMPETITOR_OVERHEAD.downtime;
    const compTotalYear = compFuelYear + compMaintYear + compDowntimeCostYear;
    const compTotalPeriod = compTotalYear * years;

    // Savings
    const savingsYear = compTotalYear - ourTotalYear;
    const savingsPeriod = compTotalPeriod - ourTotalPeriod;
    const savingsPercent = ((savingsYear / compTotalYear) * 100).toFixed(1);

    // CO2
    const ourCO2 = ((product.fuelPer100km / 100) * annualKm * CO2_PER_LITER) / 1000;
    const compCO2 = ((currentFuel / 100) * annualKm * CO2_PER_LITER) / 1000;
    const co2Savings = compCO2 - ourCO2;

    // ROI
    const avgInvestment = parseInt(product.priceRange.replace(/\s/g, '').split('–')[0]) * 1000;
    const roiMonths = Math.ceil(avgInvestment / (savingsYear / 12));

    // Display results
    resultsSection.classList.add('show');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    animateValue('res-savings-year', savingsYear);
    animateValue('res-savings-period', savingsPeriod);
    animateValue('res-savings-percent', parseFloat(savingsPercent), '%');
    animateValue('res-co2', co2Savings * years, ' t');
    animateValue('res-roi', roiMonths, ' mies.');
    animateValue('res-fuel-saving', compFuelYear - ourFuelYear);
    animateValue('res-maint-saving', compMaintYear - ourMaintYear);

    // Chart bars
    setBar('bar-our-fuel', ourFuelYear, compFuelYear);
    setBar('bar-comp-fuel', compFuelYear, compFuelYear);
    setBar('bar-our-maint', ourMaintYear, compMaintYear);
    setBar('bar-comp-maint', compMaintYear, compMaintYear);
    setBar('bar-our-total', ourTotalYear, compTotalYear);
    setBar('bar-comp-total', compTotalYear, compTotalYear);

    document.getElementById('res-model-name').textContent = product.name;
    document.getElementById('res-annual-km').textContent = annualKm.toLocaleString('pl-PL') + ' km';
    document.getElementById('res-period').textContent = years + ' lat';
  }

  function animateValue(id, target, suffix = '') {
    const el = document.getElementById(id);
    if (!el) return;
    const isNeg = target < 0;
    const absTarget = Math.abs(target);
    const duration = 1500;
    const start = performance.now();

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * absTarget);
      const formatted = (isNeg ? '-' : '') + current.toLocaleString('pl-PL');
      el.textContent = formatted + suffix;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = (isNeg ? '-' : '') + (absTarget % 1 !== 0 ? absTarget.toFixed(1) : Math.floor(absTarget).toLocaleString('pl-PL')) + suffix;
    };
    requestAnimationFrame(update);
  }

  function setBar(id, value, max) {
    const el = document.getElementById(id);
    if (!el) return;
    const pct = Math.min((value / max) * 100, 100);
    setTimeout(() => { el.style.width = pct + '%'; }, 200);
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  // Header scroll
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
});
