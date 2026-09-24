'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  EditRiderFormSchema,
  EditRiderFormValues,
} from '@/schemas/enatega-deliveries/riders/rider-form';
import { ApiErrorResponse } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useGetDeliveryRider,
  useGetVehicleTypes,
  useUpdateDeliveryRider,
} from '@/hooks/api/super-admin/enatega-deliveries/riders';
import { useGetZonesSimple } from '@/hooks/api/super-admin/general/zones';
import { AppButton } from '@/components/shared/AppButton';
import DisplayError from '@/components/shared/DisplayError';
import { FormErrorDisplay } from '@/components/shared/FormErrorDisplay';
import { CodLimitSettingsSection } from './CodLimitSettingsSection';
import { DocumentsSection } from './DocumentsSection';
import { EditRiderFormShimmer } from './EditRiderFormShimmer';
import { PersonalInformationSection } from './PersonalInformationSection';
import { RiderCommissionSection } from './RiderCommissionSection';
import { VehicleRequirementsSection } from './VehicleRequirementSection';

export const EditRiderForm = () => {
  const router = useRouter();
  const params = useParams();
  const riderId = params.id as string;
  const tEdit = useTranslations('driverManagement.editDriver');
  const tTable = useTranslations('driverManagement.driversTable');
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    data: riderData,
    isLoading,
    isError,
    error,
  } = useGetDeliveryRider(riderId);
  const { mutateAsync: updateRider, isPending: isUpdating } =
    useUpdateDeliveryRider();

  const { data: zones } = useGetZonesSimple();

  const { data: vehicleTypesData } = useGetVehicleTypes();

  const initialValues: EditRiderFormValues = useMemo(() => {
    const rider = riderData?.rider;
    const riderUnknown = (rider as Record<string, unknown>) || {};
    const codSettings =
      (riderUnknown.cod_limit_settings as Record<string, unknown>) || {};

    const codLimitEnabledRaw =
      codSettings.enabled ?? riderUnknown.cod_limit_enabled;
    const codLimitAmountRaw =
      codSettings.amount ?? riderUnknown.cod_limit_amount;
    const codWarningThresholdRaw =
      codSettings.warning_threshold ?? riderUnknown.cod_warning_threshold;
    const codSettlementCycleRaw =
      codSettings.auto_settlement_cycle ??
      riderUnknown.cod_auto_settlement_cycle;
    const codAllowOnlinePaymentsRaw =
      codSettings.allow_online_payments_when_blocked ??
      riderUnknown.cod_allow_online_payments_when_blocked;

    return {
      name: rider?.userProfile?.user?.name || '',
      email: rider?.userProfile?.user?.email || '',
      password: '',
      confirm_password: '',
      phone: rider?.userProfile?.user?.phone || '',
      zone_id: rider?.zoneId || '',
      city: rider?.city || '',
      licenseNumber: rider?.licenseNumber || '',
      vehicle_type: rider?.vehicle?.vehicle_type || '',
      vehicle_brand: rider?.vehicle?.vehicle_name || '',
      model_year_limit: rider?.vehicle?.model_year || 2020,
      vehicle_color: rider?.vehicle?.vehicle_colour || '',
      vehicle_number: rider?.vehicle?.vehicle_no || '',
      cod_limit_enabled: Boolean(codLimitEnabledRaw),
      cod_limit_amount:
        codLimitAmountRaw === undefined || codLimitAmountRaw === null
          ? ''
          : Number(codLimitAmountRaw),
      cod_warning_threshold:
        codWarningThresholdRaw !== undefined && codWarningThresholdRaw !== null
          ? String(Math.round(Number(codWarningThresholdRaw)))
          : '80',
      cod_auto_settlement_cycle: codSettlementCycleRaw
        ? String(codSettlementCycleRaw)
        : 'daily',
      cod_allow_online_payments_when_blocked:
        codAllowOnlinePaymentsRaw === undefined ||
        codAllowOnlinePaymentsRaw === null
          ? true
          : Boolean(codAllowOnlinePaymentsRaw),
      platform_commission_percentage:
        100 - Number(rider?.deliveryEarningPercentage ?? 85),
      profile_picture: null,
      driver_license_front: null,
      driver_license_back: null,
      national_id_front: null,
      national_id_back: null,
      vehicle_registration_front: null,
      vehicle_registration_back: null,
      company_commercial_registration: null,
      vehicle_in_good_condition: rider?.vehicle?.bike_good_condition || true,
      insulated_delivery_bag: rider?.vehicle?.insulated_delivery_bag || true,
      is_four_wheeler: rider?.vehicle?.is_four_wheeler || false,
      air_conditioning: rider?.vehicle?.air_conditioning || false,
      no_cosmetic_damage: rider?.vehicle?.no_cosmetic_damage || false,
      helmet: rider?.vehicle?.helmet || false,
      availabilityStatus: rider?.availabilityStatus || 'offline',
      status: rider?.status || 'pending',
      is_approved: rider?.is_approved || false,
      is_onboarding_completed: rider?.is_onboarding_completed || false,
    };
  }, [riderData]);

  const validationSchema = useMemo(
    () => EditRiderFormSchema(tEdit),
    [tEdit],
  );

  const handleSubmit = async (values: EditRiderFormValues) => {
    try {
      setApiError(null);
      await updateRider({
        rider_id: riderId,
        name: values.name,
        email: values.email,
        password: values.password || undefined,
        phone: values.phone,
        zone_id: values.zone_id,
        city: values.city || undefined,
        licenseNumber: values.licenseNumber,
        vehicle_name: values.vehicle_brand,
        vehicle_colour: values.vehicle_color,
        vehicle_no: values.vehicle_number,
        model_year_limit:
          values.model_year_limit !== '' && values.model_year_limit !== null
            ? Number(values.model_year_limit)
            : undefined,
        is_four_wheeler: values.is_four_wheeler,
        air_conditioning: values.air_conditioning,
        no_cosmetic_damage: values.no_cosmetic_damage,
        helmet: values.helmet,
        availabilityStatus: values.availabilityStatus,
        type: values.vehicle_type,
        status: values.status,
        is_approved: values.is_approved,
        is_onboarding_completed: values.is_onboarding_completed,
        cod_limit_enabled: values.cod_limit_enabled,
        cod_limit_amount:
          values.cod_limit_enabled &&
          values.cod_limit_amount !== null &&
          values.cod_limit_amount !== ''
            ? Number(values.cod_limit_amount)
            : undefined,
        cod_warning_threshold: values.cod_limit_enabled
          ? Number(values.cod_warning_threshold)
          : undefined,
        cod_auto_settlement_cycle: values.cod_limit_enabled
          ? values.cod_auto_settlement_cycle
          : undefined,
        cod_allow_online_payments_when_blocked: values.cod_limit_enabled
          ? values.cod_allow_online_payments_when_blocked
          : undefined,
        platformCommissionPercentage: Number(
          values.platform_commission_percentage,
        ),
        driver_license_front: values.driver_license_front || undefined,
        driver_license_back: values.driver_license_back || undefined,
        national_id_passport_front: values.national_id_front || undefined,
        national_id_passport_back: values.national_id_back || undefined,
        vehicle_registration_front:
          values.vehicle_registration_front || undefined,
        vehicle_registration_back:
          values.vehicle_registration_back || undefined,
        company_commercial_registration:
          values.company_commercial_registration || undefined,
        profile_image: values.profile_picture || undefined,
      });
      toast.success(tEdit('updateSuccess'));
      router.back();
    } catch (error) {
      const errorResponse = error as ApiErrorResponse;
      const errorMessage =
        returnErrorMessage(errorResponse) || tEdit('updateFailed');
      setApiError(errorMessage);
      handleApiError(errorResponse);
    }
  };

  if (isLoading) {
    return <EditRiderFormShimmer />;
  }

  if (isError) {
    return (
      <DisplayError
        title={tEdit('loadError')}
        message={
          returnErrorMessage(error as ApiErrorResponse) ||
          tTable('tryAgainLater')
        }
      />
    );
  }

  return (
    <Formik<EditRiderFormValues>
      initialValues={initialValues}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({
        isSubmitting,
        handleSubmit: formikHandleSubmit,
        errors,
        touched,
      }) => (
        <Form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            formikHandleSubmit();
          }}
        >
          {/* Personal Information Section */}
          <PersonalInformationSection zones={zones} />

          {/* Vehicle Information Section */}
          <VehicleRequirementsSection vehicleTypes={vehicleTypesData} />

          {/* Rider Commission Section */}
          <RiderCommissionSection />

          {/* COD Limit Settings Section */}
          <CodLimitSettingsSection />

          {/* Documents Section */}
          <DocumentsSection rider={riderData?.rider} />

          {/* Error Display */}
          <FormErrorDisplay
            formikErrors={errors}
            apiError={apiError}
            touched={touched}
          />

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <AppButton
              type="button"
              variant="secondary"
              disabled={isSubmitting || isUpdating}
              className="px-12 rounded-[12px]"
              onClick={() => router.back()}
            >
              {tEdit('cancelButton')}
            </AppButton>
            <AppButton
              type="submit"
              isLoading={isSubmitting || isUpdating}
              disabled={isSubmitting || isUpdating}
              className="px-12 rounded-[12px]"
            >
              {tEdit('updateButton')}
            </AppButton>
          </div>
        </Form>
      )}
    </Formik>
  );
};
