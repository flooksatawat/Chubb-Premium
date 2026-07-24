#!/usr/bin/env node
'use strict';

const fs = require('fs');
const vm = require('vm');

const REPO = process.cwd();
const source = fs.readFileSync(`${REPO}/js/calculator.js`, 'utf8');
const rates = JSON.parse(fs.readFileSync(`${REPO}/data/rates/tx_rates.json`, 'utf8'));

function makeElement(value = '0') {
  return {
    value,
    innerText: '',
    disabled: false,
    style: {},
    classList: { add() {}, remove() {}, toggle() {} },
  };
}

const elements = new Map();
for (const id of ['ageInput', 'premiumInput', 'sumInsuredInput', 'cashFlowInput', 'cashFlowInput1', 'cashFlowInput2']) {
  elements.set(id, makeElement('0'));
}

const context = {
  console,
  setTimeout,
  clearTimeout,
  fetch: async () => ({ ok: false, json: async () => ({}) }),
  document: { getElementById: (id) => elements.get(id) || null },
  highlightActivePills() {},
  refreshAllDisplays() {},
  showCustomError() {},
  Swal: { fire() {} },
};
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(source, context, { filename: 'calculator.js' });
vm.runInContext(`
  LIFE_RATES = ${JSON.stringify(rates)};
  currentAppPlan = '24 TX';
  currentPlan = '24TX';
  window.currentMF = 'ไม่เลือก';
`, context);

function discount(sum) {
  if (sum >= 2_000_000) return 5;
  if (sum >= 1_000_000) return 4;
  if (sum >= 600_000) return 2;
  return 0;
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Excel BZ14/CA14 logic for annual mode, occupation class 1 (loading = 0), no MF rider.
function excelSumFromAnnualPremium(rate, premium) {
  for (const d of [5, 4, 2, 0]) {
    const sum = round2((premium * 1000) / round2(rate - d));
    if (discount(sum) === d) return { sum, discount: d };
  }
  return { sum: round2((premium * 1000) / rate), discount: 0 };
}

function appSum(age, sex, premium) {
  elements.get('ageInput').value = String(age);
  elements.get('premiumInput').value = String(premium);
  elements.get('sumInsuredInput').value = '0';
  vm.runInContext(`currentGender = ${JSON.stringify(sex)};`, context);
  const result = vm.runInContext(`calculate('premium', false)`, context);
  if (!result) throw new Error(`calculator returned null age=${age} sex=${sex} premium=${premium}`);
  return result.sum;
}

const fixedPremiums = [50_000, 75_000, 100_000, 150_000, 250_000, 500_000];
const cases = [];
const rawMismatches = [];
const tierMismatches = [];

for (const sex of ['male', 'female']) {
  for (let age = 0; age <= 55; age += 1) {
    const rate = rates['24TX'][sex][String(age)];
    const boundaryPremiums = [
      Math.round((600_000 / 1000) * (rate - 2)),
      Math.round((1_000_000 / 1000) * (rate - 4)),
      Math.round((2_000_000 / 1000) * (rate - 5)),
    ];
    const premiums = [...new Set([...fixedPremiums, ...boundaryPremiums])].filter((p) => p > 0);
    for (const premium of premiums) {
      const excel = excelSumFromAnnualPremium(rate, premium);
      const app = appSum(age, sex, premium);
      const record = { age, sex, premium, rate, excel: excel.sum, app, excelDiscount: excel.discount, appDiscount: discount(app) };
      cases.push(record);
      if (app !== excel.sum) rawMismatches.push(record);
      if (record.excelDiscount !== record.appDiscount) tierMismatches.push(record);
    }
  }
}

const summary = {
  scope: 'annual premium -> life sum assured; occupation class 1; no MF rider',
  cases: cases.length,
  exact_matches: cases.length - rawMismatches.length,
  exact_mismatches: rawMismatches.length,
  discount_tier_mismatches: tierMismatches.length,
  max_raw_difference: rawMismatches.reduce((m, r) => Math.max(m, Math.abs(r.app - r.excel)), 0),
  mismatch_examples: rawMismatches.slice(0, 10),
  tier_mismatch_examples: tierMismatches.slice(0, 10),
};
console.log(JSON.stringify(summary, null, 2));
process.exitCode = rawMismatches.length || tierMismatches.length ? 1 : 0;
