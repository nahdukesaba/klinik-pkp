"use client";

import Link from "next/link";

import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";

import { AuthPageShell } from "@/components/login/AuthPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginPage } from "@/hooks/auth/use-login-page";

export default function LoginPage() {
  const {
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
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
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
          <Label htmlFor="nip" className="text-sm font-medium text-foreground">
            NIP
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="nip"
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
          <Link
            href="/login/forgot-password"
            className="text-xs text-primary transition-colors hover:underline"
          >
            Lupa password?
          </Link>
        </div>

        <Button
          type="submit"
          className="h-10 w-full bg-gradient-to-r from-primary to-accent text-sm font-semibold transition-opacity hover:opacity-90"
          disabled={isLoading}
        >
          {isLoading ? "Memproses..." : "Masuk"}
        </Button>
      </form>
    </AuthPageShell>
  );
}
