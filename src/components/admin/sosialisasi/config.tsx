import {
  CalendarClock,
  MapPin,
  Newspaper,
} from "lucide-react";

import type { Column } from "@/components/admin/AdminDataTable";
import type {
  AdminFormValues,
  FormFieldDef,
} from "@/components/admin/AdminFormDialog";
import {
  getFileFormValue,
  getNumberFormValue,
  getStringFormValue,
  toDateTimeLocalValue,
  toIsoStringFromDateTimeLocal,
} from "@/lib/admin/form";
import { formatDateId } from "@/lib/date";
import type { SosialisasiLocation } from "@/services/sosialisasi.service";

export type SosialisasiAdminView = "lokasi" | "jadwal" | "berita";

interface FormSelectOption {
  value: string;
  label: string;
}

interface ViewMetric {
  label: string;
  value: number;
}

export interface SosialisasiViewConfig {
  title: string;
  addLabel: string;
  dialogTitle: string;
  searchPlaceholder: string;
  emptyMessage: string;
  searchFields: string[];
  columns: Column<SosialisasiLocation>[];
  data: SosialisasiLocation[];
  stats: ViewMetric[];
  icon: React.ReactNode;
}

function SosialisasiStatusBadge({
  status,
}: {
  status: SosialisasiLocation["status"];
}) {
  const variants = {
    selesai: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    mendatang: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  } as const;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${variants[status]}`}
    >
      {status === "selesai" ? "Selesai" : "Mendatang"}
    </span>
  );
}

const lokasiColumns: Column<SosialisasiLocation>[] = [
  {
    key: "name",
    label: "Nama Kegiatan",
    sortable: true,
    render: (item) => (
      <div className="max-w-[280px]">
        <p className="font-medium text-foreground break-words">{item.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground break-words">
          {item.alamat}
        </p>
      </div>
    ),
  },
  {
    key: "kabupaten",
    label: "Kabupaten/Kota",
    sortable: true,
  },
  {
    key: "date",
    label: "Tanggal",
    sortable: true,
    render: (item) => (
      <div>
        <p className="text-sm text-foreground">{item.date}</p>
        <p className="text-xs text-muted-foreground">{item.time}</p>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (item) => <SosialisasiStatusBadge status={item.status} />,
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
    render: (item) => (
      <div className="max-w-[280px]">
        <p className="font-medium text-foreground break-words">{item.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground break-words">
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
    render: (item) => (
      <div>
        <p className="text-sm text-foreground">
          {formatDateId(item.scheduledAtStart)}
        </p>
        <p className="text-xs text-muted-foreground">{item.time}</p>
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
    render: (item) => <SosialisasiStatusBadge status={item.status} />,
  },
];

const beritaColumns: Column<SosialisasiLocation>[] = [
  {
    key: "name",
    label: "Berita Sosialisasi",
    sortable: true,
    render: (item) => (
      <div className="max-w-[320px]">
        <p className="font-medium text-foreground break-words">{item.name}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground break-words">
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
    render: (item) => <SosialisasiStatusBadge status={item.status} />,
  },
];

function sortByScheduledAtAsc(items: SosialisasiLocation[]) {
  return [...items].sort((left, right) =>
    left.scheduledAtStart.localeCompare(right.scheduledAtStart)
  );
}

function sortByScheduledAtDesc(items: SosialisasiLocation[]) {
  return [...items].sort((left, right) =>
    right.scheduledAtStart.localeCompare(left.scheduledAtStart)
  );
}

export function buildSosialisasiDraftValues(
  item: SosialisasiLocation | null
): AdminFormValues | undefined {
  if (!item) {
    return undefined;
  }

  return {
    regionId: item.regionId,
    districtId: item.districtId,
    villageId: item.villageId,
    title: item.name,
    location: item.alamat,
    description: item.description,
    scheduledAtStart: toDateTimeLocalValue(item.scheduledAtStart),
    scheduledAtEnd: toDateTimeLocalValue(item.scheduledAtEnd),
    latitude: String(item.coordinates[0]),
    longitude: String(item.coordinates[1]),
    images: [],
  };
}

export function buildSosialisasiFormFields(params: {
  view: SosialisasiAdminView;
  regionOptions: FormSelectOption[];
  districtOptions: FormSelectOption[];
  villageOptions: FormSelectOption[];
  editingItem: SosialisasiLocation | null;
}) {
  const {
    view,
    regionOptions,
    districtOptions,
    villageOptions,
    editingItem,
  } = params;

  if (view === "berita") {
    return [
      {
        name: "images",
        label: "Gambar Berita",
        type: "file",
        accept: "image/*",
        multiple: true,
        required: true,
        helperText: editingItem
          ? `Unggah 1 sampai 3 gambar baru. Gambar saat ini: ${editingItem.images.length}. Maksimal 2 MB per gambar.`
          : "Unggah 1 sampai 3 gambar. Maksimal 2 MB per gambar.",
      },
    ] satisfies FormFieldDef[];
  }

  return [
    {
      name: "regionId",
      label: "Kabupaten/Kota",
      type: "select",
      required: true,
      options: regionOptions,
    },
    {
      name: "districtId",
      label: "Kecamatan",
      type: "select",
      required: true,
      options: districtOptions,
    },
    {
      name: "villageId",
      label: "Desa/Kelurahan",
      type: "select",
      required: true,
      options: villageOptions,
    },
    {
      name: "title",
      label: "Nama Kegiatan",
      type: "text",
      required: true,
    },
    {
      name: "location",
      label: "Lokasi/Alamat",
      type: "textarea",
      required: true,
    },
    {
      name: "description",
      label: "Deskripsi",
      type: "textarea",
      required: true,
    },
    {
      name: "scheduledAtStart",
      label: "Mulai Kegiatan",
      type: "datetime-local",
      required: true,
    },
    {
      name: "scheduledAtEnd",
      label: "Selesai Kegiatan",
      type: "datetime-local",
      required: true,
    },
    {
      name: "latitude",
      label: "Latitude",
      type: "number",
      required: true,
    },
    {
      name: "longitude",
      label: "Longitude",
      type: "number",
      required: true,
    },
    {
      name: "images",
      label: "Gambar Kegiatan",
      type: "file",
      accept: "image/*",
      multiple: true,
      helperText: "Maksimal 3 gambar, masing-masing maksimal 2 MB.",
    },
  ] satisfies FormFieldDef[];
}

export function buildSosialisasiFormData(
  values: AdminFormValues,
  options?: {
    view?: SosialisasiAdminView;
    existingItem?: SosialisasiLocation | null;
  }
) {
  const formData = new FormData();
  const isBeritaOnly = options?.view === "berita";
  const existingItem = options?.existingItem ?? null;

  if (isBeritaOnly && existingItem) {
    formData.set("village_id", existingItem.villageId);
    formData.set("district_id", existingItem.districtId);
    formData.set("region_id", existingItem.regionId);
    formData.set("title", existingItem.name);
    formData.set("location", existingItem.alamat);
    formData.set("description", existingItem.description);
    formData.set("scheduled_at_start", existingItem.scheduledAtStart);
    formData.set("scheduled_at_end", existingItem.scheduledAtEnd);
    formData.set(
      "coordinate",
      JSON.stringify({
        latitude: existingItem.coordinates[0],
        longitude: existingItem.coordinates[1],
      })
    );

    for (const file of getFileFormValue(values, "images")) {
      formData.append("images", file);
    }

    return formData;
  }

  formData.set("village_id", getStringFormValue(values, "villageId"));
  formData.set("district_id", getStringFormValue(values, "districtId"));
  formData.set("region_id", getStringFormValue(values, "regionId"));
  formData.set("title", getStringFormValue(values, "title"));
  formData.set("location", getStringFormValue(values, "location"));
  formData.set("description", getStringFormValue(values, "description"));
  formData.set(
    "scheduled_at_start",
    toIsoStringFromDateTimeLocal(getStringFormValue(values, "scheduledAtStart"))
  );
  formData.set(
    "scheduled_at_end",
    toIsoStringFromDateTimeLocal(getStringFormValue(values, "scheduledAtEnd"))
  );
  formData.set(
    "coordinate",
    JSON.stringify({
      latitude: getNumberFormValue(values, "latitude"),
      longitude: getNumberFormValue(values, "longitude"),
    })
  );

  for (const file of getFileFormValue(values, "images")) {
    formData.append("images", file);
  }

  return formData;
}

export function buildSosialisasiViewConfig(params: {
  view: SosialisasiAdminView;
  locations: SosialisasiLocation[];
  upcomingLocations: SosialisasiLocation[];
  completedLocations: SosialisasiLocation[];
  kabupatenCount: number;
}): SosialisasiViewConfig {
  const {
    view,
    locations,
    upcomingLocations,
    completedLocations,
    kabupatenCount,
  } = params;

  if (view === "jadwal") {
    const agenda = sortByScheduledAtAsc(locations);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthCount = agenda.filter((item) =>
      item.scheduledAtStart.startsWith(currentMonth)
    ).length;

    return {
      title: "Jadwal Kegiatan Sosialisasi",
      addLabel: "Tambah Jadwal",
      dialogTitle: "Data Jadwal Sosialisasi",
      searchPlaceholder: "Cari agenda kegiatan...",
      emptyMessage: "Belum ada jadwal kegiatan sosialisasi.",
      searchFields: ["name", "kabupaten", "kecamatan", "kelurahan", "alamat"],
      columns: jadwalColumns,
      data: agenda,
      stats: [
        { label: "Agenda Halaman Ini", value: agenda.length },
        { label: "Bulan Ini", value: currentMonthCount },
        { label: "Mendatang Halaman Ini", value: upcomingLocations.length },
        { label: "Selesai Halaman Ini", value: completedLocations.length },
      ],
      icon: <CalendarClock className="h-5 w-5" />,
    };
  }

  if (view === "berita") {
    const berita = sortByScheduledAtDesc(
      completedLocations.filter((item) => item.description.trim() !== "")
    );

    return {
      title: "Berita Sosialisasi",
      addLabel: "Upload Gambar",
      dialogTitle: "Gambar Berita Sosialisasi",
      searchPlaceholder: "Cari berita sosialisasi...",
      emptyMessage:
        "Belum ada kegiatan selesai yang siap diunggah gambarnya.",
      searchFields: ["name", "kabupaten", "description", "alamat"],
      columns: beritaColumns,
      data: berita,
      stats: [
        { label: "Berita Halaman Ini", value: berita.length },
        {
          label: "Dengan Gambar Halaman Ini",
          value: berita.filter((item) => item.images.length > 0).length,
        },
        { label: "Kabupaten Halaman Ini", value: kabupatenCount },
        { label: "Selesai Halaman Ini", value: completedLocations.length },
      ],
      icon: <Newspaper className="h-5 w-5" />,
    };
  }

  return {
    title: "Info Peta Sosialisasi",
    addLabel: "Tambah Lokasi",
    dialogTitle: "Data Lokasi Sosialisasi",
    searchPlaceholder: "Cari lokasi sosialisasi...",
    emptyMessage: "Belum ada lokasi sosialisasi.",
    searchFields: ["name", "kabupaten", "alamat", "description"],
    columns: lokasiColumns,
    data: locations,
    stats: [
      { label: "Titik Halaman Ini", value: locations.length },
      { label: "Kabupaten Halaman Ini", value: kabupatenCount },
      { label: "Mendatang Halaman Ini", value: upcomingLocations.length },
      { label: "Selesai Halaman Ini", value: completedLocations.length },
    ],
    icon: <MapPin className="h-5 w-5" />,
  };
}
