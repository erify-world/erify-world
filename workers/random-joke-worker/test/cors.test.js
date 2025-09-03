import { describe, it, expect } from "vitest";
import { handlePreflight, withCors } from "../src/cors.js";

describe("CORS utilities", () => {
  it("returns 204 for preflight with proper headers", () => {
    const req = new Request("https://example.com/api/joke", {
      method: "OPTIONS",
      headers: {
        Origin: "https://app.example",
        "Access-Control-Request-Method": "GET"
      }
    });
    const res = handlePreflight(req);
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://app.example");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("GET");
  });

  it("adds CORS headers to response", async () => {
    const base = new Response("ok", { status: 200 });
    const res = withCors(base, "https://site.xyz");
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://site.xyz");
    expect(await res.text()).toBe("ok");
  });
});