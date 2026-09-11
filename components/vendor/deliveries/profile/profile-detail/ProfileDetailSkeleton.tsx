import { Skeleton } from '@/components/ui/skeleton';

export function ProfileDetailSkeleton() {
  return (
    <div className="rounded-xl border bg-white">
      <div className="flex items-center gap-4 bg-mute/10 p-4 rounded-tl-lg rounded-tr-lg">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-8 p-4 md:p-6 h-[calc(100vh-200px)] overflow-y-auto">
        <section>
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </section>
        <section>
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
