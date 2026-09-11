'use client';

import * as Yup from 'yup';
import { ApiErrorResponse, DeliveriesZone } from '@/types';
import { Form, Formik } from 'formik';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import { usePutDeliveriesZone } from '@/hooks/api/super-admin/general/deliveries-zones';
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

  const initialValues: DeliveriesZoneFormValues = {
    title: zone.title,
    description: zone.description,
    zoneData: convertZoneToZoneData(zone),
  };

  const handleSubmit = async (
    values: DeliveriesZoneFormValues,
    { setSubmitting }: { setSubmitting: (state: boolean) => void },
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
      {({ errors, isSubmitting, setFieldValue, touched, values }) => (
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
            <InteractiveMap
              value={values.zoneData}
              onChange={(value) => setFieldValue('zoneData', value)}
            />
            {touched.zoneData && errors.zoneData ? (
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
              disabled={isSubmitting || isPuttingZone}
            >
              Update Zone
            </AppButton>
          </div>
        </Form>
      )}
    </Formik>
  );
}
