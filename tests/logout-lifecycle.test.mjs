import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

import ts from "typescript";

const require = createRequire(import.meta.url);
const next = require("next/server");

// Execute the actual route and session reader; replace only external boundaries.
function loadModule(path, dependencies) {
  const source = readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const compiled = { exports: {} };
  runInNewContext(outputText, {
    module: compiled, exports: compiled.exports, URL, process,
    require(name) {
      assert.ok(Object.hasOwn(dependencies, name), `unexpected dependency: ${name}`);
      return dependencies[name];
    },
  });
  return compiled.exports;
}

function fixture() {
  let backendLogouts = 0;
  let active = true;
  const tokens = {
    sso: { type: "access", loginSource: "sso", ssoSessionId: "family", role: "admin" },
    refresh: { type: "refresh", loginSource: "sso", ssoSessionId: "family", role: "admin" },
    direct: { type: "access", loginSource: "direct", role: "user" },
  };
  const options = (name) => ({ name, httpOnly: true, secure: false, sameSite: "lax", path: "/" });
  const auth = {
    AUTH_COOKIE_NAME: "access", REFRESH_COOKIE_NAME: "refresh",
    BACKEND_ACCESS_COOKIE_NAME: "backend",
    verifyToken: async (token) => tokens[token] ?? null,
    getAccessTokenCookieOptions: () => options("access"),
    getRefreshTokenCookieOptions: () => options("refresh"),
    getBackendAccessCookieOptions: () => options("backend"),
    getBackendRefreshCookieOptions: () => options("backend-refresh"),
  };
  const security = loadModule("lib/server/web-security.ts", { "next/server": next });
  const route = loadModule("app/api/auth/logout/route.ts", {
    "next/server": next,
    "@/lib/admin/security": { CSRF_COOKIE_NAME: "csrf" },
    "@/lib/auth": auth,
    "@/lib/server/http": {
      createJsonResponse: (body) => next.NextResponse.json(body),
      createJsonErrorResponse: (message, status) => next.NextResponse.json({ message }, { status }),
    },
    "@/lib/server/web-security": security,
    "@/lib/server/klinik-browser-sso": {
      logoutKlinikSession: async () => { backendLogouts++; return { centralLogoutRequired: false }; },
    },
  });
  function request(cookie, origin = "http://klinik-pkp.test:3000") {
    return new next.NextRequest("http://klinik-pkp.test:3000/api/auth/logout?loginSource=sso", {
      method: "POST", headers: { origin, cookie },
    });
  }
  async function session(token) {
    return loadModule("lib/server/auth-session.ts", {
      "server-only": {},
      "next/headers": { cookies: async () => ({ get: () => ({ value: token }) }) },
      "@/lib/auth": auth,
      "@/lib/server/central-sso-session": {
        isCentralSsoSessionActive: async (user) => user.loginSource === "direct" || active,
      },
    }).getAuthenticatedSessionUserFromCookies();
  }
  return { route, request, session, backendLogouts: () => backendLogouts, confirm: () => { active = false; } };
}

test("Klinik SSO initiation preserves original cookies for Cancel; Confirm invalidates SSO only", async () => {
  const f = fixture();
  const response = await f.route.POST(f.request("access=sso; refresh=refresh; backend=credential"));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.centralLogoutRequired, true);
  assert.equal(response.headers.get("set-cookie"), null);
  assert.equal(response.headers.get("clear-site-data"), null);
  assert.match(response.headers.get("cache-control"), /no-store/);
  assert.equal(f.backendLogouts(), 0);
  assert.equal((await f.session("sso")).role, "admin");
  f.confirm();
  assert.equal(await f.session("sso"), null);
  assert.equal((await f.session("direct")).role, "user");
});

test("Klinik preserves SSO when signed refresh survives an expired access token", async () => {
  const f = fixture();
  const response = await f.route.POST(f.request("access=expired; refresh=refresh; backend=credential"));
  assert.equal((await response.json()).data.centralLogoutRequired, true);
  assert.equal(response.headers.get("set-cookie"), null);
  assert.equal(f.backendLogouts(), 0);
});

test("Klinik DIRECT logout is immediate, host-only and ignores browser source overrides", async () => {
  const f = fixture();
  const response = await f.route.POST(f.request("access=direct; backend=credential"));
  assert.equal((await response.json()).data.centralLogoutRequired, false);
  assert.equal(f.backendLogouts(), 1);
  const cleared = response.cookies.getAll();
  assert.equal(cleared.length, 5);
  for (const cookie of cleared) {
    assert.equal(cookie.value, "");
    assert.equal(cookie.maxAge, 0);
    assert.equal(cookie.domain, undefined);
    if (cookie.name !== "csrf") assert.equal(cookie.httpOnly, true);
  }
  assert.equal((await f.session("sso")).role, "admin");
});

test("Klinik rejects foreign-origin logout before mutation", async () => {
  const f = fixture();
  const response = await f.route.POST(f.request("access=sso; backend=credential", "https://evil.example"));
  assert.equal(response.status, 403);
  assert.equal(response.headers.get("set-cookie"), null);
  assert.equal(f.backendLogouts(), 0);
});
