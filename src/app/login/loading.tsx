/** Loading state untuk /login. */

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[560px] animate-pulse">
        <div className="bg-card/90 rounded-2xl border border-border p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-muted rounded-xl mb-3" />
            <div className="h-6 w-32 bg-muted rounded mb-2" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
          <div className="space-y-4">
            <div className="h-11 bg-muted rounded" />
            <div className="h-11 bg-muted rounded" />
            <div className="h-11 bg-muted rounded" />
            <div className="h-11 bg-muted rounded mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
