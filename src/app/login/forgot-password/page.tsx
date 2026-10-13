import ForgotPasswordPage from "@/components/login/ForgotPasswordPage";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lupa Password",
  description: "Kirim instruksi reset password melalui email terdaftar.",
};

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
