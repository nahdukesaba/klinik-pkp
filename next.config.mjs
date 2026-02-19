/**
 * Next.js Configuration
 *
 * CSP (Content Security Policy) ditangani sepenuhnya oleh middleware.ts
 * dengan nonce-based policy yang lebih aman.
 *
 * @type {import('next').NextConfig}
 */
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
    ],
  },
  // Turbopack is enabled by default in Next.js 16
  experimental: {
    // Enable optimizations
  },
  // Security Headers — defense-in-depth
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        // CSP ditangani oleh middleware.ts dengan nonce-based policy (lebih aman).
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
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), unload=()',
        },
      ],
    },
  ],
};

export default nextConfig;
