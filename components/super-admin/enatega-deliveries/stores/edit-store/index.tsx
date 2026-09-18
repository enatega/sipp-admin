'use client';

import { useMemo, useState } from 'react';
import { pruneUnchangedStoreFields, STORE_EDIT_PAYLOAD_FIELDS } from '@/lib/store-update-payload';
import { LegacyStoreNotice } from '@/components/shared/LegacyStoreNotice';
import { EnableStoreLoginDialog } from '@/components/shared/EnableStoreLoginDialog';
import { usePathname, useRouter } from 'next/navigation';
import { editStoreFormSchema } from '@/schemas/enatega-deliveries/stores/store-form';
import { StoreTimings } from '@/shared/contracts/store';
import { GetStoreDetailResponse } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { buildScopedDeliveriesAdminPathFromCurrent } from '@/lib/routes';
import { useUpdateStore } from '@/hooks/api/super-admin/enatega-deliveries/stores';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { AppButton } from '@/components/shared/AppButton';
import TaxConfiguration from '@/components/shared/form/TaxConfiguration';
import { FormErrorDisplay } from '@/components/shared/FormErrorDisplay';
import { BasicInformationSection } from './BasicInformationSection';
import { DocumentSection } from './DocumentSection';
import { formatStoreUpdateError } from './formatStoreUpdateError';
import { LocationSection } from './LocationSection';
import { mapStoreApiToForm } from './mapStoreData';
import { PaymentSection } from './PaymentSection';
import { ShopTypeSection } from './ShopTypeSection';
import { Store } from './types';

export function EditStoreForm({
  store: apiStore,
}: {
  store: GetStoreDetailResponse;
}) {
  const t = useTranslations('lumiFood.stores');
  const tSchema = useTranslations('Schemas.storeForm');
  const tConfirmDialog = useTranslations('lumiFood.stores.confirmDialog');
  const tSuccessDialog = useTranslations('lumiFood.stores.successDialog');
  const tErrorFeedback = useTranslations('lumiFood.stores.errorFeedback');
  const router = useRouter();
  const pathname = usePathname();
  const isLegacyMigrated = apiStore.isLegacyMigrated === true;
  const tLogin = useTranslations('storeLogin');
  const [loginOpen, setLoginOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [pendingValues, setPendingValues] = useState<Store | null>(null);
  const [apiError, setApiError] = useState<string[] | null>(null);

  const initialValues = useMemo<Store>(() => {
    return mapStoreApiToForm(apiStore);
  }, [apiStore]);

  const validationSchema = useMemo(
    () => editStoreFormSchema(tSchema, isLegacyMigrated),
    [tSchema, isLegacyMigrated],
  );

  const { mutate: updateStore, isPending } = useUpdateStore({
    onSuccess: () => {
      toast.success(t('updateSuccess'));
      setShowConfirmDialog(false);
      setShowSuccessDialog(true);
      setApiError(null);
    },
    onError: (error) => {
      const friendlyError = formatStoreUpdateError(error, tErrorFeedback);
      setApiError(friendlyError.details);
      toast.error(friendlyError.toastMessage);
      setShowConfirmDialog(false);
    },
  });

  const handleSubmit = (values: Store) => {
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
    if (!pendingValues) return;

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

    // Store Operation Mode fields intentionally disabled for enatega-deliveries/stores.
    // formData.append('prepare_time', pendingValues.prepareTime);
    // formData.append('packing_charges', pendingValues.packingCharges);
    // formData.append(
    //   'allow_schedule_booking',
    //   String(pendingValues.scheduleBooking),
    // );
    // formData.append('pickup_allow', String(pendingValues.pickupAllowed));
    // formData.append('delivery_allow', String(pendingValues.deliveryAllowed));
    // formData.append('base_fee', pendingValues.baseFee);
    // formData.append('per_km_fee', pendingValues.perKmFee);
    // formData.append(
    //   'free_delivery_threashold',
    //   pendingValues.freeDeliveryThreshold,
    // );

    if (pendingValues.location) {
      const { location } = pendingValues;
      let addressZone: Record<string, unknown> = {};

      if (location.type === 'circle' && location.center && location.radius) {
        addressZone = {
          shape: {
            type: 'Circle',
            center: { lat: location.center.lat, lng: location.center.lng },
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
            coordinates.push(first);
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

      formData.append('address_zone', JSON.stringify(addressZone));
    }

    if (pendingValues.exactStoreLocation) {
      formData.append(
        'latitude',
        String(pendingValues.exactStoreLocation.latitude),
      );
      formData.append(
        'longitude',
        String(pendingValues.exactStoreLocation.longitude),
      );
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
    router.push(
      buildScopedDeliveriesAdminPathFromCurrent(
        pathname,
        '/enatega-deliveries/stores',
      ),
    );
  };

  const handleContinueEditing = () => {
    setShowSuccessDialog(false);
  };

  return (
    <>
      <div className="bg-accent p-10 rounded-md my-5">
        {isLegacyMigrated && apiStore.storeLoginEnabled === false && (
          <div className="flex justify-end mb-5">
            <AppButton type="button" onClick={() => setLoginOpen(true)}>{tLogin('title')}</AppButton>
          </div>
        )}
        <EnableStoreLoginDialog storeId={apiStore.id} open={loginOpen} onClose={() => setLoginOpen(false)} />
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

              {/* <StoreOperationSection /> */}

              <LocationSection />

              <DocumentSection isLegacyMigrated={isLegacyMigrated} />

              <PaymentSection isLegacyMigrated={isLegacyMigrated} />

              {/* Error Display */}
              <FormErrorDisplay
                formikErrors={errors}
                apiError={apiError}
                apiErrorTitle={tErrorFeedback('submissionFailedTitle')}
                apiErrorSummary={tErrorFeedback('submissionFailedSummary')}
                touched={touched}
              />

              <div className="flex justify-end gap-x-5">
                <AppButton
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    router.push(
                      buildScopedDeliveriesAdminPathFromCurrent(
                        pathname,
                        '/enatega-deliveries/stores',
                      ),
                    );
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
