import "server-only";

export interface SsoUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  pegawai?: {
    nip?: string;
    alamat?: string;
    gelarDepan?: string;
    gelarBelakang?: string;
  };
}

export interface SsoSession {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: number;
  user: SsoUser;
}

export interface KlinikContext {
  id: string;
  email: string;
  role: string;
}

export class SsoAuthError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "SsoAuthError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getSsoBaseUrl() {
  const configured = process.env.SSO_BASE_URL?.trim();

  if (!configured) {
    throw new SsoAuthError(
      "Konfigurasi layanan SSO belum tersedia.",
      503,
      "sso_not_configured",
    );
  }

  return configured.replace(/\/+$/, "");
}

async function readJsonResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  return response.json().catch(() => null);
}

function throwSsoResponseError(
  payload: unknown,
  status: number,
  fallback: string,
): never {
  let message = fallback;
  let code: string | undefined;

  if (isRecord(payload)) {
    if (typeof payload.message === "string" && payload.message.trim()) {
      message = payload.message;
    }

    if (typeof payload.error === "string" && payload.error.trim()) {
      code = payload.error;
    }
  }

  throw new SsoAuthError(message, status, code);
}

export async function loginWithSso(params: {
  email: string;
  password: string;
}): Promise<SsoSession> {
  let response: Response;

  try {
    response = await fetch(`${getSsoBaseUrl()}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: params.email,
        password: params.password,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    if (error instanceof SsoAuthError) {
      throw error;
    }

    throw new SsoAuthError(
      "Layanan autentikasi sedang tidak tersedia.",
      502,
      "sso_unavailable",
    );
  }

  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throwSsoResponseError(
      payload,
      response.status,
      "Autentikasi gagal diproses.",
    );
  }

  if (
    !isRecord(payload) ||
    typeof payload.accessToken !== "string" ||
    typeof payload.refreshToken !== "string" ||
    !isRecord(payload.user) ||
    typeof payload.user.id !== "string" ||
    typeof payload.user.email !== "string" ||
    typeof payload.user.fullName !== "string"
  ) {
    throw new SsoAuthError(
      "Respons autentikasi SSO tidak valid.",
      502,
      "invalid_sso_response",
    );
  }

  const pegawai = isRecord(payload.user.pegawai)
    ? {
        nip:
          typeof payload.user.pegawai.nip === "string"
            ? payload.user.pegawai.nip
            : undefined,
        alamat:
          typeof payload.user.pegawai.alamat === "string"
            ? payload.user.pegawai.alamat
            : undefined,
        gelarDepan:
          typeof payload.user.pegawai.gelarDepan === "string"
            ? payload.user.pegawai.gelarDepan
            : undefined,
        gelarBelakang:
          typeof payload.user.pegawai.gelarBelakang === "string"
            ? payload.user.pegawai.gelarBelakang
            : undefined,
      }
    : undefined;

  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    tokenType:
      typeof payload.tokenType === "string" ? payload.tokenType : "bearer",
    expiresIn: typeof payload.expiresIn === "number" ? payload.expiresIn : 0,
    expiresAt: typeof payload.expiresAt === "number" ? payload.expiresAt : 0,
    user: {
      id: payload.user.id,
      email: payload.user.email,
      fullName: payload.user.fullName,
      phone:
        typeof payload.user.phone === "string" ? payload.user.phone : undefined,
      pegawai,
    },
  };
}

export async function refreshSsoSession(
  refreshToken: string,
): Promise<SsoSession> {
  let response: Response;

  try {
    response = await fetch(`${getSsoBaseUrl()}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        refreshToken,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    if (error instanceof SsoAuthError) {
      throw error;
    }

    throw new SsoAuthError(
      "Layanan autentikasi sedang tidak tersedia.",
      502,
      "sso_unavailable",
    );
  }

  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throwSsoResponseError(
      payload,
      response.status,
      "Sesi autentikasi tidak valid atau telah berakhir.",
    );
  }

  if (
    !isRecord(payload) ||
    typeof payload.accessToken !== "string" ||
    typeof payload.refreshToken !== "string" ||
    !isRecord(payload.user) ||
    typeof payload.user.id !== "string" ||
    typeof payload.user.email !== "string" ||
    typeof payload.user.fullName !== "string"
  ) {
    throw new SsoAuthError(
      "Respons refresh SSO tidak valid.",
      502,
      "invalid_sso_response",
    );
  }

  const pegawai = isRecord(payload.user.pegawai)
    ? {
        nip:
          typeof payload.user.pegawai.nip === "string"
            ? payload.user.pegawai.nip
            : undefined,
        alamat:
          typeof payload.user.pegawai.alamat === "string"
            ? payload.user.pegawai.alamat
            : undefined,
        gelarDepan:
          typeof payload.user.pegawai.gelarDepan === "string"
            ? payload.user.pegawai.gelarDepan
            : undefined,
        gelarBelakang:
          typeof payload.user.pegawai.gelarBelakang === "string"
            ? payload.user.pegawai.gelarBelakang
            : undefined,
      }
    : undefined;

  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    tokenType:
      typeof payload.tokenType === "string" ? payload.tokenType : "bearer",
    expiresIn: typeof payload.expiresIn === "number" ? payload.expiresIn : 0,
    expiresAt: typeof payload.expiresAt === "number" ? payload.expiresAt : 0,
    user: {
      id: payload.user.id,
      email: payload.user.email,
      fullName: payload.user.fullName,
      phone:
        typeof payload.user.phone === "string" ? payload.user.phone : undefined,
      pegawai,
    },
  };
}

export async function logoutSsoSession(accessToken: string): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${getSsoBaseUrl()}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    if (error instanceof SsoAuthError) {
      throw error;
    }

    throw new SsoAuthError(
      "Layanan autentikasi sedang tidak tersedia.",
      502,
      "sso_unavailable",
    );
  }

  if (response.ok) {
    return;
  }

  const payload = await readJsonResponse(response);

  throwSsoResponseError(payload, response.status, "Logout SSO gagal diproses.");
}

export async function getKlinikContext(
  accessToken: string,
): Promise<KlinikContext> {
  let response: Response;

  try {
    response = await fetch(`${getSsoBaseUrl()}/api/v1/auth/klinik-context`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    if (error instanceof SsoAuthError) {
      throw error;
    }

    throw new SsoAuthError(
      "Gagal memuat akses pengguna Klinik PKP.",
      502,
      "sso_unavailable",
    );
  }

  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throwSsoResponseError(
      payload,
      response.status,
      "Gagal memuat akses pengguna Klinik PKP.",
    );
  }

  if (
    !isRecord(payload) ||
    typeof payload.id !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.role !== "string"
  ) {
    throw new SsoAuthError(
      "Respons konteks Klinik PKP tidak valid.",
      502,
      "invalid_klinik_context",
    );
  }

  return {
    id: payload.id,
    email: payload.email,
    role: payload.role,
  };
}

export async function requestPasswordRecoveryWithSso(params: {
  email: string;
  application: "klinik_pkp";
}): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${getSsoBaseUrl()}/api/v1/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: params.email,
        application: params.application,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    if (error instanceof SsoAuthError) {
      throw error;
    }

    throw new SsoAuthError(
      "Layanan reset password sedang tidak tersedia.",
      502,
      "sso_unavailable",
    );
  }

  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throwSsoResponseError(
      payload,
      response.status,
      "Permintaan reset password gagal diproses.",
    );
  }
}

export async function resetPasswordWithSso(params: {
  tokenHash: string;
  password: string;
}): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${getSsoBaseUrl()}/api/v1/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        tokenHash: params.tokenHash,
        password: params.password,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    if (error instanceof SsoAuthError) {
      throw error;
    }

    throw new SsoAuthError(
      "Layanan reset password sedang tidak tersedia.",
      502,
      "sso_unavailable",
    );
  }

  if (response.ok) {
    return;
  }

  const payload = await readJsonResponse(response);

  throwSsoResponseError(
    payload,
    response.status,
    "Reset password gagal diproses.",
  );
}
