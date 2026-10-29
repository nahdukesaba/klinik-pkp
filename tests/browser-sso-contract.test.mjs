import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import test from "node:test";
import "./logout-lifecycle.test.mjs";

import {
  canAccessAdminRole,
  isAdminPanelRole,
} from "../src/lib/admin/roles.ts";
import {
  adaptAdminDirectoryIdentity,
  getAdminDirectoryRouteId,
} from "../src/lib/admin/user-contract.ts";
import {
  BROWSER_SSO_EXCHANGE_PATH,
  BROWSER_SSO_LOGOUT_PATH,
  BROWSER_SSO_START_PATH,
  CENTRAL_RECOVERY_PATH,
  browserSsoSessionDecision,
  buildBrowserSsoExchangePayload,
  buildTrustedServiceUrl,
  readBrowserSsoCallback,
  readContextualLogoutRequired,
  resolveAccessOutcomePath,
  resolveAuthenticatedLandingPath,
  resolveContextualLogoutDestination,
} from "../src/lib/auth/browser-sso-contract.ts";
import {
  createAuthenticatedSessionUser,
  hasSameCanonicalIdentity,
  requireAuthenticatedUser,
  toPublicAuthenticatedUser,
} from "../src/lib/auth/session-contract.ts";

function params(values) {
  return new URLSearchParams(values);
}

test("Browser SSO uses dedicated trusted BFF routes", () => {
  assert.equal(BROWSER_SSO_START_PATH, "/api/auth/sso/start");
  assert.equal(BROWSER_SSO_EXCHANGE_PATH, "/api/auth/sso/exchange");
  assert.equal(BROWSER_SSO_LOGOUT_PATH, "/api/auth/sso/logout");
  assert.notEqual(BROWSER_SSO_START_PATH, "/api/auth/login");
});

test("trusted backend URL cannot inherit a browser redirect override", () => {
  assert.throws(
    () =>
      buildTrustedServiceUrl(
        "http://127.0.0.1:8000/api/v1/?redirect_uri=https://evil.example",
        "auth/sso/start",
      ),
    /must not contain/,
  );
  assert.equal(
    buildTrustedServiceUrl(
      "http://127.0.0.1:8000/api/v1",
      "auth/sso/start",
    ),
    "http://127.0.0.1:8000/api/v1/auth/sso/start",
  );
});

test("callback requires state and either code or a safe status", () => {
  assert.equal(readBrowserSsoCallback(params({ code: "code" })), null);
  assert.equal(readBrowserSsoCallback(params({ state: "state" })), null);
  assert.equal(
    readBrowserSsoCallback(
      params({ state: "state", status: "attacker-controlled" }),
    ),
    null,
  );
});

test("callback accepts authorization code and state", () => {
  assert.deepEqual(
    readBrowserSsoCallback(
      params({ code: "central-code", state: "one-time-state", role: "admin" }),
    ),
    { code: "central-code", state: "one-time-state" },
  );
});

test("exchange payload forwards only the backend callback contract", () => {
  const callback = readBrowserSsoCallback(
    params({
      code: "central-code",
      state: "one-time-state",
      role: "admin",
      accessToken: "must-not-pass",
      redirect_uri: "https://evil.example",
    }),
  );
  assert.ok(callback);
  assert.deepEqual(buildBrowserSsoExchangePayload(callback), {
    code: "central-code",
    state: "one-time-state",
  });
});

test("safe pending result does not create an app session", () => {
  assert.deepEqual(browserSsoSessionDecision("pending"), {
    createSession: false,
    redirectTo: "/auth/access/pending",
  });
});

test("Browser SSO creates sessions for approved admin and user roles", () => {
  assert.deepEqual(browserSsoSessionDecision("authenticated", "admin"), {
    createSession: true,
    redirectTo: "/admin",
  });
  assert.deepEqual(browserSsoSessionDecision("authenticated", "user"), {
    createSession: true,
    redirectTo: "/",
  });
  assert.equal(
    browserSsoSessionDecision("authenticated", "administrator").createSession,
    false,
  );
});

test("role user is not mapped to a rejected Browser SSO outcome", () => {
  const decision = browserSsoSessionDecision("authenticated", "user");

  assert.equal(decision.createSession, true);
  assert.notEqual(decision.redirectTo, resolveAccessOutcomePath("rejected"));
});

test("access outcome paths are finite and user friendly", () => {
  assert.equal(resolveAccessOutcomePath("pending"), "/auth/access/pending");
  assert.equal(resolveAccessOutcomePath("rejected"), "/auth/access/rejected");
  assert.equal(resolveAccessOutcomePath("disabled"), "/auth/access/disabled");
});

test("direct logout stays local and SSO logout uses trusted bridge", () => {
  assert.equal(resolveContextualLogoutDestination(false), "/login");
  assert.equal(resolveContextualLogoutDestination(false, "/admin/users?page=2"), "/login");
  assert.equal(
    resolveContextualLogoutDestination(true),
    "/api/auth/sso/logout",
  );
  assert.equal(
    resolveContextualLogoutDestination(true, "/admin/users?page=2&status=active"),
    "/api/auth/sso/logout?cancel_return=%2Fadmin%2Fusers%3Fpage%3D2%26status%3Dactive",
  );
  assert.equal(
    resolveContextualLogoutDestination(true, "https://evil.example"),
    "/api/auth/sso/logout",
  );
});

test("logout trusts only nested BFF result, not browser override fields", () => {
  assert.equal(
    readContextualLogoutRequired({
      success: true,
      data: { centralLogoutRequired: true },
    }),
    true,
  );
  assert.equal(
    readContextualLogoutRequired({
      success: true,
      centralLogoutRequired: true,
      data: { centralLogoutRequired: false },
    }),
    false,
  );
});

test("Central recovery is reached through a trusted route", () => {
  assert.equal(CENTRAL_RECOVERY_PATH, "/api/auth/sso/forgot-password");
  assert.equal(
    buildTrustedServiceUrl("http://127.0.0.1:18082", "forgot-password"),
    "http://127.0.0.1:18082/forgot-password",
  );
});

function canonicalUser(loginSource, role = "admin") {
  return requireAuthenticatedUser({
    appUserId: "11111111-1111-4111-8111-111111111111",
    authUserId: "22222222-2222-4222-8222-222222222222",
    fullName: "Pegawai Klinik",
    email: "pegawai@example.com",
    phone: null,
    nip: "198001012010011001",
    role,
    status: "approved",
    loginSource,
    ssoSessionId:
      loginSource === "sso"
        ? "11111111-1111-4111-8111-111111111111"
        : null,
  });
}

test("direct login creates canonical sessions with role-specific landings", () => {
  const admin = createAuthenticatedSessionUser(canonicalUser("direct", "admin"));
  const user = createAuthenticatedSessionUser(canonicalUser("direct", "user"));

  assert.equal(admin.role, "admin");
  assert.equal(resolveAuthenticatedLandingPath(admin.role), "/admin");
  assert.equal(user.role, "user");
  assert.equal(resolveAuthenticatedLandingPath(user.role), "/");
});

test("pending, rejected, and disabled memberships cannot create a session", () => {
  for (const status of ["pending", "rejected", "disabled"]) {
    assert.throws(
      () =>
        createAuthenticatedSessionUser({
          ...canonicalUser("direct"),
          status,
        }),
      /canonical/i,
      status,
    );
  }
});

test("direct login and Browser SSO share one canonical appUserId contract", () => {
  const direct = canonicalUser("direct");
  const browserSso = canonicalUser("sso");

  assert.equal(direct.appUserId, browserSso.appUserId);
  assert.equal(hasSameCanonicalIdentity(direct, browserSso), true);
});

test("direct and Browser SSO preserve the canonical session shape for users", () => {
  const direct = canonicalUser("direct", "user");
  const browserSso = canonicalUser("sso", "user");
  const expectedKeys = [
    "appUserId",
    "authUserId",
    "email",
    "fullName",
    "loginSource",
    "nip",
    "phone",
    "role",
    "ssoSessionId",
    "status",
  ];

  assert.deepEqual(Object.keys(direct).sort(), expectedKeys);
  assert.deepEqual(Object.keys(browserSso).sort(), expectedKeys);
  assert.equal(direct.loginSource, "direct");
  assert.equal(direct.ssoSessionId, null);
  assert.equal(browserSso.loginSource, "sso");
  assert.equal(
    browserSso.ssoSessionId,
    "11111111-1111-4111-8111-111111111111",
  );
});

test("admin authorization remains separate from authenticated user sessions", () => {
  assert.equal(isAdminPanelRole("user"), false);
  assert.equal(canAccessAdminRole("user", ["admin"]), false);
  assert.equal(isAdminPanelRole("admin"), true);
  assert.equal(canAccessAdminRole("admin", ["admin"]), true);
});

test("every admin resource handler keeps an explicit admin role check", () => {
  const source = readFileSync(
    join(process.cwd(), "src/lib/admin/route-handlers.ts"),
    "utf8",
  );
  const authorizationCalls = source.match(/authorizeAdminRequest\(request/g) ?? [];
  const adminRoleChecks = source.match(/roles:\s*\["admin"\]/g) ?? [];

  assert.ok(authorizationCalls.length > 0);
  assert.equal(adminRoleChecks.length, authorizationCalls.length);
});

test("direct login, refresh, and Browser SSO use the general session mapper", () => {
  const directLogin = readFileSync(
    join(process.cwd(), "src/app/api/auth/login/route.ts"),
    "utf8",
  );
  const refresh = readFileSync(
    join(process.cwd(), "src/app/api/auth/refresh/route.ts"),
    "utf8",
  );
  const browserSso = readFileSync(
    join(process.cwd(), "src/app/api/auth/sso/exchange/route.ts"),
    "utf8",
  );
  const callback = readFileSync(
    join(process.cwd(), "src/components/login/SsoCallbackPage.tsx"),
    "utf8",
  );

  for (const [name, source] of [
    ["direct login", directLogin],
    ["refresh", refresh],
    ["Browser SSO", browserSso],
  ]) {
    assert.match(source, /createAuthenticatedSessionUser/, name);
    assert.doesNotMatch(source, /createSessionAdminUser/, name);
  }
  assert.match(directLogin, /resolveAuthenticatedLandingPath/);
  assert.match(browserSso, /redirectTo: sessionDecision\.redirectTo/);
  assert.match(callback, /location\.replace\(result\.redirectTo\)/);
});

test("public session endpoint exposes only authentication status", () => {
  const source = readFileSync(
    join(process.cwd(), "src/app/api/auth/session/route.ts"),
    "utf8",
  );

  assert.match(source, /dynamic\s*=\s*["']force-dynamic["']/);
  assert.match(source, /getAuthenticatedSessionUserFromCookies/);
  assert.match(source, /authenticated:\s*Boolean\(user\)/);
  assert.match(source, /["']Cache-Control["']\s*:\s*["']no-store["']/);
  assert.doesNotMatch(
    source,
    /accessToken|refreshToken|backendAccess|authUserId/i,
  );
});

test("public Navbar uses session status and contextual logout for every role", () => {
  const source = readFileSync(
    join(process.cwd(), "src/components/layout/Navbar.tsx"),
    "utf8",
  );

  assert.match(source, /useEffect/);
  assert.match(source, /useState/);
  assert.match(source, /LogOut/);
  assert.match(source, /fetch\(["']\/api\/auth\/session["']/);
  assert.match(source, /credentials:\s*["']include["']/);
  assert.match(source, /cache:\s*["']no-store["']/);
  assert.match(source, /logoutAdminSession/);
  assert.match(source, /resolveContextualLogoutDestination/);
  assert.match(source, /isAuthenticated/);
  assert.doesNotMatch(source, /role\s*===\s*["']admin["']/);
  assert.doesNotMatch(source, /localStorage|sessionStorage/);
});

test("session bootstrap exposes canonical fields without token material", () => {
  const publicUser = toPublicAuthenticatedUser(canonicalUser("direct"));

  assert.equal(publicUser.appUserId, "11111111-1111-4111-8111-111111111111");
  assert.equal(publicUser.fullName, "Pegawai Klinik");
  assert.equal(publicUser.role, "admin");
  assert.equal(publicUser.status, "approved");
  assert.equal("id" in publicUser, false);
  assert.equal("accessToken" in publicUser, false);
  assert.equal("refreshToken" in publicUser, false);
});

test("ambiguous id and non-approved membership cannot create auth session", () => {
  assert.throws(
    () =>
      requireAuthenticatedUser({
        id: "legacy-local-id",
        fullName: "Pegawai Klinik",
        email: "pegawai@example.com",
        role: "admin",
        status: "approved",
        loginSource: "direct",
      }),
    /canonical/i,
  );
  assert.throws(
    () =>
      requireAuthenticatedUser({
        ...canonicalUser("direct"),
        status: "rejected",
      }),
    /canonical/i,
  );
});

test("admin directory routes use canonical appUserId", () => {
  const directoryIdentity = adaptAdminDirectoryIdentity({
    id: "33333333-3333-4333-8333-333333333333",
    appUserId: "11111111-1111-4111-8111-111111111111",
  });
  assert.ok(directoryIdentity);
  assert.equal(
    getAdminDirectoryRouteId(directoryIdentity),
    "11111111-1111-4111-8111-111111111111",
  );
  assert.equal(getAdminDirectoryRouteId(directoryIdentity), directoryIdentity.appUserId);
  assert.equal(adaptAdminDirectoryIdentity({ id: "legacy-only" }), null);
});

test("admin CRUD has no legacy local ID or local password dependency", () => {
  const files = [
    "src/lib/admin/user-contract.ts",
    "src/lib/admin/users.ts",
    "src/services/admin-users.service.ts",
    "src/hooks/admin/use-admin-users-page.tsx",
    "src/components/admin/pages/AdminUsersPage.tsx",
    "src/app/api/admin/users/[...path]/route.ts",
  ];
  for (const file of files) {
    const source = readFileSync(join(process.cwd(), file), "utf8");
    assert.equal(source.includes("legacyLocalUserId"), false, file);
  }
  const provisioningSource = readFileSync(
    join(process.cwd(), "src/lib/admin/users.ts"),
    "utf8",
  );
  assert.equal(/password\s*:/.test(provisioningSource), false);
});

test("admin UI renders canonical membership states and disable semantics", () => {
  const hook = readFileSync(
    join(process.cwd(), "src/hooks/admin/use-admin-users-page.tsx"),
    "utf8",
  );
  for (const status of ["pending", "approved", "rejected", "disabled"]) {
    assert.equal(hook.includes(`"${status}"`), true, status);
  }
  assert.match(hook, /Nonaktifkan akses Klinik/);
  assert.match(hook, /appUserId/);
  assert.doesNotMatch(hook, /isActive/);
});

function listClientSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return listClientSourceFiles(path);
    }
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : [];
  });
}

test("frontend source does not persist auth tokens in browser storage", () => {
  for (const file of listClientSourceFiles(join(process.cwd(), "src"))) {
    const source = readFileSync(file, "utf8");
    assert.equal(/localStorage|sessionStorage/.test(source), false, file);
  }
});
