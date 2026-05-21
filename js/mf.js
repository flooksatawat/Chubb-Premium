// ==================== Medical Fund (MF) Calculator ====================

window._mfData = { companies: null, rates: {} };
window._mfState = {
    company: null,
    plan: null,
    roomRate: null,
    gender: 'male',
    age: 20,
    ageStart: null,
    ageEnd: null
};

async function mfInit() {
    if (!window._mfData.companies) {
        try {
            const res = await fetch('data/MF/companies.json');
            window._mfData.companies = await res.json();
        } catch (e) {
            window._mfData.companies = { companies: [] };
        }
    }
    mfRenderCompanies();
    mfRenderPlanSelectors();
}

async function mfLoadRates(companyId) {
    if (window._mfData.rates[companyId]) return window._mfData.rates[companyId];
    try {
        const res = await fetch(`data/MF/${companyId}.json`);
        if (!res.ok) throw new Error('not found');
        window._mfData.rates[companyId] = await res.json();
    } catch (e) {
        window._mfData.rates[companyId] = {};
    }
    return window._mfData.rates[companyId];
}

function mfRenderCompanies() {
    const companies = window._mfData.companies?.companies || [];
    const sel = document.getElementById('mfCompanySelect');
    if (!sel) return;
    sel.innerHTML = `<option value="">— เลือกบริษัท —</option>` +
        companies.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    sel.value = window._mfState.company || '';
}

function mfRenderPlanSelectors() {
    const companies = window._mfData.companies?.companies || [];
    const company = companies.find(c => c.id === window._mfState.company);
    const plans = company?.plans || [];

    const planSel = document.getElementById('mfPlanSelect');
    const planRow = document.getElementById('mfPlanRow');
    if (!planSel || !planRow) return;

    if (plans.length === 0) {
        planRow.classList.add('hidden');
        planSel.value = '';
        window._mfState.plan = null;
    } else {
        planRow.classList.remove('hidden');
        planSel.innerHTML = `<option value="">— เลือกแผน —</option>` +
            plans.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        planSel.value = window._mfState.plan || '';
    }

    mfRenderRoomRateSelector();
}

function mfRenderRoomRateSelector() {
    const companies = window._mfData.companies?.companies || [];
    const company = companies.find(c => c.id === window._mfState.company);
    const plan = company?.plans?.find(p => p.id === window._mfState.plan);

    const rrSel = document.getElementById('mfRoomRateSelect');
    const rrRow = document.getElementById('mfRoomRateRow');
    if (!rrSel || !rrRow) return;

    if (plan?.hasRoomRate && plan.roomRates?.length) {
        rrRow.classList.remove('hidden');
        rrSel.innerHTML = `<option value="">— เลือกวงเงิน —</option>` +
            plan.roomRates.map(r => `<option value="${r}">${r}</option>`).join('');
        rrSel.value = window._mfState.roomRate || '';
    } else {
        rrRow.classList.add('hidden');
        rrSel.value = '';
        window._mfState.roomRate = null;
    }
}

window.mfSelectCompany = async function(val) {
    window._mfState.company = val || null;
    window._mfState.plan = null;
    window._mfState.roomRate = null;
    mfRenderPlanSelectors();
    document.getElementById('mfResultArea').innerHTML = '';
    if (val) await mfLoadRates(val);
};

window.mfSelectPlan = function(val) {
    window._mfState.plan = val || null;
    window._mfState.roomRate = null;
    mfRenderRoomRateSelector();
    document.getElementById('mfResultArea').innerHTML = '';
};

window.mfSelectRoomRate = function(val) {
    window._mfState.roomRate = val || null;
    document.getElementById('mfResultArea').innerHTML = '';
};

window.mfSetGender = function(g) {
    window._mfState.gender = g;
    document.getElementById('mfBtnMale').classList.toggle('text-blue-700', g === 'male');
    document.getElementById('mfBtnMale').classList.toggle('font-bold', g === 'male');
    document.getElementById('mfBtnFemale').classList.toggle('text-pink-600', g === 'female');
    document.getElementById('mfBtnFemale').classList.toggle('font-bold', g === 'female');
    document.getElementById('mfResultArea').innerHTML = '';
};

window.mfCalculate = async function() {
    const { company, plan, roomRate, gender } = window._mfState;
    const ageStartEl = document.getElementById('mfAgeStart');
    const ageEndEl = document.getElementById('mfAgeEnd');
    const ageStart = parseInt(ageStartEl?.value) || 1;
    const ageEnd = parseInt(ageEndEl?.value) || 70;

    if (!company) { mfShowError('กรุณาเลือกบริษัท'); return; }
    if (!plan) { mfShowError('กรุณาเลือกแผนประกัน'); return; }

    const rates = await mfLoadRates(company);
    const planData = rates[plan];
    if (!planData) { mfShowError('ยังไม่มีข้อมูลอัตราเบี้ยของแผนนี้'); return; }

    let rateTable = roomRate ? planData[roomRate]?.[gender] : planData[gender];
    if (!rateTable) { mfShowError('ยังไม่มีข้อมูลอัตราเบี้ยของแผนนี้'); return; }

    const companies = window._mfData.companies?.companies || [];
    const companyName = companies.find(c => c.id === company)?.name || company;
    const planName = planData.name || plan;
    const planAgeRange = planData.ageRange || [1, 70];
    const start = Math.max(ageStart, planAgeRange[0]);
    const end = Math.min(ageEnd, planAgeRange[1]);

    let rows = '';
    let total = 0;
    let hasData = false;
    for (let age = start; age <= end; age++) {
        const prem = rateTable[String(age)] ?? rateTable[age] ?? null;
        const premStr = prem != null ? prem.toLocaleString('en-US') : '—';
        if (prem != null) { total += prem; hasData = true; }
        rows += `<tr class="${age % 2 === 0 ? 'bg-white' : 'bg-sky-50/40'}">
            <td class="py-2 px-3 text-center text-[12px] font-bold text-slate-700">${age}</td>
            <td class="py-2 px-3 text-right text-[12px] font-bold ${prem != null ? 'text-slate-800' : 'text-slate-400'}">${premStr}</td>
        </tr>`;
    }

    const totalStr = hasData ? total.toLocaleString('en-US') : '—';
    const roomLabel = roomRate ? ` · ${roomRate}` : '';

    document.getElementById('mfResultArea').innerHTML = `
        <div class="mt-4">
            <div class="flex justify-between items-center mb-2 px-1">
                <span class="text-[12px] font-bold text-sky-700">${companyName} · ${planName}${roomLabel}</span>
                <span class="text-[11px] text-slate-500">${gender === 'male' ? 'ชาย' : 'หญิง'} | อายุ ${start}–${end} ปี</span>
            </div>
            <div class="rounded-[14px] overflow-hidden border border-sky-200 shadow-sm">
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="bg-gradient-to-r from-sky-500 to-cyan-600 text-white">
                            <th class="py-2.5 px-3 text-center text-[11px] font-bold">อายุ (ปี)</th>
                            <th class="py-2.5 px-3 text-right text-[11px] font-bold">เบี้ย (บาท/ปี)</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                    <tfoot>
                        <tr class="bg-sky-600 text-white">
                            <td class="py-2.5 px-3 text-[12px] font-bold">รวมทั้งหมด</td>
                            <td class="py-2.5 px-3 text-right text-[13px] font-black">${totalStr}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            ${!hasData ? `<p class="text-center text-[11px] text-slate-400 mt-3"><i class="fas fa-info-circle mr-1"></i>ยังไม่มีข้อมูลอัตราเบี้ย — จะอัปเดตเร็วๆ นี้</p>` : ''}
        </div>`;
};

function mfShowError(msg) {
    document.getElementById('mfResultArea').innerHTML =
        `<p class="text-center text-[12px] text-red-500 mt-4"><i class="fas fa-exclamation-circle mr-1"></i>${msg}</p>`;
}

window.openMFCalculator = async function() {
    const modal = document.getElementById('mfCalculatorModal');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('show'), 10);
    await mfInit();
};

// ==================== MF Inline (plan view from main selector) ====================

window._mfInline = { company: null, plan: null, roomRate: null };

window.mfInlineInit = async function() {
    if (!window._mfData.companies) {
        try {
            const res = await fetch('data/MF/companies.json');
            window._mfData.companies = await res.json();
        } catch (e) { window._mfData.companies = { companies: [] }; }
    }
    const companies = window._mfData.companies?.companies || [];
    const sel = document.getElementById('mfInlineCompany');
    if (!sel) return;
    const p = window._mfInline;
    sel.innerHTML = `<option value="">— เลือกบริษัท —</option>` +
        companies.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    sel.value = p.company || '';

    const planRow = document.getElementById('mfInlinePlanRow');
    const planSel = document.getElementById('mfInlinePlan');
    const co = companies.find(c => c.id === p.company);
    if (p.company && co?.plans?.length) {
        planRow.classList.remove('hidden');
        planSel.innerHTML = `<option value="">— เลือกแผน —</option>` +
            co.plans.map(pl => `<option value="${pl.id}">${pl.name}</option>`).join('');
        planSel.value = p.plan || '';
    } else {
        planRow.classList.add('hidden');
    }

    const plan = co?.plans?.find(pl => pl.id === p.plan);
    const rrRow = document.getElementById('mfInlineRoomRow');
    const rrSel = document.getElementById('mfInlineRoom');
    if (plan?.hasRoomRate && plan.roomRates?.length) {
        rrRow.classList.remove('hidden');
        rrSel.innerHTML = `<option value="">— เลือกวงเงิน —</option>` +
            plan.roomRates.map(r => `<option value="${r}">${r}</option>`).join('');
        rrSel.value = p.roomRate || '';
    } else {
        rrRow.classList.add('hidden');
    }

    if (p.company) await mfLoadRates(p.company);
    window.mfInlineRender();
};

window.mfInlineSelectCompany = async function(val) {
    window._mfInline = { company: val || null, plan: null, roomRate: null };
    const companies = window._mfData.companies?.companies || [];
    const co = companies.find(c => c.id === val);
    const plans = co?.plans || [];
    const planRow = document.getElementById('mfInlinePlanRow');
    const planSel = document.getElementById('mfInlinePlan');
    const rrRow = document.getElementById('mfInlineRoomRow');
    if (plans.length) {
        planRow.classList.remove('hidden');
        planSel.innerHTML = `<option value="">— เลือกแผน —</option>` +
            plans.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    } else {
        planRow.classList.add('hidden');
    }
    rrRow.classList.add('hidden');
    if (val) await mfLoadRates(val);
    window.mfInlineRender();
};

window.mfInlineSelectPlan = function(val) {
    window._mfInline.plan = val || null;
    window._mfInline.roomRate = null;
    const companies = window._mfData.companies?.companies || [];
    const co = companies.find(c => c.id === window._mfInline.company);
    const plan = co?.plans?.find(p => p.id === val);
    const rrRow = document.getElementById('mfInlineRoomRow');
    const rrSel = document.getElementById('mfInlineRoom');
    if (plan?.hasRoomRate && plan.roomRates?.length) {
        rrRow.classList.remove('hidden');
        rrSel.innerHTML = `<option value="">— เลือกวงเงิน —</option>` +
            plan.roomRates.map(r => `<option value="${r}">${r}</option>`).join('');
    } else {
        rrRow.classList.add('hidden');
    }
    window.mfInlineRender();
};

window.mfInlineSelectRoom = function(val) {
    window._mfInline.roomRate = val || null;
    window.mfInlineRender();
};

window.mfInlineRender = function() {
    // No inline result — table shows in tableView via NAV ตาราง
    // If tableView is currently active, refresh it
    const tv = document.getElementById('tableView');
    const rp = document.getElementById('rightPane');
    const tableActive = tv && (tv.style.display !== 'none' || (rp && tv.parentElement === rp));
    if (tableActive && typeof generatePolicyTableData === 'function') generatePolicyTableData();
};

// ==================== MF Picker (rider for 24TX/Elite/WXN) ====================

window._mfPicker = { company: null, plan: null, roomRate: null };

async function mfPickerInit() {
    if (!window._mfData.companies) {
        try {
            const res = await fetch('data/MF/companies.json');
            window._mfData.companies = await res.json();
        } catch(e) { window._mfData.companies = { companies: [] }; }
    }
    const companies = window._mfData.companies?.companies || [];
    const sel = document.getElementById('mfPickerCompany');
    if (!sel) return;
    sel.innerHTML = `<option value="">— เลือกบริษัท —</option>` +
        companies.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    // restore previous selection
    const p = window._mfPicker;
    sel.value = p.company || '';
    document.getElementById('mfPickerPlanRow').classList.toggle('hidden', !p.company);
    if (p.company) {
        const co = companies.find(c => c.id === p.company);
        const planSel = document.getElementById('mfPickerPlan');
        planSel.innerHTML = `<option value="">— เลือกแผน —</option>` +
            (co?.plans || []).map(pl => `<option value="${pl.id}">${pl.name}</option>`).join('');
        planSel.value = p.plan || '';
        const plan = co?.plans?.find(pl => pl.id === p.plan);
        const rrRow = document.getElementById('mfPickerRoomRow');
        if (plan?.hasRoomRate && plan.roomRates?.length) {
            rrRow.classList.remove('hidden');
            const rrSel = document.getElementById('mfPickerRoom');
            rrSel.innerHTML = `<option value="">— เลือกวงเงิน —</option>` +
                plan.roomRates.map(r => `<option value="${r}">${r}</option>`).join('');
            rrSel.value = p.roomRate || '';
        } else {
            rrRow.classList.add('hidden');
        }
    }
    mfPickerUpdateConfirm();
}

window.openMFPicker = async function() {
    const modal = document.getElementById('mfPlanModal');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('show'), 10);
    await mfPickerInit();
};

window.mfPickerSelectCompany = function(val) {
    window._mfPicker = { company: val || null, plan: null, roomRate: null };
    const companies = window._mfData.companies?.companies || [];
    const co = companies.find(c => c.id === val);
    const plans = co?.plans || [];
    const planRow = document.getElementById('mfPickerPlanRow');
    const planSel = document.getElementById('mfPickerPlan');
    const rrRow = document.getElementById('mfPickerRoomRow');
    if (plans.length) {
        planRow.classList.remove('hidden');
        planSel.innerHTML = `<option value="">— เลือกแผน —</option>` +
            plans.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    } else {
        planRow.classList.add('hidden');
    }
    rrRow.classList.add('hidden');
    mfPickerUpdateConfirm();
};

window.mfPickerSelectPlan = function(val) {
    window._mfPicker.plan = val || null;
    window._mfPicker.roomRate = null;
    const companies = window._mfData.companies?.companies || [];
    const co = companies.find(c => c.id === window._mfPicker.company);
    const plan = co?.plans?.find(p => p.id === val);
    const rrRow = document.getElementById('mfPickerRoomRow');
    const rrSel = document.getElementById('mfPickerRoom');
    if (plan?.hasRoomRate && plan.roomRates?.length) {
        rrRow.classList.remove('hidden');
        rrSel.innerHTML = `<option value="">— เลือกวงเงิน —</option>` +
            plan.roomRates.map(r => `<option value="${r}">${r}</option>`).join('');
    } else {
        rrRow.classList.add('hidden');
    }
    mfPickerUpdateConfirm();
};

window.mfPickerSelectRoom = function(val) {
    window._mfPicker.roomRate = val || null;
    mfPickerUpdateConfirm();
};

function mfPickerUpdateConfirm() {
    const p = window._mfPicker;
    const companies = window._mfData.companies?.companies || [];
    const co = companies.find(c => c.id === p.company);
    const plan = co?.plans?.find(pl => pl.id === p.plan);
    const needRoom = plan?.hasRoomRate;
    const ready = p.company && p.plan && (!needRoom || p.roomRate);
    const btn = document.getElementById('mfPickerConfirmBtn');
    if (!btn) return;
    btn.classList.toggle('opacity-50', !ready);
    btn.classList.toggle('pointer-events-none', !ready);
}

window.mfPickerConfirm = function() {
    const p = window._mfPicker;
    const companies = window._mfData.companies?.companies || [];
    const co = companies.find(c => c.id === p.company);
    const plan = co?.plans?.find(pl => pl.id === p.plan);
    // Build composite key: "COMPANY|PLAN_ID|ROOM" or "COMPANY|PLAN_ID"
    const key = [p.company, p.plan, p.roomRate].filter(Boolean).join('|');
    const label = [co?.name, plan?.name, p.roomRate].filter(Boolean).join(' · ');
    window.currentMF = key;
    window._mfCurrentLabel = label;
    closePopup('mfPlanModal');
    if (typeof calculate === 'function') calculate(typeof currentMode !== 'undefined' ? currentMode : 'sum', true);
};

window.mfPickerClear = function() {
    window._mfPicker = { company: null, plan: null, roomRate: null };
    window.currentMF = 'ไม่เลือก';
    window._mfCurrentLabel = null;
    closePopup('mfPlanModal');
    if (typeof calculate === 'function') calculate(typeof currentMode !== 'undefined' ? currentMode : 'sum', true);
};

// ==================== MF Table (renders into shared tableView) ====================

window.mfGenerateTable = function() {
    const p = window._mfInline || {};
    const gender = (typeof currentGender !== 'undefined' && currentGender) ? currentGender : 'male';
    const gThai = gender === 'male' ? 'ชาย' : 'หญิง';

    const companies = window._mfData?.companies?.companies || [];
    const co = companies.find(c => c.id === p.company);
    const planMeta = co?.plans?.find(pl => pl.id === p.plan);

    const head = document.getElementById('policyTableHead');
    const body = document.getElementById('policyTableBody');
    const titleEl = document.getElementById('tableHeaderTitle');
    const surrenderContainer = document.getElementById('surrenderContainer');
    if (surrenderContainer) surrenderContainer.innerHTML = '';

    // No selection yet
    if (!p.company || !p.plan || (planMeta?.hasRoomRate && !p.roomRate)) {
        if (head) head.innerHTML = '';
        if (body) body.innerHTML = `<tr><td colspan="2" class="py-10 text-center text-[12px] text-slate-400"><i class="fas fa-info-circle mr-1"></i>กรุณาเลือกบริษัท แผนประกัน และค่าห้องในหน้าหลัก</td></tr>`;
        if (titleEl) titleEl.innerHTML = `<span class="text-[13px] font-bold text-sky-700">Medical Fund</span>`;
        return;
    }

    const rawData = window._mfData?.rates?.[p.company] || {};

    // Detect new Step Rate format (has `rates` array) vs old format (keyed by plan id)
    const isStepRateFormat = Array.isArray(rawData.rates);

    const coName = co?.name || p.company;
    const planName = planMeta?.name || p.plan;
    const roomLabel = p.roomRate ? ` · ${p.roomRate}` : '';
    const curAge = parseInt(document.getElementById('ageInput')?.value) || 0;

    // Build {age: premium} map from selected format
    let premiumByAge = {};
    let dataAges = [];

    if (isStepRateFormat) {
        const genderKey = gender === 'male' ? 'Male' : 'Female';
        const planFullName = `${coName} ${planName}`.trim();
        rawData.rates.forEach(r => {
            if (r.gender !== genderKey) return;
            const planPrem = r.premiums?.[planFullName];
            if (!planPrem) return;
            const prem = planMeta?.hasRoomRate ? planPrem[p.roomRate] : (typeof planPrem === 'number' ? planPrem : null);
            if (typeof prem === 'number') {
                premiumByAge[r.age_band] = prem;
                dataAges.push(r.age_band);
            }
        });
        dataAges = [...new Set(dataAges)].sort((a, b) => a - b);
    } else {
        const planData = rawData[p.plan];
        const rateTable = p.roomRate ? planData?.[p.roomRate]?.[gender] : planData?.[gender];
        if (rateTable) {
            Object.keys(rateTable).forEach(k => {
                const age = parseInt(k);
                if (!isNaN(age)) {
                    premiumByAge[age] = rateTable[k];
                    dataAges.push(age);
                }
            });
            dataAges.sort((a, b) => a - b);
        }
    }

    const dataMin = dataAges[0] || 1;
    const dataMax = dataAges[dataAges.length - 1] || 70;
    const ageStartInput = parseInt(document.getElementById('mfInlineAgeStart')?.value) || dataMin;
    const ageEndInput = parseInt(document.getElementById('mfInlineAgeEnd')?.value) || dataMax;
    const ageRowsToShow = dataAges.filter(a => a >= ageStartInput && a <= ageEndInput);
    const start = ageRowsToShow[0] ?? ageStartInput;
    const end = ageRowsToShow[ageRowsToShow.length - 1] ?? ageEndInput;

    // Header title
    const _vw = window.innerWidth;
    const _isMobile = _vw < 700;
    const _badge = _isMobile
        ? 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border'
        : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border';
    if (titleEl) titleEl.innerHTML = _isMobile ? `
        <div class="flex flex-col gap-0.5 w-full">
            <div class="flex flex-wrap gap-1">
                <span class="${_badge} bg-sky-600 text-white border-sky-700">MF</span>
                <span class="${_badge} bg-white/80 text-slate-700 border-slate-200">${gThai}</span>
                <span class="${_badge} bg-white/80 text-slate-700 border-slate-200">อายุ ${start}–${end}</span>
            </div>
            <div class="flex flex-wrap gap-1">
                <span class="${_badge} bg-white text-slate-800 border-slate-200 shadow-sm">${coName} · ${planName}${roomLabel}</span>
            </div>
        </div>` : `
        <div class="flex gap-1.5 items-center py-0.5 w-full">
            <span class="${_badge} bg-sky-600 text-white border-sky-700">Medical Fund</span>
            <span class="${_badge} bg-white/80 text-slate-700 border-slate-200">เพศ: ${gThai}</span>
            <span class="${_badge} bg-white/80 text-slate-700 border-slate-200">อายุ: ${start}–${end} ปี</span>
            <span class="${_badge} bg-white text-slate-800 border-slate-200 shadow-sm">${coName} · ${planName}${roomLabel}</span>
        </div>`;

    // Table style sizes
    const _thCls = _isMobile ? 'py-2 px-1.5 font-bold' : 'py-3 px-3 font-bold';
    const _thSz  = _isMobile ? 'font-size:10px;white-space:nowrap;' : 'font-size:13px;white-space:nowrap;';
    const _tdBase = _isMobile ? 'py-4 px-1.5' : 'py-4 px-3';

    if (head) head.innerHTML = `<tr class="text-white" style="background:linear-gradient(135deg,#0d9488,#0369a1);${_isMobile ? 'font-size:10px;' : 'font-size:13px;'}">
        <th class="${_thCls} text-center" style="${_thSz}">อายุ (ปี)</th>
        <th class="${_thCls} text-right" style="${_thSz}">เบี้ย (บาท/ปี)</th>
    </tr>`;

    if (dataAges.length === 0) {
        if (body) body.innerHTML = `<tr><td colspan="2" class="py-10 text-center text-[12px] text-slate-400"><i class="fas fa-info-circle mr-1"></i>ยังไม่มีข้อมูลอัตราเบี้ย — จะอัปเดตเร็วๆ นี้</td></tr>`;
        return;
    }

    let html = '';
    let total = 0, hasData = false;
    ageRowsToShow.forEach((age, idx) => {
        const prem = premiumByAge[age];
        const premStr = prem != null ? prem.toLocaleString('en-US') : '—';
        if (prem != null) { total += prem; hasData = true; }
        const isCur = age === curAge;
        const rowBg = isCur ? 'background:#e0f2fe;' : (idx % 2 === 0 ? 'background:#ffffff;' : 'background:#f0f9ff;');
        const ageColor = isCur ? '#0369a1' : '#334155';
        const premColor = prem != null ? (isCur ? '#0369a1' : '#1e293b') : '#94a3b8';
        html += `<tr style="${rowBg}">
            <td class="${_tdBase} text-center font-bold" style="color:${ageColor};font-size:${_isMobile ? '12' : '14'}px;">${age}${isCur ? ' ◀' : ''}</td>
            <td class="${_tdBase} text-right font-bold" style="color:${premColor};font-size:${_isMobile ? '12' : '14'}px;">${premStr}</td>
        </tr>`;
    });

    if (hasData) {
        html += `<tr style="background:#0369a1;">
            <td class="${_tdBase} text-center font-bold text-white" style="font-size:${_isMobile ? '12' : '13'}px;">รวมเบี้ยประกัน</td>
            <td class="${_tdBase} text-right font-black text-white" style="font-size:${_isMobile ? '13' : '15'}px;">${total.toLocaleString('en-US')}</td>
        </tr>`;
    }

    if (body) body.innerHTML = html || `<tr><td colspan="2" class="py-10 text-center text-[12px] text-slate-400">ไม่มีข้อมูลในช่วงอายุนี้</td></tr>`;
};
