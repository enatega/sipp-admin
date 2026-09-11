'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface AppSettingsSkeletonProps {
  /** Whether to show the splash screen card (mobile apps only) */
  showSplashScreen?: boolean;
  /** Whether to show the promotional banner card (customer app only) */
  showPromotionalBanner?: boolean;
}

export default function AppSettingsSkeleton({
  showSplashScreen = true,
  showPromotionalBanner = false,
}: AppSettingsSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* First Row: Global Logo, Splash Screen, Maintenance Message, Promotional Banner */}
      <div
        className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${
          showPromotionalBanner ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        }`}
      >
        {/* Global Logo Card Skeleton */}
        <GlobalLogoSkeleton />

        {/* Splash Screen Card Skeleton (mobile apps only) */}
        {showSplashScreen && <SplashScreenSkeleton />}

        {/* Maintenance Message Card Skeleton */}
        <MaintenanceMessageSkeleton />

        {showPromotionalBanner && <PromotionalBannerSkeleton />}
      </div>

      {/* Theme Color Card Skeleton */}
      <ThemeColorSkeleton />

      {/* Save Button Skeleton */}
      <div className="flex justify-end">
        <Skeleton className="h-12 w-40 rounded-lg" />
      </div>
    </div>
  );
}

function GlobalLogoSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 h-full">
      {/* Title */}
      <Skeleton className="h-5 w-28 mb-4" />

      {/* Label */}
      <Skeleton className="h-4 w-20 mb-2" />

      {/* File upload area */}
      <Skeleton className="h-28 w-full rounded-lg mb-3" />

      {/* Image preview placeholder */}
      <Skeleton className="h-20 w-28 rounded-md mb-2" />

      {/* Helper text */}
      <Skeleton className="h-3 w-48 mt-2" />
    </div>
  );
}

function SplashScreenSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 h-full">
      {/* Title */}
      <Skeleton className="h-5 w-32 mb-4" />

      {/* Label */}
      <Skeleton className="h-4 w-36 mb-2" />

      {/* File upload area */}
      <Skeleton className="h-28 w-full rounded-lg mb-3" />

      {/* Image preview placeholder */}
      <Skeleton className="h-20 w-28 rounded-md mb-2" />

      {/* Helper text */}
      <Skeleton className="h-3 w-52 mt-2" />
    </div>
  );
}

function MaintenanceMessageSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 h-full">
      {/* Title */}
      <Skeleton className="h-5 w-44 mb-4" />

      <div className="space-y-4">
        {/* Maintenance toggle row */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>

        {/* Label */}
        <Skeleton className="h-4 w-32 mb-1" />

        {/* File upload area */}
        <Skeleton className="h-28 w-full rounded-lg" />

        {/* Image preview placeholder */}
        <Skeleton className="h-20 w-28 rounded-md" />

        {/* Helper text lines */}
        <Skeleton className="h-3 w-56" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}

function PromotionalBannerSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 h-full">
      <Skeleton className="mb-4 h-5 w-40" />
      <Skeleton className="mb-2 h-4 w-36" />
      <Skeleton className="mb-3 h-28 w-full rounded-lg" />
      <Skeleton className="mb-2 h-20 w-28 rounded-md" />
      <Skeleton className="h-3 w-60" />
    </div>
  );
}

function ThemeColorSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      {/* Title */}
      <Skeleton className="h-5 w-28 mb-4" />

      {/* Three color inputs in a row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            {/* Color label */}
            <Skeleton className="h-4 w-28" />
            {/* Color input */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 flex-1 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Helper text */}
      <Skeleton className="h-3 w-72 mt-4" />
    </div>
  );
}
