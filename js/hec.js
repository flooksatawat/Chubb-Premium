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
    if (document.body.getAttribute('data-view') === 'table') window.openHECTableView();
};

window.hecSetHBF = function(val) {
    window.currentHECHBF = parseInt(val) || 0;
    window.hecRenderSelector();
    if (document.body.getAttribute('data-view') === 'table') window.openHECTableView();
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
};

// ==================== Table View ====================

window.openHECTableView = function() {
    const head = document.getElementById('policyTableHead');
    const body = document.getElementById('policyTableBody');
    const titleEl = document.getElementById('tableHeaderTitle');
    const surrenderContainer = document.getElementById('surrenderContainer');
    const breakeven = document.getElementById('breakevenSummary');
    if (surrenderContainer) surrenderContainer.innerHTML = '';
    if (breakeven) breakeven.classList.add('hidden');
    const _cfpc = document.getElementById('cashFlowPlanContainer');
    if (_cfpc) { _cfpc.classList.add('hidden'); _cfpc.innerHTML = ''; }

    const gender = (typeof currentGender !== 'undefined' && currentGender) ? currentGender : 'male';
    const gThai = gender === 'male' ? 'ชาย' : 'หญิง';
    const plan = window.HEC_PLANS.find(p => p.id === window.currentHECPlan) || window.HEC_PLANS[2];
    const curAge = parseInt(document.getElementById('ageInput')?.value) || window.HEC_MIN_AGE;

    let start = parseInt(window.hecAgeStart);
    let end = parseInt(window.hecAgeEnd);
    if (!start || isNaN(start)) start = Math.max(curAge, window.HEC_MIN_AGE);
    if (!end || isNaN(end)) end = window.HEC_MAX_AGE;
    start = Math.min(Math.max(start, window.HEC_MIN_AGE), window.HEC_MAX_AGE);
    end = Math.min(Math.max(end, start), window.HEC_MAX_AGE);
    window.hecAgeStart = start;
    window.hecAgeEnd = end;

    const _vw = window.innerWidth;
    const _isMobile = _vw < 700;
    const _fs = _isMobile ? '14' : '16';
    const _fsH = _isMobile ? '12' : '13';
    const _pd = _isMobile ? '8px 8px' : '10px 14px';
    const _pdH = _isMobile ? '9px 8px' : '11px 14px';
    const hbfNum = parseInt(window.currentHECHBF) || 0;

    // header title (badges)
    const _badge = 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border';
    if (titleEl) titleEl.innerHTML = `
        <div class="flex flex-wrap gap-1 items-center w-full">
            <span class="${_badge} bg-indigo-600 text-white border-indigo-700">HEC</span>
            <span class="${_badge} bg-white/80 text-slate-700 border-slate-200">${gThai}</span>
            <span class="${_badge} bg-white/80 text-slate-700 border-slate-200">อายุ: ${start}–${end} ปี</span>
            <span class="${_badge} bg-white text-slate-800 border-slate-200 shadow-sm">${plan.name} · ค่าห้อง ${plan.room} / ${plan.maxLabel}</span>
            ${hbfNum > 0 ? `<span class="${_badge} bg-rose-50 text-rose-600 border-rose-200">+HBF ${hbfNum.toLocaleString()}/วัน</span>` : ''}
        </div>`;

    // age-range editor row (เหนือตาราง) — ใช้ surrenderContainer เป็นที่วาง
    if (surrenderContainer) {
        surrenderContainer.classList.remove('hidden');
        surrenderContainer.innerHTML = `
            <div style="padding:10px 12px;background:linear-gradient(135deg,#eef2ff,#faf5ff);border-bottom:1px solid #e0e7ff;">
                <div style="font-size:11px;font-weight:700;color:#6366f1;margin-bottom:6px;display:flex;align-items:center;gap:5px;">
                    <i class="fas fa-calendar-alt"></i> กำหนดช่วงอายุ (${Math.max(0, end - start + 1)} ปี)
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:340px;margin:0 auto;">
                    <div>
                        <div style="font-size:10px;color:#94a3b8;text-align:center;margin-bottom:3px;">เริ่มต้น</div>
                        <input id="hecAgeStartInput" type="number" min="${window.HEC_MIN_AGE}" max="${window.HEC_MAX_AGE}" value="${start}"
                            oninput="window.hecAgeStart=parseInt(this.value)||${start}; window.openHECTableView();"
                            style="width:100%;background:#fff;border:1px solid #c7d2fe;border-radius:10px;padding:7px;font-size:15px;font-weight:800;color:#3730a3;text-align:center;outline:none;box-sizing:border-box;">
                    </div>
                    <div>
                        <div style="font-size:10px;color:#94a3b8;text-align:center;margin-bottom:3px;">สิ้นสุด</div>
                        <input id="hecAgeEndInput" type="number" min="${window.HEC_MIN_AGE}" max="${window.HEC_MAX_AGE}" value="${end}"
                            oninput="window.hecAgeEnd=parseInt(this.value)||${end}; window.openHECTableView();"
                            style="width:100%;background:#fff;border:1px solid #c7d2fe;border-radius:10px;padding:7px;font-size:15px;font-weight:800;color:#3730a3;text-align:center;outline:none;box-sizing:border-box;">
                    </div>
                </div>
            </div>`;
    }

    // build rows
    const SPLIT = 60;
    const buildRows = (fromAge, toAge) => {
        const out = [];
        for (let age = fromAge; age <= toAge; age++) {
            const base = window.hecPremForAge(plan.id, age, gender);
            if (base == null) continue;
            const hbf = hbfNum > 0 ? window.hecHBFForAge(age, gender) : 0;
            out.push({ age, prem: base + hbf });
        }
        return out;
    };
    const before = buildRows(start, Math.min(SPLIT - 1, end));
    const after = buildRows(Math.max(SPLIT, start), end);
    const totalBefore = before.reduce((s, r) => s + r.prem, 0);
    const totalAfter = after.reduce((s, r) => s + r.prem, 0);
    const grandTotal = totalBefore + totalAfter;
    const maxLen = Math.max(before.length, after.length);

    if (head) {
        head.innerHTML = `<tr style="background:linear-gradient(135deg,#4f46e5,#7c3aed);">
            <th colspan="2" style="padding:${_pdH};text-align:center;font-size:${_fs}px;font-weight:700;color:#fff;border-right:2px solid rgba(255,255,255,0.3);">ก่อนอายุ 60 ปี</th>
            <th colspan="2" style="padding:${_pdH};text-align:center;font-size:${_fs}px;font-weight:700;color:#fff;">หลังอายุ 60 ปี</th>
        </tr>
        <tr style="background:rgba(99,102,241,0.08);">
            <th style="padding:6px 8px;text-align:center;font-size:${_fsH}px;font-weight:700;color:#4f46e5;border-right:1px solid #e2e8f0;">อายุ</th>
            <th style="padding:6px 8px;text-align:right;font-size:${_fsH}px;font-weight:700;color:#4f46e5;border-right:2px solid #c7d2fe;">เบี้ย/ปี</th>
            <th style="padding:6px 8px;text-align:center;font-size:${_fsH}px;font-weight:700;color:#7c3aed;border-right:1px solid #e2e8f0;">อายุ</th>
            <th style="padding:6px 8px;text-align:right;font-size:${_fsH}px;font-weight:700;color:#7c3aed;">เบี้ย/ปี</th>
        </tr>`;
    }

    let bodyHtml = '';
    for (let i = 0; i < maxLen; i++) {
        const bg = i % 2 === 0 ? '#fff' : '#f8fafc';
        const b = before[i], a = after[i];
        bodyHtml += `<tr style="background:${bg};border-bottom:1px solid #f1f5f9;">
            <td style="padding:${_pd};text-align:center;font-size:${_fs}px;color:#334155;border-right:1px solid #f1f5f9;">${b ? b.age : ''}</td>
            <td style="padding:${_pd};text-align:right;font-size:${_fs}px;font-weight:600;color:#4338ca;border-right:2px solid #c7d2fe;">${b ? b.prem.toLocaleString('en-US') : ''}</td>
            <td style="padding:${_pd};text-align:center;font-size:${_fs}px;color:#334155;border-right:1px solid #f1f5f9;">${a ? a.age : ''}</td>
            <td style="padding:${_pd};text-align:right;font-size:${_fs}px;font-weight:600;color:#7c3aed;">${a ? a.prem.toLocaleString('en-US') : ''}</td>
        </tr>`;
    }
    bodyHtml += `<tr style="background:linear-gradient(135deg,#4f46e5,#7c3aed);">
        <td style="padding:${_pdH};text-align:center;font-size:${_fs}px;font-weight:700;color:#fff;border-right:1px solid rgba(255,255,255,0.3);">รวม</td>
        <td style="padding:${_pdH};text-align:right;font-size:${_fs}px;font-weight:900;color:#fff;border-right:2px solid rgba(255,255,255,0.4);">${totalBefore > 0 ? totalBefore.toLocaleString('en-US') : '—'}</td>
        <td style="padding:${_pdH};text-align:center;font-size:${_fs}px;font-weight:700;color:#fff;border-right:1px solid rgba(255,255,255,0.3);">รวม</td>
        <td style="padding:${_pdH};text-align:right;font-size:${_fs}px;font-weight:900;color:#fff;">${totalAfter > 0 ? totalAfter.toLocaleString('en-US') : '—'}</td>
    </tr>
    <tr style="background:#3730a3;">
        <td colspan="4" style="padding:${_pdH};text-align:center;font-size:${_isMobile ? '16' : '18'}px;font-weight:900;color:#fff;">
            รวมตลอดสัญญา: ${grandTotal > 0 ? grandTotal.toLocaleString('en-US') : '—'} บาท
        </td>
    </tr>`;
    if (body) body.innerHTML = bodyHtml + window._hecDetailRowsHtml();

    // ปุ่มแชร์
    const _wide = typeof window.isWideLayout === 'function' ? window.isWideLayout() : window.innerWidth >= 600;
    const _shrBtn = document.getElementById('tableShareBtn');
    if (_shrBtn) _shrBtn.style.display = (_wide && grandTotal > 0) ? 'inline-flex' : 'none';
    const _navShr = document.getElementById('navShareBtn');
    if (_navShr) _navShr.style.display = (!_wide && grandTotal > 0) ? '' : 'none';
};

// แถวรายละเอียดความคุ้มครอง 13 หมวด (ต่อท้ายตารางในแถวเดียว colspan=4)
window._hecDetailRowsHtml = function() {
    const plan = window.HEC_PLANS.find(p => p.id === window.currentHECPlan) || window.HEC_PLANS[2];
    const idx = window.HEC_PLANS.findIndex(p => p.id === plan.id);
    const perDay = plan.dailyRoom.toLocaleString();
    const real = 'ตามจำนวนเงินที่จ่ายจริง';
    // ผลประโยชน์เพิ่มเติม 2.1/2.2/2.4 ราย-แผน
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
    const hbfNum = parseInt(window.currentHECHBF) || 0;

    let rows = `<tr class="no-pdf"><td colspan="4" style="padding:0;">
        <div style="background:linear-gradient(160deg,#eef2ff,#faf5ff);padding:14px 14px 18px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                <i class="fas fa-shield-heart" style="color:#6366f1;font-size:15px;"></i>
                <span style="font-size:14px;font-weight:800;color:#4338ca;">รายละเอียดความคุ้มครอง HEC</span>
                <span style="font-size:11px;color:#818cf8;">13 หมวด · ${plan.name} (${plan.maxLabel})</span>
            </div>
            <div style="background:#4f46e5;border-radius:10px 10px 0 0;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:13px;font-weight:700;color:#fff;">ผลประโยชน์สูงสุดต่อรอบปี</span>
                <span style="font-size:15px;font-weight:900;color:#fff;">${plan.maxBenefit.toLocaleString()} บ.</span>
            </div>
            <div style="background:#fff;border:1px solid #e0e7ff;border-top:none;border-radius:0 0 10px 10px;overflow:hidden;">`;
    cats.forEach((c, i) => {
        rows += `<div style="display:flex;align-items:flex-start;gap:8px;padding:9px 12px;${i < cats.length - 1 ? 'border-bottom:1px solid #f1f5f9;' : ''}${c.sub ? 'padding-left:30px;background:#fafafe;' : ''}">
            <i class="fas fa-check-circle" style="color:#10b981;font-size:14px;margin-top:2px;flex-shrink:0;"></i>
            <div style="flex:1;min-width:0;">
                ${c.n ? `<span style="font-size:9px;font-weight:700;color:#94a3b8;display:block;line-height:1;margin-bottom:2px;">หมวด ${c.n}</span>` : ''}
                <span style="font-size:13px;font-weight:600;color:#334155;line-height:1.35;">${c.t}</span>
            </div>
            <span style="font-size:11px;font-weight:700;color:#6366f1;text-align:right;flex-shrink:0;max-width:42%;line-height:1.3;">${c.l}</span>
        </div>`;
    });
    rows += `</div>
            <div style="margin-top:14px;font-size:12px;font-weight:800;color:#7c3aed;margin-bottom:6px;"><i class="fas fa-plus-circle"></i> ผลประโยชน์เพิ่มเติม (บันทึกสลักหลัง)</div>
            <div style="background:#fff;border:1px solid #ede9fe;border-radius:10px;overflow:hidden;">`;
    extras.forEach((e, i) => {
        rows += `<div style="display:flex;align-items:flex-start;gap:8px;padding:9px 12px;${i < extras.length - 1 ? 'border-bottom:1px solid #f5f3ff;' : ''}">
            <i class="fas fa-star" style="color:#a78bfa;font-size:12px;margin-top:2px;flex-shrink:0;"></i>
            <span style="flex:1;min-width:0;font-size:13px;font-weight:600;color:#334155;line-height:1.35;">${e.t}</span>
            <span style="font-size:11px;font-weight:700;color:#7c3aed;text-align:right;flex-shrink:0;max-width:38%;line-height:1.3;">${e.l}</span>
        </div>`;
    });
    rows += `</div>`;
    if (hbfNum > 0) {
        rows += `<div style="margin-top:14px;font-size:12px;font-weight:800;color:#e11d48;margin-bottom:6px;"><i class="fas fa-bed-pulse"></i> สัญญาเพิ่มเติม HBF — ${hbfNum.toLocaleString()} บ./วัน</div>
            <div style="background:#fff;border:1px solid #ffe4e6;border-radius:10px;overflow:hidden;">
                <div style="display:flex;align-items:center;gap:8px;padding:9px 12px;border-bottom:1px solid #fff1f2;">
                    <i class="fas fa-check-circle" style="color:#fb7185;font-size:14px;flex-shrink:0;"></i>
                    <span style="flex:1;font-size:13px;font-weight:600;color:#334155;">ชดเชยรายวันกรณีผู้ป่วยใน</span>
                    <span style="font-size:11px;font-weight:700;color:#e11d48;">${hbfNum.toLocaleString()} บ./วัน</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px;padding:9px 12px;">
                    <i class="fas fa-check-circle" style="color:#fb7185;font-size:14px;flex-shrink:0;"></i>
                    <span style="flex:1;font-size:13px;font-weight:600;color:#334155;">ชดเชยรายวันกรณีผู้ป่วย ICU</span>
                    <span style="font-size:11px;font-weight:700;color:#e11d48;">${hbfNum.toLocaleString()} บ./วัน</span>
                </div>
            </div>`;
    }
    rows += `<div style="margin-top:12px;font-size:10px;color:#94a3b8;line-height:1.5;">
            * อายุ 71–85 ปี สำหรับปีต่ออายุเท่านั้น · แผน 6 เปิดขายเฉพาะขั้นอาชีพ 1 และ 2<br>
            * เบี้ย HEC เป็นเบี้ยสุขภาพแยกต่างหาก ไม่รวมกับเบี้ย/มูลค่าเวนคืนของแบบประกันหลัก
        </div>
        </div>
    </td></tr>`;
    return rows;
};
