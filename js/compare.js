// ==================== เทียบแบบ (PLAN COMPARISON) ====================

const _COMPARE_PLANS = [
    { appPlan: 'CI Extra Plus',          planCode: '20CX',   label: 'CI Extra Plus',         abbr: 'CX',    payYears: 20, coverAge: 85,  color: '#e11d48', bg: '#fff1f2' },
    { appPlan: 'Life Protector 20',      planCode: '20LPB',  label: 'Life Protector 20',     abbr: 'LPB',   payYears: 20, coverAge: 90,  color: '#059669', bg: '#ecfdf5' },
    { appPlan: 'Supreme Life Protector', planCode: '20SLPA', label: 'Supreme Life Protector', abbr: 'SLPA',  payYears: 20, coverAge: 90,  color: '#0891b2', bg: '#ecfeff' },
    { appPlan: 'Signature Legacy',       planCode: '10SLB',  label: 'Signature Legacy',      abbr: 'SLB',   payYears: 10, coverAge: 99,  color: '#d97706', bg: '#fffbeb' },
    { appPlan: 'Century Life',           planCode: '20CL',   label: 'Century Life 20',       abbr: 'CL',    payYears: 20, coverAge: 100, color: '#7c3aed', bg: '#f5f3ff' },
    { appPlan: 'Whole Life Extra',       planCode: 'WXN10',  label: 'Whole Life Extra',      abbr: 'WXN',   payYears: 10, coverAge: 99,  color: '#4f46e5', bg: '#eef2ff' },
    { appPlan: '24 TX',                  planCode: '24TX',   label: '24 TX',                 abbr: 'TX',    payYears: 24, coverAge: 90,  color: '#0284c7', bg: '#eff6ff' },
    { appPlan: '868 / 818 Elite Saving', planCode: 'S868',   label: '868 Elite Saving',      abbr: 'Elite', payYears: 8,  coverAge: 99,  color: '#9333ea', bg: '#faf5ff' },
    { appPlan: '678 Step Savings',       planCode: 'A78',    label: '678 Step Savings',      abbr: '678',   payYears: 6,  coverAge: 78,  color: '#c026d3', bg: '#fdf4ff' },
    { appPlan: 'LifeTime Value',         planCode: '20LV',   label: 'LifeTime Value 20',     abbr: 'LV',    payYears: 20, coverAge: 100, color: '#7c3aed', bg: '#f5f3ff' },
    { appPlan: 'Smart Plan 21/7',        planCode: '7SM',    label: 'Smart Plan 21/7',       abbr: '7SM',   payYears: 7,  coverAge: 99,  color: '#0d9488', bg: '#f0fdfa' },
];

function _compareGetCV(planCode, gender, age, year) {
    const cv = window.cvDataLookup;
    if (!cv) return 0;
    return cv[planCode]?.[gender]?.[age]?.[year] || 0;
}

function _compareCalcSA(planCode, gender, age, premium) {
    const rate = LIFE_RATES[planCode]?.[gender]?.[age] || 0;
    if (!rate) return 0;
    const discounts = [5, 4, 3, 2, 1.5, 1, 0.5, 0];
    let sa = 0;
    for (const d of discounts) {
        const s = (premium * 1000) / (rate - d);
        if (getDiscount(s, planCode) === d) { sa = s; break; }
    }
    if (!sa) sa = (premium * 1000) / rate;
    return Math.round(sa);
}

function _compareTxCashback(sa, issueAge, year) {
    const attainedAge = issueAge + year;
    if (year % 3 === 0 && year <= 24) return Math.round(sa * 0.05);
    if (year === 25) return Math.round(sa * 0.70);
    if (year >= 26 && attainedAge < 90) return Math.round(sa * 0.08);
    if (attainedAge === 90) {
        // 24TX ครบกำหนดสัญญาอายุ 90: จ่ายทุนประกันตาม %เพิ่ม 10% ทุก 3 ปี (ใช้ปีปัจจุบัน)
        const _cmpTxMatMult = 1.0 + 0.10 * Math.floor((year - 1) / 3);
        return Math.round(sa * _cmpTxMatMult);
    }
    return 0;
}

function _compareTxDeathBenefit(sa, annualPrem, gender, age, year) {
    let totalPaid = 0;
    let totalCashback = 0;
    for (let y = 1; y <= year; y++) {
        if (y <= 24) totalPaid += annualPrem;
        totalCashback += _compareTxCashback(sa, age, y);
    }
    const cvRate = _compareGetCV('24TX', gender, age, year);
    const cv = cvRate ? Math.round((sa * cvRate) / 1000) : 0;
    const txMult = 1.0 + 0.10 * Math.max(0, Math.floor((year - 1) / 3));
    return Math.max(
        Math.round(sa * txMult),
        cv,
        Math.round(totalPaid - totalCashback)
    );
}

function _compareCalcOne(plan, gender, age, premium) {
    let planCode = plan.planCode;
    if (plan.abbr === 'Elite' && age > 50) planCode = 'S818';

    const rate = LIFE_RATES[planCode]?.[gender]?.[age] || 0;
    if (!rate) return null;

    const sa = _compareCalcSA(planCode, gender, age, premium);
    if (sa <= 0) return null;

    const annualPrem = Math.round((sa / 1000) * (rate - getDiscount(sa, planCode)));
    const payYears = plan.payYears;

    // CV at year 10 and year 20
    const cvRate10 = _compareGetCV(planCode, gender, age, 10);
    const cvRate20 = _compareGetCV(planCode, gender, age, 20);
    const cv10 = cvRate10 ? Math.round((sa * cvRate10) / 1000) : 0;
    const cv20 = cvRate20 ? Math.round((sa * cvRate20) / 1000) : 0;

    // Breakeven search
    const isSLPA = plan.abbr === 'SLPA';
    const isWXN  = plan.abbr === 'WXN';
    const isTX   = plan.abbr === 'TX';
    const isElite = plan.abbr === 'Elite';
    let beAge = null;
    let totalPaid = 0;
    const isTxPlan = plan.abbr === 'TX';
    const coverYears = isTxPlan ? Math.max(1, plan.coverAge - age) : Math.min(plan.coverAge - age, 60);
    for (let y = 1; y <= coverYears; y++) {
        if (y <= payYears) totalPaid += annualPrem;
        if (totalPaid <= 0) continue;
        const cvRateY = _compareGetCV(planCode, gender, age, y);
        const cvY = cvRateY ? Math.round((sa * cvRateY) / 1000) : 0;
        let beValue;
        if (isElite || isTX || isWXN) {
            beValue = cvY;
        } else if (isSLPA) {
            beValue = Math.round(sa * (1 + 0.05 * Math.floor(y / 5)));
        } else {
            beValue = cvY;
        }
        if (!beAge && beValue >= totalPaid) {
            beAge = age + y;
        }
    }

    return { sa, annualPrem, cv10, cv20, beAge, gender, age };
}

function _initCompareState() {
    const age = parseInt(document.getElementById('ageInput')?.value) || 35;
    const gender = window.currentGender || 'male';
    const premInput = document.getElementById('premiumInput');
    const premium = parseInt((premInput?.value || '').replace(/,/g, '')) || 0;
    const defaultIdx = _COMPARE_PLANS.findIndex(p => p.appPlan === (window.currentAppPlan || ''));
    const selected = new Set(defaultIdx >= 0 ? [defaultIdx] : [0]);
    return { age, gender, premium, selected };
}

window._buildCompareHTML = function() {
    const { age, gender, premium } = _initCompareState();
    // ใช้ preselect จาก long-press ถ้ามี แล้วล้างทิ้ง
    const selected = window.__cmpPreselect || _initCompareState().selected;
    window.__cmpPreselect = null;
    window.__cmpState = { age, gender, premium, selected };

    function build(sel) {
        const pills = _COMPARE_PLANS.map((p, i) => {
            const on = sel.has(i);
            return `<button onclick="window._cmpToggle(${i})" style="padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700;font-family:'Kanit',sans-serif;cursor:pointer;border:2px solid ${p.color};background:${on?p.color:'white'};color:${on?'white':p.color};transition:all 0.15s;margin:2px;">${p.abbr}</button>`;
        }).join('');

        const results = [];
        for (const i of sel) {
            const p = _COMPARE_PLANS[i];
            const r = _compareCalcOne(p, gender, age, premium);
            if (r) results.push({ plan: p, ...r });
        }

        let tableHtml = '';
        if (results.length > 0) {
            // SA/death benefit at year y — SLPA: +5% every 5 years; LV: 100/150/200% tiers; others fixed
            function saAtYear(r, y) {
                if (r.plan.abbr === 'SLPA') return Math.round(r.sa * (1 + 0.05 * Math.floor(y / 5)));
                if (r.plan.abbr === 'LV') {
                    const attainedAge = (r.age || 30) + y;
                    const mult = y <= 10 ? 1.0 : y <= 20 ? 1.5 : (attainedAge <= 70 ? 2.0 : 1.5);
                    return Math.round(r.sa * mult);
                }
                // 24TX: ทุนประกันเพิ่ม 10% ทุก 3 ปี ตามปีกรมธรรม์ (ไม่นับ CV ซ้ำ)
                if (r.plan.abbr === 'TX') return _compareTxDeathBenefit(r.sa, r.annualPrem, r.gender, r.age, y);
                return r.sa;
            }
            function fmtSaCell(v, r) {
                if (r.plan.abbr === 'SLPA' && v > r.sa) return `<span style="color:#0891b2;font-weight:800;">${v.toLocaleString()}</span>`;
                if (r.plan.abbr === 'LV'   && v > r.sa) return `<span style="color:#7c3aed;font-weight:800;">${v.toLocaleString()}</span>`;
                if (r.plan.abbr === 'TX'   && v > r.sa) return `<span style="color:#0284c7;font-weight:800;">${v.toLocaleString()}</span>`;
                return v.toLocaleString();
            }
            const rows = [
                { label: 'ทุนประกัน ตั้งต้น (บาท)', getVal: r => r.sa,                fmt: v => v > 0 ? v.toLocaleString() : '-', best: 'max' },
                { label: 'ทุนประกัน ปีที่ 10 (บาท)', getVal: r => saAtYear(r, 10),    fmt: fmtSaCell, best: 'max', raw: true },
                { label: 'ทุนประกัน ปีที่ 20 (บาท)', getVal: r => saAtYear(r, 20),    fmt: fmtSaCell, best: 'max', raw: true },
                { label: 'เบี้ย/ปี (บาท)',            getVal: r => r.annualPrem,       fmt: v => v > 0 ? v.toLocaleString() : '-', best: 'min' },
                { label: 'ชำระเบี้ย (ปี)',            getVal: r => r.plan.payYears,    fmt: v => v + ' ปี',                        best: 'min' },
                { label: 'คุ้มครองถึงอายุ',           getVal: r => r.plan.coverAge,    fmt: v => v + ' ปี',                        best: 'max' },
                { label: 'CV ปีที่ 10',               getVal: r => r.cv10,             fmt: v => v > 0 ? v.toLocaleString() : '-', best: 'max' },
                { label: 'CV ปีที่ 20',               getVal: r => r.cv20,             fmt: v => v > 0 ? v.toLocaleString() : '-', best: 'max' },
                { label: 'จุดคุ้มทุน (อายุ)',         getVal: r => r.beAge || 999,     fmt: v => v < 999 ? v + ' ปี' : '-',       best: 'min' },
            ];
            const hdrCells = results.map(r => `<th style="padding:10px 8px;background:${r.plan.color};color:white;font-size:11px;font-family:'Kanit',sans-serif;min-width:100px;text-align:center;white-space:nowrap;">${r.plan.label}</th>`).join('');
            const bodyRows = rows.map(row => {
                const vals = results.map(r => row.getVal(r));
                const positiveVals = vals.filter(v => v > 0 && v < 999);
                const bestVal = positiveVals.length ? (row.best === 'max' ? Math.max(...positiveVals) : Math.min(...positiveVals)) : null;
                const cells = results.map((r, i) => {
                    const val = vals[i]; const isBest = results.length > 1 && bestVal !== null && val === bestVal;
                    const star = isBest ? `<span style="color:${r.plan.color};font-size:9px;margin-right:2px;">★</span>` : '';
                    const display = row.raw ? row.fmt(val, r) : row.fmt(val);
                    return `<td style="padding:6px 10px;background:${isBest?r.plan.bg:'white'};text-align:right;font-size:12px;font-weight:${isBest?800:500};font-family:'Kanit',sans-serif;border-bottom:1px solid #f1f5f9;">${star}${display}</td>`;
                }).join('');
                return `<tr><td style="padding:6px 10px;font-size:11px;font-weight:600;color:#64748b;font-family:'Kanit',sans-serif;border-bottom:1px solid #f1f5f9;white-space:nowrap;">${row.label}</td>${cells}</tr>`;
            }).join('');
            tableHtml = `<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:12px;border:1px solid #e2e8f0;"><table style="width:100%;border-collapse:collapse;"><thead><tr><th style="padding:8px 10px;background:#f8fafc;font-size:10px;color:#94a3b8;font-family:'Kanit',sans-serif;text-align:left;">รายการ</th>${hdrCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>
            <div style="margin-top:6px;font-size:10px;color:#94a3b8;font-family:'Kanit',sans-serif;text-align:center;">★ = ดีที่สุดในกลุ่มที่เลือก &nbsp;|&nbsp; อายุ ${age} ปี &nbsp;${gender==='male'?'ชาย':'หญิง'} &nbsp;เบี้ย ${premium.toLocaleString()} บ./ปี</div>`;
        } else {
            tableHtml = `<div style="padding:20px;text-align:center;color:#94a3b8;font-family:'Kanit',sans-serif;">ไม่พบข้อมูลสำหรับอายุ ${age} ปี</div>`;
        }
        return `<div style="font-family:'Kanit',sans-serif;"><div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #f1f5f9;">${pills}</div>${tableHtml}</div>`;
    }

    window._cmpToggle = function(i) {
        const sel = window.__cmpState?.selected;
        if (!sel) return;
        if (sel.has(i)) { if (sel.size > 1) sel.delete(i); } else { sel.add(i); }
        const el = Swal.getHtmlContainer();
        if (el) el.innerHTML = build(sel);
    };
    return build(selected);
};

window.openCompareModal = function(preselect) {
    const age = parseInt(document.getElementById('ageInput')?.value) || 35;
    const gender = window.currentGender || 'male';
    const premium = parseInt(((document.getElementById('premiumInput')?.value) || '').replace(/,/g, '')) || 0;

    if (!premium || premium < 1000) {
        Swal.fire({ icon: 'warning', title: 'กรอกเบี้ยก่อน', text: 'กรุณากรอกเบี้ยประกันที่ต้องการเปรียบเทียบ', confirmButtonColor: '#0891b2' });
        return;
    }

    // ถ้ามี preselect (จาก long-press compare) ให้ override selected
    if (Array.isArray(preselect) && preselect.length) {
        const indices = preselect.map(name => _COMPARE_PLANS.findIndex(p => p.appPlan === name)).filter(i => i >= 0);
        if (indices.length) {
            window.__cmpPreselect = new Set(indices);
        }
    }

    Swal.fire({
        title: '<span style="font-family:Kanit,sans-serif;font-size:18px;">🔍 เทียบแบบประกัน</span>',
        html: window._buildCompareHTML(),
        showConfirmButton: false,
        showCloseButton: true,
        width: Math.min(window.innerWidth - 20, 780),
        didOpen: () => {
            const p = Swal.getPopup();
            if (p) p.style.borderRadius = '20px';
            const hc = Swal.getHtmlContainer();
            if (hc) {
                hc.style.overflowY = 'auto';
                hc.style.overflowX = 'hidden';
                hc.style.maxHeight = Math.round(window.innerHeight * 0.65) + 'px';
                hc.style.webkitOverflowScrolling = 'touch';
            }
        }
    });
};


// ==================== เทียบแผน 3D Health Excellence ====================

const _3D_HX_PACKAGES = [
    { code: 'HX15',  label: 'HX 15',  room: '1,500',  limit: '1,000,000',  color: '#0ea5e9', bg: '#f0f9ff' },
    { code: 'HX20',  label: 'HX 20',  room: '2,000',  limit: '3,000,000',  color: '#6366f1', bg: '#eef2ff' },
    { code: 'HX40',  label: 'HX 40',  room: '4,000',  limit: '5,000,000',  color: '#8b5cf6', bg: '#f5f3ff' },
    { code: 'HX60',  label: 'HX 60',  room: '6,000',  limit: '10,000,000', color: '#d97706', bg: '#fffbeb' },
    { code: 'HX150', label: 'HX 150', room: '15,000', limit: '60,000,000', color: '#dc2626', bg: '#fef2f2' },
    { code: 'HX300', label: 'HX 300', room: '30,000', limit: '120,000,000',color: '#be185d', bg: '#fdf2f8' },
];

window._build3DCompareHTML = function() {
    const age    = parseInt(document.getElementById('ageInput')?.value) || 35;
    const gender = window.currentGender || 'male';
    const clPlanCode = '20CL';
    const clRate = (typeof LIFE_RATES !== 'undefined') ? (LIFE_RATES[clPlanCode]?.[gender]?.[age] || 0) : 0;

    const results = _3D_HX_PACKAGES.map(pkg => {
        const hxPrem = (typeof getHealthRate === 'function') ? getHealthRate('HX', pkg.code, age, gender) : 0;
        if (!hxPrem && !clRate) return null;
        const minSum = 150000;
        const basePrem = clRate > 0 ? Math.round((minSum / 1000) * (clRate - (typeof getDiscount === 'function' ? getDiscount(minSum, clPlanCode) : 0))) : 0;
        return { pkg, data: { hxPrem, basePrem, totalPrem: basePrem + hxPrem } };
    }).filter(Boolean);

    if (!results.length) return `<div style="padding:20px;text-align:center;color:#94a3b8;font-family:'Kanit',sans-serif;">ไม่พบข้อมูลสำหรับอายุ ${age} ปี</div>`;

    const rows = [
        { label: 'ค่าห้อง (บาท/วัน)',       getVal: r => parseInt(r.pkg.room.replace(/,/g,'')),  fmt: (v,r) => r.pkg.room,  best: 'max' },
        { label: 'วงเงินเหมาจ่าย (บาท/ปี)', getVal: r => parseInt(r.pkg.limit.replace(/,/g,'')), fmt: (v,r) => r.pkg.limit, best: 'max' },
        { label: 'เบี้ย HX (บาท/ปี)',        getVal: r => r.data.hxPrem,    fmt: v => v > 0 ? v.toLocaleString() : '-', best: 'min' },
        { label: 'เบี้ย CL ฐาน* (บาท/ปี)',  getVal: r => r.data.basePrem,  fmt: v => v > 0 ? v.toLocaleString() : '-', best: null },
        { label: 'รวมเบี้ย/ปี (บาท)',        getVal: r => r.data.totalPrem, fmt: v => v > 0 ? v.toLocaleString() : '-', best: 'min' },
    ];
    const hdrCells = results.map(r => `<th style="padding:8px 10px;background:${r.pkg.color};color:white;font-size:11px;font-family:'Kanit',sans-serif;min-width:90px;text-align:center;white-space:nowrap;">${r.pkg.label}</th>`).join('');
    const bodyRows = rows.map(row => {
        const vals = results.map(r => row.getVal(r));
        const pVals = vals.filter(v => v > 0);
        const bestVal = row.best && pVals.length ? (row.best === 'max' ? Math.max(...pVals) : Math.min(...pVals)) : null;
        const cells = results.map((r,i) => {
            const val = vals[i]; const isBest = bestVal !== null && val === bestVal;
            const star = isBest ? `<span style="color:${r.pkg.color};font-size:9px;margin-right:2px;">★</span>` : '';
            return `<td style="padding:6px 10px;background:${isBest?r.pkg.bg:'white'};text-align:right;font-size:12px;font-weight:${isBest?800:500};font-family:'Kanit',sans-serif;border-bottom:1px solid #f1f5f9;">${star}${row.fmt(val,r)}</td>`;
        }).join('');
        return `<tr><td style="padding:6px 10px;font-size:11px;font-weight:600;color:#64748b;font-family:'Kanit',sans-serif;border-bottom:1px solid #f1f5f9;white-space:nowrap;">${row.label}</td>${cells}</tr>`;
    }).join('');

    return `<div style="font-family:'Kanit',sans-serif;">
        <div style="overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0;">
            <table style="width:100%;border-collapse:collapse;">
                <thead><tr><th style="padding:8px 10px;background:#f8fafc;font-size:10px;color:#94a3b8;font-family:'Kanit',sans-serif;text-align:left;">รายการ</th>${hdrCells}</tr></thead>
                <tbody>${bodyRows}</tbody>
            </table>
        </div>
        <div style="margin-top:8px;font-size:10px;color:#94a3b8;font-family:'Kanit',sans-serif;line-height:1.6;">
            ★ = ดีที่สุดในกลุ่ม &nbsp;|&nbsp; อายุ ${age} ปี &nbsp;${gender==='male'?'ชาย':'หญิง'}<br>
            * เบี้ย CL ฐาน = ทุนประกัน 150,000 บ. (ขั้นต่ำ 3D) &nbsp;|&nbsp; ยังไม่รวม OPD / ชดเชยรายวัน
        </div>
    </div>`;
};

window.openCompare3DModal = function() {
    Swal.fire({
        title: '<span style="font-family:Kanit,sans-serif;font-size:17px;">🏥 เทียบแผน 3D Health Excellence</span>',
        html: window._build3DCompareHTML(),
        showConfirmButton: false,
        showCloseButton: true,
        width: Math.min(window.innerWidth - 20, 780),
        didOpen: () => {
            const p = Swal.getPopup();
            if (p) p.style.borderRadius = '20px';
            const hc = Swal.getHtmlContainer();
            if (hc) {
                hc.style.overflowY = 'auto';
                hc.style.overflowX = 'hidden';
                hc.style.maxHeight = Math.round(window.innerHeight * 0.65) + 'px';
                hc.style.webkitOverflowScrolling = 'touch';
            }
        }
    });
};

// ==================== ค้นหาโรงพยาบาลคู่สัญญา ====================

window.openHospitalSearch = function() {
    const allHospitals = window.CHUBB_HOSPITALS || [];
    const provinces = [...new Set(allHospitals.map(h => h.j).filter(Boolean))].sort((a, b) => {
        if (a === 'กรุงเทพมหานคร') return -1;
        if (b === 'กรุงเทพมหานคร') return 1;
        return a.localeCompare(b, 'th');
    });

    function renderList(query, province) {
        const q = (query || '').trim().toLowerCase();
        const filtered = allHospitals.filter(h => {
            const matchProv = !province || h.j === province;
            const matchQ = !q || h.n.toLowerCase().includes(q) || (h.j||'').includes(q) || (h.a||'').includes(q);
            return matchProv && matchQ;
        });
        if (!filtered.length) return '<div style="padding:20px;text-align:center;color:#94a3b8;font-family:Kanit,sans-serif;font-size:13px;">ไม่พบโรงพยาบาลที่ค้นหา</div>';
        const items = filtered.slice(0, 80).map(function(h) {
            var isIPD = h.n.includes('IPD');
            var isClinic = h.n.startsWith('คลินิก');
            var isSP = h.n.startsWith('สถานพยาบาล');
            var typeColor = isClinic ? '#7c3aed' : isSP ? '#d97706' : '#0891b2';
            var shortName = h.n.replace(/^โรงพยาบาล|^คลินิก|^สถานพยาบาล/, '').trim();
            return '<div style="padding:10px 12px;border-bottom:1px solid #f1f5f9;display:flex;gap:10px;align-items:flex-start;">' +
                '<div style="width:32px;height:32px;border-radius:10px;background:' + typeColor + '22;flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-top:2px;">' +
                '<i class="fas fa-hospital-alt" style="color:' + typeColor + ';font-size:14px;"></i></div>' +
                '<div style="flex:1;min-width:0;">' +
                '<div style="font-family:Kanit,sans-serif;font-size:12px;font-weight:700;color:#1e293b;line-height:1.4;">' + shortName + (isIPD ? '<span style="font-size:9px;background:#fef3c7;color:#d97706;padding:1px 5px;border-radius:5px;margin-left:4px;font-weight:700;">IPD only</span>' : '') + '</div>' +
                '<div style="font-family:Kanit,sans-serif;font-size:11px;color:#64748b;margin-top:1px;">' + h.j + (h.a ? ' · ' + h.a : '') + '</div>' +
                '<div style="font-family:Kanit,sans-serif;font-size:11px;color:#0891b2;margin-top:1px;"><i class="fas fa-phone" style="font-size:9px;margin-right:3px;"></i>' + h.p + '</div>' +
                '</div></div>';
        }).join('');
        var more = filtered.length > 80 ? '<div style="padding:10px;text-align:center;font-family:Kanit,sans-serif;font-size:11px;color:#94a3b8;">แสดง 80 จาก ' + filtered.length + ' รายการ — พิมพ์เพื่อกรอง</div>' : '';
        return items + more;
    }

    var provinceOptions = provinces.map(function(p) { return '<option value="' + p + '">' + p + '</option>'; }).join('');

    Swal.fire({
        title: '<span style="font-family:Kanit,sans-serif;font-size:17px;">🏥 โรงพยาบาลคู่สัญญา Chubb Life</span>',
        html: '<div style="font-family:Kanit,sans-serif;">' +
            '<div style="display:flex;gap:8px;margin-bottom:8px;">' +
            '<input id="_hospSearchInput" type="text" placeholder="ค้นหาชื่อ..." style="flex:1;padding:10px 12px;border:1.5px solid #e2e8f0;border-radius:12px;font-family:Kanit,sans-serif;font-size:13px;outline:none;min-width:0;" oninput="window._hospRefresh()">' +
            '<select id="_hospProvSelect" style="padding:8px 10px;border:1.5px solid #e2e8f0;border-radius:12px;font-family:Kanit,sans-serif;font-size:12px;background:white;color:#374151;max-width:120px;" onchange="window._hospRefresh()">' +
            '<option value="">ทุกจังหวัด</option>' + provinceOptions + '</select></div>' +
            '<div id="_hospList" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;max-height:360px;overflow-y:auto;-webkit-overflow-scrolling:touch;">' +
            renderList('', '') + '</div>' +
            '<div style="margin-top:6px;font-size:10px;color:#94a3b8;text-align:center;">อัปเดต เมษายน 2567 · รวม ' + allHospitals.length + ' สาขา ทั่วประเทศ</div></div>',
        showConfirmButton: false,
        showCloseButton: true,
        width: Math.min(window.innerWidth - 16, 600),
        didOpen: function() {
            var pop = Swal.getPopup();
            if (pop) pop.style.borderRadius = '20px';
            var hc = Swal.getHtmlContainer();
            if (hc) { hc.style.padding = '0 16px 8px'; hc.style.overflowX = 'hidden'; }
            window._hospRefresh = function() {
                var q = document.getElementById('_hospSearchInput') ? document.getElementById('_hospSearchInput').value : '';
                var prov = document.getElementById('_hospProvSelect') ? document.getElementById('_hospProvSelect').value : '';
                var list = document.getElementById('_hospList');
                if (list) list.innerHTML = renderList(q, prov);
            };
            setTimeout(function() { var el = document.getElementById('_hospSearchInput'); if (el) el.focus(); }, 150);
        },
        willClose: function() { delete window._hospRefresh; }
    });
};
