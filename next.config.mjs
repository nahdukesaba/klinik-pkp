/** @type {import('next').NextConfig} */

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
        protocol: 'http',
        hostname: '103.197.190.87',
        port: '3000',
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

  // Proxy /api/ext/* ditangani oleh src/app/api/ext/[...path]/route.ts
  // (bukan next.config rewrite) agar bisa mengembalikan 502 yang benar
  // saat backend tidak bisa dijangkau, bukan 404 yang menyesatkan.
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
