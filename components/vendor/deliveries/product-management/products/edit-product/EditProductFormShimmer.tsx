'use client';

export default function EditProductFormShimmer() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-8 space-y-6">
        <div className="space-y-3">
          <div className="h-8 w-56 rounded bg-accent animate-pulse" />
          <div className="h-4 w-80 rounded bg-accent animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 w-24 rounded bg-accent animate-pulse" />
              <div className="h-11 w-full rounded-xl bg-accent animate-pulse" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-4 w-28 rounded bg-accent animate-pulse" />
          <div className="h-28 w-full rounded-xl bg-accent animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-28 rounded bg-accent animate-pulse" />
          <div className="h-40 w-full rounded-xl bg-accent animate-pulse" />
        </div>
      </div>
      <div className="rounded-lg border bg-white p-6 space-y-4">
        <div className="h-6 w-36 rounded bg-accent animate-pulse" />
        <div className="h-20 w-full rounded-xl bg-accent animate-pulse" />
      </div>
      <div className="rounded-lg border bg-white p-6 space-y-4">
        <div className="h-6 w-36 rounded bg-accent animate-pulse" />
        <div className="h-20 w-full rounded-xl bg-accent animate-pulse" />
      </div>
    </div>
  );
}
