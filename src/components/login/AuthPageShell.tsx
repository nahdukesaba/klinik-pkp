import Image from "next/image";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";

interface AuthPageShellProps {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthPageShell({
  backHref,
  backLabel,
  title,
  subtitle,
  children,
}: AuthPageShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-background to-accent-2/30 dark:from-background dark:via-primary/5 dark:to-accent/10" />
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl sm:h-[600px] sm:w-[600px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-2/20 blur-3xl sm:h-[600px] sm:w-[600px]" />
        <div
          className="absolute inset-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, hsl(var(--primary) / 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, hsl(var(--accent-2) / 0.15) 0%, transparent 50%)",
          }}
        />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="rounded-2xl border border-border bg-card/90 px-6 py-5 shadow-2xl backdrop-blur-lg sm:px-8 sm:py-6">
          <Link
            href={backHref}
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </Link>

          <div className="mb-5 flex flex-col items-center">
            <div className="relative mb-2.5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-border bg-white shadow-lg transition-transform hover:scale-105">
              <Image
                src="/logo-bp3kp.png"
                alt="Logo BP3KP"
                fill
                sizes="44px"
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-lg font-bold text-foreground sm:text-xl">
              {title}
            </h1>
            <p className="mt-0.5 text-center text-xs text-muted-foreground">
              {subtitle}
            </p>
          </div>

          {children}

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            (c) {new Date().getFullYear()} BP3KP Sumatera II
          </p>
        </div>
      </div>
    </div>
  );
}
