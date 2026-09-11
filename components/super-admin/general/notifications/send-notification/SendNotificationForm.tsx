'use client';

import { ApiErrorResponse, SendNotificationPayload, UserType } from '@/types';
import { Form, Formik } from 'formik';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { handleApiError } from '@/lib/toast-error';
import { useSendNotification } from '@/hooks/api/super-admin/general/notifications';
import { useGetZonesSimple } from '@/hooks/api/super-admin/general/zones';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import { MultiSelect } from '@/components/shared/form/AppMultiSelect';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import { useTranslations } from 'next-intl';

interface SendNotificationFormProps {
  onClose: () => void;
}

interface SendNotificationFormValues {
  title: string;
  description: string;
  userTypes: string[];
  imageUrl: string;
  deepLink: string;
  zoneIds: string[];
}

const userTypeOptions = [
  'All',
  'Rider',
  'Customer',
  'Store',
  'Admin',
  'Staff',
  'Vendor',
];

const userTypeMapping: { [key: string]: UserType } = {
  All: 'all',
  Rider: 'rider',
  Customer: 'customer',
  Store: 'store',
  Admin: 'admin',
  Staff: 'staff',
  Vendor: 'vendor',
};

const initialValues: SendNotificationFormValues = {
  title: '',
  description: '',
  userTypes: [],
  imageUrl: '',
  deepLink: '',
  zoneIds: [],
};

const deepLinkRegex = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\/\S+$/;

export default function SendNotificationForm({
  onClose,
}: SendNotificationFormProps) {
  const t = useTranslations('notifications');
  const tForm = useTranslations('notifications.form');
  const { mutateAsync: sendNotification, isPending } = useSendNotification();
  const { data: zonesData, isLoading: isLoadingZones } = useGetZonesSimple();

  const sendNotificationSchema = Yup.object().shape({
    title: Yup.string().required(tForm('validation.titleRequired')),
    description: Yup.string().required(tForm('validation.descriptionRequired')),
    userTypes: Yup.array()
      .min(1, tForm('validation.userTypesMin'))
      .required(tForm('validation.userTypesRequired')),
    imageUrl: Yup.string().url(tForm('validation.imageUrlValid')).optional(),
    deepLink: Yup.string()
      .trim()
      .test(
        'deep-link-format',
        tForm('validation.deepLinkValid'),
        (value) => !value || deepLinkRegex.test(value),
      )
      .optional(),
    zoneIds: Yup.array().optional(),
  });

  const zoneOptions =
    zonesData?.map((zone) => {
      return { key: zone.title, value: zone.id };
    }) || [];

  const handleSubmit = async (values: SendNotificationFormValues) => {
    try {
      const imageUrl = values.imageUrl.trim();
      const deepLink = values.deepLink.trim();

      const payload: SendNotificationPayload = {
        title: values.title,
        description: values.description,
        userTypes: values.userTypes.map(
          (type) => userTypeMapping[type],
        ) as UserType[],
        image_url: imageUrl || undefined,
        deep_link: deepLink || undefined,
        zoneIds: values.zoneIds.length > 0 ? values.zoneIds : undefined,
      };

      const response = await sendNotification(payload);

      toast.success(
        t('sendSuccess', { count: response.sentCount }),
      );

      if (response.failedCount > 0) {
        toast.error(t('sendFailed', { count: response.failedCount }));
      }

      onClose();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={sendNotificationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue }) => (
        <Form className="space-y-4">
          <AppInputField
            label={tForm('title')}
            name="title"
            placeholder={tForm('titlePlaceholder')}
            requiredAsterisk
          />

          <AppTextarea
            label={tForm('description')}
            name="description"
            placeholder={tForm('descriptionPlaceholder')}
            requiredAsterisk
            rows={4}
          />

          <MultiSelect
            label={tForm('sendTo')}
            name="userTypes"
            requiredAsterisk
            options={userTypeOptions}
            selected={values.userTypes}
            onChange={(selected) => setFieldValue('userTypes', selected)}
            placeholder={tForm('sendToPlaceholder')}
            inputContainerClassName="!rounded-[12px]"
          />

          <div className="space-y-2">
            <MultiSelect
              label={tForm('targetZones')}
              id="zone_select"
              name="zoneIds"
              options={zoneOptions}
              selected={values.zoneIds}
              onChange={(selectedValues) =>
                setFieldValue('zoneIds', selectedValues)
              }
              disabled={isLoadingZones}
              inputContainerClassName="!rounded-[12px]"
              placeholder={tForm('targetZonesPlaceholder')}
            />

            <p className="text-xs text-muted-foreground">
              {tForm('targetZonesHelper')}
            </p>
          </div>

          <AppInputField
            label={tForm('imageUrl')}
            name="imageUrl"
            placeholder={tForm('imageUrlPlaceholder')}
          />

          <AppInputField
            label={tForm('deepLink')}
            name="deepLink"
            placeholder={tForm('deepLinkPlaceholder')}
          />

          <div className="flex gap-3 pt-4">
            <AppButton
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isPending}
              className="flex-1"
            >
              {tForm('cancel')}
            </AppButton>
            <AppButton type="submit" isLoading={isPending} className="flex-1">
              {t('send')}
            </AppButton>
          </div>
        </Form>
      )}
    </Formik>
  );
}
