# BOX EARN

A React-powered Telegram Mini App deployed on Cloudflare Workers with a Cloudflare D1 database.

## Stack

- React + Vite
- Cloudflare Workers + Workers Static Assets
- Cloudflare D1 (SQLite)
- Telegram Mini Apps SDK
- Monetag Telegram Mini App SDK

## Local development

```bash
npm install
npm run dev
```

## Production deployment

Cloudflare Workers Builds is the single production deployment owner.

- Build command: `npm run build`
- Deploy command: `npx wrangler d1 migrations apply boxearn-prod --remote && npx wrangler deploy`
- Static asset output: `dist`

Database migrations live in `migrations/` and are applied before each deployment. Do not manually edit the production database schema outside a migration.

## Cloudflare resources

- Worker: `boxearnrobot`
- D1 database: `boxearn-prod`
- D1 binding: `DB`
- Static assets binding: `ASSETS`

## Required production secrets

Set these under **Cloudflare Dashboard → Workers & Pages → boxearnrobot → Settings → Variables and Secrets**. Use type **Secret**, never a plain variable.

| Secret name | Purpose |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | Validates Telegram Mini App `initData` |
| `ADMIN_SECRET` | Protects admin API routes |
| `MONETAG_POSTBACK_SECRET` | Authenticates Monetag server postbacks |

Do not commit secret values or paste them into GitHub source files.

## Monetag

Set the Cloudflare Workers Builds production environment variable:

- `VITE_MONETAG_ZONE_ID` = the **main** SDK zone ID from Monetag (not a sub-zone ID).

Configure the Monetag main-zone postback URL as:

```text
https://boxearnrobot.switchgisty.workers.dev/api/webhooks/monetag?secret=YOUR_MONETAG_POSTBACK_SECRET&ymid={ymid}&telegram_id={telegram_id}&event_type={event_type}&reward_event_type={reward_event_type}&zone_id={zone_id}&sub_zone_id={sub_zone_id}&request_var={request_var}&estimated_price={estimated_price}
```

The backend accepts Monetag's GET postbacks, ignores unpaid events, counts a unique valued ad show once by `ymid`, and awards 50 boxes for each 200 verified paid events. The frontend callback never credits boxes; only the Monetag server postback does.

## API overview

- `POST /api/auth` — validate Telegram launch data and create/retrieve the account.
- `GET /api/me` — account balance and box count.
- `POST /api/checkin` — daily 1/2/3 box rotation.
- `POST /api/boxes/open` — server-generated USDT box reward.
- `GET /api/tasks`, `POST /api/tasks/submit` — task list and submissions.
- `GET /api/referrals` — referral status and qualification.
- `POST /api/ads/session`, `GET /api/ads/stats` — Monetag session and verified-view progress.
- `GET /api/webhooks/monetag` — Monetag postback receiver.
- `POST /api/withdrawals` — BEP20 withdrawal request (minimum 0.10 USDT).

Admin endpoints require `Authorization: Bearer <ADMIN_SECRET>`:
- `GET /api/admin/dashboard`
- `GET|POST /api/admin/tasks`
- `GET /api/admin/submissions`
- `POST /api/admin/tasks/approve`
- `POST /api/admin/tasks/reject`
- `GET /api/admin/withdrawals`
- `POST /api/admin/withdrawals/decision`

## Security rules

- Never trust balances, user IDs, ad views, or reward claims supplied by the browser.
- Telegram `initData` is validated on the Worker using the bot token and a freshness limit.
- Reward changes are recorded in an append-only ledger with unique references.
- Monetag rewards require a valid secret, an issued ad session, a unique `ymid`, and a valued server postback.
- Task rewards require admin approval.
- Withdrawals reserve available balance and are reviewed by an administrator.

## Health check

`GET https://boxearnrobot.switchgisty.workers.dev/api/health`

The health endpoint reports whether the D1 binding and required integrations are configured. It never returns secret values.
