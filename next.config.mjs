/**
 * Next.js Configuration
 *
 * CSP (Content Security Policy) ditangani sepenuhnya oleh proxy.ts
 * dengan nonce-based policy yang lebih aman.
 *
 * Rewrites digunakan untuk mem-proxy request API dari browser ke backend
 * sehingga menghindari masalah CORS (same-origin).
 *
 * @type {import('next').NextConfig}
 */

// URL backend API (server-side only, TIDAK terexpose ke browser).
// Rewrites meneruskan /api/ext/* → BACKEND_API_URL/*
// PENTING: Hanya gunakan API_URL (tanpa NEXT_PUBLIC_ prefix)
// agar URL backend tidak masuk ke client bundle.
const BACKEND_API_URL =
  process.env.API_URL ?? "http://localhost:8000/api/v1";

const nextConfig = {
  // Hapus header X-Powered-By (information disclosure)
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdnjs.cloudflare.com',
      },
      {
        protocol: 'https',
        hostname: '*.ngrok-free.dev',
      },
    ],
  },
  // Turbopack is enabled by default in Next.js 16
  experimental: {
    // Otomatis transform barrel imports ke direct imports saat build.
    // Mengurangi cold start 200-800ms per library (lucide-react: ~1583 modules).
    // Ref: vercel-react-best-practices/bundle-barrel-imports
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-toast",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-label",
      "@radix-ui/react-slot",
    ],
  },

  // ============================================
  // API Proxy via Rewrites (menghindari CORS)
  // ============================================
  // Browser request: /api/ext/rusun → Backend: BACKEND_API_URL/rusun
  // Ini terjadi di level server sehingga tidak ada CORS issue.
  rewrites: async () => [
    {
      source: '/api/ext/:path*',
      destination: `${BACKEND_API_URL}/:path*`,
    },
  ],
  // Security Headers — defense-in-depth
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        // CSP ditangani oleh proxy.ts dengan nonce-based policy (lebih aman).
        // Tidak perlu set CSP header di sini untuk menghindari konflik.
        // === Anti-Clickjacking ===
        // frame-ancestors di CSP + X-Frame-Options (untuk browser lama)
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        // === HTTPS Enforcement ===
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        // === Prevent MIME sniffing ===
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        // === Referrer Policy ===
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        // === Cross-Origin Policies ===
        {
          key: 'Cross-Origin-Opener-Policy',
          value: 'same-origin',
        },
        // === Permissions Policy ===
        // Batasi fitur browser — hanya izinkan yang dibutuhkan
        // CATATAN: unload tidak diblokir karena Next.js membutuhkannya
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(self), payment=(), usb=()',
        },
      ],
    },
  ],
};

export default nextConfig;
