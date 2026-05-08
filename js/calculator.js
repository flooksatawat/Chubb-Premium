// ==================== JS LOGIC & UTILITIES ====================
const setText = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };
const formatNum = (num) => { const rounded = Math.round(num * 100) / 100; return Number.isInteger(rounded) ? rounded.toLocaleString() : rounded.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}); };
const formatPct = (num) => { return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + '%'; };
const getSafeValue = (id) => { const el = document.getElementById(id); if (!el || !el.value) return 0; return parseFloat(el.value.toString().replace(/,/g, '')) || 0; };

// ==================== GLOBAL STATE ====================
let currentAppPlan = ""; // ตั้งค่าว่าง เพื่อเป็น Default สแตนด์บายรอคำสั่ง
let currentPlan = '20CX', currentGender = 'male', lastCalculationData = null, currentMode = 'sum';
let currentPlanOptions = ['10CX', '20CX'];
let cvDataLookup = {};

// ค่าเริ่มต้นของแผนสุขภาพ 3D
window.currentHX = 'ไม่เลือก';
window.currentHXO = 'ไม่เลือก';
window.currentHXD = 'ไม่เลือก';
window.currentHBF = 'ไม่เลือก';
window.currentMF = 'ไม่เลือก';

// ==================== DATA ARCHITECTURE & CONFIG ====================
let LIFE_RATES = {};
let CI_RATES = {};
let COM_RATES = {};

// ตั้งค่าขั้นต่ำและพื้นฐานของแต่ละแผน
const PLAN_CONFIG = {
    "CI Extra Plus": { abbr: "CX", minAge: 0, maxAge: 65, minSum: 100000, minPrem: 4000, getMaxSum: (age) => age <= 15 ? 3000000 : 10000000, options: ['10CX', '20CX'], hasCashFlow: false },
    "Signature Legacy": { abbr: "SLB", minAge: 0, maxAge: 70, minSum: 5000000, minPrem: 0, getMaxSum: (age) => 500000000, options: ['5SLB', '10SLB'], hasCashFlow: false },
    "Life Protector 20": { abbr: "LPB", minAge: 0, maxAge: 65, minSum: 100000, minPrem: 0, getMaxSum: (age) => Infinity, options: ['20LPB'], hasCashFlow: false },
    "Supreme Life Protector": { abbr: "SLPA", minAge: 0, maxAge: 65, minSum: 100000, minPrem: 0, getMaxSum: (age) => Infinity, options: ['20SLPA'], hasCashFlow: false },
    "Whole Life Extra": { abbr: "WXN", minAge: 0, maxAge: 65, minSum: 100000, minPrem: 50000, getMaxSum: (age) => Infinity, options: ['WXN10', 'WXN15'], hasCashFlow: true },
    "24 TX": { abbr: "TX", minAge: 0, maxAge: 65, minSum: 100000, minPrem: 50000, getMaxSum: (age) => Infinity, options: ['24TX'], hasCashFlow: true },
    "868 / 818 Elite Saving": { abbr: "Elite", minAge: 0, maxAge: 65, minSum: 100000, minPrem: 50000, getMaxSum: (age) => Infinity, options: ['S868', 'S818'], hasCashFlow: true },
    "Century Life": { abbr: "CL", minAge: 11, maxAge: 75, minSum: 100000, minPrem: 4000, getMaxSum: (age) => Infinity, options: ['10CL', '20CL', '60CL', '90CL', '100CL'], hasCashFlow: false },
    "3D Health Excellence": { abbr: "3D", minAge: 11, maxAge: 75, minSum: 150000, minPrem: 4000, getMaxSum: (age) => Infinity, options: ['10CL', '20CL', '60CL', '90CL', '100CL'], hasCashFlow: false },
    "Convertable Term": { abbr: "TLA", minAge: 20, maxAge: 65, minSum: 1000000, minPrem: 4000, getMaxSum: (age) => Infinity, options: ['TLA'], hasCashFlow: false }
};

const allInsurancePlans = [
    { name: "CI Extra Plus", desc: "ออมเงิน : ชดเชยโรคร้าย+วงเงินพิเศษ", icon: "fas fa-shield-heart", color: "text-rose-500", bg: "bg-rose-100" },
    { name: "Life Protector 20", desc: "เปลี่ยนทุนประกัน เป็นบำนาญ", icon: "fas fa-piggy-bank", color: "text-emerald-500", bg: "bg-emerald-100" },
    { name: "Supreme Life Protector", desc: "เปลี่ยนทุนประกัน เป็นบำนาญ", icon: "fas fa-piggy-bank", color: "text-emerald-500", bg: "bg-emerald-100" },
    { name: "Signature Legacy", desc: "แผนมรดก ลูกค้ามูลค่าสูง", icon: "fas fa-crown", color: "text-amber-500", bg: "bg-amber-100" },
    { name: "Convertable Term", desc: "จองสิทธิ เปลี่ยนแบบประกันได้", icon: "fas fa-umbrella", color: "text-blue-500", bg: "bg-blue-100" },
    { name: "Century Life", desc: "แผนคุ้มครองตลอดชีพ", icon: "fas fa-gem", color: "text-amber-500", bg: "bg-amber-100" },
    { name: "3D Health Excellence", desc: "ประกันสุขภาพ ที่เข้าใจทุกช่วงชีวิต", icon: "fas fa-hand-holding-medical", color: "text-teal-500", bg: "bg-teal-100" },
    { name: "Whole Life Extra", desc: "สินทรัพย์กระแสเงินสด", icon: "fas fa-money-bill-trend-up", color: "text-indigo-500", bg: "bg-indigo-100" },
    { name: "24 TX", desc: "สินทรัพย์กระแสเงินสด", icon: "fas fa-money-bill-trend-up", color: "text-indigo-500", bg: "bg-indigo-100" },
    { name: "868 / 818 Elite Saving", desc: "สินทรัพย์กระแสเงินสด", icon: "fas fa-money-bill-trend-up", color: "text-indigo-500", bg: "bg-indigo-100" },
    { name: "Medical Fund", desc: "อยู่ระหว่างการพัฒนา", icon: "fas fa-hospital", color: "text-sky-500", bg: "bg-sky-100" }
];

async function loadAllRates() {
    const rateFiles = [
        'cx_rates.json', 'ci_rates.json', 'lp_rates.json', 'slb_rates.json', 'slpa_rates.json',
        'tx_rates.json', 'elite_rates.json', 'cl_rates.json', 'tla_rates.json',
        'hx_rates.json', 'hxd_rates.json', 'hxo_rates.json', '3d_health.json',
        'hbf_rates.json', 'wxn_rates.json'
    ];
    try {
        for (const file of rateFiles) {
            try {
                const r = await fetch(`data/rates/${file}`);
                if (r.ok) { 
                    const d = await r.json(); 
                    if (file === 'ci_rates.json') {
                        CI_RATES = { ...CI_RATES, ...d };
                    } else if (file === 'hbf_rates.json' || d.HBF_RATES) {
                        // โหลด HBF เข้าตัวแปร Global เพื่อให้เรียกใช้ได้ง่าย
                        window.HBF_RATES = d.HBF_RATES || d;
                        LIFE_RATES = { ...LIFE_RATES, ...d };
                    } else {
                        LIFE_RATES = { ...LIFE_RATES, ...d }; 
                    }
                }
            } catch(e) {
                console.warn(`Failed to fetch rate file: ${file}`, e);
            }
        }
        
        // โหลดค่าคอมมิชชัน
        try {
            const r = await fetch('data/com/com_rates.json');
            if (r.ok) { 
                COM_RATES = await r.json(); 
                window.COM_RATES = COM_RATES; 
            }
        } catch(e) {}

        // --- เพิ่มการโหลดข้อมูล CV ทันทีที่โหลดเรทเสร็จ ---
        await getCVData(); 

    } catch (error) { 
        console.error('loadAllRates failed:', error); 
    }
}

async function getCVData() {
    // ถ้ามีข้อมูลอยู่แล้วไม่ต้อง fetch ใหม่
    if (Object.keys(cvDataLookup).length > 0) return cvDataLookup;
    try {
        const r = await fetch('data/cv/CV_DATA.json');
        if (r.ok) { 
            cvDataLookup = await r.json(); 
            window.cvDataLookup = cvDataLookup; // บันทึกลง global variable
        }
    } catch(e) {
        console.error('getCVData failed:', e);
    }
    return cvDataLookup;
}

function getHealthRate(categoryKey, planName, age, gender) {
    if (!planName || planName === 'ไม่เลือก' || planName === '-') return 0;

    // ส่วนของ HBF ที่แบ่งตาม Occupational Class
    if (categoryKey === 'HBF') {
        let hbfSource = window.HBF_RATES || LIFE_RATES['HBF_RATES'];
        if (hbfSource && hbfSource['class_1']) {
            let rateFromClass = hbfSource['class_1'][age];
            if (rateFromClass !== undefined) {
                const multiplierMap = { 'HBF500': 0.5, 'HBF1000': 1, 'HBF3000': 3, 'HBF5000': 5 };
                return Math.round(rateFromClass * (multiplierMap[planName] || 0));
            }
        }
    }

    let cleanName = planName.trim();
    if (LIFE_RATES[cleanName]?.[gender]?.[age]) return LIFE_RATES[cleanName][gender][age];
    if (LIFE_RATES[categoryKey] && LIFE_RATES[categoryKey][cleanName]?.[gender]?.[age]) return LIFE_RATES[categoryKey][cleanName][gender][age];
    let combinedName = categoryKey + ' ' + cleanName;
    if (LIFE_RATES[combinedName]?.[gender]?.[age]) return LIFE_RATES[combinedName][gender][age];
    let noSpaceName = categoryKey + cleanName.replace(/\s+/g, '');
    if (LIFE_RATES[noSpaceName]?.[gender]?.[age]) return LIFE_RATES[noSpaceName][gender][age];
    return 0;
}

function validateAndCapHBF(hbfVal, age, status, occupation, nationality, baseSumAssured, dailyIncome) {
    if (!hbfVal || hbfVal === 'ไม่เลือก') return hbfVal;

    const hbfNumMap = { 'HBF500': 500, 'HBF1000': 1000, 'HBF3000': 3000, 'HBF5000': 5000 };
    let hbfAmount = hbfNumMap[hbfVal] || 0;

    const hardExclusions = {
        workAbroad: false, livingAbroad: false, studyingAbroad: false,
        isMonkNun: false, isPriest: false
    };
    for (const key in hardExclusions) {
        if (hardExclusions[key]) return 'ไม่เลือก';
    }

    let maxHBF = 5000;

    if (baseSumAssured <= 500000) maxHBF = 3000;
    else maxHBF = 5000;

    if (age <= 15 || status === 'student') maxHBF = Math.min(maxHBF, 1000);

    if (occupation === 'student' || occupation === 'housewife' || occupation === 'househusband' || occupation === 'พ่อบ้าน' || occupation === 'แม่บ้าน') {
        maxHBF = Math.min(maxHBF, 1000);
    }

    if (nationality === 'lao' || nationality === 'สัญชาติลาว') maxHBF = Math.min(maxHBF, 2000);

    if (dailyIncome > 0 && hbfAmount > dailyIncome) {
        hbfAmount = dailyIncome;
    }

    if (hbfAmount > maxHBF) hbfAmount = maxHBF;

    if (hbfAmount >= 5000) return 'HBF5000';
    if (hbfAmount >= 3000) return 'HBF3000';
    if (hbfAmount >= 1000) return 'HBF1000';
    if (hbfAmount >= 500) return 'HBF500';
    
    return 'ไม่เลือก';
}

function getCLMinSum() {
    if (currentAppPlan !== 'Century Life') return PLAN_CONFIG[currentAppPlan]?.minSum || 100000;
    return ['60CL', '90CL', '100CL'].includes(currentPlan) ? 150000 : 100000;
}

function getPlanAgeLimit(planName, appPlanName) {
    const config = PLAN_CONFIG[appPlanName] || { maxAge: 75, minAge: 11 };
    let max = config.maxAge;
    if (appPlanName === 'Century Life' && planName === '60CL') max = 55;
    return { min: config.minAge !== undefined ? config.minAge : 11, max };
}

function forceAgeValidation() {
    const input = document.getElementById('ageInput');
    let val = parseInt(input.value) || 0;
    const limits = getPlanAgeLimit(currentPlan, currentAppPlan);

    if (currentAppPlan === 'Whole Life Extra') {
        if (currentPlan === 'WXN10' && val > 50) { val = 50; showCustomError("แผน WXN10 รับประกันสูงสุดถึงอายุ 50 ปี"); }
        else if (currentPlan === 'WXN15') {
            if (val < 11) { val = 11; showCustomError("แผน WXN15 รับประกันตั้งแต่อายุ 11 ปี"); }
            if (val > 45) { val = 45; showCustomError("แผน WXN15 รับประกันสูงสุดถึงอายุ 45 ปี"); }
        }
    }
    if (currentAppPlan === 'Century Life' && currentPlan === '60CL' && val > 55) {
        val = 55;
        showCustomError("แผน CL60 รับอายุสูงสุด 55 ปี");
    }
    if (val < limits.min) val = limits.min;
    if (val > limits.max) val = limits.max;
    input.value = val;
    calculate(currentMode, true);
}

function adjustAge(delta) {
    const input = document.getElementById('ageInput');
    let val = parseInt(input.value) + delta;
    const limits = getPlanAgeLimit(currentPlan, currentAppPlan);

    if (currentAppPlan === 'Whole Life Extra') {
        if (currentPlan === 'WXN10' && val > 50) { val = 50; showCustomError("แผน WXN10 รับประกันสูงสุดถึงอายุ 50 ปี"); }
        else if (currentPlan === 'WXN15') {
            if (val < 11) { val = 11; showCustomError("แผน WXN15 รับประกันตั้งแต่อายุ 11 ปี"); }
            if (val > 45) { val = 45; showCustomError("แผน WXN15 รับประกันสูงสุดถึงอายุ 45 ปี"); }
        }
    }
    if (currentAppPlan === 'Century Life' && currentPlan === '60CL' && val > 55) {
        val = 55;
        showCustomError("แผน CL60 รับอายุสูงสุด 55 ปี");
    }
    if (val < limits.min) val = limits.min;
    if (val > limits.max) val = limits.max;
    input.value = val;
    calculate(currentMode, true);
}

function setGender(gender) { 
    currentGender = gender; 
    const btnM = document.getElementById('btnMale'); const btnF = document.getElementById('btnFemale'); const genderBg = document.getElementById('genderBg');
    if(gender === 'male') {
        if(btnM) btnM.className = 'flex-1 relative z-10 rounded-[10px] text-[15px] font-bold text-blue-700 transition-all duration-300';
        if(btnF) btnF.className = 'flex-1 relative z-10 rounded-[10px] text-[15px] font-medium text-slate-500 hover:text-slate-700 transition-all duration-300';
        if(genderBg && btnM) { genderBg.style.width = btnM.offsetWidth + 'px'; genderBg.style.left = btnM.offsetLeft + 'px'; }
    } else {
        if(btnM) btnM.className = 'flex-1 relative z-10 rounded-[10px] text-[15px] font-medium text-slate-500 hover:text-slate-700 transition-all duration-300';
        if(btnF) btnF.className = 'flex-1 relative z-10 rounded-[10px] text-[15px] font-bold text-[#e11d48] transition-all duration-300';
        if(genderBg && btnF) { genderBg.style.width = btnF.offsetWidth + 'px'; genderBg.style.left = btnF.offsetLeft + 'px'; }
    }
    calculate(currentMode, true); 
}

function getDiscount(sum, plan) { 
    // ส่วนลดสำหรับแผน Supreme Life Protector (SLPA)[cite: 3]
    if (plan === '20SLPA') {
        if (sum >= 1500000) return 3.0; // ตั้งแต่ 1.5 ล้านบาท ลด 3 บาท[cite: 3]
        if (sum >= 1100000) return 2.0; // 1.1 ล้าน - 1.49 ล้าน ลด 2 บาท[cite: 3]
        if (sum >= 700000) return 1.0;  // 7 แสน - 1.09 ล้าน ลด 1 บาท[cite: 3]
        return 0;
    }

    // ส่วนลดสำหรับแผน Life Protector 20 (LPB)[cite: 2]
    if (plan === '20LPB') {
        if (sum >= 1000000) return 3.0; 
        if (sum >= 600000) return 2.0;  
        if (sum >= 400000) return 1.0;  
        return 0;
    }

    // ส่วนลดสำหรับแผน Century Life + TPD (CL)
    if (plan === '10CL' || plan === '20CL' || plan === '60CL' || plan === '90CL' || plan === '100CL') {
        if (sum >= 1000000) return 2.0;
        if (sum >= 500000) return 1.0;
        return 0;
    }
    
    // ส่วนลดสำหรับแผน 24 TX
    if (plan === '24TX') {
        if (sum >= 2000000) return 5.0;
        if (sum >= 1000000) return 4.0;
        if (sum >= 600000) return 2.0;
        return 0;
    }

    // เงื่อนไขส่วนลดสำหรับแผนอื่นๆ (CX, WXN)
    if (plan === '10CX') { 
        if (sum >= 5000000) return 3.0; 
        if (sum >= 1000000) return 2.0; 
    } 
    else if (plan === '20CX') { 
        if (sum >= 5000000) return 1.5; 
        if (sum >= 1000000) return 1.0; 
        if (sum >= 800000) return 0.5; 
    } 
    else if (plan === 'WXN10' || plan === 'WXN15') {
        if (sum >= 1000000) return 5.0;
        if (sum >= 600000) return 3.0;
        if (sum >= 300000) return 1.0;
    }
    return 0; 
}

let _realtimeValidateTimer = null;
function handlePremiumInput(el) {
    let v = el.value.replace(/,/g, '').split('.')[0];
    if (!isNaN(v) && v !== '') {
        el.value = Number(v).toLocaleString();
        calculate('premium', false);
        clearTimeout(_realtimeValidateTimer);
    }
}
function handleSumInput(el) {
    let v = el.value.replace(/,/g, '').split('.')[0];
    if (!isNaN(v) && v !== '') {
        el.value = Number(v).toLocaleString();
        calculate('sum', false);
        clearTimeout(_realtimeValidateTimer);
        _realtimeValidateTimer = setTimeout(() => {
            const effectiveMinSum = getCLMinSum();
            const val = getSafeValue('sumInsuredInput');
            if (val > 0 && val < effectiveMinSum) {
                showCustomError(`ทุนประกันขั้นต่ำ ต้องไม่น้อยกว่า ${effectiveMinSum.toLocaleString()} บาท`);
                el.value = effectiveMinSum.toLocaleString();
                calculate('sum', true);
            }
        }, 600);
    }
}
function handleCashFlowInput(el, type = 0) { 
    let v = el.value.replace(/,/g, '').split('.')[0]; 
    if (!isNaN(v) && v !== '') { 
        el.value = Number(v).toLocaleString(); 
        if(type === 1) calculate('cashflow1', false);
        else if(type === 2) calculate('cashflow2', false);
        else calculate('cashflow', false); 
    } 
}

function setQuickSum(val) { document.getElementById('sumInsuredInput').value = val.toLocaleString(); calculate('sum', true); }
function setQuickPremium(val) { document.getElementById('premiumInput').value = val.toLocaleString(); calculate('premium', true); }
function setQuickCashFlow(val) { const el = document.getElementById('cashFlowInput'); if(el) { el.value = val.toLocaleString(); calculate('cashflow', true); } }
function setWXNQuickCashFlow(val, type) {
    if (type === 1) { document.getElementById('cashFlowInput1').value = val.toLocaleString(); calculate('cashflow1', true); } 
    else if (type === 2) { document.getElementById('cashFlowInput2').value = val.toLocaleString(); calculate('cashflow2', true); }
}

// ==================== LOGIC: คำนวณหลัก (MASTER CALCULATION) ====================
function calculate(source, enforceMin = false) { 
    try {
        currentMode = source;
        let ageInput = document.getElementById('ageInput');
        let age = parseInt(ageInput.value) || 0; 
        let fSum = 0, fPrem = 0; 
        const config = PLAN_CONFIG[currentAppPlan] || { minSum: 100000, minPrem: 4000 };
        
        const limits = getPlanAgeLimit(currentPlan, currentAppPlan);
        if (age < limits.min) age = limits.min;
        if (age > limits.max) age = limits.max;

        if (currentAppPlan === 'Whole Life Extra') {
            if (currentPlan === 'WXN10' && age > 50) age = 50;
            if (currentPlan === 'WXN15') {
                if (age < 11) age = 11;
                if (age > 45) age = 45;
            }
        }
        
        if (currentAppPlan === '868 / 818 Elite Saving') {
            currentPlan = age <= 50 ? 'S868' : 'S818';
        }

        if (source === 'sum') fSum = getSafeValue('sumInsuredInput');
        else if (source === 'premium') fPrem = getSafeValue('premiumInput');

        // SLB minimum sum enforcement — fires on all enforced calls (voice, parser, blur)
        if (currentAppPlan === 'Signature Legacy' && source === 'sum' && fSum > 0 && fSum < 5000000 && enforceMin) {
            Swal.fire({ icon: 'warning', title: 'ทุนประกันไม่ถึงเกณฑ์', text: 'แผน Signature Legacy บังคับทุนประกันขั้นต่ำที่ 5,000,000 บาท', confirmButtonColor: '#3085d6', confirmButtonText: 'ตกลง' });
            fSum = 5000000;
            const sumEl = document.getElementById('sumInsuredInput');
            if (sumEl) sumEl.value = '5,000,000';
        }

        // ---------------- 1. Whole Life Extra (WXN) ----------------
        if (currentAppPlan === 'Whole Life Extra') {
            let clRate = LIFE_RATES[currentPlan]?.[currentGender]?.[age] || 0;
            if (clRate > 0) {
                let mfPrem = getHealthRate('MF', window.currentMF, age, currentGender);
                if (source === 'cashflow1') {
                    let cf1 = getSafeValue('cashFlowInput1');
                    fSum = cf1 / 0.0225;
                    fPrem = Math.round((fSum / 1000) * (clRate - getDiscount(fSum, currentPlan))) + mfPrem;
                } else if (source === 'cashflow2') {
                    let cf2 = getSafeValue('cashFlowInput2');
                    fSum = cf2 / 0.10;
                    fPrem = Math.round((fSum / 1000) * (clRate - getDiscount(fSum, currentPlan))) + mfPrem;
                } else if (source === 'sum') {
                    fPrem = Math.round((fSum / 1000) * (clRate - getDiscount(fSum, currentPlan))) + mfPrem;
                } else {
                    fPrem = getSafeValue('premiumInput') || 0;
                    let basePrem = fPrem - mfPrem;
                    if (basePrem < 0) basePrem = 0;
                    
                    let baseDiscountArray = [5, 3, 1, 0];
                    for (let d_val of baseDiscountArray) { 
                        let s = (basePrem * 1000) / (clRate - d_val); 
                        if (getDiscount(s + 1, currentPlan) === d_val) { fSum = s; break; } 
                    } 
                    if (fSum === 0) fSum = clRate > 0 ? (basePrem * 1000) / clRate : 0;
                }
                
                if (enforceMin && fSum < config.minSum) {
                    fSum = config.minSum;
                    fPrem = Math.round((fSum / 1000) * (clRate - getDiscount(fSum, currentPlan))) + mfPrem;
                }
                if (enforceMin && fPrem < config.minPrem) {
                    showCustomError(`เบี้ยประกันขั้นต่ำ ต้องไม่น้อยกว่า ${config.minPrem.toLocaleString()} บาท/ปี`);
                    fPrem = config.minPrem;
                    let basePrem = fPrem - mfPrem;
                    fSum = clRate > 0 ? (basePrem * 1000) / clRate : 0;
                }
                
                document.getElementById('sumInsuredInput').value = formatNum(fSum);
                document.getElementById('premiumInput').value = Math.round(fPrem).toLocaleString();
                if(document.getElementById('cashFlowInput1')) document.getElementById('cashFlowInput1').value = Math.round(fSum * 0.0225).toLocaleString();
                if(document.getElementById('cashFlowInput2')) document.getElementById('cashFlowInput2').value = Math.round(fSum * 0.10).toLocaleString();
            }
        } 
        // ---------------- 2. 24 TX ----------------
        else if (currentAppPlan === '24 TX') {
            let clRate = LIFE_RATES['24TX']?.[currentGender]?.[age] || 0;
            if (clRate > 0) {
                let mfPrem = getHealthRate('MF', window.currentMF, age, currentGender);
                
                if (source === 'cashflow') {
                    let cf = getSafeValue('cashFlowInput');
                    // ปรับฐานคำนวณเงินคืนให้ตรงกับงวด 5%
                    fSum = Math.round(cf / 0.05);
                    fPrem = Math.round((fSum / 1000) * (clRate - getDiscount(fSum, '24TX'))) + mfPrem;
                } else if (source === 'sum') {
                    fSum = Math.round(getSafeValue('sumInsuredInput'));
                    fPrem = Math.round((fSum / 1000) * (clRate - getDiscount(fSum, '24TX'))) + mfPrem;
                } else { 
                    fPrem = getSafeValue('premiumInput') || 0;
                    let basePrem = fPrem - mfPrem;
                    if (basePrem < 0) basePrem = 0;
                    
                    let baseDiscountArray = [5, 4, 2, 0];
                    fSum = 0;
                    for (let d_val of baseDiscountArray) { 
                        let s = Math.round((basePrem * 1000) / (clRate - d_val)); 
                        if (getDiscount(s, '24TX') === d_val) { fSum = s; break; } 
                    } 
                    if (fSum === 0) fSum = clRate > 0 ? Math.round((basePrem * 1000) / clRate) : 0;
                }
                
                const maxSumAllowed = config.getMaxSum ? config.getMaxSum(age) : Infinity;
                if (fSum > maxSumAllowed) {
                    fSum = maxSumAllowed;
                    fPrem = Math.round((fSum / 1000) * (clRate - getDiscount(fSum, '24TX'))) + mfPrem;
                }
                
                if (enforceMin && fSum < config.minSum) {
                    fSum = config.minSum;
                    fPrem = Math.round((fSum / 1000) * (clRate - getDiscount(fSum, '24TX'))) + mfPrem;
                }
                if (enforceMin && fPrem < config.minPrem) {
                    showCustomError(`เบี้ยประกันขั้นต่ำ ต้องไม่น้อยกว่า ${config.minPrem.toLocaleString()} บาท/ปี`);
                    fPrem = config.minPrem;
                    let basePrem = fPrem - mfPrem;
                    
                    let baseDiscountArray = [5, 4, 2, 0];
                    fSum = 0;
                    for (let d_val of baseDiscountArray) { 
                        let s = Math.round((basePrem * 1000) / (clRate - d_val)); 
                        if (getDiscount(s, '24TX') === d_val) { fSum = s; break; } 
                    } 
                    if (fSum === 0) fSum = clRate > 0 ? Math.round((basePrem * 1000) / clRate) : 0;
                }

                document.getElementById('sumInsuredInput').value = formatNum(fSum);
                document.getElementById('premiumInput').value = Math.round(fPrem).toLocaleString();
                // แสดงยอดเงินคืนงวดแรก (5%) ในกล่องกระแสเงินสด
                if(document.getElementById('cashFlowInput')) document.getElementById('cashFlowInput').value = Math.round(fSum * 0.05).toLocaleString();
            }
        }
        
        // ---------------- 3. Elite Saving ----------------
        else if (currentAppPlan === '868 / 818 Elite Saving') {
            // เช็คว่าเข้าเกณฑ์แผนไหน S868 (อายุ 0-50) หรือ S818 (อายุ 51-65)
            currentPlan = age <= 50 ? 'S868' : 'S818';
            let eliteRate = LIFE_RATES[currentPlan]?.[currentGender]?.[age] || 0;
            
            if (eliteRate > 0) {
                let mfPrem = getHealthRate('MF', window.currentMF, age, currentGender);
                
                if (source === 'cashflow') {
                    let cf = getSafeValue('cashFlowInput');
                    fSum = Math.round(cf / 0.12);
                    fPrem = Math.round((fSum / 1000) * eliteRate) + mfPrem;
                } else if (source === 'sum') {
                    fSum = Math.round(getSafeValue('sumInsuredInput'));
                    fPrem = Math.round((fSum / 1000) * eliteRate) + mfPrem;
                } else { 
                    fPrem = getSafeValue('premiumInput') || 0;
                    let basePrem = fPrem - mfPrem;
                    if (basePrem < 0) basePrem = 0;
                    
                    // ไม่มีส่วนลดทุนประกันสำหรับ Elite
                    fSum = eliteRate > 0 ? Math.round((basePrem * 1000) / eliteRate) : 0;
                }
                
                const maxSumAllowed = config.getMaxSum ? config.getMaxSum(age) : Infinity;
                if (fSum > maxSumAllowed) {
                    fSum = maxSumAllowed;
                    fPrem = Math.round((fSum / 1000) * eliteRate) + mfPrem;
                }
                
                let minEliteSum = age <= 50 ? 50000 : 70000; // ขั้นต่ำ 50,000 บาท (S868) และ 70,000 บาท (S818)
                if (enforceMin && fSum < minEliteSum) {
                    fSum = minEliteSum;
                    fPrem = Math.round((fSum / 1000) * eliteRate) + mfPrem;
                }
                if (enforceMin && fPrem < config.minPrem) {
                    showCustomError(`เบี้ยประกันขั้นต่ำ ต้องไม่น้อยกว่า ${config.minPrem.toLocaleString()} บาท/ปี`);
                    fPrem = config.minPrem;
                    let basePrem = fPrem - mfPrem;
                    fSum = eliteRate > 0 ? Math.round((basePrem * 1000) / eliteRate) : 0;
                }

                document.getElementById('sumInsuredInput').value = formatNum(fSum);
                document.getElementById('premiumInput').value = Math.round(fPrem).toLocaleString();
                if(document.getElementById('cashFlowInput')) document.getElementById('cashFlowInput').value = Math.round(fSum * 0.12).toLocaleString();
            }
        }

        // ---------------- 4. 3D Health Excellence ----------------
        else if (currentAppPlan === '3D Health Excellence') {
            let clPlan = currentPlan;
            if (!clPlan.includes('CL')) clPlan = '20CL';
            if (clPlan === '100CL') clPlan = '90CL'; // no separate 100CL rate table
            let clRate = LIFE_RATES[clPlan]?.[currentGender]?.[age] || 0;

            let hxVal = window.currentHX || 'HX15';
            let hxoVal = window.currentHXO || 'ไม่เลือก';
            let hxdVal = window.currentHXD || 'ไม่เลือก';
            if (hxoVal === 'ไม่เลือก') hxdVal = 'ไม่เลือก';
            let hbfVal = window.currentHBF || 'ไม่เลือก';
            let mfVal = window.currentMF && window.currentMF !== '' ? window.currentMF : 'ไม่เลือก';

            let cappedHbfVal = validateAndCapHBF(hbfVal, age, 'adult', '', '', fSum, 0);
            if (hbfVal !== cappedHbfVal && cappedHbfVal !== undefined) {
                hbfVal = cappedHbfVal;
                window.currentHBF = cappedHbfVal;
                if (typeof window.render3DOptionsUI === 'function') window.render3DOptionsUI();
                
                if (age <= 15) showCustomError(`อายุ ${age} ปี ซื้อชดเชยสูงสุดได้ ${cappedHbfVal.replace('HBF', '')} บาท`);
                else showCustomError(`ทุนประกัน ${formatNum(fSum)} ซื้อชดเชยสูงสุดได้ ${cappedHbfVal.replace('HBF', '')} บาท`);
            }

            let hxPrem = getHealthRate('HX', hxVal, age, currentGender);
            let hxoPrem = getHealthRate('HXO', hxoVal, age, currentGender);
            let hxdPrem = getHealthRate('HXD', hxdVal, age, currentGender);
            let hbfPrem = getHealthRate('HBF', hbfVal, age, currentGender);
            let mfPrem = getHealthRate('MF', mfVal, age, currentGender);
            
            let totalHealthPrem = hxPrem + hxoPrem + hxdPrem + hbfPrem + mfPrem;

            if (source === 'sum') {
                let basePrem = clRate > 0 ? (fSum / 1000) * (clRate - getDiscount(fSum, clPlan)) : 0;
                fPrem = basePrem + totalHealthPrem;
                document.getElementById('premiumInput').value = Math.round(fPrem).toLocaleString();
            } else {
                fPrem = getSafeValue('premiumInput') || 0;
                let basePrem = fPrem - totalHealthPrem;
                if(basePrem < 0) basePrem = 0;
                
                let baseDiscountArray = [2, 1, 0];
                for (let d_val of baseDiscountArray) { 
                    let s = (basePrem * 1000) / (clRate - d_val); 
                    if (getDiscount(s, clPlan) === d_val) { fSum = s; break; } 
                } 
                if (fSum === 0) fSum = clRate > 0 ? (basePrem * 1000) / clRate : 0;
                
                if (enforceMin && fSum < config.minSum) {
                    fSum = config.minSum;
                    basePrem = (fSum / 1000) * (clRate - getDiscount(fSum, clPlan)); 
                    fPrem = basePrem + totalHealthPrem;
                    document.getElementById('premiumInput').value = Math.round(fPrem).toLocaleString();
                }
                if (enforceMin && fPrem < config.minPrem) {
                    showCustomError(`เบี้ยประกันขั้นต่ำ ต้องไม่น้อยกว่า ${config.minPrem.toLocaleString()} บาท/ปี`);
                    fPrem = config.minPrem;
                    basePrem = fPrem - totalHealthPrem;
                    fSum = 0;
                    for (let d_val of baseDiscountArray) { 
                        let s = (basePrem * 1000) / (clRate - d_val); 
                        if (getDiscount(s, clPlan) === d_val) { fSum = s; break; } 
                    } 
                    if (fSum === 0) fSum = clRate > 0 ? (basePrem * 1000) / clRate : 0;
                    document.getElementById('sumInsuredInput').value = formatNum(fSum);
                    document.getElementById('premiumInput').value = Math.round(fPrem).toLocaleString();
                }
                
                document.getElementById('sumInsuredInput').value = formatNum(fSum);
            }
        }
        // ---------------- 5. แบบประกันทั่วไป (CX, TLA, LPB, SLB, CL) ----------------
        else {
            let rateKey = currentPlan === 'TLA' ? 'TLA_RATES' : currentPlan;
            // 100CL shares 90CL rates (no separate rate table exists)
            if (rateKey === '100CL') rateKey = '90CL';

            // ดึงค่า LIFE_RATES จาก Object ตามอายุ (ใช้ index ของ array)
            const lifeRateArr = LIFE_RATES[rateKey]?.[currentGender];
            const lifeRate = (lifeRateArr && lifeRateArr[age] !== undefined) ? lifeRateArr[age] : 0;

            // ดึงค่า CI_RATES จาก Object ตามอายุ (ใช้ index ของ array)
            const ciRateArr = CI_RATES[rateKey]?.[currentGender];
            const ciRate = (ciRateArr && ciRateArr[age] !== undefined) ? ciRateArr[age] : 0;

            // รวมเรททั้งสองส่วนเข้าด้วยกัน
            const totalRate = lifeRate + ciRate;

            let mfPrem = getHealthRate('MF', window.currentMF, age, currentGender);

            if (totalRate > 0) {
                const _minS = currentAppPlan === 'Century Life' ? getCLMinSum() : config.minSum;
                if (source === 'sum') {
                    if (enforceMin && fSum < _minS) {
                        fSum = _minS;
                        document.getElementById('sumInsuredInput').value = formatNum(fSum);
                    }
                    // คำนวณเบี้ยจากทุน: (ทุน/1000) * (เรทรวม - ส่วนลด)
                    let basePrem = (fSum / 1000) * (totalRate - getDiscount(fSum, currentPlan));
                    fPrem = Math.round(basePrem) + mfPrem;
                    document.getElementById('premiumInput').value = Math.round(fPrem).toLocaleString();
                } else {
                    // คำนวณทุนจากเบี้ย (ย้อนกลับ)
                    fPrem = getSafeValue('premiumInput') || 0;
                    let basePrem = fPrem - mfPrem;
                    if(basePrem < 0) basePrem = 0;

                    let baseDiscountArray = [3, 2, 1.5, 1, 0.5, 0];
                    for (let d_val of baseDiscountArray) {
                        let s = (basePrem * 1000) / (totalRate - d_val);
                        if (getDiscount(s, currentPlan) === d_val) { fSum = s; break; }
                    }
                    if (fSum === 0) fSum = (basePrem * 1000) / totalRate;

                    if (enforceMin && fSum < _minS) {
                        fSum = _minS;
                        fPrem = Math.round((fSum / 1000) * (totalRate - getDiscount(fSum, currentPlan))) + mfPrem;
                        document.getElementById('premiumInput').value = Math.round(fPrem).toLocaleString();
                    }
                    document.getElementById('sumInsuredInput').value = formatNum(fSum);
                }
            }
        }
        
        let yearsStr = '20'; const matchYears = currentPlan.match(/\d+/); if (matchYears) yearsStr = matchYears[0];
        let cashFlowVal = 0;
        if(currentAppPlan === 'Whole Life Extra') cashFlowVal = getSafeValue('cashFlowInput1');
        else cashFlowVal = getSafeValue('cashFlowInput');
        
        highlightActivePills(fSum, fPrem, cashFlowVal);
        lastCalculationData = { premium: fPrem, sum: fSum, gender: currentGender==='male'?'ชาย':'หญิง', age: age, years: yearsStr, cashFlow: cashFlowVal }; 
        
        if (typeof refreshAllDisplays === 'function') refreshAllDisplays(); 
        
        return lastCalculationData; 
    } catch (err) {
        console.error("[Calculate Error]: ", err);
        return null;
    }
}
