export const BROWSER_SSO_START_PATH = "/api/auth/sso/start";
export const BROWSER_SSO_EXCHANGE_PATH = "/api/auth/sso/exchange";
export const BROWSER_SSO_LOGOUT_PATH = "/api/auth/sso/logout";
export const CENTRAL_RECOVERY_PATH = "/api/auth/sso/forgot-password";
export const NON_ADMIN_LANDING_PATH = "/";

export type BrowserSsoStatus = "pending" | "denied" | "rejected" | "disabled";

export type BrowserSsoCallback = {
  code?: string;
  state: string;
  status?: BrowserSsoStatus;
};

type SearchParamsReader = {
  get(name: string): string | null;
};

const ALLOWED_SSO_STATUSES = new Set<BrowserSsoStatus>([
  "pending",
  "denied",
  "rejected",
  "disabled",
]);

export function readBrowserSsoCallback(
  searchParams: SearchParamsReader,
): BrowserSsoCallback | null {
  const state = searchParams.get("state")?.trim() ?? "";
  const code = searchParams.get("code")?.trim() ?? "";
  const statusValue = searchParams.get("status")?.trim().toLowerCase() ?? "";
  const status = ALLOWED_SSO_STATUSES.has(statusValue as BrowserSsoStatus)
    ? (statusValue as BrowserSsoStatus)
    : undefined;

  if (!state || (!code && !status)) {
    return null;
  }

  return {
    state,
    ...(code ? { code } : {}),
    ...(status ? { status } : {}),
  };
}

export function buildBrowserSsoExchangePayload(input: BrowserSsoCallback) {
  return {
    code: input.code ?? "",
    state: input.state,
    ...(input.status ? { status: input.status } : {}),
  };
}

export function buildTrustedServiceUrl(baseUrl: string, pathname: string) {
  const url = new URL(baseUrl.trim());
  const normalizedPathname = pathname.trim().replace(/^\/+/, "");

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Service URL must use HTTP or HTTPS.");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(
      "Service base URL must not contain credentials or query data.",
    );
  }
  if (!normalizedPathname || /[?#]/.test(normalizedPathname)) {
    throw new Error("Service pathname is invalid.");
  }

  url.pathname = `${url.pathname.replace(/\/+$/, "")}/${normalizedPathname}`;

  return url.toString();
}

export function resolveContextualLogoutDestination(
  centralLogoutRequired: boolean,
) {
  return centralLogoutRequired ? BROWSER_SSO_LOGOUT_PATH : "/login";
}

export function resolveAccessOutcomePath(status: BrowserSsoStatus) {
  if (status === "pending") {
    return "/auth/access/pending";
  }
  if (status === "disabled") {
    return "/auth/access/disabled";
  }
  return "/auth/access/rejected";
}

export function resolveAuthenticatedLandingPath(role: "admin" | "user") {
  return role === "admin" ? "/admin" : NON_ADMIN_LANDING_PATH;
}

export function browserSsoSessionDecision(
  status: "authenticated" | "pending",
  role?: string,
) {
  if (status === "pending") {
    return {
      createSession: false,
      redirectTo: resolveAccessOutcomePath("pending"),
    };
  }
  if (role !== "admin" && role !== "user") {
    return {
      createSession: false,
      redirectTo: resolveAccessOutcomePath("rejected"),
    };
  }
  return {
    createSession: true,
    redirectTo: resolveAuthenticatedLandingPath(role),
  };
}

export function readContextualLogoutRequired(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("success" in payload)) {
    return false;
  }
  if (payload.success !== true || !("data" in payload)) {
    return false;
  }
  const data = payload.data;
  return Boolean(
    data &&
    typeof data === "object" &&
    "centralLogoutRequired" in data &&
    data.centralLogoutRequired === true,
  );
}
