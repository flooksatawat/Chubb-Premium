// ==================== SHARING MODULE ====================
let pendingInstallmentData = {};

function triggerInstallmentShare(type) {
    if (!lastCalculationData) return; 
    const d = lastCalculationData; const p = d.premium; let amt = 0, label = ''; 
    if(type === 'monthly') { amt = Math.round(p * 0.09); label = 'รายเดือน'; } if(type === '3month') { amt = Math.round(p * 0.27); label = 'ราย 3 เดือน'; } if(type === '6month') { amt = Math.round(p * 0.52); label = 'ราย 6 เดือน'; } 
    
    const sumStr = formatNum(d.sum); 
    const premOnlyText = `${amt.toLocaleString()}`;
    let allText = `📋 สรุปแผน: ${getPlanAbbr(currentAppPlan)}\n👤 เพศ ${d.gender} | 🎂 อายุ ${d.age} ปี\n💰 ออมเงิน : ${amt.toLocaleString()} บาท (${label})\n⏳ ระยะเวลาออม ${d.years} ปี\n🛡️ วงเงิน ${sumStr} บาท\n`; 
    
    const pd = window.PRODUCT_CONDITIONS && window.PRODUCT_CONDITIONS[currentAppPlan];
    if (pd && pd.benefits && pd.benefits.length) {
        allText += `\n--------------------------\n🛡️ ความคุ้มครองหลัก:\n`;
        pd.benefits.forEach(b => {
            let calcB = b.replace(/(\d+(?:\.\d+)?)%\s*ของทุน(?:ประกัน)?/g, (match, p1) => { return `${formatNum(d.sum * (parseFloat(p1) / 100))} บาท`; })
                         .replace(/(\d+(?:\.\d+)?)%\s*ของเบี้ย(?:ประกัน)?/g, (match, p1) => { return `${formatNum(d.premium * (parseFloat(p1) / 100))} บาท`; });
            allText += `- ${calcB}\n`;
        });
        if(pd.remark) allText += `\nหมายเหตุ: ${pd.remark}\n`;
    }

    pendingInstallmentData = { premOnly: premOnlyText, allText: allText, label: label };
    currentShareType = 'installment';
    closePopup('installmentModal');
    Swal.fire({
        html: `<div class="flex flex-col items-center mt-2 px-1">
            <i class="fas fa-share-nodes text-3xl text-slate-800 mb-3"></i>
            <h3 class="text-lg font-bold text-slate-700 mb-5">แชร์ยอดชำระ${label}</h3>
            <div class="grid grid-cols-3 gap-3 w-full">
                <button onclick="Swal.close(); setTimeout(() => { if(typeof shareToLine === 'function') shareToLine(); }, 200);" class="flex flex-col items-center justify-center py-5 bg-[#Edfced] rounded-2xl border border-[#b6e3b4] active:scale-95 transition-transform"><i class="fab fa-line text-4xl text-[#00B900] mb-2"></i><span class="text-[10px] font-bold text-[#00B900]">LINE</span></button>
                <button onclick="Swal.close(); setTimeout(() => { if(typeof shareToMessenger === 'function') shareToMessenger(); }, 200);" class="flex flex-col items-center justify-center py-5 bg-[#e6f2ff] rounded-2xl border border-[#b8daff] active:scale-95 transition-transform"><i class="fab fa-facebook-messenger text-4xl text-[#0084FF] mb-2"></i><span class="text-[10px] font-bold text-[#0084FF]">MESSENGER</span></button>
                <button onclick="Swal.close(); setTimeout(() => { if(typeof copyShareData === 'function') copyShareData(); }, 200);" class="flex flex-col items-center justify-center py-5 bg-[#f8f9fa] rounded-2xl border border-[#dee2e6] active:scale-95 transition-transform"><i class="fas fa-copy text-4xl text-slate-600 mb-2"></i><span class="text-[10px] font-bold text-slate-600">คัดลอก</span></button>
            </div>
        </div>`,
        showConfirmButton: false,
        showCloseButton: true,
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
        if(pd.remark) text += `\nหมายเหตุ: ${pd.remark}\n`;
    }
    return text;
}

let currentShareType = '';

function openGenericShareModal(type) {
    if (type === 'all' && !lastCalculationData) return showCustomError("กรุณาคำนวณเบี้ยประกันก่อนแชร์");
    currentShareType = type;
    Swal.fire({
        html: `<div class="flex flex-col items-center mt-2 px-1">
            <i class="fas fa-share-nodes text-3xl text-slate-800 mb-3"></i>
            <h3 class="text-lg font-bold text-slate-700 mb-5">เลือกช่องทางการแชร์</h3>
            <div class="grid grid-cols-3 gap-3 w-full">
                <button onclick="Swal.close(); setTimeout(() => { if(typeof shareToLine === 'function') shareToLine(); }, 200);" class="flex flex-col items-center justify-center py-5 bg-[#Edfced] rounded-2xl border border-[#b6e3b4] active:scale-95 transition-transform"><i class="fab fa-line text-4xl text-[#00B900] mb-2"></i><span class="text-[10px] font-bold text-[#00B900]">LINE</span></button>
                <button onclick="Swal.close(); setTimeout(() => { if(typeof shareToMessenger === 'function') shareToMessenger(); }, 200);" class="flex flex-col items-center justify-center py-5 bg-[#e6f2ff] rounded-2xl border border-[#b8daff] active:scale-95 transition-transform"><i class="fab fa-facebook-messenger text-4xl text-[#0084FF] mb-2"></i><span class="text-[10px] font-bold text-[#0084FF]">MESSENGER</span></button>
                <button onclick="Swal.close(); setTimeout(() => { if(typeof copyShareData === 'function') copyShareData(); }, 200);" class="flex flex-col items-center justify-center py-5 bg-[#f8f9fa] rounded-2xl border border-[#dee2e6] active:scale-95 transition-transform"><i class="fas fa-copy text-4xl text-slate-600 mb-2"></i><span class="text-[10px] font-bold text-slate-600">คัดลอก</span></button>
            </div>
        </div>`,
        showConfirmButton: false,
        showCloseButton: true,
    });
}

function _getShareText() {
    if (currentShareType === 'installment') return pendingInstallmentData.allText || '';
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

function shareToLine() {
    _closeResultModals();
    window.open('https://line.me/R/msg/text/?' + encodeURIComponent(_getShareText()), '_blank');
}

function shareToMessenger() {
    _closeResultModals();
    window.open('fb-messenger://share/?link=' + encodeURIComponent(_getShareText()), '_blank');
}

function copyShareData() {
    _closeResultModals();
    const text = _getShareText();
    navigator.clipboard.writeText(text).then(() => {
        Swal.fire({ icon: 'success', title: 'คัดลอกแล้ว', timer: 1200, showConfirmButton: false });
    }).catch(() => { copyToClipboard(text, 'คัดลอกเรียบร้อยแล้ว'); });
}

function copyToClipboard(text, msg) { const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); const toast = document.createElement('div'); toast.className = "fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full text-xs font-bold z-[1000] shadow-xl transition-opacity duration-300"; toast.innerText = msg; document.body.appendChild(toast); setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 300); }, 2000); }
function copyToClipboardWithFeedback(text, callback, customHTML) { const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); const toast = document.createElement('div'); toast.className = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800/95 text-white px-8 py-6 rounded-3xl text-sm font-bold z-[1000] shadow-2xl text-center backdrop-blur-sm transition-all"; toast.innerHTML = customHTML; document.body.appendChild(toast); setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => { toast.remove(); if (callback) callback(); }, 300); }, 1800); }

function executeShare(text, platform) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (platform === 'line') { const lineUrl = 'https://line.me/R/msg/text/?' + encodeURIComponent(text); if (isMobile) window.location.href = lineUrl; else window.open(lineUrl, '_blank'); } 
    else if (platform === 'messenger') { window.open('fb-messenger://share/?link=' + encodeURIComponent(text), '_blank'); }
}

let voiceRecog = null; let isVoiceListening = false;

function startVoiceRecognition() {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) { showCustomError("อุปกรณ์ไม่รองรับคำสั่งเสียง"); return; }
    if (isVoiceListening) { if (voiceRecog) voiceRecog.stop(); return; }
    if (!voiceRecog) {
        voiceRecog = new SpeechRecognition();
        voiceRecog.lang = 'th-TH';
        voiceRecog.continuous = false;
        voiceRecog.interimResults = false;
        const _setListening = (on) => {
            isVoiceListening = on;
            ['navVoiceIcon','mainVoiceIcon'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.parentElement.classList.toggle('listening-active', on);
            });
        };
        voiceRecog.onstart = () => { _setListening(true); document.querySelectorAll('.fa-microphone').forEach(icon => icon.classList.add('text-red-500', 'animate-pulse')); };
        voiceRecog.onend   = () => { _setListening(false); document.querySelectorAll('.fa-microphone').forEach(icon => icon.classList.remove('text-red-500', 'animate-pulse')); };
        voiceRecog.onerror = () => { _setListening(false); document.querySelectorAll('.fa-microphone').forEach(icon => icon.classList.remove('text-red-500', 'animate-pulse')); };
        voiceRecog.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.querySelectorAll('.fa-microphone').forEach(icon => icon.classList.remove('text-red-500', 'animate-pulse'));
            processVoiceCommand(transcript);
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
            if (n >= 90) return 'คุ้มครองถึงอายุ 90 ปี';
            if (n >= 60) return 'คุ้มครองถึงอายุ 60 ปี';
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
        rows += `<div class="grid grid-cols-5 gap-2 mt-4 mb-2 px-1">
    <button onclick="closePopup('voiceResultModal'); Swal.close(); setTimeout(() => { if(typeof openTableFromModal === 'function') openTableFromModal(); }, 200);" class="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-200 active:bg-blue-50 transition-colors"><i class="fas fa-table text-blue-500 mb-1"></i><span class="text-[9px] font-medium text-slate-600">ตาราง</span></button>
    <button onclick="closePopup('voiceResultModal'); Swal.close(); setTimeout(() => { if(typeof sharePlan === 'function') sharePlan(); }, 200);" class="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-200 active:bg-blue-50 transition-colors"><i class="fas fa-share-nodes text-green-500 mb-1"></i><span class="text-[9px] font-medium text-slate-600">แชร์</span></button>
    <button onclick="closePopup('voiceResultModal'); Swal.close(); setTimeout(() => { if(typeof openInstallmentModal === 'function') openInstallmentModal(); }, 200);" class="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-200 active:bg-blue-50 transition-colors"><i class="fas fa-credit-card text-purple-500 mb-1"></i><span class="text-[9px] font-medium text-slate-600">ชำระ</span></button>
    <button onclick="closePopup('voiceResultModal'); Swal.close(); setTimeout(() => { if(typeof openBankModal === 'function') openBankModal(); }, 200);" class="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-200 active:bg-blue-50 transition-colors"><i class="fas fa-money-bill-transfer text-orange-500 mb-1"></i><span class="text-[9px] font-medium text-slate-600">บัญชี</span></button>
    <button onclick="closePopup('voiceResultModal'); Swal.close(); setTimeout(() => { if(typeof openEsubModal === 'function') openEsubModal(); }, 200);" class="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-200 active:bg-blue-50 transition-colors"><i class="fas fa-laptop-medical text-teal-500 mb-1"></i><span class="text-[9px] font-medium text-slate-600">E-sub</span></button>
</div>`;
        rows += `<button onclick="manualTriggerPopup(); closePopup('voiceResultModal')" class="w-full mt-3 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 text-[14px] active:scale-95 transition-transform"><i class='fas fa-file-alt'></i> ดูรายละเอียด</button>`;
    }

    let modal = document.getElementById('voiceResultModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'voiceResultModal';
        modal.className = 'modal-overlay hidden';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `<div class="modal-content-card p-5" onclick="event.stopPropagation()">
        <div class="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <h3 class="text-[16px] font-bold text-slate-800 flex items-center gap-2"><i class="fas fa-microphone text-rose-500"></i> ผลการคำนวณ</h3>
            <button onclick="closePopup('voiceResultModal')" class="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors text-xl font-bold">&times;</button>
        </div>
        <div class="text-center mb-3">
            <span class="inline-block bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-1.5 rounded-full text-[12px] font-bold shadow-sm">${currentAppPlan}</span>
        </div>
        <div>${rows}</div>
    </div>`;
    openPopup('voiceResultModal');
}

function showDefinition(title, desc) { document.getElementById('defTitle').innerText = title; document.getElementById('defDescription').innerText = desc; openPopup('definitionModal'); }

function setupLongPress() {
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
    document.querySelectorAll('.scrollable-view').forEach(el => {
        let lastScrollTop = 0;
        el.addEventListener('scroll', function() {
            let st = this.scrollTop;
            if (st <= 10) { bottomNav.style.transform = 'translateY(0)'; bottomNav.style.opacity = '1'; lastScrollTop = st; return; }
            if (st < 0) return; if (Math.abs(lastScrollTop - st) <= 5) return; 
            if (st > lastScrollTop) { bottomNav.style.transform = 'translateY(150%)'; bottomNav.style.opacity = '0'; } 
            else { bottomNav.style.transform = 'translateY(0)'; bottomNav.style.opacity = '1'; }
            lastScrollTop = st;
        }, { passive: true });
    });
}
