'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ApiErrorResponse } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { UpdateStoreDataPayload } from '@/types/api/store/deliveries/profile';
import { mapStoreLocationToZoneData } from '@/lib/store-location-to-zone-mapper';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { useUpdateStoreData } from '@/hooks/api/store/deliveries/profile';
import { useGetStoreLocation } from '@/hooks/api/store/deliveries/store-location';
import { AppButton } from '@/components/shared/AppButton';
import CardShimmer from '@/components/shared/CardShimmer';
import DisplayError from '@/components/shared/DisplayError';
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

  const locationData =
    locationDraft === undefined ? initialLocationData : locationDraft;
  const exactStoreLocation =
    exactStoreLocationDraft === undefined
      ? initialExactStoreLocation
      : exactStoreLocationDraft;

  const handleSave = async () => {
    if (!locationData) return;
    if (!exactStoreLocation) {
      toast.error(t('exactStoreLocationRequired'));
      return;
    }

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
                onChange={setLocationDraft}
                exactStoreLocation={exactStoreLocation}
                onExactStoreLocationChange={setExactStoreLocationDraft}
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
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <AppButton variant="secondary" onClick={handleCancel}>
              {t('cancel')}
            </AppButton>

            <AppButton
              disabled={!locationData || !exactStoreLocation || isPending}
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
