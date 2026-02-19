/**
 * MapLegend — Komponen legenda peta yang float di atas map.
 *
 * Menampilkan daftar status/warna sebagai legenda peta.
 * Posisi absolute di pojok kanan bawah map container.
 *
 * @example
 * ```tsx
 * <MapLegend
 *   title="Status Penerimaan"
 *   labels={{ completed: "Selesai", pending: "Menunggu" }}
 *   colors={{ completed: { fill: "#22c55e" }, pending: { fill: "#eab308" } }}
 * />
 * ```
 */

interface MapLegendProps {
  /** Judul legenda */
  title: string;
  /** Map dari key status ke label display */
  labels: Record<string, string>;
  /** Map dari key status ke objek warna (minimal { fill: string }) */
  colors: Record<string, { fill: string; stroke?: string }>;
  /** CSS class tambahan */
  className?: string;
}

export function MapLegend({
  title,
  labels,
  colors,
  className = "",
}: MapLegendProps) {
  return (
    <div
      className={`absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-lg p-3 sm:p-4 z-[500] max-w-[180px] sm:max-w-[200px] pointer-events-auto ${className}`}
    >
      <span className="text-xs font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-primary rounded-full" />
        {title}
      </span>
      <div className="space-y-1.5 sm:space-y-2">
        {Object.entries(labels).map(([key, label]) => {
          const color = colors[key];
          if (!color) return null;
          return (
            <div key={key} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 rounded border border-white/50 shadow-sm flex-shrink-0"
                style={{ backgroundColor: color.fill }}
              />
              <span className="text-foreground font-medium">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
