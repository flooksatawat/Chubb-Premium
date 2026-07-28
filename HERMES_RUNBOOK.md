# Chubb Premium Hermes Runbook

## ระบบหลัก

- Workspace กลางบน Codex VPS: `/workspaces/Chubb-Premium`
- Source/backup: `https://github.com/flooksatawat/Chubb-Premium`, branch `main`
- Production: `https://chubb-premium.flooksatawat.chatgpt.site`
- Hosting identity: `.openai/hosting.json`
- Hermes skill: `chubb-premium-ops`
- Operator: `/opt/data/.local/bin/chubb-premium-ops`

ข้อมูลหน้าเว็บยังเป็นไฟล์ static ใน `data/`, `js/`, `css/` และ `index.html`
GPT Sites เก็บ source repository และ deployed versions ของตัวเอง แต่ไม่ใช่
ฐานข้อมูลหลักแทน GitHub/VPS

## วิธีสั่ง Hermes

ส่งคำสั่งในกลุ่ม `Chubb Premium – Workspace` และระบุข้อมูลต้นทางให้ครบ เช่น
สินค้า ตาราง ปี อายุ เพศ ค่าใหม่ และต้องการ deploy หรือไม่

```text
Hermes: ใช้สกิล chubb-premium-ops แก้ Chubb Premium
เพิ่ม/แก้ข้อมูล [รายละเอียดและค่าที่ถูกต้อง]
ตรวจ JSON, test 1008/1008 และ build
ถ้าผ่านให้ commit, push GitHub และ deploy production ทันที
สรุปสิ่งที่เปลี่ยน commit และ URL ห้ามส่ง token
```

คำว่า `deploy`, `publish`, `ขึ้นเว็บ`, `อัปเดตเว็บ`, `แก้ทันที` หรือ
`ใช้งานจริง` ถือเป็นคำยืนยันให้ publish หลังการตรวจครบ ไม่ต้องถามซ้ำ

ถ้าต้องการเตรียมงานแต่ยังไม่ deploy:

```text
Hermes: ใช้สกิล chubb-premium-ops เตรียมการแก้ [รายละเอียด]
ตรวจ test และ build แล้วสรุป diff แต่ยังไม่ commit, push หรือ deploy
```

## Workflow บังคับ

1. `chubb-premium-ops status`
2. `chubb-premium-ops sync` เมื่อ working tree สะอาด
3. แก้เฉพาะไฟล์ที่เกี่ยวข้อง
4. `chubb-premium-ops verify`
5. ตรวจ diff และ stage เฉพาะไฟล์ที่ทบทวนแล้ว
6. commit
7. `chubb-premium-ops release` เมื่อคำสั่งอนุญาต production
8. รายงาน `1008/1008`, commit และ production URL

`release` จะตรวจซ้ำ, push GitHub, ส่ง commit เดียวกันไป Sites source,
สร้าง Sites version, deploy และบันทึกเฉพาะผลที่กรองข้อมูลลับแล้วบน VPS

## ข้อจำกัด

- ห้ามส่ง token, device code, private key หรือ raw connector output ใน Telegram
- ห้าม reset หรือ force-push GitHub
- งานลบข้อมูลหรือเปลี่ยนสิทธิ์เข้าถึงต้องถามยืนยัน
- งานหลัง VPN ต้องทำใน environment ที่เข้าถึงแหล่งข้อมูลนั้นได้
- การแก้ `apps-script/Code.gs` ต้อง deploy Google Apps Script แยกจาก GPT Sites
