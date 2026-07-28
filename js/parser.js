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
        '678 step','678step','678 สเตป','สเตป เซฟวิ่ง','สเตปเซฟวิ่ง','step savings',
        '678','a78','สเตป','step saving','678 เซฟวิ่ง',
    ], plan: '678 Step Savings' },

    { keys: [
        'lifetime value','life time value','ไลฟ์ไทม์ แวลู','ไลฟ์ไทม์แวลู',
        'ไลฟ์ไทม์','lv','10lv','15lv','20lv','แวลู','value',
        'แอลวี','lifetime','ไลฟ์ ไทม์','lv plan','ไลฟ์ไทม์ value',
        'ออมยาว','ออมถึง 100','คุ้มครองถึง 100',
    ], plan: 'LifeTime Value' },

    { keys: [
        'smart plan','สมาร์ท แพลน','สมาร์ทแพลน','7sm','21/7','21 7',
        'smart plan 21','สมาร์ท','7สมาร์ท','ออมสมาร์ท','สมาร์ทเพลน',
    ], plan: 'Smart Plan 21/7' },

    { keys: [
        'medical fund','เมดิคัล ฟันด์','เมดิคัล','medical',
        'เมดิคัลฟันด์','medical fund plan','เมดิ','เมดิคอล','เมดิเคิล',
        'กองทุนสุขภาพ','กองทุนการแพทย์','med fund','medfund','เมด','เมดิคัล fund',
        'ประกันการแพทย์','ค่ารักษา','กองทุนค่ารักษา',
    ], plan: 'Medical Fund' },
];

// ------------------------------------------------------------------
// 1b. MF COMPANY + PLAN ALIASES
// ------------------------------------------------------------------
const MF_COMPANY_ALIASES = [
    { keys: ['aia','เอไอเอ','a.i.a'],                                         id: 'AIA' },
    { keys: ['axa','แอ็กซ่า','แอกซ่า'],                                       id: 'AXA' },
    { keys: ['generali','เจนเนอราลี','เจนเนอราลี่','เจนเนอ'],                 id: 'GENERALI' },
    { keys: ['tokio','โตเกียว','โตเกียวมารีน'],                               id: 'TOKIO' },
    { keys: ['chubb hi','chubb health','chubb','ชับบ์'],                       id: 'CHUBB_HI' },
    { keys: ['bla','กรุงไทยแอ็กซ่า','กรุงไทยaxа','bangkok life'],            id: 'BLA' },
    { keys: ['กรุงเทพประกัน','กรุงเทพ','bangkok insurance','bangkok'],        id: 'BANGKOK' },
    { keys: ['fwd','เอฟดับบลิวดี','เอฟดับ'],                                  id: 'FWD' },
    { keys: ['azay','อาซา','อาซาย'],                                           id: 'AZAY' },
    { keys: ['เมืองไทย','muangthai'],                                          id: 'MUANGTHAI' },
    { keys: ['นวกิจ','navakij'],                                               id: 'NAVAKIJ' },
    { keys: ['tpb'],                                                            id: 'TPB' },
    { keys: ['วิริยะ','viriyah'],                                              id: 'VIRIYAH' },
    { keys: ['เอ็ทน่า','เอทน่า','etna'],                                      id: 'ETNA' },
];

const MF_PLAN_ALIASES = [
    { co:'AIA',       id:'HS',              keys:['h&s','เฮลท์แอนด์เซฟ','health saving','hs aia'] },
    { co:'AIA',       id:'HS_EXTRA',        keys:['h&s extra','hs extra','เฮลท์ extra'] },
    { co:'AIA',       id:'HS_PLUS_GOLD',    keys:['hs plus gold','plus gold','hs plus'] },
    { co:'AIA',       id:'HEALTH_HAPPY',    keys:['health happy','เฮลท์แฮปปี้','แฮปปี้'] },
    { co:'AIA',       id:'INFINITE',        keys:['infinite','อินฟินิต','infinite care'] },
    { co:'AXA',       id:'IHEALTHY_ULTRA',  keys:['ihealthy ultra','ไอเฮลท์ตี้ ultra','ultra'] },
    { co:'AXA',       id:'IHEALTHY',        keys:['ihealthy','ไอเฮลท์ตี้','ไอเฮลตี้'] },
    { co:'GENERALI',  id:'HEALTH_HERO',     keys:['health hero','เฮลท์ฮีโร่','ฮีโร่'] },
    { co:'GENERALI',  id:'HS_EXTRA_PLUS',   keys:['hs extra plus','เฮลท์ extra plus'] },
    { co:'GENERALI',  id:'HLS_EXTRA',       keys:['hls extra','hls'] },
    { co:'GENERALI',  id:'GEN_HB',          keys:['gen hb','hb generali'] },
    { co:'GENERALI',  id:'CANCER',          keys:['cancer generali','มะเร็ง generali'] },
    { co:'GENERALI',  id:'LS_PLUS_IPDOPD', keys:['lump sum plus ipd opd','ls plus ipd opd'] },
    { co:'GENERALI',  id:'LS_PLUS_IPD',    keys:['lump sum plus ipd','ls plus ipd'] },
    { co:'GENERALI',  id:'LS_IPDOPD',      keys:['lump sum ipd opd','ls ipd opd'] },
    { co:'GENERALI',  id:'LS_IPD',         keys:['lump sum ipd','ls ipd'] },
    { co:'TOKIO',     id:'HSHH_COPAY',     keys:['hshh copay','copay'] },
    { co:'TOKIO',     id:'HSHH',           keys:['hshh'] },
    { co:'TOKIO',     id:'GOOD_HEALTH',     keys:['good health','กู๊ดเฮลธ์','goodhealth'] },
    { co:'TOKIO',     id:'GOOD_HEALTH_PRIME', keys:['good health prime','กู๊ดเฮลธ์ไพรม์','goodhealth prime','prime'] },
    { co:'CHUBB_HI',  id:'HSPP',           keys:['hspp','เฮลท์โพรเทคเตอร์พลัส','health protector plus'] },
    { co:'CHUBB_HI',  id:'HSP',            keys:['hsp','เฮลท์โพรเทคเตอร์','health protector'] },
    { co:'BLA',       id:'PRESTIGE',       keys:['prestige','เพรสทีจ'] },
    { co:'BLA',       id:'HAPPY_HEALTH',   keys:['happy health bla','bla happy'] },
    { co:'BANGKOK',   id:'BBL_HEALTH_PLUS',keys:['bbl health plus','bbl health','bbl'] },
    { co:'BANGKOK',   id:'HAPPY_HEALTHY_OPD',keys:['happy healthy opd'] },
    { co:'BANGKOK',   id:'HAPPY_HEALTHY_IPD',keys:['happy healthy ipd','happy healthy'] },
    { co:'FWD',       id:'FWD_HEALTH',     keys:['fwd health','health fwd'] },
    { co:'AZAY',      id:'UNLOCK_ULTRA',   keys:['unlock ultra','ปลดล็อค','unlock'] },
    { co:'AZAY',      id:'FIRST_CLASS',    keys:['first class','เฟิร์สคลาส'] },
    { co:'MUANGTHAI', id:'ELITE_PLUS',     keys:['elite plus','อีลิท พลัส','อิลิทพลัส'] },
    { co:'MUANGTHAI', id:'D_HEALTH',       keys:['d health','ดีเฮลท์'] },
    { co:'MUANGTHAI', id:'ELITE_HEALTH',   keys:['elite health','อีลิทเฮลท์','อิลิทเฮลท์'] },
    { co:'NAVAKIJ',   id:'PADSIANG',       keys:['แปดเซียน','padsiang','8เซียน','8 เซียน'] },
    { co:'TPB',       id:'TPB_HEALTH',     keys:['tpb health'] },
    { co:'VIRIYAH',   id:'BDMS',           keys:['bdms','บีดีเอ็มเอส'] },
    { co:'VIRIYAH',   id:'UNJAIRUK_OPD',   keys:['อุ่นใจรักษ์ opd','อุ่นใจ opd'] },
    { co:'VIRIYAH',   id:'UNJAIRUK_IPD',   keys:['อุ่นใจรักษ์','อุ่นใจ'] },
    { co:'ETNA',      id:'ETNA_HEALTH',    keys:['etna health','ประกันสุขภาพ etna'] },
];

function detectMFCompany(t) {
    for (const co of MF_COMPANY_ALIASES) {
        for (const key of co.keys) {
            if (t.includes(key)) return co.id;
        }
    }
    return null;
}

function detectMFPlan(t, companyId) {
    const list = companyId
        ? MF_PLAN_ALIASES.filter(p => p.co === companyId)
        : MF_PLAN_ALIASES;
    for (const entry of list) {
        for (const key of entry.keys) {
            if (t.includes(key)) return { co: entry.co, id: entry.id };
        }
    }
    return null;
}

function extractMFRoom(t, planRoomRates) {
    // ค่าห้อง/ห้อง/วงเงิน + ตัวเลข
    let m = t.match(/(?:ค่าห้อง|ห้อง|วงเงิน|room)\s*([\d,]+)/i);
    if (m) return m[1].replace(/,/g, '');

    // ถ้ามี roomRates list ให้ match กับ text
    if (planRoomRates?.length) {
        // เรียงจากยาวไปสั้นเพื่อ match คำยาวก่อน
        const sorted = [...planRoomRates].sort((a,b) => b.length - a.length);
        for (const r of sorted) {
            if (t.includes(r.toLowerCase())) return r;
        }
    }

    // fallback: ตัวเลข 3-5 หลักที่ไม่ใช่อายุ/จำนวนเงิน (เช่น 1000, 2200, 5000)
    const numMatch = t.match(/\b(1[0-9]{3}|[2-9][0-9]{3}|[1-4][0-9]{4})\b/);
    if (numMatch) return numMatch[1];

    return null;
}

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
    // "อายุ 35" / "อายุสามสิบห้า" — keyword ชัดเจน รับ 1-99
    let m = t.match(/(?:อายุ|age)\s*(\d{1,2})/i);
    if (m) { const v = parseInt(m[1]); if (v >= 1 && v <= 99) return v; }

    // อายุ + คำไทย
    m = t.match(/อายุ\s*((?:ยี่สิบ|สามสิบ|สี่สิบ|ห้าสิบ|หกสิบ|เจ็ดสิบ|แปดสิบ)[ก-๙]*)/);
    if (m) { const v = parseThaiWordNumber(m[1]); if (!isNaN(v) && v >= 1 && v <= 99) return v; }

    // เพศ + ตัวเลข (รับ 1-75 เพื่อหลีกเลี่ยงชน amounts)
    m = t.match(/(?:ชาย|หญิง)\s+(\d{1,2})(?!\s*(?:ล้าน|แสน|หมื่น|พัน|k|m))/);
    if (m) { const v = parseInt(m[1]); if (v >= 1 && v <= 75) return v; }

    // ตัวเลข + "ทุน/ออม/เบี้ย"
    m = t.match(/\b(\d{1,2})\s+(?:ปี\s+)?(?:ทุน|ออม|เบี้ย|ค่าห้อง)/);
    if (m) { const v = parseInt(m[1]); if (v >= 1 && v <= 75) return v; }

    // fallback: ตัวเลข 2 หลัก 18-75 (กว้างขึ้นแต่ยังปลอดภัย)
    const nums = [...t.matchAll(/\b(\d{1,2})\b/g)];
    for (const n of nums) {
        const v = parseInt(n[1]);
        if (v >= 18 && v <= 75) {
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
        mfCompany: null, mfPlan: null, mfRoom: null,
        raw: rawText,
    };

    result.plan   = detectPlan(t);
    result.gender = /ชาย/.test(t) ? 'male' : /หญิง/.test(t) ? 'female' : null;
    result.age    = extractAge(t);

    // MF company/plan/room — parse เมื่อ plan เป็น Medical Fund หรือตรวจพบ company ก็ switch plan อัตโนมัติ
    if (result.plan === 'Medical Fund' || detectMFCompany(t)) {
        if (!result.plan) result.plan = 'Medical Fund';
        result.mfCompany = detectMFCompany(t);
        const planHit = detectMFPlan(t, result.mfCompany);
        if (planHit) {
            if (!result.mfCompany) result.mfCompany = planHit.co;
            result.mfPlan = planHit.id;
        }
        // room rates จาก data ที่โหลดแล้ว (ถ้ามี)
        const loadedCo = window._mfData?.companies?.companies?.find(c => c.id === result.mfCompany);
        const loadedPlanMeta = loadedCo?.plans?.find(p => p.id === result.mfPlan);
        result.mfRoom = extractMFRoom(t, loadedPlanMeta?.roomRates || []);
    }

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
            case 'LifeTime Value':   setPlan(y <= 10 ? '10LV' : (y <= 15 ? '15LV' : '20LV')); break;
        }
    }

    const plan = currentAppPlan;

    // ── Medical Fund ─────────────────────────────────────────────────
    if (plan === 'Medical Fund') {
        const applyMF = async () => {
            // โหลด companies ถ้ายังไม่มี
            if (!window._mfData?.companies) {
                try {
                    const r = await fetch('data/MF/companies.json?v=' + Date.now());
                    window._mfData.companies = await r.json();
                } catch(e) {}
            }
            if (parsed.mfCompany) {
                // โหลด rates ของบริษัทนั้น
                if (typeof mfLoadRates === 'function') await mfLoadRates(parsed.mfCompany);

                // ตรวจ room อีกรอบหลังโหลด data ครบ
                let room = parsed.mfRoom;
                if (!room) {
                    const co = window._mfData?.companies?.companies?.find(c => c.id === parsed.mfCompany);
                    const pm = co?.plans?.find(p => p.id === parsed.mfPlan);
                    room = extractMFRoom(parsed.raw?.toLowerCase() || '', pm?.roomRates || []);
                }

                // set state สำหรับ standalone MF page
                if (window._mfState) {
                    window._mfState.company  = parsed.mfCompany;
                    window._mfState.plan     = parsed.mfPlan || null;
                    window._mfState.roomRate = room || null;
                    if (parsed.gender) window._mfState.gender = parsed.gender;
                    if (parsed.age)    window._mfState.age    = parsed.age;
                }

                // set state สำหรับ inline (rider) MF
                if (window._mfInline !== undefined) {
                    window._mfInline.company  = parsed.mfCompany;
                    window._mfInline.plan     = parsed.mfPlan || null;
                    window._mfInline.roomRate = room || null;
                }

                // set currentMF key (ให้ตารางหลักใช้)
                if (parsed.mfPlan && (!parsed.mfPlan || room !== undefined)) {
                    const key = [parsed.mfCompany, parsed.mfPlan, room].filter(Boolean).join('|');
                    if (key) window.currentMF = key;
                }
            }

            // render — ลอง mfInlineInit ก่อน ถ้าไม่มีให้ mfInit
            if (typeof window.mfInlineInit === 'function') await window.mfInlineInit();
            else if (typeof mfInit === 'function') await mfInit();
            else if (typeof window.mfInlineRender === 'function') window.mfInlineRender();

            // sync dropdowns ใน UI
            ['mfInlineCompany','mfCompanySelect','mfPickerCompany'].forEach(id => {
                const el = document.getElementById(id);
                if (el && parsed.mfCompany) el.value = parsed.mfCompany;
            });
            ['mfInlinePlan','mfPlanSelect','mfPickerPlan'].forEach(id => {
                const el = document.getElementById(id);
                if (el && parsed.mfPlan) el.value = parsed.mfPlan;
            });
            ['mfInlineRoom','mfRoomSelect','mfPickerRoom'].forEach(id => {
                const el = document.getElementById(id);
                if (el && parsed.mfRoom) el.value = parsed.mfRoom;
            });
        };
        applyMF().catch(e => console.warn('[MF voice]', e));
        return null;
    }

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
    } else if (['24 TX','868 / 818 Elite Saving','678 Step Savings','LifeTime Value','Smart Plan 21/7','Whole Life Extra'].includes(plan)) {
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

    const targetPlan = parsed.plan || (typeof currentAppPlan !== 'undefined' ? currentAppPlan : '');

    // ── Medical Fund: ไม่ต้องมี amount/years ข้ามไปจัดการโดยตรง ───────
    if (targetPlan === 'Medical Fund') {
        if (typeof executeCommand === 'function') executeCommand(parsed, false);
        return;
    }

    // ── 1. ตรวจสอบข้อมูลครบก่อนคำนวณ ──────────────────────────────────
    // เพศ: จาก voice หรือที่เลือกไว้ใน UI แล้ว
    const hasGender = !!parsed.gender ||
        !!(typeof currentGender !== 'undefined' && currentGender);

    // อายุ: จาก voice หรือ input ใน UI
    const hasAge = parsed.age !== null || (() => {
        const el = document.getElementById('ageInput');
        return el && parseInt(el.value) > 0;
    })();

    // จำนวนเงิน: จาก voice หรือ input ใน UI
    const hasAmount = (parsed.amount !== null && parsed.amount > 0) || (() => {
        const pEl = document.getElementById('premiumInput');
        const sEl = document.getElementById('sumInsuredInput');
        const cEl = document.getElementById('cashFlowInput');
        return (pEl && parseInt((pEl.value || '').replace(/,/g, '')) > 0)
            || (sEl && parseInt((sEl.value || '').replace(/,/g, '')) > 0)
            || (cEl && parseInt((cEl.value || '').replace(/,/g, '')) > 0);
    })();

    const missing = [];
    if (!hasGender)  missing.push('เพศ');
    if (!hasAge)     missing.push('อายุ');
    if (!hasAmount)  missing.push('เบี้ย หรือ ทุนประกัน');
    if (missing.length > 0) {
        if (typeof showCustomError === 'function')
            showCustomError('กรุณาระบุ: ' + missing.join(' · '));
        return;
    }

    // ── 2. ตรวจสอบระยะเวลาสำหรับแผนที่ต้องการ (ทุกกรณี ไม่ใช่แค่เปลี่ยนแผน) ──
    const PLANS_NEED_YEARS = {
        'CI Extra Plus':        '10 หรือ 20 ปี',
        'Signature Legacy':     '5 หรือ 10 ปี',
        'Century Life':         '10, 20, 60, 90 หรือ 100 ปี',
        '3D Health Excellence': '10, 20, 60, 90 หรือ 100 ปี',
        'Whole Life Extra':     '10 หรือ 15 ปี',
        'LifeTime Value':       '10, 15 หรือ 20 ปี',
    };
    if (targetPlan in PLANS_NEED_YEARS && parsed.years === null) {
        const inferred = (typeof _inferYearsForPlan === 'function')
            ? _inferYearsForPlan(targetPlan, typeof currentPlan !== 'undefined' ? currentPlan : '')
            : null;
        if (inferred !== null) {
            parsed.years = inferred;
        } else {
            if (typeof showCustomError === 'function')
                showCustomError('กรุณาระบุระยะเวลาชำระ เช่น ' + PLANS_NEED_YEARS[targetPlan]);
            return;
        }
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
