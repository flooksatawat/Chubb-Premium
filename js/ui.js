// ==================== LAYOUT BREAKPOINT (Tablet / iPad / Foldable inner screen) ====================
// ตรงกับ CSS media query: (min-width: 700px) and (min-height: 600px)
// ใช้ documentElement.clientWidth/Height (viewport CSS จริง — ตรงกับ matchMedia)
// แทน window.innerWidth/Height (window inner รวม scrollbar/sidebar) เพื่อ sync กับ CSS
// รองรับ:
//   - iPad ทั้ง portrait/landscape (768×1024)
//   - จอในของมือถือพับ (เช่น Galaxy Z Fold ~893×821 / 821×893 CSS px)
//   - คอม/laptop ที่มี scrollbar หรือ sidebar กินพื้นที่
// ไม่รวม:
//   - จอนอกของมือถือพับ (~792×353) — สูงไม่พอ
//   - มือถือทั่วไป
window.isWideLayout = function () {
    const w = document.documentElement.clientWidth || window.innerWidth;
    const h = document.documentElement.clientHeight || window.innerHeight;
    return w >= 700 && h >= 600;
};

function fitHeaderTitle() {
    const span = document.getElementById('headerTitleText');
    if (!span) return;
    span.style.whiteSpace = 'nowrap';
    span.style.fontSize = '20px';
    const btn = span.closest('button') || span.closest('h1');
    if (!btn) return;
    const maxW = btn.clientWidth - 56; // account for chevron + padding
    while (span.scrollWidth > maxW && parseFloat(span.style.fontSize) > 11) {
        span.style.fontSize = (parseFloat(span.style.fontSize) - 0.5) + 'px';
    }
}

// ==================== PRODUCT CONDITIONS LOADER ====================
window.PRODUCT_CONDITIONS = {};

// โหลดไฟล์ JSON ทั้งหมด
const PRODUCT_FILES = ['cx.json', 'slb.json', '3d.json', 'cl.json', 'elite.json', 'hbf.json', 'lp.json', 'slpa.json', 'tla.json', 'tx.json', 'wxn.json']; 

async function loadAllProductConditions() {
    for (const file of PRODUCT_FILES) {
        try {
            const response = await fetch(`data/product/${file}`);
            if (response.ok) {
                const data = await response.json();
                window.PRODUCT_CONDITIONS[data.name] = data; 
            }
        } catch (e) { }
    }
}

// ==================== 3D HEALTH EXCELLENCE: COVERAGE DATA ====================
const CRITICAL_ILLNESSES = [
    "โรคมะเร็งระยะลุกลาม (Invasive Cancer)",
    "โรคเยื่อหุ้มสมองและไขสันหลังอักเสบจากเชื้อแบคทีเรีย",
    "ไตวายเรื้อรัง (Chronic Kidney Failure)",
    "ตับวาย (Chronic Liver Failure)",
    "กล้ามเนื้อหัวใจตายเฉียบพลันจากการขาดเลือด",
    "โรคหลอดเลือดสมองแตกหรืออุดตัน (Major Stroke)",
    "การผ่าตัดเส้นเลือดแดงใหญ่ เออร์ต้า",
    "การผ่าตัดเส้นเลือดเลี้ยงกล้ามเนื้อหัวใจ",
    "การผ่าตัดลิ้นหัวใจโดยวิธีการเปิดหัวใจ",
    "การผ่าตัดเปลี่ยนอวัยวะหรือปลูกถ่ายไขกระดูก"
];

const SECTION_DATA = {
    m14: { title: "อวัยวะเทียม และการศัลยกรรมตกแต่ง", items: [
        "อวัยวะเทียมและการศัลยกรรมตกแต่งเสริมสร้างเพื่อแก้ไขความบกพร่องจากโรคร้ายแรง",
        "การใส่ตาเทียมจากอุบัติเหตุร้ายแรง",
        "ต่อโรคหรือต่ออุบัติเหตุ (เหมาจ่าย)"], cond: "เฉพาะ HX40 ขึ้นไป" },
    m15: { title: "การรักษาด้านสุขภาพจิต", items: [
        "จากโรคร้ายแรง หรืออุบัติเหตุร้ายแรง",
        "หรือจากการสูญเสียความสามารถในการปฏิบัติกิจวัตรประจำวัน",
        "ต่อโรคหรือต่ออุบัติเหตุ (เหมาจ่าย)"], cond: "เฉพาะ HX40 ขึ้นไป" },
    m16: { title: "พยาบาลเฝ้าไข้พิเศษ (จากโรคร้ายแรง / อุบัติเหตุร้ายแรง)", items: [
        "จากโรคร้ายแรง หรืออุบัติเหตุร้ายแรง",
        "หรือจากการสูญเสียความสามารถในการปฏิบัติกิจวัตรประจำวัน",
        "สูงสุด 15 วัน ต่อรอบปีกรมธรรม์ (เหมาจ่าย)"], cond: "เฉพาะ HX40 ขึ้นไป" },
    m17: { title: "การเก็บรักษาเซลล์ไข่หรืออสุจิ", items: [
        "เก็บรักษาเซลล์ไข่หรืออสุจิด้วยวิธีแช่แข็ง",
        "สำหรับผู้ป่วยมะเร็งที่รับการรักษาด้วยเคมีบำบัดหรือรังสีบำบัด",
        "ตลอดชีวิต ต่อผู้เอาประกันภัยแต่ละราย (เหมาจ่าย)"], cond: "เฉพาะ HX40 ขึ้นไป" },
    m18: { title: "การผ่าตัดช่องปากและใบหน้าขากรรไกร", items: [
        "การผ่าตัดช่องปากและใบหน้าขากรรไกร",
        "ต่อรอบปีกรมธรรม์ประกันภัย (เหมาจ่าย)"], cond: "เฉพาะ HX40 ขึ้นไป" },
    m19: { title: "การตั้งครรภ์ การคลอดบุตร และภาวะแทรกซ้อน", items: [
        "กลุ่ม 1: การฝากครรภ์ การตั้งครรภ์ และการคลอดบุตร (ต่อครรภ์/รอบปี)",
        "กลุ่ม 1.2: ภาวะแทรกซ้อนที่เกี่ยวข้องกับการตั้งครรภ์ (ต่อครรภ์/รอบปี)",
        "กลุ่ม 2: เทคโนโลยีช่วยการเจริญพันธุ์ 1 ครั้ง ตลอดชีวิต",
        "กลุ่ม 3: การรักษาด้วยฮอร์โมน ตลอดชีวิตต่อผู้เอาประกันภัยแต่ละราย",
        "เฉพาะ HX150 และ HX300 เท่านั้น"], cond: "เฉพาะ HX150–300" }
};

const _3D_BASE_SUBS = {
    '01': [
        "ค่าห้องและค่าอาหาร ค่าบริการในโรงพยาบาล (ผู้ป่วยใน) สูงสุด 365 วัน/รอบปี",
        "กรณีได้รับการรักษาในห้องผู้ป่วยวิกฤติ (ICU/CCU) — เหมาจ่ายตามแผน",
    ],
    '02': [
        "2.1 ค่าบริการทางการแพทย์เพื่อการตรวจวินิจฉัย",
        "2.2 ค่าบำบัดรักษา ค่าบริการโลหิตและส่วนประกอบ ค่าบริการทางการพยาบาล",
        "2.3 ค่ายา ค่าสารอาหารทางหลอดเลือด และค่าเวชภัณฑ์",
        "2.4 ค่ายาและเวชภัณฑ์สิ้นเปลือง (เวชภัณฑ์ 1) สำหรับกลับบ้าน",
        "เหมาจ่าย ต่อรอบปีกรมธรรม์",
    ],
    '03': [
        "ค่าผู้ประกอบวิชาชีพเวชกรรม (แพทย์) ตรวจรักษา",
        "เหมาจ่าย ต่อรอบปีกรมธรรม์",
    ],
    '04': [
        "4.1 ค่าห้องผ่าตัด และค่าห้องทำหัตถการ",
        "4.2 ค่ายา ค่าสารอาหารทางหลอดเลือด ค่าเวชภัณฑ์ และค่าอุปกรณ์การผ่าตัด",
        "4.3 ค่าแพทย์ทำศัลยกรรมและหัตถการ (รวมแพทย์ผู้ช่วยผ่าตัด) — Doctor fee",
        "4.4 ค่าวิสัญญีแพทย์ — Doctor fee",
        "4.5 ค่ารักษาพยาบาลโดยการผ่าตัดเปลี่ยนอวัยวะ",
        "เหมาจ่าย ต่อรอบปีกรมธรรม์",
    ],
    '05': [
        "การผ่าตัดใหญ่ที่ไม่ต้องเข้าพักรักษาตัวเป็นผู้ป่วยใน (Day Surgery)",
        "เหมาจ่าย ต่อรอบปีกรมธรรม์",
    ],
    '06': [
        "6.1 ค่าตรวจวินิจฉัยที่เกี่ยวข้องภายใน 30 วันก่อน IPD และภายใน 90 วันหลัง IPD",
        "6.2 ค่ารักษา OPD ต่อเนื่องภายใน 45 วันหลัง IPD (ไม่รวมค่าตรวจวินิจฉัย)",
        "ต่อรอบปีกรมธรรม์ประกันภัย",
    ],
    '07': [
        "ค่ารักษาพยาบาลกรณีบาดเจ็บ — ผู้ป่วยนอกภายใน 48 ชั่วโมงของการเกิดอุบัติเหตุ",
        "เหมาจ่าย ต่อครั้ง",
    ],
    '08': [
        "ค่าเวชศาสตร์ฟื้นฟูหลังการเข้าพักรักษาตัวเป็นผู้ป่วยในแต่ละครั้ง",
        "ต่อรอบปีกรมธรรม์ประกันภัย",
    ],
    '09': [
        "ค่าบริการทางการแพทย์เพื่อบำบัดรักษาโรคไตวายเรื้อรัง",
        "โดยการล้างไตผ่านทางเส้นเลือด (Hemodialysis)",
        "ต่อรอบปีกรมธรรม์ประกันภัย",
    ],
    '10': [
        "ค่าบำบัดรักษาโรคเนื้องอกหรือมะเร็ง โดยรังสีรักษา",
        "รังสีร่วมรักษา และเวชศาสตร์นิวเคลียร์รักษา",
        "ต่อรอบปีกรมธรรม์ประกันภัย",
    ],
    '11': [
        "ค่าบริการทางการแพทย์เพื่อบำบัดรักษาโรคมะเร็ง โดยเคมีบำบัด",
        "ต่อรอบปีกรมธรรม์ประกันภัย",
    ],
    '12': [
        "ค่าบริการรถพยาบาลฉุกเฉิน",
    ],
    '13': [
        "ค่ารักษาพยาบาล โดยการผ่าตัดเล็ก",
    ],
};

// ==================== 3D HEALTH EXCELLENCE: PLAN & CATEGORY DATA ====================
const HX_BASE_CATEGORIES = [
    { num: '01', title: 'ค่าห้องและค่าอาหาร ค่าบริการในโรงพยาบาล (ผู้ป่วยใน)',        limit: 'สูงสุด 365 วัน/รอบปี' },
    { num: '02', title: 'ค่าบริการทางการแพทย์ ค่ายา ค่าเวชภัณฑ์ (ผู้ป่วยใน)',          limit: 'เหมาจ่าย/รอบปี'       },
    { num: '03', title: 'ค่าผู้ประกอบวิชาชีพเวชกรรม (แพทย์) ตรวจรักษา',               limit: 'เหมาจ่าย/รอบปี'       },
    { num: '04', title: 'ค่ารักษาพยาบาลโดยการผ่าตัด (ศัลยกรรม) และหัตถการ',           limit: 'เหมาจ่าย/รอบปี'       },
    { num: '05', title: 'การผ่าตัดใหญ่ไม่ต้อง Admit (Day Surgery)',                     limit: 'เหมาจ่าย/รอบปี'       },
    { num: '06', title: 'ค่าตรวจ/รักษา OPD ก่อน–หลังเข้าพักรักษาเป็นผู้ป่วยใน',       limit: 'เหมาจ่าย/รอบปี'       },
    { num: '07', title: 'ค่ารักษาพยาบาลกรณีบาดเจ็บ (OPD ภายใน 48 ชม.)',               limit: 'เหมาจ่าย/ครั้ง'       },
    { num: '08', title: 'ค่าเวชศาสตร์ฟื้นฟูหลังการเข้าพักรักษาเป็นผู้ป่วยใน',         limit: 'เหมาจ่าย/รอบปี'       },
    { num: '09', title: 'ค่ารักษาโรคไตวายเรื้อรัง (ล้างไตทางเส้นเลือด)',                limit: 'เหมาจ่าย/รอบปี'       },
    { num: '10', title: 'ค่ารักษาเนื้องอก/มะเร็ง (รังสีรักษา / เวชศาสตร์นิวเคลียร์)', limit: 'เหมาจ่าย/รอบปี'       },
    { num: '11', title: 'ค่ารักษาโรคมะเร็ง โดยเคมีบำบัด',                               limit: 'เหมาจ่าย/รอบปี'       },
    { num: '12', title: 'ค่าบริการรถพยาบาลฉุกเฉิน',                                      limit: 'เหมาจ่าย'             },
    { num: '13', title: 'ค่ารักษาพยาบาล โดยการผ่าตัดเล็ก',                               limit: 'เหมาจ่าย'             },
];

const HX_PLAN_INFO = {
    'HX15':  { room: '1,500',  lump: '1 ล้าน',   tier: 'base' },
    'HX20':  { room: '2,000',  lump: '3 ล้าน',   tier: 'base' },
    'HX40':  { room: '4,000',  lump: '5 ล้าน',   tier: 'mid'  },
    'HX60':  { room: '6,000',  lump: '10 ล้าน',  tier: 'mid'  },
    'HX150': { room: '15,000', lump: '60 ล้าน',  tier: 'full' },
    'HX300': { room: '30,000', lump: '120 ล้าน', tier: 'full' },
};

// วงเงินรายหมวดที่ไม่ใช่เหมาจ่าย (แตกต่างตามแผน HX)
const HX_LIMITS = {
    max:    { HX15:'1,000,000',  HX20:'3,000,000',  HX40:'5,000,000',   HX60:'10,000,000',  HX150:'60,000,000',  HX300:'120,000,000'  },
    maxCI:  { HX15:'2,000,000',  HX20:'6,000,000',  HX40:'10,000,000',  HX60:'20,000,000',  HX150:'120,000,000', HX300:'240,000,000'  },
    '02.4': { HX15:'5,000',      HX20:'10,000',      HX40:'15,000',      HX60:'20,000',      HX150:'ตามจริง (สูงสุด 30 วัน)',  HX300:'ตามจริง (สูงสุด 30 วัน)'  },
    '03':   { HX15:'1,500/วัน', HX20:'2,000/วัน', HX40:'4,000/วัน', HX60:'6,000/วัน', HX150:'จ่ายตามจริง', HX300:'จ่ายตามจริง' },
    '06.2': { HX15:'ตามจริง (สูงสุด 2 ครั้ง)', HX20:'ตามจริง (สูงสุด 2 ครั้ง)', HX40:'ตามจริง (สูงสุด 2 ครั้ง)', HX60:'ตามจริง (สูงสุด 2 ครั้ง)', HX150:'ตามจริง (สูงสุด 4 ครั้ง)', HX300:'ตามจริง (สูงสุด 4 ครั้ง)' },
    '08':   { HX15:'ตามจริง (สูงสุด 2 ครั้ง)', HX20:'ตามจริง (สูงสุด 2 ครั้ง)', HX40:'ตามจริง (สูงสุด 2 ครั้ง)', HX60:'ตามจริง (สูงสุด 2 ครั้ง)', HX150:'ตามจริง (สูงสุด 4 ครั้ง)', HX300:'ตามจริง (สูงสุด 4 ครั้ง)' },
    '14':   { HX15:'-', HX20:'-', HX40:'20,000',  HX60:'30,000',  HX150:'60,000',  HX300:'120,000'  },
    '15':   { HX15:'-', HX20:'-', HX40:'10,000',  HX60:'15,000',  HX150:'30,000',  HX300:'60,000'   },
    '16':   { HX15:'-', HX20:'-', HX40:'1,000/วัน', HX60:'1,500/วัน', HX150:'3,000/วัน', HX300:'5,000/วัน' },
    '17':   { HX15:'-', HX20:'-', HX40:'100,000', HX60:'100,000', HX150:'300,000', HX300:'300,000'  },
    '18':   { HX15:'-', HX20:'-', HX40:'20,000',  HX60:'30,000',  HX150:'75,000',  HX300:'150,000'  },
    '19.1': { HX15:'-', HX20:'-', HX40:'-', HX60:'-', HX150:'100,000',  HX300:'300,000'   },
    '19.2': { HX15:'-', HX20:'-', HX40:'-', HX60:'-', HX150:'1,000,000',HX300:'3,000,000' },
    '19.g2':{ HX15:'-', HX20:'-', HX40:'-', HX60:'-', HX150:'100,000',  HX300:'300,000'   },
    '19.g3':{ HX15:'-', HX20:'-', HX40:'-', HX60:'-', HX150:'100,000',  HX300:'300,000'   },
};

// ==================== UI HELPERS & NOTIFICATIONS ====================
// ฟังก์ชันสำหรับเปิดหน้าต่าง ค่ารักษาพิเศษ ซ้อนขึ้นมา
function showMedExtraDef() { openPopup('medExtraDefModal'); }
function openPopup(id) {
    const modal = document.getElementById(id);
    if (modal) { modal.classList.remove('hidden'); setTimeout(() => { modal.classList.add('show'); }, 10); }
}
function closePopup(id) {
    const modal = document.getElementById(id);
    if (modal) { modal.classList.remove('show'); setTimeout(() => { modal.classList.add('hidden'); }, 300); }
}
function handleModalClick(e, modalId) { if (e.target.closest('button, input, select, textarea, a, .list-row, .interactive-btn, .prevent-close')) return; closePopup(modalId); }

function showCustomError(msg) {
    const toast = document.createElement('div'); toast.className = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-5 rounded-2xl text-sm font-bold z-[1000] shadow-2xl text-center backdrop-blur-sm transition-all";
    toast.style.backgroundColor = '#fefce8';
    toast.style.color = '#854d0e';
    toast.style.border = '1px solid #fde68a';
    toast.innerHTML = `<i class='fas fa-exclamation-triangle mb-3 block text-3xl' style="color:#eab308;"></i><span class="whitespace-nowrap">${msg}</span><div style="margin-top:14px;"><button onclick="this.closest('div.fixed').remove()" style="background:#eab308;color:#fff;border:none;padding:8px 22px;border-radius:9999px;font-weight:700;font-size:13px;cursor:pointer;">ตกลง</button></div>`;
    document.body.appendChild(toast); setTimeout(() => { if(toast.parentNode){ toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300);} }, 2500);
}

function validateInputMinimum(inputElement, fieldType) {
    if (!inputElement) return;
    let value = parseInt(inputElement.value.replace(/,/g, '')) || 0;
    let minValue = 4000;
    let errorMsg = '';

    if (fieldType === 'premium') {
        if (currentAppPlan === 'Whole Life Extra' || currentAppPlan === '868 / 818 Elite Saving' || currentAppPlan === '24 TX') {
            minValue = 50000;
        }
        if (value < minValue) {
            errorMsg = `เบี้ยประกันขั้นต่ำ ต้องไม่น้อยกว่า ${minValue.toLocaleString()} บาท`;
            showCustomError(errorMsg);
            inputElement.value = minValue.toLocaleString();
        }
    } else if (fieldType === 'sum') {
        if (currentAppPlan === 'Signature Legacy' && value > 0 && value < 5000000) {
            Swal.fire({ icon: 'warning', title: 'ทุนประกันไม่ถึงเกณฑ์', text: 'แผน Signature Legacy บังคับทุนประกันขั้นต่ำที่ 5,000,000 บาท', confirmButtonColor: '#3085d6', confirmButtonText: 'ตกลง' });
            inputElement.value = '5,000,000';
            return;
        }
        minValue = currentAppPlan === 'CI Extra Plus' ? 500000 : getCLMinSum();
        if (value < minValue) {
            errorMsg = `ทุนประกันขั้นต่ำ ต้องไม่น้อยกว่า ${minValue.toLocaleString()} บาท`;
            showCustomError(errorMsg);
            inputElement.value = minValue.toLocaleString();
        }
    }
}

let hasShownCongratsMB = false, hasShownCongratsMYB = false, hasShownCongratsNAB = false;
function showCongratsToast(msg) {
    const cashView = document.getElementById('cashView'); if (!cashView || cashView.classList.contains('hidden') || cashView.style.display === 'none') return;
    const toast = document.createElement('div'); toast.className = "fixed top-16 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-[24px] z-[9999] shadow-[0_10px_30px_rgba(16,185,129,0.4)] text-center transition-all duration-500 flex items-center gap-3.5 transform -translate-y-10 opacity-0 scale-90 w-[90%] max-w-[340px]"; 
    toast.innerHTML = `<i class='fas fa-trophy text-3xl text-yellow-300 drop-shadow-md animate-bounce' style="animation-duration: 2s;"></i><div class="text-left"><p class="text-[16px] font-black leading-tight tracking-wide">🎉 ยินดีด้วย!</p><p class="text-[12px] font-medium opacity-95 mt-0.5 leading-snug">${msg}</p></div>`; 
    document.body.appendChild(toast); setTimeout(() => { toast.classList.remove('-translate-y-10', 'opacity-0', 'scale-90'); toast.classList.add('translate-y-0', 'opacity-100', 'scale-100'); }, 10);
    setTimeout(() => { toast.classList.add('-translate-y-10', 'opacity-0', 'scale-90'); setTimeout(() => toast.remove(), 500); }, 3500); 
}

let isLongPressActive = false;
/**
 * 🌟 Smart Quick Calc (เพิ่มฟังก์ชันใหม่)
 * รองรับ: "ชาย 30 ออม 50,000", "หญิง 25 ทุน 1,000,000", หรือแค่ตัวเลข "1M"
 */
/**
 * 🌟 Smart Quick Calc (Updated)
 * รองรับ: "CX ชาย 30 ออม 3 หมื่น 10 ปี", "หญิง 25 ทุน 2 ล้าน", "5 แสน"
 */
/**
 * Text Input handler — กด Enter หรือกดปุ่มส่ง
 * แสดงผลทันที ไม่ต้องเปิดหน้าคำนวณ
 */
function handleQuickCalc(event) {
    if (event.key === 'Enter') {
        const input = event.target;
        const rawValue = input.value.trim();
        if (rawValue === '') return;
        submitQuickCalc(rawValue);
        input.value = '';
        input.blur();
    }
}

function submitQuickCalc(rawValue) {
    if (!rawValue || rawValue.trim() === '') return;
    const parsed = (typeof parseCommand === 'function') ? parseCommand(rawValue) : null;
    if (!parsed) { if(typeof showCustomError==='function') showCustomError('ไม่เข้าใจคำสั่ง กรุณาลองใหม่'); return; }

    // แผนที่ต้องระบุระยะเวลา
    const PLANS_NEED_YEARS = ['CI Extra Plus','Signature Legacy','Century Life','3D Health Excellence','Whole Life Extra'];
    // ถ้าไม่พบชื่อแผนในคำสั่ง และยังไม่ได้เลือกแผนไว้ก่อน → แจ้งเตือน
    if (!parsed.plan && !currentAppPlan) {
        if (typeof showCustomError === 'function') showCustomError('ไม่พบชื่อแบบประกัน\nกรุณาระบุชื่อแบบ เช่น CI Extra Plus, Century Life, 3D Health');
        return;
    }

    const targetPlan = parsed.plan || currentAppPlan;
    if (PLANS_NEED_YEARS.includes(targetPlan) && parsed.years === null) {
        const planMap = {
            'CI Extra Plus':       'ต้องระบุระยะเวลา เช่น 10 ปี หรือ 20 ปี',
            'Signature Legacy':    'ต้องระบุระยะเวลา เช่น 5 ปี หรือ 10 ปี',
            'Century Life':        'ต้องระบุระยะเวลา เช่น 10, 20, 60 หรือ 90 ปี',
            '3D Health Excellence':'ต้องระบุระยะเวลา เช่น 10, 20, 60 หรือ 90 ปี',
            'Whole Life Extra':    'ต้องระบุระยะเวลา เช่น 10 ปี หรือ 15 ปี',
        };
        if(typeof showCustomError==='function') showCustomError(`${targetPlan}
${planMap[targetPlan]}`);
        return;
    }

    // เปลี่ยนแผนถ้าจำเป็น (ไม่ต้องเปิด modal)
    if (parsed.plan && parsed.plan !== currentAppPlan) {
        selectAppPlan(parsed.plan);
    }

    // คำนวณและแสดงผล popup ทันที
    executeCommand(parsed, true);
}

function handleHeaderClick(e) { if (isLongPressActive) { e.preventDefault(); isLongPressActive = false; return; } openPlanModal(); }

// ==================== HIGHLIGHT PILLS (ปุ่มลัดหลัก) ====================
function highlightActivePills(fSum, fPrem, fCashFlow) {
    setTimeout(() => {
        // 1. ดึงค่าสำรองจาก Input ตรงๆ ป้องกันแถบสีอื่นหายตอนพิมพ์ Real-time
        let sInput = document.getElementById('sumInsuredInput');
        let pInput = document.getElementById('premiumInput');
        fSum = (fSum !== undefined && !isNaN(parseInt(fSum))) ? parseInt(fSum) : (sInput ? parseInt(sInput.value.replace(/\D/g, '')) || 0 : 0);
        fPrem = (fPrem !== undefined && !isNaN(parseInt(fPrem))) ? parseInt(fPrem) : (pInput ? parseInt(pInput.value.replace(/\D/g, '')) || 0 : 0);

        // --- 1. ไฮไลต์ ทุน ---
        let sumMatched = false; const sumBg = document.getElementById('sumPillBg');
        for(let i=1; i<=5; i++) { 
            let el = document.getElementById('sumPill'+i); 
            if(el) { 
                let attr = el.getAttribute('onclick') || ''; 
                let match = attr.match(/\d+/); 
                if(match && parseInt(match[0]) === fSum && fSum > 0) { 
                    el.className = 'flex-1 relative z-10 rounded-[10px] text-[11px] font-bold text-blue-700 transition-all duration-300'; 
                    if(sumBg) { sumBg.style.display = 'block'; sumBg.style.opacity = '1'; sumBg.style.width = (el.offsetWidth || 60) + 'px'; sumBg.style.left = el.offsetLeft + 'px'; } 
                    sumMatched = true; 
                } else { el.className = 'flex-1 relative z-10 rounded-[10px] text-[11px] font-medium text-slate-500 hover:text-slate-700 transition-all duration-300'; } 
            } 
        }
        if(!sumMatched && sumBg) sumBg.style.opacity = '0';
        
        // --- 2. ไฮไลต์ เบี้ย ---
        let premMatched = false; const premBg = document.getElementById('premPillBg');
        for(let i=1; i<=5; i++) { 
            let el = document.getElementById('premPill'+i); 
            if(el) { 
                let attr = el.getAttribute('onclick') || ''; 
                let match = attr.match(/\d+/); 
                if(match && parseInt(match[0]) === fPrem && fPrem > 0) { 
                    el.className = 'flex-1 relative z-10 rounded-[10px] text-[11px] font-bold text-blue-700 transition-all duration-300'; 
                    if(premBg) { premBg.style.display = 'block'; premBg.style.opacity = '1'; premBg.style.width = (el.offsetWidth || 60) + 'px'; premBg.style.left = el.offsetLeft + 'px'; } 
                    premMatched = true; 
                } else { el.className = 'flex-1 relative z-10 rounded-[10px] text-[11px] font-medium text-slate-500 hover:text-slate-700 transition-all duration-300'; } 
            } 
        }
        if(!premMatched && premBg) premBg.style.opacity = '0';
        
        // --- 3. ไฮไลต์ กระแสเงินสด ---
        // เช็คจาก DOM ตรงๆ เลยว่ากล่องแบบ 2 แถว (WXN) โชว์อยู่หรือไม่ (ตัดปัญหาเช็คชื่อแผนผิดพลาด)
        let dualBox = document.getElementById('dualCashFlowBox');
        let isWXN = dualBox && !dualBox.classList.contains('hidden');

        if (isWXN) {
            // 🟢 WXN Cashflow 1 (แถว 1)
            let input1 = document.getElementById('cashFlowInput1');
            let cf1 = input1 && input1.value ? parseInt(input1.value.replace(/\D/g, '')) : 0;
            const w1Vals = [24000, 36000, 48000, 60000, 100000];
            let c1Matched = false; const c1Bg = document.getElementById('wxnCash1Bg');

            for(let i=1; i<=5; i++) { 
                let el = document.getElementById('wxnC1Pill'+i); 
                if(el) { 
                    if(cf1 === w1Vals[i-1] && cf1 > 0) { 
                        el.className = 'flex-1 relative z-10 rounded-[10px] text-[11px] font-bold text-emerald-700 transition-all duration-300'; 
                        if(c1Bg) { c1Bg.style.display = 'block'; c1Bg.style.opacity = '1'; c1Bg.style.width = (el.offsetWidth || 60) + 'px'; c1Bg.style.left = el.offsetLeft + 'px'; } 
                        c1Matched = true; 
                    } else { 
                        el.className = 'flex-1 relative z-10 rounded-[10px] text-[11px] font-medium text-emerald-600/80 hover:text-emerald-700 transition-all duration-300'; 
                    } 
                } 
            }
            if(!c1Matched && c1Bg) c1Bg.style.opacity = '0';

            // 🟢 WXN Cashflow 2 (แถว 2)
            let input2 = document.getElementById('cashFlowInput2');
            let cf2 = input2 && input2.value ? parseInt(input2.value.replace(/\D/g, '')) : 0;
            const w2Vals = [120000, 240000, 360000, 480000, 600000];
            let c2Matched = false; const c2Bg = document.getElementById('wxnCash2Bg');

            for(let i=1; i<=5; i++) { 
                let el = document.getElementById('wxnC2Pill'+i); 
                if(el) { 
                    if(cf2 === w2Vals[i-1] && cf2 > 0) { 
                        el.className = 'flex-1 relative z-10 rounded-[10px] text-[11px] font-bold text-emerald-700 transition-all duration-300'; 
                        if(c2Bg) { c2Bg.style.display = 'block'; c2Bg.style.opacity = '1'; c2Bg.style.width = (el.offsetWidth || 60) + 'px'; c2Bg.style.left = el.offsetLeft + 'px'; } 
                        c2Matched = true; 
                    } else { 
                        el.className = 'flex-1 relative z-10 rounded-[10px] text-[11px] font-medium text-emerald-600/80 hover:text-emerald-700 transition-all duration-300'; 
                    } 
                } 
            }
            if(!c2Matched && c2Bg) c2Bg.style.opacity = '0';

        } else {
            // โซนแบบ 1 แถว (Elite, 24 TX และอื่นๆ) ทำงานปกติ
            let input = document.getElementById('cashFlowInput');
            let cf = input && input.value ? parseInt(input.value.replace(/\D/g, '')) : 0;
            
            let planName = String(window.currentAppPlan || window.currentPlan || '').trim();
            let targetCf = cf;
            if (['868 / 818 Elite Saving', '24 TX'].includes(planName)) {
                if (cf === 0 || isNaN(cf)) targetCf = 24000;
            } else if (cf === 0 || isNaN(cf)) {
                targetCf = fCashFlow || 0;
            }

            let cashMatched = false; const cashBg = document.getElementById('cashPillBg');
            for(let i=1; i<=5; i++) { 
                let el = document.getElementById('cashPill'+i); 
                if(el) { 
                    let attr = el.getAttribute('onclick') || ''; 
                    let match = attr.match(/\d+/); 
                    let btnVal = match ? parseInt(match[0]) : 0;
                    
                    if(btnVal === targetCf && btnVal > 0) { 
                        el.className = 'flex-1 relative z-10 rounded-[10px] text-[11px] font-bold text-emerald-700 transition-all duration-300'; 
                        if(cashBg) { cashBg.style.display = 'block'; cashBg.style.opacity = '1'; cashBg.style.width = (el.offsetWidth || 60) + 'px'; cashBg.style.left = el.offsetLeft + 'px'; } 
                        cashMatched = true; 
                    } else { 
                        el.className = 'flex-1 relative z-10 rounded-[10px] text-[11px] font-medium text-emerald-600/80 hover:text-emerald-700 transition-all duration-300'; 
                    } 
                } 
            }
            if(!cashMatched && cashBg) cashBg.style.opacity = '0';
        }
    }, 100);
}

// ==================== DYNAMIC THEME ====================
function applyDayColorTheme() {
    const day = new Date().getDay();
    const themes = {
        0: 'bg-gradient-to-br from-[#E24634] to-[#C12516] border-[#E24634]/30 shadow-[0_10px_25px_rgba(226,70,52,0.35)]',
        1: 'bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] border-[#FBBF24]/30 shadow-[0_10px_25px_rgba(251,191,36,0.35)]',
        2: 'bg-gradient-to-br from-[#E73994] to-[#C11871] border-[#E73994]/30 shadow-[0_10px_25px_rgba(231,57,148,0.35)]',
        3: 'bg-gradient-to-br from-[#93CD47] to-[#71A825] border-[#93CD47]/30 shadow-[0_10px_25px_rgba(147,205,71,0.35)]',
        4: 'bg-gradient-to-br from-[#EF702B] to-[#C94E0C] border-[#EF702B]/30 shadow-[0_10px_25px_rgba(239,112,43,0.35)]',
        5: 'bg-gradient-to-br from-[#53B9D6] to-[#2C95B3] border-[#53B9D6]/30 shadow-[0_10px_25px_rgba(83,185,214,0.35)]',
        6: 'bg-gradient-to-br from-[#7D3CB9] to-[#592091] border-[#7D3CB9]/30 shadow-[0_10px_25px_rgba(125,60,185,0.35)]'
    };
    const dayColors = {
        0: { from: '#E24634', to: '#C12516' },
        1: { from: '#FBBF24', to: '#F59E0B' },
        2: { from: '#E73994', to: '#C11871' },
        3: { from: '#93CD47', to: '#71A825' },
        4: { from: '#EF702B', to: '#C94E0C' },
        5: { from: '#53B9D6', to: '#2C95B3' },
        6: { from: '#7D3CB9', to: '#592091' },
    };

    const mainHeader = document.getElementById('mainHeaderBtn');
    if (mainHeader) {
        const baseClassesMain = "w-full rounded-[24px] py-4 px-4 flex flex-col items-center justify-center active:scale-[0.97] transition-all relative overflow-hidden group select-none cursor-pointer border";
        mainHeader.className = `${baseClassesMain} ${themes[day]}`;
    }

    const cashHeader = document.querySelector('#cashView > div > div.bg-gradient-to-br');
    if (cashHeader) {
        const baseClassesCash = "w-full rounded-[24px] py-5 px-4 flex flex-col items-center justify-center relative overflow-hidden border";
        const cashShadow = themes[day].replace('shadow-[0_10px_25px', 'shadow-[0_12px_30px');
        cashHeader.className = `${baseClassesCash} ${cashShadow}`;
    }

    // วงกลมรอ (ai-waveform) ใน right pane — เปลี่ยนสีตามวัน
    const dc = dayColors[day];
    document.querySelectorAll('.ai-waveform-ring').forEach(ring => {
        ring.style.borderColor = dc.from;
    });
    const centerCircle = document.querySelector('#canvasPlaceholder .ai-waveform > div:last-child');
    if (centerCircle) {
        centerCircle.style.background = `linear-gradient(135deg, ${dc.from}, ${dc.to})`;
        centerCircle.style.boxShadow = `0 8px 28px ${dc.from}66`;
    }
}

function openInstallmentModal() {
    if (typeof calculate === 'function') calculate(currentMode, true);
    if (!lastCalculationData || lastCalculationData.premium === 0) {
        showCustomError("กรุณาคำนวณเบี้ยประกันก่อน");
        return;
    }

    const p = lastCalculationData.premium;
    const m1 = Math.round(p * 0.09);
    const m3 = Math.round(p * 0.27);
    const m6 = Math.round(p * 0.52);

    setText('sumMonthlyPopup', m1.toLocaleString());
    setText('sum3MonthPopup', m3.toLocaleString());
    setText('sum6MonthPopup', m6.toLocaleString());

    openPopup('installmentModal');
}

// ==================== APP ROUTING & PLAN SELECTION ====================
function getPlanAbbr(planName) {
    const abbrMap = { "CI Extra Plus": "CX", "Life Protector 20": "LPB", "Supreme Life Protector": "SLPA", "Signature Legacy": "SLB", "Convertable Term": "TLA", "Century Life": "CL", "3D Health Excellence": "3D", "Whole Life Extra": "WXN", "24 TX": "TX", "868 / 818 Elite Saving": "Elite" };
    return abbrMap[planName] || planName;
}

function switchView(targetView) {
    // ── Data guard (table / cash need calculation first) ──
    if (targetView === 'table' || targetView === 'cash') {
        if (typeof calculate === 'function') calculate(currentMode, true);
        if (!lastCalculationData || lastCalculationData.premium === 0) {
            showCustomError("กรุณาตรวจสอบทุน/เบี้ย หรือกรอกตัวเลขให้ครบถ้วน");
            return;
        }
    }

    // ── Update nav active state ──
    ['navMainBtn','navTableBtn','navCashBtn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
    const activeMap = { main:'navMainBtn', table:'navTableBtn', cash:'navCashBtn' };
    const activeBtn = document.getElementById(activeMap[targetView]);
    if (activeBtn) activeBtn.classList.add('active');

    // ── แสดงปุ่มแชร์เฉพาะหน้าตาราง ──
    const shareBtn = document.getElementById('navShareBtn');
    if (shareBtn) shareBtn.style.display = targetView === 'table' ? '' : 'none';

    // 3D plan: ตาราง → แสดง 19 หมวด (หลังจาก highlight nav แล้ว)
    if (targetView === 'table' && currentAppPlan === '3D Health Excellence') {
        document.body.setAttribute('data-view', 'table');
        window.open3DDetailsView();
        return;
    }

    document.body.setAttribute('data-view', targetView);

    const isWide        = window.innerWidth >= 700;
    const rightPane     = document.getElementById('rightPane');
    const rightPaneMain = document.getElementById('rightPaneMain');

    if (isWide && rightPane) {
        // ════ Tablet / Fold — keep form left, show content right ════
        const mainView  = document.getElementById('mainView');
        const tableView = document.getElementById('tableView');
        const cashView  = document.getElementById('cashView');
        const appCont   = document.querySelector('.app-container');

        // Always keep mainView (form) visible in left pane
        if (mainView) mainView.style.removeProperty('display');

        // Mount: absolute overlay on top of rightPaneMain — no rightPaneMain toggle needed
        function mountInRight(el) {
            if (!el) return;
            if (el.parentElement !== rightPane) rightPane.appendChild(el);
            el.style.cssText = 'display:flex;flex-direction:column;position:absolute;inset:0;z-index:10;overflow:hidden;background:#f8fafc;';
        }
        // Unmount: hide and return to appContainer
        function unmount(el) {
            if (!el) return;
            el.style.cssText = 'display:none';
            if (el.parentElement === rightPane && appCont) appCont.appendChild(el);
        }

        if (targetView === 'main') {
            unmount(tableView);
            unmount(cashView);
        } else if (targetView === 'table') {
            unmount(cashView);
            mountInRight(tableView);
            if (typeof generatePolicyTableData === 'function') generatePolicyTableData();
        } else if (targetView === 'cash') {
            unmount(tableView);
            mountInRight(cashView);
            if (typeof refreshAllDisplays === 'function') refreshAllDisplays();
        }

    } else {
        // ════ Mobile — original left-pane switching ════
        const views = {
            main:  document.getElementById('mainView'),
            table: document.getElementById('tableView'),
            cash:  document.getElementById('cashView'),
        };
        if (targetView === 'table') { if (typeof generatePolicyTableData === 'function') generatePolicyTableData(); }
        if (targetView === 'cash')  { if (typeof refreshAllDisplays === 'function') refreshAllDisplays(); }
        Object.values(views).forEach(v => { if (v) v.style.display = 'none'; });
        if (views[targetView]) views[targetView].style.removeProperty('display');
    }
}


// ============================================================================
// 🌟 THE NEW ULTRA-MODERN 3D PLAN LOGIC & INFINITE SCROLL 🌟
// ============================================================================

const modernPlansData = [
    { name: 'CI Extra Plus', desc: 'ออมเงิน : ชดเชยโรคร้าย+วงเงินพิเศษ', icon: 'fas fa-shield-heart', isHighlight: false, bg: 'bg-gradient-to-br from-[#ff007f] to-[#ff5e62]', text: 'text-white', border: 'border border-white hover:border-blue-200', cardBg: 'bg-white hover:bg-slate-50', title: 'text-slate-800 group-hover:text-rose-700', sub: 'text-slate-500', btn: 'bg-slate-100 text-slate-400 group-hover:bg-rose-100 group-hover:text-rose-600', shadow: 'shadow-[0_4px_15px_rgba(0,0,0,0.04)]', iconBorder: 'border-white/30 shadow-inner shadow-black/20' },
    { name: 'Life Protector 20', desc: 'เปลี่ยนทุนประกัน เป็นบำนาญ', icon: 'fas fa-piggy-bank', isHighlight: false, bg: 'bg-gradient-to-br from-emerald-100 to-emerald-200', text: 'text-emerald-600', border: 'border border-white hover:border-blue-200', cardBg: 'bg-white hover:bg-slate-50', title: 'text-slate-800 group-hover:text-emerald-700', sub: 'text-slate-500', btn: 'bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600', shadow: 'shadow-[0_4px_15px_rgba(0,0,0,0.04)]', iconBorder: 'border-white/50' },
    { name: 'Supreme Life Protector', desc: 'เปลี่ยนทุนประกัน เป็นบำนาญ', icon: 'fas fa-hand-holding-medical', isHighlight: false, bg: 'bg-gradient-to-br from-teal-100 to-teal-200', text: 'text-teal-600', border: 'border border-white hover:border-blue-200', cardBg: 'bg-white hover:bg-slate-50', title: 'text-slate-800 group-hover:text-teal-700', sub: 'text-slate-500', btn: 'bg-slate-100 text-slate-400 group-hover:bg-teal-100 group-hover:text-teal-600', shadow: 'shadow-[0_4px_15px_rgba(0,0,0,0.04)]', iconBorder: 'border-white/50' },
    { name: 'Signature Legacy', desc: 'แผนมรดก ลูกค้ามูลค่าสูง', icon: 'fas fa-crown', isHighlight: false, bg: 'bg-gradient-to-br from-amber-100 to-amber-200', text: 'text-amber-600', border: 'border border-white hover:border-blue-200', cardBg: 'bg-white hover:bg-slate-50', title: 'text-slate-800 group-hover:text-amber-700', sub: 'text-slate-500', btn: 'bg-slate-100 text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600', shadow: 'shadow-[0_4px_15px_rgba(0,0,0,0.04)]', iconBorder: 'border-white/50' },
    { name: 'Convertable Term', desc: 'จองสิทธิ เปลี่ยนแบบประกันได้', icon: 'fas fa-umbrella', isHighlight: false, bg: 'bg-gradient-to-br from-indigo-100 to-indigo-200', text: 'text-indigo-600', border: 'border border-white hover:border-blue-200', cardBg: 'bg-white hover:bg-slate-50', title: 'text-slate-800 group-hover:text-indigo-700', sub: 'text-slate-500', btn: 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600', shadow: 'shadow-[0_4px_15px_rgba(0,0,0,0.04)]', iconBorder: 'border-white/50' },
    { name: 'Century Life', desc: 'แผนคุ้มครองตลอดชีพ', icon: 'far fa-gem', isHighlight: false, bg: 'bg-gradient-to-br from-purple-100 to-purple-200', text: 'text-purple-600', border: 'border border-white hover:border-blue-200', cardBg: 'bg-white hover:bg-slate-50', title: 'text-slate-800 group-hover:text-purple-700', sub: 'text-slate-500', btn: 'bg-slate-100 text-slate-400 group-hover:bg-purple-100 group-hover:text-purple-600', shadow: 'shadow-[0_4px_15px_rgba(0,0,0,0.04)]', iconBorder: 'border-white/50' },
    { name: '3D Health Excellence', desc: 'ประกันสุขภาพ ที่เข้าใจทุกช่วงชีวิต', icon: 'fas fa-hand-holding-medical', isHighlight: false, bg: 'bg-gradient-to-br from-cyan-100 to-cyan-200', text: 'text-cyan-600', border: 'border border-white hover:border-blue-200', cardBg: 'bg-white hover:bg-slate-50', title: 'text-slate-800 group-hover:text-cyan-700', sub: 'text-slate-500', btn: 'bg-slate-100 text-slate-400 group-hover:bg-cyan-100 group-hover:text-cyan-600', shadow: 'shadow-[0_4px_15px_rgba(0,0,0,0.04)]', iconBorder: 'border-white/50' },
    { name: 'Whole Life Extra', desc: 'สินทรัพย์กระแสเงินสด', icon: 'fas fa-money-bill-trend-up', isHighlight: false, bg: 'bg-gradient-to-br from-blue-100 to-blue-200', text: 'text-blue-600', border: 'border border-white hover:border-blue-200', cardBg: 'bg-white hover:bg-slate-50', title: 'text-slate-800 group-hover:text-blue-700', sub: 'text-slate-500', btn: 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600', shadow: 'shadow-[0_4px_15px_rgba(0,0,0,0.04)]', iconBorder: 'border-white/50' },
    { name: '24 TX', desc: 'สินทรัพย์กระแสเงินสด', icon: 'fas fa-money-bill-transfer', isHighlight: false, bg: 'bg-gradient-to-br from-violet-100 to-violet-200', text: 'text-violet-600', border: 'border border-white hover:border-blue-200', cardBg: 'bg-white hover:bg-slate-50', title: 'text-slate-800 group-hover:text-violet-700', sub: 'text-slate-500', btn: 'bg-slate-100 text-slate-400 group-hover:bg-violet-100 group-hover:text-violet-600', shadow: 'shadow-[0_4px_15px_rgba(0,0,0,0.04)]', iconBorder: 'border-white/50' },
    { name: '868 / 818 Elite Saving', desc: 'สินทรัพย์กระแสเงินสด', icon: 'fas fa-sack-dollar', isHighlight: false, bg: 'bg-gradient-to-br from-fuchsia-100 to-fuchsia-200', text: 'text-fuchsia-600', border: 'border border-white hover:border-blue-200', cardBg: 'bg-white hover:bg-slate-50', title: 'text-slate-800 group-hover:text-fuchsia-700', sub: 'text-slate-500', btn: 'bg-slate-100 text-slate-400 group-hover:bg-fuchsia-100 group-hover:text-fuchsia-600', shadow: 'shadow-[0_4px_15px_rgba(0,0,0,0.04)]', iconBorder: 'border-white/50' },
    { name: 'Medical Fund', desc: 'อยู่ระหว่างการพัฒนา', icon: 'fas fa-hospital', isHighlight: false, bg: 'bg-gradient-to-br from-sky-100 to-sky-200', text: 'text-sky-600', border: 'border border-white hover:border-blue-200', cardBg: 'bg-white hover:bg-slate-50', title: 'text-slate-800 group-hover:text-sky-700', sub: 'text-slate-500', btn: 'bg-slate-100 text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-600', shadow: 'shadow-[0_4px_15px_rgba(0,0,0,0.04)]', iconBorder: 'border-white/50' }
];

let isModernSearchActive = false;
let _loopOneHeight = 0; // pixel height of one card-set copy, measured after render
let _cachedLoopHTML = null;   // cached loop HTML (3 copies)
let _cachedForPlan = null;    // which currentAppPlan the cache was built for

function initSwipeToDismiss() {
    const wrapper = document.getElementById('planSelectCardWrapper');
    if (!wrapper || wrapper._swipeInit) return;
    wrapper._swipeInit = true;

    let startY = 0, currentY = 0;

    wrapper.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        currentY = startY;
        wrapper.style.transition = 'none';
    }, { passive: true });

    wrapper.addEventListener('touchmove', (e) => {
        const list = document.getElementById('planListContainer');
        if (list && list.scrollTop > 0) return;
        currentY = e.touches[0].clientY;
        const delta = currentY - startY;
        if (delta > 0) wrapper.style.transform = `translateY(${delta}px)`;
    }, { passive: true });

    wrapper.addEventListener('touchend', () => {
        const delta = currentY - startY;
        wrapper.style.transition = '';
        wrapper.style.transform = '';
        if (delta > 80) closePlanModal();
    });
}

function openPlanModal() {
    const modal = document.getElementById('planSelectModal');
    if (modal) modal.classList.remove('hidden');

    const cardWrapper = document.getElementById('planSelectCardWrapper');
    if (cardWrapper) {
        cardWrapper.classList.remove('translate-y-10', 'opacity-0');
        cardWrapper.classList.add('translate-y-0', 'opacity-100');
    }

    renderModernCards(modernPlansData, true);
    initSwipeToDismiss();
    initModernScrollInteractions();
    // Stagger entrance after wrapper slide starts + scroll jump settles
    setTimeout(_animateModalCards, 90);
}

function _animateModalCards() {
    const container = document.getElementById('planListContainer');
    if (!container) return;
    const cards = Array.from(container.querySelectorAll('.card-3d-container'));
    if (!cards.length) return;
    const n = modernPlansData.length; // 11
    // Loop mode: second copy (index n..2n-1) is the visible one after scrollTop jump
    // Search mode: first n cards visible
    const startIdx = isModernSearchActive ? 0 : n;
    for (let i = 0; i < n; i++) {
        const card = cards[startIdx + i];
        if (!card) continue;
        const isActive = card.querySelector('button[data-plan]')?.getAttribute('data-plan') === currentAppPlan;
        const delay = i * 32;
        const anim = isActive
            ? `cardInActive 340ms cubic-bezier(0.16,1,0.3,1) ${delay}ms both`
            : `cardIn 280ms cubic-bezier(0.16,1,0.3,1) ${delay}ms both`;
        card.style.animation = anim;
        card.addEventListener('animationend', () => { card.style.animation = ''; }, { once: true });
    }
}

function closePlanModal() {
    const cardWrapper = document.getElementById('planSelectCardWrapper');
    if(cardWrapper) {
        cardWrapper.classList.remove('translate-y-0', 'opacity-100');
        cardWrapper.classList.add('translate-y-10', 'opacity-0');
    }
    setTimeout(() => {
        const modal = document.getElementById('planSelectModal');
        if (modal) modal.classList.add('hidden');
    }, 420);
}

// Build the raw HTML for one full set of plan cards.
function _buildOneSetHTML(dataList) {
    let html = '';
    dataList.forEach(plan => {
        const onClick = `if(typeof selectAppPlan==='function'){selectAppPlan('${plan.name}');}closePlanModal();`;
        html += `<div class="card-3d-container"><button data-plan="${plan.name}" onclick="${onClick}" class="plan-card-btn w-full flex items-center gap-3.5 p-3.5 rounded-[20px] text-left" style="background:#fff;box-shadow:0 2px 10px rgba(0,0,0,0.06);border:1px solid rgba(226,232,240,0.8);"><div class="w-12 h-12 rounded-[15px] ${plan.bg} ${plan.text} flex items-center justify-center text-[22px] shrink-0" style="box-shadow:0 2px 8px rgba(0,0,0,0.08);"><i class="${plan.icon}"></i></div><div class="flex-1 min-w-0"><p class="text-[15px] font-bold text-slate-800 leading-tight truncate">${plan.name}</p><p class="text-[12px] text-slate-400 font-medium leading-snug mt-0.5 truncate">${plan.desc}</p></div></button></div>`;
    });
    return html;
}

function renderModernCards(dataList, isInitialLoad = false) {
    const container = document.getElementById('planListContainer');
    if (!container) return;

    if (!isInitialLoad) {
        // Legacy append path — kept for compatibility but no longer triggered by scroll
        container.insertAdjacentHTML('beforeend', _buildOneSetHTML(dataList));
        initNeomorphicTilt();
        return;
    }

    if (isModernSearchActive) {
        // ── Search mode: single finite list, JS stagger handles animation ──
        container.innerHTML = _buildOneSetHTML(dataList);
        container.scrollTop = 0;
        _loopOneHeight = 0;

    } else {
        // ── Loop mode: render 3 identical copies, anchor scroll to middle copy ──
        const cacheHit = _cachedLoopHTML && _cachedForPlan === currentAppPlan;

        if (!cacheHit) {
            const single = _buildOneSetHTML(dataList);
            _cachedLoopHTML = single + single + single;
            _cachedForPlan = currentAppPlan;
            _loopOneHeight = 0; // force remeasure
        }

        container.innerHTML = _cachedLoopHTML;

        if (_loopOneHeight > 0) {
            // Cached measurement — jump immediately, no rAF needed
            container.scrollTop = _loopOneHeight;
        } else {
            requestAnimationFrame(() => {
                const cards = container.querySelectorAll('.card-3d-container');
                const n = dataList.length;
                if (cards.length >= 2 * n) {
                    const r0 = cards[0].getBoundingClientRect();
                    const rN = cards[n].getBoundingClientRect();
                    _loopOneHeight = Math.round(rN.top - r0.top);
                } else {
                    _loopOneHeight = Math.round(container.scrollHeight / 3);
                }
                container.scrollTop = _loopOneHeight;
            });
        }
    }

    // Tilt only on non-touch (desktop) — skip on mobile entirely
    if (window.matchMedia('(hover: hover)').matches) initNeomorphicTilt();
}

function initNeomorphicTilt() {
    document.querySelectorAll('#planListContainer .neomorphic-menu-item:not([data-tilt])').forEach(card => {
        card.setAttribute('data-tilt', '1');
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;
            const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// 🌟 ระบบ Scroll วนไร้รอยต่อ — Bidirectional Seamless Infinite Loop 🌟
function initModernScrollInteractions() {
    const container = document.getElementById('planListContainer');
    const bottomBar = document.getElementById('modalBottomBar');
    const fadeOverlay = document.getElementById('bottomFadeOverlay');
    if (!container) return;

    let lastScrollTop = 0;
    let rafPending = false;

    container.onscroll = () => {
        // Coalesce rapid scroll events into one rAF tick for performance
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(() => {
            rafPending = false;
            const st = container.scrollTop;

            // ① Show / hide the floating bottom bar based on scroll direction
            if (st > lastScrollTop && st > 60) {
                if (bottomBar) { bottomBar.style.transform = 'translateY(150%)'; bottomBar.style.opacity = '0'; }
                if (fadeOverlay) fadeOverlay.style.opacity = '0';
            } else {
                if (bottomBar) { bottomBar.style.transform = 'translateY(0)'; bottomBar.style.opacity = '1'; }
                if (fadeOverlay) fadeOverlay.style.opacity = '1';
            }

            // ② Bidirectional seamless loop (disabled while search is active)
            //    Safe band: [0.5 × H, 1.5 × H] — one full copy above and below.
            //    Any scroll beyond the band triggers an instant silent jump back
            //    to the equivalent position inside the middle copy.
            if (!isModernSearchActive && _loopOneHeight > 0) {
                const half = Math.round(_loopOneHeight * 0.5);
                if (st < half) {
                    container.scrollTop = st + _loopOneHeight;
                } else if (st > _loopOneHeight + half) {
                    container.scrollTop = st - _loopOneHeight;
                }
            }

            lastScrollTop = container.scrollTop;
        });
    };
}

// 🌟 ระบบค้นหา
function handleUnifiedPlanSearch() {
    const input = document.getElementById('unifiedPlanSearchInput');
    if(!input) return;
    const query = input.value.toLowerCase().trim();
    const clearBtn = document.getElementById('planSearchClearBtn');
    if (clearBtn) clearBtn.classList.toggle('hidden', query === '');

    if (query === '') {
        isModernSearchActive = false;
        renderModernCards(modernPlansData, true);
    } else {
        isModernSearchActive = true;
        const filtered = modernPlansData.filter(p => p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query));
        renderModernCards(filtered, true);
    }
}

function clearPlanSearch() {
    const input = document.getElementById('unifiedPlanSearchInput');
    if (input) { input.value = ''; input.focus(); }
    const clearBtn = document.getElementById('planSearchClearBtn');
    if (clearBtn) clearBtn.classList.add('hidden');
    isModernSearchActive = false;
    renderModernCards(modernPlansData, true);
}

function updateQuickPills(planName) {
    if (typeof window.calculate === 'function' && !window.calculate.hasUIHook) {
        const originalCalculate = window.calculate;
        window.calculate = function(...args) {
            originalCalculate.apply(this, args);
            setTimeout(() => {
                if (window.lastCalculationData) {
                    highlightActivePills(window.lastCalculationData.sum, window.lastCalculationData.premium, window.lastCalculationData.cashFlow || 0);
                }
                if (currentAppPlan === '3D Health Excellence') _refresh3DRightView();
            }, 50);
        };
        window.calculate.hasUIHook = true;
    }

    const sumPillWrapper = document.getElementById('sumPillWrapper');
    const premPillContainer = document.getElementById('premiumPillContainer');
    if (!sumPillWrapper || !premPillContainer) return;

    const sumBgHtml = `<div id="sumPillBg" class="absolute top-1 bottom-1 bg-white rounded-[10px] shadow-[0_2px_8px_rgba(37,99,235,0.15)] transition-all duration-300 pointer-events-none opacity-0"></div>`;
    const premBgHtml = `<div id="premPillBg" class="absolute top-1 bottom-1 bg-white rounded-[10px] shadow-[0_2px_8px_rgba(37,99,235,0.15)] transition-all duration-300 pointer-events-none opacity-0"></div>`;
    const inactiveClass = `flex-1 relative z-10 rounded-[10px] text-[11px] font-medium text-slate-500 hover:text-slate-700 transition-all duration-300 plan-pill`;

    if (planName === 'CI Extra Plus') {
        sumPillWrapper.innerHTML = sumBgHtml + `<button id="sumPill1" onclick="setQuickSum(200000)" class="${inactiveClass}">2 แสน</button><button id="sumPill2" onclick="setQuickSum(500000)" class="${inactiveClass}">5 แสน</button><button id="sumPill3" onclick="setQuickSum(1000000)" class="${inactiveClass}">1 ล้าน</button><button id="sumPill4" onclick="setQuickSum(3000000)" class="${inactiveClass}">3 ล้าน</button><button id="sumPill5" onclick="setQuickSum(5000000)" class="${inactiveClass}">5 ล้าน</button>`;
        premPillContainer.innerHTML = premBgHtml + `<button id="premPill1" onclick="setQuickPremium(12000)" class="${inactiveClass}">12,000</button><button id="premPill2" onclick="setQuickPremium(24000)" class="${inactiveClass}">24,000</button><button id="premPill3" onclick="setQuickPremium(36000)" class="${inactiveClass}">36,000</button><button id="premPill4" onclick="setQuickPremium(48000)" class="${inactiveClass}">48,000</button><button id="premPill5" onclick="setQuickPremium(60000)" class="${inactiveClass}">60,000</button>`;
    } else if (planName === 'Signature Legacy') {
        sumPillWrapper.innerHTML = sumBgHtml + `<button id="sumPill1" onclick="setQuickSum(5000000)" class="${inactiveClass}">5 ล้าน</button><button id="sumPill2" onclick="setQuickSum(10000000)" class="${inactiveClass}">10 ล้าน</button><button id="sumPill3" onclick="setQuickSum(20000000)" class="${inactiveClass}">20 ล้าน</button><button id="sumPill4" onclick="setQuickSum(50000000)" class="${inactiveClass}">50 ล้าน</button><button id="sumPill5" onclick="setQuickSum(100000000)" class="${inactiveClass}">100 ล้าน</button>`;
        premPillContainer.innerHTML = premBgHtml + `<button id="premPill1" onclick="setQuickPremium(100000)" class="${inactiveClass}">1 แสน</button><button id="premPill2" onclick="setQuickPremium(300000)" class="${inactiveClass}">3 แสน</button><button id="premPill3" onclick="setQuickPremium(500000)" class="${inactiveClass}">5 แสน</button><button id="premPill4" onclick="setQuickPremium(1000000)" class="${inactiveClass}">1 ล้าน</button><button id="premPill5" onclick="setQuickPremium(2000000)" class="${inactiveClass}">2 ล้าน</button>`;
    } else if (planName === 'Whole Life Extra') {
        sumPillWrapper.innerHTML = '';
        premPillContainer.innerHTML = premBgHtml + `<button id="premPill1" onclick="setQuickPremium(120000)" class="${inactiveClass}">1.2 แสน</button><button id="premPill2" onclick="setQuickPremium(240000)" class="${inactiveClass}">2.4 แสน</button><button id="premPill3" onclick="setQuickPremium(360000)" class="${inactiveClass}">3.6 แสน</button><button id="premPill4" onclick="setQuickPremium(480000)" class="${inactiveClass}">4.8 แสน</button><button id="premPill5" onclick="setQuickPremium(600000)" class="${inactiveClass}">6 แสน</button>`;
    } else if (['868 / 818 Elite Saving', '24 TX'].includes(planName)) {
        sumPillWrapper.innerHTML = sumBgHtml + `<button id="sumPill1" onclick="setQuickSum(1000000)" class="${inactiveClass}">1 ล้าน</button><button id="sumPill2" onclick="setQuickSum(2000000)" class="${inactiveClass}">2 ล้าน</button><button id="sumPill3" onclick="setQuickSum(3000000)" class="${inactiveClass}">3 ล้าน</button><button id="sumPill4" onclick="setQuickSum(5000000)" class="${inactiveClass}">5 ล้าน</button><button id="sumPill5" onclick="setQuickSum(10000000)" class="${inactiveClass}">10 ล้าน</button>`;
        premPillContainer.innerHTML = premBgHtml + `<button id="premPill1" onclick="setQuickPremium(120000)" class="${inactiveClass}">1.2 แสน</button><button id="premPill2" onclick="setQuickPremium(240000)" class="${inactiveClass}">2.4 แสน</button><button id="premPill3" onclick="setQuickPremium(360000)" class="${inactiveClass}">3.6 แสน</button><button id="premPill4" onclick="setQuickPremium(480000)" class="${inactiveClass}">4.8 แสน</button><button id="premPill5" onclick="setQuickPremium(600000)" class="${inactiveClass}">6 แสน</button>`;
    } else if (['Life Protector 20', 'Supreme Life Protector'].includes(planName)) {
        sumPillWrapper.innerHTML = sumBgHtml + `<button id="sumPill1" onclick="setQuickSum(1000000)" class="${inactiveClass}">1 ล้าน</button><button id="sumPill2" onclick="setQuickSum(2000000)" class="${inactiveClass}">2 ล้าน</button><button id="sumPill3" onclick="setQuickSum(3000000)" class="${inactiveClass}">3 ล้าน</button><button id="sumPill4" onclick="setQuickSum(4000000)" class="${inactiveClass}">4 ล้าน</button><button id="sumPill5" onclick="setQuickSum(5000000)" class="${inactiveClass}">5 ล้าน</button>`;
        const lpAmts = [120000, 240000, 360000, 480000, 600000];
        const lpLabels = ['1.2 แสน', '2.4 แสน', '3.6 แสน', '4.8 แสน', '6 แสน'];
        premPillContainer.innerHTML = premBgHtml + lpAmts.map((a, i) => `<button id="premPill${i+1}" onclick="setQuickPremium(${a})" class="${inactiveClass}">${lpLabels[i]}</button>`).join('');
    } else if (planName === 'Century Life' || planName === '3D Health Excellence') {
        sumPillWrapper.innerHTML = sumBgHtml + `<button id="sumPill1" onclick="setQuickSum(100000)" class="${inactiveClass}">1 แสน</button><button id="sumPill2" onclick="setQuickSum(150000)" class="${inactiveClass}">1.5 แสน</button><button id="sumPill3" onclick="setQuickSum(200000)" class="${inactiveClass}">2 แสน</button><button id="sumPill4" onclick="setQuickSum(500000)" class="${inactiveClass}">5 แสน</button><button id="sumPill5" onclick="setQuickSum(1000000)" class="${inactiveClass}">1 ล้าน</button>`;
        premPillContainer.innerHTML = premBgHtml + `<button id="premPill1" onclick="setQuickPremium(12000)" class="${inactiveClass}">12,000</button><button id="premPill2" onclick="setQuickPremium(24000)" class="${inactiveClass}">24,000</button><button id="premPill3" onclick="setQuickPremium(36000)" class="${inactiveClass}">36,000</button><button id="premPill4" onclick="setQuickPremium(48000)" class="${inactiveClass}">48,000</button><button id="premPill5" onclick="setQuickPremium(60000)" class="${inactiveClass}">60,000</button>`;
    } else if (planName === 'Convertable Term') {
        sumPillWrapper.innerHTML = sumBgHtml + `<button id="sumPill1" onclick="setQuickSum(1000000)" class="${inactiveClass}">1 ล้าน</button><button id="sumPill2" onclick="setQuickSum(2000000)" class="${inactiveClass}">2 ล้าน</button><button id="sumPill3" onclick="setQuickSum(3000000)" class="${inactiveClass}">3 ล้าน</button><button id="sumPill4" onclick="setQuickSum(4000000)" class="${inactiveClass}">4 ล้าน</button><button id="sumPill5" onclick="setQuickSum(5000000)" class="${inactiveClass}">5 ล้าน</button>`;
        premPillContainer.innerHTML = premBgHtml + `<button id="premPill1" onclick="setQuickPremium(12000)" class="${inactiveClass}">12,000</button><button id="premPill2" onclick="setQuickPremium(24000)" class="${inactiveClass}">24,000</button><button id="premPill3" onclick="setQuickPremium(36000)" class="${inactiveClass}">36,000</button><button id="premPill4" onclick="setQuickPremium(48000)" class="${inactiveClass}">48,000</button><button id="premPill5" onclick="setQuickPremium(60000)" class="${inactiveClass}">60,000</button>`;
    } else {
        sumPillWrapper.innerHTML = sumBgHtml + `<button id="sumPill1" onclick="setQuickSum(500000)" class="${inactiveClass}">5 แสน</button><button id="sumPill2" onclick="setQuickSum(1000000)" class="${inactiveClass}">1 ล้าน</button><button id="sumPill3" onclick="setQuickSum(3000000)" class="${inactiveClass}">3 ล้าน</button><button id="sumPill4" onclick="setQuickSum(5000000)" class="${inactiveClass}">5 ล้าน</button><button id="sumPill5" onclick="setQuickSum(10000000)" class="${inactiveClass}">10 ล้าน</button>`;
        premPillContainer.innerHTML = premBgHtml + `<button id="premPill1" onclick="setQuickPremium(12000)" class="${inactiveClass}">12,000</button><button id="premPill2" onclick="setQuickPremium(24000)" class="${inactiveClass}">24,000</button><button id="premPill3" onclick="setQuickPremium(36000)" class="${inactiveClass}">36,000</button><button id="premPill4" onclick="setQuickPremium(48000)" class="${inactiveClass}">48,000</button><button id="premPill5" onclick="setQuickPremium(60000)" class="${inactiveClass}">60,000</button>`;
    }

    // 🟢 อัปเดตตัวเลือกปุ่มกระแสเงินสด WXN ตามตัวเลขใหม่ที่สั่ง
    if (planName === 'Whole Life Extra') {
        // แถวที่ 1: 24,000 / 36,000 / 48,000 / 60,000 / 100,000
        const wxnOpts1 = [
            { label: '2.4 หมื่น', val: 24000 }, 
            { label: '3.6 หมื่น', val: 36000 }, 
            { label: '4.8 หมื่น', val: 48000 }, 
            { label: '6 หมื่น', val: 60000 }, 
            { label: '1 แสน', val: 100000 }
        ];
        wxnOpts1.forEach((opt, index) => {
            let btn = document.getElementById('wxnC1Pill' + (index + 1));
            if (btn) {
                btn.innerText = opt.label;
                btn.setAttribute('onclick', `setWXNQuickCashFlow(${opt.val}, 1)`);
            }
        });

        // แถวที่ 2: 120,000 / 240,000 / 360,000 / 480,000 / 600,000
        const wxnOpts2 = [
            { label: '1.2 แสน', val: 120000 }, 
            { label: '2.4 แสน', val: 240000 }, 
            { label: '3.6 แสน', val: 360000 }, 
            { label: '4.8 แสน', val: 480000 }, 
            { label: '6 แสน', val: 600000 }
        ];
        wxnOpts2.forEach((opt, index) => {
            let btn = document.getElementById('wxnC2Pill' + (index + 1));
            if (btn) {
                btn.innerText = opt.label;
                btn.setAttribute('onclick', `setWXNQuickCashFlow(${opt.val}, 2)`);
            }
        });

    } else if (['868 / 818 Elite Saving', '24 TX'].includes(planName)) {
        const newOpts = [
            { label: '2.4 หมื่น', val: 24000 }, 
            { label: '3.6 หมื่น', val: 36000 }, 
            { label: '4.8 หมื่น', val: 48000 }, 
            { label: '6 หมื่น', val: 60000 }, 
            { label: '1 แสน', val: 100000 }
        ];
        newOpts.forEach((opt, index) => {
            let btn = document.getElementById('cashPill' + (index + 1));
            if (btn) {
                btn.innerText = opt.label;
                btn.setAttribute('onclick', `setQuickCashFlow(${opt.val})`);
            }
        });
    }

    setTimeout(() => {
        if (window.lastCalculationData) highlightActivePills(window.lastCalculationData.sum, window.lastCalculationData.premium, window.lastCalculationData.cashFlow || 0);
    }, 50);
}

// ==================== ระบบ 3D Health Options แบบ Side-menu (Pills) ====================
window.handle3DClick = function(type, val) {
    if (type === 'HX') {
        window.currentHX = val;
        if (!window.currentHXO) window.currentHXO = 'ไม่เลือก';
        if (!window.currentHBF) window.currentHBF = 0;
    } else if (type === 'HXO') {
        window.currentHXO = val;
        if (val === 'ไม่เลือก') window.currentHXD = 'ไม่เลือก';
    } else if (type === 'HXD') {
        window.currentHXD = val;
    } else if (type === 'HBF') {
        window.currentHBF = val;
    }
    
    window.render3DOptionsUI();
    if (typeof calculate === 'function') calculate('sum', true);
};

window.render3DOptionsUI = function() {
    const container = document.getElementById('threeDOptionsContainer');
    if (!container) return;
    container.className = 'flex flex-col shrink-0 mt-2 w-full';
    container.innerHTML = '';

    let hxVal = window.currentHX || '';
    let hxoVal = window.currentHXO || '';
    let hxdVal = window.currentHXD || '';
    let hbfVal = window.currentHBF || 0;

    const hxOpts = ['HX15', 'HX20', 'HX40', 'HX60', 'HX150', 'HX300'];
    const hxoOpts = ['HXO10', 'HXO20', 'HXO30', 'HXO50'];
                const hxdOpts = ['HXD100', 'HXD200', 'HXD500', 'HXD1000'];

                const displayLabels = {
                  'HXO10': '1,000', 'HXO20': '2,000', 'HXO30': '3,000', 'HXO50': '5,000',
                  'HXD100': '10,000', 'HXD200': '20,000', 'HXD500': '50,000', 'HXD1000': '100,000'
                };

    let html = '';

    html += `<div class="bg-white rounded-xl p-5 mb-3 shadow-sm border border-slate-200/50"><p class="text-[13px] font-bold text-slate-700 flex items-center gap-1.5"><i class="fas fa-bed text-teal-500"></i> ค่าห้อง (HX)</p>`;
    html += `<div class="mt-4 bg-slate-50 p-1 rounded-2xl border border-slate-200/60 shadow-inner w-full"><div class="grid grid-cols-3 gap-1 w-full">`;
    hxOpts.forEach(opt => {
        let isSel = (opt === hxVal);
        let btnClass = isSel ? 'w-full text-center py-2 text-sm font-bold text-indigo-600 bg-white shadow-md rounded-xl transition-all border-b-2 border-indigo-500/10' : 'w-full text-center py-2 text-sm font-medium text-slate-500 transition-all hover:bg-slate-200/50';
        const hxLbl = (HX_PLAN_INFO[opt] && HX_PLAN_INFO[opt].room) || opt;
        html += `<button onclick="window.handle3DClick('HX', '${opt}')" class="${btnClass}">${hxLbl}</button>`;
    });
    html += `</div></div></div>`;

    if (hxVal && hxOpts.includes(hxVal)) {
        // ── HBF — pill grid (ไม่มีปิด) + X ปิดมุมขวาบน + fine-tune stepper ──
        const hbfNum = parseInt(hbfVal) || 0;
        const hbfPresets = [500, 1000, 2000, 3000, 5000];
        const hbfPresetLbls = ['500', '1,000', '2,000', '3,000', '5,000'];
        html += `<div id="rider-hbf" class="relative bg-white rounded-xl p-5 mb-3 shadow-sm border border-rose-100">`;
        html += `<button onclick="window.handle3DClick('HBF',0);document.getElementById('rider-hbf').style.display='none';" class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90" title="ปิด HBF"><i class="fas fa-times text-[12px]"></i></button>`;
        html += `<p class="text-[13px] font-bold text-slate-700 flex items-center gap-1.5 pr-6"><i class="fas fa-heartbeat text-rose-500"></i> ชดเชยรายวัน (HBF)</p>`;
        html += `<div class="mt-4 bg-slate-50 p-1 rounded-2xl border border-slate-200/60 shadow-inner w-full"><div class="grid grid-cols-5 gap-1 w-full">`;
        hbfPresets.forEach((v, i) => {
            const isSel = hbfNum === v;
            const cls = isSel
                ? 'w-full text-center py-2 text-sm font-bold text-rose-600 bg-white shadow-md rounded-xl transition-all border-b-2 border-rose-500/10'
                : 'w-full text-center py-2 text-sm font-medium text-slate-500 transition-all hover:bg-slate-200/50';
            html += `<button onclick="window.handle3DClick('HBF',${v})" class="${cls}">${hbfPresetLbls[i]}</button>`;
        });
        html += `</div></div>`;
        html += `<div class="flex items-center gap-1.5 mt-3">`;
        html += `<button ontouchstart="window._hbfInterval=setInterval(()=>window.adjustHBF(-100),150)" ontouchend="clearInterval(window._hbfInterval)" onmousedown="window._hbfInterval=setInterval(()=>window.adjustHBF(-100),150)" onmouseup="clearInterval(window._hbfInterval)" onclick="window.adjustHBF(-100)" class="w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-bold text-lg flex items-center justify-center active:scale-90 active:bg-rose-100 active:text-rose-600 transition-all select-none touch-manipulation">−</button>`;
        html += `<input id="hbfCustomInput" type="number" inputmode="numeric" min="0" max="5000" step="100" value="${hbfNum === 0 ? '' : hbfNum}" placeholder="—" onchange="window.handle3DClick('HBF', Math.floor((parseInt(this.value)||0)/100)*100); this.blur();" class="flex-1 text-center bg-slate-50 border border-slate-200 rounded-xl h-9 text-[13px] font-bold ${hbfNum === 0 ? 'text-slate-400' : 'text-rose-600'} outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none">`;
        html += `<button ontouchstart="window._hbfInterval=setInterval(()=>window.adjustHBF(100),150)" ontouchend="clearInterval(window._hbfInterval)" onmousedown="window._hbfInterval=setInterval(()=>window.adjustHBF(100),150)" onmouseup="clearInterval(window._hbfInterval)" onclick="window.adjustHBF(100)" class="w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-bold text-lg flex items-center justify-center active:scale-90 active:bg-rose-100 active:text-rose-600 transition-all select-none touch-manipulation">+</button>`;
        html += `</div></div>`;

        // ── HXO ──
        html += `<div id="rider-hxo" class="relative bg-white rounded-xl p-5 mb-3 shadow-sm border border-blue-100"><button onclick="window.closeRiderSection('rider-hxo', 'currentHXO')" class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90" title="ซ่อน HXO"><i class="fas fa-times text-[12px]"></i></button><p class="text-[13px] font-bold text-slate-700 flex items-center gap-1.5 pr-6"><i class="fas fa-plus-circle text-blue-500"></i> EXTRA (HXO)</p>`;
        html += `<div class="mt-4 bg-slate-50 p-1 rounded-2xl border border-slate-200/60 shadow-inner w-full"><div class="grid grid-cols-4 gap-1 w-full">`;
        hxoOpts.forEach(opt => {
            let displayText = displayLabels[opt] || opt;
            let isSel = (opt === hxoVal);
            let btnClass = isSel ? 'w-full text-center py-2 text-sm font-bold text-blue-600 bg-white shadow-md rounded-xl transition-all border-b-2 border-blue-500/10' : 'w-full text-center py-2 text-sm font-medium text-slate-500 transition-all hover:bg-slate-200/50';
            html += `<button onclick="window.handle3DClick('HXO', '${opt}')" class="${btnClass}">${displayText}</button>`;
        });
        html += `</div></div></div>`;

        // ── HXD (เมื่อ HXO เลือกอยู่) ──
        if (hxoVal && hxoVal !== 'ไม่เลือก') {
            html += `<div id="rider-hxd" class="relative bg-white rounded-xl p-5 mb-3 shadow-sm border border-indigo-100"><button onclick="window.closeRiderSection('rider-hxd', 'currentHXD')" class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90" title="ซ่อน HXD"><i class="fas fa-times text-[12px]"></i></button><p class="text-[13px] font-bold text-slate-700 flex items-center gap-1.5 pr-6"><i class="fas fa-star text-indigo-500"></i> ADVANCE (HXD)</p>`;
            html += `<div class="mt-4 bg-slate-50 p-1 rounded-2xl border border-slate-200/60 shadow-inner w-full"><div class="grid grid-cols-4 gap-1 w-full">`;
            hxdOpts.forEach(opt => {
                let displayText = displayLabels[opt] || opt;
                let isSel = (opt === hxdVal);
                let btnClass = isSel ? 'w-full text-center py-2 text-sm font-bold text-indigo-600 bg-white shadow-md rounded-xl transition-all border-b-2 border-indigo-500/10' : 'w-full text-center py-2 text-sm font-medium text-slate-500 transition-all hover:bg-slate-200/50';
                html += `<button onclick="window.handle3DClick('HXD', '${opt}')" class="${btnClass}">${displayText}</button>`;
            });
            html += `</div></div></div>`;
        }
    }

    container.insertAdjacentHTML('beforeend', html);

};

// Close a rider section, reset its state, and recalculate
window.closeRiderSection = function(containerId, stateVarName) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Force hide via inline style — overrides any Tailwind flex/grid display classes
    container.style.display = 'none';

    // Reset the named global state variable
    if (stateVarName && typeof window[stateVarName] !== 'undefined') {
        window[stateVarName] = 'ไม่เลือก';
    }

    // HXO cascade: HXD is only shown when HXO is active, so close HXD too
    if (stateVarName === 'currentHXO') {
        window.currentHXD = 'ไม่เลือก';
        const hxdContainer = document.getElementById('rider-hxd');
        if (hxdContainer) hxdContainer.style.display = 'none';
    }

    // Recalculate totals — do NOT call render3DOptionsUI() as it rebuilds the DOM
    // and would re-stamp the hidden containers back into view
    if (typeof calculate === 'function') {
        calculate();
    }
};

// ── D3 Quick-Action Pills: shared state toggle + context-aware callback ──────
window.d3RiderAction = function(rider, ctx) {
    const hxOpts = ['HX15','HX20','HX40','HX60','HX150','HX300'];
    if (rider === 'MF') {
        if (ctx === 'accordion') closePopup('threeDDetailsModal');
        if (typeof selectAppPlan === 'function') selectAppPlan('Medical Fund');
        return;
    }
    if (rider === 'HX') {
        const cur = window.currentHX || 'HX15';
        window.currentHX = hxOpts[(hxOpts.indexOf(cur) + 1) % hxOpts.length];
    } else if (rider === 'HXO') {
        const next = (window.currentHXO || 'ไม่เลือก') === 'ไม่เลือก' ? 'HXO10' : 'ไม่เลือก';
        window.currentHXO = next;
        if (next === 'ไม่เลือก') window.currentHXD = 'ไม่เลือก';
    } else if (rider === 'HXD') {
        if ((window.currentHXO || 'ไม่เลือก') === 'ไม่เลือก') window.currentHXO = 'HXO10';
        window.currentHXD = (window.currentHXD || 'ไม่เลือก') === 'ไม่เลือก' ? 'HXD100' : 'ไม่เลือก';
    } else if (rider === 'HBF') {
        window.currentHBF = (!window.currentHBF || window.currentHBF === 0) ? 1000 : 0;
    }
    if (ctx === 'accordion') {
        if (typeof window.render3DOptionsUI === 'function') window.render3DOptionsUI();
        window.render3DDetailsAccordion();
    } else {
        if (typeof window.render3DOptionsUI === 'function') window.render3DOptionsUI();
        if (typeof calculate === 'function') calculate('sum', true);
        const d = typeof lastCalculationData !== 'undefined' ? lastCalculationData : null;
        if (d && typeof openUniversalModal === 'function') openUniversalModal(d);
    }
};

// Renders a 4-pill quick-action bar (ตาราง / ชำระ / บัญชี / e-sub) — ตัด แชร์ ออก
window.renderD3QuickPills = function(ctx) {
    const btnCls = 'bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-[11px] font-bold text-slate-700 flex flex-col items-center gap-1 hover:bg-white/30 transition-all active:scale-95';
    const pills = [
        { icon: 'fa-table',          label: 'ตาราง', action: 'window.openTableFromModal()' },
        { icon: 'fa-credit-card',    label: 'ชำระ',  action: "openPopup('paymentModal')" },
        { icon: 'fa-university',     label: 'บัญชี', action: 'openBankModal()' },
        { icon: 'fa-file-signature', label: 'e-sub', action: 'openEsubModal()' },
    ];
    const btns = pills.map(p =>
        `<button onclick="${p.action}" class="${btnCls}"><i class="fas ${p.icon} text-[14px]"></i><span>${p.label}</span></button>`
    ).join('');
    return `<div class="grid grid-cols-4 gap-1.5">${btns}</div>`;
};

// Share modal สำหรับ 3D: แสดง bottom sheet เดียวกับ nav bar share
window.open3DShareModal = function() {
    exportTableToPDF('modal');
};

function _refresh3DRightView() {
    const v = document.getElementById('threeDDetailsRightView');
    if (!v || v.style.display === 'none') return;
    if (typeof window.render3DDetailsAccordion === 'function') window.render3DDetailsAccordion();
}
window.setHX = function(val) { window.currentHX = val; render3DOptionsUI(); if(typeof calculate === 'function') calculate('sum', true); _refresh3DRightView(); };
window.setHXO = function(val) { window.currentHXO = val; render3DOptionsUI(); if(typeof calculate === 'function') calculate('sum', true); _refresh3DRightView(); };
window.setHXD = function(val) {
    if (val !== 'ไม่เลือก' && window.currentHXO === 'ไม่เลือก') { window.currentHXO = 'HXO10'; }
    window.currentHXD = val; render3DOptionsUI(); if(typeof calculate === 'function') calculate('sum', true); _refresh3DRightView();
};
window.setHBF = function(val) { window.currentHBF = val; render3DOptionsUI(); if(typeof calculate === 'function') calculate('sum', true); _refresh3DRightView(); };
window.adjustHBF = function(delta) {
    const cur = parseInt(window.currentHBF) || 0;
    const next = Math.max(0, Math.min(5000, Math.round((cur + delta) / 100) * 100));
    window.handle3DClick('HBF', next);
};
window.setMFPlan = function(val) { window.currentMF = val; closePopup('mfPlanModal'); if(typeof calculate === 'function') calculate('sum', true); };

// ==================== ระบบดึงเงื่อนไข (เพื่อแสดงใน Popup กดค้าง) ====================
function getConditionsHTML(planName) {
    if (planName === '868 / 818 Elite Saving' || planName.includes('Elite')) {
        let ageInput = parseInt(document.getElementById('ageInput')?.value) || 0;
        let pType = (window.currentPlan === 'S868' || ageInput <= 50) ? 'S868' : 'S818';
        let ageTxt = pType === 'S868' ? '31 วัน - 50 ปี' : '51 - 65 ปี';
        let minSaTxt = pType === 'S868' ? '50,000 บาท' : '70,000 บาท';
        let periodTxt = pType === 'S868' ? 'คุ้มครอง 18 ปี / ออม 8 ปี' : 'คุ้มครองถึงอายุ 68 / ออม 8 ปี';
        
        let html = '<div class="overflow-y-auto max-h-[55vh] space-y-3 pr-0.5 custom-scrollbar"><div class="space-y-2">';
        html += `<div class="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start gap-3"><i class="fas fa-birthday-cake text-blue-500 mt-1 text-[16px] shrink-0"></i><div class="flex-1"><p class="text-[12px] text-slate-500 font-bold mb-1">อายุรับประกัน</p><p class="text-[13.5px] font-bold text-blue-800 leading-tight">${ageTxt}</p></div></div>`;
        html += `<div class="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-start gap-3"><i class="fas fa-clock text-indigo-500 mt-1 text-[16px] shrink-0"></i><div class="flex-1"><p class="text-[12px] text-slate-500 font-bold mb-1">ระยะเวลา</p><p class="text-[13.5px] font-bold text-indigo-800 leading-tight">${periodTxt}</p></div></div>`;
        html += `<div class="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-start gap-3"><i class="fas fa-coins text-emerald-500 mt-1 text-[16px] shrink-0"></i><div class="flex-1"><p class="text-[12px] text-slate-500 font-bold mb-1">ทุนขั้นต่ำ</p><p class="text-[13.5px] font-bold text-emerald-800 leading-tight">${minSaTxt}</p></div></div>`;
        html += `<div class="bg-rose-50 p-3 rounded-xl border border-rose-100 flex items-start gap-3"><i class="fas fa-heartbeat text-rose-500 mt-1 text-[16px] shrink-0"></i><div class="flex-1"><p class="text-[12px] text-slate-500 font-bold mb-1">ความคุ้มครองชีวิต</p><p class="text-[12px] font-bold text-rose-800 leading-tight">ปีที่ 1: 100%<br>ปีที่ 2: 200%<br>...เพิ่มขึ้น 100% ทุกปี<br>ปีที่ 8 ขึ้นไป: 800%</p></div></div>`;
        html += `<div class="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-start gap-3"><i class="fas fa-car-burst text-amber-500 mt-1 text-[16px] shrink-0"></i><div class="flex-1"><p class="text-[12px] text-slate-500 font-bold mb-1">ความคุ้มครองอุบัติเหตุ</p><p class="text-[12px] font-bold text-amber-800 leading-tight">เสียชีวิตจากอุบัติเหตุทั่วไป 100%<br>เสียชีวิตจากอุบัติเหตุสาธารณะ 200%<br>ICU จากอุบัติเหตุ 20%</p></div></div>`;
        html += '</div></div>';
        return html;
    }

    let issueAge = 'โปรดดูรายละเอียดในเล่มกรมธรรม์';
    let minSA = 'โปรดดูรายละเอียดในเล่มกรมธรรม์';
    let planData = null;

    const exactMapping = {
        'Life Protector 20': '20LPB',
        'Supreme Life Protector': 'Supreme_Life_Protector_90_20'
    };
    
    let searchKey = exactMapping[planName] || planName;
    for (let i = 0; i < allInsurancePlans.length; i++) {
        if (allInsurancePlans[i].name === planName || getPlanAbbr(allInsurancePlans[i].name) === searchKey) {
            planData = allInsurancePlans[i]; break;
        }
    }
    
    let config = PLAN_CONFIG[planName] || PLAN_CONFIG[planData?.name];
    if (config) {
        issueAge = config.minAge === 0 ? `1 เดือน - ${config.maxAge} ปี` : `${config.minAge} - ${config.maxAge} ปี`;
        minSA = config.minSum ? `${config.minSum.toLocaleString()} บาท` : minSA;
    }
    
    let html = '<div class="overflow-y-auto max-h-[55vh] space-y-3 pr-0.5 custom-scrollbar"><div class="space-y-2">';
    html += `<div class="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start gap-3"><i class="fas fa-birthday-cake text-blue-500 mt-1 text-[16px] shrink-0"></i><div class="flex-1"><p class="text-[12px] text-slate-500 font-bold mb-1">อายุรับประกัน</p><p class="text-[13.5px] font-bold text-blue-800 leading-tight">${issueAge}</p></div></div>`;
    html += `<div class="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-start gap-3"><i class="fas fa-coins text-emerald-500 mt-1 text-[16px] shrink-0"></i><div class="flex-1"><p class="text-[12px] text-slate-500 font-bold mb-1">ทุนขั้นต่ำ</p><p class="text-[13.5px] font-bold text-emerald-800 leading-tight">${minSA}</p></div></div>`;
    html += '</div></div>';
    
    return html;
}

function updateConditionsModal(planName) {
    const el = document.querySelector('#insuranceConditionsModal .text-left');
    if (el) el.innerHTML = getConditionsHTML(planName); 
}

function replacePercentWithAmount(text, sum, premium) {
    return text.replace(/(\d+(?:\.\d+)?)%\s*ของทุน(?:ประกัน)?/g, (match, p1) => {
        let percent = parseFloat(p1); let amount = sum * (percent / 100); return `<span class="font-bold text-slate-800">${formatNum(amount)} บาท</span>`;
    }).replace(/(\d+(?:\.\d+)?)%\s*ของเบี้ย(?:ประกัน)?/g, (match, p1) => {
        let percent = parseFloat(p1); let amount = premium * (percent / 100); return `<span class="font-bold text-slate-800">${formatNum(amount)} บาท</span>`;
    });
}

function selectAppPlan(planName) {
    if (planName === 'Medical Fund') { showCustomError("ระบบ Medical Fund อยู่ระหว่างการพัฒนา"); return; }

    // ── Compare mode intercept ──
    if (window.__compareMode && window.__comparePlanA) {
        const planA = window.__comparePlanA;
        if (planName !== planA) {
            window.cancelCompareMode();
            window.renderCompareView(planA, planName);
            return;
        } else {
            // แตะแบบเดิมหลัง long-press — ยกเลิก compare แต่ไม่ select
            window.cancelCompareMode();
            return;
        }
    }

    _cachedForPlan = null; // invalidate card cache so active highlight updates

    const _rp = document.getElementById('rightPane');
    const _tv = document.getElementById('tableView');
    const _tableWasActive = _tv && _rp && _tv.parentElement === _rp;

    closePopup('planSelectModal');
    if (typeof window.resetRightPaneToPlaceholder === 'function') window.resetRightPaneToPlaceholder();
    currentAppPlan = planName; 
    currentMode = 'sum'; 
    
    const config = PLAN_CONFIG[planName] || PLAN_CONFIG["CI Extra Plus"];
    const inputAge = document.getElementById('ageInput');
    const curAge = parseInt(inputAge.value) || 0;
    if (curAge <= 0) inputAge.value = config.minAge !== undefined ? config.minAge : 1;
    
    document.getElementById('headerTitleText').innerText = planName;
    fitHeaderTitle();
    const planInfo = allInsurancePlans.find(p => p.name === planName);
    if (planInfo) setText('headerDescText', planInfo.desc);
    
    currentPlanOptions = config.options || [];
    let ageInputVal = parseInt(inputAge.value) || 0;
    if (planName === '868 / 818 Elite Saving') {
        currentPlan = ageInputVal <= 50 ? 'S868' : 'S818';
    } else {
        currentPlan = currentPlanOptions[0] || ''; 
    }
    
    const planSelectionWrapper = document.getElementById('planSelectionWrapper');
    if(planSelectionWrapper) { 
        if ((config.options && config.options.length <= 1) || planName === '868 / 818 Elite Saving') {
            planSelectionWrapper.classList.add('hidden');
        } else {
            planSelectionWrapper.classList.remove('hidden');
        }
    }
    
    const pLabel = document.getElementById('premiumLabel'); 
    const pPills = document.getElementById('premiumPillContainer');
    const premiumContainer = document.getElementById('premiumContainer');
    const premiumInput = document.getElementById('premiumInput');
    const cashFlowContainer = document.getElementById('cashFlowContainer');
    const sumInsuredContainer = document.getElementById('sumInsuredContainer');
    const extraOptions = document.getElementById('threeDOptionsContainer');
    const hxRoomRateContainer = document.getElementById('hxRoomRateContainer');
    const mainActionBtn = document.getElementById('mainActionBtn');
    const globalMFContainer = document.getElementById('globalMFContainer');
    const mainActionsGroup = document.getElementById('mainActionsGroup');

    premiumInput.readOnly = false;
    if(premiumContainer) premiumContainer.style.order = '';
    if(sumInsuredContainer) sumInsuredContainer.style.order = '';
    if(mainActionsGroup) mainActionsGroup.style.order = '';
    const premiumSubLabel = document.getElementById('premiumSubLabel');
    if(premiumSubLabel) premiumSubLabel.className = 'text-[10px] bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full font-medium border border-slate-200';

    if (planName === 'Whole Life Extra') {
        currentMode = 'premium'; 
        document.getElementById('premiumInput').value = "120,000";
        if(sumInsuredContainer) sumInsuredContainer.classList.add('hidden'); 
        if(premiumContainer) premiumContainer.classList.remove('hidden');
        if(cashFlowContainer) {
            cashFlowContainer.classList.remove('hidden');
            document.getElementById('singleCashFlowBox').classList.add('hidden');
            document.getElementById('dualCashFlowBox').classList.remove('hidden');
            document.getElementById('dualCashFlowBox').classList.add('flex');
        }
    } else if (planName === '868 / 818 Elite Saving') {
        currentMode = 'premium'; 
        document.getElementById('premiumInput').value = "120,000";
        if(sumInsuredContainer) sumInsuredContainer.classList.add('hidden'); 
        if(premiumContainer) premiumContainer.classList.remove('hidden');
        if(cashFlowContainer) {
            cashFlowContainer.classList.remove('hidden');
            document.getElementById('singleCashFlowBox').classList.remove('hidden');
            document.getElementById('dualCashFlowBox').classList.add('hidden');
            document.getElementById('dualCashFlowBox').classList.remove('flex');
        }
    } else if (planName === '24 TX') {
        currentMode = 'premium';
        document.getElementById('premiumInput').value = "120,000";
        document.getElementById('sumInsuredInput').value = "1,000,000";
        if(sumInsuredContainer) sumInsuredContainer.classList.remove('hidden');
        if(premiumContainer) premiumContainer.classList.remove('hidden');
        if(premiumContainer) premiumContainer.style.order = '1';
        if(sumInsuredContainer) sumInsuredContainer.style.order = '2';
        if(mainActionsGroup) mainActionsGroup.style.order = '3';
        const premSubLbl24 = document.getElementById('premiumSubLabel');
        if(premSubLbl24) premSubLbl24.className = 'text-[10px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-bold border border-blue-200';
        if(cashFlowContainer) {
            cashFlowContainer.classList.remove('hidden');
            document.getElementById('singleCashFlowBox').classList.remove('hidden');
            document.getElementById('dualCashFlowBox').classList.add('hidden');
            document.getElementById('dualCashFlowBox').classList.remove('flex');
        }
    } else if (planName === 'Life Protector 20' || planName === 'Supreme Life Protector') {
        currentMode = 'premium';
        document.getElementById('premiumInput').value = "120,000";
        document.getElementById('sumInsuredInput').value = "1,000,000";
        if(sumInsuredContainer) sumInsuredContainer.classList.remove('hidden');
        if(premiumContainer) premiumContainer.classList.remove('hidden');
        if(premiumContainer) premiumContainer.style.order = '1';
        if(sumInsuredContainer) sumInsuredContainer.style.order = '2';
        if(mainActionsGroup) mainActionsGroup.style.order = '3';
        if(cashFlowContainer) cashFlowContainer.classList.add('hidden');
        const premSubLbl = document.getElementById('premiumSubLabel');
        if(premSubLbl) premSubLbl.className = 'text-[10px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-bold border border-blue-200';
    } else if (planName === 'Century Life') {
        currentMode = 'sum';
        document.getElementById('sumInsuredInput').value = "500,000";
        document.getElementById('premiumInput').value = "12,000";
        if(sumInsuredContainer) sumInsuredContainer.classList.remove('hidden');
        if(premiumContainer) premiumContainer.classList.remove('hidden');
        if(cashFlowContainer) cashFlowContainer.classList.add('hidden');
    } else if (planName === 'Convertable Term') {
        currentMode = 'sum';
        document.getElementById('sumInsuredInput').value = "1,000,000";
        if(sumInsuredContainer) sumInsuredContainer.classList.remove('hidden');
        if(premiumContainer) premiumContainer.classList.remove('hidden');
        if(cashFlowContainer) cashFlowContainer.classList.add('hidden');
    } else {
        const defaultSum = (planName === 'CI Extra Plus') ? 200000 : (config.minSum || 100000);
        document.getElementById('sumInsuredInput').value = defaultSum.toLocaleString();
        if(sumInsuredContainer) sumInsuredContainer.classList.remove('hidden');
        if(premiumContainer) premiumContainer.classList.remove('hidden');
        if(cashFlowContainer) {
            if (config.hasCashFlow) {
                cashFlowContainer.classList.remove('hidden');
                document.getElementById('singleCashFlowBox').classList.remove('hidden');
                document.getElementById('dualCashFlowBox').classList.add('hidden');
                document.getElementById('dualCashFlowBox').classList.remove('flex');
            } else {
                cashFlowContainer.classList.add('hidden');
            }
        }
    }
    
    if (planName === '3D Health Excellence') {
        window.currentHX = 'ไม่เลือก'; window.currentHXO = 'ไม่เลือก'; window.currentHXD = 'ไม่เลือก'; window.currentHBF = 0;
        if(hxRoomRateContainer) hxRoomRateContainer.classList.add('hidden');
        if(extraOptions) { extraOptions.classList.remove('hidden'); render3DOptionsUI(); }
        const _d3b = document.getElementById('threeDDetailsBtnWrap'); if(_d3b) _d3b.classList.remove('hidden');
        if(pPills) pPills.classList.add('hidden');
        premiumInput.readOnly = true;
        if(pLabel) pLabel.innerText = "เบี้ยประกัน (บาท)"; 
    } else {
        if(extraOptions) { extraOptions.classList.remove('flex'); extraOptions.classList.add('hidden'); }
        const _d3b = document.getElementById('threeDDetailsBtnWrap'); if(_d3b) _d3b.classList.add('hidden');
        if(hxRoomRateContainer) hxRoomRateContainer.classList.add('hidden');
    }

    if (['Whole Life Extra', '24 TX', '868 / 818 Elite Saving', '3D Health Excellence'].includes(planName)) {
        if (globalMFContainer) globalMFContainer.classList.remove('hidden');
    } else {
        if (globalMFContainer) globalMFContainer.classList.add('hidden');
    }

    // TPD rider: show for 3D and CL only (not TLA)
    const globalTPDContainer = document.getElementById('globalTPDContainer');
    if (['3D Health Excellence', 'Century Life'].includes(planName)) {
        if (globalTPDContainer) globalTPDContainer.classList.remove('hidden');
    } else {
        if (globalTPDContainer) globalTPDContainer.classList.add('hidden');
        window.currentTPDEnabled = false;
        const tpdToggle = document.getElementById('tpdToggle');
        if (tpdToggle) tpdToggle.checked = false;
        const tpdArea = document.getElementById('tpdSAInputArea');
        if (tpdArea) tpdArea.classList.add('hidden');
    }

    if (['Signature Legacy', 'Convertable Term'].includes(planName)) {
        if(pLabel) pLabel.innerText = "เบี้ยประกัน (บาท)"; if(pPills) pPills.classList.add('hidden'); 
    } else if (planName !== '3D Health Excellence') {
        if(pLabel) pLabel.innerText = "ออมเงิน (บาท/ปี)"; if(pPills) pPills.classList.remove('hidden');
    }
    
    const medFundBtnContainer = document.getElementById('medicalFundBtnContainer');
    if (medFundBtnContainer) {
        if (['24 TX', '868 / 818 Elite Saving', 'Whole Life Extra', '3D Health Excellence'].includes(planName)) {
            medFundBtnContainer.classList.remove('hidden');
        } else {
            medFundBtnContainer.classList.add('hidden');
        }
    }

    if (mainActionBtn) {
        // ให้แผนพวกนี้แสดงปุ่มตารางมูลค่า (และดูรายละเอียดในตัว) นอกนั้นโชว์ดูรายละเอียด
        if (["Life Protector 20", "Supreme Life Protector", "24 TX", "Whole Life Extra"].includes(planName)) {
            mainActionBtn.innerHTML = `<i class="fas fa-table text-lg"></i> ตาราง`;
            mainActionBtn.onclick = function() { switchView('table'); };
        } else if (planName === "3D Health Excellence") {
            mainActionBtn.innerHTML = `<i class="fas fa-table text-lg"></i> รายละเอียด`;
            mainActionBtn.onclick = function() { switchView('table'); };
        } else {
            mainActionBtn.innerHTML = `<i class="fas fa-file-alt text-lg"></i> ดูรายละเอียด`;
            mainActionBtn.onclick = function() { manualTriggerPopup(); };
        }
    }
    
    updateConditionsModal(planName);
    setPlan(currentPlan);
    updateQuickPills(planName);

    // TLA ไม่มีตาราง — ปิดปุ่ม ตาราง ให้เป็นสีเทา
    const _navTbl = document.getElementById('navTableBtn');
    if (_navTbl) {
        const isTLAPlan = planName === 'Convertable Term';
        _navTbl.disabled = isTLAPlan;
        _navTbl.style.opacity = isTLAPlan ? '0.3' : '';
        _navTbl.style.cursor  = isTLAPlan ? 'not-allowed' : '';
        if (isTLAPlan && _tableWasActive) switchView('main');
    }

    if (_tableWasActive && planName !== 'Convertable Term') setTimeout(() => { if (typeof switchView === 'function') switchView('table'); }, 80);
}

function setPlan(plan) {
    currentPlan = plan;
    // CL60 has max entry age 55 — clamp and warn if needed
    if (currentAppPlan === 'Century Life' && plan === '60CL') {
        const ageInp = document.getElementById('ageInput');
        if (ageInp && parseInt(ageInp.value) > 55) {
            ageInp.value = 55;
            showCustomError("แผน CL60 รับอายุสูงสุด 55 ปี");
        }
    }
    // Refresh sum pills when switching sub-plans (CL/3D share the same pill set)
    if (currentAppPlan === 'Century Life' || currentAppPlan === '3D Health Excellence') updateQuickPills(currentAppPlan);

    // Update pill buttons
    _updatePlanPills(plan);

    calculate(currentMode, true);
}

function _updatePlanPills(activePlan) {
    const btns = [document.getElementById('btnPlan1'), document.getElementById('btnPlan2'), document.getElementById('btnPlan3'), document.getElementById('btnPlan4')];
    let activeBtn = null;
    btns.forEach((btn, idx) => {
        if (!btn) return;
        if (idx < currentPlanOptions.length) {
            let displayLabel = currentPlanOptions[idx];
            if (currentAppPlan === 'Century Life' || currentAppPlan === '3D Health Excellence') {
                displayLabel = displayLabel.replace('CL', '');
            }
            btn.innerText = displayLabel;
            btn.classList.remove('hidden');
            btn.onclick = () => setPlan(currentPlanOptions[idx]);
            const isTarget = activePlan === currentPlanOptions[idx];
            if (isTarget) { btn.className = 'flex-1 relative z-10 rounded-[10px] text-[14px] font-bold text-blue-700 transition-all duration-300'; activeBtn = btn; }
            else { btn.className = 'flex-1 relative z-10 rounded-[10px] text-[14px] font-medium text-slate-500 hover:text-slate-700 transition-all duration-300'; }
        } else { btn.classList.add('hidden'); }
    });
    const planBg = document.getElementById('planBg');
    if (planBg && activeBtn) { setTimeout(() => { planBg.style.width = activeBtn.offsetWidth + 'px'; planBg.style.left = activeBtn.offsetLeft + 'px'; }, 10); }
}

// ==================== LOGIC 6: เปิด MODAL ดูรายละเอียด ====================
function manualTriggerPopup() {
    try {
        if (!currentGender) currentGender = 'male';

        // ใช้ค่าจาก form ตรงๆ ไม่ override ด้วย default
        const sumVal = parseInt((document.getElementById('sumInsuredInput')?.value || '').replace(/,/g, '')) || 0;
        const premVal = parseInt((document.getElementById('premiumInput')?.value || '').replace(/,/g, '')) || 0;
        if (!sumVal && !premVal) {
            const premInput = document.getElementById('premiumInput');
            if (premInput) premInput.value = "120,000";
        }

        const activeMode = typeof currentMode !== 'undefined' ? currentMode : 'sum';
        const freshData = (typeof calculate === 'function') ? calculate(activeMode, true) : null;
        const dataToShow = freshData || lastCalculationData;

        if (!dataToShow) {
            console.error("Calculation failed: no data");
            return;
        }

        if (typeof openUniversalModal === 'function') openUniversalModal(dataToShow);
    } catch(e) {
        console.error("manualTriggerPopup Error:", e);
    }
}

// สร้าง Modal Maturity สำหรับ CX
function injectMaturityModal() {
    if (!document.getElementById('maturityExtraModal')) {
        const mHtml = `<div id="maturityExtraModal" class="modal-overlay hidden"><div class="modal-content-card p-5 text-center"><div class="flex justify-between items-center mb-3 border-b border-slate-100 pb-2.5"><h3 class="text-base font-bold text-indigo-900"><i class="fas fa-info-circle mr-2 text-indigo-600"></i> เงื่อนไขจากไปหรือครบสัญญา</h3><button onclick="closePopup('maturityExtraModal')" class="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors text-[16px] font-bold shadow-sm">&times;</button></div><div class="text-left text-xs font-medium text-slate-700 space-y-2"><p class="bg-indigo-50 p-3 rounded-xl border border-indigo-100">รับ 105% ของทุนประกัน หากไม่เคยเคลมโรคร้ายแรงระยะรุนแรง</p><p class="bg-rose-50 p-3 rounded-xl border border-rose-100 text-rose-700">*หากเคยเคลมโรคร้ายระยะเริ่มต้น (25%) หรือรุนแรง (100%) บริษัทจะหักออกจาก 105% นี้ และจ่ายส่วนต่างให้ (ถ้ามี)</p></div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', mHtml);
    }
}

// ==================== PLAN COMPARISON ENGINE ====================
// คำนวณ premium/sum สำหรับแผนอื่น โดยใช้ค่าใน form ปัจจุบัน
// (save state → switch plan → calculate → restore — กัน side effects ด้วย __suppressLive flag)
window.__comparePlan = null;

// ── Side-by-side comparison (wide layout only) ─────────────────────────────
window.__compareMode  = false;
window.__comparePlanA = null;

window.startCompareMode = function(planName) {
    if (!window.isWideLayout()) return;
    window.__compareMode  = true;
    window.__comparePlanA = planName;
    // show floating banner — ทำงานทุก layout
    let banner = document.getElementById('_compareBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = '_compareBanner';
        banner.style.cssText = 'position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:9999;background:linear-gradient(135deg,#1e3a8a,#0369a1);color:white;padding:10px 18px;border-radius:14px;font-size:13px;font-weight:700;display:flex;align-items:center;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,0.25);white-space:nowrap;font-family:Kanit,sans-serif;';
        document.body.appendChild(banner);
    }
    banner.innerHTML = `<i class="fas fa-code-compare"></i> เปรียบเทียบ: <span style="color:#93c5fd">${planName}</span> &nbsp;→&nbsp; กดเลือกแบบที่ 2 &nbsp;<button onclick="window.cancelCompareMode()" style="background:rgba(255,255,255,0.15);border:none;color:white;font-weight:700;font-size:13px;padding:2px 10px;border-radius:8px;cursor:pointer;">✕</button>`;
    banner.style.display = 'flex';
};

window.cancelCompareMode = function() {
    window.__compareMode  = false;
    window.__comparePlanA = null;
    const banner = document.getElementById('_compareBanner');
    if (banner) banner.style.display = 'none';
};

window.renderCompareView = function(planA, planB) {
    window.cancelCompareMode();
    if (!window.isWideLayout()) return;

    if (!lastCalculationData) { showCustomError('กรุณาคำนวณก่อนเปรียบเทียบ'); return; }

    const dA = planA === currentAppPlan ? Object.assign({}, lastCalculationData, { _planName: planA }) : window.computeForPlan(planA);
    const dB = window.computeForPlan(planB);
    if (!dA || !dB) { showCustomError('ไม่สามารถคำนวณข้อมูลเปรียบเทียบได้'); return; }

    const fmtP = n => Math.round(n).toLocaleString();
    const fmtN = n => typeof formatNum === 'function' ? formatNum(n) : Math.round(n).toLocaleString();

    function cardHTML(plan, d) {
        const cfg = (typeof PLAN_CONFIG !== 'undefined' && PLAN_CONFIG[plan]) || {};
        const hasCF = !!cfg.hasCashFlow;
        const premLabel = hasCF ? 'จำนวนเงินออม' : 'เบี้ยประกัน';
        let rows = '';
        rows += `<tr class="odd:bg-white even:bg-slate-50"><td class="py-2.5 px-4 text-[13px] text-slate-600">${premLabel}</td><td class="py-2.5 px-4 text-right font-bold text-[13px] text-rose-600">${fmtP(d.premium)} ฿/ปี</td></tr>`;
        rows += `<tr class="odd:bg-white even:bg-slate-50"><td class="py-2.5 px-4 text-[13px] text-slate-600">ทุนประกันชีวิต</td><td class="py-2.5 px-4 text-right font-bold text-[13px] text-slate-800">${fmtN(d.sum)} ฿</td></tr>`;
        if (hasCF && d.cashFlow > 0) rows += `<tr class="odd:bg-white even:bg-slate-50"><td class="py-2.5 px-4 text-[13px] text-slate-600">กระแสเงินสด/ปี</td><td class="py-2.5 px-4 text-right font-bold text-[13px] text-emerald-600">${fmtP(d.cashFlow)} ฿</td></tr>`;
        const pd = window.PRODUCT_CONDITIONS && window.PRODUCT_CONDITIONS[plan];
        if (pd && pd.benefits) {
            pd.benefits.slice(0, 4).forEach(b => {
                let plain = (typeof replacePercentWithAmount === 'function' ? replacePercentWithAmount(b, d.sum, d.premium) : b).replace(/<[^>]+>/g,'');
                const [lbl, ...rest] = plain.split(':');
                if (rest.length) rows += `<tr class="odd:bg-white even:bg-slate-50"><td class="py-2.5 px-4 text-[13px] text-slate-600">${lbl.replace(/^\S\s/,'').trim()}</td><td class="py-2.5 px-4 text-right font-bold text-[13px] text-slate-700">${rest.join(':').trim()}</td></tr>`;
            });
        }
        const planInfo = typeof allInsurancePlans !== 'undefined' ? allInsurancePlans.find(p => p.name === plan) : null;
        const icon = planInfo ? `<i class="${planInfo.icon} text-xl"></i>` : '<i class="fas fa-shield-heart text-xl"></i>';
        return `<div class="flex-1 min-w-0 flex flex-col bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden">
            <div class="flex items-center gap-3 px-4 py-3" style="background:linear-gradient(135deg,#0d9488,#0369a1);">
                <div class="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">${icon}</div>
                <div class="min-w-0"><div class="text-white font-bold text-[13px] leading-tight truncate">${plan}</div>
                <div class="text-white/70 text-[11px]">อายุ ${d.age} | ${(d.gender==='male'||d.gender==='ชาย')?'ชาย':'หญิง'}</div></div>
            </div>
            <table class="w-full border-collapse flex-1"><tbody>${rows}</tbody></table>
            <div class="p-3 border-t border-slate-100">
                <button onclick="selectAppPlan('${plan}');closePlanModal();" class="w-full py-2 rounded-xl text-[12px] font-bold text-white flex items-center justify-center gap-1.5" style="background:linear-gradient(135deg,#0d9488,#0369a1);">
                    <i class="fas fa-arrow-right"></i> เลือกแบบนี้
                </button>
            </div>
        </div>`;
    }

    const html = `<div class="p-4 h-full overflow-y-auto">
        <div class="flex items-center gap-2 mb-3">
            <i class="fas fa-code-compare text-blue-600"></i>
            <span class="font-bold text-slate-700 text-[14px]">เปรียบเทียบแบบประกัน</span>
            <button onclick="window.resetRightPaneToPlaceholder()" class="ml-auto text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"><i class="fas fa-xmark"></i> ปิด</button>
        </div>
        <div class="flex gap-3">${cardHTML(planA, dA)}${cardHTML(planB, dB)}</div>
    </div>`;

    window.injectToWorkspace(html);
};

// Long-press delegation — เริ่ม compare mode (ทุก layout)
(function initCompareLongPress() {
    const THRESHOLD = 500;
    const MOVE_DEAD_ZONE = 8;
    let _timer = null, _downPlan = null, _startX = 0, _startY = 0;
    function getTargetPlan(e) {
        const btn = e.target.closest('[data-plan]');
        return btn ? btn.getAttribute('data-plan') : null;
    }
    function cancel() { clearTimeout(_timer); _timer = null; _downPlan = null; }

    document.addEventListener('touchstart', e => {
        if (!window.isWideLayout()) return;
        const container = document.getElementById('planListContainer');
        if (!container || !container.contains(e.target)) return;
        _downPlan = getTargetPlan(e);
        if (!_downPlan) return;
        _startX = e.touches[0].clientX;
        _startY = e.touches[0].clientY;
        _timer = setTimeout(() => {
            const plan = _downPlan;
            _downPlan = null;
            if (navigator.vibrate) navigator.vibrate(40);
            window.startCompareMode(plan);
        }, THRESHOLD);
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        if (!_timer) return;
        const dx = e.touches[0].clientX - _startX;
        const dy = e.touches[0].clientY - _startY;
        if (Math.sqrt(dx * dx + dy * dy) > MOVE_DEAD_ZONE) cancel();
    }, { passive: true });

    // non-passive — preventDefault ป้องกัน click หลัง long-press บน planA เดิม
    document.addEventListener('touchend', e => {
        if (window.__compareMode && window.__comparePlanA) {
            // long-press เพิ่งยิง กัน click ที่ตามมา
            if (getTargetPlan(e) === window.__comparePlanA) e.preventDefault();
        }
        cancel();
    }, { passive: false });
    document.addEventListener('touchcancel', cancel, { passive: true });

    // mouse long-press for desktop/notebook
    let _mouseStartX = 0, _mouseStartY = 0;
    let _mouseLongPressFired = false;
    document.addEventListener('mousedown', e => {
        if (e.button !== 0 || !window.isWideLayout()) return;
        const container = document.getElementById('planListContainer');
        if (!container || !container.contains(e.target)) return;
        _downPlan = getTargetPlan(e);
        if (!_downPlan) return;
        _mouseStartX = e.clientX; _mouseStartY = e.clientY;
        _mouseLongPressFired = false;
        _timer = setTimeout(() => {
            _mouseLongPressFired = true;
            window.startCompareMode(_downPlan);
            _downPlan = null;
        }, THRESHOLD);
    });
    document.addEventListener('mousemove', e => {
        if (!_timer) return;
        const dx = e.clientX - _mouseStartX, dy = e.clientY - _mouseStartY;
        if (Math.sqrt(dx * dx + dy * dy) > MOVE_DEAD_ZONE) cancel();
    });
    document.addEventListener('click', e => {
        if (_mouseLongPressFired) { e.stopPropagation(); e.preventDefault(); _mouseLongPressFired = false; }
    }, true);
    document.addEventListener('mouseup',    cancel);
    document.addEventListener('mouseleave', cancel);
})();

window.computeForPlan = function (planName) {
    if (!planName || typeof PLAN_CONFIG === 'undefined' || !PLAN_CONFIG[planName]) return null;
    if (planName === currentAppPlan) return lastCalculationData;

    const cfg = PLAN_CONFIG[planName];
    const saved = {
        appPlan: currentAppPlan,
        plan: currentPlan,
        data: lastCalculationData,
        mode: typeof currentMode !== 'undefined' ? currentMode : 'premium',
        suppress: window.__suppressLive
    };
    window.__suppressLive = true;
    let result = null;
    try {
        currentAppPlan = planName;
        currentPlan = (cfg.options && cfg.options[0]) || currentPlan;
        if (typeof calculate === 'function') calculate(saved.mode, true);
        if (lastCalculationData) {
            result = Object.assign({}, lastCalculationData, { _planName: planName });
        }
    } catch (e) {
        console.warn('computeForPlan failed for', planName, e);
    } finally {
        currentAppPlan = saved.appPlan;
        currentPlan = saved.plan;
        lastCalculationData = saved.data;
        window.__suppressLive = saved.suppress;
    }
    return result;
};

// ==================== PEARL LIVE CANVAS — Right Pane Injection ====================
// Mobile (Swal popup) → ตารางสรุปแบบเดิม
// Wide layout (iPad/Tablet/Desktop/Foldable inner) → 2-column plan comparison
function _injectToPearLCanvas(d) {
    const fmtN = (n) => typeof formatNum === 'function' ? formatNum(n) : Math.round(n).toLocaleString();
    const fmtP = (n) => Math.round(n).toLocaleString();

    // Skip ถ้าอยู่ระหว่าง computeForPlan (กัน recursion)
    if (window.__suppressLive) return;

    const statusText = document.getElementById('canvasStatusText');
    if (statusText) { statusText.textContent = 'LIVE'; statusText.style.color = '#00A651'; }

    const cfg = (typeof PLAN_CONFIG !== 'undefined' && PLAN_CONFIG[currentAppPlan]) || {};
    const hasCF = !!cfg.hasCashFlow;
    const premLabel = hasCF ? 'จำนวนเงินออม' : 'เบี้ยประกัน';

    const clr = { cg: 'value-cg-glow', rose: 'text-rose-600', blue: 'text-blue-600', '': 'text-slate-800' };
    const R = (label, value, cls) =>
        `<tr class="odd:bg-white even:bg-slate-50 hover:bg-[#00A651]/5 transition-colors text-slate-700">
            <td class="py-4 px-6 text-[15px]">${label}</td>
            <td class="py-4 px-6 text-right font-bold text-[15px] ${clr[cls] || 'text-slate-800'}">${value}</td>
        </tr>`;

    let rows = '';
    rows += R(premLabel, fmtP(d.premium) + ' ฿ / ปี', hasCF ? 'cg' : 'rose');
    rows += R('ทุนประกันชีวิต', fmtN(d.sum) + ' ฿', '');

    if (hasCF && d.cashFlow > 0) rows += R('กระแสเงินสด / ปี', fmtP(d.cashFlow) + ' ฿', 'cg');

    if (currentAppPlan === 'CI Extra Plus') {
        rows += R('โรคร้ายแรงเริ่มต้น (25%)', fmtN(d.sum * 0.25) + ' ฿', 'blue');
        rows += R('โรคร้ายแรงรุนแรง (75%)',   fmtN(d.sum * 0.75) + ' ฿', 'blue');
        rows += R('ครบสัญญา (105%)',            fmtN(d.sum * 1.05) + ' ฿', 'cg');
        if (d.age >= 0 && d.age <= 15) rows += R('โรคร้ายสำหรับเด็ก', fmtN(d.sum) + ' ฿', 'blue');
    } else if (currentAppPlan === '868 / 818 Elite Saving') {
        rows += R('เงินคืนรายปี (12%)',          fmtP(Math.round(d.sum * 0.12)) + ' ฿', 'cg');
        rows += R('ครบสัญญา (720%)',             fmtP(Math.round(d.sum * 7.2))  + ' ฿', 'cg');
        rows += R('กรณีเสียชีวิตสูงสุด (800%)', fmtP(Math.round(d.sum * 8))    + ' ฿', 'rose');
    } else if (currentAppPlan === 'Signature Legacy') {
        const acc = d.sum + Math.min(d.sum, 100000000);
        const can = Math.min(d.sum * 0.30, 30000000);
        const ter = Math.min(d.sum * 0.90, (d.age >= 60 && d.age <= 70) ? 50000000 : 100000000);
        rows += R('กรณีอุบัติเหตุ (200%)',    fmtN(acc) + ' ฿', 'blue');
        rows += R('มะเร็ง (30%)',              fmtN(can) + ' ฿', 'rose');
        rows += R('โรคร้ายระยะสุดท้าย (90%)', fmtN(ter) + ' ฿', 'rose');
    } else {
        const pd2 = window.PRODUCT_CONDITIONS && window.PRODUCT_CONDITIONS[currentAppPlan];
        if (pd2 && pd2.benefits) {
            pd2.benefits.slice(0, 5).forEach(b => {
                let plain = (typeof replacePercentWithAmount === 'function' ? replacePercentWithAmount(b, d.sum, d.premium) : b).replace(/<[^>]+>/g, '');
                let [lbl, ...rest] = plain.split(':');
                rows += R(lbl.replace(/^\S\s/, '').trim(), rest.join(':').trim(), '');
            });
        }
    }

    const period = d.years ? `${d.years} ปี` : null;
    const premiumDisplay = `${fmtP(d.premium)} ฿ / ปี`;
    const sumDisplay = `${fmtN(d.sum)} ฿`;

    const contentHtml = `
            <div class="max-w-4xl mx-auto p-4 sm:p-5 rounded-2xl bg-white/85 border border-white/60 shadow-[0_20px_60px_rgba(15,23,42,0.08)]" style="backdrop-filter:blur(24px) saturate(160%);-webkit-backdrop-filter:blur(24px) saturate(160%);">
                <div class="flex items-center gap-2 mb-3">
                    <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#2a45a3] flex items-center justify-center shrink-0 shadow-md">
                        <i class="fas fa-shield-heart text-white text-xs"></i>
                    </div>
                    <div class="text-sm font-extrabold text-slate-900">${currentAppPlan}</div>
                </div>

                <div class="flex flex-wrap gap-1.5 mb-4">
                    <span class="px-3 py-1 text-[12px] rounded-full bg-white text-slate-700 font-medium border border-slate-200 shadow-sm">เพศ: ${d.gender}</span>
                    <span class="px-3 py-1 text-[12px] rounded-full bg-white text-slate-700 font-medium border border-slate-200 shadow-sm">อายุ: ${d.age} ปี</span>
                    ${period ? `<span class="px-3 py-1 text-[12px] rounded-full bg-white text-slate-700 font-medium border border-slate-200 shadow-sm">ระยะเวลา: ${period}</span>` : ''}
                    <span class="px-3 py-1 text-[12px] rounded-full bg-white text-slate-700 font-medium border border-slate-200 shadow-sm">${premLabel}: <span class="font-bold text-slate-900">${premiumDisplay}</span></span>
                    <span class="px-3 py-1 text-[12px] rounded-full bg-[#00A651]/10 text-[#00A651] font-bold border border-[#00A651]/30 shadow-sm">ทุนประกันชีวิต: ${sumDisplay}</span>
                </div>

            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm mb-6">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50 border-b-2 border-slate-100 text-slate-900">
                        <tr>
                            <th class="py-4 px-6 font-bold whitespace-nowrap">รายการ</th>
                            <th class="py-4 px-6 font-bold whitespace-nowrap text-right">มูลค่า (฿)</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>

        <!-- Desktop / Tablet / Foldable right-pane: compact 3-button layout (visible ≥768px) -->
        <div class="hidden min-[700px]:block">
            <div class="grid grid-cols-2 gap-3 mb-3">
                <button onclick="openTableFromModal()" class="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/70 hover:bg-white/90 border border-white/80 text-slate-600 font-bold text-sm shadow-sm transition-colors">
                    <i class="fas fa-table text-indigo-500"></i>ตาราง
                </button>
                <button onclick="openGenericShareModal('summary')" class="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 hover:opacity-90 text-white font-bold text-sm shadow-md transition-opacity">
                    <i class="fas fa-share-nodes"></i>แชร์
                </button>
            </div>
            <button onclick="openGenericShareModal('summary')" class="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 text-blue-600 font-bold text-sm transition-colors">
                <i class="fas fa-coins"></i>แชร์เฉพาะเบี้ยประกัน
            </button>
        </div>

        <!-- Mobile Swal popup: spacious vertical Pill Column (visible <768px / จอนอกพับ) -->
        <div class="min-[700px]:hidden flex flex-col gap-3 p-4">
            <button onclick="Swal.close(); setTimeout(() => openTableFromModal(), 200);" class="w-full flex items-center gap-3 p-4 bg-white border border-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-[#00A651]/10 active:scale-[0.98] transition-all">
                <i class="fas fa-table text-lg text-blue-500"></i>
                <span class="text-slate-700 font-medium">ดูตารางผลประโยชน์</span>
            </button>
            <button onclick="Swal.close(); setTimeout(() => openGenericShareModal('summary'), 200);" class="w-full flex items-center gap-3 p-4 bg-white border border-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-[#00A651]/10 active:scale-[0.98] transition-all">
                <i class="fas fa-share-nodes text-lg text-[#00A651]"></i>
                <span class="text-slate-700 font-medium">แชร์ให้ลูกค้า</span>
            </button>
            <button onclick="Swal.close(); setTimeout(() => openInstallmentModal(), 200);" class="w-full flex items-center gap-3 p-4 bg-white border border-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-[#00A651]/10 active:scale-[0.98] transition-all">
                <i class="fas fa-credit-card text-lg text-purple-500"></i>
                <span class="text-slate-700 font-medium">ตัวเลือกชำระ</span>
            </button>
            <button onclick="Swal.close(); setTimeout(() => openBankModal(), 200);" class="w-full flex items-center gap-3 p-4 bg-white border border-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-[#00A651]/10 active:scale-[0.98] transition-all">
                <i class="fas fa-money-bill-transfer text-lg text-orange-500"></i>
                <span class="text-slate-700 font-medium">บัญชีโอนเงิน</span>
            </button>
            <button onclick="Swal.close(); setTimeout(() => openEsubModal(), 200);" class="w-full flex items-center gap-3 p-4 bg-white border border-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-[#00A651]/10 active:scale-[0.98] transition-all">
                <i class="fas fa-laptop-medical text-lg text-teal-500"></i>
                <span class="text-slate-700 font-medium">E-Submission</span>
            </button>
            <button onclick="Swal.close(); setTimeout(() => openGenericShareModal('summary'), 200);" class="w-full flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-blue-100 active:scale-[0.98] transition-all">
                <i class="fas fa-coins text-lg text-blue-600"></i>
                <span class="text-blue-700 font-bold">แชร์เฉพาะเบี้ยประกัน</span>
            </button>
        </div>
        </div>`;

    // Mobile / no-canvas: fall back to Swal popup (wide layout handled at top of function)
    const resultHtml = contentHtml;
    if (!window.injectToWorkspace(resultHtml)) {
        Swal.fire({
            html: resultHtml,
            background: 'rgba(255, 255, 255, 0.95)',
            showConfirmButton: false,
            showCloseButton: true
        });
    }
}

// ==================== COMPARISON VIEW BUILDER (Wide Layout Only) ====================
function _buildComparisonHtml(d, fmtN, fmtP) {
    const compareName = (window.__comparePlan && window.__comparePlan !== currentAppPlan)
        ? window.__comparePlan : null;
    const compareData = compareName ? window.computeForPlan(compareName) : null;

    const planList = (typeof PLAN_CONFIG !== 'undefined')
        ? Object.keys(PLAN_CONFIG).filter(p => p !== currentAppPlan)
        : [];

    const dropdownOpts = '<option value="">— เลือกแผนเพื่อเปรียบเทียบ —</option>'
        + planList.map(p => `<option value="${p}"${p === compareName ? ' selected' : ''}>${p}</option>`).join('');

    function metricCard(label, valueHtml, color) {
        return `
            <div class="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">${label}</div>
                <div class="text-2xl font-extrabold ${color} mt-2 leading-tight">${valueHtml}</div>
            </div>
        `;
    }

    function column(title, isCurrent, data) {
        const cardClass = isCurrent
            ? 'border-emerald-300 bg-gradient-to-br from-emerald-50/60 to-white shadow-md'
            : 'border-blue-200 bg-gradient-to-br from-blue-50/40 to-white';

        const header = isCurrent
            ? `
                <div class="flex items-center justify-between gap-2 mb-1">
                    <div class="text-base font-extrabold text-slate-900 truncate">${title || '—'}</div>
                    <span class="shrink-0 inline-block bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">แผนปัจจุบัน</span>
                </div>
                <div class="text-[11px] text-emerald-700 font-medium">ค่าที่คำนวณจากฟอร์มซ้าย</div>
            `
            : `
                <select onchange="window.__comparePlan = this.value || null; if (window.lastCalculationData) window._injectToPearLCanvas(window.lastCalculationData);"
                    class="w-full bg-white border border-blue-300 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 cursor-pointer">
                    ${dropdownOpts}
                </select>
                <div class="text-[11px] text-blue-700 font-medium mt-2">เลือกแผนเพื่อดูเบี้ย/ทุนเปรียบเทียบ</div>
            `;

        const body = data ? `
            <div class="mt-4 space-y-3">
                ${metricCard('เบี้ยประกัน / ปี', `${fmtP(data.premium)} <span class="text-base font-bold text-slate-500">฿</span>`, 'text-blue-600')}
                ${metricCard('ทุนประกัน', `${fmtN(data.sum)} <span class="text-base font-bold text-slate-500">฿</span>`, 'text-emerald-600')}
            </div>
        ` : `
            <div class="mt-4 flex flex-col items-center justify-center text-center text-slate-400 py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl">
                <i class="fas fa-arrow-up text-3xl mb-3 text-blue-300"></i>
                <div class="text-sm font-medium">เลือกแผนจากเมนูด้านบน<br>เพื่อเปรียบเทียบเบี้ย/ทุน</div>
            </div>
        `;

        return `
            <div class="rounded-2xl border-2 ${cardClass} p-5 flex flex-col" style="min-width:0;">
                ${header}
                ${body}
            </div>
        `;
    }

    return `
        <div class="max-w-5xl mx-auto p-2">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#2a45a3] flex items-center justify-center shadow-md shrink-0">
                    <i class="fas fa-scale-balanced text-white text-sm"></i>
                </div>
                <div>
                    <div class="text-base font-extrabold text-slate-900 leading-tight">เปรียบเทียบแผนประกัน</div>
                    <div class="text-[11px] text-slate-500 font-medium">เลือกแผนทางขวาเพื่อเทียบเบี้ย/ทุนกับแผนปัจจุบัน</div>
                </div>
            </div>

            <div class="flex flex-wrap gap-1.5 mb-4">
                <span class="px-3 py-1 text-[12px] rounded-full bg-white text-slate-700 font-medium border border-slate-200 shadow-sm">เพศ: <span class="font-bold">${d.gender}</span></span>
                <span class="px-3 py-1 text-[12px] rounded-full bg-white text-slate-700 font-medium border border-slate-200 shadow-sm">อายุ: <span class="font-bold">${d.age} ปี</span></span>
                ${d.years ? `<span class="px-3 py-1 text-[12px] rounded-full bg-white text-slate-700 font-medium border border-slate-200 shadow-sm">ระยะเวลา: <span class="font-bold">${d.years} ปี</span></span>` : ''}
            </div>

            <div class="grid grid-cols-2 gap-3">
                ${column(currentAppPlan, true, d)}
                ${column(compareName, false, compareData)}
            </div>

            ${compareData ? `
                <div class="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[12px] text-slate-600">
                    <i class="fas fa-info-circle text-blue-500 mr-1"></i>
                    ผลต่างเบี้ย/ปี: <span class="font-bold ${compareData.premium > d.premium ? 'text-rose-600' : 'text-emerald-600'}">${(compareData.premium > d.premium ? '+' : '')}${fmtP(compareData.premium - d.premium)} ฿</span>
                    · ผลต่างทุน: <span class="font-bold ${compareData.sum > d.sum ? 'text-emerald-600' : 'text-rose-600'}">${(compareData.sum > d.sum ? '+' : '')}${fmtN(compareData.sum - d.sum)} ฿</span>
                </div>
            ` : ''}
        </div>
    `;
}
window._buildComparisonHtml = _buildComparisonHtml;

// Expose globally so share.js (loaded in same scope) can always reach it
window._injectToPearLCanvas = _injectToPearLCanvas;

// ==================== WORKSPACE DATA BRIDGE ====================
// Force-injects HTML into the right-pane. Returns false if no canvas
// or below the wide-layout threshold (≥768×600) so callers can fall back to Swal.
function _unmountViewsFromRightPane() {
    const rightPane = document.getElementById('rightPane');
    const appCont = document.querySelector('.app-container');
    // Remove dynamic 3D details view (คืน accordionBody กลับ modal ก่อน)
    const d3v = document.getElementById('threeDDetailsRightView');
    if (d3v) {
        const ab = document.getElementById('threeDDetailsAccordionBody');
        const modal = document.getElementById('threeDDetailsModal');
        if (ab && modal) { const mc = modal.querySelector('.modal-content-card'); if (mc) mc.appendChild(ab); }
        d3v.remove();
    }
    ['tableView', 'cashView'].forEach(id => {
        const el = document.getElementById(id);
        if (el && rightPane && el.parentElement === rightPane) {
            el.style.cssText = 'display:none';
            if (appCont) appCont.appendChild(el);
        }
    });
}

window.injectToWorkspace = function(html) {
    const canvas = document.getElementById('resultCanvas');
    if (canvas && window.isWideLayout()) {
        _unmountViewsFromRightPane();
        const placeholder = document.getElementById('canvasPlaceholder');
        if (placeholder) placeholder.style.display = 'none';
        let resultDiv = document.getElementById('canvasResult');
        if (!resultDiv) {
            resultDiv = document.createElement('div');
            resultDiv.id = 'canvasResult';
            resultDiv.style.cssText = 'width:100%;';
            canvas.appendChild(resultDiv);
        }
        resultDiv.innerHTML = html;
        window.__rightPaneActive = true;
        canvas.classList.remove('workspace-fade-slide-up');
        void canvas.offsetWidth;
        canvas.classList.add('workspace-fade-slide-up');
        if (typeof closeVoiceOverlay === 'function') closeVoiceOverlay();
        return true;
    }
    return false;
};
window.renderToWorkspace = window.injectToWorkspace; // legacy alias

// ── AI Panel helpers ──────────────────────────────────────────────────────────
function _aiMenuHTML() {
    return `<div style="display:flex;flex-direction:column;gap:10px;font-family:'Kanit',sans-serif;">
        <button onclick="window.open('https://gemini.google.com/','_blank')" style="width:100%;display:flex;align-items:center;gap:14px;padding:13px 16px;background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:14px;cursor:pointer;font-family:'Kanit',sans-serif;">
            <div style="width:38px;height:38px;border-radius:10px;background:white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.08);flex-shrink:0;"><i class="fas fa-sparkles" style="color:#0284c7;font-size:17px;"></i></div>
            <div style="text-align:left;flex:1;"><div style="font-size:14px;font-weight:700;color:#1e40af;">Google Gemini</div><div style="font-size:11px;color:#64748b;">AI สำหรับค้นหาและวิเคราะห์</div></div>
            <i class="fas fa-external-link-alt" style="color:#93c5fd;font-size:11px;"></i>
        </button>
        <button onclick="window.open('https://notebooklm.google.com/','_blank')" style="width:100%;display:flex;align-items:center;gap:14px;padding:13px 16px;background:#faf5ff;border:1.5px solid #ddd6fe;border-radius:14px;cursor:pointer;font-family:'Kanit',sans-serif;">
            <div style="width:38px;height:38px;border-radius:10px;background:white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.08);flex-shrink:0;"><i class="fas fa-book-open" style="color:#7c3aed;font-size:17px;"></i></div>
            <div style="text-align:left;flex:1;"><div style="font-size:14px;font-weight:700;color:#6d28d9;">Notebook LM</div><div style="font-size:11px;color:#64748b;">AI สำหรับสรุปเอกสาร</div></div>
            <i class="fas fa-external-link-alt" style="color:#c4b5fd;font-size:11px;"></i>
        </button>
        <!-- เมนูเทียบแบบ (ซ่อนชั่วคราว)
        <button onclick="window._aiShowCompare()" style="width:100%;display:flex;align-items:center;gap:14px;padding:13px 16px;background:#f0fdfa;border:1.5px solid #99f6e4;border-radius:14px;cursor:pointer;font-family:'Kanit',sans-serif;">
            <div style="width:38px;height:38px;border-radius:10px;background:white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.08);flex-shrink:0;"><i class="fas fa-scale-balanced" style="color:#0d9488;font-size:17px;"></i></div>
            <div style="text-align:left;flex:1;"><div style="font-size:14px;font-weight:700;color:#0f766e;">เทียบแบบประกัน</div><div style="font-size:11px;color:#64748b;">เปรียบเทียบหลายแผนพร้อมกัน</div></div>
            <i class="fas fa-chevron-right" style="color:#5eead4;font-size:11px;"></i>
        </button>
        <button onclick="window._aiShow3D()" style="width:100%;display:flex;align-items:center;gap:14px;padding:13px 16px;background:#fff1f2;border:1.5px solid #fecdd3;border-radius:14px;cursor:pointer;font-family:'Kanit',sans-serif;">
            <div style="width:38px;height:38px;border-radius:10px;background:white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.08);flex-shrink:0;"><i class="fas fa-hand-holding-medical" style="color:#e11d48;font-size:17px;"></i></div>
            <div style="text-align:left;flex:1;"><div style="font-size:14px;font-weight:700;color:#be123c;">เทียบแผน 3D Health</div><div style="font-size:11px;color:#64748b;">เปรียบเทียบแพ็กเกจ HX</div></div>
            <i class="fas fa-chevron-right" style="color:#fda4af;font-size:11px;"></i>
        </button>
        -->
    </div>`;
}

window._aiShowCompare = function() {
    // สลับ content ใน Swal เดิม (ถ้าเปิดอยู่) หรือสร้างใหม่
    const swalHtml = Swal.getHtmlContainer();
    if (swalHtml) {
        if (window._buildCompareHTML) {
            Swal.update({ title: '<span style="font-family:Kanit,sans-serif;font-size:17px;">🔍 เทียบแบบประกัน</span>' });
            swalHtml.innerHTML = window._buildCompareHTML();
        }
    } else if (window.openCompareModal) {
        window.openCompareModal();
    }
};

window._aiShow3D = function() {
    const swalHtml = Swal.getHtmlContainer();
    if (swalHtml) {
        if (window._build3DCompareHTML) {
            Swal.update({ title: '<span style="font-family:Kanit,sans-serif;font-size:17px;">🏥 เทียบแผน 3D Health Excellence</span>' });
            swalHtml.innerHTML = window._build3DCompareHTML();
        }
    } else if (window.openCompare3DModal) {
        window.openCompare3DModal();
    }
};

window.openAIPanel = function() {
    // สำหรับ wide layout — inject ใน right pane, ไม่ใช้ Swal
    if (window.isWideLayout()) {
        ['navMainBtn','navTableBtn','navCashBtn','navAiBtn'].forEach(id => {
            const el = document.getElementById(id); if (el) el.classList.remove('active');
        });
        const aiBtn = document.getElementById('navAiBtn');
        if (aiBtn) aiBtn.classList.add('active');
        const html = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:2rem;gap:1.5rem;">
            <div style="text-align:center;margin-bottom:0.5rem;">
                <div style="width:56px;height:56px;border-radius:18px;background:linear-gradient(135deg,#2563eb,#1e3a8a);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;box-shadow:0 8px 24px rgba(37,99,235,0.35);">
                    <i class="fas fa-robot" style="color:white;font-size:22px;"></i>
                </div>
                <div style="font-size:17px;font-weight:800;color:#1e293b;font-family:'Kanit',sans-serif;">เลือกผู้ช่วย AI</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:3px;">AI Tools สำหรับตัวแทน</div>
            </div>
            <div style="width:100%;max-width:340px;">${_aiMenuHTML()}</div>
        </div>`;
        if (window.injectToWorkspace) window.injectToWorkspace(html);
        return;
    }
    // สำหรับ mobile — เปิด Swal เดียว ไม่เปิดซ้อน
    Swal.fire({
        title: '<span style="font-family:Kanit,sans-serif;font-size:17px;"><i class="fas fa-robot" style="color:#2563eb;margin-right:6px;"></i>เลือกผู้ช่วย AI</span>',
        html: _aiMenuHTML(),
        showConfirmButton: false,
        showCloseButton: true,
        width: Math.min(window.innerWidth - 20, 420),
        didOpen: () => {
            const popup = Swal.getPopup();
            if (popup) popup.style.borderRadius = '20px';
        }
    });
};

window.resetRightPaneToPlaceholder = function() {
    window.__rightPaneActive = false;
    _unmountViewsFromRightPane();
    ['navMainBtn','navTableBtn','navCashBtn','navAiBtn'].forEach(id => {
        const el = document.getElementById(id); if (el) el.classList.remove('active');
    });
    const mainBtn = document.getElementById('navMainBtn');
    if (mainBtn) mainBtn.classList.add('active');
    const placeholder = document.getElementById('canvasPlaceholder');
    if (placeholder) placeholder.style.display = '';
    const resultDiv = document.getElementById('canvasResult');
    if (resultDiv) resultDiv.innerHTML = '';
};

// ==================== GLOBAL DISPLAY HUB ====================
window.displayPremiumResult = function(tableHtml, planName) {
    planName = planName || 'ผลการคำนวณ';
    const isDesktop = window.isWideLayout();

    if (isDesktop && window.renderToWorkspace(tableHtml)) {
        return;
    }

    // Fallback: legacy selectors (presentationPane / .right-pane) if #resultCanvas isn't present
    const rightPane = document.getElementById('presentationPane') || document.querySelector('.right-pane');
    if (isDesktop && rightPane) {
        rightPane.innerHTML = tableHtml;
        rightPane.classList.remove('workspace-fade-slide-up');
        void rightPane.offsetWidth;
        rightPane.classList.add('workspace-fade-slide-up');
        if (typeof closeVoiceOverlay === 'function') closeVoiceOverlay();
    } else {
        // มือถือ: ใช้ Popup ปกติ
        Swal.fire({
            html: tableHtml,
            background: 'rgba(255, 255, 255, 0.95)',
            showConfirmButton: false,
            showCloseButton: true
        });
    }
};

// รวมศูนย์เปิด Modal (รองรับทุกแผน)
function _injectModalToRightPane(modalId) {
    const modal = document.getElementById(modalId);
    const canvas = document.getElementById('resultCanvas');
    if (!modal || !canvas) { openPopup(modalId); return; }

    const cardEl = modal.querySelector('.modal-content-card');
    if (!cardEl) { openPopup(modalId); return; }

    const placeholder = document.getElementById('canvasPlaceholder');
    if (placeholder) placeholder.style.display = 'none';

    // Clone populated modal card into right pane wrapper
    const wrapper = document.createElement('div');
    wrapper.id = 'rightPaneModalContent';
    wrapper.className = 'max-w-sm mx-auto pb-6';
    const clone = cardEl.cloneNode(true);
    // Remove close button — no overlay to dismiss
    clone.querySelectorAll('button[onclick*="closePopup"]').forEach(b => b.remove());
    wrapper.appendChild(clone);

    const existing = document.getElementById('rightPaneModalContent');
    if (existing) existing.remove();
    canvas.innerHTML = '';
    canvas.appendChild(wrapper);
}

const _PILL_BTN = `w-full flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] active:scale-[0.98] transition-all`;
const _MODAL_ACTION_HTML = `
<div class="flex flex-col gap-3 mt-4">
    <button onclick="openTableFromModal()" class="${_PILL_BTN}"><i class="fas fa-table text-lg text-blue-500"></i><span class="text-slate-700 font-medium">ดูตารางผลประโยชน์</span></button>
    <button onclick="openGenericShareModal('summary')" class="${_PILL_BTN}"><i class="fas fa-share-nodes text-lg text-[#00A651]"></i><span class="text-slate-700 font-medium">แชร์ให้ลูกค้า</span></button>
    <button onclick="openInstallmentModal()" class="${_PILL_BTN}"><i class="fas fa-credit-card text-lg text-purple-500"></i><span class="text-slate-700 font-medium">ตัวเลือกชำระ</span></button>
    <button onclick="openBankModal()" class="${_PILL_BTN}"><i class="fas fa-money-bill-transfer text-lg text-orange-500"></i><span class="text-slate-700 font-medium">บัญชีโอนเงิน</span></button>
    <button onclick="openEsubModal()" class="${_PILL_BTN}"><i class="fas fa-laptop-medical text-lg text-teal-500"></i><span class="text-slate-700 font-medium">E-Submission</span></button>
</div>`;

function openUniversalModal(d) {
    if(!d) return;

    const _wide = window.isWideLayout();

    injectMaturityModal();
    const _diseaseBtn = document.getElementById('shareDiseaseListBtn');
    if (_diseaseBtn) _diseaseBtn.classList.add('hidden');
    
    if (currentAppPlan === '868 / 818 Elite Saving') {
        setText('modalGender', d.gender); 
        setText('modalAge', d.age + " ปี"); 
        setText('modalYears', "8 ปี"); 
        setText('modalPremium', Math.round(d.premium).toLocaleString()); 
        setText('modalSum', formatNum(d.sum)); 
        
        // ซ่อนกล่องเงื่อนไขของ CX ทิ้งไป
        const childRow = document.getElementById('modalChildRow'); 
        if (childRow) { childRow.classList.add('hidden'); childRow.classList.remove('flex'); }
        const extraCIRow = document.getElementById('modalExtraCIRow');
        const majorCIRow = document.getElementById('modalMajorCIRow');
        const maturityRow = document.getElementById('modalMaturityRow');
        if (extraCIRow) { extraCIRow.classList.remove('flex'); extraCIRow.classList.add('hidden'); }
        if (majorCIRow) { majorCIRow.classList.remove('flex'); majorCIRow.classList.add('hidden'); }
        if (maturityRow) { maturityRow.classList.remove('flex'); maturityRow.classList.add('hidden'); }
        
        let dynamicContainer = document.getElementById('modalDynamicBenefits');
        if (!dynamicContainer) {
            const scrollArea = document.querySelector('#resultModal .overflow-y-auto');
            if (scrollArea) {
                dynamicContainer = document.createElement('div');
                dynamicContainer.id = 'modalDynamicBenefits';
                dynamicContainer.className = 'space-y-3 mt-4';
                const shareBtn = scrollArea.querySelector('.mt-4:last-child'); 
                if (shareBtn) scrollArea.insertBefore(dynamicContainer, shareBtn);
                else scrollArea.appendChild(dynamicContainer);
            }
        }
        
        if (dynamicContainer) {
            dynamicContainer.classList.remove('hidden');
            
            // คำนวณผลประโยชน์ Elite ตามประกาศ[cite: 5]
            let cashFlowTotal = Math.round(d.sum * 0.12);
            let maturityTotal = Math.round(d.sum * 7.20);
            let deathTotal = Math.round(d.sum * 8.00); 
            
            let maturityText = window.currentPlan === 'S868' ? 'ครบกำหนดสัญญา ปีที่ 18' : 'ครบกำหนดสัญญา อายุ 68 ปี';
            
            let html = `
                <div class="flex flex-col p-3.5 bg-indigo-50/70 rounded-[14px] border border-indigo-100 mb-3">
                    <div class="flex justify-between items-center gap-2 mb-2 border-b border-indigo-100/50 pb-2">
                        <span class="text-[12px] text-indigo-900 font-bold flex items-center gap-1.5 leading-tight"><i class="fas fa-hand-holding-usd text-indigo-500"></i> เงินคืนรายปี (12%)</span>
                        <span class="text-[13px] font-extrabold text-indigo-700 text-right shrink-0">${cashFlowTotal.toLocaleString()} ฿</span>
                    </div>
                    <div class="flex justify-between items-center gap-2 mb-2 border-b border-indigo-100/50 pb-2">
                        <span class="text-[12px] text-indigo-900 font-bold flex items-center gap-1.5 leading-tight"><i class="fas fa-gift text-indigo-500"></i> ${maturityText} (720%)</span>
                        <span class="text-[13px] font-extrabold text-indigo-700 text-right shrink-0">${maturityTotal.toLocaleString()} ฿</span>
                    </div>
                    <div class="flex justify-between items-center gap-2">
                        <span class="text-[12px] text-rose-900 font-bold flex items-center gap-1.5 leading-tight"><i class="fas fa-heartbeat text-rose-500"></i> กรณีเสียชีวิตสูงสุด (800%)</span>
                        <span class="text-[13px] font-extrabold text-rose-700 text-right shrink-0">${deathTotal.toLocaleString()} ฿</span>
                    </div>
                </div>`;
            dynamicContainer.innerHTML = html;
        }
        
        const actionContainer = document.getElementById('modalActionBtnsContainer');
        if (actionContainer) actionContainer.innerHTML = _MODAL_ACTION_HTML;
        openPopup('resultModal');
    }
    else if (currentAppPlan === 'Signature Legacy') {
        setText('modalSLBGender', d.gender); setText('modalSLBAge', d.age + " ปี"); setText('modalSLBYears', d.years + " ปี"); 
        setText('modalSLBPremium', Math.round(d.premium).toLocaleString()); setText('modalSLBSum', formatNum(d.sum)); 
        let accidentalTotal = d.sum + Math.min(d.sum, 100000000); setText('modalSLBAccident', formatNum(accidentalTotal));
        setText('modalSLBCancer', formatNum(Math.min(d.sum * 0.30, 30000000))); let terminalMaxCap = (d.age >= 60 && d.age <= 70) ? 50000000 : 100000000;
        setText('modalSLBTerminal', formatNum(Math.min(d.sum * 0.90, terminalMaxCap))); setText('modalSLBTerminalNote', `* หากรับเงินก้อนมะเร็ง 30% ไปแล้ว จะหักออกจากยอดนี้`);
        openPopup('slbResultModal');
    } 
    else if (currentAppPlan === 'CI Extra Plus') {
        setText('modalGender', d.gender); 
        setText('modalAge', d.age + " ปี"); 
        setText('modalYears', d.years + " ปี"); 
        setText('modalPremium', Math.round(d.premium).toLocaleString()); 
        setText('modalSum', formatNum(d.sum)); 
        
        const childRow = document.getElementById('modalChildRow'); 
        if (childRow) {
            if (d.age >= 0 && d.age <= 15) { 
                childRow.classList.remove('hidden'); childRow.classList.add('flex'); 
                setText('modalChildCI', formatNum(d.sum)); 
            } else { 
                childRow.classList.add('hidden'); childRow.classList.remove('flex'); 
            } 
        }
        
        const extraCIRow = document.getElementById('modalExtraCIRow');
        if (extraCIRow) { 
            extraCIRow.classList.remove('hidden'); extraCIRow.classList.add('flex'); 
            setText('modalExtraCI', formatNum(d.sum * 0.25)); 
        }

        const majorCIRow = document.getElementById('modalMajorCIRow');
        if (majorCIRow) { 
            majorCIRow.classList.remove('hidden'); majorCIRow.classList.add('flex'); 
            setText('modalMajorCI', formatNum(d.sum * 0.75)); 
            setText('modalMedExtra1Popup', formatNum(d.sum * 0.10)); 
        }

        const maturityRow = document.getElementById('modalMaturityRow');
        if (maturityRow) {
            maturityRow.classList.remove('hidden'); maturityRow.classList.add('flex');
            setText('modalMaturity', formatNum(d.sum * 1.05));
            setText('modalMaturityExtraPopup', formatNum(d.sum * 0.05));
        }

        if (_diseaseBtn) _diseaseBtn.classList.remove('hidden');

        const actionContainer = document.getElementById('modalActionBtnsContainer');
        if (actionContainer) actionContainer.innerHTML = _MODAL_ACTION_HTML;
        
        const dynamicContainer = document.getElementById('modalDynamicBenefits');
        if (dynamicContainer) dynamicContainer.classList.add('hidden');

        openPopup('resultModal');
    }
    else {
        setText('modalGender', d.gender); setText('modalAge', d.age + " ปี"); setText('modalYears', d.years + " ปี"); 
        setText('modalPremium', Math.round(d.premium).toLocaleString()); setText('modalSum', formatNum(d.sum)); 
        
        const childRow = document.getElementById('modalChildRow'); 
        if (childRow) { childRow.classList.add('hidden'); childRow.classList.remove('flex'); }
        
        const extraCIRow = document.getElementById('modalExtraCIRow');
        const majorCIRow = document.getElementById('modalMajorCIRow');
        const maturityRow = document.getElementById('modalMaturityRow');

        if (extraCIRow) { extraCIRow.classList.remove('flex'); extraCIRow.classList.add('hidden'); }
        if (majorCIRow) { majorCIRow.classList.remove('flex'); majorCIRow.classList.add('hidden'); }
        if (maturityRow) { maturityRow.classList.remove('flex'); maturityRow.classList.add('hidden'); }
        
        let dynamicContainer = document.getElementById('modalDynamicBenefits');
        if (!dynamicContainer) {
            const scrollArea = document.querySelector('#resultModal .overflow-y-auto');
            if (scrollArea) {
                dynamicContainer = document.createElement('div');
                dynamicContainer.id = 'modalDynamicBenefits';
                dynamicContainer.className = 'space-y-3 mt-4';
                const shareBtn = scrollArea.querySelector('.mt-4:last-child'); 
                if (shareBtn) scrollArea.insertBefore(dynamicContainer, shareBtn);
                else scrollArea.appendChild(dynamicContainer);
            }
        }
        
        if (dynamicContainer) {
            dynamicContainer.classList.remove('hidden');
            let html = '';
            const pd = window.PRODUCT_CONDITIONS && window.PRODUCT_CONDITIONS[currentAppPlan];
            
            if (pd && pd.benefits && pd.benefits.length > 0) {
                pd.benefits.forEach((b) => {
                    let calcB = replacePercentWithAmount(b, d.sum, d.premium);
                    let emojiMatch = calcB.match(/^([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/);
                    let emoji = emojiMatch ? emojiMatch[0] : '🔹';
                    let textClean = calcB.replace(/^([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])\s*/, '');
                    
                    let title = textClean; let valStr = '';
                    if (textClean.includes(':')) {
                        let parts = textClean.split(':');
                        title = parts[0]; valStr = parts.slice(1).join(':').trim();
                    }

                    html += `<div class="flex flex-col p-3.5 bg-blue-50/70 rounded-[14px] border border-blue-100 mb-3">
                                <div class="flex justify-between items-center gap-2">
                                    <span class="text-[12px] text-blue-900 font-bold flex items-center gap-1.5 leading-tight">${emoji} ${title}</span>
                                    ${valStr ? `<span class="text-[13px] font-extrabold text-blue-700 text-right shrink-0">${valStr}</span>` : ''}
                                </div>
                            </div>`;
                });
            }
            
            if (pd && pd.remark && currentAppPlan !== '3D Health Excellence') {
                 html += `<div class="bg-slate-50 p-2.5 rounded-[12px] border border-slate-100 mt-2"><p class="text-[10px] text-slate-500 italic font-medium leading-relaxed">${pd.remark.replace(/\n/g, '<br>')}</p></div>`;
            }
            dynamicContainer.innerHTML = html;
        }

        // 3D + wide layout → แสดง 19 หมวดในจอขวาเรียลไทม์ (ไม่มี selector ในจอขวา)
        if (currentAppPlan === '3D Health Excellence' && _wide) {
            window.open3DDetailsView();
            return;
        }

        const actionContainer = document.getElementById('modalActionBtnsContainer');
        if (actionContainer) actionContainer.innerHTML = _MODAL_ACTION_HTML;
        openPopup('resultModal');
    }
}

// ==================== CASH MODULE DISPLAYS ====================
const _COM_KEY_MAP = {
    'TLA': '20TLA', 'Convertable Term': '20TLA',
    '24 TX': '24TX',
    'S868': 'S868', 'S818': 'S818',
};

function getComRateArray(planKey) {
    if (typeof COM_RATES === 'undefined') return [];
    planKey = _COM_KEY_MAP[planKey] || planKey;
    let planData = COM_RATES[planKey];
    if (!planData) return [];
    if (Array.isArray(planData)) return planData;

    let age = 0;
    if (typeof lastCalculationData !== 'undefined' && lastCalculationData && lastCalculationData.age !== undefined) {
        age = lastCalculationData.age;
    } else {
        const ageInput = document.getElementById('ageInput');
        age = ageInput ? (parseInt(ageInput.value) || 0) : 0;
    }

    for (let key in planData) {
        if (key.includes('-')) {
            let parts = key.split('-');
            let min = parseInt(parts[0], 10);
            let max = parseInt(parts[1], 10);
            if (age >= min && age <= max) {
                let rateData = planData[key];
                if (typeof rateData === 'string') {
                    let mainRateKey = currentAppPlan === '24 TX' ? '24TX' : currentPlan;
                    return getComRateArray(mainRateKey);
                }
                if (Array.isArray(rateData)) return rateData;
                // sum-tiered: look up by sum insured
                if (typeof rateData === 'object' && rateData !== null) {
                    const sum = (typeof lastCalculationData !== 'undefined' && lastCalculationData) ? (lastCalculationData.sum || 0) : 0;
                    for (let sumKey in rateData) {
                        if (sumKey.includes('-')) {
                            let sp = sumKey.split('-');
                            let sMin = parseInt(sp[0], 10);
                            let sMax = parseInt(sp[1], 10);
                            if (sum >= sMin && sum <= sMax) return Array.isArray(rateData[sumKey]) ? rateData[sumKey] : [];
                        }
                    }
                    // default: last sum tier
                    const lastSumKey = Object.keys(rateData).pop();
                    return lastSumKey && Array.isArray(rateData[lastSumKey]) ? rateData[lastSumKey] : [];
                }
                return [];
            }
        }
    }

    for (let key in planData) {
        if (Array.isArray(planData[key])) return planData[key];
    }
    return [];
}

function updateMBDisplay() { 
    let rateKey = _COM_KEY_MAP[currentPlan] || _COM_KEY_MAP[currentAppPlan] || currentPlan;
    const effectivePlan = (typeof COM_RATES !== 'undefined' && COM_RATES[rateKey]) ? rateKey : rateKey;
    const rateArr = getComRateArray(effectivePlan);
    if (typeof lastCalculationData === 'undefined' || !lastCalculationData || rateArr.length === 0) return; 
    
    const p = lastCalculationData.premium || 0;
    const fycFromCase = Math.round(p * (rateArr[0] || 0)) || 0; 
    
    const existingFYC = getSafeValue('existingFYCInput'); 
    const totalFYC = fycFromCase + existingFYC; 
    const tiers = [{min:8000, max: 16000, rate:0.20}, {min:16001, max: 32000, rate:0.25}, {min:32001, max: 64000, rate:0.30}, {min:64001, max: Infinity, rate:0.35}]; 
    let curIdx = -1; tiers.forEach((t, i) => { if (totalFYC >= t.min) curIdx = i; }); 
    const currentRate = curIdx >= 0 ? tiers[curIdx].rate : 0; 
    setText('mbCalculatedBonus', Math.round(totalFYC * currentRate).toLocaleString() + " บาท"); 
    setText('mbTotalFYCDisplay', totalFYC.toLocaleString());
    
    let tierHtml = '';
    tiers.forEach((t, i) => {
        const isActive = (curIdx === i);
        tierHtml += `<div class="flex justify-between items-center p-3 rounded-[16px] border ${isActive ? 'border-[#10b981] bg-[#ecfdf5]' : 'border-slate-100 bg-white'} mb-2 shadow-sm"><span class="text-[14px] font-bold ${isActive ? 'text-[#065f46]' : 'text-slate-600'}">${t.min.toLocaleString()} - ${t.max === Infinity ? 'ขึ้นไป' : t.max.toLocaleString()}</span><span class="text-[14px] font-black px-4 py-1.5 rounded-xl ${isActive ? 'bg-[#10b981]/20 text-[#047857]' : 'text-slate-800'}">${formatPct(t.rate * 100)}</span></div>`;
    });
    document.getElementById('mbTierList').innerHTML = tierHtml;
    setText('mbCaseFYCDisplay', fycFromCase.toLocaleString()); setText('mbExistingFYCDisplay', existingFYC.toLocaleString());
    setText('mbBonusCalcMethod', `(${totalFYC.toLocaleString()} x ${formatPct(currentRate * 100)})`);
    
    if (document.getElementById('caseIncomeBonusCalc')) {
        document.getElementById('caseIncomeBonusCalc').innerText = `(${fycFromCase.toLocaleString()} x ${formatPct(currentRate * 100)})`;
    }

    window.currentMBBonus = Math.round(fycFromCase * currentRate);
    const adviceBox = document.getElementById('mbAdviceText'); 
    if (adviceBox) { 
        if (curIdx < tiers.length - 1) { 
            const next = tiers[curIdx + 1]; 
            adviceBox.innerHTML = `<strong>เพิ่มอีก <span class="whitespace-nowrap text-amber-600">${(Math.max(0, next.min - totalFYC)).toLocaleString()} บาท</span></strong><br><span class="text-slate-500">เพื่อรับโบนัสระดับถัดไป ${formatPct(next.rate * 100)}</span>`; 
            hasShownCongratsMB = false;
        } else { 
            adviceBox.innerHTML = `<strong class="text-emerald-600">🎉 ยินดีด้วย!</strong><br><span class="text-slate-600">คุณได้รับโบนัสระดับสูงสุด ${formatPct(tiers[curIdx].rate * 100)} แล้ว</span>`; 
            if (!hasShownCongratsMB) { showCongratsToast(`ทะลุเป้าหมาย MB สูงสุด ${formatPct(tiers[curIdx].rate * 100)} แล้ว`); hasShownCongratsMB = true; }
        } 
    }
}

window.toggleMYBTiers = function() {
    const hiddenTiers = document.querySelectorAll('.myb-tier-hidden');
    hiddenTiers.forEach(el => el.classList.toggle('hidden'));
    const btn = document.getElementById('mybToggleBtn');
    if (btn) {
        if (btn.innerText.includes('ดูเพิ่มเติม')) {
            btn.innerHTML = 'ย่อตาราง <i class="fas fa-chevron-up ml-1"></i>';
        } else {
            btn.innerHTML = 'ดูตารางเพิ่มเติม <i class="fas fa-chevron-down ml-1"></i>';
        }
    }
};

function updateMYBDisplay() { 
    let rateKey = _COM_KEY_MAP[currentPlan] || _COM_KEY_MAP[currentAppPlan] || currentPlan;
    const effectivePlan = (typeof COM_RATES !== 'undefined' && COM_RATES[rateKey]) ? rateKey : rateKey;
    const rateArr = getComRateArray(effectivePlan);
    if (typeof lastCalculationData === 'undefined' || !lastCalculationData || rateArr.length === 0) return; 
    
    const p = lastCalculationData.premium || 0;
    const fycFromCase = Math.round(p * (rateArr[0] || 0)) || 0; 
    
    const existingHalfYearFYC = getSafeValue('existingHalfYearFYCInput'); 
    const totalFYC = fycFromCase + existingHalfYearFYC; 
    const tiers = [{min:40000, max: 60000, rate:0.175}, {min:60001, max: 100000, rate:0.20}, {min:100001, max: 150000, rate:0.225}, {min:150001, max: 200000, rate:0.25}, {min:200001, max: 250000, rate:0.275}, {min:250001, max: 300000, rate:0.30}, {min:300001, max: 400000, rate:0.325}, {min:400001, max: Infinity, rate:0.35}]; 
    let curIdx = -1; tiers.forEach((t, i) => { if (totalFYC >= t.min) curIdx = i; }); 
    const currentRate = curIdx >= 0 ? tiers[curIdx].rate : 0; 
    
    let tierHtml = '';
    tiers.forEach((t, i) => {
        const isActive = (curIdx === i);
        const hiddenClass = i >= 4 ? 'myb-tier-hidden hidden' : '';
        tierHtml += `<div class="${hiddenClass} flex justify-between items-center p-3 rounded-[16px] border ${isActive ? 'border-[#8b5cf6] bg-[#f5f3ff]' : 'border-slate-100 bg-white'} mb-2 shadow-sm"><span class="text-[14px] font-bold ${isActive ? 'text-[#5b21b6]' : 'text-slate-600'}">${t.min.toLocaleString()} - ${t.max === Infinity ? 'ขึ้นไป' : t.max.toLocaleString()}</span><span class="text-[14px] font-black px-4 py-1.5 rounded-xl ${isActive ? 'bg-[#8b5cf6]/20 text-[#6d28d9]' : 'text-slate-800'}">${formatPct(t.rate * 100)}</span></div>`;
    });
    if (tiers.length > 4) {
        tierHtml += `<button id="mybToggleBtn" onclick="toggleMYBTiers()" class="w-full text-center text-[11px] font-bold text-purple-600 bg-purple-50 py-2 rounded-xl mt-1 hover:bg-purple-100 transition-colors">ดูตารางเพิ่มเติม <i class="fas fa-chevron-down ml-1"></i></button>`;
    }

    document.getElementById('mybTierList').innerHTML = tierHtml;
    setText('mybCalculatedBonus', Math.round(totalFYC * currentRate).toLocaleString() + " บาท"); 
    setText('mybCaseFYCDisplay', fycFromCase.toLocaleString()); setText('mybMBFYCDisplay', existingHalfYearFYC.toLocaleString());
    setText('mybTotalFYCDisplay', totalFYC.toLocaleString()); setText('mybBonusCalcMethod', `(${totalFYC.toLocaleString()} x ${formatPct(currentRate * 100)})`);
    
    if (document.getElementById('caseIncomeMYBonusCalc')) {
        document.getElementById('caseIncomeMYBonusCalc').innerText = `(${fycFromCase.toLocaleString()} x ${formatPct(currentRate * 100)})`;
    }

    window.currentMYBBonus = Math.round(fycFromCase * currentRate);
    const adviceBox = document.getElementById('mybAdviceText'); 
    if (adviceBox) { 
        if (curIdx < tiers.length - 1) { 
            const next = tiers[curIdx + 1]; 
            adviceBox.innerHTML = `<strong>เพิ่มอีก <span class="whitespace-nowrap text-amber-600">${(Math.max(0, next.min - totalFYC)).toLocaleString()} บาท</span></strong><br><span class="text-slate-500">เพื่อรับโบนัสระดับถัดไป ${formatPct(next.rate * 100)}</span>`; 
            hasShownCongratsMYB = false;
        } else { 
            adviceBox.innerHTML = `<strong class="text-emerald-600">🎉 ยินดีด้วย!</strong><br><span class="text-slate-600">คุณได้รับโบนัสครึ่งปีเกินเกณฑ์ขั้นที่ 4 แล้ว</span>`; 
            if (!hasShownCongratsMYB) { showCongratsToast(`ทะลุเป้าหมาย MYB แล้ว`); hasShownCongratsMYB = true; }
        } 
    }
}

function updateNABDisplay() { 
    let rateKey = _COM_KEY_MAP[currentPlan] || _COM_KEY_MAP[currentAppPlan] || currentPlan;
    const effectivePlan = (typeof COM_RATES !== 'undefined' && COM_RATES[rateKey]) ? rateKey : rateKey;
    const rateArr = getComRateArray(effectivePlan);
    if (typeof lastCalculationData === 'undefined' || !lastCalculationData || rateArr.length === 0) return; 
    
    const p = lastCalculationData.premium || 0;
    const fycFromCase = Math.round(p * (rateArr[0] || 0)) || 0; 
    
    const existingNABFYC = getSafeValue('existingNABFYCInput'); 
    const existingCases = parseInt(document.getElementById('existingNABCases')?.value) || 0; 
    const phase = document.getElementById('nabPhaseSelect')?.value || 'p1'; 
    
    const totalFYC = fycFromCase + existingNABFYC; const totalCases = 1 + existingCases; 
    let tiers = phase === 'p1' ? [{ minFYC: 20000, minCases: 3, bonus: 6000, label: "≥ 20,000 และ 3 ราย" },{ minFYC: 50000, minCases: 5, bonus: 15000, label: "≥ 50,000 และ 5 ราย" }] : [{ minFYC: 40000, minCases: 5, bonus: 10000, label: "≥ 40,000 และ 5 ราย" },{ minFYC: 100000, minCases: 10, bonus: 25000, label: "≥ 100,000 และ 10 ราย" }]; 
    let nabBonus = 0; let currentTierIdx = -1; 
    tiers.forEach((t, i) => { if (totalFYC >= t.minFYC && totalCases >= t.minCases) { nabBonus = t.bonus; currentTierIdx = i; } }); 
    
    let tierHtml = '';
    tiers.forEach((t, i) => {
        const isActive = (currentTierIdx === i);
        const activeClass = isActive ? 'border-[#06b6d4] bg-[#ecfeff]' : 'border-slate-100 bg-white';
        const fycIcon = (totalFYC >= t.minFYC) ? '<i class="fas fa-check-circle text-[#10b981]"></i>' : '<i class="far fa-circle text-slate-300"></i>';
        const casesIcon = (totalCases >= t.minCases) ? '<i class="fas fa-check-circle text-[#10b981]"></i>' : '<i class="far fa-circle text-slate-300"></i>';
        tierHtml += `<div class="flex justify-between items-center p-3 rounded-[16px] border ${activeClass} mb-2 shadow-sm"><div class="flex flex-col gap-1"><span class="text-[14px] font-bold text-slate-800">${t.label}</span><div class="text-[11px] text-slate-500 flex flex-col mt-0.5"><span class="flex items-center gap-1.5">${fycIcon} FYC: ${totalFYC.toLocaleString()} / ${t.minFYC.toLocaleString()}</span><span class="flex items-center gap-1.5">${casesIcon} ราย: ${totalCases} / ${t.minCases}</span></div></div><span class="text-[16px] font-black text-[#0891b2]">${t.bonus.toLocaleString()}</span></div>`;
    });
    document.getElementById('nabTierList').innerHTML = tierHtml;
    window.currentNABBonus = nabBonus; 
    setText('nabCaseFYCDisplay', fycFromCase.toLocaleString()); setText('nabExistingFYCDisplay', existingNABFYC.toLocaleString()); 
    setText('nabTotalFYCDisplay', totalFYC.toLocaleString()); setText('nabCalculatedBonus', nabBonus.toLocaleString() + " บาท"); 
    
    const adviceBox = document.getElementById('nabAdviceText'); 
    if (adviceBox) { 
        if (currentTierIdx < tiers.length - 1) { 
            const nextTier = tiers[currentTierIdx + 1]; const fycNeed = Math.max(0, nextTier.minFYC - totalFYC); const casesNeed = Math.max(0, nextTier.minCases - totalCases); 
            let adviceText = "<strong>เพิ่มอีก "; if (fycNeed > 0) adviceText += `<span class="whitespace-nowrap text-amber-600">${fycNeed.toLocaleString()} FYC</span> `; if (fycNeed > 0 && casesNeed > 0) adviceText += "และ "; if (casesNeed > 0) adviceText += `<span class="whitespace-nowrap text-amber-600">${casesNeed} ราย</span>`; adviceText += `</strong><br><span class="text-slate-500">เพื่อรับโบนัส <span class="whitespace-nowrap">${nextTier.bonus.toLocaleString()} บาท</span></span>`; 
            adviceBox.innerHTML = adviceText; hasShownCongratsNAB = false;
        } else { 
            adviceBox.innerHTML = `<strong class="text-emerald-600">🎉 ยินดีด้วย!</strong><br><span class="text-slate-600">คุณได้รับโบนัสสูงสุด <span class="whitespace-nowrap">${nabBonus.toLocaleString()} บาท</span> แล้ว</span>`; 
            if (!hasShownCongratsNAB && nabBonus > 0) { showCongratsToast(`ทะลุเป้าหมาย NAB รับโบนัส ${nabBonus.toLocaleString()} บาท`); hasShownCongratsNAB = true; }
        } 
    } 
}

function handleMBInput(el) { let v = el.value.replace(/,/g, '').split('.')[0]; if (!isNaN(v) && v !== '') el.value = Number(v).toLocaleString(); refreshAllDisplays(); }
function handleMYBInput(el) { let v = el.value.replace(/,/g, '').split('.')[0]; if (!isNaN(v) && v !== '') el.value = Number(v).toLocaleString(); refreshAllDisplays(); }
function handleNABFYCInput(el) { let v = el.value.replace(/,/g, '').split('.')[0]; if (!isNaN(v) && v !== '') el.value = Number(v).toLocaleString(); refreshAllDisplays(); }

function setNABPhase(phase) {
    document.getElementById('nabPhaseSelect').value = phase;
    const bg = document.getElementById('nabPhaseBg'); const btnP1 = document.getElementById('btnNabP1'); const btnP2 = document.getElementById('btnNabP2');
    if (phase === 'p1') {
        bg.style.transform = 'translateX(0)';
        btnP1.classList.remove('font-medium', 'text-slate-500', 'hover:text-slate-700'); btnP1.classList.add('font-bold', 'text-cyan-700');
        btnP2.classList.remove('font-bold', 'text-cyan-700'); btnP2.classList.add('font-medium', 'text-slate-500', 'hover:text-slate-700');
    } else {
        bg.style.transform = 'translateX(100%)';
        btnP2.classList.remove('font-medium', 'text-slate-500', 'hover:text-slate-700'); btnP2.classList.add('font-bold', 'text-cyan-700');
        btnP1.classList.remove('font-bold', 'text-cyan-700'); btnP1.classList.add('font-medium', 'text-slate-500', 'hover:text-slate-700');
    }
    refreshAllDisplays();
}

window.toggleComTiers = function() {
    const hiddenTiers = document.querySelectorAll('.com-tier-hidden');
    hiddenTiers.forEach(el => el.classList.toggle('hidden'));
    const btn = document.getElementById('comToggleBtn');
    if (btn) {
        if (btn.innerText.includes('ดูปีที่ 6')) {
            btn.innerHTML = 'ย่อตาราง <i class="fas fa-chevron-up ml-1"></i>';
        } else {
            btn.innerHTML = `ดูปีที่ 6-${window.lastTotalComYears} <i class="fas fa-chevron-down ml-1"></i>`;
        }
    }
};

function _updateTPDUI() {
    const toggle = document.getElementById('tpdToggle');
    const area = document.getElementById('tpdSAInputArea');
    const display = document.getElementById('tpdPremDisplay');
    if (!toggle) return;
    const enabled = toggle.checked;
    if (area) area.classList.toggle('hidden', !enabled);
    if (enabled) window.refreshTPDPills && window.refreshTPDPills();
    if (enabled && display && lastCalculationData && lastCalculationData.tpdPrem > 0) {
        display.textContent = `เบี้ย TPD: ${lastCalculationData.tpdPrem.toLocaleString()} บาท/ปี`;
    } else if (display) {
        display.textContent = '';
    }
}

function refreshAllDisplays() {
    _updateTPDUI();
    if (typeof lastCalculationData === 'undefined' || !lastCalculationData) return;
    const p = lastCalculationData.premium || 0;
    let rateKey = _COM_KEY_MAP[currentPlan] || _COM_KEY_MAP[currentAppPlan] || currentPlan;
    const effectivePlan = (typeof COM_RATES !== 'undefined' && COM_RATES[rateKey]) ? rateKey : rateKey;
    
    const rateArr = getComRateArray(effectivePlan);
    const fyc = Math.round(p * (rateArr[0] || 0)) || 0; 
    
    if(document.getElementById('caseIncomeComm')) {
        document.getElementById('caseIncomeComm').innerText = fyc.toLocaleString() + " ฿"; 
    }
    
    const _yearMatch = rateKey && (rateKey.match(/^(\d+)/) || rateKey.match(/(\d+)$/));
    const _comTitle = currentAppPlan ? `${currentAppPlan}${_yearMatch ? ' ' + _yearMatch[1] + ' ปี' : ''}` : 'คอมมิชชัน';
    let comH = `<h4 class="text-[13px] font-black text-slate-800 text-center mb-4">${_comTitle}</h4>`;
    let totalComAmt = 0; let totalComPct = 0;

    if (currentAppPlan === '3D Health Excellence' && lastCalculationData.clBasePrem !== undefined) {
        const d3 = lastCalculationData;
        const clRates = getComRateArray(d3.clPlan || currentPlan);

        const hxNum = parseInt((d3.hxVal || '').replace(/\D/g, ''), 10) || 0;
        const hxKey = hxNum >= 150 ? 'HX (150-300)' : 'HX (15-60)';
        const hxRates  = d3.hxPrem  > 0 ? getComRateArray(hxKey)  : [];
        const hxoRates = d3.hxoPrem > 0 ? getComRateArray('HXO') : [];
        const hxdRates = d3.hxdPrem > 0 ? getComRateArray('HXD') : [];
        const hbfRates = d3.hbfPrem > 0 ? getComRateArray('HBF') : [];
        const tpdRates3d = d3.tpdPrem > 0 ? getComRateArray('TPD') : [];

        const maxYears = Math.max(clRates.length, hxRates.length, hxoRates.length, hxdRates.length, hbfRates.length, tpdRates3d.length, 1);
        window.lastTotalComYears = maxYears;
        for (let i = 0; i < maxYears; i++) {
            const clAmt  = i < clRates.length    ? Math.round(d3.clBasePrem * clRates[i])    : 0;
            const hxAmt  = i < hxRates.length    ? Math.round(d3.hxPrem     * hxRates[i])    : 0;
            const hxoAmt = i < hxoRates.length   ? Math.round(d3.hxoPrem    * hxoRates[i])   : 0;
            const hxdAmt = i < hxdRates.length   ? Math.round(d3.hxdPrem    * hxdRates[i])   : 0;
            const hbfAmt = i < hbfRates.length   ? Math.round(d3.hbfPrem    * hbfRates[i])   : 0;
            const tpdAmt = i < tpdRates3d.length ? Math.round(d3.tpdPrem    * tpdRates3d[i]) : 0;
            const yearAmt = clAmt + hxAmt + hxoAmt + hxdAmt + hbfAmt + tpdAmt;
            totalComAmt += yearAmt;
            const hiddenClass = i >= 5 ? 'com-tier-hidden hidden' : '';
            comH += `<div class="${hiddenClass} flex justify-between items-center bg-white border border-amber-200 rounded-[14px] p-3 mb-2.5 shadow-sm">
                <span class="bg-amber-100 text-amber-700 text-[11px] font-bold px-3 py-1 rounded-full w-14 text-center">ปีที่ ${i+1}</span>
                <span class="text-[13px] font-black text-slate-500 text-center flex-1 text-left pl-2 leading-tight">${[
                    clAmt  > 0 ? `CL ${clAmt.toLocaleString()}`   : '',
                    hxAmt  > 0 ? `HX ${hxAmt.toLocaleString()}`   : '',
                    hxoAmt > 0 ? `HXO ${hxoAmt.toLocaleString()}` : '',
                    hxdAmt > 0 ? `HXD ${hxdAmt.toLocaleString()}` : '',
                    hbfAmt > 0 ? `HBF ${hbfAmt.toLocaleString()}` : '',
                    tpdAmt > 0 ? `TPD ${tpdAmt.toLocaleString()}` : ''
                ].filter(Boolean).join(' + ')}</span>
                <span class="text-[14px] font-black text-amber-600 text-right w-20">${yearAmt.toLocaleString()}</span>
            </div>`;
        }
        if (maxYears > 5) {
            comH += `<button id="comToggleBtn" onclick="toggleComTiers()" class="w-full text-center text-[11px] font-bold text-amber-600 bg-amber-50 py-2 rounded-xl mt-1 hover:bg-amber-100 transition-colors">ดูปีที่ 6-${maxYears} <i class="fas fa-chevron-down ml-1"></i></button>`;
        }
        comH += `<div class="mt-4 pt-3.5 border-t border-slate-100 flex justify-end items-end">
            <div class="text-right">
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">คอมมิชชันรวมตลอดสัญญา</div>
                <div class="text-[20px] font-black text-amber-600">${totalComAmt.toLocaleString()} <span class="text-sm">฿</span></div>
            </div>
        </div>`;
    } else if (rateArr && rateArr.length > 0) {
        const _tpdPremForCom = (lastCalculationData.tpdPrem || 0);
        const tpdRatesTLA = _tpdPremForCom > 0 ? getComRateArray('TPD') : [];
        const maxYearsTLA = Math.max(rateArr.length, tpdRatesTLA.length);
        window.lastTotalComYears = maxYearsTLA;
        for (let i = 0; i < maxYearsTLA; i++) {
            const r = i < rateArr.length ? rateArr[i] : 0;
            const annualAmt = Math.round(p * r) || 0;
            const tpdAmt = i < tpdRatesTLA.length ? Math.round(_tpdPremForCom * tpdRatesTLA[i]) : 0;
            const yearTotal = annualAmt + tpdAmt;
            totalComAmt += yearTotal; totalComPct += r;
            const hiddenClass = i >= 5 ? 'com-tier-hidden hidden' : '';
            comH += `<div class="${hiddenClass} flex justify-between items-center bg-white border border-amber-200 rounded-[14px] p-3 mb-2.5 shadow-sm">
                <span class="bg-amber-100 text-amber-700 text-[11px] font-bold px-3 py-1 rounded-full w-14 text-center">ปีที่ ${i+1}</span>
                <span class="text-[13px] font-black text-slate-500 text-center flex-1 text-left pl-2 leading-tight">${[
                    annualAmt > 0 ? `${formatPct(r*100)} = ${annualAmt.toLocaleString()}` : '',
                    tpdAmt > 0    ? `TPD ${tpdAmt.toLocaleString()}` : ''
                ].filter(Boolean).join(' + ')}</span>
                <span class="text-[14px] font-black text-amber-600 text-right w-20">${yearTotal.toLocaleString()}</span>
            </div>`;
        }

        if (rateArr.length > 5) {
            comH += `<button id="comToggleBtn" onclick="toggleComTiers()" class="w-full text-center text-[11px] font-bold text-amber-600 bg-amber-50 py-2 rounded-xl mt-1 hover:bg-amber-100 transition-colors">ดูปีที่ 6-${rateArr.length} <i class="fas fa-chevron-down ml-1"></i></button>`;
        }

        comH += `<div class="mt-4 pt-3.5 border-t border-slate-100 flex justify-between items-end">
            <div class="text-left">
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">PERCENT รวม</div>
                <div class="text-[18px] font-black text-amber-500">${formatPct(totalComPct * 100)}</div>
            </div>
            <div class="text-right">
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">คอมมิชชันรวมตลอดสัญญา</div>
                <div class="text-[20px] font-black text-amber-600">${totalComAmt.toLocaleString()} <span class="text-sm">฿</span></div>
            </div>
        </div>`;
    } else {
        comH += `<div class="text-center text-slate-500 py-4"><i class="fas fa-exclamation-triangle text-amber-400 text-2xl mb-2"></i><br>ไม่พบข้อมูลคอมมิชชันในขณะนี้</div>`;
    }
    
    if(document.getElementById('comList')) {
        document.getElementById('comList').innerHTML = comH;
    }
    
    updateMBDisplay(); 
    updateMYBDisplay(); 
    updateNABDisplay();
    
    if(document.getElementById('caseIncomeBonus')) {
        document.getElementById('caseIncomeBonus').innerText = (window.currentMBBonus || 0).toLocaleString() + " ฿"; 
    }
    if(document.getElementById('caseIncomeMYBonus')) {
        document.getElementById('caseIncomeMYBonus').innerText = (window.currentMYBBonus || 0).toLocaleString() + " ฿";
    }
    
    const caseTotal = Math.round(fyc + (window.currentMBBonus || 0) + (window.currentMYBBonus || 0)); 
    if(document.getElementById('caseIncomeTotal')) {
        document.getElementById('caseIncomeTotal').innerText = caseTotal.toLocaleString(); 
    }
    
    const pctVal = p > 0 ? ((caseTotal / p) * 100) : 0;
    if(document.getElementById('caseIncomePercent')) {
        document.getElementById('caseIncomePercent').innerText = formatPct(pctVal); 
    }
}  

// ==================== TABLE MODULE (100% EXCEL MATH & COMPACT NUMBERS) ====================

// 💥 ฟังก์ชันตัวช่วยสำหรับย่อตัวเลข (เช่น 1,000,000 -> 1 ล้าน)
function formatThaiMillion(num) {
    if (!num || num === 0) return "-";
    if (num >= 1000000) {
        const million = num / 1000000;
        // ถ้าเป็นเลขลงตัว เช่น 1 ล้าน, 5 ล้าน
        if (num % 1000000 === 0) return million + " ล้าน";
        // ถ้ามีเศษ เช่น 1.5 ล้าน
        return million.toFixed(1) + " ล้าน";
    }
    return num.toLocaleString(); // ต่ำกว่าล้านแสดงเลขปกติ
}

function generatePolicyTableData() {
    if (!lastCalculationData) return;
    const d = lastCalculationData;
    
    const planName = (currentAppPlan || "").toUpperCase();
    const planAbbr = getPlanAbbr(currentAppPlan).toUpperCase();
    
    const isSLB = planAbbr === "SLB" || planName.includes("SLB") || planName.includes("SUPREME LIFE BASE");
    const isSLPA = planAbbr === "SLPA" || planName.includes("SLPA") || planName.includes("SUPREME LIFE PROTECTOR");
    const isLPB = !isSLPA && (planAbbr === "LPB" || planName.includes("LPB") || planName.includes("LIFE PROTECTOR"));
    const isWXN = planAbbr === "WXN" || planName.includes("WXN") || planName.includes("WHOLE LIFE EXTRA");
    const isElite = planName.includes('ELITE') || planName.includes('868') || planName.includes('818');
    const isTX = planName.includes('24 TX') || planAbbr === 'TX';
    const isCL = planName.includes('CENTURY LIFE') || planAbbr === 'CL' || planAbbr === 'CLA';
    const isCX = currentAppPlan === 'CI Extra Plus' || planAbbr === 'CX';
    const isTLA = currentAppPlan === 'Convertable Term' || planAbbr === 'TLA';
    
    const hasSurrenderMenu = isLPB || isSLPA;
    
    // --- 1. UI Control Menu ---
    const surrenderContainer = document.getElementById('surrenderContainer');
    const oldToggle = document.getElementById('toggleBreakeven');
    
    if (oldToggle && !oldToggle.classList.contains('new-ux-toggle')) {
        const oldContainer = oldToggle.closest('.flex');
        if (oldContainer) oldContainer.style.display = 'none'; 
        oldToggle.id = 'toggleBreakeven_old';
    }

    if (surrenderContainer) {
        let currentMenuType = currentAppPlan; 
        let menuContainer = document.getElementById('uxMenuContainer');
        
        if (menuContainer && menuContainer.dataset.menuType !== currentMenuType) {
            surrenderContainer.innerHTML = ''; 
            menuContainer = null;
        }

        if (!menuContainer) {
            let rightMenuHTML = '';

            if (hasSurrenderMenu) {
                rightMenuHTML = `
                    <div class="flex items-center gap-2 min-w-0">
                        <i class="fas fa-hand-holding-usd text-blue-500 text-[16px] w-5 text-center shrink-0"></i>
                        <span class="text-[13px] font-bold text-slate-700 whitespace-nowrap">ทยอยเวนคืน</span>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="toggleSurrender" class="sr-only peer">
                        <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500 shadow-inner"></div>
                    </label>
                `;
            } else if (isWXN || isElite || isTX) {
                rightMenuHTML = `
                    <div class="flex items-center gap-2 min-w-0">
                        <i class="fas fa-shield-alt text-rose-500 text-[16px] w-5 text-center shrink-0"></i>
                        <span class="text-[13px] font-bold text-slate-700 whitespace-nowrap">แสดงทุนประกัน</span>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="toggleShowSA" class="sr-only peer" onchange="generatePolicyTableData();">
                        <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500 shadow-inner"></div>
                    </label>
                `;
            } else if (isCX || isCL || isSLB) {
                rightMenuHTML = `
                    <div class="flex items-center gap-2 min-w-0">
                        <i class="fas fa-wallet text-sky-500 text-[16px] w-5 text-center shrink-0"></i>
                        <span class="text-[11px] font-bold text-slate-700 whitespace-nowrap">เงินสดพร้อมใช้</span>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="toggleShowCV" class="sr-only peer" onchange="generatePolicyTableData();">
                        <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500 shadow-inner"></div>
                    </label>
                `;
            }

            const _iN = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] font-bold text-slate-700 text-center focus:border-emerald-400 focus:bg-white outline-none transition-colors';
            const _iT = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] font-bold text-slate-700 text-left focus:border-emerald-400 focus:bg-white outline-none transition-colors placeholder:font-normal placeholder:text-slate-400';
            const _aT = 'flex-1 py-1.5 px-3 rounded-full text-[12px] font-bold bg-white shadow-sm text-slate-800 transition-all';
            const _aF = 'flex-1 py-1.5 px-3 rounded-full text-[12px] font-bold text-slate-500 transition-all';
            const _sT = 'flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold bg-white shadow-sm text-emerald-700 transition-all';
            const _sF = 'flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold text-slate-500 transition-all';

            let leftMenuClass = rightMenuHTML ? "w-1/2 pr-4 border-r border-slate-200 justify-between" : "w-full justify-center gap-8";

            surrenderContainer.innerHTML = `
                <div id="uxMenuContainer" data-menu-type="${currentMenuType}" class="px-4 py-3.5 flex flex-row items-center w-full bg-white border-t border-slate-100 shadow-sm">
                    <div class="${leftMenuClass} flex items-center">
                        <div class="flex items-center gap-2 min-w-0">
                            <i class="fas fa-chart-line text-emerald-500 text-[16px] w-5 text-center shrink-0"></i>
                            <span class="text-[11px] font-bold text-slate-700 whitespace-nowrap">แสดงจุดคุ้มทุน</span>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="toggleBreakeven" class="sr-only peer new-ux-toggle" onchange="toggleBreakevenDisplay(this.checked); generatePolicyTableData();">
                            <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                        </label>
                    </div>
                    ${rightMenuHTML ? `<div class="w-1/2 pl-4 flex items-center justify-between">${rightMenuHTML}</div>` : ''}
                </div>
                ${hasSurrenderMenu ? `
                <div id="cfInlineControls" class="hidden bg-white border-t border-slate-100">
                    <div class="flex items-center justify-between px-4 pt-2 pb-1 border-b border-slate-100">
                        <span class="text-[10px] font-bold text-slate-500">ตั้งค่าทยอยเวนคืน</span>
                        <button onclick="document.getElementById('cfInlineControls').classList.add('hidden')" class="text-[10px] text-blue-500 font-bold px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 active:scale-95 transition-all">ย่อ ▲</button>
                    </div>
                    <div class="px-4 pt-3 pb-4 space-y-3">
                        <input type="radio" name="cfMainMode" value="continuous" checked class="sr-only" id="cfMainModeCont">
                        <input type="radio" name="cfMainMode" value="specific" class="sr-only" id="cfMainModeSpec">
                        <div class="bg-slate-200/50 rounded-full p-1 flex">
                            <button id="cfModeTabCont" onclick="document.getElementById('cfMainModeCont').checked=true; setCfMainMode('continuous')" class="${_aT}">รับทุกปี</button>
                            <button id="cfModeTabSpec" onclick="document.getElementById('cfMainModeSpec').checked=true; setCfMainMode('specific')" class="${_aF}">รับบางปี</button>
                        </div>
                        <div id="cfArea_continuous" class="space-y-2.5">
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <div class="text-[9px] font-bold text-slate-500 mb-1">เริ่มรับ (อายุ)</div>
                                    <input type="number" id="cfStartAge" value="61" min="1" max="89" oninput="generatePolicyTableData()" class="${_iN}">
                                </div>
                                <div>
                                    <div class="text-[9px] font-bold text-slate-500 mb-1">รับถึง (อายุ)</div>
                                    <input type="number" id="cfEndAge" value="70" min="1" max="89" oninput="generatePolicyTableData()" class="${_iN}">
                                </div>
                            </div>
                            <input type="radio" name="cfSubMode" value="auto" checked class="sr-only" id="cfSubModeAuto">
                            <input type="radio" name="cfSubMode" value="manual" class="sr-only" id="cfSubModeManual">
                            <div class="bg-slate-100/70 rounded-xl p-1 flex">
                                <button id="cfSubTabAuto" onclick="document.getElementById('cfSubModeAuto').checked=true; setCfSubMode('auto')" class="${_sT}">ระบบคำนวณสูงสุด</button>
                                <button id="cfSubTabManual" onclick="document.getElementById('cfSubModeManual').checked=true; setCfSubMode('manual')" class="${_sF}">ระบุจำนวนเอง</button>
                            </div>
                            <div id="cfAmountArea" class="hidden">
                                <div class="text-[9px] font-bold text-slate-500 mb-1">จำนวน (บาท / ปี)</div>
                                <input type="text" id="cfContAmt" value="50,000" oninput="cfFormatNum(this); generatePolicyTableData()" class="${_iN}">
                            </div>
                        </div>
                        <div id="cfArea_specific" class="hidden">
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <div class="text-[9px] font-bold text-slate-500 mb-1">อายุที่รับ (คั่น ,)</div>
                                    <input type="text" id="cfSpecificAges" placeholder="เช่น 60,70,80" oninput="generatePolicyTableData()" class="${_iT}">
                                </div>
                                <div>
                                    <div class="text-[9px] font-bold text-slate-500 mb-1">จำนวน (บาท / รอบ)</div>
                                    <input type="text" id="cfSpecificAmt" value="50,000" oninput="cfFormatNum(this); generatePolicyTableData()" class="${_iN}">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>` : ''}
            `;
            surrenderContainer.classList.remove('hidden');

            if (hasSurrenderMenu) {
                document.getElementById('toggleSurrender').addEventListener('change', (e) => {
                    const cfI = document.getElementById('cfInlineControls');
                    const tbl = document.getElementById('pdfTableTarget');
                    const savedScroll = tbl ? tbl.scrollTop : 0;
                    if (e.target.checked) {
                        if (cfI) {
                            cfI.classList.remove('hidden');
                            cfI.classList.add('cf-panel-enter');
                            cfI.addEventListener('animationend', () => cfI.classList.remove('cf-panel-enter'), { once: true });
                        }
                    } else {
                        if (cfI) cfI.classList.add('hidden');
                        document.querySelectorAll('.cf-highlight-row').forEach(el =>
                            el.classList.remove('cf-highlight-row', 'bg-amber-50', 'border-y', 'border-amber-300'));
                    }
                    generatePolicyTableData();
                    if (tbl) requestAnimationFrame(() => { tbl.scrollTop = savedScroll; });
                });
            }
        }
    }

    // --- 2. Variables ---
    const isSurrenderActive = document.getElementById('toggleSurrender')?.checked || false;
    const isBreakevenActive = document.getElementById('toggleBreakeven')?.checked || false;
    const isShowSAActive = document.getElementById('toggleShowSA')?.checked || false;
    const isShowCVActive = document.getElementById('toggleShowCV')?.checked || false;
    
    let startAge = 61, endAge = 70;
    if (isSurrenderActive && hasSurrenderMenu) {
        const cfModeMain = document.querySelector('input[name="cfMainMode"]:checked')?.value || 'continuous';
        if (cfModeMain === 'continuous') {
            startAge = parseInt(document.getElementById('cfStartAge')?.value)  || 61;
            endAge   = parseInt(document.getElementById('cfEndAge')?.value)    || 70;
        } else {
            const agesStrX = document.getElementById('cfSpecificAges')?.value || '';
            const sAgesX = agesStrX.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > d.age);
            startAge = sAgesX.length ? Math.min(...sAgesX) : 61;
            endAge   = sAgesX.length ? Math.max(...sAgesX) : 70;
        }
        if (startAge > endAge) [startAge, endAge] = [endAge, startAge];
    }

    const showCashFlowBase = isWXN || isElite || isTX;
    const forceShowCashFlow = showCashFlowBase;
    const hideAnnualSaving = isSurrenderActive && hasSurrenderMenu;
    const showSAColumn = isLPB || isSLB || ((isWXN || isElite || isTX) && isShowSAActive);
    const showAccidentColumn = isSLB;
    const showCoverageColumn = isCX || isCL || isSLPA || isTLA;
    const showCVColumn = isTLA ? false : (isCX || isCL || isSLB) ? isShowCVActive : true;

    // --- 3. Header ---
    const initialSA = Math.round(d.sum); 
    const sumDisplay = formatThaiMillion(initialSA); // 💥 ใช้ฟังก์ชันย่อตัวเลขตรงหัวตาราง

    const initialPrem = Math.round(d.premium);
    const planPeriod = currentPlan.includes('10CX') ? '10' : (parseInt(d.years) || 20).toString();
    const headerTitle = `${planAbbr} ${d.gender} ${d.age} | วงเงิน ${sumDisplay} | ออม ${initialPrem.toLocaleString()} บาท | ${planPeriod} ปี`;
    
    const _gThai = (d.gender === 'male' || d.gender === 'ชาย') ? 'ชาย' : 'หญิง';
    // มือถือ = 2 บรรทัด ตรวจ width จริง (ไม่เอา height — กัน landscape phone misclassify)
    const _vw = document.documentElement.clientWidth || window.innerWidth;
    const _isMobile = _vw < 700;
    const _isNarrow = _vw < 400;
    const _badgeMobile = `flex-1 py-1 px-1 rounded-lg ${_isNarrow ? 'text-[10px]' : 'text-[13px]'} font-bold text-center ${_isNarrow ? '' : 'whitespace-nowrap'} leading-tight`;
    const _badgeDesktop = 'flex-1 py-1.5 px-3 rounded-lg text-[14px] font-bold text-center whitespace-nowrap leading-tight';
    const _hasTableSACol = showCoverageColumn || showSAColumn;
    const _lastBadgeMobile = _hasTableSACol
        ? `<span class="${_badgeMobile} bg-[#00A651]/10 text-[#007a3d] border border-[#00A651]/25 shadow-sm">ชำระ: ${planPeriod} ปี</span>`
        : `<span class="${_badgeMobile} bg-[#00A651]/10 text-[#007a3d] border border-[#00A651]/25 shadow-sm">ทุน: ${sumDisplay}</span>`;
    const _lastBadgeDesktop = _hasTableSACol
        ? `<span class="${_badgeDesktop} bg-[#00A651]/10 text-[#007a3d] border border-[#00A651]/25 shadow-sm">ชำระ: ${planPeriod} ปี</span>`
        : `<span class="${_badgeDesktop} bg-[#00A651]/10 text-[#007a3d] border border-[#00A651]/25 shadow-sm">ทุนประกัน: ${sumDisplay}</span>`;
    document.getElementById('tableHeaderTitle').innerHTML = _isMobile ? `
        <div class="flex flex-col gap-1 py-1 w-full">
            <div class="flex gap-1 w-full items-stretch">
                <span class="${_badgeMobile} bg-blue-600 text-white shadow-sm">${currentPlan}</span>
                <span class="${_badgeMobile} bg-white/80 text-slate-700 border border-slate-200">เพศ: ${_gThai}</span>
                <span class="${_badgeMobile} bg-white/80 text-slate-700 border border-slate-200">อายุ: ${d.age}</span>
            </div>
            <div class="flex gap-1 w-full">
                <span class="${_badgeMobile} bg-white text-slate-800 border border-slate-200 shadow-sm">เบี้ย: ${initialPrem.toLocaleString()} ฿</span>
                ${_lastBadgeMobile}
            </div>
        </div>` : `
        <div class="flex gap-1.5 items-center py-0.5 w-full">
            <span class="${_badgeDesktop} bg-blue-600 text-white shadow-sm">${currentPlan}</span>
            <span class="${_badgeDesktop} bg-white/80 text-slate-700 border border-slate-200">เพศ: ${_gThai}</span>
            <span class="${_badgeDesktop} bg-white/80 text-slate-700 border border-slate-200">อายุ: ${d.age}</span>
            <span class="${_badgeDesktop} bg-white text-slate-800 border border-slate-200 shadow-sm">เบี้ย: ${initialPrem.toLocaleString()} ฿</span>
            ${_lastBadgeDesktop}
        </div>`;

    // compact: WXN/Elite/TX บนจอแคบ (<400px) หรือเมื่อเปิด SA toggle
    const _isCompact  = (isWXN || isElite || isTX) && (_isNarrow || (showSAColumn && isShowSAActive));
    // super-compact: จอแคบมาก (<380px) เช่น Honor Magic V3 outer screen
    const _isSuperCompact = _isCompact && _vw < 380;
    const _thCls = _isSuperCompact ? 'py-1 px-0.5 font-bold'
                 : _isCompact      ? 'py-1.5 px-1 font-bold'
                 : _isMobile       ? 'py-2 px-1.5 font-bold'
                 :                   'py-3 px-3 font-bold';
    const _thSz  = _isSuperCompact ? 'font-size:8px;white-space:nowrap;'
                 : _isCompact      ? 'font-size:9px;white-space:nowrap;'
                 : _isMobile       ? 'font-size:10px;white-space:nowrap;'
                 :                   'font-size:13px;white-space:nowrap;';
    const _tdBase = _isSuperCompact ? 'py-1 px-0.5'
                  : _isCompact      ? 'py-2 px-1'
                  :                   'py-4 px-3';

    // ชื่อหัวตาราง: compact/super-compact ใช้ label สั้น
    const _lSaving   = _isCompact ? 'ออม'    : 'ออมเงิน';
    const _lAccum    = _isCompact ? 'สะสม'   : 'ออมสะสม';
    const _lCF       = _isCompact ? 'CF'     : 'กระแสเงินสด';
    const _lTotal    = _isSuperCompact ? 'รวม' : (_isCompact ? 'รวมรับ' : 'รวมรับเงิน');
    const _lCV       = _isSuperCompact ? 'สด'  : (_isCompact ? 'เงินสด' : 'เงินสดพร้อมใช้');
    const _lCoverage = isSLPA ? (_isCompact ? 'ทุน' : 'ทุนประกัน') : isTLA ? (_isCompact ? 'คุ้มครอง' : 'วงเงินคุ้มครอง') : (_isCompact ? 'คุ้มครอง' : 'วงเงินคุ้มครอง');
    const _lSA       = _isCompact ? 'ทุน'    : 'ทุนประกัน';

    document.getElementById('policyTableHead').innerHTML = `<tr class="text-white" style="background:linear-gradient(135deg,#0d9488,#0369a1);${_isCompact ? 'font-size:9px;' : (_isMobile ? 'font-size:10px;' : 'font-size:13px;')}">
        <th class="${_thCls} text-center" style="${_thSz}">อายุ</th>
        ${hideAnnualSaving ? '' : `<th class="${_thCls} text-right" style="${_thSz}">${_lSaving}</th>`}
        <th class="${_thCls} text-right" style="${_thSz}">${_lAccum}</th>
        ${hideAnnualSaving ? `<th class="${_thCls} text-amber-200 text-right" style="${_thSz}">รับเงินก้อน</th>` : ''}
        ${forceShowCashFlow ? `<th class="${_thCls} text-blue-200 text-right" style="${_thSz}">${_lCF}</th><th class="${_thCls} text-indigo-200 text-right" style="${_thSz}">${_lTotal}</th>` : ''}
        ${showCVColumn ? `<th class="${_thCls} text-right" style="${_thSz}">${_lCV}</th>` : ''}
        ${showCoverageColumn ? `<th class="${_thCls} text-rose-200 text-right" style="${_thSz}">${_lCoverage}</th>` : ''}
        ${showSAColumn ? `<th class="${_thCls} text-rose-200 text-right" style="${_thSz}">${_lSA}</th>` : ''}
        ${showAccidentColumn ? `<th class="${_thCls} text-right" style="${_thSz}">อุบัติเหตุ</th>` : ''}
    </tr>`;
    
    // --- 4. Main Loop ---
    // เปลี่ยนจาก const เป็น let เพื่อให้แก้ไขค่าตามแผนประกันได้
    let payYears = parseInt(d.years) || 20; 
    let maxYear = 90 - d.age; 
    
    // ตรวจสอบแผน Elite (S868 / S818)
    const checkEliteName = String(currentAppPlan || "").toUpperCase();
    const isElitePlan = checkEliteName.includes('ELITE') || checkEliteName.includes('868') || checkEliteName.includes('818');

    // บังคับเงื่อนไข Elite ให้ถูกต้องตามเอกสาร
    if (isElitePlan) {
        payYears = 8; // ออม 8 ปีเสมอ
        if (d.age <= 50) {
            maxYear = 68 - d.age; // แผน S868 คุ้มครองถึงอายุ 68
        } else {
            maxYear = 18; // แผน S818 คุ้มครอง 18 ปี
        }
    } else if (isTX) {
        payYears = 24;
        maxYear = 90 - d.age;
    } else if (isCL) {
        maxYear = 100 - d.age; // Century Life คุ้มครองตลอดชีพ ถึงอายุ 100
    } else if (isTLA) {
        maxYear = payYears; // Term: คุ้มครองเฉพาะช่วงชำระเบี้ย
    }

    let html = ''; 
    let totalSaving = 0, foundBreakeven = false, beYear = 0, beAge = 0, beAmount = 0;
    let currentSA = initialSA;
    let accCashFlow = 0;
    let cfMainMode = 'continuous';
    let cfWithdrawalSchedule = {};
    let cfFirstWithdrawalYear = null;

    if (isSurrenderActive && hasSurrenderMenu) {
        const planKeyW = (currentAppPlan === 'Supreme Life Protector') ? '20SLPA' : '20LPB';
        const cfModeW = document.querySelector('input[name="cfMainMode"]:checked')?.value || 'continuous';
        cfMainMode = cfModeW;
        if (cfModeW === 'continuous') {
            const cfSubModeW = document.querySelector('input[name="cfSubMode"]:checked')?.value || 'auto';
            const cfSYear = Math.max(1, startAge - d.age);
            const cfEYear = Math.min(maxYear, endAge - d.age);
            if (cfSubModeW === 'auto') {
                if (typeof _binarySearchMaxWithdrawal === 'function') {
                    const autoAmt = _binarySearchMaxWithdrawal(d.age, currentGender, planKeyW, initialSA, cfSYear, cfEYear);
                    if (autoAmt > 0) {
                        for (let wy = cfSYear; wy <= cfEYear; wy++) cfWithdrawalSchedule[wy] = autoAmt;
                    }
                }
            } else {
                const cfAmtW = parseInt((document.getElementById('cfContAmt')?.value || '').replace(/,/g, '')) || 0;
                if (cfAmtW > 0) {
                    for (let wy = cfSYear; wy <= cfEYear; wy++) cfWithdrawalSchedule[wy] = cfAmtW;
                }
            }
        } else {
            const agesStrW = document.getElementById('cfSpecificAges')?.value || '';
            const cfAmtW = parseInt((document.getElementById('cfSpecificAmt')?.value || '').replace(/,/g, '')) || 0;
            if (cfAmtW > 0) {
                agesStrW.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > d.age && n < 90)
                    .forEach(a => { cfWithdrawalSchedule[a - d.age] = cfAmtW; });
            }
        }
        const sortedW = Object.keys(cfWithdrawalSchedule).map(Number).sort((a, b) => a - b);
        if (sortedW.length > 0) cfFirstWithdrawalYear = sortedW[0];
    }

    const cvData = window.cvDataLookup || {};
    const cfLoopEnd = (isSurrenderActive && hasSurrenderMenu && cfMainMode !== 'specific') ? Math.min(endAge - d.age, maxYear) : maxYear;

    for (let y = 1; y <= cfLoopEnd; y++) {
        let currentAge = d.age + y;

        // SLPA: ทุนประกันเพิ่มขึ้น 5% ของทุนเริ่มต้น ทุกวันครบรอบ 5 ปีกรมธรรม์ (ไม่เกินอายุ 90 ปี)
        const slpaEffectiveSA = (isSLPA && !isSurrenderActive)
            ? Math.round(d.sum * (1 + 0.05 * Math.floor(y / 5)))
            : currentSA;

        // 1. การออมเงิน: Elite หยุดที่ปีที่ 8 (อ้างอิง image_f3685c.png)
        let annualSaving = 0; 
        if (isElitePlan) {
            if (y <= 8) {
                annualSaving = d.premium;
                totalSaving += annualSaving;
            }
        } else if (y <= payYears && currentSA > 0) { 
            annualSaving = Math.round((currentSA / initialSA) * initialPrem); 
            totalSaving += annualSaving; 
        }

        // 2. ดึงค่า CV Rate
        let cvRate = 0;
        if (cvData[currentPlan] && cvData[currentPlan][currentGender]) {
            const ageData = cvData[currentPlan][currentGender][d.age.toString()];
            if (ageData && ageData[y.toString()] !== undefined) cvRate = ageData[y.toString()]; 
        }
        
        let cashFlowAmt = 0;
        
        // 3. ผลประโยชน์เงินคืน (Cash Flow): คืน 12% และปีสุดท้าย 720%
        if (!isSurrenderActive && showCashFlowBase) {
            if (isElitePlan) {
                if (y < maxYear) {
                    cashFlowAmt = Math.round(currentSA * 0.12);
                } else {
                    cashFlowAmt = Math.round(currentSA * 7.20); 
                }
            } else if (isTX) {
                if (y % 3 === 0 && y <= 24) cashFlowAmt = Math.round(currentSA * 0.05); 
                else if (y === 25) cashFlowAmt = Math.round(currentSA * 0.70); 
                else if (y >= 26 && currentAge < 90) cashFlowAmt = Math.round(currentSA * 0.08); 
                else if (currentAge === 90) cashFlowAmt = Math.round(currentSA); 
            } else if (isWXN) {
                if (currentAge <= 60) cashFlowAmt = Math.round(currentSA * 0.0225);
                else if (currentAge == 61) cashFlowAmt = Math.round(currentSA * 0.10);
                else if (currentAge > 61 && currentAge < 90) cashFlowAmt = Math.round(currentSA * (0.10 + ((currentAge - 61) * 0.005)));
                else if (currentAge == 90) cashFlowAmt = Math.round(currentSA);
            }
        } 
        else if (isSurrenderActive && hasSurrenderMenu && cfWithdrawalSchedule[y] !== undefined && currentSA > 0) {
            const wAmt = cfWithdrawalSchedule[y];
            const cvBefore = Math.round((currentSA * cvRate) / 1000);
            if (cvBefore > 0 && wAmt < cvBefore) {
                cashFlowAmt = wAmt;
                currentSA = Math.round(currentSA * (1 - wAmt / cvBefore));
            } else if (cvBefore > 0) {
                cashFlowAmt = cvBefore;
                currentSA = 0;
            }
        }
        
        let cvTotal = Math.round((currentSA * cvRate) / 1000);
        if (currentSA <= 0) cvTotal = 0;

        let surrenderTotal = cvTotal + accCashFlow + cashFlowAmt;
        
        // 4. จุดคุ้มทุน
        if (!foundBreakeven && totalSaving > 0) {
            let breakevenValue = (isElitePlan || isTX || isWXN) ? surrenderTotal
                               : cvTotal;
            if (breakevenValue >= totalSaving) {
                foundBreakeven = true; beYear = y; beAge = currentAge; beAmount = breakevenValue;
            }
        }

        // 5. ความคุ้มครองชีวิต
        let deathBenefit = slpaEffectiveSA;
        if (isElitePlan && currentSA > 0) {
            let eliteMultiplier = Math.min(y, 8) * 1.0; 
            deathBenefit = Math.max(Math.round(currentSA * eliteMultiplier), cvTotal, totalSaving);
        }

        accCashFlow += cashFlowAmt; 

        // 6. สร้างแถวตาราง
        const saCompact = (isLPB || isSLPA) ? (deathBenefit > 0 ? deathBenefit.toLocaleString() : '—') : formatThaiMillion(deathBenefit);
        const accidentCompact = (isSLB && currentAge <= 70) ? formatThaiMillion(Math.min(deathBenefit * 2, 100000000)) : '—';

        let trClass = "border-b border-slate-100 odd:bg-white even:bg-slate-50 hover:bg-[#00A651]/5 transition-colors";
        const rowId = (isBreakevenActive && y === beYear) ? 'breakevenRow' : `policyRow_${currentAge}`;
        if (isBreakevenActive && y === beYear) trClass = "bg-emerald-100 border-y-2 border-emerald-400 relative z-10";
        else if (isSurrenderActive && hasSurrenderMenu && (cfMainMode === 'specific' ? cfWithdrawalSchedule[y] !== undefined : y === cfFirstWithdrawalYear)) trClass = "bg-amber-50 border-y border-amber-300 cf-highlight-row";
        
        const _fSz = _isCompact ? 'font-size:9px;' : '';
        html += `<tr id="${rowId}" class="${trClass}">
            <td class="${_tdBase} text-slate-700 font-medium text-center" style="${_fSz}">${currentAge}</td>
            ${hideAnnualSaving ? '' : `<td class="${_tdBase} text-slate-700 text-right" style="${_fSz}">${annualSaving > 0 ? annualSaving.toLocaleString() : "-"}</td>`}
            <td class="${_tdBase} text-slate-800 font-bold text-right" style="${_fSz}">${totalSaving.toLocaleString()}</td>
            ${hideAnnualSaving ? `<td class="${_tdBase} text-amber-700 font-bold text-right" style="${_fSz}">${cashFlowAmt > 0 ? cashFlowAmt.toLocaleString() : '—'}</td>` : ''}
            ${forceShowCashFlow ? `<td class="${_tdBase} text-blue-600 font-bold text-right" style="${_fSz}">${cashFlowAmt > 0 ? cashFlowAmt.toLocaleString() : "-"}</td><td class="${_tdBase} text-indigo-600 font-bold text-right" style="${_fSz}">${accCashFlow > 0 ? accCashFlow.toLocaleString() : "-"}</td>` : ''}
            ${showCVColumn ? `<td class="${_tdBase} ${isBreakevenActive && y === beYear ? 'text-emerald-700' : 'text-slate-800'} font-bold text-right" style="${_fSz}">${cvTotal > 0 ? cvTotal.toLocaleString() : "0"}</td>` : ''}`;

        if (showCoverageColumn) html += `<td class="${_tdBase} text-rose-600 font-bold text-right" style="${_fSz}">${slpaEffectiveSA > 0 ? slpaEffectiveSA.toLocaleString() : '—'}</td>`;
        if (showSAColumn) html += `<td class="${_tdBase} text-rose-600 font-bold text-right" style="${_fSz}">${saCompact}</td>`;
        if (showAccidentColumn) html += `<td class="${_tdBase} text-rose-600 font-bold text-right" style="${_fSz}">${accidentCompact}</td>`;
        html += `</tr>`;

        if (y >= cfLoopEnd) break;
    }
    document.getElementById('policyTableBody').innerHTML = html;

    // --- 5. Summary Text ---
    if (foundBreakeven) {
        document.getElementById('breakevenSummary').innerHTML = `
            <div class="bg-emerald-100 border border-emerald-300 rounded-xl py-3 px-4 m-3 text-[11px] text-emerald-800 font-bold shadow-sm flex items-center justify-center gap-2">
                <i class="fas fa-bullseye text-emerald-600 text-lg"></i>
                <span>จุดคุ้มทุน : อายุ <span class="text-emerald-800">${beAge}</span> ปี / <span class="text-emerald-800">${beAmount.toLocaleString()}</span> บาท</span>
            </div>`;
    } else {
        document.getElementById('breakevenSummary').innerHTML = `<div class="bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 m-3 text-[11px] text-slate-500 font-bold flex items-center justify-center gap-2"><i class="fas fa-info-circle text-slate-400 text-lg"></i> ไม่พบจุดคุ้มทุนก่อนครบกำหนดสัญญา</div>`;
    }
    // ไม่ auto-scroll เพื่อไม่ให้ตารางค้างบน mobile

    // แสดง/ซ่อน breakevenSummary ตาม toggle สำหรับทุกแผน
    const summary = document.getElementById('breakevenSummary');
    if (summary) {
        if (isBreakevenActive && foundBreakeven) summary.classList.remove('hidden');
        else if (!isBreakevenActive) summary.classList.add('hidden');
    }


    const cfContainer = document.getElementById('cashFlowPlanContainer');
    if (cfContainer) cfContainer.classList.add('hidden');
}

function toggleBreakevenDisplay(smoothScroll = true) {
    const tableBody = document.getElementById('policyTableBody');
    const summary = document.getElementById('breakevenSummary');
    const isChecked = document.getElementById('toggleBreakeven')?.checked;

    if (!tableBody) return;

    if (isChecked) {
        tableBody.classList.add('show-breakeven');
        if (summary) summary.classList.remove('hidden');
        // ไม่ auto-scroll เพื่อไม่ให้ตารางค้างบน mobile
    } else {
        tableBody.classList.remove('show-breakeven');
        if (summary) summary.classList.add('hidden');
    }
}

// ==================== CASH FLOW PLAN UI (LPB / SLPA) ====================

function closeSurrenderPanel() {
    const toggle = document.getElementById('toggleSurrender');
    if (toggle && toggle.checked) {
        toggle.checked = false;
        toggle.dispatchEvent(new Event('change'));
    }
}

function toggleCfPlanPanel() { closeSurrenderPanel(); }

function setCfMainMode(mode) {
    const contArea     = document.getElementById('cfArea_continuous');
    const specificArea = document.getElementById('cfArea_specific');
    if (contArea)     contArea.classList.toggle('hidden', mode !== 'continuous');
    if (specificArea) specificArea.classList.toggle('hidden', mode !== 'specific');
    const aT = 'flex-1 py-1.5 px-3 rounded-full text-[12px] font-bold bg-white shadow-sm text-slate-800 transition-all';
    const aF = 'flex-1 py-1.5 px-3 rounded-full text-[12px] font-bold text-slate-500 transition-all';
    const tC = document.getElementById('cfModeTabCont'); if (tC) tC.className = mode === 'continuous' ? aT : aF;
    const tS = document.getElementById('cfModeTabSpec'); if (tS) tS.className = mode === 'specific'   ? aT : aF;
    generatePolicyTableData();
}

function setCfSubMode(subMode) {
    const amountArea = document.getElementById('cfAmountArea');
    if (amountArea) amountArea.classList.toggle('hidden', subMode !== 'manual');
    const sT = 'flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold bg-white shadow-sm text-emerald-700 transition-all';
    const sF = 'flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold text-slate-500 transition-all';
    const tA = document.getElementById('cfSubTabAuto');   if (tA) tA.className = subMode === 'auto'   ? sT : sF;
    const tM = document.getElementById('cfSubTabManual'); if (tM) tM.className = subMode === 'manual' ? sT : sF;
    generatePolicyTableData();
}

function _buildCashFlowPlanCard() {
    const iN  = 'w-full bg-white border border-slate-200 rounded-lg p-1.5 text-center text-[11px] font-bold text-slate-700 focus:border-emerald-400 outline-none transition-colors';
    const iT  = 'w-full bg-white border border-slate-200 rounded-lg p-1.5 text-left text-[11px] font-bold text-slate-700 focus:border-emerald-400 outline-none transition-colors placeholder:font-normal placeholder:text-slate-400';
    return `
    <div class="mx-3 my-2">
      <div class="bg-white/95 rounded-xl border border-slate-200/80 shadow-md overflow-hidden">

        <!-- Slim Header -->
        <div class="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center gap-2 relative">
          <i class="fas fa-piggy-bank text-white text-[12px] shrink-0"></i>
          <span class="text-[11px] font-black text-white flex-1 min-w-0 truncate">วางแผนรับเงินก้อน (ทยอยเวนคืน)</span>
          <button onclick="closeSurrenderPanel()" class="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-red-500/90 text-white transition-all active:scale-90 shrink-0">
            <i class="fa-solid fa-xmark text-[11px]"></i>
          </button>
        </div>

        <!-- Side-by-side mode panels -->
        <div class="p-2.5 grid grid-cols-2 gap-2 items-start">

          <!-- Option A: รับทุกปี -->
          <div class="border border-slate-200 rounded-xl overflow-hidden">
            <label class="flex items-center gap-1.5 px-2.5 py-2 bg-slate-50 cursor-pointer">
              <input type="radio" name="cfMainMode" value="continuous" checked onchange="setCfMainMode('continuous')" class="w-3.5 h-3.5 accent-emerald-500 shrink-0">
              <div>
                <div class="text-[11px] font-bold text-slate-700 leading-tight">รับทุกปี</div>
                <div class="text-[8px] text-slate-400 leading-tight">ทุกปีในช่วงที่กำหนด</div>
              </div>
            </label>
            <div id="cfArea_continuous" class="px-2 pb-2 pt-1.5 border-t border-slate-100 bg-white space-y-1.5">
              <div class="grid grid-cols-2 gap-1">
                <div>
                  <div class="text-[8px] font-semibold text-slate-500 mb-0.5">เริ่ม(อายุ)</div>
                  <input type="number" id="cfStartAge" value="61" min="1" max="89" oninput="generatePolicyTableData()" class="${iN}">
                </div>
                <div>
                  <div class="text-[8px] font-semibold text-slate-500 mb-0.5">ถึง(อายุ)</div>
                  <input type="number" id="cfEndAge" value="70" min="1" max="89" oninput="generatePolicyTableData()" class="${iN}">
                </div>
              </div>
              <div class="space-y-1">
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="cfSubMode" value="auto" checked onchange="setCfSubMode('auto')" class="w-3 h-3 accent-emerald-500 shrink-0">
                  <span class="text-[9px] font-semibold text-slate-600 leading-tight">ระบบคำนวณสูงสุด</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="cfSubMode" value="manual" onchange="setCfSubMode('manual')" class="w-3 h-3 accent-emerald-500 shrink-0">
                  <span class="text-[9px] font-semibold text-slate-600 leading-tight">ระบุจำนวนเอง</span>
                </label>
              </div>
              <div id="cfAmountArea" class="hidden">
                <div class="text-[8px] font-semibold text-slate-500 mb-0.5">จำนวน (บาท/ปี)</div>
                <input type="text" id="cfContAmt" value="50,000" oninput="cfFormatNum(this); generatePolicyTableData()" class="${iN}">
              </div>
            </div>
          </div>

          <!-- Option B: รับบางปี -->
          <div class="border border-slate-200 rounded-xl overflow-hidden">
            <label class="flex items-center gap-1.5 px-2.5 py-2 bg-slate-50 cursor-pointer">
              <input type="radio" name="cfMainMode" value="specific" onchange="setCfMainMode('specific')" class="w-3.5 h-3.5 accent-emerald-500 shrink-0">
              <div>
                <div class="text-[11px] font-bold text-slate-700 leading-tight">รับบางปี</div>
                <div class="text-[8px] text-slate-400 leading-tight">ระบุอายุที่รับ</div>
              </div>
            </label>
            <div id="cfArea_specific" class="hidden px-2 pb-2 pt-1.5 border-t border-slate-100 bg-white space-y-1.5">
              <div>
                <div class="text-[8px] font-semibold text-slate-500 mb-0.5">อายุที่รับ (คั่น ,)</div>
                <input type="text" id="cfSpecificAges" placeholder="55,60,70" oninput="generatePolicyTableData()" class="${iT}">
              </div>
              <div>
                <div class="text-[8px] font-semibold text-slate-500 mb-0.5">จำนวน (บาท/รอบ)</div>
                <input type="text" id="cfSpecificAmt" value="50,000" oninput="cfFormatNum(this); generatePolicyTableData()" class="${iN}">
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>`;
}

// ===== PDF & SHARE UTILITIES =====

/** ตรวจสอบว่ากำลังเปิดอยู่ใน LINE in-app browser หรือไม่ */
function isInLineApp() {
    if (typeof liff !== 'undefined' && liff.isInClient && liff.isInClient()) return true;
    return /Line\//i.test(navigator.userAgent);
}

/** ลบ emoji ออกจากข้อความ (ใช้แทน regex ซ้ำๆ ใน exportTableToPDF) */
function stripEmoji(str) {
    if (!str) return '';
    return str.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
}

/** แสดง modal แนะนำให้เปิดใน external browser (fallback สำหรับ LINE iOS) */
function showLineInAppModal() {
    let modal = document.getElementById('lineInAppModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'lineInAppModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content-card p-6 text-center">
                <div class="w-14 h-14 bg-[#00B900]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fab fa-line text-[#00B900] text-3xl"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-800 mb-2">ใช้งานผ่านแอป LINE</h3>
                <p class="text-sm text-slate-500 mb-5 leading-relaxed">
                    แอป LINE ไม่อนุญาตให้ดาวน์โหลดไฟล์ PDF โดยตรง<br><br>
                    กรุณากดที่ไอคอน <strong class="text-slate-700">3 จุด (⋮)</strong> หรือ <strong class="text-slate-700">(···)</strong> มุมขวาบน<br>
                    แล้วเลือก <strong class="text-slate-700">"เปิดในเบราว์เซอร์เริ่มต้น"</strong><br>
                    (Open in Browser) เพื่อดาวน์โหลด
                </p>
                <button onclick="document.getElementById('lineInAppModal').classList.add('hidden')"
                    class="w-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 py-3.5 rounded-xl font-bold transition-all text-sm">
                    เข้าใจแล้ว
                </button>
            </div>`;
        document.body.appendChild(modal);
    }
    modal.classList.remove('hidden');
}

/** พยายามแชร์ไฟล์ผ่าน Web Share API — return true ถ้าสำเร็จหรือ user กดยกเลิก */
async function tryShareFile(file, title, text) {
    if (!navigator.share) return false;
    if (navigator.canShare && !navigator.canShare({ files: [file] })) return false;
    try {
        await navigator.share({ files: [file], title, text });
        return true;
    } catch (err) {
        if (err.name === 'AbortError') return true;
        return false;
    }
}

// ===== IMAGE VIEWER STATE (เดิมเป็น PDF — เปลี่ยนเป็นภาพความละเอียดสูง) =====
let _pdfViewerBlob = null;
let _pdfViewerFilename = '';
let _pdfViewerDataUri = null;
let _pdfViewerBlobUrl = null;
let _pdfViewerImageBlob = null;     // composite PNG ของทุกหน้า — เป็นไฟล์หลักที่ใช้บันทึก
let _pdfViewerImageBlobUrl = null;

function closePdfViewer() {
    const modal = document.getElementById('pdfViewerModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = '';
    }
    const canvasArea = document.getElementById('pdfViewerCanvas');
    if (canvasArea) {
        // revoke blob URLs ของ <img> ในวิวเวอร์
        if (Array.isArray(canvasArea.__pageImgUrls)) {
            canvasArea.__pageImgUrls.forEach(u => { try { URL.revokeObjectURL(u); } catch {} });
            canvasArea.__pageImgUrls = null;
        }
        canvasArea.innerHTML = '';
    }
    const dlLink = document.getElementById('pdfSaveLink');
    if (dlLink && dlLink.href && dlLink.href.startsWith('blob:')) {
        URL.revokeObjectURL(dlLink.href);
        dlLink.href = '#';
    }
    if (_pdfViewerBlobUrl) { try { URL.revokeObjectURL(_pdfViewerBlobUrl); } catch {} }
    if (_pdfViewerImageBlobUrl) { try { URL.revokeObjectURL(_pdfViewerImageBlobUrl); } catch {} }
    _pdfViewerBlob = null;
    _pdfViewerFilename = '';
    _pdfViewerDataUri = null;
    _pdfViewerBlobUrl = null;
    _pdfViewerImageBlob = null;
    _pdfViewerImageBlobUrl = null;
}

async function _ensureLiffReady() {
    if (window._liffReady && typeof window._liffReady.then === 'function') {
        try { await window._liffReady; } catch {}
    }
}

function _liffApi(name) {
    return typeof liff !== 'undefined'
        && typeof liff.isApiAvailable === 'function'
        && liff.isApiAvailable(name);
}

function _showQuickToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(15,23,42,0.92);color:white;padding:14px 24px;border-radius:14px;font-size:13px;font-weight:600;z-index:99999;box-shadow:0 8px 24px rgba(0,0,0,0.4);';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1500);
}

function _blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = () => reject(fr.error);
        fr.readAsDataURL(blob);
    });
}

// บันทึกรูปภาพความละเอียดสูง — ใช้ Web Share API บน LIFF (ผู้ใช้เลือก Save to Photos/Files)
// ต้องรักษา user gesture: เรียก navigator.share/click แบบ sync — ห้าม await ก่อนหน้า
function handlePdfSaveLinkClick(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    if (!_pdfViewerImageBlob && !_pdfViewerBlob) {
        _showQuickToast('ยังไม่มีไฟล์ให้บันทึก');
        return;
    }
    if (!_pdfViewerImageBlob) {
        _showQuickToast('กำลังเตรียมภาพ — กรุณารอสักครู่');
        return;
    }

    const inLine = isInLineApp();
    const baseName = String(_pdfViewerFilename || 'document').replace(/\.pdf$/i, '');
    const imgFilename = baseName + '.png';

    // ===== Browser ปกติ: <a download> ของไฟล์ PNG =====
    if (!inLine) {
        try {
            const url = _pdfViewerImageBlobUrl || URL.createObjectURL(_pdfViewerImageBlob);
            const tmp = document.createElement('a');
            tmp.href = url;
            tmp.download = imgFilename;
            tmp.rel = 'noopener';
            document.body.appendChild(tmp);
            tmp.click();
            setTimeout(() => { tmp.remove(); }, 100);
            _showQuickToast('กำลังดาวน์โหลด...');
        } catch (err) {
            console.warn('[Save] <a download> with image blob failed:', err);
            _showPdfSaveFallback('download failed');
        }
        return;
    }

    // ===== LIFF: ใช้ Web Share API กับไฟล์ PNG — เปิด system share sheet
    //          ผู้ใช้กด "Save to Photos" / "บันทึกในรูปภาพ" จริงๆ ได้
    // ต้องเรียก navigator.share แบบ sync (ภายในเฟรม user-gesture) — ห้าม await
    const imgFile = (typeof File !== 'undefined')
        ? new File([_pdfViewerImageBlob], imgFilename, { type: 'image/png' })
        : null;

    if (imgFile && navigator.share && (!navigator.canShare || navigator.canShare({ files: [imgFile] }))) {
        try {
            const p = navigator.share({ files: [imgFile], title: imgFilename });
            if (p && typeof p.then === 'function') {
                p.then(() => {
                    _showQuickToast('บันทึกสำเร็จ');
                }).catch(err => {
                    if (err && err.name === 'AbortError') return;
                    console.warn('[Save] navigator.share rejected:', err);
                    _showLongPressHintToast();
                });
                return;
            }
        } catch (err) {
            console.warn('[Save] navigator.share threw:', err);
        }
    }

    // Fallback: <a download> ของ PNG (บาง LINE WebView อนุญาต)
    if (_trySaveViaImageDownload(imgFilename)) {
        _showQuickToast('กำลังบันทึกรูปภาพ...');
        return;
    }

    // สุดท้าย — แนะนำให้กดค้างที่ภาพในหน้านี้ (image แทน canvas รองรับ long-press save)
    _showLongPressHintToast();
}

// Toast แนะนำให้กดค้างที่ภาพในหน้าวิวเวอร์ (แทน lightbox preview)
function _showLongPressHintToast() {
    const existing = document.getElementById('_longPressHintToast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.id = '_longPressHintToast';
    t.style.cssText = 'position:fixed;bottom:90px;left:16px;right:16px;background:linear-gradient(135deg,#1e293b,#0f172a);color:white;padding:14px 18px;border-radius:14px;font-size:13px;z-index:99999;box-shadow:0 6px 24px rgba(0,0,0,0.5);border:1px solid rgba(251,191,36,0.4);display:flex;align-items:center;gap:12px;';
    t.innerHTML = `
        <i class="fas fa-hand-pointer" style="color:#fbbf24;font-size:22px;flex-shrink:0;"></i>
        <div style="flex:1;line-height:1.5;">
            <div style="font-weight:700;margin-bottom:2px;">กดค้างที่ภาพในหน้านี้</div>
            <div style="font-size:11px;color:#cbd5e1;">เลือก "บันทึกภาพ" / "Save image" จากเมนู</div>
        </div>
        <button id="_longPressHintClose" style="background:rgba(255,255,255,0.1);border:none;color:white;width:30px;height:30px;border-radius:50%;cursor:pointer;flex-shrink:0;">
            <i class="fas fa-times" style="font-size:12px;"></i>
        </button>
    `;
    document.body.appendChild(t);
    document.getElementById('_longPressHintClose').addEventListener('click', () => t.remove());
    setTimeout(() => { if (t.parentNode) t.remove(); }, 6000);
}

// Lightbox สำหรับ "กดค้างเพื่อบันทึกภาพ" — fallback ที่ทำงานได้แน่นอนบน LINE WebView Android
// เพราะ <img> รองรับ long-press → native context menu → "บันทึกภาพ" / "Save image"
// ต้อง stopPropagation บน contextmenu เพราะ window มี global preventDefault
//
// opts.showLineShare = true → เพิ่มปุ่ม "ส่งสรุปข้อความใน LINE" (สำหรับ Share button fallback)
function _showLongPressSaveModal(opts) {
    opts = opts || {};
    if (!_pdfViewerImageBlobUrl) return false;
    const existing = document.getElementById('_imgSaveLightbox');
    if (existing) existing.remove();

    const url = _pdfViewerImageBlobUrl;
    const hasSharePicker = !!opts.showLineShare && _liffApi('shareTargetPicker');
    const headlineColor = opts.showLineShare ? '#06c755' : '#fbbf24';
    const headlineBg = opts.showLineShare ? 'rgba(6,199,85,0.15)' : 'rgba(251,191,36,0.15)';
    const headlineBorder = opts.showLineShare ? 'rgba(6,199,85,0.4)' : 'rgba(251,191,36,0.4)';
    const titleText = opts.showLineShare ? 'แชร์ภาพให้คนอื่น' : 'บันทึกภาพ';

    const modal = document.createElement('div');
    modal.id = '_imgSaveLightbox';
    modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.95);display:flex;flex-direction:column;padding-top:max(12px,env(safe-area-inset-top));padding-bottom:max(12px,env(safe-area-inset-bottom));';
    modal.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;flex-shrink:0;">
            <div style="color:white;font-size:14px;font-weight:700;">${titleText}</div>
            <button id="_closeImgLightboxTop" style="width:36px;height:36px;background:rgba(255,255,255,0.15);border:none;border-radius:50%;color:white;font-size:16px;cursor:pointer;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div style="text-align:center;color:white;padding:0 16px 8px;font-size:12px;font-weight:600;line-height:1.6;flex-shrink:0;">
            <div style="display:inline-flex;align-items:center;gap:8px;background:${headlineBg};padding:8px 14px;border-radius:12px;border:1px solid ${headlineBorder};">
                <i class="fas fa-hand-pointer" style="color:${headlineColor};font-size:16px;"></i>
                <span><strong style="color:${headlineColor};">กดค้างที่ภาพ</strong> → เลือก <strong style="color:${headlineColor};">"บันทึกภาพ"</strong></span>
            </div>
            ${opts.showLineShare ? '<div style="margin-top:8px;color:#cbd5e1;font-size:11px;line-height:1.5;">บันทึกภาพแล้ว เปิดแชท LINE → กด <strong style="color:white;">+</strong> → <strong style="color:white;">รูปภาพ</strong> เพื่อส่งให้ผู้รับ<br>หรือกด <strong style="color:#06c755;">"ส่งสรุปข้อความใน LINE"</strong> ด้านล่าง</div>' : ''}
        </div>
        <div id="_imgSaveLightboxScroll" style="flex:1;overflow:auto;padding:10px;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y;">
            <img id="_imgSaveLightboxImg" src="${url}" alt="image"
                 style="display:block;width:100%;height:auto;border-radius:8px;box-shadow:0 4px 24px rgba(0,0,0,0.5);-webkit-touch-callout:default;-webkit-user-select:auto;user-select:auto;pointer-events:auto;" />
        </div>
        <div style="padding:10px 16px;flex-shrink:0;display:flex;flex-direction:column;gap:8px;">
            ${hasSharePicker ? '<button id="_lineShareTextBtn" style="background:#06c755;color:white;border:none;padding:13px;border-radius:14px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;"><i class="fab fa-line"></i> ส่งสรุปข้อความใน LINE</button>' : ''}
            <button id="_closeImgLightbox" style="background:#475569;color:white;border:none;padding:13px;border-radius:14px;font-size:13px;font-weight:700;cursor:pointer;">เสร็จสิ้น</button>
        </div>
    `;
    document.body.appendChild(modal);

    // ปลดบล็อก contextmenu/touchcallout เฉพาะภาพ
    const img = document.getElementById('_imgSaveLightboxImg');
    if (img) {
        img.addEventListener('contextmenu', e => e.stopPropagation(), true);
        img.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
    }

    const closeBtn = document.getElementById('_closeImgLightbox');
    const closeTopBtn = document.getElementById('_closeImgLightboxTop');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.remove());
    if (closeTopBtn) closeTopBtn.addEventListener('click', () => modal.remove());

    if (hasSharePicker) {
        document.getElementById('_lineShareTextBtn').addEventListener('click', async () => {
            try {
                const summary = (typeof generateShortShareText === 'function')
                    ? generateShortShareText()
                    : (_pdfViewerFilename || 'รายละเอียดแผนประกัน');
                const text = `${summary}\n\n📄 ${_pdfViewerFilename}`;
                const ret = await liff.shareTargetPicker([{ type: 'text', text }]);
                if (ret) {
                    Swal.fire({ icon: 'success', title: 'ส่งข้อความแล้ว', timer: 1200, showConfirmButton: false });
                }
            } catch (err) {
                console.warn('[LIFF] shareTargetPicker failed:', err);
                Swal.fire({ icon: 'error', title: 'ส่งข้อความไม่สำเร็จ', timer: 1500, showConfirmButton: false });
            }
            modal.remove();
        });
    }
    return true;
}

// บันทึกเป็นรูป PNG ผ่าน <a download> — ใช้เป็น fallback เมื่อ Web Share API ไม่ทำงาน
function _trySaveViaImageDownload(filename) {
    if (!_pdfViewerImageBlobUrl) return false;
    const imgFilename = String(filename || 'document.png');
    try {
        const tmp = document.createElement('a');
        tmp.href = _pdfViewerImageBlobUrl;
        tmp.download = imgFilename;
        tmp.rel = 'noopener';
        tmp.type = 'image/png';
        document.body.appendChild(tmp);
        tmp.click();
        tmp.remove();
        return true;
    } catch (err) {
        console.warn('[ImgDL] failed:', err);
        return false;
    }
}

// แทน <canvas> ในวิวเวอร์ด้วย <img> เพื่อรองรับ native long-press context menu
// (canvas ไม่รองรับ "Save image" บน WebView ส่วนใหญ่ — ต้องใช้ <img>)
async function _replaceCanvasesWithSaveableImages(canvases) {
    const urls = [];
    for (const canvas of canvases) {
        if (!canvas || !canvas.parentNode) continue;
        try {
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) continue;
            const url = URL.createObjectURL(blob);
            urls.push(url);
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'page';
            img.draggable = false;
            img.style.cssText = 'width:100%;height:auto;display:block;border-radius:8px;background:white;-webkit-touch-callout:default;-webkit-user-select:auto;user-select:auto;pointer-events:auto;';
            // ปลดล็อก contextmenu/long-press save — override global blocker
            img.addEventListener('contextmenu', e => e.stopPropagation(), true);
            img.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
            canvas.parentNode.replaceChild(img, canvas);
        } catch (err) {
            console.warn('[ViewerImg] convert canvas to img failed:', err);
        }
    }
    // เก็บ urls ไว้ revoke ตอนปิด viewer
    const area = document.getElementById('pdfViewerCanvas');
    if (area) area.__pageImgUrls = urls;
}

// Composite ทุก canvas เป็น PNG เดียว — เรียกหลัง PDF.js render เสร็จใน showPdfViewer
async function _precomputeImageBlob() {
    const canvasArea = document.getElementById('pdfViewerCanvas');
    if (!canvasArea) return;
    const canvases = canvasArea.querySelectorAll('canvas');
    if (canvases.length === 0) return;

    const list = Array.from(canvases);
    const maxWidth = Math.max(...list.map(c => c.width));
    const gap = 4;
    const totalHeight = list.reduce((sum, c) => sum + c.height, 0) + gap * (list.length - 1);

    const composite = document.createElement('canvas');
    composite.width = maxWidth;
    composite.height = totalHeight;
    const ctx = composite.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, maxWidth, totalHeight);

    let y = 0;
    for (const c of list) {
        ctx.drawImage(c, Math.floor((maxWidth - c.width) / 2), y);
        y += c.height + gap;
    }

    await new Promise(resolve => {
        composite.toBlob(blob => {
            if (blob) {
                if (_pdfViewerImageBlobUrl) {
                    try { URL.revokeObjectURL(_pdfViewerImageBlobUrl); } catch {}
                }
                _pdfViewerImageBlob = blob;
                _pdfViewerImageBlobUrl = URL.createObjectURL(blob);
            }
            resolve();
        }, 'image/png');
    });
}

// Pinch-zoom 2 นิ้ว (width-based) + 1 นิ้วเลื่อน native + double-tap toggle
// width-based zoom: inner.style.width = `${scale*100}%` → browser re-rasterize จาก
// canvas bitmap ความละเอียดสูงทุกครั้ง = คมชัดเสมอ และ scroll-bounds ขยายตามขนาดจริง
// ทำให้ผู้ใช้เลื่อนซ้าย-ขวา-บน-ล่าง ด้วย 1 นิ้วได้แบบ native scroll
const _IMG_ZOOM_MIN = 1;
const _IMG_ZOOM_MAX = 6;
function _setupPdfZoomGestures() {
    const area = document.getElementById('pdfViewerCanvas');
    const inner = document.getElementById('pdfViewerCanvasInner');
    if (!area || !inner || area.__zoomSetup) return;
    area.__zoomSetup = true;

    let scale = 1;
    let startDist = 0;
    let startScale = 1;
    let startMidX = 0, startMidY = 0;  // relative to area
    let startScrollLeft = 0, startScrollTop = 0;
    let lastTap = 0, lastTapX = 0, lastTapY = 0;

    const apply = () => {
        inner.style.width = `${100 * scale}%`;
    };
    const reset = () => {
        scale = 1;
        apply();
        area.scrollLeft = 0;
        area.scrollTop = 0;
    };

    area.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            const t0 = e.touches[0], t1 = e.touches[1];
            startDist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
            startScale = scale;
            const rect = area.getBoundingClientRect();
            startMidX = (t0.clientX + t1.clientX) / 2 - rect.left;
            startMidY = (t0.clientY + t1.clientY) / 2 - rect.top;
            startScrollLeft = area.scrollLeft;
            startScrollTop = area.scrollTop;
        }
    }, { passive: true });

    area.addEventListener('touchmove', (e) => {
        // เฉพาะ 2 นิ้วเท่านั้น — 1 นิ้วปล่อยให้ browser scroll เอง
        if (e.touches.length === 2 && startDist > 0) {
            e.preventDefault();
            const t0 = e.touches[0], t1 = e.touches[1];
            const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
            const newScale = Math.max(_IMG_ZOOM_MIN, Math.min(_IMG_ZOOM_MAX, startScale * (dist / startDist)));
            const ratio = newScale / startScale;
            scale = newScale;
            apply();
            // ปรับ scroll เพื่อให้จุดกลางของ pinch อยู่ตำแหน่งเดิมบนหน้าจอ
            area.scrollLeft = (startScrollLeft + startMidX) * ratio - startMidX;
            area.scrollTop = (startScrollTop + startMidY) * ratio - startMidY;
        }
    }, { passive: false });

    area.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) startDist = 0;
        // double-tap zoom toggle (1 นิ้ว แตะ 2 ครั้งเร็ว)
        if (e.touches.length === 0 && e.changedTouches.length === 1) {
            const t = e.changedTouches[0];
            const now = Date.now();
            const dt = now - lastTap;
            const dxTap = Math.abs(t.clientX - lastTapX);
            const dyTap = Math.abs(t.clientY - lastTapY);
            if (dt < 300 && dxTap < 30 && dyTap < 30) {
                const rect = area.getBoundingClientRect();
                const tapX = t.clientX - rect.left;
                const tapY = t.clientY - rect.top;
                const oldScale = scale;
                scale = scale > 1.05 ? 1 : 2.5;
                apply();
                if (scale === 1) {
                    area.scrollLeft = 0;
                    area.scrollTop = 0;
                } else {
                    const ratio = scale / oldScale;
                    area.scrollLeft = (area.scrollLeft + tapX) * ratio - tapX;
                    area.scrollTop = (area.scrollTop + tapY) * ratio - tapY;
                }
                lastTap = 0;
            } else {
                lastTap = now;
                lastTapX = t.clientX;
                lastTapY = t.clientY;
            }
        }
    }, { passive: true });

    area.__resetZoom = reset;
}

// ใช้ Print API → Android Print Dialog มีตัวเลือก "บันทึกเป็น PDF" บันทึกลง Downloads จริง
// (Print Dialog เป็น system overlay ของ Android — ไม่ใช่บราวเซอร์ภายนอก)
function _trySaveViaPrint() {
    if (typeof window.print !== 'function') return false;
    const canvasArea = document.getElementById('pdfViewerCanvas');
    if (!canvasArea) return false;
    const canvases = canvasArea.querySelectorAll('canvas');
    if (canvases.length === 0) return false;

    let imgsHtml = '';
    canvases.forEach(c => {
        try {
            imgsHtml += `<img src="${c.toDataURL('image/jpeg', 0.92)}">`;
        } catch (err) {
            console.warn('[Print] canvas.toDataURL failed:', err);
        }
    });
    if (!imgsHtml) return false;

    const oldFrame = document.getElementById('_printFrame');
    if (oldFrame) { try { oldFrame.remove(); } catch {} }
    const iframe = document.createElement('iframe');
    iframe.id = '_printFrame';
    iframe.style.cssText = 'position:fixed;width:0;height:0;border:0;left:-9999px;top:-9999px;opacity:0;';
    document.body.appendChild(iframe);

    const safeTitle = String(_pdfViewerFilename || 'PDF').replace(/[<>&"']/g, '');
    const html = `<!DOCTYPE html><html><head>
        <title>${safeTitle}</title>
        <meta charset="utf-8">
        <style>
            @page { margin: 8mm; size: A4; }
            html, body { margin: 0; padding: 0; background: #fff; }
            img { display: block; width: 100%; page-break-after: always; }
            img:last-child { page-break-after: auto; }
        </style>
    </head><body>${imgsHtml}</body></html>`;

    try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open(); doc.write(html); doc.close();

        const imgs = doc.querySelectorAll('img');
        let loaded = 0;
        let printed = false;
        const doPrint = () => {
            if (printed) return;
            printed = true;
            try {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            } catch (err) {
                console.warn('[Print] print() failed:', err);
            }
            setTimeout(() => { try { iframe.remove(); } catch {} }, 60000);
        };
        const tick = () => { loaded++; if (loaded >= imgs.length) doPrint(); };
        if (imgs.length === 0) { doPrint(); return true; }
        imgs.forEach(img => {
            if (img.complete && img.naturalWidth > 0) setTimeout(tick, 0);
            else { img.addEventListener('load', tick); img.addEventListener('error', tick); }
        });
        setTimeout(doPrint, 3000);
        return true;
    } catch (err) {
        console.warn('[Print] iframe setup failed:', err);
        try { iframe.remove(); } catch {}
        return false;
    }
}

function _trySaveViaShareOrFallback(filename) {
    const pdfFile = (typeof File !== 'undefined' && _pdfViewerBlob)
        ? new File([_pdfViewerBlob], filename, { type: 'application/pdf' })
        : null;

    if (pdfFile && navigator.share) {
        try {
            const p = navigator.share({ files: [pdfFile], title: filename, text: filename });
            if (p && typeof p.then === 'function') {
                p.catch(err => {
                    if (!err || err.name === 'AbortError') return;
                    console.warn('[Save] navigator.share rejected:', err);
                    _showPdfSaveFallback(`share: ${err && err.name || 'reject'}`);
                });
                return;
            }
        } catch (err) {
            console.warn('[Save] navigator.share threw:', err);
            _showPdfSaveFallback(`share threw: ${err && err.name || 'err'}`);
            return;
        }
    }
    _showPdfSaveFallback(navigator.share ? 'File unavailable' : 'no share API');
}

function _showPdfSaveFallback(errInfo) {
    const existing = document.getElementById('_pdfActionFallbackToast');
    if (existing) existing.remove();

    const hasSharePicker = _liffApi('shareTargetPicker');
    const toast = document.createElement('div');
    toast.id = '_pdfActionFallbackToast';
    toast.style.cssText = 'position:fixed;bottom:90px;left:16px;right:16px;background:#1e293b;color:white;padding:16px;border-radius:16px;font-size:13px;z-index:99999;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.6);border:1px solid #475569;';
    toast.innerHTML = `
        <div style="font-weight:700;margin-bottom:6px;font-size:14px;">ไม่สามารถบันทึกรูปภาพได้</div>
        <div style="color:#cbd5e1;margin-bottom:12px;font-size:12px;line-height:1.5;">
            อุปกรณ์ไม่รองรับการบันทึกไฟล์โดยตรง<br>
            ${hasSharePicker ? 'ส่งสรุปข้อความเข้าแชทตัวเองได้แทน' : 'กรุณาอัปเดตแอป LINE แล้วลองใหม่'}
            ${errInfo ? `<br><span style="color:#94a3b8;font-size:10px;">(${errInfo})</span>` : ''}
        </div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
            ${hasSharePicker ? '<button id="_pdfSendChatBtn" style="background:#06c755;color:white;border:none;padding:9px 16px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;">ส่งข้อความสรุป</button>' : ''}
            <button id="_pdfCloseToastBtn" style="background:#475569;color:white;border:none;padding:9px 16px;border-radius:10px;font-size:12px;cursor:pointer;">ปิด</button>
        </div>
    `;
    document.body.appendChild(toast);
    document.getElementById('_pdfCloseToastBtn').addEventListener('click', () => toast.remove());
    if (hasSharePicker) {
        document.getElementById('_pdfSendChatBtn').addEventListener('click', async () => {
            try {
                const summary = (typeof generateShortShareText === 'function')
                    ? generateShortShareText()
                    : (_pdfViewerFilename || 'รายละเอียดแผนประกัน');
                const text = `${summary}\n\n📄 ${_pdfViewerFilename}`;
                const ret = await liff.shareTargetPicker([{ type: 'text', text }]);
                if (ret) {
                    Swal.fire({ icon: 'success', title: 'ส่งให้แชทแล้ว', timer: 1200, showConfirmButton: false });
                }
            } catch (err) {
                console.warn('[Save] shareTargetPicker fallback failed:', err);
            }
            toast.remove();
        });
    }
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 12000);
}

// แชร์รูปภาพ — sync entry เพื่อรักษา user gesture สำหรับ navigator.share
// ใน LIFF Android: navigator.share อาจไม่แสดง LINE ใน share sheet (intent loop)
// → fallback เป็น lightbox พร้อมปุ่ม "ส่งสรุปข้อความใน LINE"
function handlePdfShare() {
    if (!_pdfViewerImageBlob && !_pdfViewerBlob) {
        _showQuickToast('ยังไม่มีรูปภาพ');
        return;
    }
    if (!_pdfViewerImageBlob) {
        _showQuickToast('กำลังเตรียมภาพ — กรุณารอสักครู่');
        return;
    }

    const inLine = isInLineApp();
    const baseName = String(_pdfViewerFilename || 'document').replace(/\.pdf$/i, '');
    const imgName = baseName + '.png';
    const imgFile = (typeof File !== 'undefined')
        ? new File([_pdfViewerImageBlob], imgName, { type: 'image/png' })
        : null;

    // ===== Browser ปกติ (นอก LIFF): ลอง navigator.share file =====
    // ใน mobile browser ปกติ share sheet จะมี LINE/Messenger/Save to Photos
    if (!inLine && imgFile && navigator.share && (!navigator.canShare || navigator.canShare({ files: [imgFile] }))) {
        try {
            const p = navigator.share({ files: [imgFile], title: imgName });
            if (p && typeof p.then === 'function') {
                p.then(() => _showQuickToast('แชร์สำเร็จ'))
                 .catch(err => {
                    if (err && err.name === 'AbortError') return;
                    console.warn('[Share] navigator.share file failed:', err);
                    _handleShareDesktopFallback();
                 });
                return;
            }
        } catch (err) {
            console.warn('[Share] navigator.share threw:', err);
        }
    }

    // ===== LIFF: ข้าม navigator.share เพราะ share sheet ไม่มี LINE
    //          เปิด lightbox ที่ผู้ใช้:
    //          1) กดค้างที่ภาพ → บันทึก → ส่งใน LINE chat เอง
    //          2) กดปุ่ม "ส่งสรุปข้อความใน LINE" — shareTargetPicker text
    if (inLine) {
        if (_showLongPressSaveModal({ showLineShare: true })) return;
    }

    _handleShareDesktopFallback();
}

// Desktop/non-LIFF fallback — เปิดเมนูแชร์ข้อความ
async function _handleShareDesktopFallback() {
    if (typeof openGenericShareModal === 'function'
        && typeof lastCalculationData !== 'undefined' && lastCalculationData) {
        openGenericShareModal('summary');
        return;
    }
    // สุดท้าย — lightbox + LIFF text share (ถ้า available)
    if (_showLongPressSaveModal({ showLineShare: true })) return;
    _showPdfActionFallback();
}

function _showPdfActionFallback() {
    const existing = document.getElementById('_pdfActionFallbackToast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = '_pdfActionFallbackToast';
    toast.style.cssText = 'position:fixed;bottom:90px;left:16px;right:16px;background:#1e293b;color:white;padding:16px;border-radius:16px;font-size:13px;z-index:99999;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.6);border:1px solid #475569;';
    const hasSharePicker = _liffApi('shareTargetPicker');
    const canOpenWindow = typeof liff !== 'undefined' && typeof liff.openWindow === 'function' && window.IS_IN_LIFF;
    const inLine = isInLineApp();
    const headline = inLine ? 'LINE จำกัดการบันทึกไฟล์โดยตรง' : 'อุปกรณ์ไม่รองรับการบันทึก/แชร์ไฟล์';
    toast.innerHTML = `
        <div style="font-weight:700;margin-bottom:6px;font-size:14px;">ไม่สามารถบันทึกไฟล์ได้</div>
        <div style="color:#cbd5e1;margin-bottom:12px;font-size:12px;line-height:1.6;">
            ${headline}<br>
            ${canOpenWindow ? 'เปิดในเบราว์เซอร์ภายนอกเพื่อบันทึกรูปภาพได้' : (hasSharePicker ? 'สามารถส่งสรุปแผนเป็นข้อความใน LINE ได้' : 'ลองเปิดบนเบราว์เซอร์ปกติ')}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
            ${canOpenWindow ? '<button id="_pdfOpenExtBtn" style="background:#0ea5e9;color:white;border:none;padding:9px 16px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;">เปิดในเบราว์เซอร์</button>' : ''}
            ${hasSharePicker ? '<button id="_pdfShareTextBtn" style="background:#06c755;color:white;border:none;padding:9px 16px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;">ส่งข้อความใน LINE</button>' : ''}
            <button id="_pdfCloseToastBtn" style="background:#475569;color:white;border:none;padding:9px 16px;border-radius:10px;font-size:12px;cursor:pointer;">ปิด</button>
        </div>
    `;
    document.body.appendChild(toast);
    document.getElementById('_pdfCloseToastBtn').addEventListener('click', () => toast.remove());
    if (canOpenWindow) {
        document.getElementById('_pdfOpenExtBtn').addEventListener('click', () => {
            try {
                liff.openWindow({ url: window.location.href, external: true });
            } catch (err) { console.warn('[LIFF] openWindow external failed:', err); }
            toast.remove();
        });
    }
    if (hasSharePicker) {
        document.getElementById('_pdfShareTextBtn').addEventListener('click', async () => {
            try {
                const summary = (typeof generateShortShareText === 'function') ? generateShortShareText() : '';
                await liff.shareTargetPicker([{ type: 'text', text: summary || _pdfViewerFilename }]);
            } catch (err) { console.warn('[LIFF] shareTargetPicker failed:', err); }
            toast.remove();
        });
    }
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 15000);
}

async function showPdfViewer(pdfBlob, filename, planLabel) {
    _pdfViewerBlob = pdfBlob;
    _pdfViewerFilename = filename;
    _pdfViewerDataUri = null;

    // ใช้ static HTML modal ที่ LIFF-compatible — ไม่สร้างใหม่ (มี safe-area inset อยู่แล้ว)
    const modal = document.getElementById('pdfViewerModal');
    if (!modal) return;

    // อัปเดต title
    const titleEl = document.getElementById('pdfViewerTitle');
    if (titleEl) titleEl.textContent = planLabel || filename;

    // สร้าง blob URL — เก็บไว้ revoke ตอนปิด (อย่า revoke ที่นี่)
    _pdfViewerBlobUrl = URL.createObjectURL(pdfBlob);
    const dlLink = document.getElementById('pdfSaveLink');
    if (dlLink) { dlLink.href = _pdfViewerBlobUrl; dlLink.setAttribute('download', filename); }

    // Pre-compute data URI — ใช้ใน click handler แบบ sync (รักษา user gesture บน iOS LIFF)
    _blobToDataUrl(pdfBlob).then(uri => { _pdfViewerDataUri = uri; })
        .catch(err => { console.warn('[PDF] pre-compute data URI failed:', err); });

    // แสดง modal
    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    // Reset canvas — แสดง spinner ก่อน
    const canvasArea = document.getElementById('pdfViewerCanvas');
    if (canvasArea) {
        canvasArea.innerHTML = `<div style="text-align:center;padding:40px 16px;color:#94a3b8;">
            <i class="fas fa-spinner fa-spin" style="font-size:28px;display:block;margin-bottom:12px;"></i>
            <span style="font-size:13px;">กำลังเตรียมภาพความละเอียดสูง...</span>
        </div>`;
        // reset zoom transform จากครั้งก่อน (ถ้ามี)
        if (canvasArea.__resetZoom) canvasArea.__resetZoom();
    }

    // Render PDF.js ถ้ามี — composite เป็นภาพความละเอียดสูง
    if (canvasArea && typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        try {
            const ab = await pdfBlob.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
            canvasArea.innerHTML = '';
            // wrap canvases ใน inner — width-based zoom (เปลี่ยน width = scale × 100%)
            const inner = document.createElement('div');
            inner.id = 'pdfViewerCanvasInner';
            inner.style.cssText = 'display:flex;flex-direction:column;gap:10px;width:100%;margin:0 auto;';
            canvasArea.appendChild(inner);

            // เรนเดอร์ความละเอียดสูงสุด — บูสต์ DPR ×4 ให้คมชัดที่ max zoom 6×
            const HI_RES_BOOST = 4;
            const renderedCanvases = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const dpr = window.devicePixelRatio || 1;
                const vw = page.getViewport({ scale: 1 });
                const fitScale = ((canvasArea.clientWidth || 300) / vw.width) * dpr * HI_RES_BOOST;
                const vp = page.getViewport({ scale: fitScale });
                const canvas = document.createElement('canvas');
                canvas.width = vp.width;
                canvas.height = vp.height;
                Object.assign(canvas.style, { width: '100%', height: 'auto', display: 'block', borderRadius: '8px', background: 'white', imageRendering: '-webkit-optimize-contrast' });
                inner.appendChild(canvas);
                await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
                renderedCanvases.push(canvas);
            }

            // หลัง render เสร็จ — composite รูปไว้ใช้ตอน save + setup pinch zoom
            // แล้วแทนที่ canvas ด้วย <img> เพื่อรองรับ "กดค้าง → บันทึกภาพ" ใน WebView
            // composite ต้องเสร็จก่อนแทนที่ — เพราะอ่าน pixel จาก canvas
            _precomputeImageBlob()
                .catch(err => console.warn('[Image] composite failed:', err))
                .then(() => _replaceCanvasesWithSaveableImages(renderedCanvases))
                .catch(err => console.warn('[Image] canvas→img failed:', err));
            _setupPdfZoomGestures();
        } catch {
            canvasArea.innerHTML = `<div style="text-align:center;padding:32px;color:#94a3b8;font-size:13px;">
                เอกสารพร้อมแล้ว — กดปุ่ม <strong style="color:white;">บันทึกรูปภาพ</strong> ด้านล่าง</div>`;
        }
    } else if (canvasArea) {
        canvasArea.innerHTML = `<div style="text-align:center;padding:32px;color:#94a3b8;font-size:13px;">
            เอกสารพร้อมแล้ว — กดปุ่ม <strong style="color:white;">บันทึกรูปภาพ</strong> ด้านล่าง</div>`;
    }
}

// ===== FONT CACHE =====
let thaiFontBase64 = null;
let thaiFontBoldBase64 = null;

async function loadThaiFont() { 
    if (thaiFontBase64) return thaiFontBase64; 
    try { 
        const response = await fetch('https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/sarabun/Sarabun-Regular.ttf'); 
        const blob = await response.blob(); 
        return new Promise((resolve) => { 
            const reader = new FileReader(); 
            reader.onloadend = () => { 
                thaiFontBase64 = reader.result.split(',')[1]; 
                resolve(thaiFontBase64); 
            }; 
            reader.readAsDataURL(blob); 
        }); 
    } catch (e) { 
        return null; 
    } 
}

async function loadThaiFontBold() {
    if (thaiFontBoldBase64) return thaiFontBoldBase64;
    try {
        const response = await fetch('https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/sarabun/Sarabun-Bold.ttf');
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                thaiFontBoldBase64 = reader.result.split(',')[1];
                resolve(thaiFontBoldBase64);
            };
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        return null;
    }
}

async function _export3DPDF(actionType = 'preview') {
    const hxVal = window.currentHX || '';
    if (!hxVal || hxVal === 'ไม่เลือก') return showCustomError("กรุณาเลือกแผน HX ก่อน");

    const toast = document.createElement('div');
    toast.className = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-900 text-white px-8 py-5 rounded-2xl text-sm font-bold z-[1000] shadow-2xl text-center backdrop-blur-sm transition-all";
    toast.innerHTML = `<i class='fas fa-spinner fa-spin mb-3 block text-3xl'></i><span>กำลังสร้างภาพความละเอียดสูง...</span>`;
    document.body.appendChild(toast);

    try {
        const [fontBase64, fontBoldBase64] = await Promise.all([
            typeof loadThaiFont === 'function' ? loadThaiFont() : Promise.resolve(null),
            typeof loadThaiFontBold === 'function' ? loadThaiFontBold() : Promise.resolve(null)
        ]);
        if (!window.jspdf && !window.jsPDF) throw new Error("ไม่พบไลบรารี jsPDF");
        const jsPDF = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
        const doc = new jsPDF('p', 'mm', 'a4');

        let fontName = 'helvetica';
        if (fontBase64) {
            doc.addFileToVFS('Sarabun-Regular.ttf', fontBase64);
            doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal');
            if (fontBoldBase64) {
                doc.addFileToVFS('Sarabun-Bold.ttf', fontBoldBase64);
                doc.addFont('Sarabun-Bold.ttf', 'Sarabun', 'bold');
            } else {
                doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'bold');
            }
            fontName = 'Sarabun';
        }

        const planInfo = HX_PLAN_INFO[hxVal] || { room:'-', lump:'-', tier:'base' };
        const tier = planInfo.tier;
        const hxoVal = window.currentHXO || 'ไม่เลือก';
        const hxdVal = window.currentHXD || 'ไม่เลือก';
        const hbfVal = window.currentHBF || 0;

        // Header
        doc.setFillColor(13, 148, 136);
        doc.rect(0, 0, 210, 22, 'F');
        doc.setFont(fontName, 'bold'); doc.setFontSize(15); doc.setTextColor(255,255,255);
        doc.text('3D Health Excellence — ความคุ้มครอง 19 หมวด', 105, 10, { align: 'center' });
        doc.setFont(fontName, 'normal'); doc.setFontSize(11);
        doc.text(`${hxVal} · ค่าห้อง ${planInfo.room} บ./คืน · วงเงิน ${planInfo.lump}`, 105, 17, { align: 'center' });

        let y = 30;
        // Riders summary
        doc.setFont(fontName, 'bold'); doc.setFontSize(11); doc.setTextColor(30,41,59);
        doc.text('สัญญาเพิ่มเติม:', 15, y);
        doc.setFont(fontName, 'normal'); doc.setTextColor(71,85,105);
        doc.text(`HXO: ${hxoVal} | HXD: ${hxdVal} | HBF: ${hbfVal > 0 ? hbfVal.toLocaleString()+' บ./วัน' : 'ไม่เลือก'}`, 55, y);
        y += 8;

        const checkPage = (h) => { if (y + h > 285) { doc.addPage(); y = 20; } };

        // Categories 1-13
        const allCats = [...HX_BASE_CATEGORIES];
        if (tier === 'mid' || tier === 'full') {
            ['14','15','16','17','18'].forEach(n => {
                const sec = SECTION_DATA['m'+n];
                if (sec) allCats.push({ num: n, title: sec.title, limit: sec.cond || '', subs: sec.items });
            });
        }
        if (tier === 'full') {
            const sec = SECTION_DATA['m19'];
            if (sec) allCats.push({ num: '19', title: sec.title, limit: sec.cond || '', subs: sec.items });
        }

        allCats.forEach(cat => {
            checkPage(14);
            doc.setFillColor(240, 253, 250);
            doc.rect(15, y - 4, 180, 8, 'F');
            doc.setFont(fontName, 'bold'); doc.setFontSize(11); doc.setTextColor(13,148,136);
            doc.text(`หมวด ${cat.num}`, 18, y + 1.5);
            doc.setTextColor(30,41,59);
            const titleLines = doc.splitTextToSize(cat.title, 140);
            doc.text(titleLines[0], 35, y + 1.5);
            doc.setFont(fontName, 'normal'); doc.setFontSize(9); doc.setTextColor(100,116,139);
            if (cat.limit) doc.text(cat.limit, 192, y + 1.5, { align: 'right' });
            y += 9;

            const subs = cat.subs || _3D_BASE_SUBS[cat.num];
            if (subs && subs.length) {
                doc.setFont(fontName, 'normal'); doc.setFontSize(9.5); doc.setTextColor(71,85,105);
                subs.forEach(s => {
                    const lines = doc.splitTextToSize('• ' + s, 175);
                    checkPage(lines.length * 5 + 2);
                    doc.text(lines, 20, y);
                    y += lines.length * 5;
                });
                y += 2;
            }
            if (titleLines.length > 1) {
                doc.setFont(fontName, 'normal'); doc.setFontSize(9.5); doc.setTextColor(71,85,105);
                for (let i = 1; i < titleLines.length; i++) {
                    checkPage(5);
                    doc.text(titleLines[i], 35, y);
                    y += 5;
                }
            }
            y += 3;
        });

        // ── สัญญาเพิ่มเติม HXO ──
        const _DL = { 'HXO10':'1,000','HXO20':'2,000','HXO30':'3,000','HXO50':'5,000',
                      'HXD100':'10,000','HXD200':'20,000','HXD500':'50,000','HXD1000':'100,000' };

        if (hxoVal !== 'ไม่เลือก') {
            checkPage(44);
            doc.setFillColor(245, 243, 255);
            doc.rect(15, y - 4, 180, 8, 'F');
            doc.setFont(fontName, 'bold'); doc.setFontSize(11); doc.setTextColor(109, 40, 217);
            doc.text(`สัญญาเพิ่มเติม HXO — ${_DL[hxoVal]||hxoVal} บ./ครั้ง`, 18, y + 1.5);
            y += 10;
            const hxoItems = [
                { t: 'ข้อ 1 — ความคุ้มครองผู้ป่วยนอก (OPD)', r: 'สูงสุด 30 ครั้ง/รอบปี' },
                { t: 'ข้อ 2 — ความคุ้มครองสุขภาพจิต (ค่าใช้จ่ายร่วม 20%)', r: 'สูงสุด 4 ครั้ง/รอบปี' },
                { t: 'ข้อ 3 — ค่าตรวจรักษาทางทันตกรรม (ค่าใช้จ่ายร่วม 20%)', r: 'สูงสุด 2 ครั้ง/รอบปี' },
            ];
            doc.setFont(fontName, 'normal'); doc.setFontSize(9.5);
            hxoItems.forEach(item => {
                checkPage(7);
                const lines = doc.splitTextToSize('• ' + item.t, 150);
                doc.setTextColor(71, 85, 105); doc.text(lines, 20, y);
                doc.setTextColor(109, 40, 217); doc.text(item.r, 192, y, { align: 'right' });
                y += lines.length * 5 + 1;
            });
            y += 4;
        }

        // ── สัญญาเพิ่มเติม HXD ──
        if (hxdVal !== 'ไม่เลือก') {
            checkPage(44);
            doc.setFillColor(238, 242, 255);
            doc.rect(15, y - 4, 180, 8, 'F');
            doc.setFont(fontName, 'bold'); doc.setFontSize(11); doc.setTextColor(67, 56, 202);
            doc.text(`สัญญาเพิ่มเติม HXD — ${_DL[hxdVal]||hxdVal} บ./รอบ`, 18, y + 1.5);
            y += 10;
            const hxdItems = [
                { t: 'ข้อ 1 — ขยายวงเงินผู้ป่วยนอกเพื่อการตรวจวินิจฉัย', c: 'ระยะรอคอย 30 วัน' },
                { t: 'ข้อ 2 — การตรวจสุขภาพประจำปีและค่าฉีดวัคซีน (ค่าใช้จ่ายร่วม 10%)', c: 'ระยะรอคอย 365 วัน' },
                { t: 'ข้อ 3 — ความคุ้มครองพิเศษเพื่อรักษาโรคร้ายแรง (ตลอดชีวิต/ราย)', c: 'ระยะรอคอย 120 วัน' },
            ];
            doc.setFont(fontName, 'normal'); doc.setFontSize(9.5);
            hxdItems.forEach(item => {
                checkPage(9);
                const lines = doc.splitTextToSize('• ' + item.t, 150);
                doc.setTextColor(71, 85, 105); doc.text(lines, 20, y);
                doc.setTextColor(245, 158, 11); doc.text(item.c, 192, y, { align: 'right' });
                y += lines.length * 5 + 2;
            });
            y += 4;
        }

        // ── สัญญาเพิ่มเติม HBF ──
        if (hbfVal > 0) {
            checkPage(36);
            doc.setFillColor(255, 247, 237);
            doc.rect(15, y - 4, 180, 8, 'F');
            doc.setFont(fontName, 'bold'); doc.setFontSize(11); doc.setTextColor(194, 65, 12);
            doc.text(`สัญญาเพิ่มเติม HBF — ${hbfVal.toLocaleString()} บ./วัน (ชดเชยรายวัน)`, 18, y + 1.5);
            y += 10;
            const hbfItems = [
                'รับผลประโยชน์ค่ารักษาพยาบาลรายวัน ตามจำนวนเงินเอาประกันภัยที่กำหนด',
                'จ่ายชดเชยตามจำนวนวันที่เข้ารับการรักษาพยาบาลจริงในฐานะผู้ป่วยใน',
                'รับเงินชดเชยสูงสุดไม่เกิน 365 วัน ต่อการเข้าพักรักษาตัวครั้งใดครั้งหนึ่ง',
            ];
            doc.setFont(fontName, 'normal'); doc.setFontSize(9.5); doc.setTextColor(71, 85, 105);
            hbfItems.forEach(item => {
                checkPage(7);
                const lines = doc.splitTextToSize('• ' + item, 175);
                doc.text(lines, 20, y);
                y += lines.length * 5 + 1;
            });
            y += 4;
        }

        // ── สัญญาเพิ่มเติม TPD ──
        const _tpdSA3dPDF = window.currentTPDEnabled ? (parseInt(window.currentTPDSA) || 0) : 0;
        if (_tpdSA3dPDF > 0) {
            const _tpdSADisp = _tpdSA3dPDF.toLocaleString();
            checkPage(60);
            doc.setFillColor(255, 247, 237);
            doc.rect(15, y - 4, 180, 8, 'F');
            doc.setFont(fontName, 'bold'); doc.setFontSize(11); doc.setTextColor(194, 100, 12);
            doc.text(`สัญญาเพิ่มเติม TPD Super Care — ทุน ${_tpdSADisp} บาท`, 18, y + 1.5);
            y += 10;
            const tpdPDFItems = [
                { t: `ข้อ 1 — ทุพพลภาพถาวรสิ้นเชิง (อายุก่อน 71 ปี)`, r: `100% = ${_tpdSADisp} บ.` },
                { t: `ข้อ 2 — ทุพพลภาพจากอุบัติเหตุขนส่งสาธารณะ (อายุก่อน 71 ปี)`, r: `200% = ${(Math.round(_tpdSA3dPDF*2)).toLocaleString()} บ.` },
                { t: `ข้อ 3 — ความบกพร่องต่อการดำรงชีวิตวัยสูงอายุ OAD (อายุ 71–100 ปี)`, r: `105% = ${Math.round(_tpdSA3dPDF*1.05).toLocaleString()} บ.` },
            ];
            doc.setFont(fontName, 'normal'); doc.setFontSize(9.5);
            tpdPDFItems.forEach(item => {
                checkPage(9);
                const lines = doc.splitTextToSize('• ' + item.t, 148);
                doc.setTextColor(71, 85, 105); doc.text(lines, 20, y);
                doc.setTextColor(194, 100, 12); doc.text(item.r, 192, y, { align: 'right' });
                y += lines.length * 5 + 2;
            });
            doc.setFont(fontName, 'normal'); doc.setFontSize(9); doc.setTextColor(148,163,184);
            checkPage(7);
            doc.text('* ระยะเวลาคุ้มครองต่อเนื่องไม่น้อยกว่า 180 วัน · อายุรับ 31 วัน – 70 ปี · ชั้นอาชีพ 1, 2, 3 เท่านั้น', 20, y);
            y += 8;
        }

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFont(fontName, 'normal'); doc.setFontSize(9);
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setDrawColor(226,232,240); doc.line(15, 285, 195, 285);
            doc.setTextColor(148,163,184); doc.text(`หน้า ${i} / ${pageCount}`, 195, 290, { align: 'right' });
        }

        const pdfBlob = doc.output('blob');
        const _d3d = lastCalculationData || {};
        const _gTh3d = (_d3d.gender === 'male' || (_d3d.gender || '').includes('ชาย')) ? 'ชาย' : 'หญิง';
        const _age3d = _d3d.age ? `${_d3d.age}ปี` : '';
        const _hxRoom = (typeof HX_PLAN_INFO !== 'undefined' && HX_PLAN_INFO[hxVal]) ? HX_PLAN_INFO[hxVal].room : hxVal;
        const pdfFileName = `3D Health ${_gTh3d} ${_age3d} ห้อง${_hxRoom}.pdf`;
        const pdfFile = new File([pdfBlob], pdfFileName, { type: 'application/pdf' });
        if (toast.parentElement) toast.remove();

        if (actionType === 'modal') {
            const d = lastCalculationData || {};
            const hxo = window.currentHXO || 'ไม่เลือก';
            const hxd = window.currentHXD || 'ไม่เลือก';
            const hbf = window.currentHBF || 0;
            const _DL = { 'HXO10':'1,000','HXO20':'2,000','HXO30':'3,000','HXO50':'5,000','HXD100':'10,000','HXD200':'20,000','HXD500':'50,000','HXD1000':'100,000' };
            const riderParts = [
                hxo !== 'ไม่เลือก' ? `OPD ${_DL[hxo] || hxo}` : '',
                hxd !== 'ไม่เลือก' ? `Advance ${_DL[hxd] || hxd}` : '',
                hbf > 0 ? `ชดเชย ${hbf.toLocaleString()}` : '',
                (window.currentTPDEnabled && parseInt(window.currentTPDSA) > 0) ? `TPD ${parseInt(window.currentTPDSA||0).toLocaleString()}` : '',
            ].filter(Boolean).join(' ');
            const cleanName = `3D Health ${_gTh3d} ${_age3d} ห้อง${_hxRoom}${riderParts ? ' ' + riderParts : ''}`;
            await _showTableShareModal(pdfBlob, pdfFile, doc, d, { cleanName });
        } else if (actionType === 'save') {
            const inLine = typeof isInLineApp === 'function' && isInLineApp();
            if (inLine) {
                await showPdfViewer(pdfBlob, pdfFileName);
            } else {
                const shared = typeof tryShareFile === 'function'
                    ? await tryShareFile(pdfFile, pdfFileName, pdfFileName)
                    : false;
                if (!shared) doc.save(pdfFileName);
            }
        } else if (actionType === 'download') {
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a'); a.href = url; a.download = pdfFileName; a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } else {
            showPdfViewer(pdfBlob, pdfFileName);
        }
    } catch (e) {
        console.error('3D PDF export failed', e);
        if (toast.parentElement) toast.remove();
        showCustomError('สร้าง PDF ไม่สำเร็จ: ' + e.message);
    }
}

async function exportTableToPDF(actionType = 'preview') {
    // 3D plan: PDF 19 หมวด แทนตารางมูลค่า
    if (currentAppPlan === '3D Health Excellence') {
        return _export3DPDF(actionType);
    }
    if (!lastCalculationData) return showCustomError("กรุณาคำนวณเบี้ยประกันก่อน");
    
    const toast = document.createElement('div'); 
    toast.className = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-900 text-white px-8 py-5 rounded-2xl text-sm font-bold z-[1000] shadow-2xl text-center backdrop-blur-sm transition-all"; 
    toast.innerHTML = `<i class='fas fa-spinner fa-spin mb-3 block text-3xl'></i><span>กำลังสร้างภาพความละเอียดสูง...</span>`; 
    document.body.appendChild(toast); 
    
    try {
        // โหลด Regular + Bold พร้อมกันเพื่อลด latency
        const [fontBase64, fontBoldBase64] = await Promise.all([
            typeof loadThaiFont === 'function' ? loadThaiFont() : Promise.resolve(null),
            typeof loadThaiFontBold === 'function' ? loadThaiFontBold() : Promise.resolve(null)
        ]);
        
        // 1. ตรวจสอบการโหลด jsPDF เพื่อป้องกัน TypeError
        if (!window.jspdf && !window.jsPDF) throw new Error("ไม่พบไลบรารี jsPDF ในหน้าเว็บ");
        const jsPDF = window.jspdf ? window.jspdf.jsPDF : window.jsPDF; 
        const doc = new jsPDF('p', 'mm', 'a4'); 
        
        // ตรวจสอบว่าโหลดปลั๊กอิน autoTable มาแล้วหรือไม่
        if (typeof doc.autoTable !== 'function') throw new Error("ไม่พบไลบรารี jspdf-autotable");

        let fontName = 'helvetica'; 
        
        if (fontBase64) { 
            try { 
                doc.addFileToVFS('Sarabun-Regular.ttf', fontBase64); 
                doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal');
                // แก้: ใช้ไฟล์ Bold แยก ไม่ใช่ Regular ซ้ำ
                if (fontBoldBase64) {
                    doc.addFileToVFS('Sarabun-Bold.ttf', fontBoldBase64);
                    doc.addFont('Sarabun-Bold.ttf', 'Sarabun', 'bold');
                } else {
                    doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'bold'); // fallback
                }
                fontName = 'Sarabun'; 
            } catch (e) {
                console.warn("ไม่สามารถโหลดฟอนต์ได้:", e);
            } 
        }
        
        // Sync table DOM with current toggle state before reading
        if (typeof generatePolicyTableData === 'function') generatePolicyTableData();

        const d = lastCalculationData;
        const tableRows = [];
        const trs = document.querySelectorAll('#policyTableBody tr');
        const toggleBreakeven = document.getElementById('toggleBreakeven');
        const showBreakeven = toggleBreakeven ? toggleBreakeven.checked : false;
        
        let beRowIndex = -1; 
        let beAgeStr = '', beYearStr = '', beCVStr = ''; 
        
        const currentPlan = typeof currentAppPlan !== 'undefined' ? currentAppPlan : "";
        const isSurrenderActive = document.getElementById('toggleSurrender')?.checked || false;

        // อ่าน Header จาก DOM thead โดยตรง — สะท้อนทุกสถานะ (เวนคืน, จุดคุ้มทุน, ทุนประกัน ฯลฯ)
        const headRow = [];
        document.querySelectorAll('#policyTableHead th').forEach(th => {
            headRow.push(th.innerText.trim());
        });
        if (headRow.length === 0) headRow.push('อายุ', 'ออมเงิน', 'ออมสะสม', 'เงินสดพร้อมใช้');

        // index ของ "เงินสดพร้อมใช้" สำหรับจุดคุ้มทุน — ไม่ hardcode ตำแหน่ง
        const cvColIndex = headRow.indexOf('เงินสดพร้อมใช้');

        // เตรียมข้อมูล Body — อ่านจาก DOM ตรงๆ เสมอ
        trs.forEach((tr, index) => {
            const tds = tr.querySelectorAll('td');
            const rowData = [];
            tds.forEach(td => rowData.push(td.innerText.trim()));
            tableRows.push(rowData);

            if (tr.id === 'breakevenRow') {
                beRowIndex = index;
                beAgeStr = rowData[0];
                beYearStr = parseInt(beAgeStr) - parseInt(d.age || 0);
                beCVStr = cvColIndex >= 0 ? (rowData[cvColIndex] || '') : '';
            }
        });
        
        doc.autoTable({
            startY: (showBreakeven && beRowIndex !== -1) ? 40 : 34,
            head: [headRow],
            body: tableRows,
            theme: 'plain',
            margin: { top: 34, bottom: 15, left: 15, right: 15 },
            styles: { font: fontName, fontSize: 12, halign: 'center', valign: 'middle', cellPadding: 1.5, minCellHeight: 4.8 },
            headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: 'bold', lineWidth: 0 },
            bodyStyles: { textColor: [71, 85, 105], lineWidth: { top: 0, bottom: 0.1, left: 0, right: 0 }, lineColor: [241, 245, 249] },
            didParseCell: function(data) {
                if (showBreakeven && beRowIndex !== -1 && data.row.index === beRowIndex) {
                    data.cell.styles.fillColor = [209, 250, 229];
                    data.cell.styles.textColor = [6, 95, 70];
                    data.cell.styles.fontStyle = 'bold';
                }
            },
            didDrawPage: function (data) { 
                doc.setFillColor(36, 60, 148); 
                doc.rect(0, 0, 210, 20, 'F'); 
                doc.setFont(fontName, 'normal'); doc.setFontSize(18); doc.setTextColor(255, 255, 255); 
                doc.text(currentPlan, 105, 13, { align: 'center' }); 
                
                const formatN = typeof formatNum === 'function' ? formatNum : (n) => n;
                let sumDisplay = (d.sum % 1000000 === 0 && d.sum >= 1000000) ? (d.sum/1000000)+' ล้านบาท' : formatN(d.sum)+' บาท';
                
                const planAbbr = typeof getPlanAbbr === 'function' ? getPlanAbbr(currentPlan) : currentPlan;
                const surrenderNote = isSurrenderActive ? ' | ทยอยเวนคืน' : '';
                doc.setFontSize(14); doc.setTextColor(30, 58, 138);
                doc.text(`${planAbbr} ${d.gender || ''} ${d.age || ''} ทุน ${sumDisplay}${surrenderNote}`, 105, 28, { align: 'center' });
                
                if (data.pageNumber === 1 && showBreakeven && beRowIndex !== -1) { 
                    doc.setFont(fontName, 'normal'); doc.setFontSize(13); doc.setTextColor(6, 95, 70); 
                    doc.text(`● จุดคุ้มทุน: ปีที่ ${beYearStr} (อายุ ${beAgeStr} ปี) | เงินสดพร้อมใช้: ${beCVStr} บาท`, 105, 35, { align: 'center' }); 
                } 
            } 
        });
        
        const pageCount = doc.internal.getNumberOfPages(); 
        doc.setFont(fontName, 'normal'); doc.setFontSize(10);
        for (let i = 1; i <= pageCount; i++) { 
            doc.setPage(i); 
            doc.setDrawColor(226, 232, 240); doc.line(15, 285, 195, 285); 
            doc.setTextColor(148, 163, 184); doc.text(`หน้า ${i} / ${pageCount}`, 195, 290, { align: 'right' }); 
        }

        const _gTh = (d.gender === 'male' || (d.gender || '').includes('ชาย')) ? 'ชาย' : 'หญิง';
        const pdfFileName = `ตารางมูลค่า ${currentAppPlan || currentPlan} ${_gTh} ${d.age}ปี.pdf`;
        
        // ===== ACTION HANDLING =====
        // LIFF/LINE in-app: ใช้ inline PDF viewer (PDF.js) — ไม่ต้องออก app เลย
        // External browser: window.open / doc.save() ตามปกติ

        const pdfBlob = doc.output('blob');
        const pdfFile = new File([pdfBlob], pdfFileName, { type: 'application/pdf' });
        const inLine = isInLineApp();
        const shareTitle = `ตารางมูลค่า ${planAbbr}`;
        const planLabel = `${planAbbr} ${d.gender || ''} ${d.age || ''}`.trim();

        if (actionType === 'preview') {
            // ใช้ inline viewer ทุก device — ไม่ติดปัญหา popup blocker หรือ blob URL
            await showPdfViewer(pdfBlob, pdfFileName, planLabel);

        } else if (actionType === 'save') {
            if (inLine) {
                // LIFF: navigator.share มักไม่รองรับ files — เปิด viewer ตรงเลย user กดบันทึก/แชร์ในนั้น
                console.log('[LIFF] save → showPdfViewer (in-app)');
                await showPdfViewer(pdfBlob, pdfFileName, planLabel);
            } else {
                // Browser ปกติ: ลอง Web Share ก่อน (มือถือ), ถ้าไม่ได้ → download ตรง
                const shared = await tryShareFile(pdfFile, shareTitle, shareTitle);
                if (!shared) doc.save(pdfFileName);
            }

        } else if (actionType === 'print') {
            if (inLine) {
                // LIFF: พิมพ์ตรงไม่ได้ — แจ้ง user แล้วเปิด viewer ให้บันทึกแทน
                console.log('[LIFF] print → save fallback');
                Swal.fire({
                    icon: 'info',
                    title: 'LINE ไม่รองรับการพิมพ์โดยตรง',
                    text: 'กำลังเปิดตัวอย่าง — กรุณาบันทึกรูปภาพแล้วพิมพ์จากแอป Photos',
                    timer: 2400,
                    showConfirmButton: false
                });
                setTimeout(() => showPdfViewer(pdfBlob, pdfFileName, planLabel), 1200);
            } else {
                doc.autoPrint();
                window.open(doc.output('bloburl'), '_blank');
            }

        } else if (actionType === 'line') {
            if (inLine
                && typeof liff !== 'undefined'
                && typeof liff.isApiAvailable === 'function'
                && liff.isApiAvailable('shareTargetPicker')) {
                // LIFF: ส่งข้อความสรุปผ่าน shareTargetPicker (LINE ไม่รับไฟล์ PDF ผ่าน LIFF)
                console.log('[LIFF] line → shareTargetPicker (text summary)');
                try {
                    const summary = (typeof generateShortShareText === 'function')
                        ? generateShortShareText()
                        : `${planLabel}\n${shareTitle}`;
                    const text = `${summary}\n\n📄 ${pdfFileName}`;
                    const ret = await liff.shareTargetPicker([{ type: 'text', text }]);
                    if (ret) {
                        Swal.fire({ icon: 'success', title: 'ส่งข้อความแล้ว', timer: 1200, showConfirmButton: false });
                    }
                } catch (err) {
                    console.warn('[LIFF] shareTargetPicker failed:', err);
                    await showPdfViewer(pdfBlob, pdfFileName, planLabel);
                }
            } else {
                // Browser ปกติ: ลอง share ไฟล์ก่อน
                const shared = await tryShareFile(pdfFile, shareTitle, shareTitle);
                if (!shared) window.open(doc.output('bloburl'), '_blank');
            }

        } else if (actionType === 'messenger') {
            const shared = await tryShareFile(pdfFile, shareTitle, shareTitle);
            if (!shared) window.open(doc.output('bloburl'), '_blank');

        } else if (actionType === 'modal') {
            await _showTableShareModal(pdfBlob, pdfFile, doc, d);
        }
    } catch (error) { 
        // 4. แสดง Error ที่แท้จริงออกมาในหน้าต่าง (และ Console)
        console.error("PDF Generation Error details:", error);
        if(typeof showCustomError === 'function') {
            // เพิ่มการพิมพ์ error.message ต่อท้าย เพื่อให้รู้ว่าพังที่บรรทัดไหน/เรื่องอะไร
            showCustomError(`เกิดข้อผิดพลาดในการสร้าง PDF: ${error.message}`); 
        }
    } finally { 
        if (toast && toast.parentNode) toast.remove(); 
    }
}

// ============================================================================
// 📤 NAV SHARE — จับภาพตารางความละเอียดสูง → viewer + share/save
// ============================================================================

// ── จับภาพ full table (scroll content ทั้งหมด) ──
async function _captureTableHighRes() {
    if (typeof html2canvas !== 'function') throw new Error('html2canvas not loaded');

    // clone ทั้ง table รวม header + breakevenSummary + surrenderContainer
    const temp = document.createElement('div');
    temp.style.cssText = [
        'position:fixed', 'left:-9999px', 'top:0', 'z-index:-1',
        'background:#ffffff', 'padding:12px',
        'width:' + (window.innerWidth || 390) + 'px',
        'box-sizing:border-box',
    ].join(';');

    // header title
    const hdr = document.getElementById('tableHeaderTitle');
    if (hdr) {
        const hw = document.createElement('div');
        hw.style.cssText = 'background:#f1f5f9;border-radius:10px;padding:8px 10px;margin-bottom:8px;';
        hw.appendChild(hdr.cloneNode(true));
        temp.appendChild(hw);
    }

    // breakeven summary (ถ้าแสดงอยู่)
    const be = document.getElementById('breakevenSummary');
    if (be && !be.classList.contains('hidden') && be.innerHTML.trim()) {
        temp.appendChild(be.cloneNode(true));
    }

    // surrender/toggle row (ถ้าแสดงอยู่)
    const sc = document.getElementById('surrenderContainer');
    if (sc && !sc.classList.contains('hidden') && sc.innerHTML.trim()) {
        temp.appendChild(sc.cloneNode(true));
    }

    // table เต็ม (ไม่ผ่าน scroll wrapper)
    const tbl = document.querySelector('#pdfTableTarget table');
    if (!tbl) throw new Error('table element not found');
    const tblClone = tbl.cloneNode(true);
    tblClone.style.cssText = 'width:100%;border-collapse:collapse;';
    // ลบ sticky thead เพื่อให้ clone render ถูก
    const stickyHead = tblClone.querySelector('thead');
    if (stickyHead) { stickyHead.style.position = 'relative'; stickyHead.style.top = 'auto'; }
    temp.appendChild(tblClone);

    document.body.appendChild(temp);

    try {
        const scale = Math.max(2, window.devicePixelRatio || 2);
        const canvas = await html2canvas(temp, {
            scale,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            removeContainer: false,
        });
        const blob = await new Promise((res, rej) =>
            canvas.toBlob(b => b ? res(b) : rej(new Error('toBlob null')), 'image/png')
        );
        return { blob, canvas };
    } finally {
        temp.remove();
    }
}

// ── full-screen image viewer พร้อม pinch-zoom + share/save ──
function _showTableImageViewer(blob, imgName) {
    const existing = document.getElementById('_tableImgViewer');
    if (existing) existing.remove();

    const blobUrl = URL.createObjectURL(blob);
    const inLine  = isInLineApp();
    const hasSharePicker = inLine && _liffApi('shareTargetPicker');
    const canWebShare = !!(navigator.share);

    const viewer = document.createElement('div');
    viewer.id = '_tableImgViewer';
    viewer.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:99998',
        'background:#0f172a',
        'display:flex', 'flex-direction:column',
        'padding-top:max(12px,env(safe-area-inset-top))',
        'padding-bottom:max(12px,env(safe-area-inset-bottom))',
    ].join(';');

    viewer.innerHTML = `
        <!-- top bar -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 12px;flex-shrink:0;">
            <button id="_tvClose" style="width:38px;height:38px;background:rgba(255,255,255,0.12);border:none;border-radius:50%;color:white;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;">
                <i class="fas fa-times"></i>
            </button>
            <span style="color:white;font-size:13px;font-weight:700;opacity:0.7;">${imgName.replace('.png','')}</span>
            <button id="_tvShareBtn" style="height:36px;padding:0 14px;background:#3b82f6;border:none;border-radius:20px;color:white;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;">
                <i class="fas fa-share-alt"></i> แชร์
            </button>
        </div>

        <!-- image scroll area -->
        <div id="_tvScroll" style="flex:1;overflow:auto;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y;display:flex;align-items:flex-start;justify-content:center;padding:8px;">
            <img id="_tvImg" src="${blobUrl}" alt="table"
                style="display:block;max-width:100%;height:auto;border-radius:8px;box-shadow:0 4px 24px rgba(0,0,0,0.6);transform-origin:top center;
                       -webkit-touch-callout:default;-webkit-user-select:auto;user-select:auto;pointer-events:auto;" />
        </div>

        <!-- hint -->
        <div id="_tvHint" style="text-align:center;padding:6px 16px 2px;flex-shrink:0;color:rgba(255,255,255,0.5);font-size:11px;font-weight:600;">
            <i class="fas fa-hand-pointer" style="margin-right:4px;"></i>กดค้างที่ภาพ → บันทึกภาพ &nbsp;|&nbsp; <i class="fas fa-search-plus" style="margin-right:4px;"></i>Pinch ซูมได้
        </div>

        <!-- bottom action bar -->
        <div style="display:flex;gap:10px;padding:10px 16px;flex-shrink:0;">
            <button id="_tvLine" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;background:rgba(6,199,85,0.15);border:1.5px solid #06c755;border-radius:16px;cursor:pointer;">
                <i class="fab fa-line" style="color:#06c755;font-size:22px;"></i>
                <span style="color:#06c755;font-size:11px;font-weight:700;">LINE</span>
            </button>
            <button id="_tvMsgr" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;background:rgba(0,132,255,0.15);border:1.5px solid #0084ff;border-radius:16px;cursor:pointer;">
                <i class="fab fa-facebook-messenger" style="color:#0084ff;font-size:22px;"></i>
                <span style="color:#0084ff;font-size:11px;font-weight:700;">Messenger</span>
            </button>
            <button id="_tvSave" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;background:rgba(255,255,255,0.1);border:1.5px solid rgba(255,255,255,0.3);border-radius:16px;cursor:pointer;">
                <i class="fas fa-download" style="color:white;font-size:22px;"></i>
                <span style="color:white;font-size:11px;font-weight:700;">บันทึก</span>
            </button>
        </div>
    `;
    document.body.appendChild(viewer);

    // block contextmenu global blocker สำหรับรูป
    const img = document.getElementById('_tvImg');
    if (img) img.addEventListener('contextmenu', e => e.stopPropagation(), true);

    // close
    const closeViewer = () => {
        viewer.remove();
        try { URL.revokeObjectURL(blobUrl); } catch {}
    };
    document.getElementById('_tvClose').addEventListener('click', closeViewer);

    // pinch-zoom ด้วย CSS transform scale
    let scale = 1, startDist = 0, startScale = 1;
    const scroll = document.getElementById('_tvScroll');
    if (scroll) {
        scroll.addEventListener('touchstart', e => {
            if (e.touches.length === 2) {
                startDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                startScale = scale;
                e.preventDefault();
            }
        }, { passive: false });
        scroll.addEventListener('touchmove', e => {
            if (e.touches.length === 2 && startDist > 0) {
                const d = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                scale = Math.min(5, Math.max(1, startScale * (d / startDist)));
                if (img) img.style.transform = `scale(${scale})`;
                e.preventDefault();
            }
        }, { passive: false });
        scroll.addEventListener('touchend', e => {
            if (e.touches.length < 2) startDist = 0;
        });
        // double tap reset zoom
        let lastTap = 0;
        scroll.addEventListener('touchend', e => {
            const now = Date.now();
            if (now - lastTap < 300) { scale = 1; if (img) img.style.transform = 'scale(1)'; }
            lastTap = now;
        });
    }

    // ── share helper ──
    async function _doShare() {
        const imgFile = (typeof File !== 'undefined') ? new File([blob], imgName, { type: 'image/png' }) : null;
        if (imgFile && navigator.share && (!navigator.canShare || navigator.canShare({ files: [imgFile] }))) {
            try {
                await navigator.share({ files: [imgFile], title: imgName });
                _showQuickToast('แชร์สำเร็จ');
                return;
            } catch (err) {
                if (err && err.name === 'AbortError') return;
            }
        }
        // fallback: แจ้งกดค้าง
        _showQuickToast('กดค้างที่ภาพ → เลือก "บันทึกภาพ"');
    }

    async function _doSave() {
        const imgFile = (typeof File !== 'undefined') ? new File([blob], imgName, { type: 'image/png' }) : null;
        // ลอง Web Share (iOS รองรับ "Save to Photos" ใน share sheet)
        if (imgFile && navigator.share && (!navigator.canShare || navigator.canShare({ files: [imgFile] }))) {
            try {
                await navigator.share({ files: [imgFile], title: imgName });
                _showQuickToast('บันทึกสำเร็จ');
                return;
            } catch (err) {
                if (err && err.name === 'AbortError') return;
            }
        }
        // ลอง <a download> (browser ปกติ)
        try {
            const u = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = u; a.download = imgName; a.click();
            setTimeout(() => URL.revokeObjectURL(u), 5000);
            _showQuickToast('กำลังดาวน์โหลด...');
            return;
        } catch (_) {}
        // สุดท้าย: กดค้าง
        _showQuickToast('กดค้างที่ภาพ → เลือก "บันทึกภาพ"');
    }

    async function _doLineLiff() {
        // LIFF: ส่งสรุปข้อความ + แจ้งให้กดค้างบันทึกภาพ
        _showQuickToast('กดค้างที่ภาพ → บันทึก → เปิดแชท LINE แนบรูป');
        if (hasSharePicker) {
            try {
                const summary = typeof generateShortShareText === 'function' ? generateShortShareText() : imgName;
                await liff.shareTargetPicker([{ type: 'text', text: summary }]);
            } catch (_) {}
        }
    }

    async function _doMessenger() {
        // บันทึกรูปก่อน แล้วเปิด Messenger พร้อมแจ้งให้แนบรูป
        const imgFile = (typeof File !== 'undefined') ? new File([blob], imgName, { type: 'image/png' }) : null;
        // ลอง Web Share ก่อน (iOS จะมี Messenger ใน share sheet ถ้าติดตั้งไว้)
        if (imgFile && navigator.share && (!navigator.canShare || navigator.canShare({ files: [imgFile] }))) {
            try {
                await navigator.share({ files: [imgFile], title: imgName });
                _showQuickToast('แชร์สำเร็จ');
                return;
            } catch (err) {
                if (err && err.name === 'AbortError') return;
            }
        }
        // Fallback: ดาวน์โหลดรูป แล้วเปิด Messenger ให้แนบเอง
        try {
            const u = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = u; a.download = imgName; a.click();
            setTimeout(() => URL.revokeObjectURL(u), 5000);
        } catch (_) {}
        setTimeout(() => {
            window.open('fb-messenger://', '_blank');
        }, 600);
        _showQuickToast('บันทึกรูปแล้ว → แนบรูปใน Messenger ได้เลย');
    }

    document.getElementById('_tvShareBtn').addEventListener('click', _doShare);
    document.getElementById('_tvLine').addEventListener('click', async () => {
        if (inLine) { _doLineLiff(); } else { await _doShare(); }
    });
    document.getElementById('_tvMsgr').addEventListener('click', _doMessenger);
    document.getElementById('_tvSave').addEventListener('click', _doSave);
}

window.navShareAction = async function() {
    if (!lastCalculationData || lastCalculationData.premium === 0) {
        showCustomError('กรุณาคำนวณเบี้ยประกันก่อน');
        return;
    }

    // loading overlay
    const loadingEl = document.createElement('div');
    loadingEl.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,0.7);display:flex;align-items:center;justify-content:center;';
    loadingEl.innerHTML = `<div style="background:white;border-radius:20px;padding:28px 36px;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,0.4);">
        <i class="fas fa-spinner fa-spin" style="font-size:32px;color:#3b82f6;display:block;margin-bottom:12px;"></i>
        <span style="font-size:14px;font-weight:700;color:#1e293b;">กำลังเตรียมภาพ...</span>
    </div>`;
    document.body.appendChild(loadingEl);

    let blob = null;
    try {
        const result = await _captureTableHighRes();
        blob = result.blob;
    } catch (err) {
        loadingEl.remove();
        console.error('[navShare] capture failed:', err);
        showCustomError('ไม่สามารถสร้างภาพได้: ' + (err.message || err));
        return;
    }

    loadingEl.remove();

    const planAbbr = typeof getPlanAbbr === 'function' ? getPlanAbbr(currentAppPlan) : (currentAppPlan || 'insurance');
    const imgName = `${planAbbr}_ตารางมูลค่า.png`;
    _showTableImageViewer(blob, imgName);
};

// ============================================================================
// 🌟 ONLOAD INITIALIZATION (เชื่อมระบบเดิมทั้งหมด + เปิดหน้าแรก) 🌟
// ============================================================================
window.onload = async () => {
    // watch swal2-shown บน body เพื่อซ่อน/แสดง profile bar

    // แสดงเมนู 11 แผนก่อนเลย ไม่รอโหลด
    if (typeof openPlanModal === 'function') openPlanModal();

    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
    const oldCompare = document.getElementById('comparePanelView');
    if (oldCompare) oldCompare.remove();
    if (typeof applyDayColorTheme === 'function') applyDayColorTheme();
    
    document.querySelectorAll('button[onclick^="closePopup"]').forEach(btn => {
        const card = btn.closest('.modal-content-card');
        if (card) {
            card.classList.add('relative');
            btn.className = `absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full transition-all text-[16px] font-bold shadow-md active:scale-90 z-[100] bg-red-100 text-red-600 border border-red-200 hover:bg-red-200`;
            btn.innerHTML = '<i class="fas fa-times"></i>';
        }
    });
    
    const installBtn = document.querySelector('button[onclick*="installmentModal"]');
    if (installBtn) {
        installBtn.removeAttribute('onclick');
        installBtn.addEventListener('click', typeof openInstallmentModal === 'function' ? openInstallmentModal : null);
    }
    
    const sumInput = document.getElementById('sumInsuredInput');
    if (sumInput) sumInput.addEventListener('blur', () => { validateInputMinimum(sumInput, 'sum'); calculate('sum', true); });
    const premInput = document.getElementById('premiumInput');
    if (premInput) premInput.addEventListener('blur', () => { validateInputMinimum(premInput, 'premium'); calculate('premium', true); });
    const cfInput = document.getElementById('cashFlowInput');
    if (cfInput) cfInput.addEventListener('blur', () => calculate('cashflow', true));
    const cfInput1 = document.getElementById('cashFlowInput1');
    if (cfInput1) cfInput1.addEventListener('blur', () => calculate('cashflow1', true));
    const cfInput2 = document.getElementById('cashFlowInput2');
    if (cfInput2) cfInput2.addEventListener('blur', () => calculate('cashflow2', true));
    const ageInput = document.getElementById('ageInput');
    if (ageInput) ageInput.addEventListener('blur', () => forceAgeValidation());

    if (typeof setupLongPress === 'function') setupLongPress(); 
    if (typeof setupScrollHideNav === 'function') setupScrollHideNav();

    if (typeof loadAllProductConditions === 'function') await loadAllProductConditions();
    if (typeof loadAllRates === 'function') await loadAllRates();

    if (typeof setGender === 'function') setGender('male');
    fitHeaderTitle();
};

document.addEventListener('input', function(e) {
    if(e.target.id === 'cashFlowInput1' || e.target.id === 'cashFlowInput2' || e.target.id === 'cashFlowInput') {
        if(typeof highlightActivePills === 'function') highlightActivePills();
    }
});

window.openTableFromModal = function() {
    if (currentAppPlan === '3D Health Excellence') {
        if (typeof closePopup === 'function') { closePopup('resultModal'); closePopup('slbResultModal'); }
        setTimeout(() => window.open3DDetailsView(), 300);
        return;
    }
    if (typeof closePopup === 'function') closePopup('resultModal');
    setTimeout(() => {
        if (typeof switchView === 'function') switchView('table');
    }, 300);
};

window.open3DDetailsView = function() {
    // ปิด popup ที่อาจบังอยู่ก่อน
    if (typeof closePopup === 'function') { closePopup('resultModal'); closePopup('slbResultModal'); }
    document.body.setAttribute('data-view', 'table');
    const isWide = window.isWideLayout();
    const container = isWide ? document.getElementById('rightPane') : document.body;

    if (isWide && typeof _unmountViewsFromRightPane === 'function') _unmountViewsFromRightPane();

    let view = document.getElementById('threeDDetailsRightView');
    if (!view) {
        view = document.createElement('div');
        view.id = 'threeDDetailsRightView';
    }
    // wide: absolute ใน rightPane / mobile: fixed เต็มจอ
    view.style.cssText = isWide
        ? 'display:flex;flex-direction:column;position:absolute;inset:0;z-index:10;overflow:hidden;background:linear-gradient(160deg,#f0f9ff 0%,#f8fafc 100%);'
        : 'display:flex;flex-direction:column;position:fixed;inset:0;z-index:9500;overflow:hidden;background:linear-gradient(160deg,#f0f9ff 0%,#f8fafc 100%);padding-top:env(safe-area-inset-top);';

    view.innerHTML = `
    <div style="background:linear-gradient(135deg,#0d9488,#0284c7);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;color:white;font-size:16px;border:1px solid rgba(255,255,255,0.3);">
                <i class="fas fa-shield-heart"></i>
            </div>
            <div>
                <div style="font-size:15px;font-weight:700;color:white;line-height:1.2;">รายละเอียดความคุ้มครอง</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.8);margin-top:2px;">19 หมวด · 3D Health Excellence</div>
            </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
            <button onclick="window.open3DShareModal()" aria-label="แชร์" title="แชร์" style="padding:6px 12px;border-radius:10px;background:rgba(255,255,255,0.95);border:none;color:#0d9488;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px;line-height:1;"><i class="fas fa-share-nodes"></i> แชร์</button>
            <button onclick="window.close3DDetailsRightView()" style="width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.2);border:none;color:white;font-size:20px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;">&times;</button>
        </div>
    </div>`;

    // ย้าย accordionBody จริงเข้า view (live DOM)
    const accordionBody = document.getElementById('threeDDetailsAccordionBody');
    if (accordionBody) {
        accordionBody.className = 'overflow-y-auto flex-1 custom-scrollbar';
        view.appendChild(accordionBody);
    }

    if (view.parentElement !== container) container.appendChild(view);

    if (isWide) {
        const placeholder = document.getElementById('canvasPlaceholder');
        if (placeholder) placeholder.style.display = 'none';
    }

    if (typeof window.render3DDetailsAccordion === 'function') window.render3DDetailsAccordion();
};

window.close3DDetailsRightView = function() {
    // คืน accordionBody กลับ modal ก่อนลบ view
    const accordionBody = document.getElementById('threeDDetailsAccordionBody');
    const modal = document.getElementById('threeDDetailsModal');
    if (accordionBody && modal && accordionBody.parentElement !== modal.querySelector('.modal-content-card')) {
        const modalCard = modal.querySelector('.modal-content-card');
        if (modalCard) modalCard.appendChild(accordionBody);
    }
    const view = document.getElementById('threeDDetailsRightView');
    if (view) view.remove();
    if (typeof window.resetRightPaneToPlaceholder === 'function') window.resetRightPaneToPlaceholder();
};

function sharePlan() { if (typeof openGenericShareModal === 'function') openGenericShareModal('summary'); }
function openBankModal() { if (typeof openPopup === 'function') openPopup('paymentModal'); }
function openEsubModal() { if (typeof openPopup === 'function') openPopup('eSubQniModal'); }

// ==================== 3D Health Excellence: Coverage Detail View ====================
window._3dOpenCats = new Set();
window.toggle3DCat = function(num) {
    if (window._3dOpenCats.has(num)) window._3dOpenCats.delete(num);
    else window._3dOpenCats.add(num);
    window.render3DDetailsAccordion();
};
window._3dSelectorOpen = (window._3dSelectorOpen !== false); // default open
window.toggle3DSelector = function() {
    window._3dSelectorOpen = !window._3dSelectorOpen;
    window.render3DDetailsAccordion();
};
window.set3DHX = function(opt) {
    window.currentHX = opt;
    if (typeof window.render3DOptionsUI === 'function') window.render3DOptionsUI();
    if (typeof calculate === 'function') calculate('sum', true);
    window.render3DDetailsAccordion();
};
window.set3DHXO = function(opt) {
    window.currentHXO = opt;
    if (typeof window.render3DOptionsUI === 'function') window.render3DOptionsUI();
    if (typeof calculate === 'function') calculate('sum', true);
    window.render3DDetailsAccordion();
};
window.set3DHXD = function(opt) {
    if (opt !== 'ไม่เลือก' && window.currentHXO === 'ไม่เลือก') window.currentHXO = 'HXO10';
    window.currentHXD = opt;
    if (typeof window.render3DOptionsUI === 'function') window.render3DOptionsUI();
    if (typeof calculate === 'function') calculate('sum', true);
    window.render3DDetailsAccordion();
};
window.set3DHBF = function(opt) {
    window.currentHBF = opt;
    if (typeof window.render3DOptionsUI === 'function') window.render3DOptionsUI();
    if (typeof calculate === 'function') calculate('sum', true);
    window.render3DDetailsAccordion();
};

window.render3DDetailsAccordion = function() {
    const body = document.getElementById('threeDDetailsAccordionBody');
    if (!body) return;

    const hxVal  = window.currentHX  || '';
    const hxoVal = window.currentHXO || 'ไม่เลือก';
    const hxdVal = window.currentHXD || 'ไม่เลือก';
    const hbfVal = window.currentHBF || 0;

    const hxOpts  = ['HX15','HX20','HX40','HX60','HX150','HX300'];
    const hxoOpts = ['HXO10','HXO20','HXO30','HXO50'];
    const hxdOpts = ['HXD100','HXD200','HXD500','HXD1000'];
    const DL = {
        'HXO10':'1,000','HXO20':'2,000','HXO30':'3,000','HXO50':'5,000',
        'HXD100':'10,000','HXD200':'20,000','HXD500':'50,000','HXD1000':'100,000',
    };

    const pillSel = 'py-1.5 text-[11px] font-bold text-teal-700 bg-white shadow rounded-xl border border-teal-200/60';
    const pillDef = 'py-1.5 text-[11px] font-medium text-slate-500 hover:bg-white/60 rounded-xl transition-all';

    // ── 1. Sticky header: HX pills + rider pills ─────────────────────────
    const selOpen = window._3dSelectorOpen !== false;
    const hxLabel = hxVal ? ((HX_PLAN_INFO[hxVal] && HX_PLAN_INFO[hxVal].room) || hxVal) : 'ยังไม่เลือก';
    const hxoLabel = hxoVal === 'ไม่เลือก' ? '–' : (DL[hxoVal]||hxoVal)+' บ./ครั้ง';
    const hxdLabel = hxdVal === 'ไม่เลือก' ? '–' : (DL[hxdVal]||hxdVal)+' บ./รอบ';
    const hbfNum = parseInt(hbfVal) || 0;
    const hbfLabel = hbfNum === 0 ? '–' : hbfNum.toLocaleString()+' บ./วัน';

    let stickyHtml = `<div class="sticky top-0 z-10 bg-white/97 backdrop-blur-sm border-b border-slate-100">`;

    // Collapsed bar — always visible
    stickyHtml += `<div class="flex items-center justify-between px-3 py-2 cursor-pointer" onclick="window.toggle3DSelector()">
        <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[11px] font-bold text-teal-600">${hxLabel}</span>
            ${hxoVal!=='ไม่เลือก'?`<span class="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full font-medium">HXO ${hxoLabel}</span>`:''}
            ${hxdVal!=='ไม่เลือก'?`<span class="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">HXD ${hxdLabel}</span>`:''}
            ${hbfNum>0?`<span class="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full font-medium">HBF ${hbfLabel}</span>`:''}
        </div>
        <span class="text-[10px] text-slate-400 font-medium flex items-center gap-1 shrink-0">
            ${selOpen ? 'ซ่อน' : 'ตัวเลือก'}<i class="fas fa-chevron-${selOpen?'up':'down'} text-[9px]"></i>
        </span>
    </div>`;

    if (selOpen) {
        stickyHtml += `<div class="px-3 pb-2.5 space-y-2 border-t border-slate-100 pt-2">`;

        // HX plan
        stickyHtml += `<div><p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">แผนค่าห้อง (HX)</p>
            <div class="bg-slate-100 p-1 rounded-2xl grid grid-cols-6 gap-1">`;
        hxOpts.forEach(opt => {
            const lbl = (HX_PLAN_INFO[opt] && HX_PLAN_INFO[opt].room) || opt;
            stickyHtml += `<button onclick="window.set3DHX('${opt}')" class="${opt===hxVal?pillSel:pillDef}">${lbl}</button>`;
        });
        stickyHtml += `</div></div>`;

        if (hxVal) {
            // HXO
            stickyHtml += `<div><p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">OPD Extra (HXO) <span class="text-teal-500">${hxoVal==='ไม่เลือก'?'–':DL[hxoVal]+' บ./ครั้ง'}</span></p>
                <div class="bg-slate-100 p-1 rounded-2xl grid grid-cols-4 gap-1">`;
            hxoOpts.forEach(opt => {
                const lbl = 'HXO'+opt.replace('HXO','');
                stickyHtml += `<button onclick="window.set3DHXO('${opt}')" class="${opt===hxoVal?pillSel:pillDef}">${lbl}</button>`;
            });
            stickyHtml += `</div></div>`;

            // HXD
            stickyHtml += `<div><p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Advance (HXD) <span class="text-indigo-500">${hxdVal==='ไม่เลือก'?'–':DL[hxdVal]+' บ./รอบ'}</span></p>
                <div class="bg-slate-100 p-1 rounded-2xl grid grid-cols-4 gap-1">`;
            hxdOpts.forEach(opt => {
                const lbl = 'HXD'+opt.replace('HXD','');
                stickyHtml += `<button onclick="window.set3DHXD('${opt}')" class="${opt===hxdVal?pillSel:pillDef}">${lbl}</button>`;
            });
            stickyHtml += `</div></div>`;

            // HBF compact pill grid + stepper
            {
                const _hp = [0,500,1000,2000,3000,5000];
                const _hl = ['ปิด','500','1K','2K','3K','5K'];
                stickyHtml += `<div><p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">ชดเชยรายวัน (HBF) <span class="text-rose-500">${hbfNum===0?'ปิด':hbfNum.toLocaleString()+' บ./วัน'}</span></p>
                    <div class="bg-slate-100 p-1 rounded-2xl grid grid-cols-6 gap-1 mb-1.5">`;
                _hp.forEach((v,i) => {
                    stickyHtml += `<button onclick="window.set3DHBF(${v})" class="${v===hbfNum?pillSel:pillDef}">${_hl[i]}</button>`;
                });
                stickyHtml += `</div>`;
                stickyHtml += `<div class="flex items-center gap-1 mt-1">
                    <button ontouchstart="window._hbfInterval=setInterval(()=>window.adjustHBF(-100),150)" ontouchend="clearInterval(window._hbfInterval)" onmousedown="window._hbfInterval=setInterval(()=>window.adjustHBF(-100),150)" onmouseup="clearInterval(window._hbfInterval)" onclick="window.adjustHBF(-100)" class="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center active:scale-90 active:bg-rose-100 active:text-rose-600 transition-all select-none touch-manipulation">−</button>
                    <div class="flex-1 text-center text-[12px] font-bold ${hbfNum===0?'text-slate-400':'text-rose-600'}">${hbfNum===0?'ปิด':hbfNum.toLocaleString()+' บ./วัน'}</div>
                    <button ontouchstart="window._hbfInterval=setInterval(()=>window.adjustHBF(100),150)" ontouchend="clearInterval(window._hbfInterval)" onmousedown="window._hbfInterval=setInterval(()=>window.adjustHBF(100),150)" onmouseup="clearInterval(window._hbfInterval)" onclick="window.adjustHBF(100)" class="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center active:scale-90 active:bg-rose-100 active:text-rose-600 transition-all select-none touch-manipulation">+</button>
                </div></div>`;
            }
        }
        stickyHtml += `</div>`;
    }
    stickyHtml += `</div>`;

    // ── 2. Content ────────────────────────────────────────────────────────
    let contentHtml = '';

    if (!hxVal || hxVal === 'ไม่เลือก') {
        contentHtml = `<div class="flex flex-col items-center justify-center py-16 text-center gap-3">
            <i class="fas fa-bed text-4xl text-slate-200 mb-1"></i>
            <p class="text-[13px] font-semibold text-slate-400">กรุณาเลือกแผน HX ด้านบน</p>
            <p class="text-[11px] text-slate-300">แตะเพื่อดูรายละเอียดความคุ้มครอง 19 หมวด</p>
        </div>`;
    } else {
        const planInfo = HX_PLAN_INFO[hxVal] || { room:'-', lump:'-', tier:'base' };
        const tier = planInfo.tier;

        // Plan info bar
        contentHtml += `<div class="px-3 pt-3">
            <div class="flex items-center justify-between p-3 bg-teal-50 rounded-2xl border border-teal-100 mb-3">
                <div class="flex items-center gap-2">
                    <i class="fas fa-bed text-teal-500"></i>
                    <span class="text-sm font-bold text-teal-800">${hxVal}</span>
                    <span class="text-[11px] text-teal-600">ค่าห้อง ${planInfo.room} บ./คืน</span>
                </div>
                <div class="text-right">
                    <span class="text-[10px] text-slate-400 block">วงเงินสูงสุด</span>
                    <span class="text-sm font-bold text-teal-700">${planInfo.lump}</span>
                </div>
            </div>
            <div class="flex items-center gap-2 p-2.5 bg-rose-50 rounded-xl border border-rose-100 mb-4">
                <i class="fas fa-heart-pulse text-rose-500 text-sm shrink-0"></i>
                <span class="text-[12px] font-bold text-rose-700">โรคร้ายแรง — รับวงเงินคุ้มครอง 2 เท่า</span>
            </div>`;

        // Category accordion rows
        const accRow = (num, title, limit, subs, condNote) => {
            const isOpen = window._3dOpenCats.has(num);
            const subHtml = isOpen && subs && subs.length
                ? `<div class="mt-2 space-y-1 pl-1">` +
                  subs.map(s=>`<p class="text-[11px] text-slate-500 leading-snug flex items-start gap-1.5"><i class="fas fa-circle text-[4px] text-slate-300 mt-1.5 shrink-0"></i>${s}</p>`).join('') +
                  (condNote ? `<p class="text-[10px] text-amber-600 italic mt-1.5 flex items-start gap-1"><i class="fas fa-clock text-[9px] mt-0.5 shrink-0"></i>${condNote}</p>` : '') +
                  `</div>` : '';
            return `<div class="border-b border-slate-100 py-2.5 cursor-pointer" onclick="window.toggle3DCat('${num}')">
                <div class="flex items-center gap-2.5">
                    <i class="fas fa-check-circle text-emerald-500 shrink-0 text-sm"></i>
                    <div class="flex-1 min-w-0">
                        <span class="text-[9px] font-bold text-slate-400 block leading-none mb-0.5">หมวด ${num}</span>
                        <span class="text-[13px] font-semibold text-slate-700 leading-snug">${title}</span>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <span class="text-[10px] text-slate-400 font-medium">${limit}</span>
                        <i class="fas fa-chevron-${isOpen?'up':'down'} text-[10px] text-slate-300"></i>
                    </div>
                </div>
                ${subHtml}
            </div>`;
        };

        // Dynamic subs with per-plan limits
        const dynSubs = {
            '02': [
                "2.1 ค่าบริการทางการแพทย์เพื่อการตรวจวินิจฉัย",
                "2.2 ค่าบำบัดรักษา ค่าบริการโลหิตและส่วนประกอบ ค่าบริการทางการพยาบาล",
                "2.3 ค่ายา ค่าสารอาหารทางหลอดเลือด และค่าเวชภัณฑ์",
                `2.4 ค่ายาและเวชภัณฑ์สิ้นเปลือง (เวชภัณฑ์ 1) สำหรับกลับบ้าน — ${HX_LIMITS['02.4'][hxVal]||'-'}`,
                "เหมาจ่าย ต่อรอบปีกรมธรรม์",
            ],
            '03': [
                `ค่าแพทย์ตรวจรักษา — ${HX_LIMITS['03'][hxVal]||'-'}`,
                "ต่อรอบปีกรมธรรม์",
            ],
            '06': [
                "6.1 ค่าตรวจวินิจฉัยที่เกี่ยวข้องภายใน 30 วันก่อน IPD และภายใน 90 วันหลัง IPD",
                `6.2 ค่ารักษา OPD ต่อเนื่องภายใน 45 วันหลัง IPD — ${HX_LIMITS['06.2'][hxVal]||'-'}`,
                "ต่อรอบปีกรมธรรม์ประกันภัย",
            ],
            '08': [
                "ค่าเวชศาสตร์ฟื้นฟูหลังการเข้าพักรักษาตัวเป็นผู้ป่วยในแต่ละครั้ง",
                `${HX_LIMITS['08'][hxVal]||'-'} ต่อรอบปีกรมธรรม์`,
            ],
        };

        // หมวด 1-13 (ทุกแผน)
        HX_BASE_CATEGORIES.forEach(cat => {
            const subs = dynSubs[cat.num] || _3D_BASE_SUBS[cat.num];
            const limit = cat.num === '03' ? (HX_LIMITS['03'][hxVal]||cat.limit)
                        : cat.num === '08' ? (HX_LIMITS['08'][hxVal]||cat.limit)
                        : cat.limit;
            contentHtml += accRow(cat.num, cat.title, limit, subs, null);
        });

        // หมวด 14-18 (mid + full)
        if (tier === 'mid' || tier === 'full') {
            [['14','m14'],['15','m15'],['16','m16'],['17','m17'],['18','m18']].forEach(([num, key]) => {
                const sec = SECTION_DATA[key]; if (!sec) return;
                const lim = (HX_LIMITS[num] && HX_LIMITS[num][hxVal]) ? HX_LIMITS[num][hxVal] : 'เหมาจ่าย';
                contentHtml += accRow(num, sec.title, lim, sec.items, sec.cond);
            });
        }

        // หมวด 19 (full only)
        if (tier === 'full') {
            const sec = SECTION_DATA['m19'];
            if (sec) {
                const dynItems = sec.items.map((item, i) => {
                    if (i === 0) return `${item} — ${HX_LIMITS['19.1'][hxVal]||'-'}`;
                    if (i === 1) return `${item} — ${HX_LIMITS['19.g2'][hxVal]||'-'}`;
                    if (i === 2) return `${item} — ${HX_LIMITS['19.2'][hxVal]||'-'}`;
                    if (i === 3) return `${item} — ${HX_LIMITS['19.g3'][hxVal]||'-'}`;
                    return item;
                });
                contentHtml += accRow('19', sec.title, 'เหมาจ่าย', dynItems, sec.cond);
            }
        }

        contentHtml += `</div>`;

        // tier badge
        const tierBadge = { base:'HX15–20 (13 หมวด)', mid:'HX40–60 (18 หมวด)', full:'HX150–300 (19 หมวด)' };
        contentHtml += `<div class="mx-3 mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <span class="text-[10px] text-slate-400">แผนนี้คุ้มครอง · </span>
            <span class="text-[10px] font-bold text-teal-600">${tierBadge[tier]||''}</span>
        </div>`;

        // HXO section
        if (hxoVal !== 'ไม่เลือก') {
            contentHtml += `<div class="mx-3 mt-4 mb-1">
                <p class="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-2">สัญญาเพิ่มเติม HXO — ${DL[hxoVal]||hxoVal} บ./ครั้ง</p>
                <div class="space-y-0">`;
            [
                { num:'HXO-1', title:'ความคุ้มครองผู้ป่วยนอก (OPD)', limit:'สูงสุด 30 ครั้ง/รอบปี' },
                { num:'HXO-2', title:'ความคุ้มครองสุขภาพจิต (ค่าใช้จ่ายร่วม 20%)', limit:'สูงสุด 4 ครั้ง/รอบปี' },
                { num:'HXO-3', title:'ค่าตรวจรักษาทางทันตกรรม (ค่าใช้จ่ายร่วม 20%)', limit:'สูงสุด 2 ครั้ง/รอบปี' },
            ].forEach(r => {
                contentHtml += `<div class="border-b border-purple-50 py-2.5 flex items-center gap-2.5">
                    <i class="fas fa-check-circle text-purple-400 shrink-0 text-sm"></i>
                    <div class="flex-1 min-w-0">
                        <span class="text-[9px] font-bold text-purple-300 block leading-none mb-0.5">ข้อ ${r.num.replace('HXO-','')}</span>
                        <span class="text-[12px] font-medium text-slate-700">${r.title}</span>
                    </div>
                    <span class="text-[10px] text-purple-500 font-medium shrink-0">${r.limit}</span>
                </div>`;
            });
            contentHtml += `</div></div>`;
        }

        // HXD section
        if (hxdVal !== 'ไม่เลือก') {
            contentHtml += `<div class="mx-3 mt-4 mb-6">
                <p class="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2">สัญญาเพิ่มเติม HXD — ${DL[hxdVal]||hxdVal} บ./รอบ</p>
                <div class="space-y-0">`;
            [
                { num:'1', title:'ขยายวงเงินผู้ป่วยนอกเพื่อการตรวจวินิจฉัย', cond:'ระยะรอคอย 30 วัน' },
                { num:'2', title:'การตรวจสุขภาพประจำปีและค่าฉีดวัคซีน (ค่าใช้จ่ายร่วม 10%)', cond:'ระยะรอคอย 365 วัน' },
                { num:'3', title:'ความคุ้มครองพิเศษเพื่อรักษาโรคร้ายแรง (ตลอดชีวิต/ราย)', cond:'ระยะรอคอย 120 วัน' },
            ].forEach(r => {
                contentHtml += `<div class="border-b border-indigo-50 py-2.5 flex items-start gap-2.5">
                    <i class="fas fa-check-circle text-indigo-400 shrink-0 text-sm mt-0.5"></i>
                    <div class="flex-1 min-w-0">
                        <span class="text-[9px] font-bold text-indigo-300 block leading-none mb-0.5">ข้อ ${r.num}</span>
                        <span class="text-[12px] font-medium text-slate-700">${r.title}</span>
                        <p class="text-[10px] text-amber-500 mt-0.5"><i class="fas fa-clock text-[9px]"></i> ${r.cond}</p>
                    </div>
                </div>`;
            });
            contentHtml += `</div></div>`;
        } else {
            contentHtml += `<div class="mb-6"></div>`;
        }

        // HBF section
        if (hbfNum > 0) {
            const hbfAmt = hbfNum.toLocaleString();
            contentHtml += `<div class="mx-3 mt-4 mb-1">
                <p class="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2">สัญญาเพิ่มเติม HBF — ${hbfAmt} บ./วัน</p>
                <div class="space-y-0">`;
            [
                { num:'1', title:'ชดเชยรายวัน กรณีผู้ป่วยใน', limit:`${hbfAmt} บาท/วัน` },
                { num:'2', title:'ชดเชยรายวัน กรณีผู้ป่วย ICU', limit:`${hbfAmt} บาท/วัน` },
            ].forEach(r => {
                contentHtml += `<div class="border-b border-rose-50 py-2.5 flex items-center gap-2.5">
                    <i class="fas fa-check-circle text-rose-400 shrink-0 text-sm"></i>
                    <div class="flex-1 min-w-0">
                        <span class="text-[9px] font-bold text-rose-300 block leading-none mb-0.5">ข้อ ${r.num}</span>
                        <span class="text-[12px] font-medium text-slate-700">${r.title}</span>
                    </div>
                    <span class="text-[10px] text-rose-500 font-medium shrink-0">${r.limit}</span>
                </div>`;
            });
            contentHtml += `</div></div>`;
        }

        // TPD section
        const tpdSA3d = window.currentTPDEnabled ? (parseInt(window.currentTPDSA) || 0) : 0;
        if (tpdSA3d > 0) {
            const tpdSADisp = tpdSA3d.toLocaleString();
            contentHtml += `<div class="mx-3 mt-4 mb-6">
                <p class="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2">สัญญาเพิ่มเติม TPD — ทุน ${tpdSADisp} บาท</p>
                <div class="space-y-0">`;
            [
                { num:'1', title:'ทุพพลภาพถาวรสิ้นเชิง (อายุ < 71 ปี)', limit:`100% = ${tpdSADisp} บ.` },
                { num:'2', title:'ทุพพลภาพจากอุบัติเหตุขนส่งสาธารณะ (อายุ < 71 ปี)', limit:`200% = ${(tpdSA3d*2).toLocaleString()} บ.` },
                { num:'3', title:'ความบกพร่องต่อการดำรงชีวิตวัยสูงอายุ OAD (อายุ 71–100 ปี)', limit:`105% = ${Math.round(tpdSA3d*1.05).toLocaleString()} บ.` },
            ].forEach(r => {
                contentHtml += `<div class="border-b border-orange-50 py-2.5 flex items-start gap-2.5">
                    <i class="fas fa-person-cane text-orange-400 shrink-0 text-sm mt-0.5"></i>
                    <div class="flex-1 min-w-0">
                        <span class="text-[9px] font-bold text-orange-300 block leading-none mb-0.5">ข้อ ${r.num}</span>
                        <span class="text-[12px] font-medium text-slate-700">${r.title}</span>
                    </div>
                    <span class="text-[10px] text-orange-600 font-medium shrink-0 text-right max-w-[90px] leading-tight">${r.limit}</span>
                </div>`;
            });
            contentHtml += `</div>
                <div class="mt-2 p-2 bg-orange-50 rounded-xl border border-orange-100">
                    <p class="text-[10px] text-orange-700"><i class="fas fa-info-circle mr-1"></i>ระยะเวลาคุ้มครองต่อเนื่องไม่น้อยกว่า 180 วัน · อายุรับประกัน 31 วัน – 70 ปี · ชั้นอาชีพ 1, 2, 3</p>
                </div>
            </div>`;
        } else {
            contentHtml += `<div class="mb-6"></div>`;
        }
    }

    // ตัด selector sticky header ออก — left pane มี selector อยู่แล้ว
    body.innerHTML = contentHtml;
};
// ── พิมพ์ตาราง / บันทึก PDF ผ่าน window.print() — ทำงานใน LIFF iOS ได้ ──
window.printTable = function() {
    if (!lastCalculationData) return showCustomError('กรุณาคำนวณเบี้ยประกันก่อน');

    // สร้าง print area จาก header + table ปัจจุบัน
    const existing = document.getElementById('_printArea');
    if (existing) existing.remove();

    const area = document.createElement('div');
    area.id = '_printArea';
    area.style.cssText = 'position:absolute;left:-9999px;top:0;background:white;';

    const hdr = document.getElementById('tableHeaderTitle');
    if (hdr) {
        const hw = document.createElement('div');
        hw.style.cssText = 'margin-bottom:8px;font-size:10pt;font-weight:700;';
        hw.appendChild(hdr.cloneNode(true));
        area.appendChild(hw);
    }
    const be = document.getElementById('breakevenSummary');
    if (be && !be.classList.contains('hidden') && be.innerHTML.trim()) area.appendChild(be.cloneNode(true));
    const sc = document.getElementById('surrenderContainer');
    if (sc && !sc.classList.contains('hidden') && sc.innerHTML.trim()) area.appendChild(sc.cloneNode(true));
    const tbl = document.querySelector('#pdfTableTarget table');
    if (!tbl) return showCustomError('ไม่พบตาราง');
    const clone = tbl.cloneNode(true);
    clone.style.cssText = 'width:100%;border-collapse:collapse;';
    const stickyHead = clone.querySelector('thead');
    if (stickyHead) { stickyHead.style.position = 'relative'; stickyHead.style.top = 'auto'; }
    area.appendChild(clone);
    document.body.appendChild(area);

    // เรียก print — iOS จะแสดง AirPrint / Save as PDF dialog
    setTimeout(() => {
        window.print();
        setTimeout(() => area.remove(), 2000);
    }, 100);
};

// ════════════════════════════════════════════════
//  Share Modal — ส่งภาพ / PDF / พิมพ์ / ดาวน์โหลด
// ════════════════════════════════════════════════
async function _showTableShareModal(pdfBlob, pdfFile, doc, d, opts = {}) {
    const existing = document.getElementById('_tblShareModal');
    if (existing) existing.remove();

    // ── ชื่อไฟล์ตามรูปแบบ: แบบ_เพศ_อายุ_เบี้ย/ทุน (override ได้ผ่าน opts.cleanName) ──
    let cleanName;
    if (opts.cleanName) {
        cleanName = opts.cleanName;
    } else {
        const planFullName = currentAppPlan || '';
        const genderTh = (d.gender === 'male' || (d.gender || '').includes('ชาย')) ? 'ชาย' : 'หญิง';
        const isSum = typeof currentMode !== 'undefined' && currentMode === 'sum';
        const rawAmt  = isSum ? (d.sum || 0) : (d.premium || 0);
        const amtFmt  = rawAmt >= 1000000
            ? (rawAmt / 1000000).toFixed(2).replace(/\.?0+$/, '') + 'ล้าน'
            : rawAmt.toLocaleString('th-TH');
        const amtLabel = isSum ? 'ทุน' : 'เบี้ย';
        cleanName = `${planFullName} ${genderTh} ${d.age}ปี ${amtLabel} ${amtFmt}`;
    }
    const pdfName   = cleanName + '.pdf';
    const jpgName   = cleanName + '.jpg';

    // ── Blob URL สำหรับ preview / print ──
    const blobUrl = URL.createObjectURL(pdfBlob);

    // ── Overlay ──
    const overlay = document.createElement('div');
    overlay.id = '_tblShareModal';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99995;display:flex;align-items:flex-end;';
    overlay.innerHTML = `
      <div id="_tblShareBg" style="position:absolute;inset:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(4px);"></div>
      <div style="position:relative;width:100%;background:#0f172a;border-radius:24px 24px 0 0;padding:18px 16px;padding-bottom:max(24px,env(safe-area-inset-bottom));z-index:1;">
        <div style="width:40px;height:4px;background:rgba(255,255,255,0.2);border-radius:2px;margin:0 auto 16px;"></div>
        <div style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:.08em;margin-bottom:4px;">ชื่อไฟล์</div>
        <div style="color:white;font-size:13px;font-weight:700;margin-bottom:18px;word-break:break-all;">${cleanName}</div>
        <div style="display:flex;flex-direction:column;gap:10px;" id="_tblShareBtns">
          <button data-action="image"
            style="width:100%;background:linear-gradient(135deg,#06c755,#059c44);border:none;border-radius:16px;color:white;padding:15px 16px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:12px;">
            <i class="fab fa-line" style="font-size:22px;flex-shrink:0;"></i>
            <div style="text-align:left;"><div>ส่งภาพ A4 ทาง LINE / แชร์</div><div style="font-size:11px;opacity:.75;font-weight:500;margin-top:2px;">แปลงเป็นภาพความละเอียดสูง — เปิด share sheet</div></div>
          </button>
          <button data-action="pdf"
            style="width:100%;background:linear-gradient(135deg,#3b82f6,#2563eb);border:none;border-radius:16px;color:white;padding:15px 16px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:12px;">
            <i class="fas fa-file-pdf" style="font-size:22px;flex-shrink:0;"></i>
            <div style="text-align:left;"><div>ส่ง PDF ทาง LINE / Facebook</div><div style="font-size:11px;opacity:.75;font-weight:500;margin-top:2px;">ส่งไฟล์ PDF ผ่าน share sheet — ไม่ต้องดาวน์โหลดก่อน</div></div>
          </button>
          <div style="display:flex;gap:10px;">
            <button data-action="print"
              style="flex:1;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:16px;color:white;padding:14px 8px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
              <i class="fas fa-print" style="color:#fbbf24;font-size:18px;"></i> พิมพ์
            </button>
            <button data-action="download"
              style="flex:1;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:16px;color:white;padding:14px 8px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
              <i class="fas fa-download" style="color:#60a5fa;font-size:18px;"></i> ดาวน์โหลด
            </button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('_tblShareBg').addEventListener('click', () => { overlay.remove(); URL.revokeObjectURL(blobUrl); });

    overlay.querySelector('[data-action="image"]').addEventListener('click', async () => {
        overlay.remove();
        await _shareTableAsImages(pdfBlob, jpgName);
        URL.revokeObjectURL(blobUrl);
    });

    overlay.querySelector('[data-action="pdf"]').addEventListener('click', async () => {
        overlay.remove();
        const canShare = navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] });
        if (canShare) {
            try { await navigator.share({ files: [pdfFile], title: pdfName }); }
            catch (e) { if (e.name !== 'AbortError') _fallbackDownload(pdfBlob, pdfName); }
        } else if (navigator.share) {
            try { await navigator.share({ title: pdfName, url: window.location.href }); }
            catch {}
        } else {
            _fallbackDownload(pdfBlob, pdfName);
        }
        URL.revokeObjectURL(blobUrl);
    });

    overlay.querySelector('[data-action="print"]').addEventListener('click', () => {
        overlay.remove();
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
        URL.revokeObjectURL(blobUrl);
    });

    overlay.querySelector('[data-action="download"]').addEventListener('click', () => {
        overlay.remove();
        _fallbackDownload(pdfBlob, pdfName);
        URL.revokeObjectURL(blobUrl);
    });
}

function _fallbackDownload(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(a.href); }, 500);
}

async function _shareTableAsImages(pdfBlob, jpgName) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;background:#1e293b;color:white;padding:20px 28px;border-radius:18px;font-size:13px;font-weight:700;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.4);';
    toast.innerHTML = '<i class="fas fa-spinner fa-spin" style="display:block;font-size:26px;margin-bottom:10px;color:#60a5fa;"></i>กำลังสร้างภาพ A4...';
    document.body.appendChild(toast);

    try {
        if (typeof pdfjsLib === 'undefined') throw new Error('pdfjsLib not loaded');
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const ab  = await pdfBlob.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: ab }).promise;

        // เรนเดอร์ทุกหน้า A4 @ 3× (≈ 2481 px wide — คมชัดพอพิมพ์ได้)
        const SCALE = 3;
        const files = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const vp   = page.getViewport({ scale: SCALE });
            const cv   = document.createElement('canvas');
            cv.width   = vp.width;
            cv.height  = vp.height;
            await page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
            const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.92));
            const name = pdf.numPages > 1 ? jpgName.replace('.jpg', `_หน้า${i}.jpg`) : jpgName;
            files.push(new File([blob], name, { type: 'image/jpeg' }));
        }
        toast.remove();

        if (navigator.share && navigator.canShare && navigator.canShare({ files })) {
            await navigator.share({ files, title: jpgName });
        } else if (navigator.share && navigator.canShare && navigator.canShare({ files: [files[0]] })) {
            // ส่งทีละภาพ (บางอุปกรณ์ไม่รองรับหลายไฟล์พร้อมกัน)
            for (const f of files) {
                try { await navigator.share({ files: [f], title: f.name }); } catch {}
            }
        } else {
            // Fallback: ดาวน์โหลดทุกภาพ
            for (const f of files) _fallbackDownload(f, f.name);
        }
    } catch (err) {
        toast.remove();
        showCustomError('ไม่สามารถสร้างภาพได้: ' + (err.message || err));
    }
}
