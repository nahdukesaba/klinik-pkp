import ForgotPasswordPage from "@/components/login/ForgotPasswordPage";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lupa Password Akun Balai",
  description: "Pulihkan Password Akun Balai melalui email yang memiliki akses ke Klinik PKP.",
};

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
