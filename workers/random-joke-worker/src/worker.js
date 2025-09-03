import { handlePreflight, withCors } from "./cors.js";

const UA = "erify-world/random-joke-worker (+https://github.com/erify-world)";

async function fetchFromJokeAPI() {
  const url = "https://v2.jokeapi.dev/joke/Any?type=single&safe-mode";
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`JokeAPI error ${res.status}`);
  const data = await res.json();
  if (!data || typeof data.joke !== "string") throw new Error("JokeAPI response malformed");
  return { id: data.id ?? null, source: "JokeAPI", joke: data.joke };
}

async function fetchFromDadJoke() {
  const res = await fetch("https://icanhazdadjoke.com/", {
    headers: { Accept: "application/json", "User-Agent": UA }
  });
  if (!res.ok) throw new Error(`DadJoke error ${res.status}`);
  const data = await res.json();
  if (!data || typeof data.joke !== "string") throw new Error("DadJoke response malformed");
  return { id: data.id ?? null, source: "icanhazdadjoke", joke: data.joke };
}

async function getRandomJoke() {
  try {
    return await fetchFromJokeAPI();
  } catch {
    return await fetchFromDadJoke();
  }
}

function htmlPage() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Random Joke Generator</title>
<style>
:root { color-scheme: light dark; }
body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; padding: 2rem; display: grid; place-items: center; min-height: 100vh; background: #0b0b0c; color: #eaeaea; }
.card { max-width: 720px; width: 100%; background: #151517; border: 1px solid #232327; border-radius: 14px; padding: 24px; box-shadow: 0 6px 30px rgba(0,0,0,.35); }
h1 { margin: 0 0 12px 0; font-size: 1.6rem; }
.joke { font-size: 1.25rem; line-height: 1.5; margin: 12px 0 18px 0; }
.meta { font-size: 0.85rem; opacity: .75; }
.actions { display: flex; gap: 10px; }
button { background: linear-gradient(135deg, #7c4dff, #00e5ff); color: #0b0b0c; border: 0; padding: 10px 16px; border-radius: 10px; cursor: pointer; font-weight: 700; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
kbd { background: #1f1f24; border: 1px solid #2b2b31; padding: 2px 6px; border-radius: 6px; }
.footer { margin-top: 10px; opacity: .6; font-size: .8rem; }
a { color: #7cdeff; text-decoration: none; }
a:hover { text-decoration: underline; }
</style>
</head>
<body>
  <div class="card">
    <h1>Random Joke Generator</h1>
    <div id="joke" class="joke">Press "New Joke" to get started.</div>
    <div class="actions">
      <button id="btn">New Joke</button>
      <div class="meta"><span id="meta"></span></div>
    </div>
    <div class="footer">API sources: <a href="https://v2.jokeapi.dev" target="_blank" rel="noreferrer">JokeAPI</a> and <a href="https://icanhazdadjoke.com/api" target="_blank" rel="noreferrer">icanhazdadjoke</a></div>
  </div>
<script>
const btn = document.getElementById('btn');
const jokeEl = document.getElementById('joke');
const metaEl = document.getElementById('meta');

async function loadJoke() {
  btn.disabled = true;
  metaEl.textContent = "Loading…";
  try {
    const res = await fetch('/api/joke', { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('Request failed: ' + res.status);
    const data = await res.json();
    jokeEl.textContent = data.joke;
    metaEl.textContent = 'Source: ' + data.source + (data.id ? ' • id: ' + data.id : '');
  } catch (e) {
    jokeEl.textContent = 'Failed to load a joke. Please try again.';
    metaEl.textContent = String(e);
  } finally {
    btn.disabled = false;
  }
}

btn.addEventListener('click', loadJoke);
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'j') loadJoke();
});
</script>
</body>
</html>`;
}

function notFound() {
  return Response.json({ error: "Not found" }, { status: 404 });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") ?? "*";

    if (request.method === "OPTIONS") {
      return handlePreflight(request);
    }

    if (url.pathname === "/api/joke") {
      try {
        const joke = await getRandomJoke();
        return withCors(
          new Response(JSON.stringify(joke), {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": "no-store"
            }
          }),
          origin
        );
      } catch (e) {
        return withCors(
          Response.json(
            { error: "Failed to fetch joke", message: String(e) },
            { status: 502 }
          ),
          origin
        );
      }
    }

    if (url.pathname === "/") {
      return withCors(
        new Response(htmlPage(), {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" }
        }),
        origin
      );
    }

    return withCors(notFound(), origin);
  }
};