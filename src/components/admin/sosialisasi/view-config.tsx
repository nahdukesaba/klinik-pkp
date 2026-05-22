import {
  CalendarDays,
  MapPin,
  Newspaper,
} from "lucide-react";

import {
  StatusBadge,
  type Column,
} from "@/components/admin";
import { formatDateId, getMonthKey } from "@/lib/date";
import type { SosialisasiLocation } from "@/services/sosialisasi.service";

import type { SosialisasiAdminView, SosialisasiViewConfig } from "./types";

const lokasiColumns: Column<SosialisasiLocation>[] = [
  {
    key: "name",
    label: "Nama Kegiatan",
    sortable: true,
    sortField: "title",
    render: (item) => (
      <div className="max-w-[280px]">
        <p className="break-words font-medium text-foreground">{item.name}</p>
        <p className="mt-0.5 break-words text-xs text-muted-foreground">
          {item.alamat}
        </p>
      </div>
    ),
  },
  {
    key: "kabupaten",
    label: "Kabupaten/Kota",
    sortable: true,
    sortField: "region_id",
  },
  {
    key: "date",
    label: "Tanggal",
    sortable: true,
    sortField: "scheduled_at_start",
    render: (item) => (
      <div>
        <p className="text-sm text-foreground">{item.date}</p>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    sortField: "scheduled_at_end",
    render: (item) => <StatusBadge status={item.status} />,
  },
  {
    key: "coordinates",
    label: "Koordinat",
    render: (item) => (
      <span className="font-mono text-xs text-muted-foreground">
        {item.coordinates[0].toFixed(4)}, {item.coordinates[1].toFixed(4)}
      </span>
    ),
  },
];

const jadwalColumns: Column<SosialisasiLocation>[] = [
  {
    key: "name",
    label: "Agenda",
    sortable: true,
    sortField: "title",
    render: (item) => (
      <div className="max-w-[280px]">
        <p className="break-words font-medium text-foreground">{item.name}</p>
        <p className="mt-0.5 break-words text-xs text-muted-foreground">
          {item.kabupaten}
          {item.kecamatan ? ` | ${item.kecamatan}` : ""}
        </p>
      </div>
    ),
  },
  {
    key: "scheduledAtStart",
    label: "Jadwal",
    sortable: true,
    sortField: "scheduled_at_start",
    render: (item) => (
      <div>
        <p className="text-sm text-foreground">
          {formatDateId(item.scheduledAtStart)}
        </p>
      </div>
    ),
  },
  {
    key: "kelurahan",
    label: "Wilayah",
    render: (item) => (
      <div className="text-sm text-muted-foreground">
        <p>{item.kelurahan || "-"}</p>
        <p className="text-xs">{item.alamat}</p>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    sortField: "scheduled_at_end",
    render: (item) => <StatusBadge status={item.status} />,
  },
];

const beritaColumns: Column<SosialisasiLocation>[] = [
  {
    key: "name",
    label: "Berita Sosialisasi",
    sortable: true,
    sortField: "title",
    render: (item) => (
      <div className="max-w-[320px]">
        <p className="break-words font-medium text-foreground">{item.name}</p>
        <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
          {item.kabupaten}
          {item.kecamatan ? ` | ${item.kecamatan}` : ""}
        </p>
      </div>
    ),
  },
  {
    key: "scheduledAtStart",
    label: "Tanggal",
    sortable: true,
    sortField: "scheduled_at_start",
    render: (item) => (
      <div>
        <p className="text-sm text-foreground">
          {formatDateId(item.scheduledAtStart)}
        </p>
        <p className="text-xs text-muted-foreground">{item.kabupaten}</p>
      </div>
    ),
  },
  {
    key: "images",
    label: "Media",
    render: (item) => (
      <span className="text-sm text-muted-foreground">
        {item.images.length > 0 ? `${item.images.length} gambar` : "Tanpa gambar"}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    sortField: "scheduled_at_end",
    render: (item) => <StatusBadge status={item.status} />,
  },
];

function sortByDateAsc(items: SosialisasiLocation[]) {
  return [...items].sort((left, right) =>
    left.date.localeCompare(right.date)
  );
}

function sortByDateDesc(items: SosialisasiLocation[]) {
  return [...items].sort((left, right) =>
    right.date.localeCompare(left.date)
  );
}

export function buildSosialisasiViewConfig(params: {
  view: SosialisasiAdminView;
  locations: SosialisasiLocation[];
  upcomingLocations: SosialisasiLocation[];
  completedLocations: SosialisasiLocation[];
  pendingLocations: SosialisasiLocation[];
  kabupatenCount: number;
  statsLocations?: SosialisasiLocation[];
  statsUpcomingLocations?: SosialisasiLocation[];
  statsCompletedLocations?: SosialisasiLocation[];
  statsPendingLocations?: SosialisasiLocation[];
  statsKabupatenCount?: number;
}): SosialisasiViewConfig {
  const {
    view,
    locations,
    upcomingLocations,
    completedLocations,
    pendingLocations,
    kabupatenCount,
    statsLocations = locations,
    statsUpcomingLocations = upcomingLocations,
    statsCompletedLocations = completedLocations,
    statsPendingLocations = pendingLocations,
    statsKabupatenCount = kabupatenCount,
  } = params;

  if (view === "jadwal") {
    const agenda = sortByDateAsc(locations);
    const allAgenda = sortByDateAsc(statsLocations);
    const currentMonth = getMonthKey(new Date().toISOString());
    const currentMonthCount = allAgenda.filter((item) =>
      getMonthKey(item.scheduledAtStart) === currentMonth
    ).length;

    return {
      title: "Jadwal Kegiatan Sosialisasi",
      addLabel: "Tambah Jadwal",
      dialogTitle: "Data Jadwal Sosialisasi",
      emptyMessage: "Belum ada jadwal kegiatan sosialisasi.",
      columns: jadwalColumns,
      data: agenda,
      stats: [
        { label: "Total Agenda", value: allAgenda.length },
        { label: "Bulan Ini", value: currentMonthCount },
        { label: "Mendatang", value: statsUpcomingLocations.length },
        { label: "Selesai", value: statsCompletedLocations.length },
      ],
      icon: <CalendarDays className="h-5 w-5" />,
    };
  }

  if (view === "berita") {
    const berita = sortByDateDesc(
      [...pendingLocations, ...completedLocations].filter(
        (item) => item.description.trim() !== ""
      )
    );
    const allBerita = sortByDateDesc(
      [...statsPendingLocations, ...statsCompletedLocations].filter(
        (item) => item.description.trim() !== ""
      )
    );

    return {
      title: "Berita Sosialisasi",
      addLabel: "Upload Gambar",
      dialogTitle: "Gambar Berita Sosialisasi",
      emptyMessage: "Belum ada kegiatan selesai yang menunggu atau siap dipublikasikan.",
      columns: beritaColumns,
      data: berita,
      stats: [
        { label: "Total Berita", value: allBerita.length },
        {
          label: "Dengan Gambar",
          value: allBerita.filter((item) => item.images.length > 0).length,
        },
        { label: "Pending Dokumentasi", value: statsPendingLocations.length },
        { label: "Selesai", value: statsCompletedLocations.length },
      ],
      icon: <Newspaper className="h-5 w-5" />,
    };
  }

  return {
    title: "Info Peta Sosialisasi",
    addLabel: "Tambah Lokasi",
    dialogTitle: "Data Lokasi Sosialisasi",
    emptyMessage: "Belum ada lokasi sosialisasi.",
    columns: lokasiColumns,
    data: locations,
    stats: [
      { label: "Total Titik", value: statsLocations.length },
      { label: "Kabupaten/Kota", value: statsKabupatenCount },
      { label: "Mendatang", value: statsUpcomingLocations.length },
      { label: "Selesai", value: statsCompletedLocations.length },
    ],
    icon: <MapPin className="h-5 w-5" />,
  };
}
