'use client';

import * as Yup from 'yup';
import { ApiErrorResponse, DeliveriesZone } from '@/types';
import { Form, Formik } from 'formik';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useGetDeliveriesZoneBoundaries,
  usePutDeliveriesZone,
} from '@/hooks/api/super-admin/general/deliveries-zones';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import InteractiveMap from '@/components/super-admin/general/zones/common/InteractiveMap';
import {
  convertZoneDataToUpdatePayload,
  convertZoneToZoneData,
  DeliveriesZoneFormValues,
} from '../utils';

interface UpdateZoneFormProps {
  onClose: () => void;
  zone: DeliveriesZone;
}

const validationSchema = Yup.object({
  title: Yup.string().required('Zone title is required'),
  description: Yup.string().optional(),
  zoneData: Yup.mixed().required('Please draw a zone on the map'),
});

export default function UpdateZoneForm({
  onClose,
  zone,
}: UpdateZoneFormProps) {
  const { mutateAsync: putZone, isPending: isPuttingZone } =
    usePutDeliveriesZone();
  const {
    data: boundaries,
    isLoading: boundariesLoading,
    isError: boundariesError,
    refetch,
  } = useGetDeliveriesZoneBoundaries();
  const existingZones = useMemo(
    () =>
      boundaries?.flatMap((boundary) => {
        if (boundary.id === zone.id) return [];
        const data = convertZoneToZoneData(boundary);
        return data ? [{ id: boundary.id, title: boundary.title, data }] : [];
      }) ?? [],
    [boundaries, zone.id],
  );

  const initialValues = useMemo<DeliveriesZoneFormValues>(
    () => ({
      title: zone.title,
      description: zone.description,
      zoneData: convertZoneToZoneData(zone),
    }),
    [zone],
  );

  const handleSubmit = async (
    values: DeliveriesZoneFormValues,
    {
      setSubmitting,
      setFieldError,
    }: {
      setSubmitting: (state: boolean) => void;
      setFieldError: (field: string, message: string) => void;
    },
  ) => {
    try {
      const convertedShape = convertZoneDataToUpdatePayload(values.zoneData);

      if (!convertedShape) {
        toast.error('Please draw a valid zone on the map.');
        return;
      }

      await putZone({
        id: zone.id,
        title: values.title,
        description: values.description,
        zoneType: [],
        zoneShape: convertedShape.zoneShape,
        zonePolygon: convertedShape.zonePolygon,
        circleData: convertedShape.circleData,
      });

      toast.success('Zone updated successfully');
      onClose();
    } catch (error) {
      const message = returnErrorMessage(error as ApiErrorResponse);
      if (message.includes('overlaps')) {
        setFieldError('zoneData', message);
      }
      handleApiError(error as ApiErrorResponse);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ errors, isSubmitting, setFieldValue, values }) => (
        <Form className="space-y-4">
          <AppInputField
            id="deliveries_edit_zone_title"
            label="Zone Title"
            name="title"
            placeholder="Enter zone title"
            requiredAsterisk
          />

          <AppInputField
            id="deliveries_edit_zone_description"
            label="Description"
            name="description"
            placeholder="Enter zone description"
          />

          <div className="space-y-2 py-3">
            {boundariesLoading && (
              <p className="text-sm text-muted-foreground">
                Loading existing zone boundaries…
              </p>
            )}
            {boundariesError && (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800"
              >
                <span>
                  Existing zones could not be loaded. Retry before changing this boundary.
                </span>
                <button
                  type="button"
                  className="font-semibold underline underline-offset-2"
                  onClick={() => void refetch()}
                >
                  Try again
                </button>
              </div>
            )}
            <InteractiveMap
              value={values.zoneData}
              onChange={(value) => setFieldValue('zoneData', value)}
              existingZones={existingZones}
            />
            {errors.zoneData ? (
              <div className="text-destructive text-sm">
                {errors.zoneData as string}
              </div>
            ) : null}
          </div>

          <div className="flex justify-end gap-4">
            <AppButton
              type="button"
              variant="secondary"
              onClick={onClose}
              className="px-12"
            >
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              className="px-14"
              isLoading={isSubmitting || isPuttingZone}
              disabled={
                isSubmitting || isPuttingZone || boundariesLoading || boundariesError
              }
            >
              Update Zone
            </AppButton>
          </div>
        </Form>
      )}
    </Formik>
  );
}
