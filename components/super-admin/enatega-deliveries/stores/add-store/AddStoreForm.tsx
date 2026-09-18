'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAddStoreForm } from '@/contexts/super-admin/enatega-deliveries/store/use-add-store-form';
import { ApiErrorResponse } from '@/types';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import type { StoreFormData } from '@/types/entities/super-admin/enatega-deliveries/store-form';
import { buildScopedDeliveriesAdminPathFromCurrent } from '@/lib/routes';
import { handleApiError } from '@/lib/toast-error';
import { useCreateStore } from '@/hooks/api/super-admin/enatega-deliveries/stores';
import { Step1Form } from './Step1';
import { Step2Form } from './Step2';
import { Step4Form } from './Step4';
import { Step5Form } from './Step5';
import { Step6Form } from './Step6';

const AddStoreForm = () => {
  const router = useRouter();
  const pathname = usePathname();
  const tStep4 = useTranslations('lumiFood.stores.addStore.step4');
  const tAddStoreMessages = useTranslations(
    'lumiFood.stores.addStore.messages',
  );
  const { currentStep, formData, nextStep, prevStep, setStepData, resetForm } =
    useAddStoreForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: createStore, isPending } = useCreateStore({
    onSuccess: (data) => {
      setIsSubmitting(false);
      toast.success(data.message || tAddStoreMessages('createSuccess'));
      resetForm();
      router.push(
        buildScopedDeliveriesAdminPathFromCurrent(
          pathname,
          '/enatega-deliveries/stores',
        ),
      );
    },
    onError: (error) => {
      setIsSubmitting(false);

      // Force reset after a short delay as fallback
      setTimeout(() => {
        setIsSubmitting(false);
      }, 100);

      handleApiError(error as ApiErrorResponse);
    },
    onSettled: () => {
      setIsSubmitting(false);

      // Force reset after a short delay as fallback
      setTimeout(() => {
        setIsSubmitting(false);
      }, 100);
    },
  });

  // Monitor state changes and force reset if needed
  useEffect(() => {
    if (!isPending && isSubmitting) {
      Promise.resolve().then(() => {
        setIsSubmitting(false);
      });
    }
  }, [isSubmitting, isPending]);

  type StepKey = keyof StoreFormData;

  const handleSubmit =
    <K extends StepKey>(step: K) =>
    (data: NonNullable<StoreFormData[K]>) => {
      setStepData(step, data);

      // If it's the last step, submit to API
      if (step === 'step6') {
        handleFinalSubmit(data as NonNullable<StoreFormData['step6']>);
      } else {
        nextStep();
      }
    };

  const handleFinalSubmit = async (
    step6Data: NonNullable<StoreFormData['step6']>,
  ) => {
    try {
      if (!formData.step4?.location) {
        toast.error(tStep4('locationRequired'));
        return;
      }
      if (!formData.step4?.exactStoreLocation) {
        toast.error(tStep4('exactStoreLocationRequired'));
        return;
      }

      setIsSubmitting(true);
      const formDataToSend = new FormData();

      // Step 1 data
      if (formData.step1) {
        formDataToSend.append('storeName', formData.step1.name);
        formDataToSend.append('vendorId', formData.step1.vendorId);
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

      // Step 2 data
      if (formData.step2) {
        formDataToSend.append('shopType', formData.step2.shopType);
        formDataToSend.append(
          'productTaxMode',
          formData.step2.productTaxMode || 'store_rate',
        );
        if (
          formData.step2.productTaxMode !== 'product_level' &&
          formData.step2.taxRateId
        )
          formDataToSend.append('taxRateId', formData.step2.taxRateId);
      }

      // Step 3 (Store Operation Mode) intentionally disabled for enatega-deliveries/stores.
      // if (formData.step3) {
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

      // Step 4 data (location/zone)
      if (formData.step4?.location) {
        const location = formData.step4.location;
        let addressZone: Record<string, unknown> = {};

        if (location.type === 'circle' && location.center && location.radius) {
          // Circle format
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
          // Polygon format
          const coordinates = location.path.map(
            (point: { lat: number; lng: number }) => [point.lng, point.lat],
          );
          // Close the polygon by adding the first point at the end if not already closed
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
          // LineString format
          const coordinates = location.path.map(
            (point: { lat: number; lng: number }) => [point.lng, point.lat],
          );
          addressZone = {
            shape: {
              type: 'LineString',
              coordinates: coordinates,
            },
          };
        } else if (location.type === 'marker' && location.center) {
          // Point format
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

        if (formData.step4.exactStoreLocation) {
          formDataToSend.append(
            'latitude',
            String(formData.step4.exactStoreLocation.latitude),
          );
          formDataToSend.append(
            'longitude',
            String(formData.step4.exactStoreLocation.longitude),
          );
        }
      }

      // Step 5 data (documents)
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

      // Step 6 data (bank details)
      formDataToSend.append('bank_name', step6Data.bankName);
      formDataToSend.append('account_holder_name', step6Data.accountHolderName);
      formDataToSend.append('account_number', step6Data.accountNumber);
      formDataToSend.append('branch_code', step6Data.branchCode || '');

      // Store timings from Step 4
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
      toast.error(tAddStoreMessages('prepareFailed'));
    }
  };

  return (
    <div className="flex-1">
      {currentStep === 1 && (
        <Step1Form
          initialData={formData.step1}
          onSubmit={handleSubmit('step1')}
        />
      )}
      {currentStep === 2 && (
        <Step2Form
          initialData={formData.step2}
          onSubmit={handleSubmit('step2')}
          onBack={prevStep}
        />
      )}
      {currentStep === 3 && formData.step2 && (
        <Step4Form
          initialData={formData.step4}
          onSubmit={handleSubmit('step4')}
          onBack={prevStep}
        />
      )}
      {currentStep === 4 && (
        <Step5Form
          initialData={formData.step5}
          onSubmit={handleSubmit('step5')}
          onBack={prevStep}
        />
      )}
      {currentStep === 5 && (
        <Step6Form
          initialData={formData.step6}
          onSubmit={handleSubmit('step6')}
          onBack={prevStep}
          isLoading={isPending}
        />
      )}
    </div>
  );
};

export default AddStoreForm;
