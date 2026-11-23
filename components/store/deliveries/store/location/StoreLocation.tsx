'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ApiErrorResponse } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, MapPinned } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { UpdateStoreDataPayload } from '@/types/api/store/deliveries/profile';
import {
  mapStoreLocationToZoneData,
  mapZoneBoundsToZoneData,
} from '@/lib/store-location-to-zone-mapper';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { zoneContainsStoreLocation } from '@/lib/zone-contains-location';
import { useUpdateStoreData } from '@/hooks/api/store/deliveries/profile';
import { useGetStoreLocation } from '@/hooks/api/store/deliveries/store-location';
import {
  useGetZoneBounds,
  useGetZonesSimple,
} from '@/hooks/api/super-admin/general/zones';
import { AppButton } from '@/components/shared/AppButton';
import CardShimmer from '@/components/shared/CardShimmer';
import DisplayError from '@/components/shared/DisplayError';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { Heading } from '@/components/shared/Heading';
import InteractiveMap, {
  AddressZoneShape,
  ExactStoreLocation,
  ZoneData,
} from '@/components/shared/maps/InteractiveMap';

export default function StoreLocation() {
  const t = useTranslations('storeLocation');
  const params = useParams();
  const storeId = params?.storeId as string;
  const queryClient = useQueryClient();
  const { mutateAsync: updateStore, isPending } = useUpdateStoreData({
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['store-location', storeId],
      });
    },
  });
  const { data, isLoading, error, isError } = useGetStoreLocation(storeId);
  const {
    data: zones = [],
    isLoading: isLoadingZones,
    error: zonesError,
  } = useGetZonesSimple();

  // Compute derived location data from API
  const initialLocationData = useMemo(() => {
    if (!data) return null;
    return mapStoreLocationToZoneData(data);
  }, [data]);

  const initialExactStoreLocation = useMemo<ExactStoreLocation | null>(() => {
    if (!data) return null;

    const toNumber = (value: unknown): number | null => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const latitude = toNumber(data.store_location.latitude);
    const longitude = toNumber(data.store_location.longitude);

    if (latitude === null || longitude === null) return null;

    return { latitude, longitude };
  }, [data]);

  // Local state for interactive map edits
  const [locationDraft, setLocationDraft] = useState<
    ZoneData | null | undefined
  >(undefined);
  const [exactStoreLocationDraft, setExactStoreLocationDraft] = useState<
    ExactStoreLocation | null | undefined
  >(undefined);
  const [selectedZoneDraft, setSelectedZoneDraft] = useState<
    string | undefined
  >(undefined);
  const [zoneBoundsApplied, setZoneBoundsApplied] = useState(false);
  const [zoneLocationError, setZoneLocationError] = useState(false);

  const locationData =
    locationDraft === undefined ? initialLocationData : locationDraft;
  const exactStoreLocation =
    exactStoreLocationDraft === undefined
      ? initialExactStoreLocation
      : exactStoreLocationDraft;
  const selectedZoneId =
    selectedZoneDraft === undefined ? data?.zone_id || '' : selectedZoneDraft;
  const { refetch: fetchSelectedZoneBounds, isFetching: isFetchingZoneBounds } =
    useGetZoneBounds(selectedZoneId, { enabled: false });

  const zoneOptions = useMemo(
    () => zones.map((zone) => ({ key: zone.title, value: zone.id })),
    [zones],
  );

  const getValidatedSelectedZone = async () => {
    if (!selectedZoneId) {
      toast.error(t('zoneRequired'));
      return null;
    }
    if (!exactStoreLocation) {
      toast.error(t('exactStoreLocationRequired'));
      return null;
    }

    const result = await fetchSelectedZoneBounds();
    if (result.error) {
      toast.error(returnErrorMessage(result.error));
      return null;
    }

    const zoneBounds = result.data
      ? mapZoneBoundsToZoneData(result.data)
      : null;

    if (!result.data || !zoneBounds) {
      toast.error(t('zoneBoundsUnavailable'));
      return null;
    }

    if (!zoneContainsStoreLocation(result.data, exactStoreLocation)) {
      setZoneLocationError(true);
      toast.error(t('storeOutsideZone'));
      return null;
    }

    setZoneLocationError(false);
    return zoneBounds;
  };

  const handleUseZoneBounds = async () => {
    const zoneBounds = await getValidatedSelectedZone();
    if (!zoneBounds) return;

    setLocationDraft(zoneBounds);
    setZoneBoundsApplied(true);
    toast.success(t('zoneBoundsApplied'));
  };

  const handleSave = async () => {
    if (!locationData) return;
    if (!selectedZoneId) {
      toast.error(t('zoneRequired'));
      return;
    }
    if (!exactStoreLocation) {
      toast.error(t('exactStoreLocationRequired'));
      return;
    }
    if (!(await getValidatedSelectedZone())) return;

    let shape: AddressZoneShape | null = null;

    switch (locationData.type) {
      case 'circle':
        if (locationData.center && locationData.radius) {
          shape = {
            type: 'Circle',
            center: locationData.center,
            radius: locationData.radius,
          };
        }
        break;

      case 'polygon':
        if (locationData.path && locationData.path.length >= 3) {
          const path = [...locationData.path];
          const first = path[0];
          const last = path[path.length - 1];
          if (first.lat !== last.lat || first.lng !== last.lng) {
            path.push(first);
          }
          shape = {
            type: 'Polygon',
            coordinates: [path.map((p) => [p.lng, p.lat])],
          };
        }
        break;

      case 'polyline':
        if (locationData.path && locationData.path.length >= 2) {
          shape = {
            type: 'LineString',
            coordinates: locationData.path.map((p) => [p.lng, p.lat]),
          };
        }
        break;

      case 'marker':
        if (locationData.center) {
          shape = {
            type: 'Point',
            coordinates: [locationData.center.lng, locationData.center.lat],
          };
        }
        break;

      default:
        console.error('Unsupported shape type:', locationData.type);
        return;
    }

    if (!shape) {
      console.error('No valid shape to send to API');
      return;
    }

    const payload: UpdateStoreDataPayload = {
      storeId: storeId,
      address_zone: JSON.stringify({ shape }),
      latitude: exactStoreLocation.latitude,
      longitude: exactStoreLocation.longitude,
      zoneId: selectedZoneId,
    };

    try {
      const response = await updateStore(payload);
      toast.success(response.message || t('saveSuccess'));
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handleCancel = () => {
    setLocationDraft(undefined);
    setExactStoreLocationDraft(undefined);
    setSelectedZoneDraft(undefined);
    setZoneBoundsApplied(false);
    setZoneLocationError(false);
  };

  return (
    <div>
      <div className="mb-6">
        <Heading title={t('title')} />
      </div>

      {isLoading ? (
        <CardShimmer />
      ) : isError ? (
        <DisplayError
          title={t('fetchFailedTitle')}
          message={returnErrorMessage(error)}
          variant="error"
        />
      ) : (
        <div className="xl:max-w-2/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <InteractiveMap
                value={locationData}
                onChange={(value) => {
                  setLocationDraft(value);
                  setZoneBoundsApplied(false);
                }}
                exactStoreLocation={exactStoreLocation}
                onExactStoreLocationChange={(value) => {
                  setExactStoreLocationDraft(value);
                  setZoneLocationError(false);
                }}
                exactStoreLocationLabel={t('exactStoreLocationLabel')}
                exactStoreLocationDescription={t(
                  'exactStoreLocationDescription',
                )}
                exactStoreLocationLatitudeLabel={t(
                  'exactStoreLocationLatitude',
                )}
                exactStoreLocationLongitudeLabel={t(
                  'exactStoreLocationLongitude',
                )}
                hideZoomControls
                searchSelectsMarker
                betweenMapAndExactLocation={
                  <section
                    aria-labelledby="store-zone-heading"
                    className="border-y border-gray-200 bg-white py-5"
                  >
                    <div className="mb-4">
                      <h2
                        id="store-zone-heading"
                        className="text-base font-semibold text-gray-950"
                      >
                        {t('zoneSectionTitle')}
                      </h2>
                      <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-600">
                        {t('zoneSectionDescription')}
                      </p>
                    </div>

                    <div className="grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                      <AppSelect
                        name="storeZone"
                        label={t('zoneLabel')}
                        placeholder={t('zonePlaceholder')}
                        loadingText={t('loadingZones')}
                        emptyText={t('noZones')}
                        options={zoneOptions}
                        value={selectedZoneId}
                        onValueChange={(value) => {
                          setSelectedZoneDraft(value);
                          setZoneBoundsApplied(false);
                          setZoneLocationError(false);
                        }}
                        loading={isLoadingZones}
                        disabled={isPending || isFetchingZoneBounds}
                        error={zonesError ? t('zoneFetchFailed') : undefined}
                        required
                      />

                      <AppButton
                        variant="secondary"
                        className="md:mb-px"
                        leftIcon={<MapPinned className="size-4" />}
                        disabled={
                          !selectedZoneId || isLoadingZones || isPending
                        }
                        isLoading={isFetchingZoneBounds}
                        onClick={handleUseZoneBounds}
                      >
                        {isFetchingZoneBounds
                          ? t('applyingZoneBounds')
                          : t('useZoneBounds')}
                      </AppButton>
                    </div>

                    <p className="mt-3 text-sm leading-5 text-gray-600">
                      {zoneBoundsApplied
                        ? t('zoneBoundsAppliedHint')
                        : t('zoneBoundsHint')}
                    </p>

                    {zoneLocationError && (
                      <div
                        role="alert"
                        className="mt-3 flex items-start gap-2 text-sm font-medium text-red-600"
                      >
                        <AlertCircle
                          aria-hidden
                          className="mt-0.5 size-4 shrink-0"
                        />
                        <span>{t('storeOutsideZone')}</span>
                      </div>
                    )}
                  </section>
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <AppButton
              variant="secondary"
              disabled={isPending || isFetchingZoneBounds}
              onClick={handleCancel}
            >
              {t('cancel')}
            </AppButton>

            <AppButton
              isLoading={isPending}
              disabled={
                !selectedZoneId ||
                !locationData ||
                !exactStoreLocation ||
                isFetchingZoneBounds ||
                isPending
              }
              onClick={handleSave}
            >
              {t('save')}
            </AppButton>
          </div>
        </div>
      )}
    </div>
  );
}
