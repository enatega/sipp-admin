'use client';

import { useMemo, useState } from 'react';
import { pruneUnchangedStoreFields, STORE_EDIT_PAYLOAD_FIELDS } from '@/lib/store-update-payload';
import { LegacyStoreNotice } from '@/components/shared/LegacyStoreNotice';
import { useParams, useRouter } from 'next/navigation';
import { editStoreFormSchema } from '@/schemas/enatega-deliveries/stores/store-form';
import { GetStoreDetailResponse } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { StoreTimings } from '@/types/entities/super-admin/enatega-deliveries/store-form';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { useUpdateVendorStore } from '@/hooks/api/vendor/deliveries/stores';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { AppButton } from '@/components/shared/AppButton';
import TaxConfiguration from '@/components/shared/form/TaxConfiguration';
import { FormErrorDisplay } from '@/components/shared/FormErrorDisplay';
import { BasicInformationSection } from './BasicInformationSection';
import { DocumentSection } from './DocumentSection';
import { LocationSection } from './LocationSection';
import { mapVendorStoreData } from './mapVendorStoreData';
import { PaymentSection } from './PaymentSection';
import { ShopTypeSection } from './ShopTypeSection';
import { StoreOperationSection } from './StoreOperationSection';
import { VendorStore } from './types';

export function VendorEditStoreForm({
  store: apiStore,
}: {
  store: GetStoreDetailResponse;
}) {
  const router = useRouter();
  const isLegacyMigrated = apiStore.isLegacyMigrated === true;
  const t = useTranslations('vendorDeliveriesStores');
  const tSchema = useTranslations('Schemas.storeForm');
  const tConfirmDialog = useTranslations(
    'vendorDeliveriesStores.confirmDialog',
  );
  const tSuccessDialog = useTranslations(
    'vendorDeliveriesStores.successDialog',
  );
  const { vendorId } = useParams() as { vendorId: string };
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [pendingValues, setPendingValues] = useState<VendorStore | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const initialValues = useMemo<VendorStore>(() => {
    return mapVendorStoreData(apiStore);
  }, [apiStore]);

  const validationSchema = useMemo(
    () => editStoreFormSchema(tSchema, isLegacyMigrated),
    [tSchema, isLegacyMigrated],
  );

  const { mutate: updateStore, isPending } = useUpdateVendorStore({
    onSuccess: (data) => {
      toast.success(data.message || t('updateSuccess'));
      setShowConfirmDialog(false);
      setShowSuccessDialog(true);
      setApiError(null);
    },
    onError: (error) => {
      const errorMsg = returnErrorMessage(error);
      setApiError(errorMsg || t('updateFailed'));
      handleApiError(error);
      setShowConfirmDialog(false);
    },
  });

  const handleSubmit = (values: VendorStore) => {
    const hasChanges = JSON.stringify(values) !== JSON.stringify(initialValues);

    if (!hasChanges) {
      toast(t('noChangesDetected'), {
        icon: 'ℹ️',
      });
      return;
    }

    setApiError(null);
    setPendingValues(values);
    setShowConfirmDialog(true);
  };

  const handleConfirmUpdate = () => {
    if (!pendingValues || !apiStore.id) return;

    const formData = new FormData();
    formData.append('address', pendingValues.address);
    formData.append('tag_line', pendingValues.tagLine || '');
    formData.append('description', pendingValues.description || '');
    formData.append('minimumOrder', pendingValues.minimumOrderValue || '0');
    formData.append('shopType', pendingValues.shopType);
    formData.append(
      'productTaxMode',
      pendingValues.productTaxMode || 'store_rate',
    );
    if (
      pendingValues.productTaxMode !== 'product_level' &&
      pendingValues.taxRateId
    )
      formData.append('taxRateId', pendingValues.taxRateId);
    formData.append('zoneId', pendingValues.zoneId);

    formData.append('prepare_time', pendingValues.prepareTime);
    formData.append('packing_charges', pendingValues.packingCharges);
    formData.append(
      'allow_schedule_booking',
      String(pendingValues.scheduleBooking),
    );
    formData.append('pickup_allow', String(pendingValues.pickupAllowed));
    formData.append('delivery_allow', String(pendingValues.deliveryAllowed));
    formData.append('base_fee', pendingValues.baseFee);
    formData.append('per_km_fee', pendingValues.perKmFee);
    formData.append(
      'free_delivery_threashold',
      pendingValues.freeDeliveryThreshold,
    );

    if (pendingValues.location) {
      const { location } = pendingValues;
      let addressZone: Record<string, unknown> = {};

      if (location.type === 'circle' && location.center && location.radius) {
        addressZone = {
          shape: {
            type: 'Circle',
            center: [location.center.lng, location.center.lat],
            radius: location.radius,
          },
        };
      } else if (location.type === 'polygon' && location.path) {
        const coordinates = location.path.map(
          (point: { lng: number; lat: number }) => [point.lng, point.lat],
        );

        if (coordinates.length > 0) {
          const first = coordinates[0];
          const last = coordinates[coordinates.length - 1];

          if (first[0] !== last[0] || first[1] !== last[1]) {
            coordinates.push([...first]);
          }
        }

        addressZone = {
          shape: {
            type: 'Polygon',
            coordinates: [coordinates],
          },
        };
      } else if (location.type === 'polyline' && location.path) {
        addressZone = {
          shape: {
            type: 'LineString',
            coordinates: location.path.map(
              (point: { lng: number; lat: number }) => [point.lng, point.lat],
            ),
          },
        };
      } else if (location.type === 'marker' && location.center) {
        addressZone = {
          shape: {
            type: 'Point',
            coordinates: [location.center.lng, location.center.lat],
          },
        };
      }

      if (Object.keys(addressZone).length > 0) {
        formData.append('address_zone', JSON.stringify(addressZone));
      }
    }

    const storeTimings: Record<
      string,
      { is_active: boolean; slots: { open: string; close: string }[] }
    > = {};

    Object.entries(pendingValues.storeTimings as StoreTimings).forEach(
      ([day, timing]) => {
        storeTimings[day] = {
          is_active: timing.is_active,
          slots: timing.slots,
        };
      },
    );
    formData.append('storeTimings', JSON.stringify(storeTimings));

    formData.append('bank_name', pendingValues.bankName);
    formData.append('account_holder_name', pendingValues.accountHolderName);
    formData.append('account_number', pendingValues.accountNumber);
    formData.append('branch_code', pendingValues.branchCode);

    if (pendingValues.logo instanceof File) {
      formData.append('logo', pendingValues.logo);
    }
    if (pendingValues.banner instanceof File) {
      formData.append('banner', pendingValues.banner);
    }
    if (pendingValues.businessLicenseFront instanceof File) {
      formData.append(
        'businessLiscenceFront',
        pendingValues.businessLicenseFront,
      );
    }
    if (pendingValues.businessLicenseBack instanceof File) {
      formData.append(
        'businessLiscenceBack',
        pendingValues.businessLicenseBack,
      );
    }
    if (pendingValues.identityCardFront instanceof File) {
      formData.append('nationalIdFront', pendingValues.identityCardFront);
    }
    if (pendingValues.identityCardBack instanceof File) {
      formData.append('nationalIdBack', pendingValues.identityCardBack);
    }
    if (pendingValues.storeRegistrationDoc instanceof File) {
      formData.append(
        'registeredStoreDocs',
        pendingValues.storeRegistrationDoc,
      );
    }
    if (pendingValues.taxCertificate instanceof File) {
      formData.append('taxIdCertificate', pendingValues.taxCertificate);
    }

    if (isLegacyMigrated) {
      pruneUnchangedStoreFields(formData, pendingValues, initialValues, STORE_EDIT_PAYLOAD_FIELDS);
      if (pendingValues.productTaxMode !== initialValues.productTaxMode || pendingValues.taxRateId !== initialValues.taxRateId) {
        formData.set('productTaxMode', pendingValues.productTaxMode || 'store_rate');
        if (pendingValues.productTaxMode !== 'product_level' && pendingValues.taxRateId)
          formData.set('taxRateId', pendingValues.taxRateId);
      }
      if (!Array.from(formData.keys()).length) {
        setShowConfirmDialog(false);
        toast(t('noChangesDetected'));
        return;
      }
    }
    updateStore({ storeId: apiStore.id, formData });
    setShowConfirmDialog(false);
  };

  const handleGoBackToStores = () => {
    setShowSuccessDialog(false);
    router.push(`/vendor/deliveries/${vendorId}/stores`);
  };

  const handleContinueEditing = () => {
    setShowSuccessDialog(false);
  };

  return (
    <>
      <div className="bg-accent p-10 rounded-md my-5">
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ errors, touched }) => (
            <Form className="space-y-5">
              {isLegacyMigrated && <LegacyStoreNotice />}
              <BasicInformationSection isLegacyMigrated={isLegacyMigrated} />

              <ShopTypeSection />
              <TaxConfiguration currentRate={apiStore.taxRate} />

              <StoreOperationSection />

              <LocationSection />

              <DocumentSection isLegacyMigrated={isLegacyMigrated} />

              <PaymentSection isLegacyMigrated={isLegacyMigrated} />

              <FormErrorDisplay
                formikErrors={errors}
                apiError={apiError}
                touched={touched}
              />

              <div className="flex justify-end gap-x-5">
                <AppButton
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    router.push(`/vendor/deliveries/${vendorId}/stores`);
                  }}
                  className="w-fit"
                >
                  {t('cancel')}
                </AppButton>
                <AppButton
                  type="submit"
                  className="w-fit"
                  isLoading={isPending}
                  disabled={isPending}
                >
                  {t('updateStore')}
                </AppButton>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      <AppAlertDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={tConfirmDialog('title')}
        subTitle={tConfirmDialog('subTitle')}
        description={tConfirmDialog('description')}
        confirmLabel={tConfirmDialog('confirm')}
        cancelLabel={t('cancel')}
        onConfirm={handleConfirmUpdate}
        loading={isPending}
        variant="primary"
        size="md"
      />

      <AppAlertDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        title={tSuccessDialog('title')}
        subTitle={tSuccessDialog('subTitle')}
        description={tSuccessDialog('description')}
        confirmLabel={tSuccessDialog('confirm')}
        cancelLabel={tSuccessDialog('cancel')}
        onConfirm={handleGoBackToStores}
        onCancel={handleContinueEditing}
        variant="primary"
        size="md"
      />
    </>
  );
}
