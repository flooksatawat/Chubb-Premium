// Service Worker — บังคับให้ LIFF WebView ดาวน์โหลดไฟล์เป็น native download
// แทนการเด้งไปเปิดบราวเซอร์ภายนอก (LINE intent หลีกเลี่ยงไม่ได้สำหรับ blob/data URL)
// แต่ HTTPS URL ปกติ + Content-Disposition: attachment จะถูก WebView ส่งให้ Download Manager
const _blobStore = new Map();

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('message', e => {
    const msg = e.data;
    if (!msg || msg.type !== 'STORE_BLOB') return;
    _blobStore.set(msg.id, { blob: msg.blob, filename: msg.filename });
    if (e.ports && e.ports[0]) e.ports[0].postMessage({ ok: true });
    // กันเปลือง memory ถ้าไม่มี fetch มาภายใน 60s
    setTimeout(() => _blobStore.delete(msg.id), 60000);
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    const match = url.pathname.match(/\/sw-downloads\/([^/]+)\.pdf$/);
    if (!match) return;
    const entry = _blobStore.get(match[1]);
    if (!entry) return;
    _blobStore.delete(match[1]);

    const filename = encodeURIComponent(entry.filename || 'document.pdf').replace(/['()]/g, escape);
    e.respondWith(new Response(entry.blob, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename*=UTF-8''${filename}`,
            'Content-Length': String(entry.blob.size),
            'X-Content-Type-Options': 'nosniff',
        }
    }));
});
