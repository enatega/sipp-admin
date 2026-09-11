import { Skeleton } from '@/components/ui/skeleton';

export const UpdateProfileShimmer = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Vendor Information Section */}
      <section className="rounded-xl border bg-white p-4 md:p-6">
        <Skeleton className="h-6 w-40 mb-6 bg-gray-200" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24 bg-gray-200" />
              <Skeleton className="h-10 w-full rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>
      </section>

      {/* Additional Notes Section */}
      <section className="rounded-xl border bg-white p-4 md:p-6">
        <Skeleton className="h-6 w-40 mb-6 bg-gray-200" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 bg-gray-200" />
          <Skeleton className="h-32 w-full rounded-lg bg-gray-100" />
        </div>
      </section>

      {/* KYC Documents Section */}
      <section className="rounded-xl border bg-white p-4 md:p-6">
        <Skeleton className="h-6 w-40 mb-6 bg-gray-200" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32 bg-gray-200" />
              <Skeleton className="h-40 w-full rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>
      </section>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <Skeleton className="h-10 w-24 rounded-[12px] bg-gray-200" />
        <Skeleton className="h-10 w-32 rounded-[12px] bg-gray-300" />
      </div>
    </div>
  );
};
