"use client";

import { useCallback, useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import {
  adminFetch,
  ensureAdminCsrfToken,
  warmUpAdminCsrfToken,
} from "@/lib/admin-client";
import { checkRateLimit, sanitizeNip } from "@/lib/security";
import { loginSchema, validateForm } from "@/lib/validations";

function resolveRedirectTarget(candidate: string | null) {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/admin";
  }

  return candidate;
}

export function useLoginPage() {
  const searchParams = useSearchParams();
  const redirectTarget = resolveRedirectTarget(searchParams.get("redirect"));

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    warmUpAdminCsrfToken();
  }, []);

  const handleLogin = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (isLoading) {
        return;
      }

      setFormErrors({});

      const rateCheck = checkRateLimit("login-attempt", 5, 60_000);
      if (!rateCheck.allowed) {
        const waitSeconds = Math.ceil(rateCheck.resetInMs / 1000);
        toast({
          title: "Terlalu banyak percobaan",
          description: `Silakan tunggu ${waitSeconds} detik sebelum mencoba lagi.`,
          variant: "destructive",
        });
        return;
      }

      const validation = validateForm(loginSchema, { email, nip, password });
      if (!validation.success) {
        setFormErrors(validation.errors ?? {});
        toast({
          title: "Validasi gagal",
          description: "Periksa kembali data yang dimasukkan.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      try {
        await ensureAdminCsrfToken(true);

        const sanitizedData = validation.data as {
          email: string;
          nip: string;
          password: string;
        };

        const data = await adminFetch<{
          success: boolean;
          user?: { name?: string };
        }>("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sanitizedData),
        });

        toast({
          title: "Login berhasil!",
          description: `Selamat datang, ${data.user?.name ?? "Admin"}.`,
        });

        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }

        window.location.replace(redirectTarget);
      } catch (error) {
        toast({
          title: "Login gagal",
          description:
            error instanceof Error
              ? error.message
              : "Email, NIP, atau password salah.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [email, isLoading, nip, password, redirectTarget, toast]
  );

  const togglePassword = useCallback(() => {
    setShowPassword((previous) => !previous);
  }, []);

  return {
    showPassword,
    isLoading,
    email,
    nip,
    password,
    formErrors,
    setEmail,
    setNip,
    setPassword,
    togglePassword,
    handleLogin,
    sanitizeNip,
  };
}
