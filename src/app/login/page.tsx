/**
 * Login Page Route
 * 
 * Halaman untuk login user.
 * 
 * Struktur:
 * - page.tsx (routing) → components/login/LoginPage.tsx
 */

import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Login",
  description: "Masuk ke dashboard Klinik PKP untuk mengelola data perumahan dan kawasan permukiman.",
};

// Skeleton loading untuk LoginPage
function LoginSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[560px] animate-pulse">
        <div className="bg-card/90 rounded-2xl border border-border p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-muted rounded-xl mb-3" />
            <div className="h-6 w-32 bg-muted rounded mb-2" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
          <div className="space-y-4">
            <div className="h-11 bg-muted rounded" />
            <div className="h-11 bg-muted rounded" />
            <div className="h-11 bg-muted rounded" />
            <div className="h-11 bg-muted rounded mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Lazy load LoginPage
const LoginPage = dynamic(
  () => import("@/components/login/LoginPage"),
  { 
    loading: () => <LoginSkeleton />,
    ssr: true 
  }
);

export default LoginPage;