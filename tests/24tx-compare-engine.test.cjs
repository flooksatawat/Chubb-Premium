#!/usr/bin/env node
'use strict';

/**
 * 24TX Compare Engine — loads the REAL _compareTxDeathBenefit from compare.js
 * and tests against hardcoded Excel-verified expected values.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load CV data
const cvRaw = fs.readFileSync(path.join(__dirname, '..', 'data', 'cv', 'CV_DATA.json'), 'utf8');
const cvDataLookup = JSON.parse(cvRaw);

// Setup minimal browser environment for compare.js
const sandbox = {
    window: { cvDataLookup },
    console: { log: () => {} },
    Math,
    parseInt,
    module: { exports: {} }
};
sandbox.global = sandbox;

// Load and evaluate compare.js in sandbox
const compareSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'compare.js'), 'utf8');
const script = new vm.Script(compareSrc, { filename: 'compare.js' });
const ctx = vm.createContext(sandbox);
script.runInContext(ctx);

// Now we can access the real functions
const _compareTxDeathBenefit = ctx._compareTxDeathBenefit;
const _compareTxCashback = ctx._compareTxCashback;

if (typeof _compareTxDeathBenefit !== 'function') {
    console.error('FAILED: _compareTxDeathBenefit not found in compare.js');
    process.exit(1);
}

console.log('✓ Loaded real _compareTxDeathBenefit from compare.js\n');

// ========== VERIFIED EXPECTED VALUES (from Excel / Rate Book) ==========
const TEST_CASES = [
    { id: 'age0-yr90',  sa: 100000, prem: 16629, gender: 'male', age: 0,  year: 90, expected: 390000, desc: 'เริ่มอายุ 0 → ครบสัญญาอายุ 90: DB=390,000' },
    { id: 'age30-yr60', sa: 100000, prem: 16629, gender: 'male', age: 30, year: 60, expected: 290000, desc: 'เริ่มอายุ 30 → ถึงอายุ 90 (ปี 60): DB=290,000' },
    { id: 'age0-yr25',  sa: 100000, prem: 16629, gender: 'male', age: 0,  year: 25, expected: 314600, desc: 'เริ่มอายุ 0 ปีที่ 25: DB=314,600 (CV)' },
    { id: 'age0-yr8',   sa: 100000, prem: 16629, gender: 'male', age: 0,  year: 8,  expected: 123032, desc: 'เริ่มอายุ 0 ปีที่ 8: DB=123,032 (floor)' },
    { id: 'age20-yr20', sa: 100000, prem: 16629, gender: 'male', age: 20, year: 20, expected: 302580, desc: 'เริ่มอายุ 20 ปีที่ 20: DB=302,580' },
];

let passed = 0;
const failures = [];

for (const tc of TEST_CASES) {
    const actual = _compareTxDeathBenefit(tc.sa, tc.prem, tc.gender, tc.age, tc.year);
    if (actual === tc.expected) {
        passed++;
    } else {
        failures.push({
            id: tc.id, expected: tc.expected, got: actual,
            diff: actual - tc.expected, description: tc.desc
        });
    }
}

console.log(JSON.stringify({
    test: "24TX Compare Engine — calls REAL compare.js functions",
    sourceFunction: "_compareTxDeathBenefit",
    testCases: TEST_CASES.length,
    passed,
    failed: TEST_CASES.length - passed,
    failures,
    allPass: failures.length === 0
}, null, 2));

if (failures.length === 0) {
    console.log('\n=== Key SA schedule (Male Age 0, via real _compareTxDeathBenefit) ===');
    for (const y of [1, 4, 8, 10, 20, 25, 30, 35, 40, 50, 60, 75, 85, 88, 90]) {
        const db = _compareTxDeathBenefit(100000, 16629, 'male', 0, y);
        console.log(`Year ${String(y).padStart(2)}: DB=${String(db).padStart(7)}`);
    }
}

process.exit(failures.length > 0 ? 1 : 0);