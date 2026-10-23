export type AuthRole = "admin" | "user";
export type LoginSource = "direct" | "sso";

export interface AuthenticatedUser {
  appUserId: string;
  authUserId: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  nip: string | null;
  role: AuthRole;
  status: "approved";
  loginSource: LoginSource;
  legacyLocalUserId: string | null;
}

export type PublicAuthenticatedUser = Omit<
  AuthenticatedUser,
  "authUserId" | "legacyLocalUserId"
>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requiredString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function parseAuthenticatedUser(
  value: unknown,
): AuthenticatedUser | null {
  if (!isRecord(value)) {
    return null;
  }

  const appUserId = requiredString(value.appUserId);
  const fullName = requiredString(value.fullName);
  const email = requiredString(value.email);
  const role = value.role;
  const status = value.status;
  const loginSource = value.loginSource;

  if (
    !appUserId ||
    !fullName ||
    !email ||
    (role !== "admin" && role !== "user") ||
    status !== "approved" ||
    (loginSource !== "direct" && loginSource !== "sso")
  ) {
    return null;
  }

  return {
    appUserId,
    authUserId: optionalString(value.authUserId),
    fullName,
    email,
    phone: optionalString(value.phone),
    nip: optionalString(value.nip),
    role,
    status,
    loginSource,
    legacyLocalUserId: optionalString(value.legacyLocalUserId),
  };
}

export function requireAuthenticatedUser(value: unknown): AuthenticatedUser {
  const user = parseAuthenticatedUser(value);
  if (!user) {
    throw new Error("Canonical authenticated user is invalid.");
  }
  return user;
}

export function toPublicAuthenticatedUser(
  user: AuthenticatedUser,
): PublicAuthenticatedUser {
  return {
    appUserId: user.appUserId,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    nip: user.nip,
    role: user.role,
    status: user.status,
    loginSource: user.loginSource,
  };
}

export function hasSameCanonicalIdentity(
  left: Pick<AuthenticatedUser, "appUserId">,
  right: Pick<AuthenticatedUser, "appUserId">,
) {
  return left.appUserId === right.appUserId;
}
