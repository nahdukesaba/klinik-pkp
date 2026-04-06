"use client";

import { useEffect, useState, useCallback } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  adminFetch,
  ensureAdminCsrfToken,
  warmUpAdminCsrfToken,
} from "@/lib/admin-client";
import {
  checkRateLimit,
  evaluatePasswordStrength,
  sanitizeNip,
} from "@/lib/security";
import { loginSchema, validateForm } from "@/lib/validations";

function resolveRedirectTarget(candidate: string | null) {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/admin";
  }

  return candidate;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = resolveRedirectTarget(searchParams.get("redirect"));

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(
    evaluatePasswordStrength("")
  );
  const { toast } = useToast();

  useEffect(() => {
    warmUpAdminCsrfToken();
    void router.prefetch(redirectTarget);
  }, [redirectTarget, router]);

  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    setPasswordStrength(evaluatePasswordStrength(value));
  }, []);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sanitizedData),
        });

        toast({
          title: "Login berhasil!",
          description: `Selamat datang, ${data.user?.name ?? "Admin"}.`,
        });

        router.replace(redirectTarget);
        router.refresh();
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
    [email, nip, password, redirectTarget, router, toast, isLoading]
  );

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-background to-accent-2/30 dark:from-background dark:via-primary/5 dark:to-accent/10" />
        <div className="absolute top-0 left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-accent-2/20 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, hsl(var(--primary) / 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, hsl(var(--accent-2) / 0.15) 0%, transparent 50%)",
          }}
        />
      </div>

      <div className="w-full max-w-[560px] animate-fade-in">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        <div className="bg-card/90 backdrop-blur-lg rounded-2xl border border-border shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-xl mb-3 transform hover:scale-105 transition-transform">
              <Building2 className="w-8 h-8 sm:w-9 sm:h-9 text-primary-foreground" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Klinik PKP
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              BP3KP Sumatera II
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-foreground font-medium text-sm">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 h-11 bg-background/50 border-border focus:border-primary transition-colors ${
                    formErrors.email ? "border-red-500" : ""
                  }`}
                  required
                  autoComplete="email"
                  maxLength={255}
                />
              </div>
              {formErrors.email && (
                <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nip" className="text-foreground font-medium text-sm">
                NIP
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="nip"
                  type="text"
                  placeholder="Nomor Induk Pegawai"
                  value={nip}
                  onChange={(e) =>
                    setNip(sanitizeNip(e.target.value).slice(0, 18))
                  }
                  className={`pl-10 h-11 bg-background/50 border-border focus:border-primary transition-colors ${
                    formErrors.nip ? "border-red-500" : ""
                  }`}
                  required
                  autoComplete="off"
                  maxLength={18}
                  inputMode="numeric"
                  pattern="[0-9]{18}"
                />
              </div>
              {formErrors.nip && (
                <p className="text-xs text-red-500 mt-1">{formErrors.nip}</p>
              )}
              {!formErrors.nip && (
                <p className="mt-1 text-xs text-muted-foreground">
                  NIP harus tepat 18 digit.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-foreground font-medium text-sm"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`pl-10 pr-10 h-11 bg-background/50 border-border focus:border-primary transition-colors ${
                    formErrors.password ? "border-red-500" : ""
                  }`}
                  required
                  autoComplete="current-password"
                  maxLength={128}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-md"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {formErrors.password}
                </p>
              )}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < passwordStrength.score
                            ? passwordStrength.score <= 1
                              ? "bg-red-500"
                              : passwordStrength.score <= 2
                                ? "bg-yellow-500"
                                : passwordStrength.score <= 3
                                  ? "bg-blue-500"
                                  : "bg-green-500"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Kekuatan: {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-border accent-primary w-4 h-4"
                />
                <span className="text-muted-foreground text-xs sm:text-sm">
                  Ingat saya
                </span>
              </label>
              <a href="#" className="text-primary hover:underline text-xs sm:text-sm">
                Lupa password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm sm:text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity mt-2"
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} BP3KP Sumatera II. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
