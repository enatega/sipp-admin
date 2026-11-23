import { useGetZoneBounds } from '@/hooks/api/super-admin/general/zones';
import { zoneContainsStoreLocation } from '@/lib/zone-contains-location';
import type { Store } from './types';

/**
 * True when the store pin is known to sit outside the selected zone.
 * Unknown (no zone, no pin, bounds still loading) is treated as no mismatch;
 * the server re-checks on save.
 */
export function useZoneLocationMismatch(
  zoneId: Store['zoneId'],
  exactStoreLocation: Store['exactStoreLocation'],
) {
  const { data: bounds } = useGetZoneBounds(zoneId);
  return Boolean(
    bounds &&
      exactStoreLocation &&
      !zoneContainsStoreLocation(bounds, exactStoreLocation),
  );
}
