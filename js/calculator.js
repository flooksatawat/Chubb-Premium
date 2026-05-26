// ==================== JS LOGIC & UTILITIES ====================
const setText = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };
const formatNum = (num) => { const rounded = Math.round(num * 100) / 100; return Number.isInteger(rounded) ? rounded.toLocaleString() : rounded.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}); };
const formatPct = (num) => { return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + '%'; };
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
window.currentHBF = 0;
window.currentMF = 'ไม่เลือก';

// ==================== DATA ARCHITECTURE & CONFIG ====================
let LIFE_RATES = {};
let CI_RATES = {};
let COM_RATES = {};

// ตั้งค่าขั้นต่ำและพื้นฐานของแต่ละแผน
const PLAN_CONFIG = {
    "CI Extra Plus": { abbr: "CX", minAge: 0, maxAge: 65, minSum: 200000, minPrem: 4000, getMaxSum: (age) => age <= 15 ? 3000000 : 10000000, options: ['10CX', '20CX'], hasCashFlow: false },
    "Signature Legacy": { abbr: "SLB", minAge: 0, maxAge: 70, minSum: 5000000, minPrem: 0, getMaxSum: (age) => 500000000, options: ['5SLB', '10SLB'], hasCashFlow: false },
    "Life Protector 20": { abbr: "LPB", minAge: 0, maxAge: 70, minSum: 100000, minPrem: 0, getMaxSum: (age) => Infinity, options: ['20LPB'], hasCashFlow: false },
    "Supreme Life Protector": { abbr: "SLPA", minAge: 0, maxAge: 70, minSum: 100000, minPrem: 0, getMaxSum: (age) => Infinity, options: ['20SLPA'], hasCashFlow: false },
    "Whole Life Extra": { abbr: "WXN", minAge: 0, maxAge: 65, minSum: 100000, minPrem: 50000, getMaxSum: (age) => Infinity, options: ['WXN10', 'WXN15'], hasCashFlow: true },
    "24 TX": { abbr: "TX", minAge: 0, maxAge: 55, minSum: 100000, minPrem: 50000, getMaxSum: (age) => Infinity, options: ['24TX'], hasCashFlow: true },
    "868 / 818 Elite Saving": { abbr: "Elite", minAge: 0, maxAge: 65, minSum: 100000, minPrem: 50000, getMaxSum: (age) => Infinity, options: ['S868', 'S818'], hasCashFlow: true },
    "LifeTime Value": { abbr: "LV", minAge: 0, maxAge: 55, minSum: 80000, minPrem: 4000, getMaxSum: (age) => Infinity, options: ['10LV', '15LV', '20LV'], hasCashFlow: true },
    "Century Life": { abbr: "CL", minAge: 11, maxAge: 75, minSum: 100000, minPrem: 4000, getMaxSum: (age) => Infinity, options: ['10CL', '20CL', '60CL', '90CL', '100CL'], hasCashFlow: false },
    "3D Health Excellence": { abbr: "3D", minAge: 11, maxAge: 75, minSum: 100000, minPrem: 4000, getMaxSum: (age) => Infinity, options: ['10CL', '20CL', '60CL', '90CL', '100CL'], hasCashFlow: false },
    "Convertable Term": { abbr: "TLA", minAge: 20, maxAge: 65, minSum: 1000000, minPrem: 4000, getMaxSum: (age) => Infinity, options: ['TLA'], hasCashFlow: false },
    "Smart Plan 21/7": { abbr: "7SM", minAge: 0, maxAge: 70, minSum: 100000, minPrem: 0, getMaxSum: (age) => Infinity, options: ['7SM'], hasCashFlow: true },
    "Medical Fund": { abbr: "MF", minAge: 0, maxAge: 99, minSum: 0, minPrem: 0, getMaxSum: (age) => Infinity, options: [], hasCashFlow: false }
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
    { name: "LifeTime Value", desc: "ออมยาว รับเงินคืนทุกปี ถึงอายุ 100", icon: "fas fa-hourglass-half", color: "text-violet-500", bg: "bg-violet-100" },
    { name: "Smart Plan 21/7", desc: "ออมทรัพย์ รับเงินคืน 19 ปี ครบสัญญา 212%", icon: "fas fa-seedling", color: "text-teal-500", bg: "bg-teal-100" },
    { name: "Medical Fund", desc: "ประกันสุขภาพ เลือกบริษัท/แผน/ค่าห้อง", icon: "fas fa-hospital", color: "text-sky-500", bg: "bg-sky-100" }
];

async function loadAllRates() {
    const rateFiles = [
        'cx_rates.json', 'ci_rates.json', 'lp_rates.json', 'slb_rates.json', 'slpa_rates.json',
        'tx_rates.json', 'elite_rates.json', 'lv_rates.json', 'cl_rates.json', 'tla_rates.json',
        'hx_rates.json', 'hxd_rates.json', 'hxo_rates.json', '3d_health.json',
        'hbf_rates.json', 'wxn_rates.json', 'tpd_rates.json', 'sm_rates.json', 'dd50_rates.json'
    ];
    try {
        for (const file of rateFiles) {
            try {
                const r = await fetch(`data/rates/${file}`);
                if (r.ok) { 
                    const d = await r.json(); 
                    if (file === 'ci_rates.json') {
                        CI_RATES = { ...CI_RATES, ...d };
                    } else if (file === 'tpd_rates.json' || d.TPD_RATES) {
                        window.TPD_RATES = d.TPD_RATES || d;
                    } else if (file === 'dd50_rates.json' || d.DD50_RATES) {
                        window.DD50_RATES = d.DD50_RATES || d;
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

    // ส่วนของ TPD Super Care Rider
    if (categoryKey === 'TPD') {
        const tpdSource = window.TPD_RATES;
        if (!tpdSource) return 0;
        const sa = parseInt(planName) || 0;
        if (sa <= 0) return 0;
        const classKey = 'class_12'; // ชั้นอาชีพ 1&2 เป็นค่า default
        const genderKey = (gender === 'male' || (gender || '').includes('ชาย')) ? 'male' : 'female';
        const ageKey = String(Math.min(Math.max(age, 0), 99));
        const rate = tpdSource[classKey]?.[genderKey]?.[ageKey];
        if (rate === undefined) return 0;
        return Math.round((sa / 1000) * rate);
    }

    // ส่วนของ DD50 — โรคร้ายแรง 50 โรค (CX rider)
    if (categoryKey === 'DD50') {
        const ddSource = window.DD50_RATES;
        if (!ddSource) return 0;
        const sa = parseInt(planName) || 0;
        if (sa <= 0) return 0;
        const genderKey = (gender === 'male' || (gender || '').includes('ชาย')) ? 'male' : 'female';
        // อายุที่ออกใหม่ 16-65 (ต่ออายุได้ถึง 84)
        if (age < 16 || age > 84) return 0;
        const rate = ddSource[genderKey]?.[String(age)];
        if (rate === undefined) return 0;
        return Math.round((sa / 1000) * rate);
    }

    // ส่วนของ HBF — สูตร: (ค่าชดเชยรายวัน / 100) * Rate_HBF
    if (categoryKey === 'HBF') {
        const dailyAmt = parseInt(planName) || 0;
        if (dailyAmt <= 0) return 0;
        let hbfSource = window.HBF_RATES || LIFE_RATES['HBF_RATES'];
        if (hbfSource && hbfSource['class_1']) {
            const ageKey = String(Math.min(age, 69));
            const rateFromClass = hbfSource['class_1'][ageKey];
            if (rateFromClass !== undefined && rateFromClass > 0) {
                return Math.round((dailyAmt / 100) * rateFromClass);
            }
        }
        return 0;
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
    let hbfAmount = parseInt(hbfVal) || 0;
    if (hbfAmount <= 0) return 0;

    const hardExclusions = {
        workAbroad: false, livingAbroad: false, studyingAbroad: false,
        isMonkNun: false, isPriest: false
    };
    for (const key in hardExclusions) {
        if (hardExclusions[key]) return 0;
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

    // round down to nearest 100
    hbfAmount = Math.floor(hbfAmount / 100) * 100;
    return hbfAmount;
}

function getCLMinSum() {
    if (currentAppPlan === 'LifeTime Value') return (currentPlan === '10LV') ? 80000 : 100000;
    if (currentAppPlan !== 'Century Life') return PLAN_CONFIG[currentAppPlan]?.minSum || 100000;
    return ['60CL', '90CL', '100CL'].includes(currentPlan) ? 150000 : 100000;
}

function getPlanAgeLimit(planName, appPlanName) {
    const config = PLAN_CONFIG[appPlanName] || { maxAge: 75, minAge: 11 };
    let max = config.maxAge;
    if (appPlanName === 'Century Life' && planName === '60CL') max = 55;
    return { min: config.minAge !== undefined ? config.minAge : 11, max };
}

function _clampAgeWithWarn(val, limits, planLabel) {
    if (val < limits.min) {
        showCustomError(`${planLabel} รับประกันตั้งแต่อายุ ${limits.min} ปี`);
        val = limits.min;
    } else if (val > limits.max) {
        showCustomError(`${planLabel} รับประกันสูงสุดถึงอายุ ${limits.max} ปี`);
        val = limits.max;
    }
    return val;
}

function _getPlanLabel() {
    if (currentAppPlan === 'Whole Life Extra') return `แผน ${currentPlan}`;
    if (currentAppPlan === 'Century Life') return `แผน ${currentPlan}`;
    if (currentAppPlan === '3D Health Excellence') return `แผน ${currentPlan}`;
    if (currentAppPlan === '24 TX') return 'แผน 24TX';
    if (currentAppPlan === '868 / 818 Elite Saving') return `แผน ${currentPlan}`;
    if (currentAppPlan === 'LifeTime Value') return `แผน ${currentPlan}`;
    return `แผน ${currentPlan || currentAppPlan}`;
}

function forceAgeValidation() {
    const input = document.getElementById('ageInput');
    let val = parseInt(input.value) || 0;
    const limits = getPlanAgeLimit(currentPlan, currentAppPlan);

    // Plan-specific overrides (tighter than PLAN_CONFIG)
    if (currentAppPlan === 'Whole Life Extra') {
        if (currentPlan === 'WXN10') {
            if (val > 50) { val = 50; showCustomError("แผน WXN10 รับประกันสูงสุดถึงอายุ 50 ปี"); }
        } else if (currentPlan === 'WXN15') {
            if (val < 11) { val = 11; showCustomError("แผน WXN15 รับประกันตั้งแต่อายุ 11 ปี"); }
            else if (val > 45) { val = 45; showCustomError("แผน WXN15 รับประกันสูงสุดถึงอายุ 45 ปี"); }
        }
    } else if (currentAppPlan === 'Century Life' && currentPlan === '60CL' && val > 55) {
        val = 55;
        showCustomError("แผน CL60 รับอายุสูงสุด 55 ปี");
    } else if (currentAppPlan === 'LifeTime Value') {
        if (val < 0) val = 0;
        if (currentPlan === '15LV' && val > 45) { val = 45; showCustomError("แผน 15LV รับประกันสูงสุดถึงอายุ 45 ปี"); }
        else if (currentPlan === '20LV' && val > 40) { val = 40; showCustomError("แผน 20LV รับประกันสูงสุดถึงอายุ 40 ปี"); }
        else if (currentPlan === '10LV' && val > 55) { val = 55; showCustomError("แผน 10LV รับประกันสูงสุดถึงอายุ 55 ปี"); }
    } else {
        val = _clampAgeWithWarn(val, limits, _getPlanLabel());
    }
    input.value = val;
    calculate(currentMode, true);
}

function adjustAge(delta) {
    const input = document.getElementById('ageInput');
    let val = parseInt(input.value) + delta;
    const limits = getPlanAgeLimit(currentPlan, currentAppPlan);

    if (currentAppPlan === 'Whole Life Extra') {
        if (currentPlan === 'WXN10') {
            if (val > 50) { val = 50; showCustomError("แผน WXN10 รับประกันสูงสุดถึงอายุ 50 ปี"); }
        } else if (currentPlan === 'WXN15') {
            if (val < 11) { val = 11; showCustomError("แผน WXN15 รับประกันตั้งแต่อายุ 11 ปี"); }
            else if (val > 45) { val = 45; showCustomError("แผน WXN15 รับประกันสูงสุดถึงอายุ 45 ปี"); }
        }
    } else if (currentAppPlan === 'Century Life' && currentPlan === '60CL' && val > 55) {
        val = 55;
        showCustomError("แผน CL60 รับอายุสูงสุด 55 ปี");
    } else if (currentAppPlan === 'LifeTime Value') {
        if (val < 0) val = 0;
        if (currentPlan === '15LV' && val > 45) { val = 45; showCustomError("แผน 15LV รับประกันสูงสุดถึงอายุ 45 ปี"); }
        else if (currentPlan === '20LV' && val > 40) { val = 40; showCustomError("แผน 20LV รับประกันสูงสุดถึงอายุ 40 ปี"); }
        else if (currentPlan === '10LV' && val > 55) { val = 55; showCustomError("แผน 10LV รับประกันสูงสุดถึงอายุ 55 ปี"); }
    } else {
        val = _clampAgeWithWarn(val, limits, _getPlanLabel());
    }
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

function setQuickSum(val) { document.getElementById('sumInsuredInput').value = val.toLocaleString('en-US'); calculate('sum', true); }
function setQuickPremium(val) { document.getElementById('premiumInput').value = val.toLocaleString('en-US'); calculate('premium', true); }
function setQuickCashFlow(val) { const el = document.getElementById('cashFlowInput'); if(el) { el.value = val.toLocaleString(); calculate('cashflow', true); } }
function setWXNQuickCashFlow(val, type) {
    if (type === 1) { document.getElementById('cashFlowInput1').value = val.toLocaleString(); calculate('cashflow1', true); }
    else if (type === 2) { document.getElementById('cashFlowInput2').value = val.toLocaleString(); calculate('cashflow2', true); }
}

window.adjustSum = function(delta) {
    const el = document.getElementById('sumInsuredInput');
    const cur = parseInt((el.value || '').replace(/,/g, '')) || 0;
    const next = Math.max(0, cur + delta);
    el.value = next.toLocaleString('en-US');
    calculate('sum', true);
};
window.adjustPremium = function(delta) {
    const el = document.getElementById('premiumInput');
    const cur = parseInt((el.value || '').replace(/,/g, '')) || 0;
    const next = Math.max(0, cur + delta);
    el.value = next.toLocaleString('en-US');
    calculate('premium', true);
};
window.adjustCashFlow = function(delta, type) {
    const idMap = { 0: 'cashFlowInput', 1: 'cashFlowInput1', 2: 'cashFlowInput2' };
    const el = document.getElementById(idMap[type || 0]);
    if (!el) return;
    const cur = parseInt((el.value || '').replace(/,/g, '')) || 0;
    const next = Math.max(0, cur + delta);
    el.value = next.toLocaleString('en-US');
    if (type === 1) calculate('cashflow1', true);
    else if (type === 2) calculate('cashflow2', true);
    else calculate('cashflow', true);
};

function _getTPDMax() {
    const mainSum = parseInt((document.getElementById('sumInsuredInput')?.value || '').replace(/,/g, '')) || 0;
    return mainSum * 2;
}

window.adjustTPD = function(delta) {
    const el = document.getElementById('tpdSAInput');
    if (!el) return;
    const cur = parseInt((el.value || '').replace(/,/g, '')) || 0;
    const max = _getTPDMax();
    const next = Math.min(Math.max(0, cur + delta), max);
    if (next === max && delta > 0) showCustomError(`ซื้อ TPD ได้สูงสุด ${max.toLocaleString()} บาท (2×ทุนหลัก)`);
    el.value = next.toLocaleString('en-US');
    window.currentTPDSA = String(next);
    window.refreshTPDPills && window.refreshTPDPills();
    calculate(typeof currentMode !== 'undefined' ? currentMode : 'sum', true);
};

window.setTPDMultiplier = function(mult) {
    const mainSum = parseInt((document.getElementById('sumInsuredInput')?.value || '').replace(/,/g, '')) || 0;
    const v = Math.min(Math.round(mainSum * mult), _getTPDMax());
    const el = document.getElementById('tpdSAInput');
    if (el) el.value = v.toLocaleString('en-US');
    window.currentTPDSA = String(v);
    window.refreshTPDPills && window.refreshTPDPills();
    calculate(typeof currentMode !== 'undefined' ? currentMode : 'sum', true);
};

window.refreshTPDPills = function() {
    const pillRow = document.getElementById('tpdPillRow');
    if (!pillRow) return;
    const mainSum = parseInt((document.getElementById('sumInsuredInput')?.value || '').replace(/,/g, '')) || 0;
    const curTPD = parseInt((document.getElementById('tpdSAInput')?.value || '').replace(/,/g, '')) || 0;
    const mults = [0.5, 1, 1.5, 2];
    const labels = ['×½', '×1', '×1.5', '×2'];
    pillRow.innerHTML = mults.map((m, i) => {
        const v = Math.round(mainSum * m);
        const isSel = curTPD === v && v > 0;
        const cls = isSel
            ? 'w-full text-center py-1.5 text-[11px] font-bold text-orange-600 bg-white shadow rounded-xl border border-orange-200/60 transition-all'
            : 'w-full text-center py-1.5 text-[11px] font-medium text-slate-500 hover:bg-white/60 rounded-xl transition-all';
        return `<button onclick="window.setTPDMultiplier(${m})" class="${cls}">${labels[i]}</button>`;
    }).join('');
};

// ==================== DD50 (CX rider) ====================
// เงื่อนไข: ทุน ≤ min(5×ทุนหลัก, 10,000,000) · ขั้นต่ำ 100,000 · อายุออกใหม่ 16-65
function _getDD50Max() {
    const mainSum = parseInt((document.getElementById('sumInsuredInput')?.value || '').replace(/,/g, '')) || 0;
    return Math.min(mainSum * 5, 10000000);
}
function _getDD50Min() { return 100000; }

window.adjustDD50 = function(delta) {
    const el = document.getElementById('dd50SAInput');
    if (!el) return;
    const cur = parseInt((el.value || '').replace(/,/g, '')) || 0;
    const max = _getDD50Max();
    let next = Math.min(Math.max(0, cur + delta), max);
    if (next === max && delta > 0) showCustomError(`ซื้อ DD50 ได้สูงสุด ${max.toLocaleString()} บาท (5×ทุนหลัก หรือไม่เกิน 10 ล้าน)`);
    el.value = next.toLocaleString('en-US');
    window.currentDD50SA = String(next);
    window.refreshDD50Pills && window.refreshDD50Pills();
    calculate(typeof currentMode !== 'undefined' ? currentMode : 'sum', true);
};

window.setDD50Multiplier = function(mult) {
    const mainSum = parseInt((document.getElementById('sumInsuredInput')?.value || '').replace(/,/g, '')) || 0;
    const v = Math.min(Math.round(mainSum * mult), _getDD50Max());
    const el = document.getElementById('dd50SAInput');
    if (el) el.value = v.toLocaleString('en-US');
    window.currentDD50SA = String(v);
    window.refreshDD50Pills && window.refreshDD50Pills();
    calculate(typeof currentMode !== 'undefined' ? currentMode : 'sum', true);
};

window.refreshDD50Pills = function() {
    const pillRow = document.getElementById('dd50PillRow');
    if (!pillRow) return;
    const mainSum = parseInt((document.getElementById('sumInsuredInput')?.value || '').replace(/,/g, '')) || 0;
    const curDD = parseInt((document.getElementById('dd50SAInput')?.value || '').replace(/,/g, '')) || 0;
    const mults = [1, 2, 3, 4, 5];
    const labels = ['×1', '×2', '×3', '×4', '×5'];
    pillRow.innerHTML = mults.map((m, i) => {
        const v = Math.min(Math.round(mainSum * m), _getDD50Max());
        const isSel = curDD === v && v > 0;
        const cls = isSel
            ? 'w-full text-center py-1.5 text-[11px] font-bold text-rose-600 bg-white shadow rounded-xl border border-rose-200/60 transition-all'
            : 'w-full text-center py-1.5 text-[11px] font-medium text-slate-500 hover:bg-white/60 rounded-xl transition-all';
        return `<button onclick="window.setDD50Multiplier(${m})" class="${cls}">${labels[i]}</button>`;
    }).join('');
};

// ==================== LOGIC: คำนวณหลัก (MASTER CALCULATION) ====================
function calculate(source, enforceMin = false) { 
    try {
        currentMode = source;
        let ageInput = document.getElementById('ageInput');
        let age = parseInt(ageInput.value) || 0;

        if (currentAppPlan === 'Medical Fund') { if (window.mfInlineRender) window.mfInlineRender(); return; }

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

        if (currentAppPlan === 'LifeTime Value') {
            if (currentPlan === '15LV' && age > 45) age = 45;
            if (currentPlan === '20LV' && age > 40) age = 40;
            if (currentPlan === '10LV' && age > 55) age = 55;
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

        let dd50Prem = 0;
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

        // ---------------- 3b. LifeTime Value (LV) ----------------
        else if (currentAppPlan === 'LifeTime Value') {
            // 10LV แยกเป็น 10LVA (อายุ <= 49) และ 10LVB (อายุ 50-55)
            let lvRateKey = currentPlan;
            if (currentPlan === '10LV') lvRateKey = age <= 49 ? '10LVA' : '10LVB';
            let lvRate = LIFE_RATES[lvRateKey]?.[currentGender]?.[age] || 0;

            if (lvRate > 0) {
                let mfPrem = getHealthRate('MF', window.currentMF, age, currentGender);

                if (source === 'cashflow') {
                    // เงินคืนปีแรก = 1% ของทุนประกัน
                    let cf = getSafeValue('cashFlowInput');
                    fSum = Math.round(cf / 0.01);
                    fPrem = Math.round((fSum / 1000) * lvRate) + mfPrem;
                } else if (source === 'sum') {
                    fSum = Math.round(getSafeValue('sumInsuredInput'));
                    fPrem = Math.round((fSum / 1000) * lvRate) + mfPrem;
                } else {
                    fPrem = getSafeValue('premiumInput') || 0;
                    let basePrem = fPrem - mfPrem;
                    if (basePrem < 0) basePrem = 0;
                    // ไม่มีส่วนลดทุนประกันสำหรับ LV
                    fSum = lvRate > 0 ? Math.round((basePrem * 1000) / lvRate) : 0;
                }

                let minLvSum = (currentPlan === '10LV') ? 80000 : 100000;
                if (enforceMin && fSum < minLvSum) {
                    fSum = minLvSum;
                    fPrem = Math.round((fSum / 1000) * lvRate) + mfPrem;
                }
                if (enforceMin && fPrem < config.minPrem) {
                    showCustomError(`เบี้ยประกันขั้นต่ำ ต้องไม่น้อยกว่า ${config.minPrem.toLocaleString()} บาท/ปี`);
                    fPrem = config.minPrem;
                    let basePrem = fPrem - mfPrem;
                    fSum = lvRate > 0 ? Math.round((basePrem * 1000) / lvRate) : 0;
                }

                document.getElementById('sumInsuredInput').value = formatNum(fSum);
                document.getElementById('premiumInput').value = Math.round(fPrem).toLocaleString();
                if (document.getElementById('cashFlowInput')) document.getElementById('cashFlowInput').value = Math.round(fSum * 0.01).toLocaleString();
            }
        }

        // ---------------- 3c. Smart Plan 21/7 (7SM) ----------------
        else if (currentAppPlan === 'Smart Plan 21/7') {
            let smRate = LIFE_RATES['7SM']?.[currentGender]?.[age] || 275;
            let mfPrem = getHealthRate('MF', window.currentMF, age, currentGender);

            if (source === 'cashflow') {
                let cf = getSafeValue('cashFlowInput');
                fSum = Math.round(cf / 0.02);
                fPrem = Math.round((fSum / 1000) * smRate) + mfPrem;
            } else if (source === 'sum') {
                fSum = Math.round(getSafeValue('sumInsuredInput'));
                fPrem = Math.round((fSum / 1000) * smRate) + mfPrem;
            } else {
                fPrem = getSafeValue('premiumInput') || 0;
                let basePrem = fPrem - mfPrem;
                if (basePrem < 0) basePrem = 0;
                fSum = smRate > 0 ? Math.round((basePrem * 1000) / smRate) : 0;
            }

            if (enforceMin && fSum < config.minSum) {
                fSum = config.minSum;
                fPrem = Math.round((fSum / 1000) * smRate) + mfPrem;
            }

            document.getElementById('sumInsuredInput').value = formatNum(fSum);
            document.getElementById('premiumInput').value = Math.round(fPrem).toLocaleString();
            if (document.getElementById('cashFlowInput')) document.getElementById('cashFlowInput').value = Math.round(fSum * 0.02).toLocaleString();
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
            let hbfVal = window.currentHBF || 0;
            let mfVal = window.currentMF && window.currentMF !== '' ? window.currentMF : 'ไม่เลือก';

            let cappedHbfVal = validateAndCapHBF(hbfVal, age, 'adult', '', '', fSum, 0);
            if (hbfVal !== cappedHbfVal && cappedHbfVal !== undefined) {
                hbfVal = cappedHbfVal;
                window.currentHBF = cappedHbfVal;
                if (typeof window.render3DOptionsUI === 'function') window.render3DOptionsUI();

                if (age <= 15) showCustomError(`อายุ ${age} ปี ซื้อชดเชยสูงสุดได้ ${cappedHbfVal.toLocaleString()} บาท/วัน`);
                else showCustomError(`ทุนประกัน ${formatNum(fSum)} ซื้อชดเชยสูงสุดได้ ${cappedHbfVal.toLocaleString()} บาท/วัน`);
            }

            let hxPrem = getHealthRate('HX', hxVal, age, currentGender);
            let hxoPrem = getHealthRate('HXO', hxoVal, age, currentGender);
            let hxdPrem = getHealthRate('HXD', hxdVal, age, currentGender);
            let hbfPrem = getHealthRate('HBF', hbfVal, age, currentGender);
            let mfPrem = getHealthRate('MF', mfVal, age, currentGender);
            const _rawTPDSA3d = window.currentTPDEnabled ? (parseInt(window.currentTPDSA) || 0) : 0;
            const _cappedTPDSA3d = Math.min(_rawTPDSA3d, fSum * 2);
            const _tpdSA3d = String(_cappedTPDSA3d);
            let tpdPrem = getHealthRate('TPD', _tpdSA3d, age, currentGender);

            let totalHealthPrem = hxPrem + hxoPrem + hxdPrem + hbfPrem + mfPrem + tpdPrem;
            let _3dClBasePrem = 0;

            if (source === 'sum') {
                let basePrem = clRate > 0 ? (fSum / 1000) * (clRate - getDiscount(fSum, clPlan)) : 0;
                _3dClBasePrem = basePrem;
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
                _3dClBasePrem = basePrem;
                document.getElementById('sumInsuredInput').value = formatNum(fSum);
            }
            window._3dPremData = { clBasePrem: _3dClBasePrem, hxPrem, hxoPrem, hxdPrem, hbfPrem, tpdPrem, hxVal, hxoVal, hxdVal, hbfVal, clPlan, tpdSA: _tpdSA3d };
        }
        // ---------------- 5. แบบประกันทั่วไป (CX, TLA, LPB, SLB, CL) ----------------
        else {
            let rateKey = currentPlan.includes('TLA') ? 'TLA_RATES' : currentPlan;
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
            const _rawTPDSA = window.currentTPDEnabled ? (parseInt(window.currentTPDSA) || 0) : 0;
            // ใช้ค่าจาก input โดยตรง (ทำงานได้ทั้ง sum/prem mode)
            const _fSumForCap = getSafeValue('sumInsuredInput') || fSum;
            const _cappedTPDSA = _fSumForCap > 0 ? Math.min(_rawTPDSA, _fSumForCap * 2) : _rawTPDSA;
            if (window.currentTPDEnabled && _rawTPDSA > _fSumForCap * 2 && _fSumForCap > 0) {
                const capDisp = document.getElementById('tpdPremDisplay');
                if (capDisp) capDisp.textContent = `ซื้อ TPD ได้สูงสุด ${(_fSumForCap*2).toLocaleString()} บาท (2×ทุนหลัก)`;
            }
            const _tpdSAStr = String(_cappedTPDSA);
            let tpdPrem = getHealthRate('TPD', _tpdSAStr, age, currentGender);
            _generalTPDPrem = tpdPrem;

            // DD50 (CX only): cap ทุน ≤ min(5×ทุนหลัก, 10M); อายุ 16-65 จึงคิดเบี้ย
            dd50Prem = 0;
            let _cappedDD50SA = 0;
            if (currentAppPlan === 'CI Extra Plus' && window.currentDD50Enabled) {
                const _rawDD50SA = parseInt(window.currentDD50SA) || 0;
                const _dd50Cap = Math.min((_fSumForCap || fSum) * 5, 10000000);
                _cappedDD50SA = _fSumForCap > 0 ? Math.min(_rawDD50SA, _dd50Cap) : _rawDD50SA;
                if (age >= 16 && age <= 65) {
                    dd50Prem = getHealthRate('DD50', String(_cappedDD50SA), age, currentGender);
                }
            }

            if (totalRate > 0) {
                const _minS = currentAppPlan === 'Century Life' ? getCLMinSum() : config.minSum;
                const _maxS = config.getMaxSum ? config.getMaxSum(age) : Infinity;
                if (source === 'sum') {
                    if (enforceMin && fSum < _minS) {
                        fSum = _minS;
                        document.getElementById('sumInsuredInput').value = formatNum(fSum);
                    }
                    if (fSum > _maxS) {
                        fSum = _maxS;
                        document.getElementById('sumInsuredInput').value = formatNum(fSum);
                        if (currentAppPlan === 'CI Extra Plus' && age < 16) {
                            showCustomError('อายุต่ำกว่า 16 ปี — วงเงินสูงสุด 3,000,000 บาท');
                        }
                    }
                    // คำนวณเบี้ยจากทุน: (ทุน/1000) * (เรทรวม - ส่วนลด)
                    let basePrem = (fSum / 1000) * (totalRate - getDiscount(fSum, currentPlan));
                    fPrem = Math.round(basePrem) + mfPrem + tpdPrem + dd50Prem;
                    // CX+DD50: แสดงเฉพาะเบี้ย CX ในช่องออมเงิน (ไม่รวม DD50)
                    const _cxDispPrem = (currentAppPlan === 'CI Extra Plus' && dd50Prem > 0) ? fPrem - dd50Prem : fPrem;
                    document.getElementById('premiumInput').value = Math.round(_cxDispPrem).toLocaleString();
                } else {
                    // คำนวณทุนจากเบี้ย (ย้อนกลับ)
                    // CX+DD50: premiumInput แสดง CX-only ดังนั้นต้องบวก dd50Prem กลับก่อนคำนวณย้อนกลับ
                    const _isCXDD50 = currentAppPlan === 'CI Extra Plus' && dd50Prem > 0;
                    fPrem = getSafeValue('premiumInput') || 0;
                    if (_isCXDD50) fPrem = fPrem + dd50Prem;
                    let basePrem = fPrem - mfPrem - tpdPrem - dd50Prem;
                    if(basePrem < 0) basePrem = 0;

                    let baseDiscountArray = [3, 2, 1.5, 1, 0.5, 0];
                    for (let d_val of baseDiscountArray) {
                        let s = (basePrem * 1000) / (totalRate - d_val);
                        if (getDiscount(s, currentPlan) === d_val) { fSum = s; break; }
                    }
                    if (fSum === 0) fSum = (basePrem * 1000) / totalRate;

                    if (fSum > _maxS) {
                        fSum = _maxS;
                        fPrem = Math.round((fSum / 1000) * (totalRate - getDiscount(fSum, currentPlan))) + mfPrem + tpdPrem + dd50Prem;
                        const _cd2 = _isCXDD50 ? fPrem - dd50Prem : fPrem;
                        document.getElementById('premiumInput').value = Math.round(_cd2).toLocaleString();
                    }
                    if (enforceMin && fSum < _minS) {
                        fSum = _minS;
                        fPrem = Math.round((fSum / 1000) * (totalRate - getDiscount(fSum, currentPlan))) + mfPrem + tpdPrem + dd50Prem;
                        const _cd3 = _isCXDD50 ? fPrem - dd50Prem : fPrem;
                        document.getElementById('premiumInput').value = Math.round(_cd3).toLocaleString();
                    }
                    document.getElementById('sumInsuredInput').value = formatNum(fSum);
                }
            }
        }

        // CX underage: disable ปุ่ม 5 ล้าน เมื่ออายุ < 16
        const _sumPill5 = document.getElementById('sumPill5');
        if (currentAppPlan === 'CI Extra Plus' && _sumPill5) {
            if (age < 16) {
                _sumPill5.disabled = true;
                _sumPill5.classList.add('opacity-30', 'cursor-not-allowed');
            } else {
                _sumPill5.disabled = false;
                _sumPill5.classList.remove('opacity-30', 'cursor-not-allowed');
            }
        }
        
        let yearsStr = '20'; const matchYears = currentPlan.match(/\d+/); if (matchYears) yearsStr = matchYears[0];
        let cashFlowVal = 0;
        if(currentAppPlan === 'Whole Life Extra') cashFlowVal = getSafeValue('cashFlowInput1');
        else cashFlowVal = getSafeValue('cashFlowInput');
        
        highlightActivePills(fSum, fPrem, cashFlowVal);
        const _tlaTpdPrem = (currentAppPlan === 'Convertable Term' && window.currentTPDEnabled) ? (typeof tpdPrem !== 'undefined' ? tpdPrem : 0) : 0;
        const _cxDD50Prem = (currentAppPlan === 'CI Extra Plus' && window.currentDD50Enabled) ? (typeof dd50Prem !== 'undefined' ? dd50Prem : 0) : 0;
        const _cxDD50SA = (currentAppPlan === 'CI Extra Plus' && window.currentDD50Enabled) ? (window.currentDD50SA || '0') : '0';
        lastCalculationData = { premium: fPrem, sum: fSum, gender: currentGender==='male'?'ชาย':'หญิง', age: age, years: yearsStr, cashFlow: cashFlowVal, ...(window._3dPremData || {}), tpdPrem: window._3dPremData?.tpdPrem ?? _tlaTpdPrem, tpdSA: window._3dPremData?.tpdSA ?? (window.currentTPDEnabled ? (window.currentTPDSA || '0') : '0'), dd50Prem: _cxDD50Prem, dd50SA: _cxDD50SA };
        
        if (typeof refreshAllDisplays === 'function') refreshAllDisplays();

        return lastCalculationData;
    } catch (err) {
        console.error("[Calculate Error]: ", err);
        return null;
    }
}

// ==================== CASH FLOW PLAN: PROPORTIONAL REDUCTION (LPB / SLPA) ====================
// STRICT BASE RULE: initial SA is always 120,000 regardless of the calculated sum.
// Supports 3 modes: 'auto' (binary-search max equal withdrawal), 'continuous' (startYear–endYear), 'specific' (year list).
function _binarySearchMaxWithdrawal(age, gender, planKey, baseSA, startYear, endYear) {
    const cvData = window.cvDataLookup || {};
    const maxYear = 90 - age;
    function simulate(amount) {
        let currentSA = baseSA;
        for (let y = 1; y <= maxYear; y++) {
            if (y < startYear || y > endYear) continue;
            let cvRate = 0;
            const planData = cvData[planKey];
            if (planData && planData[gender]) {
                const ageData = planData[gender][age.toString()];
                if (ageData && ageData[y.toString()] !== undefined) cvRate = ageData[y.toString()];
            }
            const cvBefore = Math.round((currentSA * cvRate) / 1000);
            if (cvBefore <= 0 || amount >= cvBefore) return false;
            currentSA = Math.round(currentSA * (1 - amount / cvBefore));
            if (currentSA <= 0) return false;
        }
        return true;
    }
    let lo = 1, hi = 9999999, best = 0;
    for (let i = 0; i < 30; i++) {
        const mid = Math.floor((lo + hi) / 2);
        if (simulate(mid)) { best = mid; lo = mid + 1; }
        else hi = mid - 1;
    }
    return best;
}

function calculatePartialSurrenderPlan(params) {
    const BASE_SA = (lastCalculationData && lastCalculationData.sum > 0)
        ? Math.round(lastCalculationData.sum)
        : 120000;
    const cvData = window.cvDataLookup || {};
    const { age, gender, planKey, mode, startYear, endYear, amount, specificYears } = params;

    const payYears = 20;
    const maxYear  = 90 - age;

    // Build withdrawal schedule: year -> amount
    const withdrawalSchedule = {};
    let autoAmount = 0;

    if (mode === 'single') {
        withdrawalSchedule[params.singleYear] = amount;
    } else if (mode === 'continuous') {
        for (let y = startYear; y <= endYear; y++) withdrawalSchedule[y] = amount;
    } else if (mode === 'specific') {
        (specificYears || []).forEach(y => { withdrawalSchedule[y] = amount; });
    } else if (mode === 'auto') {
        const sY = startYear || 1;
        const eY = endYear   || maxYear;
        autoAmount = _binarySearchMaxWithdrawal(age, gender, planKey, BASE_SA, sY, eY);
        for (let y = sY; y <= eY; y++) withdrawalSchedule[y] = autoAmount;
    }

    const basePrem = (lastCalculationData && lastCalculationData.premium > 0)
        ? Math.round(lastCalculationData.premium)
        : 0;

    let rows = [];
    let currentSA    = BASE_SA;
    let totalSaving  = 0;
    let totalCashOut = 0;
    let isLapsed     = false;

    for (let y = 1; y <= maxYear; y++) {
        const currentAge = age + y;

        let cvRate = 0;
        const planData = cvData[planKey];
        if (planData && planData[gender]) {
            const ageData = planData[gender][age.toString()];
            if (ageData && ageData[y.toString()] !== undefined) cvRate = ageData[y.toString()];
        }

        let annualSaving = 0;
        if (!isLapsed && y <= payYears) {
            annualSaving = Math.round((currentSA / BASE_SA) * basePrem);
            totalSaving += annualSaving;
        }

        const cvBefore = isLapsed ? 0 : Math.round((currentSA * cvRate) / 1000);

        let withdrawal = 0;
        let lapseFlag  = false;
        let newSA      = currentSA;

        if (!isLapsed && withdrawalSchedule[y] !== undefined && cvBefore > 0) {
            const w = withdrawalSchedule[y];
            if (w >= cvBefore) {
                withdrawal = cvBefore;
                newSA      = 0;
                lapseFlag  = true;
            } else {
                withdrawal = w;
                newSA      = Math.round(currentSA * (1 - w / cvBefore));
            }
            totalCashOut += withdrawal;
        }

        currentSA = newSA;
        if (lapseFlag) isLapsed = true;

        const cvAfter = isLapsed ? 0 : Math.round((currentSA * cvRate) / 1000);

        rows.push({
            year: y, age: currentAge,
            annualSaving, totalSaving,
            cvBefore, withdrawal, cvAfter,
            deathBenefit: currentSA,
            totalCashOut, lapseFlag
        });

        if (isLapsed) break;
    }

    return { rows, totalCashOut, finalSA: currentSA, baseSA: BASE_SA, autoAmount };
}

function cfFormatNum(el) {
    const v = el.value.replace(/[^0-9]/g, '');
    if (v) el.value = parseInt(v, 10).toLocaleString();
}
