import type { AdminFormValues, FormFieldDef } from "@/components/admin";
import {
  getFileFormValue,
  getNumberFormValue,
  getStringFormValue,
  toDateTimeLocalValue,
  toIsoStringFromDateTimeLocal,
} from "@/lib/admin/form";
import type { SosialisasiLocation } from "@/services/sosialisasi.service";

import type { FormSelectOption, SosialisasiAdminView } from "./types";

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
          ? `Unggah 1 sampai 3 gambar baru. Gambar saat ini: ${editingItem.images.length}. Maksimal 2 MB per gambar dan file bisa ditambahkan beberapa kali sebelum disimpan.`
          : "Unggah 1 sampai 3 gambar. Maksimal 2 MB per gambar dan file bisa ditambahkan beberapa kali sebelum disimpan.",
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
      helperText:
        "Maksimal 3 gambar, masing-masing maksimal 2 MB. File bisa ditambahkan beberapa kali sebelum disimpan.",
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
