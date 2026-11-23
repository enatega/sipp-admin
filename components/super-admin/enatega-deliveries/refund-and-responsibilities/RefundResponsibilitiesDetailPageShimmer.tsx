export default function RefundResponsibilitiesDetailPageShimmer() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back Button Skeleton */}
      <div className="h-5 w-48 rounded bg-gray-200" />

      {/* Header Skeleton */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="h-8 w-72 rounded bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 rounded-full bg-gray-200" />
          <div className="h-8 w-40 rounded-full bg-gray-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        {/* LEFT SIDE */}
        <div className="space-y-4">
          {/* Reusable Card Skeleton */}
          {[1, 2, 3, 4].map((item) => (
            <section
              key={item}
              className="rounded-xl border bg-white p-4 sm:p-5 space-y-4"
            >
              <div className="h-6 w-48 rounded bg-gray-200" />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((field) => (
                  <div key={field} className="space-y-2">
                    <div className="h-3 w-24 rounded bg-gray-200" />
                    <div className="h-5 w-full rounded bg-gray-200" />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="h-12 w-full rounded-lg bg-gray-200" />
                <div className="h-12 w-full rounded-lg bg-gray-200" />
              </div>
            </section>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <section
              key={item}
              className="rounded-xl border bg-white p-4 sm:p-5 space-y-4"
            >
              <div className="h-6 w-40 rounded bg-gray-200" />

              {[1, 2, 3, 4].map((row) => (
                <div
                  key={row}
                  className="flex items-center justify-between rounded-md px-3 py-3 bg-gray-100"
                >
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="h-4 w-20 rounded bg-gray-200" />
                </div>
              ))}

              <div className="h-12 w-full rounded-lg bg-gray-200" />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
