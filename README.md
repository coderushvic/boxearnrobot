# BOX EARN

A React-powered Telegram Mini App foundation prepared for deployment on Cloudflare Workers.

## Stack

- React 19
- JavaScript (ES modules)
- Vite
- Cloudflare Workers static assets

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The production site is generated in `dist/`.

## Cloudflare deployment

This repository uses the Cloudflare Workers configuration in `wrangler.jsonc`.

1. Connect this GitHub repository to Cloudflare Workers Builds.
2. Set the root directory to `/`.
3. Set the build command to `npm run build`.
4. Set the deploy command to `npx wrangler deploy`.
5. Keep the build output directory as `dist` if the dashboard asks for it.
6. Deploy after reviewing the build settings.

The `wrangler.jsonc` file already declares the static asset directory and Worker entry point. Do not create a separate Pages project for this configuration.

## Health check

After deployment, request:

`https://YOUR-WORKER-DOMAIN/api/health`

Expected response:

```json
{
  "ok": true,
  "service": "boxearnrobot",
  "phase": 1
}
```

## Scope

This is Phase 1: application shell, build configuration, static asset serving, and a health endpoint only. Earning features, Telegram authentication, database access, ads, referrals, rewards, and withdrawals are not implemented yet.
