// ==================== HEC — Health Premium Extra (สัญญาเพิ่มเติมค่ารักษาพยาบาลและผ่าตัด) ====================
// สัญญาเพิ่มเติม HEC (เดิมชื่อ HPE) สำหรับแบบประกัน LPB / SLPA / CL
// ทำงานแบบ "ตารางสุขภาพแยกต่างหาก" (เหมือน MF/3D) — ไม่รวมเข้าเบี้ย/CV/IRR ของแบบหลัก
// แสดงผลในแท็บตาราง: ตารางเบี้ย ก่อน/หลังอายุ 60 + รายละเอียดความคุ้มครอง 13 หมวด

window.currentHECEnabled = false;
window.currentHECPlan = '3';            // ค่าเริ่มต้น แผน 3
window.currentHECHBF = 0;               // HBF ค่าชดเชยรายวัน (บาท/วัน) 0 = ไม่เลือก
window.hecAgeStart = null;
window.hecAgeEnd = null;

// แบบประกันที่รองรับ HEC
window.HEC_SUPPORTED_PLANS = ['Life Protector 20', 'Supreme Life Protector', 'Century Life'];

// แผนความคุ้มครอง 6 แผน
window.HEC_PLANS = [
    { id: '1', name: 'แผน 1', room: '1,000',  dailyRoom: 1000,  maxBenefit: 1000000,  maxLabel: '1 ล้าน'  },
    { id: '2', name: 'แผน 2', room: '2,000',  dailyRoom: 2000,  maxBenefit: 3000000,  maxLabel: '3 ล้าน'  },
    { id: '3', name: 'แผน 3', room: '3,000',  dailyRoom: 3000,  maxBenefit: 6000000,  maxLabel: '6 ล้าน'  },
    { id: '4', name: 'แผน 4', room: '5,000',  dailyRoom: 5000,  maxBenefit: 12000000, maxLabel: '12 ล้าน' },
    { id: '5', name: 'แผน 5', room: '8,000',  dailyRoom: 8000,  maxBenefit: 20000000, maxLabel: '20 ล้าน' },
    { id: '6', name: 'แผน 6', room: '12,000', dailyRoom: 12000, maxBenefit: 30000000, maxLabel: '30 ล้าน' },
];

// อัตราเบี้ยรายปี (บาท) จำแนกตามช่วงอายุ (ต้นช่วง) → [แผน1..แผน6]  (null = ไม่เปิดขาย)
// ที่มา: PDF HPE C-42/C-43 — ภัยมาตรฐานและขั้นอาชีพ 1 หรือ 2
window.HEC_RATES = {
    male: {
        11: [12805, 15608, 19720, 23205, 30345, null],
        16: [12818, 14990, 16500, 20700, 27091, 40872],
        21: [11217, 13685, 16107, 19412, 25441, 39102],
        26: [12471, 15182, 17309, 22316, 29258, 39174],
        31: [12518, 15229, 18098, 25416, 32957, 43092],
        36: [14305, 17356, 19814, 27793, 35346, 47403],
        41: [15523, 18791, 22080, 31806, 40356, 51226],
        46: [19254, 22928, 25500, 35899, 45828, 64714],
        51: [25463, 30613, 35000, 47595, 60621, 86849],
        56: [32632, 38189, 47954, 62044, 78597, 112050],
        61: [40820, 45710, 63250, 72300, 91821, 132681],
        66: [59300, 65700, 87962, 100800, 132300, 180444],
        71: [85250, 94625, 129480, 147942, 194688, 267030],
        76: [122700, 137715, 195750, 215502, 281472, 372190],
        81: [177550, 207213, 258349, 313526, 410607, 534963],
    },
    female: {
        11: [12796, 15598, 17740, 20712, 27075, null],
        16: [12803, 15605, 19100, 21110, 27750, 45000],
        21: [13839, 16831, 20463, 23652, 30857, 45100],
        26: [15374, 18363, 20663, 26624, 33545, 45200],
        31: [15400, 18693, 21755, 30024, 37565, 47345],
        36: [17567, 21202, 24258, 32948, 40594, 51244],
        41: [18999, 22983, 26727, 38390, 45030, 56149],
        46: [23270, 25707, 30422, 41910, 50441, 66333],
        51: [28490, 31882, 37550, 48321, 62436, 87080],
        56: [34375, 38539, 48034, 63178, 79830, 113700],
        61: [41440, 46343, 63475, 73500, 93060, 134310],
        66: [60720, 67160, 89892, 102925, 134450, 183099],
        71: [88075, 97460, 133020, 151174, 198360, 271300],
        76: [126115, 141155, 200165, 220334, 286310, 377750],
        81: [180795, 212148, 264669, 320771, 417860, 543000],
    },
};

// อายุต้นช่วงทั้งหมด (เรียงน้อย→มาก) สำหรับ step-rate lookup
window._HEC_BANDS = [11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81];
window.HEC_MIN_AGE = 11;
window.HEC_MAX_AGE = 85;   // ต่ออายุได้ถึง 85 (ช่วง 81-85)

// เบี้ย HEC ของอายุที่กำหนด (step-rate: ใช้ค่าช่วงที่ต้นช่วง <= อายุ)
window.hecPremForAge = function(planId, age, gender) {
    const g = (gender === 'male' || (gender || '').includes('ชาย')) ? 'male' : 'female';
    const idx = window.HEC_PLANS.findIndex(p => p.id === planId);
    if (idx < 0) return null;
    if (age < window.HEC_MIN_AGE || age > window.HEC_MAX_AGE) return null;
    let band = null;
    for (const b of window._HEC_BANDS) { if (b <= age) band = b; else break; }
    if (band == null) return null;
    const row = window.HEC_RATES[g][band];
    if (!row) return null;
    const v = row[idx];
    return (typeof v === 'number') ? v : null;
};

// HBF ต่อปีของอายุที่กำหนด (ใช้สูตรเดียวกับ getHealthRate('HBF'))
window.hecHBFForAge = function(age, gender) {
    const hbf = parseInt(window.currentHECHBF) || 0;
    if (hbf <= 0) return 0;
    if (typeof getHealthRate === 'function') return getHealthRate('HBF', String(hbf), age, gender) || 0;
    return 0;
};

// ==================== Toggle / Selector UI ====================

window.hecToggle = function(cb) {
    window.currentHECEnabled = cb.checked;
    const area = document.getElementById('hecSelectArea');
    if (area) area.classList.toggle('hidden', !cb.checked);
    if (cb.checked) window.hecRenderSelector();
    // refresh ปุ่ม nav ตาราง (จะได้กดดูตาราง HEC ได้)
};

window.hecSelectPlan = function(planId) {
    window.currentHECPlan = planId;
    window.hecRenderSelector();
    if (document.getElementById('hecDetailsRightView')) window.openHECDetailsView();
};

window.hecSetHBF = function(val) {
    window.currentHECHBF = parseInt(val) || 0;
    window.hecRenderSelector();
    if (document.getElementById('hecDetailsRightView')) window.openHECDetailsView();
};

window.hecRenderSelector = function() {
    const planWrap = document.getElementById('hecPlanPills');
    if (planWrap) {
        planWrap.innerHTML = window.HEC_PLANS.map(p => {
            const sel = p.id === window.currentHECPlan;
            const cls = sel
                ? 'bg-white shadow text-indigo-700 border border-indigo-300'
                : 'text-slate-500 hover:bg-white/60 border border-transparent';
            return `<button onclick="window.hecSelectPlan('${p.id}')" class="py-1.5 px-1 rounded-xl text-[12px] font-bold transition-all ${cls}">
                ${p.name}<span class="block text-[9px] font-medium opacity-70">${p.room} / ${p.maxLabel}</span>
            </button>`;
        }).join('');
    }
    const hbfWrap = document.getElementById('hecHBFPills');
    if (hbfWrap) {
        const opts = [0, 1000, 2000, 3000, 5000];
        hbfWrap.innerHTML = opts.map(v => {
            const sel = (parseInt(window.currentHECHBF) || 0) === v;
            const cls = sel
                ? 'bg-white shadow text-rose-700 border border-rose-300'
                : 'text-slate-500 hover:bg-white/60 border border-transparent';
            const label = v === 0 ? 'ไม่เลือก' : v.toLocaleString();
            return `<button onclick="window.hecSetHBF(${v})" class="py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all ${cls}">${label}</button>`;
        }).join('');
    }
    window.hecUpdatePremDisplay();
};

// เบี้ย HEC รายปี ของอายุปัจจุบัน (รวม HBF) — แสดงแบบ 3D
window.hecCurrentPremium = function() {
    const gender = (typeof currentGender !== 'undefined' && currentGender) ? currentGender : 'male';
    const age = parseInt(document.getElementById('ageInput')?.value) || 0;
    const base = window.hecPremForAge(window.currentHECPlan, age, gender);
    if (base == null) return null;
    const hbf = window.hecHBFForAge(age, gender);
    return base + hbf;
};

window.hecUpdatePremDisplay = function() {
    const el = document.getElementById('hecPremDisplay');
    if (!el) return;
    const prem = window.hecCurrentPremium();
    const age = parseInt(document.getElementById('ageInput')?.value) || 0;
    if (prem == null) {
        el.innerHTML = `<span class="text-slate-400">เบี้ย HEC: — (อายุ ${age} ไม่อยู่ในช่วง ${window.HEC_MIN_AGE}–${window.HEC_MAX_AGE})</span>`;
    } else {
        el.innerHTML = `เบี้ย HEC: <span class="text-indigo-700">${prem.toLocaleString('en-US')}</span> บาท/ปี`;
    }
};

// ==================== Benefit Detail View (เหมือน 3D) ====================

// ข้อมูลผลประโยชน์ 13 หมวด + เพิ่มเติม (ใช้ทั้งหน้าจอและ PDF)
window._hecBenefitData = function() {
    const plan = window.HEC_PLANS.find(p => p.id === window.currentHECPlan) || window.HEC_PLANS[2];
    const idx = window.HEC_PLANS.findIndex(p => p.id === plan.id);
    const perDay = plan.dailyRoom.toLocaleString();
    const real = 'ตามจำนวนเงินที่จ่ายจริง';
    const hs = (arr) => arr[idx];
    const cats = [
        { n: '1',  t: 'ค่าห้อง ค่าอาหาร ค่าบริการในโรงพยาบาล (ผู้ป่วยใน)', l: `${perDay} บ./วัน · สูงสุด 365 วัน` },
        { n: '',   t: 'ห้องผู้ป่วยวิกฤติ (ICU) สูงสุด 365 วัน', l: real, sub: true },
        { n: '2',  t: 'ค่าตรวจวินิจฉัย/บำบัดรักษา ค่ายา เวชภัณฑ์ (2.1–2.4)', l: real },
        { n: '3',  t: 'ค่าผู้ประกอบวิชาชีพเวชกรรม (แพทย์) ตรวจรักษา', l: `${perDay} บ./วัน · สูงสุด 365 วัน` },
        { n: '4',  t: 'ค่ารักษาพยาบาลโดยการผ่าตัด/หัตถการ (4.1–4.5)', l: real },
        { n: '5',  t: 'การผ่าตัดใหญ่ที่ไม่ต้องนอน รพ. (Day Surgery)', l: real },
        { n: '6',  t: 'ค่าตรวจวินิจฉัย/รักษา OPD ก่อน-หลังนอน รพ. (6.1–6.2)', l: `${real} · 6.2 สูงสุด 2 ครั้ง` },
        { n: '7',  t: 'ค่ารักษาพยาบาลอุบัติเหตุ OPD ภายใน 24 ชม./ครั้ง', l: real },
        { n: '8',  t: 'ค่าเวชศาสตร์ฟื้นฟูหลังนอน รพ. (สูงสุด 2 ครั้ง/ปี)', l: real },
        { n: '9',  t: 'ค่าบำบัดรักษาโรคไตวายเรื้อรัง (ล้างไต)', l: real },
        { n: '10', t: 'ค่าบำบัดรักษามะเร็ง โดยรังสีรักษา', l: real },
        { n: '11', t: 'ค่าบำบัดรักษามะเร็ง โดยเคมีบำบัด', l: real },
        { n: '12', t: 'ค่าบริการรถพยาบาลฉุกเฉิน', l: real },
        { n: '13', t: 'ค่ารักษาพยาบาลโดยการผ่าตัดเล็ก', l: real },
    ];
    const extras = [
        { t: '2.1 ค่าตรวจสุขภาพประจำปี และค่าฉีดวัคซีน', l: hs(['ไม่คุ้มครอง','ไม่คุ้มครอง','ไม่คุ้มครอง','ไม่คุ้มครอง','ไม่คุ้มครอง','3,000 บ./ปี']) },
        { t: '2.2 ค่าตรวจรักษาทางทันตกรรม', l: hs(['ไม่คุ้มครอง','ไม่คุ้มครอง','ไม่คุ้มครอง','ไม่คุ้มครอง','ไม่คุ้มครอง','2,000 บ./ปี']) },
        { t: '2.3 เพิ่มผลประโยชน์สูงสุดกรณีโรคร้ายแรง (+1 เท่า)', l: `${plan.maxBenefit.toLocaleString()} บ.` },
        { t: '2.4 ค่าชดเชยกรณีเจ็บป่วยด้วยโรคร้ายแรง (1 ครั้ง/ชีวิต)', l: hs(['50,000','50,000','50,000','50,000','50,000','100,000']) + ' บ.' },
    ];
    return { plan, cats, extras };
};

window._hecDetailInner = function() {
    const { plan, cats, extras } = window._hecBenefitData();
    const gender = (typeof currentGender !== 'undefined' && currentGender) ? currentGender : 'male';
    const gThai = gender === 'male' ? 'ชาย' : 'หญิง';
    const age = parseInt(document.getElementById('ageInput')?.value) || 0;
    const prem = window.hecCurrentPremium();
    const hbfNum = parseInt(window.currentHECHBF) || 0;

    let html = `<div style="padding:14px 14px 40px;">`;
    html += `<div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:16px;padding:16px;text-align:center;color:#fff;margin-bottom:14px;box-shadow:0 6px 18px rgba(79,70,229,0.25);">
        <div style="font-size:12px;font-weight:700;opacity:0.9;">เบี้ยประกัน HEC รายปี · ${gThai} อายุ ${age} ปี</div>
        <div style="font-size:30px;font-weight:900;line-height:1.1;margin-top:4px;">${prem != null ? prem.toLocaleString('en-US') : '—'}</div>
        <div style="font-size:11px;opacity:0.8;">บาท/ปี${hbfNum > 0 ? ` (รวม HBF ${hbfNum.toLocaleString()}/วัน)` : ''}</div>
    </div>`;
    html += `<div style="background:#4f46e5;border-radius:12px 12px 0 0;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:13px;font-weight:700;color:#fff;">ผลประโยชน์สูงสุดต่อรอบปี · ${plan.name} (ค่าห้อง ${plan.room})</span>
        <span style="font-size:16px;font-weight:900;color:#fff;">${plan.maxBenefit.toLocaleString()} บ.</span>
    </div>
    <div style="background:#fff;border:1px solid #e0e7ff;border-top:none;border-radius:0 0 12px 12px;overflow:hidden;">`;
    cats.forEach((c, i) => {
        html += `<div style="display:flex;align-items:flex-start;gap:9px;padding:11px 14px;${i < cats.length - 1 ? 'border-bottom:1px solid #f1f5f9;' : ''}${c.sub ? 'padding-left:34px;background:#fafafe;' : ''}">
            <i class="fas fa-check-circle" style="color:#10b981;font-size:15px;margin-top:2px;flex-shrink:0;"></i>
            <div style="flex:1;min-width:0;">
                ${c.n ? `<span style="font-size:10px;font-weight:700;color:#94a3b8;display:block;line-height:1;margin-bottom:3px;">หมวด ${c.n}</span>` : ''}
                <span style="font-size:14px;font-weight:600;color:#334155;line-height:1.4;">${c.t}</span>
            </div>
            <span style="font-size:12px;font-weight:700;color:#6366f1;text-align:right;flex-shrink:0;max-width:42%;line-height:1.35;">${c.l}</span>
        </div>`;
    });
    html += `</div>`;
    html += `<div style="margin-top:18px;font-size:13px;font-weight:800;color:#7c3aed;margin-bottom:7px;"><i class="fas fa-plus-circle"></i> ผลประโยชน์เพิ่มเติม (บันทึกสลักหลัง)</div>
        <div style="background:#fff;border:1px solid #ede9fe;border-radius:12px;overflow:hidden;">`;
    extras.forEach((e, i) => {
        html += `<div style="display:flex;align-items:flex-start;gap:9px;padding:11px 14px;${i < extras.length - 1 ? 'border-bottom:1px solid #f5f3ff;' : ''}">
            <i class="fas fa-star" style="color:#a78bfa;font-size:13px;margin-top:2px;flex-shrink:0;"></i>
            <span style="flex:1;min-width:0;font-size:14px;font-weight:600;color:#334155;line-height:1.4;">${e.t}</span>
            <span style="font-size:12px;font-weight:700;color:#7c3aed;text-align:right;flex-shrink:0;max-width:38%;line-height:1.35;">${e.l}</span>
        </div>`;
    });
    html += `</div>`;
    if (hbfNum > 0) {
        html += `<div style="margin-top:18px;font-size:13px;font-weight:800;color:#e11d48;margin-bottom:7px;"><i class="fas fa-bed-pulse"></i> สัญญาเพิ่มเติม HBF — ${hbfNum.toLocaleString()} บ./วัน</div>
            <div style="background:#fff;border:1px solid #ffe4e6;border-radius:12px;overflow:hidden;">
                <div style="display:flex;align-items:center;gap:9px;padding:11px 14px;border-bottom:1px solid #fff1f2;">
                    <i class="fas fa-check-circle" style="color:#fb7185;font-size:15px;flex-shrink:0;"></i>
                    <span style="flex:1;font-size:14px;font-weight:600;color:#334155;">ชดเชยรายวันกรณีผู้ป่วยใน</span>
                    <span style="font-size:12px;font-weight:700;color:#e11d48;">${hbfNum.toLocaleString()} บ./วัน</span>
                </div>
                <div style="display:flex;align-items:center;gap:9px;padding:11px 14px;">
                    <i class="fas fa-check-circle" style="color:#fb7185;font-size:15px;flex-shrink:0;"></i>
                    <span style="flex:1;font-size:14px;font-weight:600;color:#334155;">ชดเชยรายวันกรณีผู้ป่วย ICU</span>
                    <span style="font-size:12px;font-weight:700;color:#e11d48;">${hbfNum.toLocaleString()} บ./วัน</span>
                </div>
            </div>`;
    }
    html += `<div style="margin-top:16px;padding:10px 12px;background:#f1f5f9;border-radius:10px;font-size:11px;color:#94a3b8;line-height:1.6;">
        * อายุ 71–85 ปี สำหรับปีต่ออายุเท่านั้น · แผน 6 เปิดขายเฉพาะขั้นอาชีพ 1 และ 2<br>
        * เบี้ย HEC เป็นเบี้ยสุขภาพแยกต่างหาก ไม่รวมกับเบี้ย/มูลค่าเวนคืนของแบบประกันหลัก
    </div>`;
    html += `</div>`;
    return html;
};

window.openHECDetailsView = function() {
    if (!window.currentHECEnabled) { if (typeof showCustomError === 'function') showCustomError('กรุณาเปิดใช้งาน HEC ก่อน'); return; }
    if (typeof closePopup === 'function') { closePopup('resultModal'); closePopup('slbResultModal'); }
    const isWide = (typeof window.isWideLayout === 'function') ? window.isWideLayout() : window.innerWidth >= 600;
    const container = isWide ? document.getElementById('rightPane') : document.body;
    if (isWide && typeof _unmountViewsFromRightPane === 'function') _unmountViewsFromRightPane();

    let view = document.getElementById('hecDetailsRightView');
    if (!view) { view = document.createElement('div'); view.id = 'hecDetailsRightView'; }
    view.style.cssText = isWide
        ? 'display:flex;flex-direction:column;position:absolute;inset:0;z-index:10;overflow:hidden;background:linear-gradient(160deg,#eef2ff 0%,#f8fafc 100%);'
        : 'display:flex;flex-direction:column;position:fixed;inset:0;z-index:9500;overflow:hidden;background:linear-gradient(160deg,#eef2ff 0%,#f8fafc 100%);padding-top:env(safe-area-inset-top);';

    const plan = window.HEC_PLANS.find(p => p.id === window.currentHECPlan) || window.HEC_PLANS[2];
    view.innerHTML = `
    <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;color:white;font-size:16px;border:1px solid rgba(255,255,255,0.3);">
                <i class="fas fa-shield-heart"></i>
            </div>
            <div>
                <div style="font-size:15px;font-weight:700;color:white;line-height:1.2;">รายละเอียดความคุ้มครอง</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.85);margin-top:2px;">13 หมวด · HEC ${plan.name} (${plan.maxLabel})</div>
            </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
            <button onclick="window.exportHECPDF('modal')" aria-label="แชร์" title="แชร์" style="padding:6px 12px;border-radius:10px;background:rgba(255,255,255,0.95);border:none;color:#4f46e5;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px;line-height:1;"><i class="fas fa-share-nodes"></i> แชร์</button>
            <button onclick="window.closeHECDetailsView()" style="width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.2);border:none;color:white;font-size:20px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;">&times;</button>
        </div>
    </div>
    <div class="custom-scrollbar" style="overflow-y:auto;flex:1;min-height:0;">${window._hecDetailInner()}</div>`;

    if (view.parentElement !== container) container.appendChild(view);
    if (isWide) { const ph = document.getElementById('canvasPlaceholder'); if (ph) ph.style.display = 'none'; }
    document.body.setAttribute('data-view', 'table');
};

window.closeHECDetailsView = function() {
    const view = document.getElementById('hecDetailsRightView');
    if (view) view.remove();
    if (typeof window.resetRightPaneToPlaceholder === 'function') window.resetRightPaneToPlaceholder();
    document.body.setAttribute('data-view', 'main');
};

// ==================== PDF Export (แชร์ตารางผลประโยชน์ HEC) ====================
window.exportHECPDF = async function(actionType = 'modal') {
    const toast = document.createElement('div');
    toast.className = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-900 text-white px-8 py-5 rounded-2xl text-sm font-bold z-[10000] shadow-2xl text-center backdrop-blur-sm";
    toast.innerHTML = `<i class='fas fa-spinner fa-spin mb-3 block text-3xl'></i><span>กำลังสร้างเอกสาร...</span>`;
    document.body.appendChild(toast);
    try {
        const [fontBase64, fontBoldBase64] = await Promise.all([
            typeof loadThaiFont === 'function' ? loadThaiFont() : Promise.resolve(null),
            typeof loadThaiFontBold === 'function' ? loadThaiFontBold() : Promise.resolve(null)
        ]);
        if (!window.jspdf && !window.jsPDF) throw new Error('ไม่พบไลบรารี jsPDF');
        const jsPDF = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
        const doc = new jsPDF('p', 'mm', 'a4');
        if (typeof doc.autoTable !== 'function') throw new Error('ไม่พบ jspdf-autotable');
        let fontName = 'helvetica';
        if (fontBase64) {
            try {
                doc.addFileToVFS('Sarabun-Regular.ttf', fontBase64); doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal');
                if (fontBoldBase64) { doc.addFileToVFS('Sarabun-Bold.ttf', fontBoldBase64); doc.addFont('Sarabun-Bold.ttf', 'Sarabun', 'bold'); }
                else doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'bold');
                fontName = 'Sarabun';
            } catch (e) {}
        }
        const { plan, cats, extras } = window._hecBenefitData();
        const gender = (typeof currentGender !== 'undefined' && currentGender === 'female') ? 'หญิง' : 'ชาย';
        const age = parseInt(document.getElementById('ageInput')?.value) || 0;
        const prem = window.hecCurrentPremium();
        const hbfNum = parseInt(window.currentHECHBF) || 0;

        doc.setFont(fontName, 'bold'); doc.setFontSize(15); doc.setTextColor(79, 70, 229);
        doc.text('HEC — ตารางผลประโยชน์ความคุ้มครอง', 14, 18);
        doc.setFont(fontName, 'normal'); doc.setFontSize(10); doc.setTextColor(100, 116, 139);
        doc.text(`${plan.name} · ค่าห้อง ${plan.room} / ${plan.maxLabel}  |  ${gender} อายุ ${age} ปี  |  เบี้ย ${prem != null ? prem.toLocaleString('en-US') : '—'} บ./ปี${hbfNum > 0 ? ' (รวม HBF ' + hbfNum.toLocaleString() + '/วัน)' : ''}`, 14, 25);

        const body = [];
        cats.forEach(c => body.push([c.n ? 'หมวด ' + c.n : '', (c.sub ? '   • ' : '') + c.t, c.l]));
        extras.forEach(e => body.push(['เพิ่มเติม', e.t, e.l]));
        if (hbfNum > 0) {
            body.push(['HBF', 'ชดเชยรายวันกรณีผู้ป่วยใน', hbfNum.toLocaleString() + ' บ./วัน']);
            body.push(['HBF', 'ชดเชยรายวันกรณีผู้ป่วย ICU', hbfNum.toLocaleString() + ' บ./วัน']);
        }
        doc.autoTable({
            head: [['', 'ความคุ้มครอง', 'ผลประโยชน์']],
            body,
            startY: 30,
            styles: { font: fontName, fontSize: 9, cellPadding: 2.5, valign: 'middle' },
            headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [238, 242, 255] },
            columnStyles: { 0: { cellWidth: 22, halign: 'center' }, 2: { halign: 'right', cellWidth: 45 } },
        });
        const pdfBlob = doc.output('blob');
        const cleanName = `HEC ${plan.name} ${plan.room} ${gender}`.trim();
        const pdfFileName = `${cleanName}.pdf`;
        const pdfFile = new File([pdfBlob], pdfFileName, { type: 'application/pdf' });
        if (toast.parentNode) toast.remove();
        if (actionType === 'modal' && typeof _showTableShareModal === 'function') {
            await _showTableShareModal(pdfBlob, pdfFile, doc, {}, { cleanName });
        } else if (actionType === 'save') {
            const inLine = typeof isInLineApp === 'function' && isInLineApp();
            if (inLine && typeof showPdfViewer === 'function') await showPdfViewer(pdfBlob, pdfFileName);
            else { const shared = typeof tryShareFile === 'function' ? await tryShareFile(pdfFile, pdfFileName, pdfFileName) : false; if (!shared) doc.save(pdfFileName); }
        } else if (typeof showPdfViewer === 'function') {
            await showPdfViewer(pdfBlob, pdfFileName);
        } else { doc.save(pdfFileName); }
    } catch (e) {
        if (toast.parentNode) toast.remove();
        if (typeof showCustomError === 'function') showCustomError('สร้างเอกสารไม่สำเร็จ: ' + e.message);
    }
};
