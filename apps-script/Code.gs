// ================================================================
// Chubb Premium — User Authorization via Google Sheet
// Deploy: Extensions > Apps Script > Deploy > Web App
//   Execute as: Me  |  Who has access: Anyone
// ================================================================

const SHEET_NAME   = 'users';
const LINE_TOKEN   = '6N2/qrNuWkmn796yZcFj27QhS1aN6bzYAYNC3OhWweT503t8sowgYPLA45za07MvjhUN5EyaMOB4o05KMzhGPF5G4XU7/AVnoJMu3fPcQ3xExtAN0o5Y+ps/u4ZWvKWUY02ndWDpFk/xzus0AN9PlQdB04t89/1O/w1cDnyilFU=';
const ADMIN_ID     = 'U4fafa1727e1698c683ad04490fd74beb';
const SHEET_URL    = 'https://docs.google.com/spreadsheets/d/1rRFtQz1RSKXoA8wC9q5yAV12G7BuProEZcFfsL30IYc/edit';

// ── CORS headers ──────────────────────────────────────────────
function corsOutput(obj) {
  const output = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

function doGet(e) {
  const action  = e.parameter.action || 'check';
  const userId  = (e.parameter.userId || '').trim();
  const name    = (e.parameter.displayName || '').trim();

  if (action === 'check')   return corsOutput(checkUser(userId));
  if (action === 'request') return corsOutput(requestAccess(userId, name));
  return corsOutput({ ok: false, error: 'unknown action' });
}

function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents);

    // LINE Webhook events
    if (body.events) {
      body.events.forEach(ev => {
        if (ev.type === 'follow' || ev.type === 'message') {
          const uid = ev.source && ev.source.userId;
          const name = ev.type === 'follow' ? 'follow event' : (ev.message && ev.message.text || 'message');
          if (uid) {
            // บันทึก userId ลง Sheet แถว webhook log
            const ss = SpreadsheetApp.getActiveSpreadsheet();
            let log = ss.getSheetByName('webhook_log');
            if (!log) { log = ss.insertSheet('webhook_log'); log.appendRow(['userId','event','time']); }
            log.appendRow([uid, name, new Date().toISOString()]);
          }
        }
      });
      return corsOutput({ ok: true });
    }

    const action = body.action || '';
    if (action === 'add')    return corsOutput(addUser(body.userId, body.displayName));
    if (action === 'remove') return corsOutput(removeUser(body.userId));
  } catch (err) {
    return corsOutput({ ok: false, error: err.message });
  }
  return corsOutput({ ok: false, error: 'unknown action' });
}

// ── ตรวจสอบสิทธิ์ ──────────────────────────────────────────────
function checkUser(userId) {
  if (!userId) return { ok: false, authorized: false, status: 'no_id' };

  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const [id, name, status] = data[i];
    if (String(id).trim() === userId) {
      const active = String(status).toLowerCase() === 'active';
      return { ok: true, authorized: active, status: String(status).toLowerCase(), displayName: name };
    }
  }
  return { ok: true, authorized: false, status: 'not_found' };
}

// ── ขอสิทธิ์ใหม่ ──────────────────────────────────────────────
function requestAccess(userId, displayName) {
  if (!userId) return { ok: false, error: 'no_user_id' };

  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();

  // ถ้ามีอยู่แล้ว (active/inactive/pending)
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === userId) {
      const status = String(data[i][2]).toLowerCase();
      if (status === 'active') return { ok: true, status: 'active', authorized: true };
      // อัปเดตชื่อและเปลี่ยนเป็น pending (กรณี inactive)
      if (status !== 'pending') {
        sheet.getRange(i + 1, 2).setValue(displayName || data[i][1]);
        sheet.getRange(i + 1, 3).setValue('pending');
      }
      notifyAdmin(userId, displayName || data[i][1]);
      return { ok: true, status: 'pending' };
    }
  }

  // เพิ่มใหม่เป็น pending
  sheet.appendRow([
    userId,
    displayName || '',
    'pending',
    new Date().toISOString().split('T')[0]
  ]);

  notifyAdmin(userId, displayName || '');
  return { ok: true, status: 'pending' };
}

// ── แจ้ง admin ผ่าน LINE Push ──────────────────────────────────
function notifyAdmin(userId, displayName) {
  try {
    const msg = `🔔 คำขอใช้งานใหม่\n\n👤 ชื่อ: ${displayName}\n🆔 ID: ${userId}\n\n✅ อนุมัติ → เปลี่ยน status เป็น active ใน Sheet\n${SHEET_URL}`;
    UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + LINE_TOKEN },
      payload: JSON.stringify({
        to: ADMIN_ID,
        messages: [{ type: 'text', text: msg }]
      }),
      muteHttpExceptions: true
    });
  } catch (e) {
    console.error('notifyAdmin failed', e);
  }
}

// ── เพิ่ม / อัปเดต user ────────────────────────────────────────
function addUser(userId, displayName) {
  if (!userId) return { ok: false, error: 'no_user_id' };

  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === userId) {
      sheet.getRange(i + 1, 2).setValue(displayName || data[i][1]);
      sheet.getRange(i + 1, 3).setValue('active');
      return { ok: true, action: 'updated' };
    }
  }
  sheet.appendRow([userId, displayName || '', 'active', new Date().toISOString().split('T')[0]]);
  return { ok: true, action: 'added' };
}

// ── ลบ / deactivate ───────────────────────────────────────────
function removeUser(userId) {
  if (!userId) return { ok: false, error: 'no_user_id' };
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === userId) {
      sheet.getRange(i + 1, 3).setValue('inactive');
      return { ok: true, action: 'deactivated' };
    }
  }
  return { ok: false, reason: 'not_found' };
}

// ── helper ────────────────────────────────────────────────────
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['line_user_id', 'display_name', 'status', 'added_date']);
  }
  return sheet;
}
