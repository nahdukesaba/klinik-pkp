import ResetPasswordPage from "@/components/login/ResetPasswordPage";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password Akun Balai",
  description: "Buat password baru untuk Akun Balai Anda.",
};

export default function ResetPasswordRoute() {
  return <ResetPasswordPage />;
}
