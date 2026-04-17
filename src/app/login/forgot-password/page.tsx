import ForgotPasswordPage from "@/components/login/ForgotPasswordPage";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lupa Password",
  description: "Ajukan permintaan reset password ke administrator.",
};

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
