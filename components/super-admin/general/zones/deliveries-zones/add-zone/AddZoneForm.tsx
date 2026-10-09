'use client';

import * as Yup from 'yup';
import { ApiErrorResponse } from '@/types';
import { Form, Formik } from 'formik';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useGetDeliveriesZoneBoundaries,
  usePostDeliveriesZone,
} from '@/hooks/api/super-admin/general/deliveries-zones';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import InteractiveMap from '@/components/super-admin/general/zones/common/InteractiveMap';
import {
  convertZoneDataToCreateShape,
  convertZoneToZoneData,
  DeliveriesZoneFormValues,
} from '../utils';

interface AddZoneFormProps {
  onClose: () => void;
}

const initialValues: DeliveriesZoneFormValues = {
  title: '',
  description: '',
  zoneData: null,
};

const validationSchema = Yup.object({
  title: Yup.string().required('Zone title is required'),
  description: Yup.string().optional(),
  zoneData: Yup.mixed().required('Please draw a zone on the map'),
});

export default function AddZoneForm({ onClose }: AddZoneFormProps) {
  const { mutateAsync: postZone, isPending: isPostingZone } =
    usePostDeliveriesZone();
  const {
    data: boundaries,
    isLoading: boundariesLoading,
    isError: boundariesError,
    refetch,
  } = useGetDeliveriesZoneBoundaries();
  const existingZones = useMemo(
    () =>
      boundaries?.flatMap((zone) => {
        const data = convertZoneToZoneData(zone);
        return data ? [{ id: zone.id, title: zone.title, data }] : [];
      }) ?? [],
    [boundaries],
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
      const shape = convertZoneDataToCreateShape(values.zoneData);

      if (!shape) {
        toast.error('Please draw a valid zone on the map.');
        return;
      }

      await postZone({
        title: values.title,
        description: values.description,
        zoneType: [],
        shape,
      });

      toast.success('Zone created successfully');
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
    >
      {({ errors, isSubmitting, setFieldValue, values }) => (
        <Form className="space-y-4">
          <AppInputField
            id="deliveries_zone_title"
            label="Zone Title"
            name="title"
            placeholder="Enter zone title"
            requiredAsterisk
          />

          <AppInputField
            id="deliveries_zone_description"
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
                  Existing zones could not be loaded. Retry before drawing a new zone.
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
              isLoading={isSubmitting || isPostingZone}
              disabled={
                isSubmitting || isPostingZone || boundariesLoading || boundariesError
              }
            >
              Add Zone
            </AppButton>
          </div>
        </Form>
      )}
    </Formik>
  );
}
