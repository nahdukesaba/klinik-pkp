/** Loading state untuk /informasi/[slug]. */

export default function InformasiSlugLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-16 bg-muted" />
      <div className="container mx-auto px-4 py-24">
        <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4" />
        <div className="h-4 bg-muted rounded w-2/3 mx-auto mb-12" />
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
