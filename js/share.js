// ==================== SHARING MODULE ====================
let pendingInstallmentData = {};

function triggerInstallmentShare(type) {
    if (!lastCalculationData) return; 
    const d = lastCalculationData; const p = d.premium; let amt = 0, label = ''; 
    if(type === 'monthly') { amt = Math.round(p * 0.09); label = 'รายเดือน'; } if(type === '3month') { amt = Math.round(p * 0.27); label = 'ราย 3 เดือน'; } if(type === '6month') { amt = Math.round(p * 0.52); label = 'ราย 6 เดือน'; } 
    
    const sumStr = formatNum(d.sum);
    const premOnlyText = `${amt.toLocaleString()}`;
    const genderTh = d.gender === 'male' ? 'ชาย' : 'หญิง';
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
                <button onclick="Swal.close(); setTimeout(() => { if(typeof shareToMessenger === 'function') shareToMessenger(); }, 200);" class="hide-in-liff flex flex-col items-center justify-center py-3.5 bg-blue-50 rounded-2xl border border-blue-100 active:scale-95 transition-transform"><i class="fab fa-facebook-messenger text-[26px] text-[#0084FF] mb-1.5"></i><span class="text-[10px] font-bold text-blue-600">Messenger</span></button>
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

function generateShortShareText() {
    if (!lastCalculationData) return ''; const d = lastCalculationData;
    return `📋 สรุปแผน: ${getPlanAbbr(currentAppPlan)}\n👤 เพศ: ${d.gender} | 🎂 อายุ: ${d.age} ปี\n🛡️ วงเงิน: ${formatNum(d.sum)} บาท\n💰 ออมเงิน: ${Math.round(d.premium).toLocaleString()} บาท/ปี`;
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
                <button onclick="Swal.close(); setTimeout(() => { if(typeof shareToMessenger === 'function') shareToMessenger(); }, 200);" class="hide-in-liff flex flex-col items-center justify-center py-3.5 bg-blue-50 rounded-2xl border border-blue-100 active:scale-95 transition-transform"><i class="fab fa-facebook-messenger text-[26px] text-[#0084FF] mb-1.5"></i><span class="text-[10px] font-bold text-blue-600">Messenger</span></button>
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
    const genderTh = d.gender === 'male' ? 'ชาย' : 'หญิง';
    const lines = [
        `📋 แผน: ${getPlanAbbr(currentAppPlan)}`,
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
    if (currentShareType === 'summary') return generateSummaryText();
    if (currentShareType === 'diseaseList') return 'https://short-url.org/1nMQi';
    if (['scb', 'bbl', 'bay', 'kbank'].includes(currentShareType)) {
        const bText = { scb: 'ธ.ไทยพาณิชย์ : 049-416-6866 สาขาถนนวิทยุ', bbl: 'ธ.กรุงเทพ : 147-312-5357 สาขาสุรวงศ์', bay: 'ธ.กรุงศรี : 001-016-4329 สาขาเพลินจิต', kbank: 'ธ.กสิกร : 099-132-6065 สาขาพหลโยธิน' };
        return bText[currentShareType] || '';
    }
    return generateResultText(currentShareType);
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

    // Web Share API (Android Chrome / iOS Safari) — วิธีที่ดีที่สุด
    if (navigator.share) {
        try {
            await navigator.share({ text });
            return;
        } catch (e) {
            if (e.name === 'AbortError') return; // ผู้ใช้กดยกเลิก
        }
    }

    // Fallback: คัดลอกแล้วแจ้ง
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
    }
    Swal.fire({ icon: 'success', title: 'คัดลอกแล้ว', text: 'วางข้อความใน Messenger ได้เลย', timer: 1800, showConfirmButton: false });
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

function startVoiceRecognition() {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) { showCustomError("อุปกรณ์ไม่รองรับคำสั่งเสียง"); return; }
    if (isVoiceListening) { if (voiceRecog) voiceRecog.stop(); return; }
    if (!voiceRecog) {
        voiceRecog = new SpeechRecognition();
        voiceRecog.lang = 'th-TH';
        voiceRecog.continuous = false;
        voiceRecog.interimResults = true;
        const _setListening = (on) => {
            isVoiceListening = on;
            if (!on && _voiceAnalyzing) return; // keep overlay alive during analyzing pause
            const overlay = document.getElementById('voiceOverlay');
            if (overlay) overlay.classList.toggle('active', on);
            ['navVoiceIcon','mainVoiceIcon'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.parentElement.classList.toggle('listening-active', on);
            });
        };
        voiceRecog.onstart = () => {
            _voiceAnalyzing = false;
            _setListening(true);
            const lt = document.getElementById('voiceLiveText');
            if (lt) { lt.className = 'interim'; lt.textContent = 'กำลังฟัง...'; }
            document.querySelectorAll('.fa-microphone').forEach(i => i.classList.add('text-red-500', 'animate-pulse'));
        };
        voiceRecog.onend = () => {
            _setListening(false);
            document.querySelectorAll('.fa-microphone').forEach(i => i.classList.remove('text-red-500', 'animate-pulse'));
        };
        voiceRecog.onerror = () => {
            _voiceAnalyzing = false;
            _setListening(false);
            document.querySelectorAll('.fa-microphone').forEach(i => i.classList.remove('text-red-500', 'animate-pulse'));
        };
        voiceRecog.onresult = (event) => {
            const lt = document.getElementById('voiceLiveText');
            let interim = '', final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) final += event.results[i][0].transcript;
                else interim += event.results[i][0].transcript;
            }
            if (lt) {
                if (final) {
                    lt.className = '';
                    lt.textContent = final;
                } else if (interim) {
                    lt.className = 'interim';
                    lt.textContent = interim;
                }
            }
            if (final) {
                _voiceAnalyzing = true;
                document.querySelectorAll('.fa-microphone').forEach(i => i.classList.remove('text-red-500', 'animate-pulse'));
                const _old = document.getElementById('voiceAnalyzingLabel'); if (_old) _old.remove();
                if (lt) { lt.insertAdjacentHTML('afterend', '<br><span id="voiceAnalyzingLabel" style="color:#00A651;font-size:12px;opacity:0.8;">กำลังวิเคราะห์...</span>'); }
                setTimeout(() => {
                    _voiceAnalyzing = false;
                    const overlay = document.getElementById('voiceOverlay');
                    if (overlay) overlay.classList.remove('active');
                    processVoiceCommand(final);
                }, 800);
            }
        };
    }
    try { voiceRecog.start(); } catch(e) {}
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
