# Chubb Premium Apps Script

This Apps Script project powers the Chubb Premium authorization flow.

## Runtime behavior

- `action=request` sends a new access request alert to Telegram group `-1004373621825` via the Telegram Bot API.
- `action=check` returns authorization state and, when `notifyAccess=1`, sends an access event alert to the same Telegram group.
- `action=testTelegram` is a safe admin-only test endpoint for verifying live Telegram delivery after deployment.
- `action=approve` / `action=reject` still return the HTML confirmation page for admin actions.
- `notifyUser()` still uses LINE for user-facing approval replies.

## Required Script Properties

Set these in the Apps Script project:

- `ADMIN_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID` (optional; defaults to `-1004373621825`)

Optional legacy fallbacks still work:

- `LINE_CHANNEL_ACCESS_TOKEN` may be used as a fallback Telegram token if `TELEGRAM_BOT_TOKEN` is missing.
- `LINE_TARGET_ID` may be used as a fallback Telegram chat ID if `TELEGRAM_CHAT_ID` is missing.

## Deployment notes

1. Open the Apps Script project that owns the published `exec` URL.
2. Replace the existing server code with `apps-script/Code.gs` from this repo.
3. Update Script Properties with the values above.
4. Deploy as a Web App.
   - Execute as: Me
   - Who has access: Anyone
5. After deployment, hit:

```text
?action=testTelegram&key=<ADMIN_KEY>&message=🧪%20Telegram%20test%20from%20Chubb%20Premium
```

If the token and chat ID are correct, the Telegram group should receive the test message.

## Verification checklist

- Request flow posts into Telegram group `-1004373621825`.
- Access-check notification appears when `notifyAccess=1` is supplied.
- `testTelegram` returns `ok: true`.
- `webhook_log` stores `groupId` / `roomId` when LINE webhook events are received.
