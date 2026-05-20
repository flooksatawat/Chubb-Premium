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
        rrSel.innerHTML = `<option value="">— เลือกแผน —</option>` +
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
    document.getElementById('mfCalculatorModal').classList.remove('hidden');
    await mfInit();
};
