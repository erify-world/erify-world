# Random Joke Generator (Cloudflare Worker)

A tiny, production-ready Cloudflare Worker that serves random jokes from external APIs with CORS and a minimal UI.

- API endpoint: `GET /api/joke` → `{ id, source, joke }`
- UI endpoint: `GET /` → simple web page to fetch and display jokes
- External sources: [JokeAPI](https://v2.jokeapi.dev) with fallback to [icanhazdadjoke](https://icanhazdadjoke.com/api)
- CORS: preflight handled, 204 with ACAO/ACAM/ACAH headers
- CI: GitHub Actions runs unit tests (Vitest) via .github/workflows/ci.yml
- Deploy: GitHub Actions deploys to Cloudflare Workers on push to main via .github/workflows/deploy.yml (Wrangler)

## Quick start

1) Install dependencies

```bash
npm ci
```

2) Run locally (Miniflare via Wrangler)

```bash
npm run dev
```

Visit http://localhost:8787.

3) Deploy

- Manual (local):
  ```bash
  npm run deploy
  ```
- CI (recommended):
  - Add GitHub secrets:
    - `CLOUDFLARE_API_TOKEN` (Workers Scripts:Edit, Account:Read; Zone:DNS:Read if routing)
    - `CLOUDFLARE_ACCOUNT_ID`
    - Optionally `CLOUDFLARE_ZONE_ID` if using routes
  - Push to `main`. `.github/workflows/deploy.yml` runs `wrangler deploy`.

4) Custom domain

Uncomment and set `routes` in `wrangler.toml`, e.g.:

```toml
routes = [
  { pattern = "jokes.erifyglobal.com/*", zone_name = "erifyglobal.com" }
]
```

## API

- `GET /api/joke`
  Response:
  ```json
  { "id": "optional", "source": "JokeAPI|icanhazdadjoke", "joke": "string" }
  ```

- `OPTIONS /api/joke`
  Returns `204` with CORS headers.

## Notes

- GitHub Actions only runs workflows from the repository root at .github/workflows. Ensure CI/Deploy workflows live there (not under workers/random-joke-worker/.github/workflows).
- `JokeAPI` is queried first (single-line, safe-mode). On error, the worker falls back to `icanhazdadjoke`.
- CORS: `Access-Control-Allow-Origin` reflects the request Origin if present, otherwise `*`. Restrict allowed origins if needed.
- No secrets required for API usage. Cloudflare credentials are only for deploy.

## License

MIT