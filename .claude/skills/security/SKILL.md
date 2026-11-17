---
name: security
description: Security rules and checks for the Pocket Arcade static site. Use when code reads the URL or localStorage, builds HTML, changes share or challenge links, adds or bumps a third-party script, or before a deploy that adds new files.
---

# Security (Pocket Arcade)

There are no accounts, no backend, no database and no secrets. The risks are a
hostile shared link, a changed third-party script, and publishing a file by
mistake.

## Rules

- Treat URL parameters (`?lang`, `?c`, `?t`, `?cam`) and `localStorage` as
  untrusted: parse inside `try`/`catch`, check type and range, and fall back to
  a default. `Arcade.readChallenge` in `shared/arcade.js` is the pattern.
- Use `textContent` for anything from the URL or storage. `innerHTML` is only
  for our own translation strings and validated numbers.
- Share links go only to `wa.me` and `www.threads.com`, with the text passed
  through `encodeURIComponent`. Never take a link target from the URL.
- Challenge links are not signed, so scores can be faked. That is fine for
  now; a future leaderboard must check scores on a server.
- Third-party scripts use exact versions only (`three@0.160.0` and
  `lil-gui@0.19.2` from jsDelivr), never `@latest`. Don't add a new one without
  saying why.
- `shared/vercel-analytics.mjs` is a copy of the `@vercel/analytics` package.
  After upgrading the package, run `npm run vendor`.
- Analytics are page views only; don't send personal data.
- Keep private files out of the site: check `.vercelignore` before a deploy.
  A private GitHub repo does not make deployed files private.

## Checks

Run these when a dependency or CDN version changes, or after hearing of an
advisory for Three.js, lil-gui or `@vercel/analytics`:

- `npm audit --omit=dev` in the repo root.
- The CDN versions are not in `package.json`, so audit them from a scratch
  folder outside the repo:

  ```sh
  npm init -y >/dev/null
  npm i --package-lock-only --ignore-scripts three@0.160.0 lil-gui@0.19.2
  npm audit
  ```

- Before pushing, scan for secrets: `gitleaks git --redact .` (history) and
  `gitleaks dir --redact .` (files, including untracked ones).
- A Three.js upgrade across many versions can break the custom shaders: check
  every camera and the tentacle scenes before deploying.
