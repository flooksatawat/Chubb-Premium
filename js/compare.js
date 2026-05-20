// ==================== เทียบแบบ (PLAN COMPARISON) ====================

const _COMPARE_PLANS = [
    { appPlan: 'CI Extra Plus',          planCode: '20CX',   label: 'CI Extra Plus',         abbr: 'CX',    payYears: 20, coverAge: 85,  color: '#e11d48', bg: '#fff1f2' },
    { appPlan: 'Life Protector 20',      planCode: '20LPB',  label: 'Life Protector 20',     abbr: 'LPB',   payYears: 20, coverAge: 90,  color: '#059669', bg: '#ecfdf5' },
    { appPlan: 'Supreme Life Protector', planCode: '20SLPA', label: 'Supreme Life Protector', abbr: 'SLPA',  payYears: 20, coverAge: 90,  color: '#0891b2', bg: '#ecfeff' },
    { appPlan: 'Signature Legacy',       planCode: '10SLB',  label: 'Signature Legacy',      abbr: 'SLB',   payYears: 10, coverAge: 99,  color: '#d97706', bg: '#fffbeb' },
    { appPlan: 'Century Life',           planCode: '20CL',   label: 'Century Life 20',       abbr: 'CL',    payYears: 20, coverAge: 100, color: '#7c3aed', bg: '#f5f3ff' },
    { appPlan: 'Whole Life Extra',       planCode: 'WXN10',  label: 'Whole Life Extra',      abbr: 'WXN',   payYears: 10, coverAge: 99,  color: '#4f46e5', bg: '#eef2ff' },
    { appPlan: '24 TX',                  planCode: '24TX',   label: '24 TX',                 abbr: 'TX',    payYears: 24, coverAge: 99,  color: '#0284c7', bg: '#eff6ff' },
    { appPlan: '868 / 818 Elite Saving', planCode: 'S868',   label: '868 Elite Saving',      abbr: 'Elite', payYears: 8,  coverAge: 99,  color: '#9333ea', bg: '#faf5ff' },
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
    const coverYears = Math.min(plan.coverAge - age, 60);
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

    return { sa, annualPrem, cv10, cv20, beAge };
}

window.openCompareModal = function() {
    const age = parseInt(document.getElementById('ageInput')?.value) || 35;
    const gender = window.currentGender || 'male';
    const premInput = document.getElementById('premiumInput');
    const premium = parseInt((premInput?.value || '').replace(/,/g, '')) || 0;

    if (!premium || premium < 1000) {
        Swal.fire({ icon: 'warning', title: 'กรอกเบี้ยก่อน', text: 'กรุณากรอกเบี้ยประกันที่ต้องการเปรียบเทียบ', confirmButtonColor: '#0891b2' });
        return;
    }

    const defaultIdx = _COMPARE_PLANS.findIndex(p => p.appPlan === (window.currentAppPlan || ''));
    let selected = new Set(defaultIdx >= 0 ? [defaultIdx] : [0]);

    function buildHTML() {
        const pills = _COMPARE_PLANS.map((p, i) => {
            const on = selected.has(i);
            const bg   = on ? p.color : 'white';
            const col  = on ? 'white' : p.color;
            return `<button onclick="window._cmpToggle(${i})" style="padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;font-family:'Kanit',sans-serif;cursor:pointer;border:2px solid ${p.color};background:${bg};color:${col};transition:all 0.15s;margin:2px;">${p.abbr}</button>`;
        }).join('');

        const results = [];
        for (const i of selected) {
            const p = _COMPARE_PLANS[i];
            const r = _compareCalcOne(p, gender, age, premium);
            if (r) results.push({ plan: p, ...r });
        }

        let tableHtml = '';
        if (results.length > 0) {
            const rows = [
                { label: 'ทุนประกัน (บาท)', getVal: r => r.sa,           fmt: v => v > 0 ? v.toLocaleString() : '-', best: 'max' },
                { label: 'เบี้ย/ปี (บาท)',  getVal: r => r.annualPrem,   fmt: v => v > 0 ? v.toLocaleString() : '-', best: 'min' },
                { label: 'ชำระเบี้ย (ปี)',  getVal: r => r.plan.payYears, fmt: v => v + ' ปี',                        best: 'min' },
                { label: 'คุ้มครองถึงอายุ', getVal: r => r.plan.coverAge, fmt: v => v + ' ปี',                        best: 'max' },
                { label: 'CV ปีที่ 10',     getVal: r => r.cv10,          fmt: v => v > 0 ? v.toLocaleString() : '-', best: 'max' },
                { label: 'CV ปีที่ 20',     getVal: r => r.cv20,          fmt: v => v > 0 ? v.toLocaleString() : '-', best: 'max' },
                { label: 'จุดคุ้มทุน (อายุ)',getVal: r => r.beAge || 999, fmt: v => v < 999 ? v + ' ปี' : '-',       best: 'min' },
            ];

            const hdrCells = results.map(r =>
                `<th style="padding:8px 10px;background:${r.plan.color};color:white;font-size:11px;font-family:'Kanit',sans-serif;min-width:100px;text-align:center;white-space:nowrap;">${r.plan.label}</th>`
            ).join('');

            const bodyRows = rows.map(row => {
                const vals = results.map(r => row.getVal(r));
                const positiveVals = vals.filter(v => v > 0 && v < 999);
                const bestVal = positiveVals.length > 0
                    ? (row.best === 'max' ? Math.max(...positiveVals) : Math.min(...positiveVals))
                    : null;

                const cells = results.map((r, i) => {
                    const val = vals[i];
                    const isBest = results.length > 1 && bestVal !== null && val === bestVal;
                    const bgCell = isBest ? r.plan.bg : 'white';
                    const fw = isBest ? '800' : '500';
                    const star = isBest ? '<span style="color:' + r.plan.color + ';font-size:9px;margin-right:2px;">★</span>' : '';
                    return `<td style="padding:6px 10px;background:${bgCell};text-align:right;font-size:12px;font-weight:${fw};font-family:'Kanit',sans-serif;border-bottom:1px solid #f1f5f9;">${star}${row.fmt(val)}</td>`;
                }).join('');

                return `<tr><td style="padding:6px 10px;font-size:11px;font-weight:600;color:#64748b;font-family:'Kanit',sans-serif;border-bottom:1px solid #f1f5f9;white-space:nowrap;">${row.label}</td>${cells}</tr>`;
            }).join('');

            tableHtml = `<div style="overflow-x:auto;margin-top:12px;border-radius:12px;border:1px solid #e2e8f0;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead><tr><th style="padding:8px 10px;background:#f8fafc;font-size:10px;color:#94a3b8;font-family:'Kanit',sans-serif;text-align:left;">รายการ</th>${hdrCells}</tr></thead>
                    <tbody>${bodyRows}</tbody>
                </table>
            </div>
            <div style="margin-top:6px;font-size:10px;color:#94a3b8;font-family:'Kanit',sans-serif;text-align:center;">★ = ดีที่สุดในกลุ่มที่เลือก &nbsp;|&nbsp; อายุ ${age} ปี &nbsp;${gender === 'male' ? 'ชาย' : 'หญิง'} &nbsp;เบี้ย ${premium.toLocaleString()} บ./ปี</div>`;
        } else {
            tableHtml = `<div style="padding:20px;text-align:center;color:#94a3b8;font-family:'Kanit',sans-serif;font-size:13px;">แผนที่เลือกไม่รองรับอายุ ${age} ปี หรือยังไม่มีข้อมูล</div>`;
        }

        return `<div style="font-family:'Kanit',sans-serif;">
            <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #f1f5f9;">${pills}</div>
            ${tableHtml}
        </div>`;
    }

    window._cmpToggle = function(i) {
        if (selected.has(i)) {
            if (selected.size > 1) selected.delete(i);
        } else {
            selected.add(i);
        }
        const el = Swal.getHtmlContainer();
        if (el) el.innerHTML = buildHTML();
    };

    Swal.fire({
        title: '<span style="font-family:Kanit,sans-serif;font-size:18px;">🔍 เทียบแบบประกัน</span>',
        html: buildHTML(),
        showConfirmButton: false,
        showCloseButton: true,
        width: Math.min(window.innerWidth - 20, 780),
        didOpen: () => {
            const popup = Swal.getPopup();
            if (popup) popup.style.borderRadius = '20px';
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

window.openCompare3DModal = function() {
    const age    = parseInt(document.getElementById('ageInput')?.value) || 35;
    const gender = window.currentGender || 'male';

    // base CL rate for 3D (uses 20CL)
    const clPlanCode = '20CL';
    const clRate = (typeof LIFE_RATES !== 'undefined') ? (LIFE_RATES[clPlanCode]?.[gender]?.[age] || 0) : 0;

    // คำนวณเบี้ยแต่ละ package
    function getPkgData(pkg) {
        const hxPrem = (typeof getHealthRate === 'function') ? getHealthRate('HX', pkg.code, age, gender) : 0;
        if (!hxPrem && !clRate) return null;
        // ทุนประกัน CL ขั้นต่ำ 150,000 (3D minSum)
        const minSum = 150000;
        const basePrem = clRate > 0 ? Math.round((minSum / 1000) * (clRate - (typeof getDiscount === 'function' ? getDiscount(minSum, clPlanCode) : 0))) : 0;
        const totalPrem = basePrem + hxPrem;
        return { hxPrem, basePrem, totalPrem };
    }

    function buildHTML() {
        const results = _3D_HX_PACKAGES.map(pkg => ({ pkg, data: getPkgData(pkg) })).filter(r => r.data);

        if (!results.length) {
            return `<div style="padding:20px;text-align:center;color:#94a3b8;font-family:'Kanit',sans-serif;">ไม่พบข้อมูลสำหรับอายุ ${age} ปี</div>`;
        }

        const rows = [
            { label: 'ค่าห้อง (บาท/วัน)',        getVal: r => parseInt(r.pkg.room.replace(/,/g,'')),    fmt: (v, r) => r.pkg.room,   best: 'max' },
            { label: 'วงเงินเหมาจ่าย (บาท/ปี)',  getVal: r => parseInt(r.pkg.limit.replace(/,/g,'')),   fmt: (v, r) => r.pkg.limit,  best: 'max' },
            { label: 'เบี้ย HX (บาท/ปี)',         getVal: r => r.data.hxPrem,   fmt: (v) => v > 0 ? v.toLocaleString() : '-',  best: 'min' },
            { label: 'เบี้ย CL ฐาน* (บาท/ปี)',   getVal: r => r.data.basePrem,  fmt: (v) => v > 0 ? v.toLocaleString() : '-', best: null },
            { label: 'รวมเบี้ย/ปี (บาท)',         getVal: r => r.data.totalPrem, fmt: (v) => v > 0 ? v.toLocaleString() : '-', best: 'min' },
        ];

        const hdrCells = results.map(r =>
            `<th style="padding:8px 10px;background:${r.pkg.color};color:white;font-size:11px;font-family:'Kanit',sans-serif;min-width:90px;text-align:center;white-space:nowrap;">${r.pkg.label}</th>`
        ).join('');

        const bodyRows = rows.map(row => {
            const vals = results.map(r => row.getVal(r));
            const positiveVals = vals.filter(v => v > 0);
            const bestVal = row.best && positiveVals.length > 0
                ? (row.best === 'max' ? Math.max(...positiveVals) : Math.min(...positiveVals))
                : null;

            const cells = results.map((r, i) => {
                const val = vals[i];
                const isBest = bestVal !== null && val === bestVal && results.length > 1;
                const bgCell = isBest ? r.pkg.bg : 'white';
                const fw = isBest ? '800' : '500';
                const star = isBest ? '<span style="color:' + r.pkg.color + ';font-size:9px;margin-right:2px;">★</span>' : '';
                return `<td style="padding:6px 10px;background:${bgCell};text-align:right;font-size:12px;font-weight:${fw};font-family:'Kanit',sans-serif;border-bottom:1px solid #f1f5f9;">${star}${row.fmt(val, r)}</td>`;
            }).join('');

            return `<tr><td style="padding:6px 10px;font-size:11px;font-weight:600;color:#64748b;font-family:'Kanit',sans-serif;border-bottom:1px solid #f1f5f9;white-space:nowrap;">${row.label}</td>${cells}</tr>`;
        }).join('');

        return `<div style="font-family:'Kanit',sans-serif;">
            <div style="overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead><tr>
                        <th style="padding:8px 10px;background:#f8fafc;font-size:10px;color:#94a3b8;font-family:'Kanit',sans-serif;text-align:left;">รายการ</th>
                        ${hdrCells}
                    </tr></thead>
                    <tbody>${bodyRows}</tbody>
                </table>
            </div>
            <div style="margin-top:8px;font-size:10px;color:#94a3b8;font-family:'Kanit',sans-serif;text-align:left;line-height:1.6;">
                ★ = ดีที่สุดในกลุ่ม &nbsp;|&nbsp; อายุ ${age} ปี &nbsp;${gender === 'male' ? 'ชาย' : 'หญิง'}<br>
                * เบี้ย CL ฐาน = ทุนประกัน 150,000 บ. (ขั้นต่ำ 3D) &nbsp;|&nbsp; ยังไม่รวม OPD / ชดเชยรายวัน
            </div>
        </div>`;
    }

    Swal.fire({
        title: '<span style="font-family:Kanit,sans-serif;font-size:17px;">🏥 เทียบแผน 3D Health Excellence</span>',
        html: buildHTML(),
        showConfirmButton: false,
        showCloseButton: true,
        width: Math.min(window.innerWidth - 20, 780),
        didOpen: () => {
            const popup = Swal.getPopup();
            if (popup) popup.style.borderRadius = '20px';
        }
    });
};
