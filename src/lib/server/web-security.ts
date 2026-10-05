import { type NextRequest, NextResponse } from "next/server";

const SENSITIVE_CACHE_CONTROL =
  "private, no-store, no-cache, must-revalidate, max-age=0";

function appendVaryHeader(headers: Headers, value: string) {
  const current = headers.get("Vary");
  if (!current) {
    headers.set("Vary", value);
    return;
  }

  const values = current
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (!values.some((entry) => entry.toLowerCase() === value.toLowerCase())) {
    values.push(value);
    headers.set("Vary", values.join(", "));
  }
}

function resolveOrigin(candidate: string | null) {
  if (!candidate) {
    return null;
  }

  try {
    return new URL(candidate).origin;
  } catch {
    return null;
  }
}

export function applySensitiveResponseHeaders(
  response: NextResponse,
  options: { clearSiteData?: boolean } = {}
) {
  response.headers.set("Cache-Control", SENSITIVE_CACHE_CONTROL);
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  appendVaryHeader(response.headers, "Cookie");
  appendVaryHeader(response.headers, "Origin");

  if (options.clearSiteData) {
    response.headers.set("Clear-Site-Data", "\"cache\", \"storage\"");
  }

  return response;
}

function getRequestOrigin(request: NextRequest) {
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const host =
    forwardedHost || request.headers.get("host") || request.nextUrl.host;

  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const protocol = forwardedProto || request.nextUrl.protocol.replace(":", "");

  return `${protocol}://${host}`;
}

export function hasTrustedSameOrigin(request: NextRequest) {
  const requestOrigin = getRequestOrigin(request);
  const originHeader = resolveOrigin(request.headers.get("origin"));

  if (originHeader) {
    return originHeader === requestOrigin;
  }

  const refererOrigin = resolveOrigin(request.headers.get("referer"));
  if (refererOrigin) {
    return refererOrigin === requestOrigin;
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  return fetchSite === "same-origin" || fetchSite === "none";
}
