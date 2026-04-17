export interface AdminBreadcrumb {
  label: string;
  href: string;
}

const breadcrumbLabels: Record<string, string> = {
  admin: "Dashboard",
  berita: "Berita",
  sosialisasi: "Sosialisasi",
  lokasi: "Info Peta",
  jadwal: "Jadwal Kegiatan",
  "lokasi-klinik": "Lokasi Klinik",
  bsps: "Penerimaan BSPS",
  rusun: "Sebaran Rusun",
  users: "Control Users",
  "kawasan-kumuh": "Kawasan Kumuh",
  "bank-desain": "Bank Desain",
  create: "Tambah Baru",
  edit: "Edit",
};

export function getAdminBreadcrumbs(pathname: string): AdminBreadcrumb[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: AdminBreadcrumb[] = [];
  let currentPath = "";

  for (const [index, segment] of segments.entries()) {
    currentPath += `/${segment}`;
    const previousSegment = segments[index - 1];
    let label = breadcrumbLabels[segment] || segment;

    if (segment === "berita" && previousSegment === "sosialisasi") {
      label = "Berita Sosialisasi";
    }

    breadcrumbs.push({
      label,
      href: currentPath,
    });
  }

  return breadcrumbs;
}
