#!/usr/bin/env node
'use strict';

const fs = require('fs');
const REPO = process.cwd();

// ===== Excel Data: Male, Age 0, 24TX, SA=100,000, Premium=16,629 =====
// Column L (รับเงินก้อน = death benefit) from TX90XX_G sheet
const EXCEL_COL_L = {
    1: 100000,  2: 100000,  3: 100000,
    4: 110000,  5: 110000,  6: 110000,
    7: 120000,  8: 123032,  9: 134661,
   10: 151290, 11: 167919, 12: 179548,
   13: 196177, 14: 212806, 15: 224435,
   16: 241064, 17: 257693, 18: 269322,
   19: 285951, 20: 302580, 21: 314209,
   22: 334700, 23: 356900, 24: 374800,
   25: 314600, 30: 315900, 35: 317400,
   38: 318400, 45: 321400, 50: 324100,
   55: 327600, 59: 331000,
};

// ===== Parameters =====
const INIT_SA = 100000;
const ANNUAL_PREMIUM = 16629;
const PAY_YEARS = 24;
const CASHBACK_3YR = 5000;       // every 3 years during premium period

// Load CV data
const cvData = JSON.parse(fs.readFileSync(`${REPO}/data/cv/CV_DATA.json`, 'utf8'));

// CV_DATA structure: { planCode: { gender: { startAge: { year: cvRate } } } }
function findCVRate(year, planCode) {
    try {
        const rate = cvData[planCode]?.['male']?.['0']?.[String(year)];
        return rate !== undefined ? rate : 0;
    } catch (e) {
        return 0;
    }
}

// ===== Death Benefit Formula (exact same as ui.js generatePolicyTableData) =====
function computeDeathBenefit(year) {
    const age = year; // age 0 at start, age = year after each year
    
    // 1. Guaranteed SA schedule: +10% every 3 years starting year 4
    const txMult = 1.0 + 0.10 * Math.max(0, Math.floor((year - 1) / 3));
    const guaranteedSA = Math.round(INIT_SA * txMult);
    
    // 2. Total premiums paid
    const totalPrem = ANNUAL_PREMIUM * Math.min(year, PAY_YEARS);
    
    // 3. Total cashbacks received
    const cb3yrCount = Math.floor(Math.min(year, PAY_YEARS) / 3);
    let totalCashbacks = CASHBACK_3YR * cb3yrCount;
    
    // After pay period: year 25 gets 70k, then 8k/year (from Excel)
    const extraYears = Math.max(0, year - PAY_YEARS);
    if (extraYears >= 1) {
        totalCashbacks += 70000 + 8000 * (extraYears - 1);
    }
    
    // 4. Premium floor
    const premiumFloor = totalPrem - totalCashbacks;
    
    // 5. Cash value (CV)
    const cvRate = findCVRate(age, '24TX');
    const cvTotal = Math.round((INIT_SA * cvRate) / 1000);
    
    // 6. Death benefit = MAX(guaranteedSA, cvTotal, premiumFloor)
    const deathBenefit = Math.max(guaranteedSA, cvTotal, premiumFloor);
    
    return { year, age, guaranteedSA, totalPrem, totalCashbacks, premiumFloor, cvRate, cvTotal, deathBenefit };
}

// ===== Run Test =====
const mismatches = [];
let tested = 0;
let passed = 0;

for (const [yearStr, expected] of Object.entries(EXCEL_COL_L)) {
    const year = parseInt(yearStr);
    const result = computeDeathBenefit(year);
    tested++;
    
    if (result.deathBenefit === expected) {
        passed++;
    } else {
        mismatches.push({
            year,
            expected,
            got: result.deathBenefit,
            diff: result.deathBenefit - expected,
            details: result,
        });
    }
}

// Output
console.log(JSON.stringify({
    test: '24TX Death Benefit vs Excel Column L',
    params: { initSA: INIT_SA, annualPremium: ANNUAL_PREMIUM, payYears: PAY_YEARS },
    tested,
    passed,
    failed: mismatches.length,
    mismatches: mismatches.slice(0, 20),
}, null, 2));

// Also show a table of all computed values for analysis
console.log('\n--- Full Table ---');
console.log('Year | Age | SA    | Prem-CB  | CV      | DeathBenefit | Excel  | Match');
console.log('-'.repeat(75));
for (const [yearStr, expected] of Object.entries(EXCEL_COL_L)) {
    const year = parseInt(yearStr);
    const r = computeDeathBenefit(year);
    const ok = r.deathBenefit === expected ? '✓' : `✗ diff=${r.deathBenefit - expected}`;
    console.log(`${String(year).padStart(4)} | ${String(r.age).padStart(3)} | ${String(r.guaranteedSA).padStart(6)} | ${String(r.premiumFloor).padStart(8)} | ${String(r.cvTotal).padStart(7)} | ${String(r.deathBenefit).padStart(12)} | ${String(expected).padStart(6)} | ${ok}`);
}

process.exit(mismatches.length > 0 ? 1 : 0);
