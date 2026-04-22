/* eslint-disable @next/next/no-img-element */
import { getInstagramPreview } from "@/lib/instagram";

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm8.9 1.15a.95.95 0 1 1 0 1.9.95.95 0 0 1 0-1.9ZM12 6.3A5.7 5.7 0 1 1 6.3 12 5.7 5.7 0 0 1 12 6.3Zm0 1.5A4.2 4.2 0 1 0 16.2 12 4.2 4.2 0 0 0 12 7.8Z" />
    </svg>
  );
}

export function InstagramSectionSkeleton() {
  return (
    <section className="relative overflow-hidden bg-[#071f24] py-12 lg:py-16">
      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="mx-auto mb-8 h-10 w-72 animate-pulse rounded bg-white/10" />

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.28)]">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 animate-pulse rounded-full bg-slate-200 sm:h-16 sm:w-16" />
              <div className="space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-52 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square animate-pulse bg-slate-100"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function InstagramSection() {
  const { profile, posts } = await getInstagramPreview(3);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-[#071f24] py-12 lg:py-16">
      <div className="absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,91,115,0.4),_transparent_55%)]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <h2 className="mb-8 text-center text-3xl font-bold text-white lg:text-4xl">
          Ikuti Kami di Instagram
        </h2>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.28)]">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex min-w-0 items-center gap-4">
              <img
                src={profile.profilePictureUrl}
                alt={`Foto profil ${profile.fullName}`}
                className="h-14 w-14 rounded-full border border-slate-200 object-cover shadow-sm sm:h-16 sm:w-16"
                loading="lazy"
                decoding="async"
                referrerPolicy="strict-origin-when-cross-origin"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                  {profile.username}
                </p>
                <p className="truncate text-sm text-slate-700">
                  {profile.fullName}
                </p>
              </div>
            </div>

            <a
              href={profile.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-[#e1306c] transition-transform hover:scale-105 hover:border-[#e1306c]/30"
              aria-label="Buka profil Instagram BP3KP Sumatera II"
            >
              <InstagramIcon />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <a
                key={post.id}
                href={post.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-slate-100"
                aria-label={`Buka postingan Instagram ${index + 1}`}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={`Postingan Instagram ${index + 1} BP3KP Sumatera II`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
