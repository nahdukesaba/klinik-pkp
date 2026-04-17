/**
 * Loading state untuk /kawasan-kumuh.
 * Menampilkan skeleton yang identik dengan layout halaman
 * sehingga transisi terasa seamless.
 */

import { MapDashboardLoading } from "@/components/shared";

export default function KawasanKumuhLoading() {
  return <MapDashboardLoading sidebarCards={3} />;
}
