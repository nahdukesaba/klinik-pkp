"use client";

import { useCallback, useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { checkRateLimit } from "@/lib/security";
import { forgotPasswordSchema, validateForm } from "@/lib/validations";
import { submitForgotPasswordRequest } from "@/services/auth.service";

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
    ([, value]) => typeof value === "string",
  );

  return entries.length > 0
    ? (Object.fromEntries(entries) as Record<string, string>)
    : null;
}

function normalizeForgotPasswordErrorMessage(status: number, payload: unknown) {
  const fieldErrors = extractForgotPasswordFieldErrors(payload);

  if (fieldErrors?.email) {
    return fieldErrors.email;
  }

  if (status === 429) {
    return "Terlalu banyak permintaan. Tunggu beberapa menit lalu coba lagi.";
  }

  if (status === 400 || status === 422) {
    return "Periksa kembali format email yang dimasukkan.";
  }

  if (payload && typeof payload === "object") {
    const backendMessage =
      ("message" in payload &&
        typeof payload.message === "string" &&
        payload.message) ||
      ("error" in payload &&
        typeof payload.error === "string" &&
        payload.error) ||
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const canSubmit = !isLoading && email.trim() !== "";

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

      const validation = validateForm(forgotPasswordSchema, { email });

      if (!validation.success) {
        setFormErrors(validation.errors ?? {});
        return;
      }

      const validatedData = validation.data;

      if (!validatedData) {
        setFormErrors({ email: "Email belum valid." });
        return;
      }

      setIsLoading(true);

      try {
        const result = await submitForgotPasswordRequest(validatedData);

        if (!result.ok) {
          const backendFieldErrors = extractForgotPasswordFieldErrors(
            result.payload,
          );

          if (backendFieldErrors) {
            setFormErrors(backendFieldErrors);
          }

          toast({
            title: "Permintaan belum dapat diproses",
            description: normalizeForgotPasswordErrorMessage(
              result.status,
              result.payload,
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
    [canSubmit, email, toast],
  );

  return {
    isLoading,
    isSubmitted,
    canSubmit,
    email,
    formErrors,
    setEmail,
    handleSubmit,
  };
}
