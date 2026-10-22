import assert from "node:assert/strict";
import test from "node:test";

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
  resolveContextualLogoutDestination,
} from "../src/lib/auth/browser-sso-contract.ts";

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

test("only backend admin role can create the existing admin session", () => {
  assert.deepEqual(browserSsoSessionDecision("authenticated", "admin"), {
    createSession: true,
    redirectTo: "/admin",
  });
  assert.equal(
    browserSsoSessionDecision("authenticated", "user").createSession,
    false,
  );
  assert.equal(
    browserSsoSessionDecision("authenticated", "administrator").createSession,
    false,
  );
});

test("access outcome paths are finite and user friendly", () => {
  assert.equal(resolveAccessOutcomePath("pending"), "/auth/access/pending");
  assert.equal(resolveAccessOutcomePath("rejected"), "/auth/access/rejected");
  assert.equal(resolveAccessOutcomePath("disabled"), "/auth/access/disabled");
});

test("direct logout stays local and SSO logout uses trusted bridge", () => {
  assert.equal(resolveContextualLogoutDestination(false), "/login");
  assert.equal(
    resolveContextualLogoutDestination(true),
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
