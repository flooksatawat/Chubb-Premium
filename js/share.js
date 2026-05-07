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
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    closePopup('installmentModal');
    Swal.fire({
        title: 'แชร์ยอดชำระ' + label,
        html: `<div style="display:flex;flex-direction:column;gap:10px;margin-top:8px;">
            <button id="swal-line-btn" style="width:100%;padding:12px;background:#06C755;color:#fff;font-weight:700;border:none;border-radius:12px;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;"><i class="fab fa-line" style="font-size:18px;"></i> LINE</button>
            <button id="swal-messenger-btn" style="width:100%;padding:12px;background:#0084FF;color:#fff;font-weight:700;border:none;border-radius:12px;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;"><i class="fab fa-facebook-messenger" style="font-size:18px;"></i> Messenger</button>
            <button id="swal-copy-btn" style="width:100%;padding:12px;background:#374151;color:#fff;font-weight:700;border:none;border-radius:12px;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;"><i class="fas fa-copy" style="font-size:18px;"></i> คัดลอก</button>
        </div>`,
        showConfirmButton: false,
        showCloseButton: true,
        didOpen: () => {
            document.getElementById('swal-line-btn').addEventListener('click', () => {
                window.open('https://line.me/R/msg/text/?' + encodeURIComponent(allText), '_blank');
                Swal.close();
            });
            document.getElementById('swal-messenger-btn').addEventListener('click', () => {
                navigator.clipboard.writeText(allText).catch(() => {});
                window.open(isMobile ? 'fb-messenger://' : 'https://www.messenger.com/', '_blank');
                Swal.close();
            });
            document.getElementById('swal-copy-btn').addEventListener('click', () => {
                navigator.clipboard.writeText(allText).then(() => {
                    Swal.fire({ icon: 'success', title: 'คัดลอกแล้ว', timer: 1200, showConfirmButton: false });
                });
            });
        }
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
function openGenericShareModal(type) { if (type === 'all' && !lastCalculationData) return showCustomError("กรุณาคำนวณเบี้ยประกันก่อนแชร์"); currentShareType = type; openPopup('genericShareModal'); }

function handleGenericShare(platform) {
    if (currentShareType === 'diseaseList') {
        const text = 'https://short-url.org/1nMQi';
        if (platform === 'copy') copyToClipboard(text, 'คัดลอกลิงก์เรียบร้อยแล้ว'); else executeShare(text, platform);
    } else if (currentShareType === 'premium' || currentShareType === 'all' || currentShareType === 'slb' || currentShareType === 'wxn') {
        if (platform === 'copy') {
            Swal.fire({
                title: 'เลือกรูปแบบการแชร์',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'ข้อมูลทั้งหมด',
                cancelButtonText: 'ข้อมูลแบบย่อ',
                reverseButtons: true,
                confirmButtonColor: '#3b82f6',
                cancelButtonColor: '#6b7280'
            }).then((result) => {
                if (result.isConfirmed) {
                    copyToClipboard(generateResultText(currentShareType), "คัดลอกข้อมูลทั้งหมดเรียบร้อยแล้ว");
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    const shortText = `เพศ: ${lastCalculationData.gender} | อายุ: ${lastCalculationData.age} | วงเงิน: ${formatNum(lastCalculationData.sum)} บาท | ออมเงิน: ${Math.round(lastCalculationData.premium).toLocaleString()} บาท`;
                    copyToClipboard(shortText, "คัดลอกข้อมูลแบบย่อเรียบร้อยแล้ว");
                }
                closePopup('resultModal'); closePopup('slbResultModal'); closePopup('wxnResultModal'); closePopup('dynamicResultModal');
            });
        } else {
            closePopup('resultModal'); closePopup('slbResultModal'); closePopup('wxnResultModal'); closePopup('dynamicResultModal');
            const shareText = generateResultText(currentShareType).replace(/(\d+(?:\.\d+)?)%\s*ของทุน(?:ประกัน)?/g, (match, p1) => `${formatNum(lastCalculationData.sum * (parseFloat(p1) / 100))} บาท`).replace(/(\d+(?:\.\d+)?)%\s*ของเบี้ย(?:ประกัน)?/g, (match, p1) => `${formatNum(lastCalculationData.premium * (parseFloat(p1) / 100))} บาท`);
            executeShare(shareText, platform);
        }
    } else if (currentShareType === 'installmentPrem' || currentShareType === 'installmentAll') {
        const textToShare = currentShareType === 'installmentPrem' ? pendingInstallmentData.premOnly : pendingInstallmentData.allText;
        if (platform === 'copy') copyToClipboard(textToShare, `คัดลอกเรียบร้อยแล้ว`); else executeShare(textToShare, platform);
    } else if (['scb', 'bbl', 'bay', 'kbank'].includes(currentShareType)) {
        const bText = {"scb": "ธ.ไทยพาณิชย์ : 049-416-6866 สาขาถนนวิทยุ", "bbl": "ธ.กรุงเทพ : 147-312-5357 สาขาสุรวงศ์", "bay": "ธ.กรุงศรี : 001-016-4329 สาขาเพลินจิต", "kbank": "ธ.กสิกร : 099-132-6065 สาขาพหลโยธิน"};
        if (platform === 'copy') copyToClipboard(bText[currentShareType], 'คัดลอกบัญชีเรียบร้อยแล้ว'); else executeShare(bText[currentShareType], platform);
    }
    closePopup('genericShareModal');
}

function copyToClipboard(text, msg) { const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); const toast = document.createElement('div'); toast.className = "fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full text-xs font-bold z-[1000] shadow-xl transition-opacity duration-300"; toast.innerText = msg; document.body.appendChild(toast); setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 300); }, 2000); }
function copyToClipboardWithFeedback(text, callback, customHTML) { const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); const toast = document.createElement('div'); toast.className = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800/95 text-white px-8 py-6 rounded-3xl text-sm font-bold z-[1000] shadow-2xl text-center backdrop-blur-sm transition-all"; toast.innerHTML = customHTML; document.body.appendChild(toast); setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => { toast.remove(); if (callback) callback(); }, 300); }, 1800); }

function executeShare(text, platform) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (platform === 'line') { const lineUrl = 'https://line.me/R/msg/text/?' + encodeURIComponent(text); if (isMobile) window.location.href = lineUrl; else window.open(lineUrl, '_blank'); } 
    else if (platform === 'messenger') { const fbHtml = `<div class="w-14 h-14 bg-[#0084FF] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"><i class='fab fa-facebook-messenger text-3xl text-white'></i></div><span class="text-base font-bold block mb-1">เปิด Messenger แล้ว</span><span class='text-xs font-medium opacity-90 block text-blue-200'>กรุณาวางข้อความในแชทที่ต้องการ</span>`; copyToClipboardWithFeedback(text, () => { if (isMobile) { window.location.href = 'fb-messenger://'; setTimeout(() => { window.open('https://www.messenger.com/', '_blank'); }, 800); } else { window.open('https://www.messenger.com/', '_blank'); } }, fbHtml); } 
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
