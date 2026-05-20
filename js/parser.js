// ==================================================================================
// 🧠 SMART COMMAND PARSER v4.0 — Insurance Agent Voice Edition
// ==================================================================================
// รองรับเสียงพูดหลากหลาย · เข้าใจศัพท์ตัวแทนประกัน · Normalize ASR errors
// ==================================================================================

// ------------------------------------------------------------------
// 1. PLAN ALIAS MAP
// ------------------------------------------------------------------
const PLAN_ALIASES = [
    { keys: [
        'ci extra plus','ci extra','extra plus','ซีไอ เอ็กซ์ตร้า','ซีไอเอ็กซ์ตร้า',
        'โรคร้ายพิเศษ','โรคร้าย','ซีไอ','ซี ไอ เอ็กซ์ตร้า','20cx','10cx','cx',
        'extra','ซีไอเอ็กซ์','ci','ซีไอเอ็กซ์ตร้าพลัส','ซีไอพลัส','ci plus',
        'ซีไอ extra','ซีไอextra','ซีไอเอ็กซ์','เอ็กซ์ตร้าพลัส','extraplus',
        'ซีไอ เอ็กซ์','โรคมะเร็ง','มะเร็ง','critical illness','critical',
        'ซี ไอ','c i extra','ci ex','ซีไออี','ซีไอพลัส','โรคร้ายแรง',
    ], plan: 'CI Extra Plus' },

    { keys: [
        'life protector','ไลฟ์โปรเทคเตอร์','ไลฟ์ โปร','life pro','protector',
        'lpb','lp20','20lpb','ไลฟ์','บำนาญ','lp','ไลฟ์โปร','โปรเทคเตอร์',
        'life protector 20','ไลฟ์โปรเท็คเตอร์','ไลฟ์ โปรเทคเตอร์','ไลฟ์ protector',
        'โปร เทคเตอร์','ไลฟ์ โปรเท็ค','lp 20','ไลฟ์บำนาญ','บำนาญ 20',
    ], plan: 'Life Protector 20' },

    { keys: [
        'supreme life protector','supreme life','supreme protector',
        'ซูพรีม ไลฟ์','ซูพรีม','สุพรีม','slpa','20slpa','ซูพรีมไลฟ์',
        'ซูพรีมไลฟ์โปรเทคเตอร์','ซูพรีม ไลฟ์ โปร','supreme','ซูพรีมไลฟ์ protector',
        'สุพรีมไลฟ์','ซูพรีมบำนาญ','ซู พรีม','supream','suprime',
    ], plan: 'Supreme Life Protector' },

    { keys: [
        'signature legacy','ซิกเนเจอร์ เลกาซี่','ซิกเนเจอร์','เลกาซี่',
        'legacy','มรดก','slb','99/5','5slb','10slb','ซิก',
        'ซิกเนเจอร์เลกาซี่','ซิกเนเจอร์ legacy','ซิก เนเจอร์','signature',
        'เลกาซี','เลกาสี','legacy life','ซิกเนเจอ','ซิกเนเจ่อ','ซิกเนเจ้อ',
        'ซิกเนเจอร์ เลกาซี','sig legacy','sig','มรดกชีวิต','ส่งมอบมรดก',
    ], plan: 'Signature Legacy' },

    { keys: [
        'convertable term','convert term','คอนเวิร์ต','เทิร์ม','term',
        'tla','ประกันชั่วคราว','ชั่วคราว','คอนเวิร์ทเทิร์ม',
        'convertible term','คอนเวิร์ทเทิร์ม','คอนเวิร์ตเทอม','term life',
        'ประกันระยะสั้น','คุ้มครองชั่วคราว','คอนเวอร์ท','convert','เทอม',
        'คอนเวิ','คอนเวิร์','tla 1','tla1',
    ], plan: 'Convertable Term' },

    { keys: [
        'century life','เซนจูรี่ ไลฟ์','เซนจูรี่','ตลอดชีพ','century',
        'cl','10cl','20cl','60cl','90cl','เซนจูรีไลฟ์',
        'เซ็นจูรี่','เซ็นจูรีไลฟ์','เซนจูรี','century life plan',
        'ตลอดชีวิต','whole life century','เซนจูรี่ไลฟ์','เซนจูรี life',
        'เซ็น จูรี่','เซน จูรี','100 ปี','คุ้มครองตลอดชีพ',
    ], plan: 'Century Life' },

    { keys: [
        '3d health excellence','3d health','3d excellence','ทรีดี เฮลธ์',
        'ทรีดีเฮลธ์','ทรีดี','สุขภาพ 3d','สุขภาพสามดี','สามดี','3d','สุขภาพ',
        'เฮลธ์','3 d','สาม ดี','ทรี ดี','3d health ex','3 d health',
        'ทรีดีเฮล','three d','สุขภาพ3d','ประกันสุขภาพ','เฮลท์','health excellence',
        'สุขภาพเฮลธ์','ทรีดีสุขภาพ','3d ex','สุขภาพทรีดี',
    ], plan: '3D Health Excellence' },

    { keys: [
        'whole life extra','whole life','โฮลไลฟ์ เอ็กซ์ตร้า','โฮลไลฟ์',
        'wxn','wxn10','wxn15','ดับเบิ้ลยูเอ็กซ์เอ็น','โฮล','10wxn','15wxn',
        'โฮล ไลฟ์','whole life ex','โฮลไลฟ์เอ็กซ์ตร้า','whole extra',
        'โฮล life','โอลไลฟ์','ตลอดชีพพิเศษ','ออมตลอดชีพ','wxn 10','wxn 15',
    ], plan: 'Whole Life Extra' },

    { keys: [
        '24 tx','24tx','ยี่สิบสี่ ทีเอ็กซ์','ทเวนตี้โฟร์','24 ทีเอ็กซ์',
        '24ทีเอ็กซ์','ยี่สิบสี่ที เอ็กซ์','ทีเอ็กซ์','tx',
        'ยี่สิบสี่ทีเอ็กซ์','24 t x','ทีเอ็กซ์ 24','24tx plan','twenty four',
        'ยี่สิบสี่','ออม 24','24ปี','ออม24ปี',
    ], plan: '24 TX' },

    { keys: [
        '868 818 elite','868/818','868 818','elite saving','อีลีท เซฟวิ่ง',
        'อีลีท','elite','868','818','s868','s818','อีลิท',
        'อีลีทเซฟวิ่ง','elite save','868elite','818elite','อีลีท saving',
        'แปดหกแปด','แปดหนึ่งแปด','เซฟวิ่ง','saving plan','อีลิทเซฟวิ่ง',
    ], plan: '868 / 818 Elite Saving' },

    { keys: [
        'medical fund','เมดิคัล ฟันด์','เมดิคัล','medical',
        'เมดิคัลฟันด์','medical fund plan','เมดิ','เมดิคอล','เมดิเคิล',
        'กองทุนสุขภาพ','กองทุนการแพทย์','med fund','medfund','เมด','เมดิคัล fund',
        'ประกันการแพทย์','ค่ารักษา','กองทุนค่ารักษา',
    ], plan: 'Medical Fund' },
];

// ------------------------------------------------------------------
// 2. ASR NORMALIZER — แก้คำที่ ASR มักถอดผิด
// ------------------------------------------------------------------
function normalizeASR(text) {
    const fixes = [
        // ตัวเลข / หน่วยเงิน
        [/\bเค\b/g, 'k'],
        [/\bเอ็ม\b/g, 'm'],
        [/ล้าน\s*บาท/g, 'ล้าน'],
        [/แสน\s*บาท/g, 'แสน'],
        [/หมื่น\s*บาท/g, 'หมื่น'],
        [/พัน\s*บาท/g, 'พัน'],
        [/บาท\s*ต่อ\s*ปี/g, ''],
        [/บาท\/ปี/g, ''],
        [/ต่อปี/g, ''],
        [/ปีละ/g, ''],
        // เพศ
        [/นาย\s*/g, 'ชาย '],
        [/นาง\s*สาว\s*/g, 'หญิง '],
        [/นาง\s*/g, 'หญิง '],
        [/mr\b/gi, 'ชาย '],
        [/ms\b/gi, 'หญิง '],
        [/mrs\b/gi, 'หญิง '],
        [/เพศ\s*ชาย/g, 'ชาย'],
        [/เพศ\s*หญิง/g, 'หญิง'],
        [/ผู้ชาย/g, 'ชาย'],
        [/ผู้หญิง/g, 'หญิง'],
        [/เขา/g, 'ชาย'],
        [/เธอ/g, 'หญิง'],
        // อายุ
        [/อายุ\s*(\d)/g, 'อายุ $1'],
        [/อายุ\s*ที่\s*/g, 'อายุ '],
        // จำนวนเงิน
        [/ครึ่ง\s*ล้าน/g, '500000'],
        [/ล้าน\s*ครึ่ง/g, '1500000'],
        [/หนึ่ง\s*ล้าน\s*ครึ่ง/g, '1500000'],
        [/สอง\s*ล้าน\s*ครึ่ง/g, '2500000'],
        [/สาม\s*ล้าน\s*ครึ่ง/g, '3500000'],
        [/ห้า\s*แสน/g, '500000'],
        // ประเภทเงิน
        [/จ่าย\s*ปีละ/g, 'เบี้ย '],
        [/ออม\s*ปีละ/g, 'ออม '],
        [/sa\b/gi, 'ทุน '],
        [/face\s*amount/gi, 'ทุน '],
        [/sum\s*assured/gi, 'ทุน '],
        [/วงเงิน\s*คุ้มครอง/g, 'ทุน '],
        [/เงินคุ้มครอง/g, 'ทุน '],
        [/เงิน\s*ออม/g, 'ออม '],
        [/เบี้ย\s*ประกัน/g, 'เบี้ย '],
        [/ค่า\s*เบี้ย/g, 'เบี้ย '],
        [/ค่า\s*ห้อง/g, 'ค่าห้อง '],
        // แผน / ระยะเวลา
        [/cf\b/gi, 'กระแสเงินสด '],
        [/cash\s*flow/gi, 'กระแสเงินสด '],
        [/ก่อน\s*60/g, 'อายุ 31-60'],
        [/หลัง\s*60/g, 'อายุ 60 ขึ้นไป'],
        // cleanup
        [/\s+/g, ' '],
    ];
    let t = text.toLowerCase();
    for (const [re, rep] of fixes) t = t.replace(re, rep);
    return t.trim();
}

// ------------------------------------------------------------------
// 3. THAI FULL-WORD NUMBER PARSER
// รองรับ: "สามสิบห้า"=35, "ห้าสิบ"=50, "หนึ่งร้อย"=100
// ------------------------------------------------------------------
const THAI_ONES  = {'ศูนย์':0,'หนึ่ง':1,'สอง':2,'สาม':3,'สี่':4,'ห้า':5,'หก':6,'เจ็ด':7,'แปด':8,'เก้า':9};
const THAI_TENS  = {'สิบ':10,'ยี่สิบ':20,'สามสิบ':30,'สี่สิบ':40,'ห้าสิบ':50,'หกสิบ':60,'เจ็ดสิบ':70,'แปดสิบ':80,'เก้าสิบ':90};
const THAI_LARGE = {'ร้อย':100,'พัน':1000,'หมื่น':10000,'แสน':100000,'ล้าน':1000000};

function parseThaiWordNumber(text) {
    // ลอง match รูปแบบ "สามสิบห้า", "ยี่สิบ", "สี่สิบห้า"
    let result = 0;
    let matched = false;
    let t = text;

    // ตัวเลขสิบ + หน่วย เช่น "สามสิบห้า"
    for (const [tensWord, tensVal] of Object.entries(THAI_TENS)) {
        if (t.includes(tensWord)) {
            result += tensVal;
            t = t.replace(tensWord, '');
            matched = true;
            break;
        }
    }
    // หน่วยเดี่ยว
    for (const [oneWord, oneVal] of Object.entries(THAI_ONES)) {
        if (t.includes(oneWord)) {
            result += oneVal;
            matched = true;
            break;
        }
    }
    return matched ? result : NaN;
}

function parseThaiNumber(text) {
    if (!text) return NaN;
    let t = text.replace(/,/g, '').trim();

    // รูปแบบ: ตัวเลขอาราบิค + หน่วย (หลายกลุ่ม)
    const tokenRe = /([\d]+(?:\.[\d]+)?)\s*(ล้าน|แสน|หมื่น|พัน|[kKmM])/g;
    let m, total = 0, matched = false;
    while ((m = tokenRe.exec(t)) !== null) {
        const num = parseFloat(m[1]);
        if (isNaN(num)) continue;
        matched = true;
        const unitMap = {'ล้าน':1e6,'แสน':1e5,'หมื่น':1e4,'พัน':1e3,'k':1e3,'K':1e3,'m':1e6,'M':1e6};
        total += num * (unitMap[m[2]] || 1);
    }
    if (matched) return Math.round(total);

    // ตัวเลขอาราบิคล้วน
    const plain = t.match(/^[\d]+(?:\.[\d]+)?$/);
    if (plain) return Math.round(parseFloat(plain[0]));

    // คำไทยล้วน: "สองแสนห้าหมื่น"
    const thaiLarge = [...Object.entries(THAI_LARGE)].sort((a,b) => b[1]-a[1]);
    let largeTotal = 0, largeMatched = false;
    let remaining = t;
    for (const [word, val] of thaiLarge) {
        const idx = remaining.indexOf(word);
        if (idx >= 0) {
            const before = remaining.slice(0, idx).trim();
            const num = parseThaiWordNumber(before) || 1;
            largeTotal += num * val;
            remaining = remaining.slice(idx + word.length);
            largeMatched = true;
        }
    }
    if (largeMatched) return Math.round(largeTotal);

    return NaN;
}

// ------------------------------------------------------------------
// 4. PLAN DETECTOR
// ------------------------------------------------------------------
function detectPlan(text) {
    const t = text.toLowerCase().replace(/\s+/g, ' ').trim();
    const flat = [];
    for (const entry of PLAN_ALIASES) {
        for (const key of entry.keys) flat.push({ key, plan: entry.plan });
    }
    flat.sort((a, b) => b.key.length - a.key.length);
    for (const { key, plan } of flat) {
        if (t.includes(key)) return plan;
    }
    return null;
}

// ------------------------------------------------------------------
// 5. AGE EXTRACTOR
// ------------------------------------------------------------------
function extractAge(t) {
    // "อายุ 35" / "อายุสามสิบห้า"
    let m = t.match(/(?:อายุ|age)\s*(\d{1,2})/i);
    if (m) { const v = parseInt(m[1]); if (v >= 0 && v <= 85) return v; }

    // อายุ + คำไทย
    m = t.match(/อายุ\s*((?:ยี่สิบ|สามสิบ|สี่สิบ|ห้าสิบ|หกสิบ|เจ็ดสิบ|แปดสิบ)[ก-๙]*)/);
    if (m) { const v = parseThaiWordNumber(m[1]); if (!isNaN(v) && v >= 1 && v <= 85) return v; }

    // เพศ + ตัวเลข
    m = t.match(/(?:ชาย|หญิง)\s+(\d{1,2})(?!\s*(?:ล้าน|แสน|หมื่น|พัน|k|m))/);
    if (m) { const v = parseInt(m[1]); if (v >= 1 && v <= 85) return v; }

    // ตัวเลข + "ทุน/ออม/เบี้ย"
    m = t.match(/\b(\d{1,2})\s+(?:ปี\s+)?(?:ทุน|ออม|เบี้ย|ค่าห้อง)/);
    if (m) { const v = parseInt(m[1]); if (v >= 1 && v <= 85) return v; }

    // fallback: ตัวเลข 2 หลัก 15-85
    const nums = [...t.matchAll(/\b(\d{1,2})\b/g)];
    for (const n of nums) {
        const v = parseInt(n[1]);
        if (v >= 15 && v <= 85) {
            const after = t.slice(n.index + n[0].length, n.index + n[0].length + 5);
            if (!/^\s*ปี/.test(after)) return v;
        }
    }
    return null;
}

// ------------------------------------------------------------------
// 6. AMOUNT EXTRACTOR
// ------------------------------------------------------------------
function extractAmount(t) {
    const AMT = `([\\d,]+(?:\\.\\d+)?(?:\\s*(?:ล้าน|แสน|หมื่น|พัน|[kKmM]))?(?:\\s+[\\d,]+(?:\\.\\d+)?(?:\\s*(?:ล้าน|แสน|หมื่น|พัน|[kKmM]))?)*)`;

    // ค่าห้อง
    let m = t.match(/ค่าห้อง\s*([\d,]+(?:\.\d+)?(?:\s*(?:ล้าน|แสน|หมื่น|พัน|[kKmM]))?(?:\s+[\d,]+(?:\.\d+)?(?:\s*(?:ล้าน|แสน|หมื่น|พัน|[kKmM]))?)*)/);
    if (m) {
        const raw = m[1];
        const v = /ล้าน|แสน|หมื่น|พัน|[kKmM]/.test(raw) ? parseThaiNumber(raw) : parseInt(raw.replace(/,/g,''));
        if (!isNaN(v) && v > 0) return { amount: v, type: 'room' };
    }

    // ทุน/วงเงิน/SA/คุ้มครอง
    m = t.match(new RegExp(`(?:ทุน|วงเงิน|คุ้มครอง|ทุนประกัน|face|sa)\\s*${AMT}`, 'i'));
    if (m) { const v = parseThaiNumber(m[1]); if (!isNaN(v) && v > 0) return { amount: v, type: 'sum' }; }

    // ออม/เบี้ย/จ่าย/premium
    m = t.match(new RegExp(`(?:ออม|เบี้ย|จ่าย|ออมเงิน|เบี้ยประกัน|premium|จ่ายปีละ|ออมปีละ)\\s*${AMT}`, 'i'));
    if (m) { const v = parseThaiNumber(m[1]); if (!isNaN(v) && v > 0) return { amount: v, type: 'premium' }; }

    // กระแสเงินสด/cashflow/รับเงิน
    m = t.match(new RegExp(`(?:กระแสเงินสด|cashflow|รับเงิน|คืนเงิน|รับคืน|cf)\\s*${AMT}`, 'i'));
    if (m) { const v = parseThaiNumber(m[1]); if (!isNaN(v) && v > 0) return { amount: v, type: 'cashflow' }; }

    // fallback: ตัวเลข + หน่วยใหญ่
    m = t.match(/([\d,]+(?:\.[\d]+)?)\s*(ล้าน|แสน|หมื่น|พัน)/);
    if (m) { const v = parseThaiNumber(m[1] + ' ' + m[2]); if (!isNaN(v) && v > 0) return { amount: v, type: 'sum' }; }

    // fallback: ตัวเลข 5+ หลัก
    m = t.match(/\b(\d{5,9})\b/);
    if (m) return { amount: parseInt(m[1]), type: 'sum' };

    return { amount: null, type: null };
}

// ------------------------------------------------------------------
// 7. YEARS EXTRACTOR
// ------------------------------------------------------------------
function extractYears(t, age) {
    // ตรวจจากชื่อแผนโดยตรงก่อน (10CX, 20CX, 10CL, 20CL, 60CL, 90CL, 5SLB, 10SLB, WXN10, WXN15 ฯลฯ)
    const planYearMatch = t.match(/\b(10|20|60|90|100|5|15)\s*(?:cx|cl|slb|lpb|slpa|wxn|tx)\b/i)
        || t.match(/\bwxn(10|15)\b/i)
        || t.match(/\btla\b/i);
    if (planYearMatch) {
        const y = parseInt(planYearMatch[1]);
        if (y && y >= 5 && y <= 100) return y;
    }

    // ลองจับตัวเลขที่มีคำว่า "ปี" ก่อน
    const all = [...t.matchAll(/(\d{1,3})\s*ปี/g)];
    for (const m of all) {
        const v = parseInt(m[1]);
        if (v === age) continue;
        if (v >= 5 && v <= 100) return v;
    }
    // fallback: ตัวเลขสุดท้ายในข้อความ = ระยะเวลาเสมอ (ถ้าอยู่ในช่วงสมเหตุสมผล)
    const VALID_YEARS = [5, 6, 7, 8, 10, 12, 15, 20, 25, 30, 60, 90, 99, 100];
    const nums = [...t.matchAll(/\b(\d{1,3})\b/g)].map(m => parseInt(m[1]));
    for (let i = nums.length - 1; i >= 0; i--) {
        const v = nums[i];
        if (v === age) continue;
        if (VALID_YEARS.includes(v)) return v;
    }
    return null;
}

// ------------------------------------------------------------------
// 8. MAIN PARSE FUNCTION
// ------------------------------------------------------------------
function parseCommand(rawText) {
    if (!rawText) return {};

    // normalize ก่อน parse
    const t = normalizeASR(rawText);

    const result = {
        plan: null, gender: null, age: null,
        amount: null, amountType: null, years: null,
        hxRoom: null, hxo: null, hbf: null,
        raw: rawText,
    };

    result.plan   = detectPlan(t);
    result.gender = /ชาย/.test(t) ? 'male' : /หญิง/.test(t) ? 'female' : null;
    result.age    = extractAge(t);

    const { amount, type } = extractAmount(t);
    result.amount     = amount;
    result.amountType = type;
    if (type === 'room') result.hxRoom = amount;

    result.years = extractYears(t, result.age);

    // 3D: default 100 ปี
    if (result.plan === '3D Health Excellence' && result.years === null) result.years = 100;

    // 3D: OPD
    if (result.plan === '3D Health Excellence') {
        const opdM = t.match(/(?:opd|โอพีดี|ผู้ป่วยนอก|ผู้ป่วย นอก)\s*([\d,]+)?/i);
        if (opdM) {
            const v = opdM[1] ? parseInt(opdM[1].replace(/,/g,'')) : NaN;
            const hxoMap = [[1000,'HXO10'],[2000,'HXO20'],[3000,'HXO30'],[5000,'HXO50']];
            result.hxo = !isNaN(v) && v > 0
                ? hxoMap.reduce((p,c) => Math.abs(c[0]-v) < Math.abs(p[0]-v) ? c : p)[1]
                : 'HXO10';
        }
        const hbfM = t.match(/(?:ชดเชย|ชดเชยรายวัน|รายวัน|ค่าชดเชย)\s*([\d,]+)?/);
        if (hbfM) {
            const v = hbfM[1] ? parseInt(hbfM[1].replace(/,/g,'')) : NaN;
            result.hbf = !isNaN(v) && v > 0
                ? Math.floor(Math.min(v, 5000) / 100) * 100
                : 1000;
        }
    }

    return result;
}

// ------------------------------------------------------------------
// 9. EXECUTE COMMAND
// ------------------------------------------------------------------
function executeCommand(parsed, showPopup = true) {
    const activePlan = parsed.plan || currentAppPlan;

    if (parsed.plan && parsed.plan !== currentAppPlan) {
        if (typeof selectAppPlan === 'function') selectAppPlan(parsed.plan);
    }
    if (parsed.gender && typeof setGender === 'function') setGender(parsed.gender);
    if (parsed.age !== null) {
        const el = document.getElementById('ageInput');
        if (el) { el.value = parsed.age; if (typeof forceAgeValidation === 'function') forceAgeValidation(); }
    }
    if (parsed.years !== null && typeof setPlan === 'function') {
        const y = parsed.years;
        switch (activePlan) {
            case 'CI Extra Plus':        setPlan(y <= 10 ? '10CX'  : '20CX');  break;
            case 'Signature Legacy':     setPlan(y <= 5  ? '5SLB'  : '10SLB'); break;
            case 'Century Life':
            case '3D Health Excellence':
                if (y <= 10)       setPlan('10CL');
                else if (y <= 20)  setPlan('20CL');
                else if (y <= 60)  setPlan('60CL');
                else if (y < 100)  setPlan('90CL');
                else               setPlan('100CL');
                break;
            case 'Whole Life Extra': setPlan(y <= 10 ? 'WXN10' : 'WXN15'); break;
        }
    }

    const plan = currentAppPlan;

    if (plan === '3D Health Excellence') {
        if (parsed.hxRoom) {
            const rMap = [[1500,'HX15'],[2000,'HX20'],[4000,'HX40'],[6000,'HX60'],[15000,'HX150'],[30000,'HX300']];
            const hxKey = rMap.reduce((p,c) => Math.abs(c[0]-parsed.hxRoom) < Math.abs(p[0]-parsed.hxRoom) ? c : p)[1];
            if (typeof window.handle3DClick === 'function') window.handle3DClick('HX', hxKey);
        } else if (!window.currentHX || window.currentHX === 'ไม่เลือก') {
            if (typeof window.handle3DClick === 'function') window.handle3DClick('HX', 'HX15');
        }
        if (parsed.hxo && typeof window.handle3DClick === 'function') window.handle3DClick('HXO', parsed.hxo);
        if (parsed.hbf && typeof window.handle3DClick === 'function') window.handle3DClick('HBF', parsed.hbf);
        if (parsed.amountType === 'sum' && parsed.amount > 0) {
            const el = document.getElementById('sumInsuredInput');
            if (el) el.value = parsed.amount.toLocaleString();
        } else {
            const el = document.getElementById('sumInsuredInput');
            const cur = parseInt((el?.value || '').replace(/,/g,'')) || 0;
            if (el && cur < 150000) el.value = '150,000';
        }
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

    const d = typeof lastCalculationData !== 'undefined' ? lastCalculationData : null;
    if (!d || d.premium < 4000) {
        const msg = d
            ? `เบี้ยประกัน ${Math.round(d.premium||0).toLocaleString()} บาท ต่ำกว่าขั้นต่ำ 4,000 บาท/ปี`
            : 'ไม่สามารถคำนวณได้ กรุณาตรวจสอบข้อมูล';
        if (typeof showCustomError === 'function') showCustomError(msg);
        return null;
    }
    if (showPopup && d && typeof showVoiceResultPopup === 'function') showVoiceResultPopup(d);
    return d;
}

// ------------------------------------------------------------------
// 10. ENTRY POINTS
// ------------------------------------------------------------------
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

function processVoiceCommand(transcript) {
    if (typeof parseCommand !== 'function') return;
    const parsed = parseCommand(transcript);

    const PLANS_NEED_YEARS = ['CI Extra Plus','Signature Legacy','Century Life','Whole Life Extra'];
    const targetPlan = parsed.plan || (typeof currentAppPlan !== 'undefined' ? currentAppPlan : '');
    if (PLANS_NEED_YEARS.includes(targetPlan) && parsed.years === null) {
        const hint = {
            'CI Extra Plus':    '10 หรือ 20 ปี',
            'Signature Legacy': '5 หรือ 10 ปี',
            'Century Life':     '10, 20, 60, 90 หรือ 100 ปี',
            'Whole Life Extra': '10 หรือ 15 ปี',
        };
        if (typeof showCustomError === 'function')
            showCustomError('กรุณาระบุระยะเวลาชำระ เช่น ' + (hint[targetPlan] || '10 ปี'));
        return;
    }
    if (typeof executeCommand === 'function') executeCommand(parsed, true);
}

// ------------------------------------------------------------------
// 11. DEBUG
// ------------------------------------------------------------------
window._testParser = function(text) {
    const p = parseCommand(text);
    console.table({
        แผน: p.plan || '(ใช้แผนปัจจุบัน)', เพศ: p.gender || '(ไม่ระบุ)',
        อายุ: p.age ?? '(ไม่ระบุ)', จำนวนเงิน: p.amount ?? '(ไม่ระบุ)',
        ประเภท: p.amountType || '(ไม่ระบุ)', ระยะเวลา: p.years ?? '(ไม่ระบุ)',
        ค่าห้อง: p.hxRoom ?? '(ไม่ระบุ)',
    });
    return p;
};
