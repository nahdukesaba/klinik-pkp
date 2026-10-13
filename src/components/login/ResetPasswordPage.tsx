"use client";

import Link from "next/link";

import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
} from "lucide-react";

import { AuthPageShell } from "@/components/login/AuthPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPasswordPage } from "@/hooks/auth/use-reset-password-page";

export default function ResetPasswordPage() {
  const {
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
    togglePassword,
    toggleConfirmPassword,
    handleSubmit,
  } = useResetPasswordPage();

  return (
    <AuthPageShell
      backHref="/login"
      backLabel="Kembali ke Login"
      title="Reset Password Akun Balai"
      subtitle="Buat password baru untuk Akun Balai Anda"
    >
      {recoveryState === "checking" && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />

          <p className="text-sm text-muted-foreground">
            Memeriksa tautan reset password...
          </p>
        </div>
      )}

      {recoveryState === "invalid" && (
        <div className="space-y-4 py-2 text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">
              Tautan Tidak Valid
            </p>

            <p className="text-xs leading-relaxed text-muted-foreground">
              {recoveryError}
            </p>
          </div>

          <Button asChild className="w-full">
            <Link href="/login/forgot-password">Minta Tautan Reset Baru</Link>
          </Button>

          <Link
            href="/login"
            className="inline-flex text-xs text-primary transition-colors hover:underline"
          >
            Kembali ke Login
          </Link>
        </div>
      )}

      {recoveryState === "success" && (
        <div className="space-y-4 py-2 text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">
              Password Akun Balai Berhasil Diperbarui
            </p>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Gunakan password baru ini pada aplikasi Balai yang telah terhubung dengan sistem autentikasi terpusat.
            </p>
          </div>

          <Button asChild className="w-full">
            <Link href="/login">Masuk ke Klinik PKP</Link>
          </Button>
        </div>
      )}

      {recoveryState === "ready" && (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <Label
              htmlFor="new-password"
              className="text-sm font-medium text-foreground"
            >
              Password Baru
            </Label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password baru"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`h-10 border-border bg-background/50 pl-10 pr-10 transition-colors focus:border-primary ${
                  formErrors.password ? "border-red-500" : ""
                }`}
                required
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
              />

              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-1 top-1/2 flex min-h-[36px] min-w-[36px] -translate-y-1/2 items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {formErrors.password ? (
              <p className="text-xs text-red-500">{formErrors.password}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Gunakan minimal 8 karakter.
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="confirm-password"
              className="text-sm font-medium text-foreground"
            >
              Konfirmasi Password
            </Label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={`h-10 border-border bg-background/50 pl-10 pr-10 transition-colors focus:border-primary ${
                  formErrors.confirmPassword ? "border-red-500" : ""
                }`}
                required
                autoComplete="new-password"
                maxLength={128}
              />

              <button
                type="button"
                onClick={toggleConfirmPassword}
                className="absolute right-1 top-1/2 flex min-h-[36px] min-w-[36px] -translate-y-1/2 items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={
                  showConfirmPassword
                    ? "Sembunyikan konfirmasi password"
                    : "Tampilkan konfirmasi password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {formErrors.confirmPassword && (
              <p className="text-xs text-red-500">
                {formErrors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="h-10 w-full bg-gradient-to-r from-primary to-accent text-sm font-semibold transition-opacity hover:opacity-90"
            disabled={!canSubmit}
          >
            {isLoading ? "Memperbarui..." : "Simpan Password Baru"}
          </Button>
        </form>
      )}
    </AuthPageShell>
  );
}
