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
            const res = await fetch('data/MF/companies.json?v=' + Date.now());
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
        const res = await fetch(`data/MF/${companyId}.json?v=` + Date.now());
        if (!res.ok) throw new Error('not found');
        window._mfData.rates[companyId] = await res.json();
    } catch (e) {
        window._mfData.rates[companyId] = {};
    }
    return window._mfData.rates[companyId];
}

async function mfPreloadAll() {
    const companies = window._mfData.companies?.companies || [];
    await Promise.all(companies.map(c => mfLoadRates(c.id).catch(() => {})));
}

// Check if a specific (company, plan, room?, gender?) combo has premium data
function mfHasData(companyId, planId, roomRate, gender) {
    const companies = window._mfData?.companies?.companies || [];
    const co = companies.find(c => c.id === companyId);
    if (!co) return false;
    const planMeta = co.plans?.find(p => p.id === planId);
    if (!planMeta) return false;
    const data = window._mfData?.rates?.[companyId];
    if (!data) return false;
    const planFullName = `${co.name} ${planMeta.name}`.trim();
    if (Array.isArray(data.rates)) {
        const genderKey = gender ? (gender === 'male' ? 'Male' : 'Female') : null;
        return data.rates.some(r => {
            if (genderKey && r.gender !== genderKey) return false;
            const planPrem = r.premiums?.[planFullName];
            if (!planPrem) return false;
            if (planMeta.hasRoomRate) {
                if (roomRate) return typeof planPrem[roomRate] === 'number';
                return Object.values(planPrem).some(v => typeof v === 'number');
            }
            return typeof planPrem === 'number';
        });
    }
    // Legacy format
    const planData = data[planId];
    if (!planData) return false;
    if (planMeta.hasRoomRate) {
        if (roomRate) return !!(planData[roomRate]?.[gender || 'male']);
        return planMeta.roomRates?.some(r => planData[r]?.[gender || 'male']);
    }
    return !!(planData[gender || 'male']);
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
    const { company, plan, roomRate } = window._mfState;
    const ageStartEl = document.getElementById('mfAgeStart');
    const ageEndEl = document.getElementById('mfAgeEnd');
    const ageStart = parseInt(ageStartEl?.value) || 1;
    const ageEnd = parseInt(ageEndEl?.value) || 70;

    if (!company) { mfShowError('กรุณาเลือกบริษัท'); return; }
    if (!plan) { mfShowError('กรุณาเลือกแผนประกัน'); return; }

    const rawData = await mfLoadRates(company);
    const companies = window._mfData.companies?.companies || [];
    const co = companies.find(c => c.id === company);
    const planMeta = co?.plans?.find(p => p.id === plan);
    const companyName = co?.name || company;
    const planName = planMeta?.name || plan;
    const planFullName = `${companyName} ${planName}`.trim();
    const roomLabel = roomRate ? ` · ${roomRate}` : '';
    const SPLIT = 60;

    // Build {age: premium} map for a given gender from step-rate array format
    const buildMap = (gender) => {
        const map = {};
        if (!Array.isArray(rawData.rates)) {
            // Legacy format: rawData[plan][roomRate?][gender]
            const planData = rawData[plan];
            if (!planData) return map;
            const rateTable = roomRate ? planData[roomRate]?.[gender] : planData[gender];
            if (rateTable) {
                Object.keys(rateTable).forEach(k => {
                    const a = parseInt(k);
                    if (!isNaN(a)) map[a] = rateTable[k];
                });
            }
            return map;
        }
        const gKey = gender === 'male' ? 'Male' : 'Female';
        rawData.rates.forEach(r => {
            if (r.gender !== gKey && r.gender !== 'Unisex') return;
            const pp = r.premiums?.[planFullName];
            if (!pp) return;
            const prem = planMeta?.hasRoomRate ? pp[roomRate] : (typeof pp === 'number' ? pp : null);
            if (typeof prem === 'number') map[r.age_band] = prem;
        });
        return map;
    };

    const maleMap   = buildMap('male');
    const femaleMap = buildMap('female');

    if (Object.keys(maleMap).length === 0 && Object.keys(femaleMap).length === 0) {
        mfShowError('ยังไม่มีข้อมูลอัตราเบี้ยของแผนนี้'); return;
    }

    // From map, compute premium for a given age (step-rate: highest band <= age)
    const premForAge = (map, age) => {
        const bands = Object.keys(map).map(Number).sort((a, b) => a - b);
        if (bands.length === 0) return null;
        // Per-age exact match first
        if (map[age] !== undefined) return map[age];
        // Step-rate: find highest band <= age
        let val = null;
        for (const b of bands) { if (b <= age) val = map[b]; else break; }
        return val;
    };

    // Build HTML rows + total for a gender map and age range
    const buildSection = (map, fromAge, toAge) => {
        const actualFrom = Math.max(fromAge, ageStart);
        const actualTo = Math.min(toAge, ageEnd);
        if (actualFrom > actualTo || Object.keys(map).length === 0) {
            return { html: '<tr><td colspan="2" style="padding:10px;text-align:center;font-size:11px;color:#94a3b8;">—</td></tr>', total: 0, hasData: false, actualFrom, actualTo };
        }
        let html = '', total = 0, hasData = false, prevPrem = null;
        for (let age = actualFrom; age <= actualTo; age++) {
            const prem = premForAge(map, age);
            if (prem != null) { total += prem; hasData = true; }
            // For step-rate bands: only show the band-start row (when prem changes)
            const bands = Object.keys(map).map(Number).sort((a, b) => a - b);
            const avgGap = bands.length > 1 ? (bands[bands.length-1] - bands[0]) / (bands.length - 1) : 1;
            const isPerAge = avgGap <= 1.1;
            if (isPerAge) {
                html += `<tr style="background:${(age - actualFrom) % 2 === 0 ? '#fff' : '#f0f9ff'};">
                    <td style="padding:5px 8px;text-align:center;font-size:12px;color:#334155;">${age}</td>
                    <td style="padding:5px 8px;text-align:right;font-size:12px;font-weight:600;color:${prem != null ? '#0f766e' : '#94a3b8'};">${prem != null ? prem.toLocaleString('en-US') : '—'}</td>
                </tr>`;
            } else {
                if (prem !== prevPrem && prem != null) {
                    html += `<tr style="background:#f0fdfa;border-top:2px solid #5eead4;">
                        <td style="padding:6px 8px;text-align:center;font-weight:700;font-size:12px;color:#0f766e;">${age}</td>
                        <td style="padding:6px 8px;text-align:right;font-weight:700;font-size:12px;color:#0f766e;">${prem.toLocaleString('en-US')}</td>
                    </tr>`;
                }
            }
            prevPrem = prem;
        }
        return { html, total, hasData, actualFrom, actualTo };
    };

    const buildTableHtml = (map, fromAge, toAge, gLabel, gradFrom, gradTo) => {
        const { html, total, hasData, actualFrom, actualTo } = buildSection(map, fromAge, toAge);
        const totalStr = hasData ? total.toLocaleString('en-US') : '—';
        return `
            <div style="border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
                <div style="background:linear-gradient(135deg,${gradFrom},${gradTo});padding:6px 10px;display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;font-weight:700;color:#fff;">${gLabel}</span>
                    <span style="font-size:10px;color:rgba(255,255,255,0.85);">${actualFrom}–${actualTo} ปี</span>
                </div>
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr style="background:rgba(0,0,0,0.04);">
                            <th style="padding:4px 8px;text-align:center;font-size:10px;font-weight:700;color:#475569;">อายุ</th>
                            <th style="padding:4px 8px;text-align:right;font-size:10px;font-weight:700;color:#475569;">เบี้ย/ปี</th>
                        </tr>
                    </thead>
                    <tbody>${html}</tbody>
                    <tfoot>
                        <tr style="background:linear-gradient(135deg,${gradFrom},${gradTo});">
                            <td style="padding:6px 8px;font-size:11px;font-weight:700;color:#fff;">รวม</td>
                            <td style="padding:6px 8px;text-align:right;font-size:12px;font-weight:900;color:#fff;">${totalStr}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>`;
    };

    const mBefore = buildTableHtml(maleMap,   ageStart, SPLIT - 1, 'ชาย',  '#0369a1', '#0284c7');
    const fBefore = buildTableHtml(femaleMap, ageStart, SPLIT - 1, 'หญิง', '#be185d', '#db2777');
    const mAfter  = buildTableHtml(maleMap,   SPLIT,    ageEnd,    'ชาย',  '#0369a1', '#0284c7');
    const fAfter  = buildTableHtml(femaleMap, SPLIT,    ageEnd,    'หญิง', '#be185d', '#db2777');

    document.getElementById('mfResultArea').innerHTML = `
        <div style="margin-top:16px;">
            <div style="font-size:12px;font-weight:700;color:#0369a1;margin-bottom:12px;text-align:center;">${companyName} · ${planName}${roomLabel}</div>

            <!-- ช่วงก่อน 60 -->
            <div style="margin-bottom:14px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                    <div style="flex:1;height:1px;background:#bae6fd;"></div>
                    <span style="font-size:11px;font-weight:800;color:#0369a1;background:#e0f2fe;padding:3px 12px;border-radius:999px;white-space:nowrap;">ก่อนอายุ 60 ปี</span>
                    <div style="flex:1;height:1px;background:#bae6fd;"></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    ${mBefore}
                    ${fBefore}
                </div>
            </div>

            <!-- ช่วงหลัง 60 -->
            <div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                    <div style="flex:1;height:1px;background:#fed7aa;"></div>
                    <span style="font-size:11px;font-weight:800;color:#c2410c;background:#fff7ed;padding:3px 12px;border-radius:999px;white-space:nowrap;">60 ปีขึ้นไป</span>
                    <div style="flex:1;height:1px;background:#fed7aa;"></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    ${mAfter}
                    ${fAfter}
                </div>
            </div>
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
            const res = await fetch('data/MF/companies.json?v=' + Date.now());
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
    if (val) await mfLoadRates(val);
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
    if (val && !plan?.hasRoomRate) mfScheduleTotalPopup();
};

window.mfInlineSelectRoom = function(val) {
    window._mfInline.roomRate = val || null;
    window.mfInlineRender();
    if (val) mfScheduleTotalPopup();
};

window.mfInlineRender = function() {
    const p = window._mfInline || {};
    const companies = window._mfData?.companies?.companies || [];
    const co = companies.find(c => c.id === p.company);
    const planMeta = co?.plans?.find(pl => pl.id === p.plan);
    const needRoom = planMeta?.hasRoomRate;
    const complete = !!(p.company && p.plan && (!needRoom || p.roomRate));

    const isWide = window.innerWidth >= 700;
    const tv = document.getElementById('tableView');
    const rp = document.getElementById('rightPane');
    const tableActive = !!(tv && (tv.style.display !== 'none' || (rp && tv.parentElement === rp)));

    // Sync to currentMF so main table column stays in step
    if (complete) {
        const coName = co?.name || p.company;
        const planName = planMeta?.name || p.plan;
        const key = [p.company, p.plan, p.roomRate].filter(Boolean).join('|');
        const label = [coName, planName, p.roomRate].filter(Boolean).join(' · ');
        window.currentMF = key;
        window._mfCurrentLabel = label;
    }

    // Wide screen: auto-show table in right pane when selection complete
    if (complete && isWide && !tableActive) {
        if (typeof switchView === 'function') switchView('table');
        return;
    }

    // Already showing — refresh real-time
    if (tableActive && typeof generatePolicyTableData === 'function') generatePolicyTableData();
};

// ==================== MF Picker (rider for 24TX/Elite/WXN) ====================

window._mfPicker = { company: null, plan: null, roomRate: null };

async function mfPickerInit() {
    if (!window._mfData.companies) {
        try {
            const res = await fetch('data/MF/companies.json?v=' + Date.now());
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

window.mfPickerSelectCompany = async function(val) {
    window._mfPicker = { company: val || null, plan: null, roomRate: null };
    if (val) mfLoadRates(val); // pre-load data in background
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

window.mfPickerConfirm = async function() {
    const p = window._mfPicker;
    const companies = window._mfData.companies?.companies || [];
    const co = companies.find(c => c.id === p.company);
    const plan = co?.plans?.find(pl => pl.id === p.plan);
    // Build composite key: "COMPANY|PLAN_ID|ROOM" or "COMPANY|PLAN_ID"
    const key = [p.company, p.plan, p.roomRate].filter(Boolean).join('|');
    const label = [co?.name, plan?.name, p.roomRate].filter(Boolean).join(' · ');
    window.currentMF = key;
    window._mfCurrentLabel = label;
    // Sync to inline selector state (data + UI dropdowns)
    window._mfInline = { company: p.company, plan: p.plan, roomRate: p.roomRate || null };
    // Update inline dropdown DOM if visible
    const _inlineCo = document.getElementById('mfInlineCompany');
    const _inlinePlan = document.getElementById('mfInlinePlan');
    const _inlineRoom = document.getElementById('mfInlineRoom');
    if (_inlineCo) _inlineCo.value = p.company || '';
    if (_inlinePlan) _inlinePlan.value = p.plan || '';
    if (_inlineRoom) _inlineRoom.value = p.roomRate || '';
    // Ensure rate data is loaded before recalculating
    if (p.company) await mfLoadRates(p.company);
    closePopup('mfPlanModal');
    if (typeof calculate === 'function') calculate(typeof currentMode !== 'undefined' ? currentMode : 'sum', true);
    mfScheduleTotalPopup();
};

// ── Build {age: premium} map for the selected MF plan (for inline column in main table) ──
window.mfBuildPremiumMap = function(gender) {
    const mfKey = window.currentMF || '';
    if (!mfKey || mfKey === 'ไม่เลือก') return null;
    // 3D Health Excellence projection — premium map captured by mfShow3DProjectionPopup
    if (mfKey === '_3D_HEALTH') {
        const src = window._mf3DSource;
        if (!src || !src.map) return null;
        // Only use cached map when gender matches the capture, else recompute
        if (src.gender && gender && src.gender !== gender) return null;
        return src.map;
    }
    const parts = mfKey.split('|');
    const companyId = parts[0], planId = parts[1], roomRate = parts[2] || null;
    if (!companyId || !planId) return null;
    const companies = window._mfData?.companies?.companies || [];
    const co = companies.find(c => c.id === companyId);
    const planMeta = co?.plans?.find(p => p.id === planId);
    const rawData = window._mfData?.rates?.[companyId] || {};
    const isStepRate = Array.isArray(rawData.rates);
    const map = {};
    if (isStepRate) {
        const gKey = gender === 'male' ? 'Male' : 'Female';
        const pfName = `${co?.name || companyId} ${planMeta?.name || planId}`.trim();
        rawData.rates.forEach(r => {
            if (r.gender !== gKey && r.gender !== 'Unisex') return;
            const pp = r.premiums?.[pfName];
            if (!pp) return;
            const prem = planMeta?.hasRoomRate ? pp[roomRate] : (typeof pp === 'number' ? pp : null);
            if (typeof prem === 'number') map[r.age_band] = prem;
        });
    } else {
        const planData = rawData[planId];
        const rateTable = roomRate ? planData?.[roomRate]?.[gender] : planData?.[gender];
        if (rateTable) Object.keys(rateTable).forEach(k => { const a = parseInt(k); if (!isNaN(a)) map[a] = rateTable[k]; });
    }
    return Object.keys(map).length > 0 ? map : null;
};

// Get step-rate premium for a specific age (find highest band <= age)
window.mfPremForAge = function(map, age) {
    if (!map) return null;
    const ages = Object.keys(map).map(Number).sort((a, b) => a - b);
    if (ages.length === 0) return null;
    // ถ้าอายุต่ำกว่า band แรก ใช้ band แรก
    if (age < ages[0]) return map[ages[0]];
    // หา band สูงสุดที่ <= อายุ
    let prem = map[ages[0]];
    for (const a of ages) { if (a <= age) prem = map[a]; else break; }
    return prem;
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
            if (r.gender !== genderKey && r.gender !== 'Unisex') return;
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

    const renderAlert = (title, msg, alertKey) => {
        if (body) body.innerHTML = '';
        if (window._mfLastAlertKey === alertKey) return;
        window._mfLastAlertKey = alertKey;
        // Remove any existing MF popups before showing new one
        document.querySelectorAll('.mf-alert-popup, .mf-total-popup').forEach(el => el.remove());
        const overlay = document.createElement('div');
        overlay.className = 'mf-alert-popup';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(2px);';
        overlay.innerHTML = `
            <div style="max-width:420px;width:100%;background:#fff;border-radius:24px;padding:28px 24px;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,0.35);border:2px solid #fbbf24;">
                <div style="width:72px;height:72px;border-radius:50%;background:#fef3c7;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
                    <i class="fas fa-exclamation-triangle" style="font-size:34px;color:#d97706;"></i>
                </div>
                <div style="font-size:18px;font-weight:800;color:#92400e;margin-bottom:8px;">${title}</div>
                <div style="font-size:14px;font-weight:600;color:#78350f;line-height:1.55;margin-bottom:20px;">${msg}</div>
                <button onclick="this.closest('.mf-alert-popup').remove()" style="background:#f59e0b;color:#fff;border:none;padding:10px 32px;border-radius:9999px;font-weight:700;font-size:14px;cursor:pointer;box-shadow:0 4px 12px rgba(245,158,11,0.35);">ตกลง</button>
            </div>`;
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
        document.body.appendChild(overlay);
    };

    // ตรวจว่า user กำลังพิมพ์อยู่หรือไม่ — ถ้าพิมพ์อยู่ ห้ามเด้ง alert (รบกวนการแก้ไข)
    const ageEl = document.getElementById('ageInput');
    const isEditingAge = ageEl && document.activeElement === ageEl;

    const renderTablePlaceholder = (text) => {
        if (head) head.innerHTML = '';
        if (body) body.innerHTML = `<tr><td colspan="2" class="py-10 text-center text-[12px] text-slate-400"><i class="fas fa-info-circle mr-1"></i>${text}</td></tr>`;
        if (titleEl) titleEl.innerHTML = `<span class="text-[13px] font-bold text-sky-700">Medical Fund</span>`;
    };

    // Alert if customer age is missing
    if (!curAge || curAge <= 0) {
        if (isEditingAge) { renderTablePlaceholder('กรุณากรอกอายุลูกค้า'); return; }
        renderAlert(
            'กรุณากรอกอายุลูกค้า',
            `แผนนี้รองรับอายุ ${dataMin}–${dataMax} ปี (${coName} ${planName}${roomLabel})`,
            `noage:${coName}:${planName}:${p.roomRate}`
        );
        return;
    }
    // Alert if customer age is outside the data range
    if (curAge < dataMin || curAge > dataMax) {
        if (isEditingAge) {
            renderTablePlaceholder(`อายุ ${curAge} ไม่อยู่ในช่วง ${dataMin}–${dataMax} ปี`);
            return;
        }
        renderAlert(
            `อายุ ${curAge} ไม่อยู่ในช่วงที่รองรับ`,
            `แผนนี้รองรับอายุ ${dataMin}–${dataMax} ปี<br>(${coName} ${planName}${roomLabel})`,
            `outrange:${curAge}:${coName}:${planName}:${p.roomRate}`
        );
        return;
    }
    window._mfLastAlertKey = null;
    const startEl = document.getElementById('mfInlineAgeStart');
    const endEl = document.getElementById('mfInlineAgeEnd');
    const defaultStart = curAge > 0 ? Math.max(curAge, dataMin) : dataMin;
    // Re-sync inputs to defaults when customer age changes (user can still override after)
    if (window._mfLastCurAge !== curAge) {
        if (startEl) startEl.value = defaultStart;
        if (endEl) endEl.value = dataMax;
        window._mfLastCurAge = curAge;
    } else {
        if (startEl && !startEl.value) startEl.value = defaultStart;
        if (endEl && !endEl.value) endEl.value = dataMax;
    }
    const start = parseInt(startEl?.value) || defaultStart;
    const end = parseInt(endEl?.value) || dataMax;
    const stepRateFor = (age) => {
        let band = null;
        for (const b of dataAges) { if (b <= age) band = b; else break; }
        return band != null ? premiumByAge[band] : null;
    };
    // Build rows: every age in range, skip if no premium
    const ageRowsToShow = [];
    for (let age = start; age <= end; age++) {
        const prem = isStepRateFormat ? stepRateFor(age) : premiumByAge[age];
        if (prem != null) ageRowsToShow.push(age);
    }

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
    const _thCls = _isMobile ? 'py-2 px-2 font-bold' : 'py-2.5 px-3 font-bold';
    const _thSz  = _isMobile ? 'font-size:11px;white-space:nowrap;' : 'font-size:13px;white-space:nowrap;';

    if (head) head.innerHTML = `<tr class="text-white" style="background:linear-gradient(135deg,#0d9488,#0369a1);${_isMobile ? 'font-size:10px;' : 'font-size:13px;'}">
        <th class="${_thCls} text-center" style="${_thSz}">อายุ (ปี)</th>
        <th class="${_thCls} text-right" style="${_thSz}">เบี้ย (บาท/ปี)</th>
    </tr>`;

    if (dataAges.length === 0) {
        if (body) body.innerHTML = `<tr><td colspan="2" class="py-10 text-center">
            <div class="inline-flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
                <i class="fas fa-exclamation-triangle text-rose-500"></i>
                <span class="text-[12px] font-bold text-rose-700">ไม่มีข้อมูลเบี้ยสำหรับชุดนี้</span>
            </div>
        </td></tr>`;
        return;
    }

    // Detect per-age format: if avg gap between band entries ≤ 1.1 → every year has its own rate
    const avgBandGap = dataAges.length > 1
        ? (dataAges[dataAges.length - 1] - dataAges[0]) / (dataAges.length - 1)
        : 1;
    const isPerAge = avgBandGap <= 1.1;

    let html = '';
    let total = 0, hasData = false;
    let prevPrem = null;
    let rowIdx = 0;

    ageRowsToShow.forEach((age) => {
        const prem = isStepRateFormat ? stepRateFor(age) : premiumByAge[age];
        if (prem != null) { total += prem; hasData = true; }

        const premStr = prem != null ? prem.toLocaleString('en-US') : '—';

        if (isPerAge) {
            // ── Per-age plan: flat alternating rows, no band-highlight ──
            const bg = rowIdx % 2 === 0 ? '#fff' : '#f8fafc';
            html += `<tr style="background:${bg};border-bottom:1px solid #f1f5f9;">
                <td style="padding:${_isMobile?'5px 8px':'6px 12px'};text-align:center;color:#334155;font-size:${_isMobile?'12':'13'}px;">${age}</td>
                <td style="padding:${_isMobile?'5px 8px':'6px 12px'};text-align:right;color:#0f766e;font-size:${_isMobile?'12':'13'}px;font-weight:600;">${premStr}</td>
            </tr>`;
            rowIdx++;
        } else {
            // ── Band-based plan: highlight only band-start rows ──
            const isPremChange = prem != null && prem !== prevPrem;
            if (prem != null) prevPrem = prem;

            if (isPremChange) {
                html += `<tr style="background:#f0fdfa;border-top:2px solid #5eead4;">
                    <td style="padding:${_isMobile?'6px 8px':'7px 12px'};text-align:center;font-weight:700;color:#0f766e;font-size:${_isMobile?'12':'14'}px;">${age}</td>
                    <td style="padding:${_isMobile?'6px 8px':'7px 12px'};text-align:right;font-weight:700;color:#0f766e;font-size:${_isMobile?'12':'14'}px;">${premStr}</td>
                </tr>`;
            } else {
                html += `<tr style="background:#fff;">
                    <td style="padding:${_isMobile?'3px 8px':'4px 12px'};text-align:center;color:#94a3b8;font-size:${_isMobile?'11':'12'}px;">${age}</td>
                    <td style="padding:${_isMobile?'3px 8px':'4px 12px'};text-align:right;color:#cbd5e1;font-size:${_isMobile?'11':'12'}px;">—</td>
                </tr>`;
            }
        }
    });

    if (hasData) {
        html += `<tr style="background:#0369a1;">
            <td style="padding:${_isMobile?'8px 8px':'10px 12px'};text-align:center;font-weight:700;color:#fff;font-size:${_isMobile?'12':'13'}px;">รวมเบี้ยประกัน</td>
            <td style="padding:${_isMobile?'8px 8px':'10px 12px'};text-align:right;font-weight:900;color:#fff;font-size:${_isMobile?'13':'15'}px;">${total.toLocaleString('en-US')}</td>
        </tr>`;
    }

    if (body) body.innerHTML = html || `<tr><td colspan="2" class="py-10 text-center text-[12px] text-slate-400">ไม่มีข้อมูลในช่วงอายุนี้</td></tr>`;
};

// ==================== MF Inline Search ====================

function mfBuildSearchIndex() {
    const companies = window._mfData?.companies?.companies || [];
    const index = [];
    companies.forEach(co => {
        (co.plans || []).forEach(plan => {
            if (plan.hasRoomRate && plan.roomRates?.length) {
                plan.roomRates.forEach(room => {
                    index.push({
                        company: co.id,
                        companyName: co.name,
                        plan: plan.id,
                        planName: plan.name,
                        roomRate: room,
                        label: `${co.name} · ${plan.name} · ${room}`
                    });
                });
            } else {
                index.push({
                    company: co.id,
                    companyName: co.name,
                    plan: plan.id,
                    planName: plan.name,
                    roomRate: null,
                    label: `${co.name} · ${plan.name}`
                });
            }
        });
    });
    return index;
}

window.mfInlineSearchInput = function(val) {
    const clearBtn = document.getElementById('mfInlineSearchClear');
    if (clearBtn) clearBtn.classList.toggle('hidden', !val.trim());
    mfInlineSearchShow(val);
};

window.mfInlineSearchFocus = function() {
    const input = document.getElementById('mfInlineSearch');
    mfInlineSearchShow(input?.value || '');
};

window.mfInlineSearchHide = function() {
    const dd = document.getElementById('mfInlineSearchDropdown');
    if (dd) dd.classList.add('hidden');
};

window.mfInlineSearchClear = function() {
    const input = document.getElementById('mfInlineSearch');
    if (input) input.value = '';
    const clearBtn = document.getElementById('mfInlineSearchClear');
    if (clearBtn) clearBtn.classList.add('hidden');
    mfInlineSearchHide();
    input?.focus();
};

function mfInlineSearchShow(query) {
    const dd = document.getElementById('mfInlineSearchDropdown');
    if (!dd) return;
    const index = mfBuildSearchIndex();
    const q = query.trim().toLowerCase();
    const matches = q
        ? index.filter(item =>
            item.label.toLowerCase().includes(q) ||
            item.companyName.toLowerCase().includes(q) ||
            item.planName.toLowerCase().includes(q) ||
            (item.roomRate && item.roomRate.toLowerCase().includes(q))
          )
        : index;

    if (matches.length === 0) {
        dd.innerHTML = `<div class="px-4 py-3 text-[12px] text-slate-400 text-center">ไม่พบแผนที่ตรงกัน</div>`;
        dd.classList.remove('hidden');
        return;
    }

    dd.innerHTML = matches.slice(0, 40).map(item => `
        <div class="mf-search-item px-3 py-2.5 cursor-pointer hover:bg-sky-50 border-b border-slate-100 last:border-0 flex items-center gap-2.5"
            onmousedown="mfInlineSearchSelect(${JSON.stringify(item).replace(/"/g, '&quot;')})">
            <div class="w-7 h-7 rounded-[8px] bg-sky-100 flex items-center justify-center shrink-0">
                <i class="fas fa-shield-alt text-sky-500 text-[11px]"></i>
            </div>
            <div class="min-w-0">
                <div class="text-[12px] font-bold text-slate-700 truncate">${item.companyName} · ${item.planName}</div>
                ${item.roomRate ? `<div class="text-[11px] text-sky-600 font-semibold">${item.roomRate}</div>` : ''}
            </div>
        </div>`).join('');
    dd.classList.remove('hidden');
}

window.mfInlineSearchSelect = async function(item) {
    // Fill search input label
    const input = document.getElementById('mfInlineSearch');
    if (input) input.value = item.label;
    const clearBtn = document.getElementById('mfInlineSearchClear');
    if (clearBtn) clearBtn.classList.remove('hidden');
    mfInlineSearchHide();

    // Load company data first
    await mfLoadRates(item.company);

    // Set state
    window._mfInline = { company: item.company, plan: item.plan, roomRate: item.roomRate || null };

    // Sync company dropdown
    const coSel = document.getElementById('mfInlineCompany');
    if (coSel) coSel.value = item.company;

    // Sync plan dropdown (build options first)
    const companies = window._mfData?.companies?.companies || [];
    const co = companies.find(c => c.id === item.company);
    const planRow = document.getElementById('mfInlinePlanRow');
    const planSel = document.getElementById('mfInlinePlan');
    if (planRow && planSel && co?.plans?.length) {
        planSel.innerHTML = `<option value="">— เลือกแผน —</option>` +
            co.plans.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        planSel.value = item.plan;
        planRow.classList.remove('hidden');
    }

    // Sync room rate dropdown
    const plan = co?.plans?.find(p => p.id === item.plan);
    const rrRow = document.getElementById('mfInlineRoomRow');
    const rrSel = document.getElementById('mfInlineRoom');
    if (rrRow && rrSel) {
        if (plan?.hasRoomRate && plan.roomRates?.length) {
            rrSel.innerHTML = `<option value="">— เลือกวงเงิน —</option>` +
                plan.roomRates.map(r => `<option value="${r}">${r}</option>`).join('');
            rrSel.value = item.roomRate || '';
            rrRow.classList.remove('hidden');
        } else {
            rrRow.classList.add('hidden');
        }
    }

    // Trigger render + popup
    window.mfInlineRender();
    mfScheduleTotalPopup();
};

let _mfTotalPopupTimer = null;
function mfScheduleTotalPopup(delay = 1500) {
    clearTimeout(_mfTotalPopupTimer);
    _mfTotalPopupTimer = setTimeout(() => window.mfShowTotalPopup(), delay);
}

window.mfSelectMainPlan = function(planName, btn) {
    document.querySelectorAll('.mf-total-popup').forEach(el => el.remove());
    if (typeof selectAppPlan === 'function') {
        selectAppPlan(planName);
    } else {
        window.currentAppPlan = planName;
        if (typeof calculate === 'function') calculate('sum', true);
    }
};

// ==================== MF Total Premium Popup ====================

window.mfShowTotalPopup = async function() {
    const p = window._mfInline || {};
    const gender = (typeof currentGender !== 'undefined' && currentGender) ? currentGender : 'male';
    const companies = window._mfData?.companies?.companies || [];
    const co = companies.find(c => c.id === p.company);
    const planMeta = co?.plans?.find(pl => pl.id === p.plan);
    if (!p.company || !p.plan) return;
    if (planMeta?.hasRoomRate && !p.roomRate) return;

    if (p.company) await mfLoadRates(p.company);
    const rawData = window._mfData?.rates?.[p.company] || {};
    const isStepRate = Array.isArray(rawData.rates);
    const coName = co?.name || p.company;
    const planName = planMeta?.name || p.plan;
    const roomLabel = p.roomRate ? ` · ${p.roomRate}` : '';
    const curAge = parseInt(document.getElementById('ageInput')?.value) || 0;

    let premiumByAge = {};
    let dataAges = [];
    if (isStepRate) {
        const gKey = gender === 'male' ? 'Male' : 'Female';
        const pfName = `${coName} ${planName}`.trim();
        rawData.rates.forEach(r => {
            if (r.gender !== gKey && r.gender !== 'Unisex') return;
            const pp = r.premiums?.[pfName];
            if (!pp) return;
            const prem = planMeta?.hasRoomRate ? pp[p.roomRate] : (typeof pp === 'number' ? pp : null);
            if (typeof prem === 'number') { premiumByAge[r.age_band] = prem; dataAges.push(r.age_band); }
        });
        dataAges = [...new Set(dataAges)].sort((a, b) => a - b);
    } else {
        const planData = rawData[p.plan];
        const rateTable = p.roomRate ? planData?.[p.roomRate]?.[gender] : planData?.[gender];
        if (rateTable) {
            Object.keys(rateTable).forEach(k => {
                const age = parseInt(k);
                if (!isNaN(age)) { premiumByAge[age] = rateTable[k]; dataAges.push(age); }
            });
            dataAges.sort((a, b) => a - b);
        }
    }
    if (dataAges.length === 0) return;

    const dataMin = dataAges[0];
    const dataMax = dataAges[dataAges.length - 1];

    // Guard: age must be filled and within range
    if (!curAge || curAge <= 0) return;
    if (curAge < dataMin || curAge > dataMax) return;

    const startAge = Math.max(curAge, dataMin);
    const stepRateFor = (age) => {
        let band = null;
        for (const b of dataAges) { if (b <= age) band = b; else break; }
        return band != null ? premiumByAge[band] : null;
    };
    let total = 0;
    for (let age = startAge; age <= dataMax; age++) {
        const prem = isStepRate ? stepRateFor(age) : premiumByAge[age];
        if (prem != null) total += prem;
    }
    if (total === 0) return;

    // Remove both popup types to prevent overlap
    document.querySelectorAll('.mf-total-popup, .mf-alert-popup').forEach(el => el.remove());
    const gThai = gender === 'male' ? 'ชาย' : 'หญิง';
    const planBtns = [
        { label: 'WXN', name: 'Whole Life Extra',       icon: 'fas fa-infinity',    color: '#1d4ed8' },
        { label: 'TX',  name: '24 TX',                  icon: 'fas fa-chart-line',  color: '#0f766e' },
        { label: 'Elite', name: '868 / 818 Elite Saving', icon: 'fas fa-star',      color: '#7c3aed' },
        { label: 'LV',  name: 'LifeTime Value',         icon: 'fas fa-hourglass-half', color: '#7c3aed' },
    ];
    const overlay = document.createElement('div');
    overlay.className = 'mf-total-popup';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(3px);';
    overlay.innerHTML = `
        <div style="max-width:380px;width:100%;background:linear-gradient(145deg,#0369a1,#0d9488);border-radius:24px;padding:28px 22px 22px;text-align:center;box-shadow:0 30px 70px rgba(0,0,0,0.45);color:#fff;">
            <div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
                <i class="fas fa-shield-alt" style="font-size:26px;color:#fff;"></i>
            </div>
            <div style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.9);margin-bottom:2px;">เบี้ยประกันสุขภาพ ตลอดชีวิต</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.65);margin-bottom:14px;">${coName} · ${planName}${roomLabel}&nbsp;|&nbsp;${gThai}&nbsp;|&nbsp;อายุ ${startAge}–${dataMax} ปี</div>
            <div style="font-size:34px;font-weight:900;color:#fff;letter-spacing:-1px;line-height:1;">${total.toLocaleString('en-US')}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.65);margin-top:3px;margin-bottom:18px;">บาท (รวมทุกปีตลอดชีวิต)</div>

            <div style="background:rgba(255,255,255,0.12);border-radius:16px;padding:14px 12px 10px;margin-bottom:14px;">
                <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.75);margin-bottom:10px;letter-spacing:0.03em;">เลือกแบบประกันออมทรัพย์</div>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
                    ${planBtns.map(b => `
                    <button onclick="mfSelectMainPlan('${b.name}',this)" style="background:#fff;border:none;border-radius:12px;padding:10px 4px 8px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px;transition:transform 0.1s,box-shadow 0.1s;box-shadow:0 2px 8px rgba(0,0,0,0.15);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <div style="width:32px;height:32px;border-radius:9px;background:${b.color};display:flex;align-items:center;justify-content:center;">
                            <i class="${b.icon}" style="font-size:14px;color:#fff;"></i>
                        </div>
                        <span style="font-size:12px;font-weight:800;color:#1e293b;">${b.label}</span>
                    </button>`).join('')}
                </div>
            </div>

            <button onclick="this.closest('.mf-total-popup').remove()" style="background:rgba(255,255,255,0.18);color:#fff;border:2px solid rgba(255,255,255,0.35);padding:9px 32px;border-radius:9999px;font-weight:700;font-size:13px;cursor:pointer;width:100%;transition:background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.28)'" onmouseout="this.style.background='rgba(255,255,255,0.18)'">ปิด</button>
        </div>`;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
};

// ==================== Medical Fund button dispatcher ====================
// 24TX / Elite / WXN / 7SM → open the MF rider picker (เลือกแบบประกันบริษัทอื่น)
// 3D Health Excellence    → project the plan's own renewable health premium ตลอดชีพ
window.mfBtnClick = function() {
    const plan = (typeof currentAppPlan !== 'undefined' && currentAppPlan)
        ? currentAppPlan
        : (window.currentAppPlan || '');
    if (plan === '3D Health Excellence') {
        window.mfShow3DProjectionPopup();
    } else if (typeof window.openMFPicker === 'function') {
        window.openMFPicker();
    }
};

// ==================== 3D Health Excellence — Lifetime Premium Projection ====================
// Sums the renewable health premium (HX + HXO + HXD + HBF) of the current 3D plan
// from the customer's current age to renewal age 99 (coverage to 100),
// using the same rate tables (getHealthRate) as the main calculator. แสดงผลเป็น popup
// แบบเดียวกับเมนู Medical Fund — ยอดรวมตลอดชีพ + ปุ่มเลือกแบบประกันออมทรัพย์ (WXN/TX/Elite/LV)
window.mfShow3DProjectionPopup = function() {
    const gender = (typeof currentGender !== 'undefined' && currentGender) ? currentGender : 'male';
    const gThai = gender === 'male' ? 'ชาย' : 'หญิง';
    const curAge = parseInt(document.getElementById('ageInput')?.value) || 0;

    const hxVal  = (window.currentHX  && window.currentHX  !== 'ไม่เลือก') ? window.currentHX  : null;
    const hxoVal = (window.currentHXO && window.currentHXO !== 'ไม่เลือก') ? window.currentHXO : null;
    const hxdVal = (window.currentHXD && window.currentHXD !== 'ไม่เลือก') ? window.currentHXD : null;
    const hbfVal = parseInt(window.currentHBF) || 0;

    // Clear any popup already on screen
    document.querySelectorAll('.mf-total-popup, .mf-alert-popup').forEach(el => el.remove());

    const showAlert = (title, msg) => {
        const ov = document.createElement('div');
        ov.className = 'mf-alert-popup';
        ov.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(2px);';
        ov.innerHTML = `
            <div style="max-width:420px;width:100%;background:#fff;border-radius:24px;padding:28px 24px;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,0.35);border:2px solid #fbbf24;">
                <div style="width:72px;height:72px;border-radius:50%;background:#fef3c7;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
                    <i class="fas fa-exclamation-triangle" style="font-size:34px;color:#d97706;"></i>
                </div>
                <div style="font-size:18px;font-weight:800;color:#92400e;margin-bottom:8px;">${title}</div>
                <div style="font-size:14px;font-weight:600;color:#78350f;line-height:1.55;margin-bottom:20px;">${msg}</div>
                <button onclick="this.closest('.mf-alert-popup').remove()" style="background:#f59e0b;color:#fff;border:none;padding:10px 32px;border-radius:9999px;font-weight:700;font-size:14px;cursor:pointer;box-shadow:0 4px 12px rgba(245,158,11,0.35);">ตกลง</button>
            </div>`;
        ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
        document.body.appendChild(ov);
    };

    if (typeof getHealthRate !== 'function') {
        showAlert('ยังโหลดข้อมูลไม่เสร็จ', 'ระบบกำลังโหลดอัตราเบี้ย กรุณารอสักครู่แล้วลองใหม่อีกครั้ง');
        return;
    }
    if (!hxVal) {
        showAlert('ยังไม่ได้เลือกค่าห้อง (HX)', 'กรุณาเลือกแผนค่าห้อง HX ของ 3D Health Excellence ก่อน จึงจะคำนวณเบี้ยล่วงหน้าได้');
        return;
    }

    const MIN_AGE = 11, MAX_RENEW_AGE = 99;
    if (!curAge || curAge <= 0) {
        showAlert('กรุณากรอกอายุลูกค้า', `แผน 3D Health Excellence รับประกันอายุ ${MIN_AGE}–75 ปี และต่ออายุได้ถึง ${MAX_RENEW_AGE} ปี`);
        return;
    }
    if (curAge < MIN_AGE || curAge > MAX_RENEW_AGE) {
        showAlert(`อายุ ${curAge} ปี ไม่อยู่ในช่วงที่รองรับ`, `แผนนี้คำนวณเบี้ยล่วงหน้าได้สำหรับอายุ ${MIN_AGE}–${MAX_RENEW_AGE} ปี`);
        return;
    }

    // Project the renewable health premium year-by-year (เริ่มจากอายุปัจจุบัน → 100)
    const rows = [];
    let total = 0, prevPrem = null, lastAge = curAge;
    for (let age = curAge; age <= MAX_RENEW_AGE; age++) {
        const hx  = getHealthRate('HX',  hxVal,  age, gender) || 0;
        const hxo = hxoVal ? (getHealthRate('HXO', hxoVal, age, gender) || 0) : 0;
        const hxd = hxdVal ? (getHealthRate('HXD', hxdVal, age, gender) || 0) : 0;
        const hbf = hbfVal > 0 ? (getHealthRate('HBF', String(hbfVal), age, gender) || 0) : 0;
        const prem = hx + hxo + hxd + hbf;
        if (prem <= 0) continue;
        rows.push({ age, prem, changed: prevPrem === null || prem !== prevPrem });
        prevPrem = prem;
        total += prem;
        lastAge = age;
    }
    if (rows.length === 0) {
        showAlert('ไม่พบข้อมูลอัตราเบี้ย', 'ยังไม่มีข้อมูลอัตราเบี้ยสำหรับชุดความคุ้มครองที่เลือก');
        return;
    }

    const hxRoom = (typeof HX_PLAN_INFO !== 'undefined' && HX_PLAN_INFO[hxVal]) ? HX_PLAN_INFO[hxVal].room : hxVal;
    const riderParts = [`HX ${hxRoom}`];
    if (hxoVal) riderParts.push('HXO');
    if (hxdVal) riderParts.push('HXD');
    if (hbfVal > 0) riderParts.push(`HBF ${hbfVal.toLocaleString('en-US')}`);
    const planLabel = riderParts.join(' · ');

    // Stash per-age premium map so other plans can show it as the MF column
    const ageMap = {};
    rows.forEach(r => { ageMap[r.age] = r.prem; });
    window._mf3DSource = {
        map: ageMap,
        label: `3D · HX${hxRoom}`,
        gender: gender,
        riderLabel: planLabel
    };

    const planBtns = [
        { label: 'WXN',   name: 'Whole Life Extra',        icon: 'fas fa-infinity',       color: '#1d4ed8' },
        { label: 'TX',    name: '24 TX',                   icon: 'fas fa-chart-line',     color: '#0f766e' },
        { label: 'Elite', name: '868 / 818 Elite Saving',  icon: 'fas fa-star',           color: '#7c3aed' },
        { label: 'LV',    name: 'LifeTime Value',          icon: 'fas fa-hourglass-half', color: '#7c3aed' },
    ];

    const overlay = document.createElement('div');
    overlay.className = 'mf-total-popup';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(3px);';
    overlay.innerHTML = `
        <div style="max-width:380px;width:100%;background:linear-gradient(145deg,#0369a1,#0d9488);border-radius:24px;padding:28px 22px 22px;text-align:center;box-shadow:0 30px 70px rgba(0,0,0,0.45);color:#fff;">
            <div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
                <i class="fas fa-shield-alt" style="font-size:26px;color:#fff;"></i>
            </div>
            <div style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.9);margin-bottom:2px;">เบี้ยประกันสุขภาพ ตลอดชีวิต</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.65);margin-bottom:14px;">${planLabel}&nbsp;|&nbsp;${gThai}&nbsp;|&nbsp;อายุ ${curAge}–${lastAge} ปี</div>
            <div style="font-size:34px;font-weight:900;color:#fff;letter-spacing:-1px;line-height:1;">${total.toLocaleString('en-US')}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.65);margin-top:3px;margin-bottom:18px;">บาท (รวมทุกปีตลอดชีวิต)</div>

            <div style="background:rgba(255,255,255,0.12);border-radius:16px;padding:14px 12px 10px;margin-bottom:14px;">
                <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.75);margin-bottom:10px;letter-spacing:0.03em;">เลือกแบบประกันออมทรัพย์</div>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
                    ${planBtns.map(b => `
                    <button onclick="mfSelect3DInto('${b.name}',this)" style="background:#fff;border:none;border-radius:12px;padding:10px 4px 8px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px;transition:transform 0.1s,box-shadow 0.1s;box-shadow:0 2px 8px rgba(0,0,0,0.15);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <div style="width:32px;height:32px;border-radius:9px;background:${b.color};display:flex;align-items:center;justify-content:center;">
                            <i class="${b.icon}" style="font-size:14px;color:#fff;"></i>
                        </div>
                        <span style="font-size:12px;font-weight:800;color:#1e293b;">${b.label}</span>
                    </button>`).join('')}
                </div>
            </div>

            <button onclick="this.closest('.mf-total-popup').remove()" style="background:rgba(255,255,255,0.18);color:#fff;border:2px solid rgba(255,255,255,0.35);padding:9px 32px;border-radius:9999px;font-weight:700;font-size:13px;cursor:pointer;width:100%;transition:background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.28)'" onmouseout="this.style.background='rgba(255,255,255,0.18)'">ปิด</button>
        </div>`;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
};

// Switch to a savings plan AND inject the captured 3D Health premium as that plan's MF column.
// Also opens the table view so the user immediately sees the combined breakdown.
window.mfSelect3DInto = function(planName) {
    document.querySelectorAll('.mf-total-popup').forEach(el => el.remove());
    if (window._mf3DSource && window._mf3DSource.map) {
        window.currentMF = '_3D_HEALTH';
        window._mfCurrentLabel = window._mf3DSource.label;
    }
    if (typeof selectAppPlan === 'function') {
        selectAppPlan(planName);
    } else {
        window.currentAppPlan = planName;
        if (typeof calculate === 'function') calculate('sum', true);
    }
    setTimeout(() => {
        if (typeof switchView === 'function') switchView('table');
    }, 120);
};
