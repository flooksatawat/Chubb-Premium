// ================================================================
// Chubb Premium — User Authorization via Google Sheet
// Deploy: Extensions > Apps Script > Deploy > Web App
//   Execute as: Me  |  Who has access: Anyone
// ================================================================

const SHEET_NAME       = 'users';
const ADMIN_SHEET_NAME = 'admins';
const GAS_URL          = 'https://script.google.com/macros/s/AKfycbz4EHWmyd_9SQQA5m6ZhZudpza1aiQfUZmzw9stsIWZotqjpQ-1VoP6QrysCfZAM4t5VA/exec';

function getRequiredScriptProperty(name) {
  const value = PropertiesService.getScriptProperties().getProperty(name);
  if (!value) throw new Error('Missing Script Property: ' + name);
  return value;
}

// ── CORS headers ──────────────────────────────────────────────
function corsOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action  = e.parameter.action || 'check';
  const userId  = (e.parameter.userId || '').trim();
  const name    = (e.parameter.displayName || '').trim();
  const key     = (e.parameter.key || '').trim();

  if (action === 'check') {
    const result = checkUser(userId);
    if (result.authorized && e.parameter.notifyAccess === '1') {
      result.accessNotification = notifyAuthorizedAccess(
        userId,
        result.displayName,
        (e.parameter.source || '').trim(),
        (e.parameter.device || '').trim()
      );
    }
    return corsOutput(result);
  }
  if (action === 'request') return corsOutput(requestAccess(userId, name, (e.parameter.pictureUrl || '').trim()));
  const adminKey = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (action === 'approve' && adminKey && key === adminKey) return htmlOutput(approveUser(userId));
  if (action === 'reject'  && adminKey && key === adminKey) return htmlOutput(rejectUser(userId));
  return corsOutput({ ok: false, error: 'unknown action' });
}

function htmlOutput(result) {
  const msg = result.ok ? '✅ ดำเนินการสำเร็จ' : '❌ เกิดข้อผิดพลาด: ' + (result.error || '');
  return HtmlService.createHtmlOutput(`<html><body style="font-family:sans-serif;text-align:center;padding:40px;font-size:20px">${msg}<br><br><a href="javascript:window.close()">ปิด</a></body></html>`);
}

function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents);
    if (body.events) {
      body.events.forEach(ev => {
        if (ev.type === 'follow' || ev.type === 'message') {
          const uid = ev.source && ev.source.userId;
          if (uid) {
            const ss = SpreadsheetApp.getActiveSpreadsheet();
            let log = ss.getSheetByName('webhook_log');
            if (!log) { log = ss.insertSheet('webhook_log'); log.appendRow(['userId','event','time']); }
            log.appendRow([uid, ev.type, new Date().toISOString()]);
          }
        }
      });
      return corsOutput({ ok: true });
    }
    const action = body.action || '';
    if (action === 'add' || action === 'remove') {
      const adminKey = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
      if (!adminKey || String(body.key || '').trim() !== adminKey) {
        return corsOutput({ ok: false, error: 'unauthorized' });
      }
    }
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
function requestAccess(userId, displayName, pictureUrl) {
  if (!userId) return { ok: false, error: 'no_user_id' };
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === userId) {
      const status = String(data[i][2]).toLowerCase();
      if (status === 'active') return { ok: true, status: 'active', authorized: true };
      if (status !== 'pending') {
        sheet.getRange(i + 1, 2).setValue(displayName || data[i][1]);
        sheet.getRange(i + 1, 3).setValue('pending');
      }
      const delivery = notifyAdmin(userId, displayName || data[i][1], pictureUrl);
      return { ok: true, status: 'pending', adminNotification: delivery };
    }
  }
  sheet.appendRow([userId, displayName || '', 'pending', new Date().toISOString().split('T')[0]]);
  const delivery = notifyAdmin(userId, displayName || '', pictureUrl);
  return { ok: true, status: 'pending', adminNotification: delivery };
}

// ── อนุมัติ ────────────────────────────────────────────────────
function approveUser(userId) {
  if (!userId) return { ok: false, error: 'no_user_id' };
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === userId) {
      sheet.getRange(i + 1, 3).setValue('active');
      notifyUser(userId, '✅ คำขอของคุณได้รับการอนุมัติแล้ว\nกลับไปที่แอปแล้วกด "ตรวจสอบอีกครั้ง" เพื่อเข้าใช้งานได้เลยครับ');
      return { ok: true, action: 'approved' };
    }
  }
  return { ok: false, error: 'not_found' };
}

// ── ปฏิเสธ ────────────────────────────────────────────────────
function rejectUser(userId) {
  if (!userId) return { ok: false, error: 'no_user_id' };
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === userId) {
      sheet.getRange(i + 1, 3).setValue('inactive');
      notifyUser(userId, '❌ ขออภัย คำขอของคุณถูกปฏิเสธ\nหากมีข้อสงสัยกรุณาติดต่อผู้ดูแลระบบ');
      return { ok: true, action: 'rejected' };
    }
  }
  return { ok: false, error: 'not_found' };
}

function getAdminIds() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ADMIN_SHEET_NAME);
  const fallbackId = PropertiesService.getScriptProperties().getProperty('FALLBACK_ADMIN_ID');
  if (!sheet || sheet.getLastRow() < 2) return fallbackId ? [fallbackId] : [];

  const ids = sheet.getDataRange().getValues().slice(1)
    .filter(row => String(row[2] || '').trim().toLowerCase() === 'active')
    .map(row => String(row[0] || '').trim())
    .filter(Boolean);
  return [...new Set(ids.length ? ids : (fallbackId ? [fallbackId] : []))];
}

function pushToAdmins(messages) {
  const lineToken = getRequiredScriptProperty('LINE_CHANNEL_ACCESS_TOKEN');
  const adminIds = getAdminIds();
  let sent = 0;
  let failed = 0;
  adminIds.forEach(adminId => {
    try {
      const response = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
        method: 'post',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + lineToken },
        payload: JSON.stringify({ to: adminId, messages }),
        muteHttpExceptions: true
      });
      if (response.getResponseCode() >= 200 && response.getResponseCode() < 300) sent++;
      else failed++;
    } catch (e) {
      failed++;
      console.error('pushToAdmins failed', e);
    }
  });
  return { recipientCount: adminIds.length, sent, failed };
}

// ── แจ้ง admin ผ่าน LINE Push (Flex Message) ──────────────────
function notifyAdmin(userId, displayName, pictureUrl) {
  try {
    const adminKey = getRequiredScriptProperty('ADMIN_KEY');
    const approveUrl = GAS_URL + '?action=approve&userId=' + encodeURIComponent(userId) + '&key=' + adminKey;
    const rejectUrl  = GAS_URL + '?action=reject&userId='  + encodeURIComponent(userId) + '&key=' + adminKey;
    const bubble = {
      type: 'bubble',
      header: {
        type: 'box', layout: 'vertical', backgroundColor: '#1a73e8',
        contents: [{ type: 'text', text: '🔔 คำขอใช้งานใหม่', color: '#ffffff', weight: 'bold', size: 'lg' }]
      },
      body: {
        type: 'box', layout: 'horizontal', spacing: 'md', alignItems: 'center',
        contents: [
          pictureUrl ? { type: 'image', url: pictureUrl, size: '60px', aspectMode: 'cover', aspectRatio: '1:1', flex: 0 } : null,
          { type: 'box', layout: 'vertical', flex: 1,
            contents: [{ type: 'text', text: displayName, weight: 'bold', size: 'md', wrap: true }] }
        ].filter(Boolean)
      },
      footer: {
        type: 'box', layout: 'horizontal', spacing: 'sm',
        contents: [
          { type: 'button', style: 'primary', color: '#2ecc71', action: { type: 'uri', label: '✅ อนุมัติ', uri: approveUrl } },
          { type: 'button', style: 'primary', color: '#e74c3c', action: { type: 'uri', label: '❌ ปฏิเสธ', uri: rejectUrl } }
        ]
      }
    };
    const flex = { type: 'flex', altText: '🔔 คำขอใช้งานใหม่: ' + displayName, contents: bubble };
    return pushToAdmins([flex]);
  } catch (e) {
    console.error('notifyAdmin failed', e);
    return { recipientCount: 0, sent: 0, failed: 1 };
  }
}

// ── แจ้ง admin เมื่อผู้ใช้ที่ active เข้าใช้งาน ────────────────
function notifyAuthorizedAccess(userId, displayName, source, device) {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'access_' + userId;
  if (cache.get(cacheKey)) return 'deduplicated';

  cache.put(cacheKey, '1', 1800);
  try {
    const accessedAt = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss');
    const detailRow = (label, value) => ({
      type: 'box', layout: 'baseline', spacing: 'sm',
      contents: [
        { type: 'text', text: label, color: '#64748b', size: 'sm', flex: 2 },
        { type: 'text', text: value || '-', color: '#1e293b', size: 'sm', flex: 5, wrap: true }
      ]
    });
    const bubble = {
      type: 'bubble',
      header: {
        type: 'box', layout: 'vertical', backgroundColor: '#059669',
        contents: [{ type: 'text', text: '✅ มีผู้เข้าใช้งาน', color: '#ffffff', weight: 'bold', size: 'lg' }]
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'md',
        contents: [
          { type: 'text', text: displayName || 'ไม่ทราบชื่อ', weight: 'bold', size: 'md', wrap: true },
          { type: 'separator', margin: 'sm' },
          detailRow('เวลา', accessedAt),
          detailRow('ช่องทาง', source),
          detailRow('อุปกรณ์', device)
        ]
      }
    };
    const flex = { type: 'flex', altText: 'มีผู้เข้าใช้งาน: ' + (displayName || 'ไม่ทราบชื่อ'), contents: bubble };
    const delivery = pushToAdmins([flex]);
    if (delivery.sent === 0) return 'failed';
    if (delivery.failed > 0) console.warn('Some admin notifications failed', delivery);
    return 'sent';
  } catch (e) {
    console.error('notifyAuthorizedAccess failed', e);
    return 'failed';
  }
}

// ── แจ้ง user ผลการอนุมัติ ────────────────────────────────────
function notifyUser(userId, message) {
  try {
    const lineToken = getRequiredScriptProperty('LINE_CHANNEL_ACCESS_TOKEN');
    UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + lineToken },
      payload: JSON.stringify({ to: userId, messages: [{ type: 'text', text: message }] }),
      muteHttpExceptions: true
    });
  } catch (e) {
    console.error('notifyUser failed', e);
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
