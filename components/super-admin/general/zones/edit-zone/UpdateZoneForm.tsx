'use client';

import { editZoneSchema } from '@/schemas/zones/edit-zone.schema';
import {
  ApiErrorResponse,
  CustomCircle,
  PutZonePayload,
  TZoneShapes,
  Zone,
  ZoneGeoJsonPolygon,
  ZoneType,
} from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { usePutZone } from '@/hooks/api/super-admin/general/zones';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import { MultiSelect } from '@/components/shared/form/AppMultiSelect';
import InteractiveMap, { ZoneData } from '../common/InteractiveMap';
import { reverseTypeMapping } from '../table/Filters';

interface UpdateZoneFormValues {
  name: string;
  selectedTypes: string[];
  description: string;
  zoneData: ZoneData | null;
}

const convertZoneToZoneData = (
  zoneShape: TZoneShapes,
  zonePolygon: ZoneGeoJsonPolygon | null,
  circleData: CustomCircle | null,
): ZoneData | null => {
  if (zoneShape === 'Point' && zonePolygon) {
    const point = zonePolygon as unknown;
    if (
      !Array.isArray(point) ||
      point.length < 2 ||
      typeof point[0] !== 'number' ||
      typeof point[1] !== 'number'
    ) {
      return null;
    }
    return {
      type: 'marker',
      center: { lat: point[1], lng: point[0] },
    };
  } else if (zoneShape === 'LineString' && zonePolygon) {
    const lineString = zonePolygon as unknown;
    if (
      !Array.isArray(lineString) ||
      lineString.length === 0 ||
      !Array.isArray(lineString[0])
    ) {
      return null;
    }
    const path = (lineString as unknown[]).flatMap((pair) => {
      if (
        Array.isArray(pair) &&
        pair.length >= 2 &&
        typeof pair[0] === 'number' &&
        typeof pair[1] === 'number'
      ) {
        const [lng, lat] = pair;
        return [{ lat, lng }];
      }
      return [];
    });
    if (path.length < 2) return null;
    return {
      type: 'polyline',
      path,
    };
  } else if (zoneShape === 'Polygon' && zonePolygon) {
    const polygon = zonePolygon as unknown;
    const extractFirstRing = (input: unknown): unknown[] | null => {
      if (!Array.isArray(input) || input.length === 0) return null;
      const first = input[0];

      if (Array.isArray(first) && typeof first[0] === 'number') {
        return input as unknown[];
      }

      if (Array.isArray(first) && Array.isArray(first[0])) {
        const firstRing = first as unknown;
        if (
          Array.isArray(firstRing) &&
          firstRing.length > 0 &&
          Array.isArray(firstRing[0])
        ) {
          const maybePair = (firstRing as unknown[])[0] as unknown;
          if (Array.isArray(maybePair) && typeof maybePair[0] === 'number') {
            return firstRing as unknown[];
          }

          const maybePolygon = first as unknown[];
          const maybeRing = maybePolygon?.[0];
          if (
            Array.isArray(maybeRing) &&
            maybeRing.length > 0 &&
            Array.isArray(maybeRing[0]) &&
            typeof (maybeRing[0] as unknown[])[0] === 'number'
          ) {
            return maybeRing as unknown[];
          }
        }
      }

      return null;
    };

    const ring = extractFirstRing(polygon);
    if (!ring) return null;
    const path = ring.flatMap((pair) => {
      if (
        Array.isArray(pair) &&
        pair.length >= 2 &&
        typeof pair[0] === 'number' &&
        typeof pair[1] === 'number'
      ) {
        const [lng, lat] = pair;
        return [{ lat, lng }];
      }
      return [];
    });
    if (path.length < 3) return null;
    return {
      type: 'polygon',
      path,
    };
  } else if (zoneShape === 'Circle' && circleData) {
    // Convert to numbers to handle potential string values from the API
    const lat = Number(circleData.center.lat);
    const lng = Number(circleData.center.lng);
    const radius = Number(circleData.radius);

    return {
      type: 'circle',
      center: {
        lat: Number.isFinite(lat) ? lat : 0,
        lng: Number.isFinite(lng) ? lng : 0,
      },
      radius: Number.isFinite(radius) ? radius : 0,
    };
  }
  return null;
};

export interface ConvertedPayloadShape {
  zoneShape: TZoneShapes;
  shape?: {
    type: TZoneShapes;
    coordinates: ZoneGeoJsonPolygon;
  } | null;
  circleData?: CustomCircle | null;
}

const convertZoneDataToPayloadShape = (
  zoneData: ZoneData | null,
): ConvertedPayloadShape | null => {
  if (!zoneData || !zoneData.type) return null;

  if (
    zoneData.type === google.maps.drawing.OverlayType.MARKER &&
    zoneData.center
  ) {
    return {
      zoneShape: 'Point',
      shape: {
        type: 'Point',
        coordinates: [zoneData.center.lng, zoneData.center.lat],
      },
    };
  } else if (
    zoneData.type === google.maps.drawing.OverlayType.POLYLINE &&
    zoneData.path
  ) {
    return {
      zoneShape: 'LineString',
      shape: {
        type: 'LineString',
        coordinates: zoneData.path.map(({ lat, lng }) => [lng, lat]),
      },
    };
  } else if (
    zoneData.type === google.maps.drawing.OverlayType.POLYGON &&
    zoneData.path
  ) {
    // Ensure the path forms a closed ring
    const coordinates = zoneData.path.map(({ lat, lng }) => [lng, lat]);

    // Verify first and last points match (closed ring)
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    const isClosed = first[0] === last[0] && first[1] === last[1];

    console.log('Polygon coordinates before sending (UPDATE):', coordinates);
    console.log('Is closed?', isClosed);
    console.log('First:', first, 'Last:', last);

    return {
      zoneShape: 'Polygon',
      shape: {
        type: 'Polygon',
        coordinates: [coordinates],
      },
    };
  } else if (
    zoneData.type === google.maps.drawing.OverlayType.CIRCLE &&
    zoneData.center &&
    zoneData.radius
  ) {
    return {
      zoneShape: 'Circle',
      circleData: {
        type: 'Circle',
        center: zoneData.center,
        radius: zoneData.radius,
      },
    };
  }
  return null;
};

interface UpdateZoneFormProps {
  onClose: () => void;
  zone: Zone;
}

export default function UpdateZoneForm({ onClose, zone }: UpdateZoneFormProps) {
  const t = useTranslations('zones.form');
  const tSchema = useTranslations();
  const { mutateAsync: putZone, isPending: isPuttingZone } = usePutZone();

  const handleSubmit = async (
    values: UpdateZoneFormValues,
    { setSubmitting }: { setSubmitting: (s: boolean) => void },
  ) => {
    try {
      const zoneTypeMapping: { [key: string]: ZoneType } = {
        'LO Foods': 'food',
        'LO Drive': 'drive',
        'LO Hotels': 'hotel',
        'LO Tickets': 'ticket',
      };

      const mappedZoneTypes: ZoneType[] = values.selectedTypes.map(
        (type: string) => zoneTypeMapping[type],
      );

      const convertedShape = convertZoneDataToPayloadShape(values.zoneData);

      if (!convertedShape) {
        toast.error(t('drawZoneError'));
        return;
      }

      const payload: PutZonePayload = {
        id: zone.id,
        title: values.name,
        description: values.description,
        zoneType: mappedZoneTypes,
        zoneShape: convertedShape.zoneShape,
        ...(convertedShape.shape && {
          zonePolygon: convertedShape.shape,
        }),
        ...(convertedShape.circleData && {
          circleData: convertedShape.circleData,
        }),
      };

      await putZone(payload);
      toast.success(t('updateSuccess'));
      onClose();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    } finally {
      setSubmitting(false);
    }
  };

  const types = ['LO Foods', 'LO Drive', 'LO Hotels', 'LO Tickets'];

  const initialValues = {
    name: zone.title,
    description: zone.description,
    selectedTypes: zone.zoneType.map((type) => reverseTypeMapping[type]),
    zoneData: convertZoneToZoneData(
      zone.zoneShape,
      zone.zonePolygon,
      zone.circleData,
    ),
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={editZoneSchema(tSchema)}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting, setFieldValue, values, touched, errors }) => (
        <Form className="space-y-4">
          <AppInputField
            id="zone_name"
            label={t('name')}
            name="name"
            placeholder={t('namePlaceholder')}
            requiredAsterisk
          />

          <AppInputField
            label={t('description')}
            id="zone_description"
            name="description"
            placeholder={t('descriptionPlaceholder')}
          />

          <div className="relative z-40">
            <MultiSelect
              label={t('type')}
              id="zone_type"
              name="selectedTypes"
              options={types}
              selected={values.selectedTypes}
              onChange={(value) => setFieldValue('selectedTypes', value)}
              inputContainerClassName="!rounded-[12px]"
              requiredAsterisk
            />
          </div>

          <div>
            <InteractiveMap
              value={values.zoneData}
              onChange={(value) => setFieldValue('zoneData', value)}
            />
            {touched.zoneData && errors.zoneData ? (
              <div className="text-destructive text-sm mt-1">
                {errors.zoneData as string}
              </div>
            ) : null}
          </div>

          <div className="flex justify-end mt-5 gap-4">
            <AppButton
              type="button"
              variant="secondary"
              onClick={onClose}
              className="px-12"
            >
              {t('cancel')}
            </AppButton>
            <AppButton
              type="submit"
              className="px-14"
              isLoading={isSubmitting || isPuttingZone}
              disabled={isSubmitting || isPuttingZone}
            >
              {t('update')}
            </AppButton>
          </div>
        </Form>
      )}
    </Formik>
  );
}
