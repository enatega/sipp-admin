'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  fetchZoneBounds,
  useGetZonesSimple,
  zoneBoundsQueryKey,
} from '@/hooks/api/super-admin/general/zones';
import { mapZoneBoundsToZoneData } from '@/lib/store-location-to-zone-mapper';
import { returnErrorMessage } from '@/lib/toast-error';
import { zoneContainsStoreLocation } from '@/lib/zone-contains-location';
import { AppSelect } from '@/components/shared/form/AppSelect';
import type { ExactStoreLocation, ZoneData } from '@/components/shared/maps/InteractiveMap';
import type { ApiErrorResponse } from '@/types';

interface ZoneDeliveryAreaControlsProps {
  zoneId: string;
  onZoneChange: (zoneId: string) => void;
  location: ZoneData | null;
  exactStoreLocation: ExactStoreLocation | null;
  onApply: (area: ZoneData) => void;
  disabled?: boolean;
}

export function ZoneDeliveryAreaControls({
  zoneId,
  onZoneChange,
  location,
  exactStoreLocation,
  onApply,
  disabled = false,
}: ZoneDeliveryAreaControlsProps) {
  const t = useTranslations('storeLocation');
  const queryClient = useQueryClient();
  const { data: zones = [], isLoading, error } = useGetZonesSimple();
  const [isApplying, setIsApplying] = useState(false);
  const [zoneLocationError, setZoneLocationError] = useState(false);
  const [lastAppliedArea, setLastAppliedArea] = useState<ZoneData | null>(null);
  // The zone whose area was last requested. Starts at the saved zone so
  // opening an existing store does not overwrite its custom delivery area.
  const requestedZoneRef = useRef(zoneId);
  const exactStoreLocationRef = useRef(exactStoreLocation);
  const onApplyRef = useRef(onApply);
  useEffect(() => {
    exactStoreLocationRef.current = exactStoreLocation;
    onApplyRef.current = onApply;
  });
  const zoneOptions = useMemo(
    () => zones.map((zone) => ({ key: zone.title, value: zone.id })),
    [zones],
  );

  // Picking a zone (here or in any other field bound to it) applies its area.
  useEffect(() => {
    if (!zoneId || zoneId === requestedZoneRef.current) return;
    requestedZoneRef.current = zoneId;
    const isStale = () => requestedZoneRef.current !== zoneId;

    const applyZoneArea = async () => {
      setIsApplying(true);
      setZoneLocationError(false);
      setLastAppliedArea(null);
      try {
        const bounds = await queryClient.fetchQuery({
          queryKey: zoneBoundsQueryKey(zoneId),
          queryFn: () => fetchZoneBounds(zoneId),
        });
        if (isStale()) return;
        const area = mapZoneBoundsToZoneData(bounds);
        if (!area) {
          toast.error(t('zoneBoundsUnavailable'));
          return;
        }
        const storeLocation = exactStoreLocationRef.current;
        if (storeLocation && !zoneContainsStoreLocation(bounds, storeLocation)) {
          setZoneLocationError(true);
          toast.error(t('storeOutsideZone'));
          return;
        }
        setLastAppliedArea(area);
        onApplyRef.current(area);
        toast.success(t('zoneBoundsApplied'));
      } catch (fetchError) {
        if (!isStale()) toast.error(returnErrorMessage(fetchError as ApiErrorResponse));
      } finally {
        if (!isStale()) setIsApplying(false);
      }
    };
    void applyZoneArea();
  }, [queryClient, t, zoneId]);

  return (
    <section aria-labelledby="admin-store-zone-heading" className="border-y border-gray-200 bg-white py-5">
      <div className="mb-4">
        <h2 id="admin-store-zone-heading" className="text-base font-semibold text-gray-950">
          {t('zoneSectionTitle')}
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-600">
          {t('zoneSectionDescription')}
        </p>
      </div>
      <AppSelect
        name="deliveryAreaZone"
        label={t('zoneLabel')}
        placeholder={t('zonePlaceholder')}
        loadingText={t('loadingZones')}
        emptyText={t('noZones')}
        options={zoneOptions}
        value={zoneId}
        controlled
        onValueChange={onZoneChange}
        loading={isLoading}
        disabled={disabled || isApplying}
        error={error ? t('zoneFetchFailed') : undefined}
        required
      />
      {isApplying && (
        <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <Loader2 aria-hidden className="size-4 animate-spin" />
          {t('applyingZoneBounds')}
        </p>
      )}
      <p className="mt-3 text-sm leading-5 text-gray-600">
        {lastAppliedArea && location === lastAppliedArea
          ? t('zoneBoundsAppliedHint')
          : t('zoneBoundsAutoHint')}
      </p>
      {zoneLocationError && (
        <div role="alert" className="mt-3 flex items-start gap-2 text-sm font-medium text-red-600">
          <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>{t('storeOutsideZone')}</span>
        </div>
      )}
    </section>
  );
}
