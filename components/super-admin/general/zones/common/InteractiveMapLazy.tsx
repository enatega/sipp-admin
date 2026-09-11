'use client';

import dynamic from 'next/dynamic';
import { ShimmerMap } from '@/components/ui/shimmer';

// Lazy load the heavy InteractiveMap component (703 lines)
export const InteractiveMapLazy = dynamic(
  () => import('./InteractiveMap'),
  {
    loading: () => <ShimmerMap className="h-[500px] w-full" />,
    ssr: false,
  }
);

// Re-export types for convenience
export type { ZoneData } from './InteractiveMap';
