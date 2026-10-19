'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, MapPinned } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { useGetZoneBounds, useGetZonesSimple } from '@/hooks/api/super-admin/general/zones';
import { mapZoneBoundsToZoneData } from '@/lib/store-location-to-zone-mapper';
import { returnErrorMessage } from '@/lib/toast-error';
import { zoneContainsStoreLocation } from '@/lib/zone-contains-location';
import { AppButton } from '@/components/shared/AppButton';
import { AppSelect } from '@/components/shared/form/AppSelect';
import type { ExactStoreLocation, ZoneData } from '@/components/shared/maps/InteractiveMap';

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
  const { data: zones = [], isLoading, error } = useGetZonesSimple();
  const { refetch, isFetching } = useGetZoneBounds(zoneId, { enabled: false });
  const [zoneLocationError, setZoneLocationError] = useState(false);
  const [lastAppliedArea, setLastAppliedArea] = useState<ZoneData | null>(null);
  const zoneOptions = useMemo(
    () => zones.map((zone) => ({ key: zone.title, value: zone.id })),
    [zones],
  );

  const handleApply = async () => {
    if (!zoneId) {
      toast.error(t('zoneRequired'));
      return;
    }

    const result = await refetch();
    if (result.error) {
      toast.error(returnErrorMessage(result.error));
      return;
    }
    const area = result.data ? mapZoneBoundsToZoneData(result.data) : null;
    if (!area || !result.data) {
      toast.error(t('zoneBoundsUnavailable'));
      return;
    }
    if (
      exactStoreLocation &&
      !zoneContainsStoreLocation(result.data, exactStoreLocation)
    ) {
      setZoneLocationError(true);
      toast.error(t('storeOutsideZone'));
      return;
    }

    setZoneLocationError(false);
    setLastAppliedArea(area);
    onApply(area);
    toast.success(t('zoneBoundsApplied'));
  };

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
      <div className="grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <AppSelect
          name="deliveryAreaZone"
          label={t('zoneLabel')}
          placeholder={t('zonePlaceholder')}
          loadingText={t('loadingZones')}
          emptyText={t('noZones')}
          options={zoneOptions}
          value={zoneId}
          controlled
          onValueChange={(value) => {
            onZoneChange(value);
            setZoneLocationError(false);
            setLastAppliedArea(null);
          }}
          loading={isLoading}
          disabled={disabled || isFetching}
          error={error ? t('zoneFetchFailed') : undefined}
          required
        />
        <AppButton
          type="button"
          variant="secondary"
          className="md:mb-px"
          leftIcon={<MapPinned className="size-4" />}
          disabled={!zoneId || isLoading || disabled || isFetching}
          isLoading={isFetching}
          onClick={handleApply}
        >
          {isFetching ? t('applyingZoneBounds') : t('useZoneBounds')}
        </AppButton>
      </div>
      <p className="mt-3 text-sm leading-5 text-gray-600">
        {lastAppliedArea && location === lastAppliedArea
          ? t('zoneBoundsAppliedHint')
          : t('zoneBoundsHint')}
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
