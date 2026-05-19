// ================================================================
// Chubb Premium — User Authorization via Google Sheet
// Deploy: Extensions > Apps Script > Deploy > Web App
//   Execute as: Me
//   Who has access: Anyone
// ================================================================

const SHEET_NAME = 'users';  // ชื่อ Sheet tab

function doGet(e) {
  const action = e.parameter.action || 'check';
  const userId = (e.parameter.userId || '').trim();

  if (action === 'check') {
    return checkUser(userId);
  }
  return json({ ok: false, error: 'unknown action' });
}

function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents);
    const action = body.action || '';

    if (action === 'add') {
      return addUser(body.userId, body.displayName);
    }
    if (action === 'remove') {
      return removeUser(body.userId);
    }
  } catch (err) {
    return json({ ok: false, error: err.message });
  }
  return json({ ok: false, error: 'unknown action' });
}

// ── ตรวจสอบสิทธิ์ ──────────────────────────────────────────────
function checkUser(userId) {
  if (!userId) return json({ ok: false, authorized: false, reason: 'no_user_id' });

  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const [id, name, status] = data[i];
    if (String(id).trim() === userId) {
      const active = String(status).toLowerCase() === 'active';
      return json({ ok: true, authorized: active, displayName: name, status });
    }
  }
  return json({ ok: true, authorized: false, reason: 'not_found' });
}

// ── เพิ่ม user ──────────────────────────────────────────────────
function addUser(userId, displayName) {
  if (!userId) return json({ ok: false, error: 'no_user_id' });

  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();

  // อัปเดตถ้ามีอยู่แล้ว
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(userId).trim()) {
      sheet.getRange(i + 1, 2).setValue(displayName || data[i][1]);
      sheet.getRange(i + 1, 3).setValue('active');
      return json({ ok: true, action: 'updated' });
    }
  }

  // เพิ่มใหม่
  sheet.appendRow([
    userId,
    displayName || '',
    'active',
    new Date().toISOString().split('T')[0]
  ]);
  return json({ ok: true, action: 'added' });
}

// ── ลบ user ─────────────────────────────────────────────────────
function removeUser(userId) {
  if (!userId) return json({ ok: false, error: 'no_user_id' });

  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(userId).trim()) {
      sheet.getRange(i + 1, 3).setValue('inactive');
      return json({ ok: true, action: 'deactivated' });
    }
  }
  return json({ ok: false, reason: 'not_found' });
}

// ── Helpers ─────────────────────────────────────────────────────
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['line_user_id', 'display_name', 'status', 'added_date']);
  }
  return sheet;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
