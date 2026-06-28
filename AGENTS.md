# AGENTS.md

## Cursor Cloud specific instructions

This is the Dr. Iliana Valiullina marketing website: a static site served by a Cloudflare Worker (`worker.js`) with Tailwind CSS. Styles are compiled from `src/input.css` to `public/css/site.css`.

Non-obvious notes:
- `npm run build` only compiles Tailwind CSS (`build:css`); it does not bundle a JS app. The committed `public/css/site.css` must stay in sync — CI (`.github/workflows/build.yml`) fails PRs if `public/css/site.css` differs from a fresh build, so run `npm run build` after editing `src/input.css` or Tailwind classes and commit the result.
- There is no `dev` script. To run the Worker locally (static assets + the `/api/contact` and `/api/telegram` endpoints in `worker.js`), use `npx wrangler dev` (serves `http://127.0.0.1:8787` by default; this project was verified with `npx wrangler dev --port 8788 --ip 127.0.0.1`). `wrangler` is intentionally not a dependency and is fetched on demand via `npx`.
- The contact form (`/api/contact`) needs `RESEND_API_KEY`; without it the endpoint returns `{"error":"Email service is not configured"}` (HTTP 500), which is expected locally. The Telegram webhook needs `TELEGRAM_BOT_TOKEN`.
