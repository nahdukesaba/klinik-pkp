export const AUTH_ENDPOINTS = {
  csrf: "/api/auth/csrf",
  login: "/api/auth/login",
  logout: "/api/auth/logout",
  refresh: "/api/auth/refresh",
  forgotPassword: "/api/auth/forgot-password",
  resetPassword: "/api/auth/reset-password",
  ssoExchange: "/api/auth/sso/exchange",
  ssoLogout: "/api/auth/sso/logout",
} as const;
