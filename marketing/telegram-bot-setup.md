# Telegram bot setup — `/start` auto-reply

The bot replies in **private chat** when someone sends `/start`, `/help`, or `/book` with links to book a free consultation (UTM tracked).

Webhook URL: `https://drilianavaliullina.com/api/telegram`

---

## Step 1 — Create the bot (Iliana or you, ~5 min)

1. Open Telegram → search **@BotFather**
2. Send: `/newbot`
3. Display name: `Dr. Iliana Valiullina English`
4. Username: must end in `bot`, e.g. `iliana_legal_english_bot`
5. **Copy the token** BotFather sends (looks like `123456789:ABCdef...`)
6. Optional polish:
   - `/setdescription` → short line about Legal & Academic English
   - `/setabouttext` → same
   - `/setuserpic` → upload logo or profile photo

**Keep the token secret.** Never commit it to GitHub.

---

## Step 2 — Cloudflare secrets

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **dr-iliana-valiullina-website**
2. **Settings** → **Variables and Secrets**
3. Add **Secrets**:
   - `TELEGRAM_BOT_TOKEN` = token from BotFather
   - `TELEGRAM_WEBHOOK_SECRET` = any long random string you invent (e.g. 32+ chars from a password manager)
4. **Save** and **redeploy** if needed (push to `main` triggers deploy)

---

## Step 3 — Deploy the worker

Push the latest code to GitHub (or run `npx wrangler deploy` locally).

Check: open `https://drilianavaliullina.com/api/telegram` in a browser — should say `Telegram webhook endpoint is active.`

---

## Step 4 — Register the webhook (once)

Replace `YOUR_BOT_TOKEN` and `YOUR_WEBHOOK_SECRET` with real values.

**On a computer (PowerShell or browser):**

```
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://drilianavaliullina.com/api/telegram&secret_token=YOUR_WEBHOOK_SECRET
```

Paste that full URL into a browser address bar and press Enter. Response should include `"ok":true`.

**Verify:**

```
https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo
```

Should show your webhook URL.

---

## Step 5 — Test

1. Open Telegram → search your bot username (e.g. `@iliana_legal_english_bot`)
2. Tap **Start** or send `/start`
3. You should get the welcome message with Cal.com + website links

---

## Step 6 — Connect bot to your channel

The bot does **not** post in the channel automatically. Link it so followers can DM the bot:

**Option A — Channel description** (add one line):

```
Book a free consultation: @your_bot_username
```

**Option B — Pinned post** (add at bottom):

```
Questions or booking via private message:
@your_bot_username
Tap Start for the booking link.
```

**Option C — Menu button** (BotFather):

1. `/mybots` → your bot → **Bot Settings** → **Menu Button**
2. Configure URL: Cal.com free consultation link

---

## Tracking links used by the bot

- Consultation: `utm_source=telegram&utm_medium=bot&utm_campaign=start`
- Website: `utm_source=telegram&utm_medium=bot&utm_campaign=start`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| No reply to `/start` | Check `TELEGRAM_BOT_TOKEN` secret; redeploy; run `getWebhookInfo` |
| `401 unauthorized` | `TELEGRAM_WEBHOOK_SECRET` must match `secret_token` in `setWebhook` |
| Webhook not set | Repeat Step 4 with correct token |
| Bot works but channel silent | Normal — bot is for **DMs**, not channel posts |

---

## What this bot does NOT do

- Join other channels or groups
- Auto-post ads
- Replace your channel — use channel for tips, bot for booking DMs
