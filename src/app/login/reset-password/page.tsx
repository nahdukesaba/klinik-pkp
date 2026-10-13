import ResetPasswordPage from "@/components/login/ResetPasswordPage";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Buat password baru untuk akun Klinik PKP.",
};

export default function ResetPasswordRoute() {
  return <ResetPasswordPage />;
}
