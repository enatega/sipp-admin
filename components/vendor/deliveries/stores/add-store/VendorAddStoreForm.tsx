'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { useVendorAddStoreForm } from '@/contexts/vendor/deliveries/store/use-add-store-form';
import { handleApiError } from '@/lib/toast-error';
import { useCreateStore } from '@/hooks/api/vendor/deliveries/stores';
import { ApiErrorResponse } from '@/types';
import type { VendorStoreFormData } from '@/types/entities/vendor/store';
import { Step1Form } from './Step1';
import {
  SharedStep2Form,
  SharedStep4Form,
  SharedStep5Form,
  SharedStep6Form,
} from '@/components/shared/enatega-deliveries/stores/add-store';

const VendorAddStoreForm = () => {
  const router = useRouter();
  const tErrors = useTranslations('vendorDeliveriesStores.errors');
  const tStep4 = useTranslations('vendorDeliveriesStores.addStore.step4');
  const tMessages = useTranslations('vendorDeliveriesStores.addStore.messages');
  const { vendorId } = useParams() as { vendorId: string };
  const {
    currentStep,
    formData,
    nextStep,
    prevStep,
    setStepData,
    resetForm,
  } =
    useVendorAddStoreForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: createStore, isPending } = useCreateStore({
    onSuccess: (data) => {
      setIsSubmitting(false);
      toast.success(data.message || tMessages('createSuccess'));
      resetForm();
      const createdStoreId =
        data?.storeId ||
        data?.data?.storeId

      const createdStoreEmail = formData.step1?.email;

      if (createdStoreId) {
        const nextUrl = new URL(
          `/vendor/deliveries/${vendorId}/stores/subscription-plan/${createdStoreId}`,
          window.location.origin,
        );

        if (createdStoreEmail) {
          nextUrl.searchParams.set('email', createdStoreEmail);
        }

        router.push(nextUrl.pathname + nextUrl.search);
        return;
      }

      router.push(`/vendor/deliveries/${vendorId}/stores`);
    },
    onError: (error) => {
      setIsSubmitting(false);

      setTimeout(() => {
        setIsSubmitting(false);
      }, 100);

      handleApiError(error as ApiErrorResponse);
    },
    onSettled: () => {
      setIsSubmitting(false);

      setTimeout(() => {
        setIsSubmitting(false);
      }, 100);
    },
  });

  useEffect(() => {
    if (!isPending && isSubmitting) {
      Promise.resolve().then(() => {
        setIsSubmitting(false);
      });
    }
  }, [isPending, isSubmitting]);

  type StepKey = keyof VendorStoreFormData;

  const handleSubmit =
    <K extends StepKey>(step: K) =>
    (data: NonNullable<VendorStoreFormData[K]>) => {
      setStepData(step, data);

      if (step === 'step6') {
        handleFinalSubmit(data as NonNullable<VendorStoreFormData['step6']>);
      } else {
        nextStep();
      }
    };

  const handleFinalSubmit = async (
    step6Data: NonNullable<VendorStoreFormData['step6']>,
  ) => {
    try {
      if (!vendorId) {
        toast.error(tErrors('vendorNotFound'));
        return;
      }
      if (!formData.step4?.location) {
        toast.error(tStep4('locationRequired'));
        return;
      }

      setIsSubmitting(true);
      const formDataToSend = new FormData();

      if (formData.step1) {
        formDataToSend.append('storeName', formData.step1.name);
        formDataToSend.append('vendorId', vendorId);
        formDataToSend.append('email', formData.step1.email);
        formDataToSend.append('password', formData.step1.password || '');
        formDataToSend.append('phone', formData.step1.phone);
        formDataToSend.append('address', formData.step1.address);
        formDataToSend.append('tag_line', formData.step1.tagLine || '');
        formDataToSend.append('description', formData.step1.description || '');
        formDataToSend.append('minimumOrder', formData.step1.minimumOrderValue);

        formDataToSend.append(
          'change_password_allowed',
          formData.step1.changePassword ? 'true' : 'false',
        );
        formDataToSend.append(
          'mail_login_credentials',
          formData.step1.mailLoginCredentials ? 'true' : 'false',
        );

        if (formData.step1.zoneId) {
          formDataToSend.append('zoneId', formData.step1.zoneId);
        }

        if (formData.step1.logo) {
          formDataToSend.append('logo', formData.step1.logo);
        }
        if (formData.step1.banner) {
          formDataToSend.append('banner', formData.step1.banner);
        }
      }

      if (formData.step2) {
        formDataToSend.append('shopType', formData.step2.shopType);
      }

      // if (formData.step3) {
      //   // Store Operating Mode values intentionally disabled for vendor add-store route.
      //   formDataToSend.append(
      //     'prepare_time',
      //     formData.step3.prepareTime || '20 mins',
      //   );
      //   formDataToSend.append(
      //     'allow_schedule_booking',
      //     formData.step3.scheduleBooking ? 'true' : 'false',
      //   );
      //   formDataToSend.append(
      //     'pickup_allow',
      //     formData.step3.pickupAllowed ? 'true' : 'false',
      //   );
      //   formDataToSend.append(
      //     'delivery_allow',
      //     formData.step3.deliveryAllowed ? 'true' : 'false',
      //   );
      //   formDataToSend.append('base_fee', formData.step3.baseFee);
      //   formDataToSend.append('per_km_fee', formData.step3.perKmFee);
      //   formDataToSend.append(
      //     'free_delivery_threashold',
      //     formData.step3.freeDeliveryThreshold,
      //   );
      //   formDataToSend.append('packing_charges', formData.step3.packingCharges);
      //   formDataToSend.append('salesTax', '5');
      // }

      if (formData.step4?.location) {
        const location = formData.step4.location;
        let addressZone: Record<string, unknown> = {};

        if (location.type === 'circle' && location.center && location.radius) {
          addressZone = {
            shape: {
              type: 'Circle',
              center: [location.center.lng, location.center.lat],
              radius: location.radius,
            },
          };
        } else if (
          location.type === 'polygon' &&
          location.path &&
          location.path.length > 0
        ) {
          const coordinates = location.path.map(
            (point: { lat: number; lng: number }) => [point.lng, point.lat],
          );

          if (
            coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
            coordinates[0][1] !== coordinates[coordinates.length - 1][1]
          ) {
            coordinates.push([...coordinates[0]]);
          }

          addressZone = {
            shape: {
              type: 'Polygon',
              coordinates: [coordinates],
            },
          };
        } else if (
          location.type === 'polyline' &&
          location.path &&
          location.path.length > 0
        ) {
          const coordinates = location.path.map(
            (point: { lat: number; lng: number }) => [point.lng, point.lat],
          );

          addressZone = {
            shape: {
              type: 'LineString',
              coordinates,
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
          formDataToSend.append('address_zone', JSON.stringify(addressZone));
        }
      }

      if (formData.step5) {
        if (formData.step5.businessLicenseFront) {
          formDataToSend.append(
            'businessLiscenceFront',
            formData.step5.businessLicenseFront,
          );
        }
        if (formData.step5.businessLicenseBack) {
          formDataToSend.append(
            'businessLiscenceBack',
            formData.step5.businessLicenseBack,
          );
        }
        if (formData.step5.identityCardFront) {
          formDataToSend.append(
            'nationalIdFront',
            formData.step5.identityCardFront,
          );
        }
        if (formData.step5.identityCardBack) {
          formDataToSend.append(
            'nationalIdBack',
            formData.step5.identityCardBack,
          );
        }
        if (formData.step5.storeRegistrationDoc) {
          formDataToSend.append(
            'registeredStoreDocs',
            formData.step5.storeRegistrationDoc,
          );
        }
        if (formData.step5.taxCertificate) {
          formDataToSend.append(
            'taxIdCertificate',
            formData.step5.taxCertificate,
          );
        }
      }

      formDataToSend.append('bank_name', step6Data.bankName);
      formDataToSend.append(
        'account_holder_name',
        step6Data.accountHolderName,
      );
      formDataToSend.append('account_number', step6Data.accountNumber);
      formDataToSend.append('branch_code', step6Data.branchCode || '');

      const storeTimings = formData.step4?.storeTimings || {
        monday: { is_active: true, slots: [{ open: '09:00', close: '22:00' }] },
        tuesday: {
          is_active: true,
          slots: [{ open: '09:00', close: '22:00' }],
        },
        wednesday: {
          is_active: true,
          slots: [{ open: '09:00', close: '22:00' }],
        },
        thursday: {
          is_active: true,
          slots: [{ open: '09:00', close: '22:00' }],
        },
        friday: { is_active: true, slots: [{ open: '09:00', close: '22:00' }] },
        saturday: {
          is_active: true,
          slots: [{ open: '09:00', close: '22:00' }],
        },
        sunday: { is_active: true, slots: [{ open: '09:00', close: '22:00' }] },
      };

      const formattedTimings: Record<
        string,
        { is_active: boolean; slots: { open: string; close: string }[] }
      > = {};

      Object.keys(storeTimings).forEach((day) => {
        const dayTimings = storeTimings[day as keyof typeof storeTimings];
        formattedTimings[day] = {
          is_active: dayTimings.is_active,
          slots: dayTimings.slots,
        };
      });

      formDataToSend.append('storeTimings', JSON.stringify(formattedTimings));

      createStore(formDataToSend);
    } catch {
      setIsSubmitting(false);
      toast.error(tErrors('prepareStoreDataFailed'));
    }
  };

  const translationNamespace = 'vendorDeliveriesStores.addStore';

  return (
    <div className="flex-1">
      {currentStep === 1 && (
        <Step1Form
          initialData={formData.step1}
          onSubmit={handleSubmit('step1')}
        />
      )}
      {currentStep === 2 && (
        <SharedStep2Form
          initialData={formData.step2}
          onSubmit={handleSubmit('step2')}
          onBack={prevStep}
          translationNamespace={translationNamespace}
        />
      )}
      {/* {currentStep === 3 && formData.step2 && (
        <SharedStep3Form
          initialData={formData.step3}
          onSubmit={handleSubmit('step3')}
          onBack={prevStep}
          translationNamespace={translationNamespace}
        />
      )} */}
      {currentStep === 3 && formData.step2 && (
        <SharedStep4Form
          initialData={formData.step4}
          onSubmit={handleSubmit('step4')}
          onBack={prevStep}
          translationNamespace={translationNamespace}
        />
      )}
      {currentStep === 4 && (
        <SharedStep5Form
          initialData={formData.step5}
          onSubmit={handleSubmit('step5')}
          onBack={prevStep}
          translationNamespace={translationNamespace}
        />
      )}
      {currentStep === 5 && (
        <SharedStep6Form
          initialData={formData.step6}
          onSubmit={handleSubmit('step6')}
          onBack={prevStep}
          translationNamespace={translationNamespace}
          isLoading={isPending}
        />
      )}
    </div>
  );
};

export default VendorAddStoreForm;
