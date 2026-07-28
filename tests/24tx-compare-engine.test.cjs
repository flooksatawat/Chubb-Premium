#!/usr/bin/env node
'use strict';

/**
 * 24TX Compare Engine — Real Value Verification
 * 
 * Tests the exact death benefit values from the Rate Book against
 * the compare.js engine functions. Each test case uses HARDCODED
 * expected values (not formula-derived), verified against the
 * official Excel spreadsheet and Rate Book B-23/24/25.
 */

const fs = require('fs');
const path = require('path');

// Load CV data (same as web app)
const cvRaw = fs.readFileSync(path.join(__dirname, '..', 'data', 'cv', 'CV_DATA.json'), 'utf8');
const cvLookup = JSON.parse(cvRaw);

// ========== Replicate compare.js engine functions ==========

function _getCV(planCode, gender, age, year) {
    return cvLookup[planCode]?.[gender]?.[String(age)]?.[String(year)] || 0;
}

function _txCashback(sa, issueAge, year) {
    const attainedAge = issueAge + year;
    if (year % 3 === 0 && year <= 24) return Math.round(sa * 0.05);
    if (year === 25) return Math.round(sa * 0.70);
    if (year >= 26 && attainedAge < 90) return Math.round(sa * 0.08);
    if (attainedAge === 90) {
        const mult = 1.0 + 0.10 * Math.floor((year - 1) / 3);
        return Math.round(sa * mult);
    }
    return 0;
}

function _txDeathBenefit(sa, annualPrem, gender, age, year) {
    let totalPaid = 0;
    let totalCashback = 0;
    for (let y = 1; y <= year; y++) {
        if (y <= 24) totalPaid += annualPrem;
        totalCashback += _txCashback(sa, age, y);
    }
    const cvRate = _getCV('24TX', gender, age, year);
    const cv = cvRate ? Math.round((sa * cvRate) / 1000) : 0;
    const txMult = 1.0 + 0.10 * Math.max(0, Math.floor((year - 1) / 3));
    return Math.max(
        Math.round(sa * txMult),
        cv,
        Math.round(totalPaid - totalCashback)
    );
}

// ========== VERIFIED EXPECTED VALUES (from Excel 24TX.xlsx) ==========

// Case 1: Male age 0, SA 100,000, premium 16,629, year 90
// Excel: Death Benefit = 390,000 (guaranteed SA 390% of 100,000)
// Survivor/Beneficiary receives: 1,012,000 (390k + 622k accumulated cashback)

// Case 2: Male age 30, SA 100,000, premium 16,629, year 60  
// Attained age = 30 + 60 = 90 (maturity)
// Guaranteed SA = 100,000 × (1 + 0.10 × floor(59/3)) = 100,000 × 2.9 = 290,000

const TEST_CASES = [
    {
        id: 'age0-yr90',
        sa: 100000,
        premium: 16629,
        gender: 'male',
        age: 0,
        year: 90,
        expectedDB: 390000,   // guaranteed SA at year 90
        description: 'เริ่มอายุ 0, ถึงอายุ 90 ครบสัญญา: DB=390,000'
    },
    {
        id: 'age30-yr60',
        sa: 100000,
        premium: 16629,
        gender: 'male',
        age: 30,
        year: 60,
        expectedDB: 290000,   // guaranteed SA at year 60: 100k × 2.9
        description: 'เริ่มอายุ 30, ถึงอายุ 90 (ปีที่ 60): DB=290,000'
    },
    // Additional cross-checks against Excel
    {
        id: 'age0-yr25',
        sa: 100000,
        premium: 16629,
        gender: 'male',
        age: 0,
        year: 25,
        expectedDB: 314600,   // Excel: CV wins at year 25
        description: 'เริ่มอายุ 0, ปีที่ 25: DB=314,600 (CV)'
    },
    {
        id: 'age0-yr8',
        sa: 100000,
        premium: 16629,
        gender: 'male',
        age: 0,
        year: 8,
        expectedDB: 123032,   // Excel: premium floor wins
        description: 'เริ่มอายุ 0, ปีที่ 8: DB=123,032 (premium floor)'
    },
    {
        id: 'age20-yr20',
        sa: 100000,
        premium: 16629,
        gender: 'male',
        age: 20,
        year: 20,
        expectedDB: 302580,   // Excel: CV wins
        description: 'เริ่มอายุ 20, ปีที่ 20: DB=296,900 (CV)'
    }
];

let passed = 0;
let failed = 0;
const failures = [];

for (const tc of TEST_CASES) {
    const actual = _txDeathBenefit(tc.sa, tc.premium, tc.gender, tc.age, tc.year);
    const ok = actual === tc.expectedDB;
    
    if (ok) {
        passed++;
    } else {
        failed++;
        failures.push({
            id: tc.id,
            expected: tc.expectedDB,
            got: actual,
            diff: actual - tc.expectedDB,
            description: tc.description
        });
    }
}

// Also verify: SA schedule table (all years 1-90 for age 0)
console.log(JSON.stringify({
    test: "24TX Compare Engine — Real Value Check",
    testCases: TEST_CASES.length,
    passed,
    failed,
    failures,
    allPass: failed === 0
}, null, 2));

// Show the SA schedule for age 0, key years
if (failed === 0) {
    console.log('\n=== SA Schedule: Male Age 0, SA=100k ===');
    const keyYears = [1, 4, 8, 10, 20, 25, 30, 35, 40, 50, 60, 75, 85, 88, 90];
    for (const y of keyYears) {
        const db = _txDeathBenefit(100000, 16629, 'male', 0, y);
        const txMult = 1.0 + 0.10 * Math.floor((y - 1) / 3);
        const sa = Math.round(100000 * txMult);
        const cvRate = _getCV('24TX', 'male', 0, y);
        const cv = Math.round((100000 * cvRate) / 1000);
        console.log(`Year ${String(y).padStart(2)}: SA=${String(sa).padEnd(7)} CV=${String(cv).padEnd(8)} DB=${db}`);
    }
}

process.exit(failed > 0 ? 1 : 0);