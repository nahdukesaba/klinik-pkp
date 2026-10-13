"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { normalizeApiError } from "@/lib/api-response";
import { resetPasswordSchema, validateForm } from "@/lib/validations";
import { submitResetPasswordRequest } from "@/services/auth.service";

type RecoveryState = "checking" | "ready" | "invalid" | "success";

function getRecoveryLinkErrorMessage(
  errorCode: string | null,
  errorDescription: string | null,
) {
  if (errorCode === "otp_expired") {
    return "Tautan reset password sudah kedaluwarsa atau telah digunakan.";
  }

  if (errorDescription) {
    return "Tautan reset password tidak valid atau telah berakhir.";
  }

  return "Tautan reset password tidak valid atau telah berakhir.";
}

function getFieldErrors(details: unknown) {
  if (!details || typeof details !== "object") {
    return null;
  }

  const candidate = details as Record<string, unknown>;
  const entries = Object.entries(candidate).filter(
    ([, value]) => typeof value === "string",
  );

  return entries.length > 0
    ? (Object.fromEntries(entries) as Record<string, string>)
    : null;
}

export function useResetPasswordPage() {
  const { toast } = useToast();

  const recoveryTokenRef = useRef<string | null>(null);
  const hasParsedRecoveryFragmentRef = useRef(false);

  const [recoveryState, setRecoveryState] = useState<RecoveryState>("checking");
  const [recoveryError, setRecoveryError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (hasParsedRecoveryFragmentRef.current) {
      return;
    }

    hasParsedRecoveryFragmentRef.current = true;

    const rawHash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;

    const params = new URLSearchParams(rawHash);

    const cleanUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(window.history.state, "", cleanUrl);

    const error = params.get("error");
    const errorCode = params.get("error_code");
    const errorDescription = params.get("error_description");
    const recoveryType = params.get("type");
    const accessToken = params.get("access_token")?.trim() ?? "";

    let nextState: RecoveryState = "invalid";
    let nextError = "Tautan reset password tidak valid atau telah berakhir.";

    if (error || errorCode) {
      nextError = getRecoveryLinkErrorMessage(errorCode, errorDescription);
    } else if (recoveryType === "recovery" && accessToken) {
      recoveryTokenRef.current = accessToken;
      nextState = "ready";
      nextError = "";
    }

    const timer = window.setTimeout(() => {
      setRecoveryError(nextError);
      setRecoveryState(nextState);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const canSubmit =
    recoveryState === "ready" &&
    !isLoading &&
    password.length > 0 &&
    confirmPassword.length > 0;

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!canSubmit) {
        return;
      }

      setFormErrors({});

      const validation = validateForm(resetPasswordSchema, {
        password,
        confirmPassword,
      });

      if (!validation.success) {
        setFormErrors(validation.errors ?? {});
        return;
      }

      const validatedData = validation.data;
      const accessToken = recoveryTokenRef.current;

      if (!validatedData || !accessToken) {
        recoveryTokenRef.current = null;
        setRecoveryError(
          "Sesi reset password tidak valid atau telah berakhir.",
        );
        setRecoveryState("invalid");
        return;
      }

      setIsLoading(true);

      try {
        const result = await submitResetPasswordRequest({
          accessToken,
          password: validatedData.password,
          confirmPassword: validatedData.confirmPassword,
        });

        if (!result.ok) {
          const error = normalizeApiError(
            result.status,
            result.payload,
            "Reset password gagal diproses.",
          );

          const fieldErrors = getFieldErrors(error.details);

          if (fieldErrors) {
            setFormErrors(fieldErrors);
          }

          if (
            error.code === "invalid_recovery_token" ||
            result.status === 401
          ) {
            recoveryTokenRef.current = null;
            setRecoveryError(
              "Sesi reset password tidak valid atau telah berakhir. Silakan minta tautan reset yang baru.",
            );
            setRecoveryState("invalid");
            return;
          }

          toast({
            title: "Password belum dapat diperbarui",
            description: error.message,
            variant: "destructive",
          });

          return;
        }

        recoveryTokenRef.current = null;
        setPassword("");
        setConfirmPassword("");
        setRecoveryState("success");
      } catch {
        toast({
          title: "Reset password gagal",
          description: "Terjadi kesalahan pada jaringan. Silakan coba lagi.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [canSubmit, confirmPassword, password, toast],
  );

  return {
    recoveryState,
    recoveryError,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    formErrors,
    isLoading,
    canSubmit,
    setPassword,
    setConfirmPassword,
    togglePassword: () => setShowPassword((value) => !value),
    toggleConfirmPassword: () => setShowConfirmPassword((value) => !value),
    handleSubmit,
  };
}
