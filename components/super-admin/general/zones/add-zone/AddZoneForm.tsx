'use client';

import { addZoneSchema } from '@/schemas/zones/add-zone.schema';
import { ApiErrorResponse, PostZonePayload, ZoneType } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { usePostZone } from '@/hooks/api/super-admin/general/zones';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import { MultiSelect } from '@/components/shared/form/AppMultiSelect';
import { InteractiveMapLazy, ZoneData } from '../common/InteractiveMapLazy';
import { ConvertedPayloadShape } from '../edit-zone/UpdateZoneForm';

interface AddZoneFormProps {
  onClose: () => void;
}

interface UpdateZoneFormValues {
  name: string;
  selectedTypes: string[];
  description: string;
  zoneData: ZoneData | null;
}

const initialValues = {
  name: '',
  description: '',
  selectedTypes: [],
  zoneData: null,
};

const convertZoneDataToShapePayload = (
  zoneData: ZoneData | null,
): ConvertedPayloadShape | undefined => {
  if (!zoneData || !zoneData.type) {
    return undefined;
  }

  const { type, center, radius, path } = zoneData;

  if (type === 'marker' && center) {
    return {
      zoneShape: 'Point',
      shape: {
        type: 'Point',
        coordinates: [center.lng, center.lat],
      },
    };
  } else if (type === google.maps.drawing.OverlayType.POLYLINE && path) {
    return {
      zoneShape: 'LineString',
      shape: {
        type: 'LineString',
        coordinates: path.map(({ lat, lng }) => [lng, lat]),
      },
    };
  } else if (type === google.maps.drawing.OverlayType.POLYGON && path) {
    // Ensure the path forms a closed ring
    const coordinates = path.map(({ lat, lng }) => [lng, lat]);

    // Verify first and last points match (closed ring)
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    const isClosed = first[0] === last[0] && first[1] === last[1];

    if (!isClosed) {
      console.error('ERROR: Polygon is not closed! Adding closing point...');
      coordinates.push([first[0], first[1]]);
    }

    console.log('Polygon coordinates before sending:', coordinates);
    console.log('Total coordinate pairs:', coordinates.length);
    console.log(
      'Is closed?',
      coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
        coordinates[0][1] === coordinates[coordinates.length - 1][1],
    );
    console.log(
      'First:',
      coordinates[0],
      'Last:',
      coordinates[coordinates.length - 1],
    );

    // Check if coordinates are in correct order [lng, lat]
    console.log('Sample coordinate (should be [lng, lat]):', coordinates[0]);

    return {
      zoneShape: 'Polygon',
      shape: {
        type: 'Polygon',
        coordinates: [coordinates],
      },
    };
  } else if (
    type === google.maps.drawing.OverlayType.CIRCLE &&
    center &&
    radius !== undefined
  ) {
    return {
      zoneShape: 'Circle',
      circleData: {
        type: 'Circle',
        center: center,
        radius: radius,
      },
    };
  }
  return undefined;
};

export default function AddZoneForm({ onClose }: AddZoneFormProps) {
  const t = useTranslations('zones.form');
  const schema = useTranslations();
  const { mutateAsync: postZone, isPending: isPostingZone } = usePostZone();

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

      const shape = convertZoneDataToShapePayload(values.zoneData);

      if (!shape) {
        toast.error(t('drawZoneError'));
        return;
      }

      const payload: PostZonePayload = {
        title: values.name,
        description: values.description,
        zoneType: mappedZoneTypes,
        ...(shape && {
          shape: shape?.shape,
        }),
        ...(shape?.zoneShape && {
          zoneShape: shape?.zoneShape,
        }),
        ...(shape.circleData && {
          shape: shape.circleData,
        }),
      };

      await postZone(payload);
      toast.success(t('addSuccess'));
      onClose();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    } finally {
      setSubmitting(false);
    }
  };
  const types = ['LO Foods', 'LO Drive', 'LO Hotels', 'LO Tickets'];

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={addZoneSchema(schema)}
      onSubmit={handleSubmit}
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

          <div className="py-3">
            <InteractiveMapLazy
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
              isLoading={isSubmitting || isPostingZone}
              disabled={isSubmitting || isPostingZone}
            >
              {t('add')}
            </AppButton>
          </div>
        </Form>
      )}
    </Formik>
  );
}
