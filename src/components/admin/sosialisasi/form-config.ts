import type { AdminFormValues, FormFieldDef } from "@/components/admin";
import {
  buildExistingUploadFiles,
  buildUploadFieldHelperText,
  getExistingFileFormValue,
  getFileFormValue,
  getNumberFormValue,
  getStringFormValue,
  toBackendDateValue,
  toDateValue,
} from "@/lib/admin/form";
import { UPLOAD_CONSTRAINTS } from "@/lib/constants";
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
    scheduledAtStart: toDateValue(item.scheduledAtStart),
    scheduledAtEnd: toDateValue(item.scheduledAtEnd),
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
        accept: UPLOAD_CONSTRAINTS.sosialisasiImages.accept,
        multiple: true,
        maxFiles: UPLOAD_CONSTRAINTS.sosialisasiImages.maxFiles,
        maxSizeMb: UPLOAD_CONSTRAINTS.sosialisasiImages.maxSizeMb,
        maxTotalSizeMb: UPLOAD_CONSTRAINTS.sosialisasiImages.maxTotalSizeMb,
        required: !editingItem,
        existingFiles: editingItem
          ? buildExistingUploadFiles(editingItem.images, "Gambar")
          : undefined,
        helperText: editingItem
          ? buildUploadFieldHelperText({
              subject: "1 sampai 4 gambar berita",
              mode: "edit",
              optional: true,
              validationLabel: "format gambar",
              maxSizeMb: UPLOAD_CONSTRAINTS.sosialisasiImages.maxSizeMb,
              totalUploadMb: UPLOAD_CONSTRAINTS.sosialisasiImages.maxTotalSizeMb,
            })
          : buildUploadFieldHelperText({
              subject: "1 sampai 4 gambar berita",
              validationLabel: "format gambar",
              maxSizeMb: UPLOAD_CONSTRAINTS.sosialisasiImages.maxSizeMb,
              totalUploadMb: UPLOAD_CONSTRAINTS.sosialisasiImages.maxTotalSizeMb,
            }),
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
      label: "Tanggal Mulai",
      type: "date",
      required: true,
    },
    {
      name: "scheduledAtEnd",
      label: "Tanggal Selesai",
      type: "date",
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
      accept: UPLOAD_CONSTRAINTS.sosialisasiImages.accept,
      multiple: true,
      maxFiles: UPLOAD_CONSTRAINTS.sosialisasiImages.maxFiles,
      maxSizeMb: UPLOAD_CONSTRAINTS.sosialisasiImages.maxSizeMb,
      maxTotalSizeMb: UPLOAD_CONSTRAINTS.sosialisasiImages.maxTotalSizeMb,
      existingFiles: editingItem
        ? buildExistingUploadFiles(editingItem.images, "Gambar")
        : undefined,
      helperText: buildUploadFieldHelperText({
        subject: "1 sampai 4 gambar kegiatan",
        mode: editingItem ? "edit" : "create",
        optional: true,
        validationLabel: "format gambar",
        maxSizeMb: UPLOAD_CONSTRAINTS.sosialisasiImages.maxSizeMb,
        totalUploadMb: UPLOAD_CONSTRAINTS.sosialisasiImages.maxTotalSizeMb,
      }),
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
    formData.set(
      "scheduled_at_start",
      toBackendDateValue(toDateValue(existingItem.scheduledAtStart))
    );
    formData.set(
      "scheduled_at_end",
      toBackendDateValue(toDateValue(existingItem.scheduledAtEnd), "23:59:59")
    );
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

    const existingImages = getExistingFileFormValue(values, "images");
    if (existingImages) {
      formData.set("existing_images", existingImages);
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
    toBackendDateValue(getStringFormValue(values, "scheduledAtStart"))
  );
  formData.set(
    "scheduled_at_end",
    toBackendDateValue(getStringFormValue(values, "scheduledAtEnd"), "23:59:59")
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

  const existingImages = getExistingFileFormValue(values, "images");
  if (existingImages) {
    formData.set("existing_images", existingImages);
  }

  return formData;
}
