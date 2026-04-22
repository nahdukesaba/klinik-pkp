"use client";

import { useCallback, useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { checkRateLimit, sanitizeNip } from "@/lib/security";
import { forgotPasswordSchema, validateForm } from "@/lib/validations";

function extractForgotPasswordFieldErrors(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate =
    "errors" in payload && payload.errors && typeof payload.errors === "object"
      ? payload.errors
      : "details" in payload &&
          payload.details &&
          typeof payload.details === "object"
        ? payload.details
        : null;

  if (!candidate) {
    return null;
  }

  const entries = Object.entries(candidate).filter(
    ([, value]) => typeof value === "string"
  );

  return entries.length > 0
    ? Object.fromEntries(entries) as Record<string, string>
    : null;
}

function normalizeForgotPasswordErrorMessage(
  status: number,
  payload: unknown
) {
  const fieldErrors = extractForgotPasswordFieldErrors(payload);
  if (fieldErrors?.email || fieldErrors?.nip) {
    return "Data belum dapat diverifikasi. Periksa kembali email dan NIP yang terdaftar.";
  }

  if (status === 429) {
    return "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.";
  }

  if (status === 400 || status === 404 || status === 422) {
    return "Data belum dapat diverifikasi. Periksa kembali email dan NIP yang terdaftar.";
  }

  if (payload && typeof payload === "object") {
    const backendMessage =
      ("error" in payload && typeof payload.error === "string" && payload.error) ||
      ("message" in payload &&
        typeof payload.message === "string" &&
        payload.message) ||
      "";

    if (backendMessage) {
      return backendMessage;
    }
  }

  return "Permintaan belum dapat diproses saat ini. Silakan coba lagi.";
}

export function useForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [nip, setNip] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const sanitizedNip = sanitizeNip(nip).slice(0, 18);
  const canSubmit = !isLoading && email.trim() !== "" && sanitizedNip.length === 18;

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!canSubmit) {
        return;
      }

      setFormErrors({});

      const rateCheck = checkRateLimit("forgot-password", 3, 5 * 60_000);
      if (!rateCheck.allowed) {
        const waitMinutes = Math.ceil(rateCheck.resetInMs / 60_000);
        toast({
          title: "Terlalu banyak permintaan",
          description: `Silakan tunggu ${waitMinutes} menit sebelum mencoba lagi.`,
          variant: "destructive",
        });
        return;
      }

      const validation = validateForm(forgotPasswordSchema, { email, nip });
      if (!validation.success) {
        setFormErrors(validation.errors ?? {});
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch("/api/ext/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validation.data),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          const backendFieldErrors = extractForgotPasswordFieldErrors(payload);
          if (backendFieldErrors) {
            setFormErrors(backendFieldErrors);
          }

          toast({
            title: "Permintaan belum dapat diproses",
            description: normalizeForgotPasswordErrorMessage(
              response.status,
              payload
            ),
            variant: "destructive",
          });
          return;
        }

        setIsSubmitted(true);
      } catch {
        toast({
          title: "Permintaan gagal",
          description: "Terjadi kesalahan pada jaringan. Silakan coba lagi.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [canSubmit, email, nip, toast]
  );

  return {
    isLoading,
    isSubmitted,
    canSubmit,
    email,
    nip,
    formErrors,
    setEmail,
    setNip,
    handleSubmit,
    sanitizeNip,
  };
}
