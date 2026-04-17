"use client";

import { useCallback, useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { checkRateLimit, sanitizeNip } from "@/lib/security";
import { forgotPasswordSchema, validateForm } from "@/lib/validations";

export function useForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [nip, setNip] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (isLoading) {
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
          toast({
            title: "Permintaan gagal",
            description:
              payload?.error ??
              payload?.message ??
              "Terjadi kesalahan. Silakan coba lagi.",
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
    [email, isLoading, nip, toast]
  );

  return {
    isLoading,
    isSubmitted,
    email,
    nip,
    formErrors,
    setEmail,
    setNip,
    handleSubmit,
    sanitizeNip,
  };
}
