"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { AuthPageShell } from "@/components/login/AuthPageShell";
import { Button } from "@/components/ui/button";
import { AdminApiError } from "@/lib/admin-client";
import {
  readBrowserSsoCallback,
  resolveAccessOutcomePath,
} from "@/lib/auth/browser-sso-contract";
import { exchangeBrowserSsoSession } from "@/services/auth.service";

function accessFailurePath(error: unknown) {
  if (!(error instanceof AdminApiError)) {
    return null;
  }
  if (error.code === "ACCOUNT_DISABLED") {
    return resolveAccessOutcomePath("disabled");
  }
  if (
    error.code === "ACCOUNT_REJECTED" ||
    error.code === "KLINIK_ADMIN_ACCESS_REQUIRED"
  ) {
    return resolveAccessOutcomePath("rejected");
  }
  return null;
}

export default function SsoCallbackPage() {
  const searchParams = useSearchParams();
  const started = useRef(false);
  const [callback] = useState(() => readBrowserSsoCallback(searchParams));
  const [error, setError] = useState<string | null>(() =>
    callback
      ? null
      : "Tautan masuk tidak lengkap atau sudah tidak berlaku.",
  );

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;

    window.history.replaceState({}, document.title, window.location.pathname);
    if (!callback) {
      return;
    }

    void exchangeBrowserSsoSession(callback)
      .then((result) => {
        if (result.status === "pending") {
          window.location.replace(resolveAccessOutcomePath("pending"));
          return;
        }
        window.location.replace("/admin");
      })
      .catch((reason: unknown) => {
        const accessPath = accessFailurePath(reason);
        if (accessPath) {
          window.location.replace(accessPath);
          return;
        }
        setError(
          reason instanceof Error
            ? reason.message
            : "Proses masuk dengan Akun Balai gagal.",
        );
      });
  }, [callback]);

  return (
    <AuthPageShell
      backHref="/login"
      backLabel="Kembali ke Login"
      title="Klinik PKP"
      subtitle={error ?? "Menyelesaikan proses masuk dengan Akun Balai..."}
    >
      {error ? (
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Kembali ke login</Link>
        </Button>
      ) : (
        <div
          className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-label="Memproses autentikasi"
        />
      )}
    </AuthPageShell>
  );
}
