import { headers } from "next/headers";

import { ConfirmDialogProvider } from "@/components/providers/ConfirmDialogProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { UiInteractivityGuard } from "@/components/providers/UiInteractivityGuard";
import WhatsAppFloatingButton from "@/components/shared/WhatsAppFloatingButton";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Klinik PKP - BP3KP Sumatera II",
  description:
    "Portal layanan informasi, konsultasi, dan pendampingan teknis BP3KP Sumatera II untuk sektor perumahan dan kawasan permukiman.",
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
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          nonce={nonce}
        >
          <QueryProvider>
            <ConfirmDialogProvider>
              <TooltipProvider>
                <UiInteractivityGuard />
                {children}
                <WhatsAppFloatingButton />
                <Toaster />
              </TooltipProvider>
            </ConfirmDialogProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
