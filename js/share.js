// ==================== SHARING MODULE ====================
let pendingInstallmentData = {};

function triggerInstallmentShare(type) {
    if (!lastCalculationData) return; 
    const d = lastCalculationData; const p = d.premium; let amt = 0, label = ''; 
    if(type === 'monthly') { amt = Math.round(p * 0.09); label = 'รายเดือน'; } if(type === '3month') { amt = Math.round(p * 0.27); label = 'ราย 3 เดือน'; } if(type === '6month') { amt = Math.round(p * 0.52); label = 'ราย 6 เดือน'; } 
    
    const sumStr = formatNum(d.sum);
    const premOnlyText = `${amt.toLocaleString()}`;
    const genderTh = d.gender;
    const allText = [
        `📋 แผน: ${getPlanAbbr(currentAppPlan)}`,
        `👤 เพศ: ${genderTh}`,
        `🎂 อายุ: ${d.age} ปี`,
        `💰 ออม: ${amt.toLocaleString()} บาท (${label})`,
        `🛡️ วงเงิน: ${sumStr} บาท`,
        d.years ? `⏳ ระยะเวลา: ${d.years} ปี` : '',
    ].filter(Boolean).join('\n');

    pendingInstallmentData = { premOnly: premOnlyText, allText: allText, label: label };
    currentShareType = 'installment';
    closePopup('installmentModal');
    Swal.fire({
        html: `<div class="flex flex-col items-center pt-1 pb-1">
            <div class="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <i class="fas fa-share-nodes text-lg text-slate-500"></i>
            </div>
            <h3 class="text-base font-semibold text-slate-800 text-center mb-4 leading-snug px-2">แชร์ยอดชำระ${label}</h3>
            <div class="grid grid-cols-3 gap-3 w-full">
                <button onclick="Swal.close(); setTimeout(() => { if(typeof shareToLine === 'function') shareToLine(); }, 200);" class="flex flex-col items-center justify-center py-3.5 bg-green-50 rounded-2xl border border-green-100 active:scale-95 transition-transform"><i class="fab fa-line text-[26px] text-[#00B900] mb-1.5"></i><span class="text-[10px] font-bold text-green-700">LINE</span></button>
                <button onclick="Swal.close(); setTimeout(() => { if(typeof shareToMessenger === 'function') shareToMessenger(); }, 200);" class="flex flex-col items-center justify-center py-3.5 bg-blue-50 rounded-2xl border border-blue-100 active:scale-95 transition-transform"><i class="fas fa-share-nodes text-[26px] text-[#0084FF] mb-1.5"></i><span class="text-[10px] font-bold text-blue-600">แชร์</span></button>
                <button onclick="Swal.close(); setTimeout(() => { if(typeof copyShareData === 'function') copyShareData(); }, 200);" class="flex flex-col items-center justify-center py-3.5 bg-slate-50 rounded-2xl border border-slate-200 active:scale-95 transition-transform"><i class="fas fa-copy text-[26px] text-slate-500 mb-1.5"></i><span class="text-[10px] font-bold text-slate-500">คัดลอก</span></button>
            </div>
        </div>`,
        showConfirmButton: false,
        showCloseButton: true,
        width: 'min(90vw, 320px)',
        padding: '1.25rem',
        customClass: {
            popup: '!rounded-3xl !shadow-2xl',
            closeButton: '!text-slate-400 hover:!text-red-500',
        },
    });
}

const _3D_HX_INFO = {
    'HX15':  { room: '1,500', limit: '1,000,000' },
    'HX20':  { room: '2,000', limit: '3,000,000' },
    'HX40':  { room: '4,000', limit: '5,000,000' },
    'HX60':  { room: '6,000', limit: '10,000,000' },
    'HX150': { room: '15,000', limit: '60,000,000' },
    'HX300': { room: '30,000', limit: '120,000,000' },
};
const _3D_HXO_AMT = { 'HXO10':'1,000','HXO20':'2,000','HXO30':'3,000','HXO50':'5,000' };
const _3D_HXD_AMT = { 'HXD100':'10,000','HXD200':'20,000','HXD500':'50,000','HXD1000':'100,000' };
function _fmtMillion(numStr) {
    const n = parseInt(String(numStr).replace(/,/g, ''));
    if (n >= 1000000) return (n / 1000000) + ' ล้าน';
    if (n >= 10000) return (n / 10000).toFixed(0) + ' หมื่น';
    return n.toLocaleString() + ' บาท';
}

function _get3DShareLines() {
    const hxo = window.currentHXO || 'ไม่เลือก';
    const hxd = window.currentHXD || 'ไม่เลือก';
    const hbf = parseInt(window.currentHBF) || 0;
    const lines = [];
    if (hxo !== 'ไม่เลือก' && _3D_HXO_AMT[hxo]) {
        const hxoTimes = parseInt(hxo.replace('HXO', '')) || 0;
        lines.push(`💊 OPD (ผู้ป่วยนอก)`);
        lines.push(`   วงเงิน: ${_3D_HXO_AMT[hxo]} บ./ครั้ง`);
        if (hxoTimes > 0) lines.push(`   จำนวน: ${hxoTimes} ครั้ง/ปี`);
    }
    if (hxd !== 'ไม่เลือก' && _3D_HXD_AMT[hxd]) {
        lines.push(`🔬 วงเงินตรวจ/วินิจฉัยเพิ่ม`);
        lines.push(`   วงเงิน: ${_3D_HXD_AMT[hxd]} บ./ปี`);
    }
    if (hbf > 0) lines.push(`🏨 ชดเชยรายวัน: ${hbf.toLocaleString()} บ./วัน`);
    return lines;
}

function generateShortShareText() {
    if (!lastCalculationData) return ''; const d = lastCalculationData;

    if (currentAppPlan === '3D Health Excellence') {
        let text = `📋 สรุปแผน: ${getPlanAbbr(currentAppPlan)}\n👤 เพศ: ${d.gender} | 🎂 อายุ: ${d.age} ปี\n🛡️ วงเงิน: ${formatNum(d.sum)} บาท\n💰 เบี้ย: ${Math.round(d.premium).toLocaleString()} บาท/ปี`;
        const lines = _get3DShareLines();
        if (lines.length) text += '\n' + lines.join('\n');
        return text;
    }

    const riderNames = [];
    if (window.currentTPDEnabled  && d.tpdPrem  > 0)   riderNames.push('TPD');
    if (window.currentDD50Enabled && d.dd50Prem > 0)   riderNames.push('DD50');
    if (window.currentHECEnabled)                       riderNames.push('HEC');

    const planAbbr = getPlanAbbr(currentAppPlan) + (riderNames.length ? '+' + riderNames.join('+') : '');
    return `📋 สรุปแผน: ${planAbbr}\n👤 เพศ: ${d.gender} | 🎂 อายุ: ${d.age} ปี\n🛡️ วงเงิน: ${formatNum(d.sum)} บาท\n💰 เบี้ย/ออม: ${Math.round(d.premium).toLocaleString()} บาท/ปี`;
}

function generateResultText(type) {
    if (!lastCalculationData) return ''; const d = lastCalculationData;
    if (type === 'premium') return `${Math.round(d.premium).toLocaleString()}`;
    
    let text = `📋 สรุปแผน: ${getPlanAbbr(currentAppPlan)}\n👤 เพศ ${d.gender} | 🎂 อายุ ${d.age} ปี\n💰 ออม/เบี้ย : ${Math.round(d.premium).toLocaleString()} บาท\n⏳ ระยะเวลาออม ${d.years} ปี\n🛡️ วงเงิน ${formatNum(d.sum)} บาท\n`;

    const pd = window.PRODUCT_CONDITIONS && window.PRODUCT_CONDITIONS[currentAppPlan];
    if (pd && pd.benefits && pd.benefits.length) {
        text += `\n--------------------------\n🛡️ ความคุ้มครองหลัก:\n`;
        pd.benefits.forEach(b => {
            let calcB = b.replace(/(\d+(?:\.\d+)?)%\s*ของทุน(?:ประกัน)?/g, (match, p1) => { return `${formatNum(d.sum * (parseFloat(p1) / 100))} บาท`; })
                         .replace(/(\d+(?:\.\d+)?)%\s*ของเบี้ย(?:ประกัน)?/g, (match, p1) => { return `${formatNum(d.premium * (parseFloat(p1) / 100))} บาท`; });
            text += `- ${calcB}\n`;
        });
        if(pd.remark && currentAppPlan === 'CI Extra Plus') text += `\nหมายเหตุ: ${pd.remark}\n`;
    }
    return text;
}

let currentShareType = '';

function openGenericShareModal(type) {
    if (type === 'all' && !lastCalculationData) return showCustomError("กรุณาคำนวณเบี้ยประกันก่อนแชร์");
    currentShareType = type;
    Swal.fire({
        html: `<div class="flex flex-col items-center pt-1 pb-1">
            <div class="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <i class="fas fa-share-nodes text-lg text-slate-500"></i>
            </div>
            <h3 class="text-base font-semibold text-slate-800 text-center mb-4 leading-snug px-2">เลือกช่องทางการแชร์</h3>
            <div class="grid grid-cols-3 gap-3 w-full">
                <button onclick="Swal.close(); setTimeout(() => { if(typeof shareToLine === 'function') shareToLine(); }, 200);" class="flex flex-col items-center justify-center py-3.5 bg-green-50 rounded-2xl border border-green-100 active:scale-95 transition-transform"><i class="fab fa-line text-[26px] text-[#00B900] mb-1.5"></i><span class="text-[10px] font-bold text-green-700">LINE</span></button>
                <button onclick="Swal.close(); setTimeout(() => { if(typeof shareToMessenger === 'function') shareToMessenger(); }, 200);" class="flex flex-col items-center justify-center py-3.5 bg-blue-50 rounded-2xl border border-blue-100 active:scale-95 transition-transform"><i class="fas fa-share-nodes text-[26px] text-[#0084FF] mb-1.5"></i><span class="text-[10px] font-bold text-blue-600">แชร์</span></button>
                <button onclick="Swal.close(); setTimeout(() => { if(typeof copyShareData === 'function') copyShareData(); }, 200);" class="flex flex-col items-center justify-center py-3.5 bg-slate-50 rounded-2xl border border-slate-200 active:scale-95 transition-transform"><i class="fas fa-copy text-[26px] text-slate-500 mb-1.5"></i><span class="text-[10px] font-bold text-slate-500">คัดลอก</span></button>
            </div>
        </div>`,
        showConfirmButton: false,
        showCloseButton: true,
        width: 'min(90vw, 320px)',
        padding: '1.25rem',
        customClass: {
            popup: '!rounded-3xl !shadow-2xl',
            closeButton: '!text-slate-400 hover:!text-red-500',
        },
    });
}

function generateSummaryText() {
    if (!lastCalculationData) return '';
    const d = lastCalculationData;
    const genderTh = d.gender;

    if (currentAppPlan === '3D Health Excellence') {
        const hx = window.currentHX || '';
        const hxInfo = hx && _3D_HX_INFO[hx] ? _3D_HX_INFO[hx] : null;
        // วงเงินโรคร้ายแรง 2 เท่า = 2 × วงเงินเหมาจ่าย HX (ไม่ใช่ ทุนประกันสัญญาหลัก)
        const _hxLimitNum = hxInfo ? parseInt(String(hxInfo.limit).replace(/,/g,'')) || 0 : 0;
        const ciAmt = _hxLimitNum * 2;
        const lines = [
            `📋 แผน: 3D Health Excellence`,
        ];
        if (hxInfo) {
            lines.push(`🏥 ค่าห้อง: ${hxInfo.room} บ./คืน`);
            lines.push(`💊 วงเงินเหมาจ่าย: ${_fmtMillion(hxInfo.limit)}`);
            if (ciAmt > 0) lines.push(`🦠 วงเงินโรคร้ายแรง: ${_fmtMillion(ciAmt)}`);
        }
        lines.push(`👤 เพศ: ${genderTh}`);
        lines.push(`🎂 อายุ: ${d.age} ปี`);
        lines.push(`💰 เบี้ย: ${Math.round(d.premium).toLocaleString()} บาท/ปี`);
        const extraLines = _get3DShareLines();
        extraLines.forEach(l => lines.push(l));
        const tpd3d = (window.currentTPDEnabled && d.tpdPrem > 0) ? Math.round(d.tpdPrem) : 0;
        if (tpd3d > 0) {
            const tpdSA3d = parseInt(String(d.tpdSA || '').replace(/,/g, '')) || 0;
            const tpdSAStr = tpdSA3d > 0 ? ` (ทุน ${formatNum(tpdSA3d)})` : '';
            lines.push(`➕ TPD${tpdSAStr}: ${tpd3d.toLocaleString()} บาท/ปี`);
        }
        return lines.join('\n');
    }

    // สัญญาเพิ่มเติม (riders): TPD / DD50 รวมอยู่ใน d.premium อยู่แล้ว, HEC เป็นเบี้ยแยก
    // ต่อชื่อแผน เช่น SLPA+TPD, LPB+DD50, CL+HEC, หรือผสม SLPA+TPD+HEC
    const tpdPrem  = (window.currentTPDEnabled  && d.tpdPrem  > 0) ? Math.round(d.tpdPrem)  : 0;
    const dd50Prem = (window.currentDD50Enabled && d.dd50Prem > 0) ? Math.round(d.dd50Prem) : 0;
    const hecOn = !!window.currentHECEnabled;
    const hecRaw = hecOn && typeof window.hecCurrentPremium === 'function' ? window.hecCurrentPremium() : null;
    const hecPrem = (hecOn && hecRaw != null) ? hecRaw : 0;

    const riderNames = [];
    if (tpdPrem  > 0) riderNames.push('TPD');
    if (dd50Prem > 0) riderNames.push('DD50');
    if (hecPrem  > 0) riderNames.push('HEC');

    const planAbbr = getPlanAbbr(currentAppPlan) + (riderNames.length ? '+' + riderNames.join('+') : '');

    if (riderNames.length) {
        // d.premium = เบี้ยหลัก + TPD + DD50 (HEC ยังไม่รวม) → เบี้ยหลักล้วน = d.premium - tpd - dd50
        const basePrem  = Math.round(d.premium) - tpdPrem - dd50Prem;
        const totalPrem = Math.round(d.premium) + hecPrem;
        const _saNum = (v) => parseInt(String(v || '').replace(/,/g, '')) || 0;
        const lines = [
            `📋 แผน: ${planAbbr}`,
            `💵 เบี้ยรวม: ${totalPrem.toLocaleString()} บาท/ปี`,
            ``,
            `👤 เพศ: ${genderTh}`,
            `🎂 อายุ: ${d.age} ปี`,
            `💰 เบี้ยหลัก: ${basePrem.toLocaleString()} บาท/ปี`,
            `🛡️ วงเงิน: ${formatNum(d.sum)} บาท`,
        ];
        if (tpdPrem  > 0) {
            const tpdSANum = _saNum(d.tpdSA);
            lines.push(`➕ TPD`);
            if (tpdSANum > 0) lines.push(`   ทุน: ${formatNum(tpdSANum)} บาท`);
            lines.push(`   เบี้ย: ${tpdPrem.toLocaleString()} บาท/ปี`);
        }
        if (dd50Prem > 0) {
            const dd50SANum = _saNum(d.dd50SA);
            lines.push(`➕ DD50`);
            if (dd50SANum > 0) lines.push(`   ทุน: ${formatNum(dd50SANum)} บาท`);
            lines.push(`   เบี้ย: ${dd50Prem.toLocaleString()} บาท/ปี`);
        }
        if (hecPrem  > 0) {
            lines.push(`➕ HEC: ${hecPrem.toLocaleString()} บาท/ปี`);
            const _hecPlan = window.HEC_PLANS && window.HEC_PLANS.find(p => p.id === window.currentHECPlan);
            if (_hecPlan) {
                lines.push(`🏥 ค่าห้อง: ${_hecPlan.room} บ./คืน`);
                lines.push(`💊 วงเงินเหมาจ่าย: ${_hecPlan.maxLabel}`);
                const _ciTotal = _hecPlan.maxBenefit * 2;
                lines.push(`🦠 วงเงินโรคร้ายแรง: ${_fmtMillion(_ciTotal)}`);
                const _ciCash = _hecPlan.id === '6' ? '100,000' : '50,000';
                lines.push(`💊 ชดเชยโรคร้าย (1 ครั้ง/ชีวิต): ${_ciCash} บาท`);
            }
        }
        if (d.years) lines.push(`⏳ ระยะเวลา: ${d.years} ปี`);
        return lines.join('\n');
    }

    const lines = [
        `📋 แผน: ${planAbbr}`,
        `👤 เพศ: ${genderTh}`,
        `🎂 อายุ: ${d.age} ปี`,
        `💰 ออม: ${Math.round(d.premium).toLocaleString()} บาท/ปี`,
        `🛡️ วงเงิน: ${formatNum(d.sum)} บาท`,
    ];
    if (d.years) lines.push(`⏳ ระยะเวลา: ${d.years} ปี`);
    return lines.join('\n');
}

function _getShareText() {
    if (currentShareType === 'installment') return pendingInstallmentData.allText || '';
    if (currentShareType === 'diseaseList') return 'https://short-url.org/1nMQi';
    if (['scb', 'bbl', 'bay', 'kbank'].includes(currentShareType)) {
        const bText = { scb: 'ธ.ไทยพาณิชย์ : 049-416-6866 สาขาถนนวิทยุ', bbl: 'ธ.กรุงเทพ : 147-312-5357 สาขาสุรวงศ์', bay: 'ธ.กรุงศรี : 001-016-4329 สาขาเพลินจิต', kbank: 'ธ.กสิกร : 099-132-6065 สาขาพหลโยธิน' };
        return bText[currentShareType] || '';
    }
    return generateSummaryText();
}

function _closeResultModals() {
    ['resultModal', 'slbResultModal', 'wxnResultModal', 'dynamicResultModal'].forEach(id => closePopup(id));
}

async function shareToLine() {
    _closeResultModals();
    const text = _getShareText();

    // LIFF: ใช้ shareTargetPicker (window.open บล็อก deep link ใน LINE in-app browser)
    if (window.LIFF_READY && window.IS_IN_LIFF
        && typeof liff !== 'undefined'
        && typeof liff.isApiAvailable === 'function'
        && liff.isApiAvailable('shareTargetPicker')) {
        console.log('[LIFF] shareToLine via shareTargetPicker');
        try {
            const ret = await liff.shareTargetPicker([{ type: 'text', text: text }]);
            if (ret) {
                Swal.fire({ icon: 'success', title: 'ส่งข้อความแล้ว', timer: 1200, showConfirmButton: false });
            }
            // ret === null = user ยกเลิก / ไม่เลือก target → ไม่ต้องแจ้ง error
        } catch (err) {
            console.warn('[LIFF] shareTargetPicker failed:', err);
            Swal.fire({
                icon: 'error',
                title: 'ไม่สามารถส่งข้อความได้',
                text: 'กรุณาลองใหม่อีกครั้ง หรือใช้ปุ่ม "คัดลอก" แทน',
                confirmButtonText: 'ตกลง'
            });
        }
        return;
    }

    // Browser ปกติ: คงโค้ดเดิม
    window.open('https://line.me/R/msg/text/?' + encodeURIComponent(text), '_blank');
}

async function shareToMessenger() {
    _closeResultModals();
    const text = _getShareText();

    // ใช้ native share sheet ถ้าอุปกรณ์รองรับ (iOS/Android จะมี Messenger ให้เลือก)
    if (navigator.share) {
        try {
            await navigator.share({ text });
            return;
        } catch (err) {
            if (err && err.name === 'AbortError') return; // user กดยกเลิก
        }
    }

    // Fallback: คัดลอกข้อความ
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            const ta = document.createElement('textarea');
            ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select();
            document.execCommand('copy'); document.body.removeChild(ta);
        }
    } catch {}
    Swal.fire({ icon: 'success', title: 'คัดลอกแล้ว', text: 'วางข้อความในแอปที่ต้องการได้เลย', timer: 2000, showConfirmButton: false });
}

async function copyShareData() {
    _closeResultModals();
    const text = _getShareText();

    // navigator.clipboard อาจไม่พร้อมใช้ใน LIFF / non-secure context — ลอง+fallback
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            Swal.fire({ icon: 'success', title: 'คัดลอกแล้ว', timer: 1200, showConfirmButton: false });
            return;
        }
        throw new Error('clipboard API unavailable');
    } catch (err) {
        if (window.IS_IN_LIFF) console.log('[LIFF] clipboard fallback to execCommand:', err && err.message);
        copyToClipboard(text, 'คัดลอกเรียบร้อยแล้ว');
    }
}

function copyToClipboard(text, msg) { const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); const toast = document.createElement('div'); toast.className = "fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full text-xs font-bold z-[1000] shadow-xl transition-opacity duration-300"; toast.innerText = msg; document.body.appendChild(toast); setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 300); }, 2000); }
function copyToClipboardWithFeedback(text, callback, customHTML) { const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); const toast = document.createElement('div'); toast.className = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800/95 text-white px-8 py-6 rounded-3xl text-sm font-bold z-[1000] shadow-2xl text-center backdrop-blur-sm transition-all"; toast.innerHTML = customHTML; document.body.appendChild(toast); setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => { toast.remove(); if (callback) callback(); }, 300); }, 1800); }

function executeShare(text, platform) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (platform === 'line') { const lineUrl = 'https://line.me/R/msg/text/?' + encodeURIComponent(text); if (isMobile) window.location.href = lineUrl; else window.open(lineUrl, '_blank'); } 
    else if (platform === 'messenger') { window.open('fb-messenger://share/?link=' + encodeURIComponent(text), '_blank'); }
}

let voiceRecog = null; let isVoiceListening = false; let _voiceAnalyzing = false;
let _voiceSilenceTimer = null; let _voiceAccumulated = '';

// ตัดคำที่ไม่เกี่ยวข้องกับการคำนวณออกจากข้อความที่แสดง
function cleanVoiceDisplay(text) {
    const fillers = [
        /\b(ครับผม|ครับ|ค่ะ|คะ|นะครับ|นะคะ|นะ|จ้า|จ้ะ|จา)\b/g,
        /\b(อ่า+|เอ่อ+|อืม+|อ๊ะ|อ้า|เออ)\b/g,
        /\b(ก็คือ|แล้วก็|ก็|คือว่า|คือ)\b/g,
        /\b(ขอทราบ|อยากทราบ|อยากรู้|ขอดู|ช่วยดู|ช่วยหน่อย|หน่อย)\b/g,
        /\b(ลอง|ช่วย|ขอ)\b/g,
        /\bคำนวณ(ให้)?(หน่อย)?\b/g,
        /\bให้หน่อย\b/g,
        /\bดูหน่อย\b/g,
    ];
    let t = text;
    for (const re of fillers) t = t.replace(re, '');
    return t.replace(/\s+/g, ' ').trim();
}

function _voiceFinalize() {
    if (_voiceSilenceTimer) { clearTimeout(_voiceSilenceTimer); _voiceSilenceTimer = null; }
    const raw = _voiceAccumulated.trim();
    _voiceAccumulated = '';
    if (!raw) return;
    _voiceAnalyzing = true;
    document.querySelectorAll('.fa-microphone').forEach(i => i.classList.remove('text-red-500', 'animate-pulse'));
    const lt = document.getElementById('voiceLiveText');
    const _old = document.getElementById('voiceAnalyzingLabel'); if (_old) _old.remove();
    if (lt) {
        lt.className = '';
        lt.textContent = cleanVoiceDisplay(raw);
        lt.insertAdjacentHTML('afterend', '<br><span id="voiceAnalyzingLabel" style="color:#00A651;font-size:12px;opacity:0.8;">กำลังวิเคราะห์...</span>');
    }
    if (voiceRecog) { try { voiceRecog.stop(); } catch(e) {} }
    setTimeout(() => {
        _voiceAnalyzing = false;
        const overlay = document.getElementById('voiceOverlay');
        if (overlay) overlay.classList.remove('active');
        processVoiceCommand(raw);
    }, 600);
}

function startVoiceRecognition() {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) { showCustomError("อุปกรณ์ไม่รองรับคำสั่งเสียง"); return; }
    if (isVoiceListening) {
        if (_voiceAccumulated.trim()) { _voiceFinalize(); }
        else { if (voiceRecog) { try { voiceRecog.stop(); } catch(e) {} } }
        return;
    }
    voiceRecog = null; // reset so we always create fresh
    const recog = new SpeechRecognition();
    voiceRecog = recog;
    recog.lang = 'th-TH';
    recog.continuous = true;
    recog.interimResults = true;
    recog.maxAlternatives = 1;
    _voiceAccumulated = '';

    const _setListening = (on) => {
        isVoiceListening = on;
        if (!on && _voiceAnalyzing) return;
        const overlay = document.getElementById('voiceOverlay');
        if (overlay) overlay.classList.toggle('active', on);
        ['navVoiceIcon','mainVoiceIcon'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.parentElement.classList.toggle('listening-active', on);
        });
    };

    recog.onstart = () => {
        _voiceAnalyzing = false;
        _voiceAccumulated = '';
        _setListening(true);
        const lt = document.getElementById('voiceLiveText');
        if (lt) { lt.className = 'interim'; lt.textContent = 'กำลังฟัง...'; }
        document.querySelectorAll('.fa-microphone').forEach(i => i.classList.add('text-red-500', 'animate-pulse'));
    };

    recog.onend = () => {
        _setListening(false);
        document.querySelectorAll('.fa-microphone').forEach(i => i.classList.remove('text-red-500', 'animate-pulse'));
        if (_voiceSilenceTimer) { clearTimeout(_voiceSilenceTimer); _voiceSilenceTimer = null; }
    };

    recog.onerror = (e) => {
        if (e.error === 'no-speech') return; // ฟังต่อ อย่าหยุด
        _voiceAnalyzing = false;
        _setListening(false);
        if (_voiceSilenceTimer) { clearTimeout(_voiceSilenceTimer); _voiceSilenceTimer = null; }
        document.querySelectorAll('.fa-microphone').forEach(i => i.classList.remove('text-red-500', 'animate-pulse'));
    };

    recog.onresult = (event) => {
        const lt = document.getElementById('voiceLiveText');
        let interim = '', newFinal = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) newFinal += event.results[i][0].transcript;
            else interim += event.results[i][0].transcript;
        }
        if (newFinal) {
            _voiceAccumulated += (_voiceAccumulated ? ' ' : '') + newFinal;
        }
        if (lt) {
            const display = cleanVoiceDisplay(_voiceAccumulated + (interim ? ' ' + interim : ''));
            if (display) {
                lt.className = interim ? 'interim' : '';
                lt.textContent = display || 'กำลังฟัง...';
            }
        }
        // รีเซ็ต silence timer ทุกครั้งที่ได้ยินเสียง
        if (_voiceSilenceTimer) clearTimeout(_voiceSilenceTimer);
        if (_voiceAccumulated.trim()) {
            _voiceSilenceTimer = setTimeout(() => _voiceFinalize(), 2500);
        }
    };

    try { recog.start(); } catch(e) {}
}

function showVoiceResultPopup(d) {
    if (currentAppPlan === 'Signature Legacy' && d.sum < 5000000) {
        Swal.fire({ icon: 'warning', title: 'ทุนประกันไม่ถึงเกณฑ์', text: 'แผน Signature Legacy บังคับทุนประกันขั้นต่ำที่ 5,000,000 บาท กรุณาระบุข้อมูลใหม่', confirmButtonColor: '#3085d6', confirmButtonText: 'ตกลง' });
        return;
    }

    const cfg = (typeof PLAN_CONFIG !== 'undefined' && PLAN_CONFIG[currentAppPlan]) || {};
    const hasCashFlow = !!cfg.hasCashFlow;
    const fmtNum = (n) => typeof formatNum === 'function' ? formatNum(n) : Math.round(n).toLocaleString();

    // ดึงระยะเวลาจาก currentPlan
    const planYearsLabel = (() => {
        const m = String(currentPlan || '').match(/\d+/);
        if (!m) return null;
        const n = parseInt(m[0]);
        if (currentAppPlan === 'Century Life' || currentAppPlan === '3D Health Excellence') {
            if (n >= 100) return 'คุ้มครองถึงอายุ 100 ปี';
            if (n >= 90)  return 'คุ้มครองถึงอายุ 90 ปี';
            if (n >= 60)  return 'คุ้มครองถึงอายุ 60 ปี';
        }
        return `${n} ปี`;
    })();

    let rows = '';
    rows += `<div class="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100 mb-2"><span class="text-[13px] font-bold text-slate-600">เพศ</span><span class="text-[13px] font-bold text-blue-800">${d.gender}</span></div>`;
    rows += `<div class="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100 mb-2"><span class="text-[13px] font-bold text-slate-600">อายุ</span><span class="text-[13px] font-bold text-blue-800">${d.age} ปี</span></div>`;
    if (planYearsLabel) {
        rows += `<div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 mb-2"><span class="text-[13px] font-bold text-slate-600">ระยะเวลา</span><span class="text-[13px] font-bold text-slate-700">${planYearsLabel}</span></div>`;
    }

    if (hasCashFlow) {
        rows += `<div class="flex justify-between items-center p-3 bg-indigo-50 rounded-xl border border-indigo-100 mb-2"><span class="text-[13px] font-bold text-slate-600">จำนวนเงินออม</span><span class="text-[13px] font-black text-indigo-700">${Math.round(d.premium).toLocaleString()} บาท/ปี</span></div>`;
        rows += `<div class="flex justify-between items-center p-3 bg-indigo-50 rounded-xl border border-indigo-100 mb-2"><span class="text-[13px] font-bold text-slate-600">ทุนประกันชีวิต</span><span class="text-[13px] font-black text-indigo-700">${fmtNum(d.sum)} บาท</span></div>`;
        rows += `<div class="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100 mb-2"><span class="text-[13px] font-bold text-slate-600">กระแสเงินสด</span><span class="text-[13px] font-black text-emerald-700">${Math.round(d.cashFlow || 0).toLocaleString()} บาท/ปี</span></div>`;
    } else {
        rows += `<div class="flex justify-between items-center p-3 bg-rose-50 rounded-xl border border-rose-100 mb-2"><span class="text-[13px] font-bold text-slate-600">เบี้ยประกัน</span><span class="text-[13px] font-black text-rose-700">${Math.round(d.premium).toLocaleString()} บาท/ปี</span></div>`;
        rows += `<div class="flex justify-between items-center p-3 bg-rose-50 rounded-xl border border-rose-100 mb-2"><span class="text-[13px] font-bold text-slate-600">ทุนประกันชีวิต</span><span class="text-[13px] font-black text-rose-700">${fmtNum(d.sum)} บาท</span></div>`;
        const _pillBtn = "w-full flex items-center gap-3 p-4 bg-white border border-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-[#00A651]/10 active:scale-[0.98] transition-all";
        rows += `<div class="flex flex-col gap-3 mt-4 mb-2">
    <button onclick="closePopup('voiceResultModal'); Swal.close(); setTimeout(() => { if(typeof openTableFromModal === 'function') openTableFromModal(); }, 200);" class="${_pillBtn}"><i class="fas fa-table text-lg text-blue-500"></i><span class="text-slate-700 font-medium">ดูตารางผลประโยชน์</span></button>
    <button onclick="closePopup('voiceResultModal'); Swal.close(); setTimeout(() => { if(typeof openGenericShareModal === 'function') openGenericShareModal('summary'); }, 200);" class="${_pillBtn}"><i class="fas fa-share-nodes text-lg text-[#00A651]"></i><span class="text-slate-700 font-medium">แชร์ให้ลูกค้า</span></button>
    <button onclick="closePopup('voiceResultModal'); Swal.close(); setTimeout(() => { if(typeof openInstallmentModal === 'function') openInstallmentModal(); }, 200);" class="${_pillBtn}"><i class="fas fa-credit-card text-lg text-purple-500"></i><span class="text-slate-700 font-medium">ตัวเลือกชำระ</span></button>
    <button onclick="closePopup('voiceResultModal'); Swal.close(); setTimeout(() => { if(typeof openBankModal === 'function') openBankModal(); }, 200);" class="${_pillBtn}"><i class="fas fa-money-bill-transfer text-lg text-orange-500"></i><span class="text-slate-700 font-medium">บัญชีโอนเงิน</span></button>
    <button onclick="closePopup('voiceResultModal'); Swal.close(); setTimeout(() => { if(typeof openEsubModal === 'function') openEsubModal(); }, 200);" class="${_pillBtn}"><i class="fas fa-laptop-medical text-lg text-teal-500"></i><span class="text-slate-700 font-medium">E-Submission</span></button>
</div>`;
    }

    let modal = document.getElementById('voiceResultModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'voiceResultModal';
        modal.className = 'modal-overlay hidden';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `<div class="modal-content-card p-5" onclick="event.stopPropagation()">
        <div class="flex justify-between items-center mb-4 border-b border-slate-100 pb-3 shrink-0">
            <h3 class="text-[20px] font-bold text-slate-800 flex items-center gap-2"><i class="fas fa-microphone text-rose-500"></i> ผลการคำนวณ</h3>
            <button onclick="closePopup('voiceResultModal')" class="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors text-xl font-bold">&times;</button>
        </div>
        <div class="text-center mb-3 shrink-0">
            <span class="inline-block bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-1.5 rounded-full text-[12px] font-bold shadow-sm">${currentAppPlan}</span>
        </div>
        <div style="overflow-y:auto;flex:1;-webkit-overflow-scrolling:touch;">${rows}</div>
    </div>`;
    openPopup('voiceResultModal');
}

function showDefinition(title, desc) { document.getElementById('defTitle').innerText = title; document.getElementById('defDescription').innerText = desc; openPopup('definitionModal'); }

function setupLongPress() {
    return; // ปิดฟังก์ชั่นกดค้างดูเงื่อนไขทุกแบบประกัน
    const btn = document.getElementById('mainHeaderBtn'); if (!btn) return;
    let pressTimer; let startX, startY;
    const handleStart = (x, y) => { 
        isLongPressActive = false; startX = x; startY = y; 
        pressTimer = setTimeout(() => { 
            isLongPressActive = true; 
            updateConditionsModal(currentAppPlan); 
            openPopup('insuranceConditionsModal'); 
            if (navigator.vibrate) navigator.vibrate(50); 
        }, 500); 
    };
    const handleMove = (x, y) => { if (!startX || !startY) return; if (Math.abs(x - startX) > 10 || Math.abs(y - startY) > 10) { clearTimeout(pressTimer); } };
    btn.addEventListener('touchstart', (e) => { handleStart(e.touches[0].clientX, e.touches[0].clientY); }, {passive: true});
    btn.addEventListener('touchmove', (e) => { handleMove(e.touches[0].clientX, e.touches[0].clientY); }, {passive: true});
    btn.addEventListener('touchend', () => clearTimeout(pressTimer));
    btn.addEventListener('mousedown', (e) => { if (e.button !== 0) return; handleStart(e.clientX, e.clientY); });
    btn.addEventListener('mousemove', (e) => { handleMove(e.clientX, e.clientY); });
    btn.addEventListener('mouseup', () => clearTimeout(pressTimer));
    btn.addEventListener('mouseleave', () => clearTimeout(pressTimer));
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
}

function setupScrollHideNav() {
    const bottomNav = document.getElementById('bottomNavContainer'); if (!bottomNav) return;
    const attached = new WeakSet();
    const attach = (el) => {
        if (!el || attached.has(el)) return;
        attached.add(el);
        let lastScrollTop = 0;
        el.addEventListener('scroll', function() {
            if (typeof window.isWideLayout === 'function' && window.isWideLayout()) {
                bottomNav.style.transform = 'translateY(0)';
                bottomNav.style.opacity = '1';
                return;
            }
            let st = this.scrollTop;
            if (st <= 10) { bottomNav.style.transform = 'translateY(0)'; bottomNav.style.opacity = '1'; lastScrollTop = st; return; }
            if (st < 0) return; if (Math.abs(lastScrollTop - st) <= 5) return;
            if (st > lastScrollTop) { bottomNav.style.transform = 'translateY(150%)'; bottomNav.style.opacity = '0'; }
            else { bottomNav.style.transform = 'translateY(0)'; bottomNav.style.opacity = '1'; }
            lastScrollTop = st;
        }, { passive: true });
    };
    document.querySelectorAll('.scrollable-view').forEach(attach);
    // ผูก listener กับ scrollable-view ที่ถูก render ทีหลัง (ทุก plan)
    const mo = new MutationObserver(() => {
        document.querySelectorAll('.scrollable-view').forEach(attach);
    });
    mo.observe(document.body, { childList: true, subtree: true });
}
