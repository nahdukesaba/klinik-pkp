"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, ImageIcon, PlusCircle, Trash2 } from "lucide-react";

import {
  AdminDataTable,
  AdminFormDialog,
  useAdminAuth,
  type AdminFormValues,
  type TableAction,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { useAdminLocationOptions } from "@/hooks/use-admin-location-options";
import { useToast } from "@/hooks/use-toast";
import { getStringFormValue, validateFileField } from "@/lib/admin/form";
import { canManageContent } from "@/lib/admin/roles";
import {
  AdminApiError,
  adminFetch,
  normalizeAdminFieldErrors,
} from "@/lib/admin-client";
import { QUERY_CONFIG } from "@/lib/constants";
import {
  fetchSosialisasiPage,
  type SosialisasiLocation,
} from "@/services/sosialisasi.service";

import {
  buildSosialisasiDraftValues,
  buildSosialisasiFormData,
  buildSosialisasiFormFields,
  buildSosialisasiViewConfig,
  type SosialisasiAdminView,
} from "./config";

const SOSIALISASI_PAGE_LIMIT = 10;

export function AdminSosialisasiManager({
  view,
}: {
  view: SosialisasiAdminView;
}) {
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SosialisasiLocation | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [draftValues, setDraftValues] = useState<AdminFormValues>({});
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const canManage = canManageContent(user.role);
  const { regionOptions, districtOptions, villageOptions } =
    useAdminLocationOptions(
      getStringFormValue(draftValues, "regionId"),
      getStringFormValue(draftValues, "districtId"),
      formOpen && canManage
    );

  const sosialisasiQuery = useQuery({
    queryKey: ["admin-sosialisasi", view, currentPage],
    queryFn: () =>
      fetchSosialisasiPage({
        page: currentPage,
        perPage: SOSIALISASI_PAGE_LIMIT,
      }),
    staleTime: QUERY_CONFIG.staleTime,
    gcTime: QUERY_CONFIG.gcTime,
    placeholderData: (previousData) => previousData,
    enabled: canManage,
  });

  const formFields = useMemo(
    () =>
      buildSosialisasiFormFields({
        view,
        regionOptions,
        districtOptions,
        villageOptions,
        editingItem,
      }),
    [districtOptions, editingItem, regionOptions, view, villageOptions]
  );

  const initialValues = useMemo(() => {
    if (view === "berita") {
      return {
        images: [],
      };
    }

    return buildSosialisasiDraftValues(editingItem);
  }, [editingItem, view]);

  const viewConfig = useMemo(() => {
    const locations = sosialisasiQuery.data?.locations ?? [];
    const upcomingLocations = sosialisasiQuery.data?.upcomingLocations ?? [];
    const completedLocations = sosialisasiQuery.data?.completedLocations ?? [];
    const kabupatenCount = Math.max(
      (sosialisasiQuery.data?.kabupatenList.length ?? 1) - 1,
      0
    );

    return buildSosialisasiViewConfig({
      view,
      locations,
      upcomingLocations,
      completedLocations,
      kabupatenCount,
    });
  }, [sosialisasiQuery.data, view]);
  const sosialisasiMeta = sosialisasiQuery.data?.meta;

  async function refreshSosialisasi() {
    await queryClient.invalidateQueries({ queryKey: ["admin-sosialisasi"] });
  }

  useEffect(() => {
    if (!canManage || view === "berita" || searchParams.get("create") !== "1") {
      return;
    }

    setEditingItem(null);
    setFormErrors({});
    setDraftValues({});
    setFormOpen(true);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("create");
    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [canManage, pathname, router, searchParams, view]);

  useEffect(() => {
    setCurrentPage(1);
  }, [view]);

  async function handleSubmit(values: AdminFormValues) {
    setIsSaving(true);
    setFormErrors({});

    try {
      const imageValidationError = validateFileField(values, {
        field: "images",
        label: view === "berita" ? "Gambar berita" : "Gambar kegiatan",
        maxFiles: 3,
        maxSizeMb: 2,
        required: view === "berita",
        acceptImagesOnly: true,
      });

      if (imageValidationError) {
        setFormErrors({ images: imageValidationError });
        toast({
          title: "Upload belum valid",
          description: imageValidationError,
          variant: "destructive",
        });
        return;
      }

      const formData = buildSosialisasiFormData(values, {
        view,
        existingItem: editingItem,
      });

      if (editingItem) {
        await adminFetch(`/api/admin/resources/sosialisasi/${editingItem.id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        await adminFetch("/api/admin/resources/sosialisasi", {
          method: "POST",
          body: formData,
        });
      }

      await refreshSosialisasi();
      setFormOpen(false);
      setEditingItem(null);
      setDraftValues({});
      toast({
        title:
          view === "berita"
            ? "Gambar berita diperbarui"
            : editingItem
              ? `${viewConfig.dialogTitle} diperbarui`
              : `${viewConfig.dialogTitle} ditambahkan`,
        description:
          view === "berita"
            ? "Dokumentasi kegiatan berhasil diunggah."
            : "Perubahan data sosialisasi berhasil disimpan.",
      });
    } catch (error) {
      if (error instanceof AdminApiError) {
        setFormErrors(normalizeAdminFieldErrors(error.details));
      }

      toast({
        title:
          view === "berita"
            ? "Gagal mengunggah gambar berita"
            : "Gagal menyimpan data sosialisasi",
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menyimpan data sosialisasi.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(item: SosialisasiLocation) {
    if (!window.confirm(`Hapus kegiatan "${item.name}"?`)) {
      return;
    }

    try {
      await adminFetch(`/api/admin/resources/sosialisasi/${item.id}`, {
        method: "DELETE",
      });
      await refreshSosialisasi();
      toast({
        title: "Kegiatan dihapus",
        description: "Data sosialisasi berhasil dihapus.",
      });
    } catch (error) {
      toast({
        title: "Gagal menghapus kegiatan",
        description:
          error instanceof Error ? error.message : "Permintaan tidak berhasil.",
        variant: "destructive",
      });
    }
  }

  const actions: TableAction<SosialisasiLocation>[] =
    view === "berita"
      ? [
          {
            label: "Upload Gambar",
            icon: <ImageIcon className="h-4 w-4" />,
            onClick: (item) => {
              setEditingItem(item);
              setFormErrors({});
              setDraftValues({ images: [] });
              setFormOpen(true);
            },
          },
        ]
      : [
          {
            label: "Edit",
            icon: <ImageIcon className="h-4 w-4" />,
            onClick: (item) => {
              setEditingItem(item);
              setFormErrors({});
              setDraftValues(buildSosialisasiDraftValues(item) ?? {});
              setFormOpen(true);
            },
          },
          {
            label: "Hapus",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: handleDelete,
            variant: "destructive",
          },
        ];

  if (!canManage) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">
          Akses dibatasi
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          Modul sosialisasi hanya dapat dikelola oleh admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold text-foreground">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {viewConfig.icon}
            </span>
            {viewConfig.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {view !== "berita" ? (
            <>
              <Link
                href="/sosialisasi-klinik-pkp"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Lihat di halaman publik
              </Link>
              <Button
                onClick={() => {
                  setEditingItem(null);
                  setFormErrors({});
                  setDraftValues({});
                  setFormOpen(true);
                }}
                className="gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                {viewConfig.addLabel}
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {viewConfig.stats.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <p className="text-2xl font-semibold text-foreground">{item.value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {view === "berita" && (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Pilih kegiatan selesai lalu unggah maksimal 3 gambar. Data kegiatan lain tidak perlu diisi ulang.
        </div>
      )}

      {sosialisasiQuery.error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Gagal memuat data: {sosialisasiQuery.error.message}
        </div>
      )}

      <AdminDataTable<SosialisasiLocation>
        columns={viewConfig.columns}
        data={viewConfig.data}
        searchFields={viewConfig.searchFields}
        searchPlaceholder={viewConfig.searchPlaceholder}
        actions={actions}
        isLoading={sosialisasiQuery.isLoading}
        emptyMessage={viewConfig.emptyMessage}
        pagination={{
          currentPage: sosialisasiMeta?.page ?? currentPage,
          totalPages: sosialisasiMeta?.totalPages ?? 1,
          totalItems: sosialisasiMeta?.totalRecords ?? viewConfig.data.length,
          pageSize: sosialisasiMeta?.limit ?? SOSIALISASI_PAGE_LIMIT,
          onPageChange: setCurrentPage,
        }}
      />

      <AdminFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditingItem(null);
            setFormErrors({});
            setDraftValues({});
          }
        }}
        title={
          view === "berita"
            ? "Upload Gambar Berita"
            : editingItem
              ? `Edit ${viewConfig.dialogTitle}`
              : `Tambah ${viewConfig.dialogTitle}`
        }
        description={
          view === "berita"
            ? "Unggah 1 sampai 3 gambar. Maksimal 2 MB per gambar."
            : "Lengkapi data kegiatan dan dokumentasi seperlunya."
        }
        fields={formFields}
        initialValues={initialValues}
        onValuesChange={setDraftValues}
        onSubmit={handleSubmit}
        submitLabel={
          view === "berita"
            ? "Unggah Gambar"
            : editingItem
              ? "Simpan Perubahan"
              : viewConfig.addLabel
        }
        isLoading={isSaving}
        errors={formErrors}
      />
    </div>
  );
}
