import ResetPasswordPage from "@/components/login/ResetPasswordPage";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password Klinik PKP",
  description: "Buat password baru untuk Akun Balai Anda melalui Klinik PKP.",
};

export default function ResetPasswordRoute() {
  return <ResetPasswordPage />;
}
