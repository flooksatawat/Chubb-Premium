// ==================================================================================
// 🧠 SMART COMMAND PARSER v3.0
// ==================================================================================
// Voice-first: เข้าใจภาษาไทยพูดตามธรรมชาติ ไม่ต้องพูดตามฟอร์แมต
// รองรับทั้ง Text Input และ Voice Command
// ==================================================================================

// ------------------------------------------------------------------
// 1. PLAN ALIAS MAP — รวม alias เสียงพูดจริงที่ ASR มักถอดเป็น
// ------------------------------------------------------------------
const PLAN_ALIASES = [
    // CI Extra Plus
    { keys: [
        'ci extra plus','ci extra','extra plus','ซีไอ เอ็กซ์ตร้า','ซีไอเอ็กซ์ตร้า',
        'โรคร้ายพิเศษ','โรคร้าย','ซีไอ','ซี ไอ เอ็กซ์ตร้า','20cx','10cx','cx',
        'extra','ซีไอเอ็กซ์','ci'
    ], plan: 'CI Extra Plus' },

    // Life Protector 20
    { keys: [
        'life protector','ไลฟ์โปรเทคเตอร์','ไลฟ์ โปร','life pro','protector',
        'lpb','lp20','20lpb','ไลฟ์','บำนาญ','lp',
    ], plan: 'Life Protector 20' },

    // Supreme Life Protector
    { keys: [
        'supreme life protector','supreme life','supreme protector',
        'ซูพรีม ไลฟ์','ซูพรีม','สุพรีม','slpa','20slpa','ซูพรีมไลฟ์'
    ], plan: 'Supreme Life Protector' },

    // Signature Legacy
    { keys: [
        'signature legacy','ซิกเนเจอร์ เลกาซี่','ซิกเนเจอร์','เลกาซี่',
        'legacy','มรดก','slb','99/5','5slb','10slb','ซิก'
    ], plan: 'Signature Legacy' },

    // Convertable Term
    { keys: [
        'convertable term','convert term','คอนเวิร์ต','เทิร์ม','term',
        'tla','ประกันชั่วคราว','ชั่วคราว','คอนเวิร์ทเทิร์ม'
    ], plan: 'Convertable Term' },

    // Century Life
    { keys: [
        'century life','เซนจูรี่ ไลฟ์','เซนจูรี่','ตลอดชีพ','century',
        'cl','10cl','20cl','60cl','90cl','เซนจูรีไลฟ์'
    ], plan: 'Century Life' },

    // 3D Health Excellence — เสียงพูดมักได้ยากหลายรูปแบบ
    { keys: [
        '3d health excellence','3d health','3d excellence','ทรีดี เฮลธ์',
        'ทรีดีเฮลธ์','ทรีดี','สุขภาพ 3d','สุขภาพสามดี','สามดี','3d','สุขภาพ',
        'เฮลธ์','3 d','สาม ดี'
    ], plan: '3D Health Excellence' },

    // Whole Life Extra
    { keys: [
        'whole life extra','whole life','โฮลไลฟ์ เอ็กซ์ตร้า','โฮลไลฟ์',
        'wxn','wxn10','wxn15','ดับเบิ้ลยูเอ็กซ์เอ็น','โฮล','10wxn','15wxn'
    ], plan: 'Whole Life Extra' },

    // 24 TX
    { keys: [
        '24 tx','24tx','ยี่สิบสี่ ทีเอ็กซ์','ทเวนตี้โฟร์','24 ทีเอ็กซ์',
        '24ทีเอ็กซ์','ยี่สิบสี่ที เอ็กซ์','ทีเอ็กซ์','tx'
    ], plan: '24 TX' },

    // 868 / 818 Elite Saving
    { keys: [
        '868 818 elite','868/818','868 818','elite saving','อีลีท เซฟวิ่ง',
        'อีลีท','elite','868','818','s868','s818','อีลิท'
    ], plan: '868 / 818 Elite Saving' },

    // Medical Fund
    { keys: ['medical fund','เมดิคัล ฟันด์','เมดิคัล','medical'], plan: 'Medical Fund' },
];

// ------------------------------------------------------------------
// 2. THAI NUMBER PARSER
// รองรับ: "3 แสน 5 หมื่น", "1.5 ล้าน", "500,000", "50k", "สองแสน"
// ------------------------------------------------------------------
const THAI_DIGIT_WORDS = {
    'ศูนย์':0,'หนึ่ง':1,'สอง':2,'สาม':3,'สี่':4,'ห้า':5,
    'หก':6,'เจ็ด':7,'แปด':8,'เก้า':9,'สิบ':10,
    'ยี่สิบ':20,'สามสิบ':30,'สี่สิบ':40,'ห้าสิบ':50,
    'หกสิบ':60,'เจ็ดสิบ':70,'แปดสิบ':80,'เก้าสิบ':90,
};

function parseThaiNumber(text) {
    if (!text) return NaN;
    let t = text.replace(/,/g, '').trim();

    const UNITS = [
        { re: /ล้าน/, mult: 1_000_000 },
        { re: /แสน/, mult: 100_000 },
        { re: /หมื่น/, mult: 10_000 },
        { re: /พัน/, mult: 1_000 },
        { re: /[kK]/, mult: 1_000 },
        { re: /[mM]/, mult: 1_000_000 },
    ];

    // จับกลุ่ม: ตัวเลข + หน่วย (รองรับหลายกลุ่มเช่น "3 แสน 5 หมื่น")
    const tokenRe = /([\d]+(?:\.[\d]+)?)\s*(ล้าน|แสน|หมื่น|พัน|[kKmM])/g;
    let m, total = 0, matched = false;
    while ((m = tokenRe.exec(t)) !== null) {
        const num = parseFloat(m[1]);
        if (isNaN(num)) continue;
        matched = true;
        let mult = 1;
        for (const u of UNITS) { if (u.re.test(m[2])) { mult = u.mult; break; } }
        total += num * mult;
    }
    if (matched) return Math.round(total);

    // ตัวเลขอาราบิค ล้วนๆ
    const plain = t.match(/^[\d]+(?:\.[\d]+)?$/);
    if (plain) return Math.round(parseFloat(plain[0]));

    return NaN;
}

// ------------------------------------------------------------------
// 3. PLAN DETECTOR — เรียง alias ยาวก่อนป้องกัน partial match
// ------------------------------------------------------------------
function detectPlan(text) {
    const t = text.toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();

    // เรียงทุก entry ตาม key ที่ยาวที่สุดก่อน
    const flat = [];
    for (const entry of PLAN_ALIASES) {
        for (const key of entry.keys) {
            flat.push({ key, plan: entry.plan });
        }
    }
    flat.sort((a, b) => b.key.length - a.key.length);

    for (const { key, plan } of flat) {
        if (t.includes(key)) return plan;
    }
    return null;
}

// ------------------------------------------------------------------
// 4. AGE EXTRACTOR — แยกอายุออกจากตัวเลขอื่น
// ------------------------------------------------------------------
function extractAge(t) {
    // pattern 1: "อายุ 35" หรือ "อายุสามสิบห้า"
    let m = t.match(/(?:อายุ|age)\s*(\d{1,2})/i);
    if (m) { const v = parseInt(m[1]); if (v >= 1 && v <= 85) return v; }

    // pattern 2: ตัวเลข 1-2 หลักตามหลัง เพศ
    m = t.match(/(?:ชาย|หญิง|ผู้ชาย|ผู้หญิง)\s+(\d{1,2})(?!\s*(?:ปี|ล้าน|แสน|หมื่น|พัน))/);
    if (m) { const v = parseInt(m[1]); if (v >= 1 && v <= 85) return v; }

    // pattern 3: ตัวเลข 1-2 หลักตามหลัง เพศ + ช่องว่าง (ไม่ตามด้วยหน่วยเงิน)
    m = t.match(/\b(\d{1,2})\s+(?:ปี\s+)?(?:ทุน|ออม|เบี้ย|ค่าห้อง)/);
    if (m) { const v = parseInt(m[1]); if (v >= 1 && v <= 85) return v; }

    // pattern 4: ตัวเลข 1-2 หลักที่เหลือ (fallback) — ไม่ใช่ตัวเลขหน่วยเงิน
    const nums = [...t.matchAll(/\b(\d{1,2})\b/g)];
    for (const n of nums) {
        const v = parseInt(n[1]);
        if (v >= 15 && v <= 85) {
            // ตรวจว่าไม่ใช่ปี (มีคำว่า ปี ตาม)
            const after = t.slice(n.index + n[0].length, n.index + n[0].length + 5);
            if (!/^\s*ปี/.test(after)) return v;
        }
    }
    return null;
}

// ------------------------------------------------------------------
// 5. AMOUNT EXTRACTOR — จับจำนวนเงิน + ประเภท
// ------------------------------------------------------------------
function extractAmount(t) {
    // ลำดับความสำคัญ: ค่าห้อง > ทุน > ออม/เบี้ย > cashflow > fallback

    // ค่าห้อง (3D) — รองรับทั้ง "6000", "6 พัน", "6k"
    let m = t.match(/ค่าห้อง\s*([\d,]+(?:\.\d+)?(?:\s*(?:ล้าน|แสน|หมื่น|พัน|[kKmM]))?(?:\s+[\d,]+(?:\.\d+)?(?:\s*(?:ล้าน|แสน|หมื่น|พัน|[kKmM]))?)*)/);
    if (m) {
        const raw = m[1];
        // ถ้ามีหน่วยใช้ parseThaiNumber, ถ้าไม่มีหน่วยใช้ parseInt โดยตรง
        const v = /ล้าน|แสน|หมื่น|พัน|[kKmM]/.test(raw) ? parseThaiNumber(raw) : parseInt(raw.replace(/,/g,''));
        if (!isNaN(v) && v > 0) return { amount: v, type: 'room' };
    }

    // ทุน/วงเงิน
    const AMT = `([\\d,]+(?:\\.\\d+)?\\s*(?:ล้าน|แสน|หมื่น|พัน|[kKmM])?(?:\\s+[\\d,]+(?:\\.\\d+)?\\s*(?:ล้าน|แสน|หมื่น|พัน|[kKmM])?)*)`;
    m = t.match(new RegExp(`(?:ทุน|วงเงิน|คุ้มครอง)\\s*${AMT}`, 'i'));
    if (m) { const v = parseThaiNumber(m[1]); if (!isNaN(v) && v > 0) return { amount: v, type: 'sum' }; }

    // ออม/เบี้ย/จ่าย
    m = t.match(new RegExp(`(?:ออม|เบี้ย|จ่าย|ออมเงิน|เบี้ยประกัน)\\s*${AMT}`, 'i'));
    if (m) { const v = parseThaiNumber(m[1]); if (!isNaN(v) && v > 0) return { amount: v, type: 'premium' }; }

    // กระแสเงินสด
    m = t.match(new RegExp(`(?:กระแสเงินสด|cashflow|รับเงิน|คืนเงิน)\\s*${AMT}`, 'i'));
    if (m) { const v = parseThaiNumber(m[1]); if (!isNaN(v) && v > 0) return { amount: v, type: 'cashflow' }; }

    // fallback: ตัวเลขใหญ่ + หน่วย ที่ไม่มี prefix
    m = t.match(/([\d,]+(?:\.[\d]+)?)\s*(ล้าน|แสน|หมื่น|พัน)/);
    if (m) { const v = parseThaiNumber(m[1] + ' ' + m[2]); if (!isNaN(v) && v > 0) return { amount: v, type: 'sum' }; }

    // fallback: ตัวเลข 5+ หลัก
    m = t.match(/\b(\d{5,9})\b/);
    if (m) return { amount: parseInt(m[1]), type: 'sum' };

    return { amount: null, type: null };
}

// ------------------------------------------------------------------
// 6. YEARS EXTRACTOR
// ------------------------------------------------------------------
function extractYears(t, age) {
    // หาตัวเลข + ปี (ไม่ใช้ \b เพราะไม่ทำงานกับภาษาไทย)
    const all = [...t.matchAll(/(\d{1,2})\s*ปี/g)];
    for (const m of all) {
        const v = parseInt(m[1]);
        if (v === age) continue;           // ข้ามถ้าเป็นตัวเดียวกับอายุ
        if (v >= 5 && v <= 99) return v;   // valid plan years
    }
    return null;
}

// ------------------------------------------------------------------
// 7. MAIN PARSE FUNCTION
// ------------------------------------------------------------------
function parseCommand(rawText) {
    if (!rawText) return {};
    let text = rawText.toLowerCase();
    text = text.replace(/cf/gi, 'กระแสเงินสด');
    text = text.replace(/(\d+)\s*หมื่น/g, (match, p1) => p1 + '0000');
    text = text.replace(/(\d+)\s*แสน/g, (match, p1) => p1 + '00000');
    text = text.replace(/ก่อน\s*60/g, 'อายุ 31-60');
    text = text.replace(/หลัง\s*60/g, 'อายุ 60 ขึ้นไป');
    const t = text.replace(/\s+/g, ' ').trim();

    const result = {
        plan: null,
        gender: null,
        age: null,
        amount: null,
        amountType: null,
        years: null,
        hxRoom: null,
        raw: rawText,
    };

    // 7.1 Plan
    result.plan = detectPlan(t);

    // 7.2 Gender
    if (/ชาย|ผู้ชาย/.test(t))        result.gender = 'male';
    else if (/หญิง|ผู้หญิง/.test(t)) result.gender = 'female';

    // 7.3 Age
    result.age = extractAge(t);

    // 7.4 Amount + Type
    const { amount, type } = extractAmount(t);
    result.amount = amount;
    result.amountType = type;
    if (type === 'room') result.hxRoom = amount;

    // 7.5 Years
    result.years = extractYears(t, result.age);

    return result;
}

// ------------------------------------------------------------------
// 8. EXECUTE COMMAND
// ------------------------------------------------------------------
function executeCommand(parsed, showPopup = true) {
    const activePlan = parsed.plan || currentAppPlan;

    // 8.1 Switch plan
    if (parsed.plan && parsed.plan !== currentAppPlan) {
        if (typeof selectAppPlan === 'function') selectAppPlan(parsed.plan);
    }

    // 8.2 Gender
    if (parsed.gender && typeof setGender === 'function') setGender(parsed.gender);

    // 8.3 Age
    if (parsed.age !== null) {
        const el = document.getElementById('ageInput');
        if (el) { el.value = parsed.age; if (typeof forceAgeValidation === 'function') forceAgeValidation(); }
    }

    // 8.4 Plan duration (years → setPlan sub-option)
    if (parsed.years !== null && typeof setPlan === 'function') {
        const y = parsed.years;
        switch (activePlan) {
            case 'CI Extra Plus':        setPlan(y <= 10 ? '10CX'  : '20CX');  break;
            case 'Signature Legacy':     setPlan(y <= 5  ? '5SLB'  : '10SLB'); break;
            case 'Century Life':
            case '3D Health Excellence':
                if (y <= 10)      setPlan('10CL');
                else if (y <= 20) setPlan('20CL');
                else if (y <= 60) setPlan('60CL');
                else              setPlan('90CL');
                break;
            case 'Whole Life Extra':     setPlan(y <= 10 ? 'WXN10' : 'WXN15'); break;
        }
    }

    // 8.5 Amount + Calculate
    const plan = currentAppPlan;

    if (plan === '3D Health Excellence' && parsed.hxRoom) {
        const rMap = [[1500,'HX15'],[2000,'HX20'],[4000,'HX40'],[6000,'HX60'],[15000,'HX150'],[30000,'HX300']];
        const hxKey = rMap.reduce((p,c) => Math.abs(c[0]-parsed.hxRoom) < Math.abs(p[0]-parsed.hxRoom) ? c : p)[1];
        if (typeof window.handle3DClick === 'function') window.handle3DClick('HX', hxKey);
        if (typeof calculate === 'function') calculate('sum', true);
    } else if (['24 TX','868 / 818 Elite Saving','Whole Life Extra'].includes(plan)) {
        if (parsed.amountType === 'premium' && parsed.amount > 0) {
            const el = document.getElementById('premiumInput');
            if (el) el.value = parsed.amount.toLocaleString();
            if (typeof calculate === 'function') calculate('premium', true);
        } else if (parsed.amountType === 'cashflow' && parsed.amount > 0) {
            const el = document.getElementById('cashFlowInput');
            if (el) el.value = parsed.amount.toLocaleString();
            if (typeof calculate === 'function') calculate('cashflow', true);
        } else if (parsed.amount > 0) {
            const el = document.getElementById('sumInsuredInput');
            if (el) el.value = parsed.amount.toLocaleString();
            if (typeof calculate === 'function') calculate('sum', true);
        } else {
            if (typeof calculate === 'function') calculate(currentMode, true);
        }
    } else if (plan === 'Convertable Term') {
        if (parsed.amount > 0) {
            const el = document.getElementById('sumInsuredInput');
            if (el) el.value = parsed.amount.toLocaleString();
        }
        if (typeof calculate === 'function') calculate('sum', true);
    } else {
        if (parsed.amountType === 'sum' && parsed.amount > 0) {
            const el = document.getElementById('sumInsuredInput');
            if (el) el.value = parsed.amount.toLocaleString();
            if (typeof calculate === 'function') calculate('sum', true);
        } else if (parsed.amountType === 'premium' && parsed.amount > 0) {
            const el = document.getElementById('premiumInput');
            if (el) el.value = parsed.amount.toLocaleString();
            if (typeof calculate === 'function') calculate('premium', true);
        } else if (parsed.amount > 0) {
            const el = document.getElementById('sumInsuredInput');
            if (el) el.value = parsed.amount.toLocaleString();
            if (typeof calculate === 'function') calculate('sum', true);
        } else {
            if (typeof calculate === 'function') calculate(currentMode, true);
        }
    }

    // 8.6 Validate
    const d = typeof lastCalculationData !== 'undefined' ? lastCalculationData : null;
    if (!d || d.premium < 4000) {
        const msg = d
            ? `เบี้ยประกัน ${Math.round(d.premium||0).toLocaleString()} บาท ต่ำกว่าขั้นต่ำ 4,000 บาท/ปี`
            : 'ไม่สามารถคำนวณได้ กรุณาตรวจสอบข้อมูล';
        if (typeof showCustomError === 'function') showCustomError(msg);
        return null;
    }

    // 8.7 Popup
    if (showPopup && d && typeof showVoiceResultPopup === 'function') {
        showVoiceResultPopup(d);
    }
    return d;
}

// ------------------------------------------------------------------
// 9. ENTRY POINTS
// ------------------------------------------------------------------

/** Text Input → กด Enter หรือกดปุ่มส่ง */
function parseAndCalculate(text) {
    if (typeof parseCommand === 'function' && typeof executeCommand === 'function') {
        const parsed = parseCommand(text);
        executeCommand(parsed, false);
    }
    const modal = document.getElementById('planSelectModal');
    if (modal && !modal.classList.contains('hidden')) {
        if (typeof closePlanModal === 'function') closePlanModal(true);
    }
}

/** Voice Command */
function processVoiceCommand(transcript) {
    if (typeof parseCommand !== 'function') return;
    const parsed = parseCommand(transcript);

    const PLANS_NEED_YEARS = ['CI Extra Plus','Signature Legacy','Century Life','3D Health Excellence','Whole Life Extra'];
    const targetPlan = parsed.plan || (typeof currentAppPlan !== 'undefined' ? currentAppPlan : '');
    if (PLANS_NEED_YEARS.includes(targetPlan) && parsed.years === null) {
        const hint = {
            'CI Extra Plus':        '10 หรือ 20 ปี',
            'Signature Legacy':     '5 หรือ 10 ปี',
            'Century Life':         '10, 20, 60 หรือ 90 ปี',
            '3D Health Excellence': '10, 20, 60 หรือ 90 ปี',
            'Whole Life Extra':     '10 หรือ 15 ปี',
        };
        if (typeof showCustomError === 'function')
            showCustomError('กรุณาระบุระยะเวลาชำระ เช่น ' + (hint[targetPlan] || '10 ปี'));
        return;
    }
    if (typeof executeCommand === 'function') executeCommand(parsed, true);
}

// ------------------------------------------------------------------
// 10. DEBUG HELPER
// ------------------------------------------------------------------
window._testParser = function(text) {
    const p = parseCommand(text);
    console.table({
        แผน:       p.plan        || '(ใช้แผนปัจจุบัน)',
        เพศ:       p.gender      || '(ไม่ระบุ)',
        อายุ:      p.age         ?? '(ไม่ระบุ)',
        จำนวนเงิน: p.amount      ?? '(ไม่ระบุ)',
        ประเภท:    p.amountType  || '(ไม่ระบุ)',
        ระยะเวลา:  p.years       ?? '(ไม่ระบุ)',
        ค่าห้อง:   p.hxRoom      ?? '(ไม่ระบุ)',
    });
    return p;
};
