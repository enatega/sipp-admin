import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Mirrors StoreMenuEditor's layout so the page doesn't jump when data lands.
const Bone = ({ className, width }: { className?: string; width?: number }) => (
  <Skeleton className={cn('bg-slate-200/70 motion-reduce:animate-none', className)} style={width ? { width } : undefined} />
);

const ProductRow = () => (
  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
    <Bone className="size-8 rounded-lg" />
    <Bone className="h-8 w-14 rounded-lg" />
    <Bone className="size-11 rounded-lg" />
    <div className="min-w-0 flex-1 space-y-1.5">
      <Bone className="h-3.5 w-2/5" />
      <Bone className="h-3 w-16" />
    </div>
    <Bone className="hidden h-8 w-16 rounded-lg sm:block" />
  </div>
);

const SectionCard = ({ products }: { products: number }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
    <div className="mb-3 flex items-center gap-2">
      <Bone className="size-8 rounded-lg" />
      <Bone className="h-8 w-14 rounded-lg" />
      <Bone className="h-4 w-32 flex-1 sm:max-w-48" />
      <Bone className="h-6 w-20 rounded-full" />
      <Bone className="h-8 w-16 rounded-lg" />
    </div>
    <div className="space-y-2">
      {Array.from({ length: products }, (_, index) => <ProductRow key={index} />)}
    </div>
    <div className="mt-3 flex items-center justify-between">
      <Bone className="h-3 w-24" />
      <Bone className="h-8 w-20 rounded-lg" />
    </div>
  </div>
);

const CategoryCard = ({ sections }: { sections: number[] }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-3 sm:px-4">
      <Bone className="size-9 rounded-xl" />
      <Bone className="h-8 w-14 rounded-lg" />
      <Bone className="size-10 rounded-xl" />
      <div className="min-w-[120px] flex-1 space-y-1.5">
        <Bone className="h-4 w-40" />
        <Bone className="h-3 w-24" />
      </div>
      <Bone className="hidden h-9 w-20 rounded-lg sm:block" />
      <Bone className="size-9 rounded-lg" />
    </div>
    <div className="space-y-3 p-3 sm:p-4">
      {sections.map((products, index) => <SectionCard key={index} products={products} />)}
    </div>
  </div>
);

/** Rows for the "Find & place" product results while a search loads. */
export const CatalogResultsSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <>
    {Array.from({ length: rows }, (_, index) => (
      <div key={index} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
        <Bone className="size-11 rounded-lg" />
        <Bone className="h-3.5 flex-1" />
        <Bone className="h-9 w-16 rounded-lg" />
      </div>
    ))}
  </>
);

export function MenuControlSkeleton({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-[1440px] space-y-5 pb-20" role="status" aria-busy="true" aria-label={label}>
      <span className="sr-only">{label}</span>

      <header className="border-b border-slate-200 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <Bone className="h-3 w-28" />
            <Bone className="h-8 w-56 sm:h-9" />
            <Bone className="h-4 w-[min(32rem,80vw)]" />
          </div>
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
            <Bone className="h-8 w-28 rounded-full" />
            <Bone className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
        <Bone className="h-4 w-28" />
        <Bone className="h-4 w-28" />
        <Bone className="h-4 w-20" />
        <Bone className="ml-auto hidden h-3 w-48 sm:block" />
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-5 sm:px-6">
            <div className="space-y-2">
              <Bone className="h-3 w-14" />
              <Bone className="h-6 w-44" />
              <Bone className="h-4 w-[min(24rem,60vw)]" />
            </div>
            <Bone className="h-9 w-24 shrink-0 rounded-lg" />
          </div>
          <div className="flex gap-2 overflow-hidden border-b border-slate-100 px-4 py-3 sm:px-6">
            {[24, 32, 20, 28, 24].map((width, index) => (
              <Bone key={index} className="h-9 shrink-0 rounded-full" width={width * 4} />
            ))}
          </div>
          <div className="space-y-4 bg-slate-50/50 p-3 sm:p-5">
            <CategoryCard sections={[3, 2]} />
            <CategoryCard sections={[2]} />
          </div>
        </section>

        <aside className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="space-y-2 border-b border-slate-100 bg-sky-50/60 px-5 py-4">
              <Bone className="h-5 w-36" />
              <Bone className="h-3 w-full" />
            </div>
            <div className="space-y-4 p-4 sm:p-5">
              <div className="space-y-2">
                <Bone className="h-3 w-16" />
                <Bone className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-2 rounded-xl border border-sky-100 bg-sky-50/60 p-3">
                <Bone className="h-3 w-20" />
                <Bone className="h-9 w-full rounded-lg" />
              </div>
              <Bone className="h-10 w-full rounded-xl" />
              <div className="space-y-1.5">
                <CatalogResultsSkeleton rows={4} />
              </div>
            </div>
          </div>
          <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Bone className="h-4 w-32" />
                <Bone className="h-3 w-44" />
              </div>
              <Bone className="h-6 w-8 rounded-full" />
            </div>
            <Bone className="h-12 w-full rounded-xl" />
          </div>
        </aside>
      </div>
    </div>
  );
}
