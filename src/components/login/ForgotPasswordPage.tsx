"use client";

import Link from "next/link";

import { CheckCircle2, Mail, Send, User } from "lucide-react";

import { AuthPageShell } from "@/components/login/AuthPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordPage } from "@/hooks/auth/use-forgot-password-page";

export default function ForgotPasswordPage() {
  const {
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
  } = useForgotPasswordPage();

  return (
    <AuthPageShell
      backHref="/login"
      backLabel="Kembali ke Login"
      title="Lupa Password"
      subtitle="Masukkan email dan NIP yang terdaftar untuk meminta reset password"
    >
      {isSubmitted ? (
        <div className="space-y-3 py-2 text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Permintaan Diterima
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Jika email dan NIP cocok dengan data akun yang terdaftar,
              instruksi reset password akan dikirim ke email Anda.
            </p>
          </div>
          <Link
            href="/login"
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary transition-colors hover:underline"
          >
            Kembali ke halaman login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <Label
              htmlFor="forgot-email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="forgot-email"
                type="email"
                placeholder="Email terdaftar"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`h-10 border-border bg-background/50 pl-10 transition-colors focus:border-primary ${
                  formErrors.email ? "border-red-500" : ""
                }`}
                required
                autoComplete="email"
                maxLength={255}
              />
            </div>
            {formErrors.email && (
              <p className="text-xs text-red-500">{formErrors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="forgot-nip"
              className="text-sm font-medium text-foreground"
            >
              NIP
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="forgot-nip"
                type="text"
                placeholder="Nomor Induk Pegawai"
                value={nip}
                onChange={(event) =>
                  setNip(sanitizeNip(event.target.value).slice(0, 18))
                }
                className={`h-10 border-border bg-background/50 pl-10 transition-colors focus:border-primary ${
                  formErrors.nip ? "border-red-500" : ""
                }`}
                required
                autoComplete="off"
                maxLength={18}
                inputMode="numeric"
                pattern="[0-9]{18}"
              />
            </div>
            {formErrors.nip ? (
              <p className="text-xs text-red-500">{formErrors.nip}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                NIP harus 18 digit.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-border bg-muted/50 px-3 py-2.5">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Gunakan email dan NIP yang terdaftar. Demi keamanan, sistem hanya
              menampilkan status verifikasi secara umum.
            </p>
          </div>

          <Button
            type="submit"
            className="h-10 w-full bg-gradient-to-r from-primary to-accent text-sm font-semibold transition-opacity hover:opacity-90"
            disabled={!canSubmit}
          >
            {isLoading ? (
              "Mengirim..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Kirim Permintaan
              </>
            )}
          </Button>
        </form>
      )}
    </AuthPageShell>
  );
}
