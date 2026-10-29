import ForgotPasswordPage from "@/components/login/ForgotPasswordPage";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lupa Password Klinik PKP",
  description:
    "Minta instruksi pemulihan password Akun Balai melalui Klinik PKP.",
};

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
