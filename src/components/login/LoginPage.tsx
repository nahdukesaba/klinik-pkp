"use client";

import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import { AuthPageShell } from "@/components/login/AuthPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginPage } from "@/hooks/auth/use-login-page";
import {
  BROWSER_SSO_START_PATH,
  KLINIK_PASSWORD_RECOVERY_PATH,
} from "@/lib/auth/browser-sso-contract";

export default function LoginPage() {
  const {
    showPassword,
    isLoading,
    email,
    password,
    formErrors,
    setEmail,
    setPassword,
    togglePassword,
    handleLogin,
  } = useLoginPage();

  return (
    <AuthPageShell
      backHref="/"
      backLabel="Kembali ke Beranda"
      title="Klinik PKP"
      subtitle="BP3KP Sumatera II"
    >
      <form onSubmit={handleLogin} className="space-y-3.5">
        <div className="space-y-1">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
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
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`h-10 border-border bg-background/50 pl-10 pr-10 transition-colors focus:border-primary ${
                formErrors.password ? "border-red-500" : ""
              }`}
              required
              autoComplete="current-password"
              maxLength={128}
            />
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-1 top-1/2 flex min-h-[36px] min-w-[36px] -translate-y-1/2 items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {formErrors.password && (
            <p className="text-xs text-red-500">{formErrors.password}</p>
          )}
        </div>

        <div className="flex justify-end">
          <a
            href={KLINIK_PASSWORD_RECOVERY_PATH}
            className="text-xs text-primary transition-colors hover:underline"
          >
            Lupa password?
          </a>
        </div>

        <Button
          type="submit"
          className="h-10 w-full bg-gradient-to-r from-primary to-accent text-sm font-semibold transition-opacity hover:opacity-90"
          disabled={isLoading}
        >
          {isLoading ? "Memproses..." : "Masuk"}
        </Button>

        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase text-muted-foreground">atau</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button asChild type="button" variant="outline" className="h-10 w-full">
          <a href={BROWSER_SSO_START_PATH}>Masuk dengan Akun Balai</a>
        </Button>
      </form>
    </AuthPageShell>
  );
}
