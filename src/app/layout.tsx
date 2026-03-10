import { Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";

import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import type { Metadata } from "next";

import "./globals.css";

/**
 * Self-hosted font via next/font — menghilangkan render-blocking request
 * ke fonts.googleapis.com. Font di-inline saat build sehingga:
 * - Zero layout shift (CLS = 0)
 * - ~200ms lebih cepat First Contentful Paint
 * - Tidak perlu CSP whitelist fonts.googleapis.com
 */
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "Klinik PKP - BP3KP Sumatera II",
  description:
    "Layanan konsultasi dan informasi terpadu untuk perumahan, permukiman, dan kawasan kumuh di wilayah Sumatera.",
  keywords: [
    "klinik pkp",
    "bp3kp",
    "perumahan",
    "kawasan permukiman",
    "rusun",
    "bsps",
  ],
  icons: {
    icon: "/logo-bp3kp.png",
    apple: "/logo-bp3kp.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    <html lang="id" suppressHydrationWarning className={plusJakartaSans.variable}>
      <body className={`${plusJakartaSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          nonce={nonce}
        >
          <QueryProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
