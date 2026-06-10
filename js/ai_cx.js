// ==================== AI ที่ปรึกษาการขาย — CI Extra Plus (CX) ====================
// พัฒนาต่อจาก https://flooksatawat.github.io/CX/
// ปรับปรุงสำคัญ:
//   1) Offline-first — เนื้อหาชุดสมบูรณ์ฝังในตัว ทำงานได้ทุกเครื่องแม้ไม่มีเน็ต/ไม่มี API
//   2) ยกเลิก API Key สาธารณะที่ฝังตายตัว (เดิมใช้ key เดียวร่วมกันทุกคน → โดนจำกัดโควตา/บล็อก/หมดอายุ
//      ทำให้ "ใช้ไม่ได้ทุกเครื่อง") เปลี่ยนเป็นให้ผู้ใช้ใส่ key ของตัวเอง (เก็บใน localStorage ต่อเครื่อง)
//   3) AI เป็นแค่ "ตัวเสริม" — ถ้าไม่มี key หรือเรียกไม่สำเร็จ ก็แสดงเนื้อหาฝังในตัวทันที

window.AI_CX = (function () {
    'use strict';

    // ---------- เนื้อหาฝังในตัว (Offline-first) ----------
    const aiPool = {
        stats_adult: [
            "<div class='_aiItem'><strong>มะเร็ง (อันดับ 1):</strong> สาเหตุการเสียชีวิตสูงสุดของคนไทย CI Extra Plus คุ้มครองตั้งแต่ 'มะเร็งระยะไม่ลุกลาม' (กลุ่ม 5 โรค) ถึง 'มะเร็งระยะลุกลาม' (กลุ่ม 45 โรค)</div>",
            "<div class='_aiItem'><strong>ภัยเงียบวัยทำงาน (Stroke):</strong> ครอบคลุมตั้งแต่ 'หลอดเลือดสมองโป่งพอง/ตีบ' (กลุ่ม 5 โรค) ถึง 'หลอดเลือดสมองแตก/อุดตัน' (กลุ่ม 45 โรค)</div>",
            "<div class='_aiItem'><strong>โรคหัวใจเรื้อรัง:</strong> คนไทยป่วยพุ่งสูง คุ้มครอง 'ทำบอลลูน/สวนหัวใจ' (กลุ่ม 5 โรค) ถึง 'กล้ามเนื้อหัวใจตาย/บายพาส' (กลุ่ม 45 โรค)</div>",
            "<div class='_aiItem'><strong>ระบบประสาทและสมอง:</strong> คุ้มครอง 'เนื้องอกในสมองชนิดไม่ใช่มะเร็ง' ถึง 'อัลไซเมอร์/พาร์กินสัน' ที่พบได้ตั้งแต่อายุยังไม่มาก</div>",
            "<div class='_aiItem'><strong>อวัยวะสำคัญเสื่อม:</strong> ครอบคลุม 'ไตวายเรื้อรัง' และ 'ตับวาย' (กลุ่ม 45 โรค) ผลพวงระยะยาวจากเบาหวานและความดัน</div>"
        ],
        stats_child: [
            "<div class='_aiItem'><strong>โรคฮิตวัยเรียน:</strong> 'มือ เท้า ปาก ที่มีอาการแทรกซ้อนรุนแรง' (1 ใน 15 โรคเด็ก) ระบาดบ่อยในโรงเรียน/เนอสเซอรี่</div>",
            "<div class='_aiItem'><strong>เสี่ยงโรคหัวใจ:</strong> 'คาวาซากิที่แทรกซ้อนทางหัวใจ' (1 ใน 15 โรคเด็ก) สาเหตุอันดับ 1 ของโรคหัวใจที่ไม่ได้เป็นแต่กำเนิดในเด็ก</div>",
            "<div class='_aiItem'><strong>ทางเดินหายใจ:</strong> 'หอบหืดขั้นรุนแรง' (1 ใน 15 โรคเด็ก) เด็กไทยป่วยเพิ่มขึ้นจากอากาศและฝุ่น PM 2.5</div>",
            "<div class='_aiItem'><strong>มะเร็งในเด็ก:</strong> แม้อายุน้อยก็พบ 'มะเร็งระยะลุกลาม' เช่น มะเร็งเม็ดเลือดขาว ซึ่งคุ้มครองในหมวด 45 โรคร้าย</div>",
            "<div class='_aiItem'><strong>ประสาทและสมอง:</strong> 'ลมชักรุนแรง' (15 โรคเด็ก) และ 'สมองอักเสบจากไวรัส' (45 โรคร้าย) กระทบพัฒนาการเด็กและค่ารักษาสูงมาก</div>"
        ],
        costs_adult: [
            "<div class='_aiItem'><strong>หัวใจและหลอดเลือด:</strong> ผ่าตัดบายพาส 600,000–1,200,000 บาท / บอลลูนขยายหลอดเลือด 200,000–400,000 บาท/เส้น</div>",
            "<div class='_aiItem'><strong>เทคโนโลยีรักษามะเร็ง:</strong> ยามุ่งเป้า (Targeted) 1,500,000–3,000,000 บาท/คอร์ส / PET Scan 40,000–60,000 บาท/ครั้ง</div>",
            "<div class='_aiItem'><strong>หลอดเลือดสมอง (Stroke):</strong> ผ่าตัดสมอง/ดูดลิ่มเลือด 400,000–1,000,000 บาท / ICU 20,000–50,000 บาท/วัน</div>",
            "<div class='_aiItem'><strong>เวชศาสตร์ฟื้นฟู:</strong> กายภาพ/กิจกรรมบำบัด 1,000–3,000 บาท/ครั้ง / อุปกรณ์ฟื้นฟู 10,000–50,000 บาท</div>",
            "<div class='_aiItem'><strong>แพทย์ทางเลือก/ศัลยกรรม:</strong> ฝังเข็ม 1,500–3,000 บาท/ครั้ง / เสริมเต้านมหลังมะเร็ง 150,000–300,000 บาท</div>"
        ],
        costs_child: [
            "<div class='_aiItem'><strong>โรคหัวใจในเด็ก:</strong> ผ่าตัดลิ้นหัวใจ 400,000–800,000 บาท / รักษาคาวาซากิด้วย IVIG 150,000–300,000 บาท</div>",
            "<div class='_aiItem'><strong>มะเร็งในเด็ก:</strong> ปลูกถ่ายไขกระดูก 1,500,000–3,000,000 บาท / คีโมบำบัดเด็ก 300,000–1,000,000 บาท</div>",
            "<div class='_aiItem'><strong>ภาวะวิกฤตเด็ก:</strong> ค่าห้อง PICU โรงพยาบาลเอกชน 30,000–80,000 บาท/วัน</div>",
            "<div class='_aiItem'><strong>ฟื้นฟูพัฒนาการ:</strong> กายภาพ/กิจกรรมบำบัด 1,500–3,000 บาท/ครั้ง / เครื่องมือฟื้นฟู 20,000–100,000 บาท</div>",
            "<div class='_aiItem'><strong>แพทย์ทางเลือกเด็ก:</strong> ฝังเข็ม/แผนจีนปรับสมดุล 1,500–3,000 บาท/ครั้ง / วารีบำบัด 2,000–5,000 บาท/ครั้ง</div>"
        ],
        ideas_adult: [
            "<strong>กลยุทธ์ \"ตู้ ATM ประจำบ้าน\":</strong><br>\"ถ้าที่บ้านมีตู้ ATM ที่กดเงินให้ครอบครัวได้ทุกเดือน คุณจะทำประกันให้ตู้ใบนี้ไหมครับ? คุณคือตู้ ATM ใบนั้น แผนนี้คือประกันของตู้ใบนี้ครับ\"<br><br><div class='_aiClose'><strong>ปิดการขาย:</strong> \"เพื่อการันตีว่าตู้ใบนี้ผลิตเงินให้ครอบครัวได้แม้ในวันวิกฤต เซ็นคุ้มครองตั้งแต่วันนี้นะครับ\"</div>",
            "<strong>กลยุทธ์ \"รถยนต์ VS ร่างกาย\":</strong><br>\"รถเหล็กพังยังเบิกอะไหล่ได้ แต่ร่างกายไม่มีอะไหล่ขาย รถหลักล้านเรายังจ่ายประกันชั้น 1 ปีละหลายหมื่น แล้วร่างกายที่หาเงินซื้อรถล่ะครับ?\"<br><br><div class='_aiClose'><strong>ปิดการขาย:</strong> \"มาทำประกันชั้น 1 ให้เครื่องจักรที่สำคัญที่สุดในชีวิตกันนะครับ\"</div>",
            "<strong>กลยุทธ์ \"เช่าเงินก้อนโต\":</strong><br>\"วันที่เป็นโรคร้ายต้องใช้เงินล้าน คุณอยากแคะกระปุกตัวเอง หรืออยาก 'เช่าเงิน' บริษัทหลักหมื่น แล้วให้บริษัทจ่ายล้านให้แทนครับ?\"<br><br><div class='_aiClose'><strong>ปิดการขาย:</strong> \"เก็บเงินสดไว้สานฝันครอบครัว ปล่อยให้ความเสี่ยงหลักล้านเป็นหน้าที่ผมดูแล เซ็นได้เลยครับ\"</div>",
            "<strong>กลยุทธ์ \"ห่านทองคำ\":</strong><br>\"เรามักห่วงไข่ทองคำ (รถ บ้าน ทรัพย์สิน) จนลืมห่วง 'ห่านทองคำ' (ตัวเรา) ที่ออกไข่ ถ้าห่านป่วย ทรัพย์สินอาจต้องขายทิ้งเพื่อรักษาห่านครับ\"<br><br><div class='_aiClose'><strong>ปิดการขาย:</strong> \"มาปกป้องห่านทองคำให้ปลอดภัยทุกสถานการณ์กันครับ\"</div>",
            "<strong>กลยุทธ์ \"เงินเดือนสำรองช่วงพักฟื้น\":</strong><br>\"ประกันสุขภาพจ่ายค่าหมอ แต่ไม่จ่ายค่าเทอมลูก/ค่าผ่อนบ้านตอนเราหยุดงานพักฟื้น แผนนี้คือ 'รายได้สำรอง' รักษามาตรฐานชีวิตคนข้างหลังครับ\"<br><br><div class='_aiClose'><strong>ปิดการขาย:</strong> \"ให้กรมธรรม์ฉบับนี้เป็นเสาหลักแทนคุณในวันวิกฤตนะครับ\"</div>",
            "<strong>กลยุทธ์ \"เงินออมแบบมีผู้คุ้มกัน\":</strong><br>\"แผนนี้ไม่ใช่รายจ่าย แต่คือการฝากเงินในตู้เซฟที่มีบริษัทเฝ้าให้ ถ้าโจรชื่อ 'โรคร้าย' มาปล้น บริษัทจ่ายแทน ถ้าครบสัญญาไม่มีอะไรเกิด ก็รับเงินคืนพร้อมผลตอบแทนครับ\"<br><br><div class='_aiClose'><strong>ปิดการขาย:</strong> \"ออมแบบไม่มีขาดทุน มีแต่ความสบายใจ มาเปิดตู้เซฟสุขภาพกันครับ\"</div>",
            "<strong>กลยุทธ์ \"เปลี่ยนเงินก้อนเล็กเป็นก้อนใหญ่\":</strong><br>\"ถ้ามีคนขอเงินคุณหลักร้อยต่อเดือน แลกกับการเตรียมเงินหลักล้านให้ทันทีในวันป่วยหนัก คุณรับไหมครับ? แผนนี้คือสัญญาข้อนั้นครับ\"<br><br><div class='_aiClose'><strong>ปิดการขาย:</strong> \"สร้างหลักประกันเงินล้านด้วยเงินก้อนเล็กตั้งแต่วันนี้นะครับ\"</div>",
            "<strong>กลยุทธ์ \"ซื้อเวลา ซื้ออนาคต\":</strong><br>\"สุขภาพดีซื้อด้วยเงินไม่ได้ แต่เราซื้อ 'ความคุ้มครอง' ในวันที่ยังแข็งแรงได้ เพราะถ้าสุขภาพเปลี่ยนไป มีเงินร้อยล้านบริษัทก็ไม่รับแล้วครับ\"<br><br><div class='_aiClose'><strong>ปิดการขาย:</strong> \"ล็อคสุขภาพและอนาคตในวันที่ยังมีสิทธิ์เลือกนะครับ\"</div>"
        ],
        ideas_child: [
            "<strong>กลยุทธ์ \"ใบเบิกทาง VIP\":</strong><br>\"เมื่อลูกป่วย พ่อแม่อยากให้ลูกได้รับการรักษาที่ดีที่สุด แผนนี้คือ 'ใบเบิกทาง VIP' การันตีว่าคุณแม่มีเงินก้อนใหญ่ทันทีเพื่อเลือก รพ. และหมอที่เก่งที่สุดให้น้องได้ครับ\"<br><br><div class='_aiClose'><strong>ปิดการขาย:</strong> \"อย่าให้คำว่า 'ไม่มีเงิน' มาจำกัดทางเลือกในการรักษาลูกรักเลยครับ\"</div>",
            "<strong>กลยุทธ์ \"ค่าชดเชยเวลาของพ่อแม่\":</strong><br>\"เวลาลูกป่วยหนัก หัวใจคนเป็นแม่เจ็บกว่าหลายเท่า เงินก้อนนี้คือ 'ค่าตกใจ' ชดเชยรายได้ที่หายไป ให้คุณแม่ลางานมาเฝ้าน้องได้เต็มที่ 100% ครับ\"<br><br><div class='_aiClose'><strong>ปิดการขาย:</strong> \"ให้เงินก้อนนี้เป็นเบาะรองรับความกังวลใจของคุณแม่ในวันวิกฤตนะครับ\"</div>",
            "<strong>กลยุทธ์ \"ล็อคสุขภาพเพื่ออนาคตยาวไกล\":</strong><br>\"ทำประกันให้ลูกตั้งแต่แรกเกิดคือการ 'ล็อค' ประวัติสุขภาพที่สะอาดไว้กับสัญญายาวถึงอายุ 90 ปี โตขึ้นต่อให้มีปัญหาสุขภาพ บริษัทก็ตัดสิทธิ์ไม่ได้แล้วครับ\"<br><br><div class='_aiClose'><strong>ปิดการขาย:</strong> \"สวัสดิการติดตัวตลอดชีพ คือของขวัญชิ้นแรกที่ดีที่สุดสำหรับน้องครับ\"</div>",
            "<strong>กลยุทธ์ \"เงินขวัญถุง ทุนการศึกษา\":</strong><br>\"ถ้าน้องโตมาแข็งแรงไม่ป่วยหนัก เบี้ยที่จ่ายไม่ได้หายไปไหน แต่กลายเป็น 'เงินก้อนใหญ่' คืนเป็นทุนการศึกษาตอนน้องโต ได้ทั้งคุ้มครองทั้งเงินเก็บครับ\"<br><br><div class='_aiClose'><strong>ปิดการขาย:</strong> \"เป็นการออมที่คุ้มค่าแบบ 2 in 1 เพื่อลูกรักจริงๆ ครับ\"</div>",
            "<strong>กลยุทธ์ \"ฟื้นฟูเต็มร้อยเพื่อลูกรัก\":</strong><br>\"เด็กป่วยหนัก 1 ครั้งอาจกระทบพัฒนาการระยะยาว แผนนี้มีวงเงิน 'เวชศาสตร์ฟื้นฟู' จ่ายค่ากิจกรรม/กายภาพบำบัด ให้น้องกลับมาพัฒนาการสมวัยไม่สะดุดครับ\"<br><br><div class='_aiClose'><strong>ปิดการขาย:</strong> \"เพราะพัฒนาการของลูกรอไม่ได้ ให้เงินก้อนนี้ดูแลน้องต่อเนื่องหลังออกจาก รพ. นะครับ\"</div>",
            "<strong>กลยุทธ์ \"ปกป้องเงินเก็บครอบครัว\":</strong><br>\"โรคร้ายในเด็ก 1 ครั้งอาจหมายถึงเงินเกษียณของพ่อแม่หลายแสนที่สลายไป แผนนี้คือการจ้างบริษัทมาจ่ายบิล รพ. แทน เพื่อรักษากระแสเงินสดของครอบครัวครับ\"<br><br><div class='_aiClose'><strong>ปิดการขาย:</strong> \"ให้เงินเก็บไปสร้างอนาคตน้อง ส่วนค่ารักษาหลักล้านปล่อยให้ผมดูแลแทนครับ\"</div>"
        ]
    };

    // ---------- ตัวช่วย ----------
    function _isChild() {
        const age = parseInt(document.getElementById('ageInput')?.value) || 0;
        return age >= 0 && age <= 15;
    }
    function _targetText() { return _isChild() ? "เด็กแรกเกิดถึง 15 ปี" : "ผู้ใหญ่และวัยทำงาน"; }
    function _shuffle(arr) { return [...arr].sort(() => 0.5 - Math.random()); }
    function _pickPool(base) { return _isChild() ? aiPool[base + '_child'] : aiPool[base + '_adult']; }

    const _SEP = "<div style='margin:10px 0;border-bottom:1px dashed #e2e8f0;'></div>";

    // ---------- จัดการ API Key (เก็บต่อเครื่อง — แก้ข้อจำกัด key สาธารณะ) ----------
    const _LS_KEY = 'cx_gemini_api_key';
    function getUserKey() { try { return localStorage.getItem(_LS_KEY) || ''; } catch (e) { return ''; } }
    function setUserKey(k) { try { k ? localStorage.setItem(_LS_KEY, k) : localStorage.removeItem(_LS_KEY); } catch (e) {} }

    window._aiCXManageKey = async function () {
        const cur = getUserKey();
        const { value, isConfirmed } = await Swal.fire({
            title: '<span style="font-family:Kanit,sans-serif;font-size:15px;">🔑 ตั้งค่า Gemini API Key</span>',
            html: `<div style="font-family:Kanit,sans-serif;text-align:left;font-size:12px;color:#475569;line-height:1.6;">
                ใส่ API Key ของคุณเองเพื่อเปิดใช้ AI แบบเรียลไทม์ (ไม่บังคับ — ถ้าไม่ใส่ ระบบจะใช้เนื้อหาในตัวที่ครบถ้วนอยู่แล้ว)<br>
                <span style="color:#94a3b8;">รับฟรีที่ <strong>aistudio.google.com/apikey</strong> · เก็บไว้ในเครื่องนี้เท่านั้น</span>
                <input id="_aiKeyInput" type="text" value="${cur}" placeholder="AIza..." style="width:100%;margin-top:10px;padding:10px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:13px;font-family:monospace;box-sizing:border-box;">
            </div>`,
            showCancelButton: true,
            confirmButtonText: 'บันทึก',
            cancelButtonText: cur ? 'ลบ Key' : 'ปิด',
            confirmButtonColor: '#2563eb',
            cancelButtonColor: cur ? '#ef4444' : '#94a3b8',
            width: Math.min(360, window.innerWidth - 20),
            preConfirm: () => document.getElementById('_aiKeyInput')?.value?.trim(),
            didOpen: () => { const p = Swal.getPopup(); if (p) p.style.borderRadius = '18px'; }
        });
        if (isConfirmed) { setUserKey(value || ''); }
        else if (cur) { setUserKey(''); } // ปุ่ม "ลบ Key"
    };

    async function fetchGemini(prompt, systemText) {
        const key = getUserKey();
        if (!key) return null; // ไม่มี key → ใช้เนื้อหาในตัว
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemText || "คุณคือผู้เชี่ยวชาญด้านประกันสุขภาพและสถิติการแพทย์ในประเทศไทย ตอบสั้น กระชับ เป็น HTML น่าอ่าน" }] }
        };
        const delays = [800, 1600, 3200];
        for (let i = 0; i <= delays.length; i++) {
            try {
                const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const data = await res.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return text.replace(/```html/g, '').replace(/```/g, '').trim();
                return null;
            } catch (e) {
                if (i === delays.length) return null;
                await new Promise(r => setTimeout(r, delays[i]));
            }
        }
        return null;
    }

    // ---------- โครง Swal มาตรฐานของฟีเจอร์ ----------
    function _openInfoModal(opts) {
        // opts: { icon, title, color, render(refresh), addIdeaBtn }
        const addBtn = opts.addIdeaBtn ? `<button onclick="window.AI_CX.addCustomIdea()" style="flex:1;padding:9px;border-radius:10px;border:1.5px solid #d97706;background:#fffbeb;color:#b45309;font-family:Kanit,sans-serif;font-size:12px;font-weight:700;cursor:pointer;"><i class="fas fa-plus" style="margin-right:5px;"></i>เพิ่มไอเดีย</button>` : '';
        Swal.fire({
            title: `<span style="font-family:Kanit,sans-serif;font-size:16px;color:${opts.color};"><i class="fas ${opts.icon}" style="margin-right:7px;"></i>${opts.title}</span>`,
            html: `<div id="_aiContent" style="font-family:Kanit,sans-serif;text-align:left;font-size:13px;color:#334155;line-height:1.7;min-height:120px;"></div>
                   <div style="display:flex;gap:8px;margin-top:14px;">
                       <button onclick="window.AI_CX._refresh()" style="flex:1;padding:9px;border-radius:10px;border:1.5px solid ${opts.color}33;background:${opts.color}11;color:${opts.color};font-family:Kanit,sans-serif;font-size:12px;font-weight:700;cursor:pointer;"><i class="fas fa-sync-alt" style="margin-right:5px;"></i>สุ่มใหม่</button>
                       ${addBtn}
                   </div>`,
            showConfirmButton: false,
            showCloseButton: true,
            width: Math.min(window.innerWidth - 20, 460),
            didOpen: () => { const p = Swal.getPopup(); if (p) p.style.borderRadius = '20px'; opts.render(false); }
        });
        AI_CX._refresh = () => opts.render(true);
    }

    function _setContent(html) { const el = document.getElementById('_aiContent'); if (el) el.innerHTML = html; }
    function _loading(msg) {
        _setContent(`<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px 0;color:#818cf8;"><i class="fas fa-robot fa-2x" style="margin-bottom:10px;animation:_aiBounce 1s infinite;"></i><span style="font-size:13px;font-weight:700;">${msg}</span></div>`);
    }

    // ---------- Custom ideas (localStorage) ----------
    const _LS_CUSTOM = 'cx_custom_ideas';
    function _loadCustomIdeas() { try { return JSON.parse(localStorage.getItem(_LS_CUSTOM) || '[]'); } catch (e) { return []; } }
    function _saveCustomIdeas(arr) { try { localStorage.setItem(_LS_CUSTOM, JSON.stringify(arr)); } catch (e) {} }

    async function addCustomIdea() {
        const { value: title } = await Swal.fire({
            title: '<span style="font-family:Kanit,sans-serif;font-size:15px;color:#b45309;"><i class="fas fa-plus" style="margin-right:6px;"></i>เพิ่มไอเดียการขาย</span>',
            input: 'text',
            inputLabel: 'ชื่อกลยุทธ์',
            inputPlaceholder: 'เช่น กลยุทธ์ "ตู้ ATM ประจำบ้าน"',
            inputAttributes: { style: 'font-family:Kanit,sans-serif;font-size:13px;' },
            showCancelButton: true, confirmButtonText: 'ถัดไป', cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#d97706',
            didOpen: () => { const p = Swal.getPopup(); if (p) p.style.borderRadius = '20px'; }
        });
        if (!title || !title.trim()) return;
        const { value: body } = await Swal.fire({
            title: '<span style="font-family:Kanit,sans-serif;font-size:15px;color:#b45309;">บทพูด / รายละเอียด</span>',
            input: 'textarea',
            inputLabel: 'บทพูดปิดการขาย',
            inputPlaceholder: 'เขียนบทพูดหรือรายละเอียดไอเดียนี้...',
            inputAttributes: { rows: 5, style: 'font-family:Kanit,sans-serif;font-size:13px;' },
            showCancelButton: true, confirmButtonText: 'บันทึก', cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#d97706',
            didOpen: () => { const p = Swal.getPopup(); if (p) p.style.borderRadius = '20px'; }
        });
        if (!body || !body.trim()) return;
        const html = `<strong>${title.trim()}</strong><br>${body.trim().replace(/\n/g, '<br>')}`;
        const customs = _loadCustomIdeas();
        customs.push({ html, forChild: _isChild() });
        _saveCustomIdeas(customs);
        _toast('บันทึกไอเดียเรียบร้อย ✓');
        if (typeof window.AI_CX._refresh === 'function') window.AI_CX._refresh();
    }

    function deleteCustomIdea(idx) {
        const customs = _loadCustomIdeas();
        customs.splice(idx, 1);
        _saveCustomIdeas(customs);
        showAllIdeas();
    }

    function _pickPoolWithCustom(base) {
        const builtin = _pickPool(base);
        if (base !== 'ideas') return builtin;
        const customs = _loadCustomIdeas();
        const filtered = customs.filter(c => !!c.forChild === _isChild()).map(c => `<div class='_aiItem _aiCustom'>${c.html}</div>`);
        return [...filtered, ...builtin];
    }

    // ---------- 1) สถิติโรคร้าย ----------
    window.openAIStats = function () {
        _openInfoModal({
            icon: 'fa-chart-pie', title: 'สถิติโรคร้าย', color: '#4f46e5',
            render: () => { _setContent(_shuffle(_pickPool('stats')).slice(0, 3).join(_SEP)); }
        });
    };

    // ---------- 2) ประมาณการค่ารักษา ----------
    window.openAICosts = function () {
        _openInfoModal({
            icon: 'fa-file-invoice-dollar', title: 'ประมาณการค่ารักษา', color: '#0891b2',
            render: () => { _setContent(_shuffle(_pickPool('costs')).slice(0, 3).join(_SEP)); }
        });
    };

    // ---------- 3) ไอเดียการขาย ----------
    window.openAIIdeas = function () {
        _openInfoModal({
            icon: 'fa-lightbulb', title: 'ไอเดียการขาย', color: '#d97706', addIdeaBtn: true,
            render: () => {
                const pool = _pickPoolWithCustom('ideas');
                _setContent(pool[Math.floor(Math.random() * pool.length)] + _allIdeasBtn());
            }
        });
    };

    function _allIdeasBtn() {
        return `<div style="margin-top:12px;"><button onclick="window.AI_CX.showAllIdeas()" style="width:100%;padding:9px;border-radius:10px;border:1.5px solid #fcd34d;background:#fffbeb;color:#b45309;font-family:Kanit,sans-serif;font-size:12px;font-weight:700;cursor:pointer;"><i class="fas fa-list-ul" style="margin-right:5px;"></i>ดูไอเดียทั้งหมด</button></div>`;
    }

    window.AI_CX_showAllIdeas = function () {}; // placeholder (compat)

    function showAllIdeas() {
        const customs = _loadCustomIdeas().filter(c => !!c.forChild === _isChild());
        const builtin = _pickPool('ideas');

        let items = '';
        // custom ideas (with delete button)
        customs.forEach((c, ci) => {
            const m = c.html.match(/<strong>(.*?)<\/strong>/);
            const title = m ? m[1].replace(/[:""]/g, '').trim() : `ไอเดียของฉัน ${ci + 1}`;
            items += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                <button onclick="window.AI_CX.viewCustomIdea(${ci})" style="flex:1;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px;background:#fffbeb;border:1.5px solid #fcd34d;border-radius:12px;cursor:pointer;font-family:Kanit,sans-serif;">
                    <span style="display:flex;align-items:center;gap:10px;"><span style="width:30px;height:30px;border-radius:50%;background:#fef3c7;color:#d97706;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas fa-star" style="font-size:11px;"></i></span><span style="font-size:12.5px;font-weight:700;color:#92400e;line-height:1.3;">${title}</span></span>
                    <i class="fas fa-chevron-right" style="color:#fbbf24;font-size:11px;flex-shrink:0;"></i>
                </button>
                <button onclick="window.AI_CX.deleteCustomIdea(${ci})" style="padding:10px;border-radius:10px;border:1px solid #fecaca;background:#fff1f2;color:#ef4444;font-size:12px;cursor:pointer;flex-shrink:0;" title="ลบ"><i class="fas fa-trash-alt"></i></button>
            </div>`;
        });
        // built-in ideas
        builtin.forEach((idea, i) => {
            const m = idea.match(/<strong>(.*?)<\/strong>/);
            const title = m ? m[1].replace(/[:""]/g, '').trim() : `ไอเดียที่ ${i + 1}`;
            items += `<button onclick="window.AI_CX.viewIdea(${i})" style="width:100%;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:8px;cursor:pointer;font-family:Kanit,sans-serif;">
                <span style="display:flex;align-items:center;gap:10px;"><span style="width:30px;height:30px;border-radius:50%;background:#fef3c7;color:#d97706;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas fa-lightbulb" style="font-size:12px;"></i></span><span style="font-size:12.5px;font-weight:700;color:#475569;line-height:1.3;">${title}</span></span>
                <i class="fas fa-chevron-right" style="color:#cbd5e1;font-size:11px;flex-shrink:0;"></i>
            </button>`;
        });

        Swal.fire({
            title: '<span style="font-family:Kanit,sans-serif;font-size:16px;color:#b45309;"><i class="fas fa-list-ul" style="margin-right:7px;"></i>ไอเดียการขายทั้งหมด</span>',
            html: `<div style="text-align:left;max-height:60vh;overflow-y:auto;">${items}</div>`,
            showConfirmButton: false, showCloseButton: true,
            width: Math.min(window.innerWidth - 20, 480),
            didOpen: () => { const p = Swal.getPopup(); if (p) p.style.borderRadius = '20px'; }
        });
    }

    function viewCustomIdea(ci) {
        const customs = _loadCustomIdeas().filter(c => !!c.forChild === _isChild());
        const c = customs[ci];
        if (!c) return;
        const m = c.html.match(/<strong>(.*?)<\/strong>/);
        const title = m ? m[1].replace(/[:""]/g, '').trim() : `ไอเดียของฉัน ${ci + 1}`;
        const body = c.html.replace(/<strong>.*?<\/strong><br>/, '');
        Swal.fire({
            title: `<span style="font-family:Kanit,sans-serif;font-size:15px;color:#b45309;">⭐ ${title}</span>`,
            html: `<div style="font-family:Kanit,sans-serif;text-align:left;font-size:13px;color:#334155;line-height:1.7;">${body}</div>`,
            showConfirmButton: false, showCloseButton: true,
            width: Math.min(window.innerWidth - 20, 460),
            didOpen: () => { const p = Swal.getPopup(); if (p) p.style.borderRadius = '20px'; }
        });
    }

    function viewIdea(i) {
        const pool = _pickPool('ideas');
        const idea = pool[i];
        const m = idea.match(/<strong>(.*?)<\/strong>/);
        const title = m ? m[1].replace(/[:""]/g, '').trim() : `ไอเดียที่ ${i + 1}`;
        const body = idea.replace(/<strong>.*?<\/strong><br>/, '');
        Swal.fire({
            title: `<span style="font-family:Kanit,sans-serif;font-size:15px;color:#b45309;">💡 ${title}</span>`,
            html: `<div style="font-family:Kanit,sans-serif;text-align:left;font-size:13px;color:#334155;line-height:1.7;">${body}</div>`,
            showConfirmButton: false, showCloseButton: true,
            width: Math.min(window.innerWidth - 20, 460),
            didOpen: () => { const p = Swal.getPopup(); if (p) p.style.borderRadius = '20px'; }
        });
    }

    function _toast(msg) {
        if (typeof Swal !== 'undefined' && Swal.fire) {
            Swal.fire({ toast: true, position: 'bottom', text: msg, showConfirmButton: false, timer: 2600, timerProgressBar: true, customClass: { popup: '_aiToast' } });
        }
    }

    // ---------- HTML เมนู 3 ปุ่ม (แทรกใน aiMenu เมื่อเลือก CX) ----------
    function menuHTML() {
        const btn = (fn, icon, iconColor, bg, brd, txtColor, title, sub) => `
            <button onclick="closePopup&&closePopup('aiMenuModal');if(typeof Swal!=='undefined'&&Swal.isVisible())Swal.close();setTimeout(${fn},120);" style="width:100%;display:flex;align-items:center;gap:14px;padding:13px 16px;background:${bg};border:1.5px solid ${brd};border-radius:14px;cursor:pointer;font-family:'Kanit',sans-serif;">
                <div style="width:38px;height:38px;border-radius:10px;background:white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.08);flex-shrink:0;"><i class="fas ${icon}" style="color:${iconColor};font-size:17px;"></i></div>
                <div style="text-align:left;flex:1;"><div style="font-size:14px;font-weight:700;color:${txtColor};">${title}</div><div style="font-size:11px;color:#64748b;">${sub}</div></div>
                <i class="fas fa-chevron-right" style="color:${brd};font-size:11px;"></i>
            </button>`;
        return `<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:10px;">
            <div style="font-size:11px;font-weight:700;color:#6366f1;text-align:left;padding-left:4px;"><i class="fas fa-robot" style="margin-right:5px;"></i>ที่ปรึกษาการขาย — CI Extra Plus</div>
            ${btn('window.openAIStats', 'fa-chart-pie', '#0284c7', '#eff6ff', '#bfdbfe', '#1e40af', 'สถิติโรคร้าย', 'ข้อมูลโรคร้ายในไทย ตามช่วงวัย')}
            ${btn('window.openAICosts', 'fa-file-invoice-dollar', '#7c3aed', '#faf5ff', '#ddd6fe', '#6d28d9', 'ประมาณการค่ารักษา', 'ค่ารักษาโรคร้ายใน รพ.เอกชน')}
            ${btn('window.openAIIdeas', 'fa-lightbulb', '#0d9488', '#f0fdfa', '#99f6e4', '#0f766e', 'ไอเดียการขาย', 'สคริปต์ปิดการขาย + วิเคราะห์ด้วย AI')}
        </div>`;
    }

    // expose
    return { menuHTML, showAllIdeas, viewIdea, viewCustomIdea, addCustomIdea, deleteCustomIdea, _refresh: () => {} };
})();
