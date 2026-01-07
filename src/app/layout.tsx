import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import type { Metadata } from "next";

import "./globals.css";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
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
