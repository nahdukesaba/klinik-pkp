import SsoCallbackPage from "@/components/login/SsoCallbackPage";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memproses Akun Balai",
  description: "Menyelesaikan proses masuk Klinik PKP dengan Akun Balai.",
};

export default function SsoCallbackRoute() {
  return <SsoCallbackPage />;
}
