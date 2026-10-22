import { redirect } from "next/navigation";

import { CENTRAL_RECOVERY_PATH } from "@/lib/auth/browser-sso-contract";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lupa Password Akun Balai",
  description: "Pulihkan Password Akun Balai melalui email yang memiliki akses ke Klinik PKP.",
};

export default function ForgotPasswordRoute() {
  redirect(CENTRAL_RECOVERY_PATH);
}
