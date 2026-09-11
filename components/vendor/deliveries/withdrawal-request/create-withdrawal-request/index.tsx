'use client';

import { useState } from 'react';
import { createWithdrawalRequestSchema } from '@/schemas/vendor/deliveries/withdrawal-request/create-withdrawal-request.schema';
import { ApiErrorResponse } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import {
  useCreateVendorStoreWithdrawRequest,
  useGetVendorAllStoresWithdrawRequests,
  useGetVendorStoreBankDetails,
} from '@/hooks/api/vendor/deliveries/withdraw-requests';
import { useCurrency } from '@/hooks/use-currency';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import { Heading } from '@/components/shared/Heading';
import { VendorStore, VendorWithdrawalFormData } from '../types';

interface BankDetail {
  bank_id: string;
  bank_name: string;
  account_title: string;
  account_number: string;
  account_code: string;
}

interface CreateWithdrawalRequestProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxWithdrawalAmount?: number;
  showStoreSelection?: boolean;
  storeLabel?: string;
  storeUserId?: string;
  /** External bank details (e.g. from store hooks). Bypasses vendor hook when provided. */
  externalBankDetails?: BankDetail | null;
  /** Loading state for external bank details */
  externalBankDetailsLoading?: boolean;
  /** External create mutation (e.g. from store hooks). Bypasses vendor hook when provided. */
  externalCreateRequest?: (payload: {
    withdrawal_amount: number;
    bank_id: string;
    additional_notes?: string;
  }) => Promise<unknown>;
  /** Loading/pending state for external create mutation */
  externalIsCreating?: boolean;
}

export const CreateWithdrawalRequest = ({
  open,
  onOpenChange,
  maxWithdrawalAmount = 800,
  showStoreSelection = true,
  storeLabel,
  storeUserId,
  externalBankDetails,
  externalBankDetailsLoading,
  externalCreateRequest,
  externalIsCreating,
}: CreateWithdrawalRequestProps) => {
  const t = useTranslations('vendorWithdrawalRequest.createDialog');
  const tToast = useTranslations('vendorWithdrawalRequest.createDialog.toast');
  const tBankDetailsStates = useTranslations(
    'vendorWithdrawalRequest.createDialog.bankDetailsStates',
  );
  const { currencySymbol } = useCurrency();
  const [selectedStoreUserId, setSelectedStoreUserId] = useState(storeUserId);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelectedStoreUserId(storeUserId ?? '');
    }
  }

  const useExternalData = externalCreateRequest !== undefined;

  const { data: storesResponse, isLoading } =
    useGetVendorAllStoresWithdrawRequests({
      enabled: open && !useExternalData,
    });
  const { data: bankDetailsResponse, isLoading: vendorBankDetailsLoading } =
    useGetVendorStoreBankDetails(selectedStoreUserId, {
      enabled: open && Boolean(selectedStoreUserId) && !useExternalData,
    });
  const {
    mutateAsync: vendorCreateWithdrawRequest,
    isPending: vendorIsCreating,
  } = useCreateVendorStoreWithdrawRequest();

  const isBankDetailsLoading = useExternalData
    ? (externalBankDetailsLoading ?? false)
    : vendorBankDetailsLoading;
  const isCreating = useExternalData
    ? (externalIsCreating ?? false)
    : vendorIsCreating;

  const selectedStoreBankDetails: BankDetail | undefined = useExternalData
    ? (externalBankDetails ?? undefined)
    : bankDetailsResponse?.data?.[0] || bankDetailsResponse?.bank_details?.[0];

  const isStoreSelected = Boolean(selectedStoreUserId);
  const isBankDetailsReady = Boolean(selectedStoreBankDetails);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedStoreUserId(storeUserId || '');
    }
    onOpenChange(nextOpen);
  };

  const getSingleStore: VendorStore[] = (storesResponse?.data ?? []).map(
    (store) => ({
      id: store.store_id,
      storeUserId: store.store_user_id,
      name: store.store_name,
      availableBalance: store.available_funds,
    }),
  );

  const initialValues: VendorWithdrawalFormData = {
    storeId: '',
    amount: 0,
    isMaximum: false,
    notes: '',
  };

  const maxAmount = maxWithdrawalAmount;

  const validationSchema = createWithdrawalRequestSchema({
    t,
    showStoreSelection,
    isStoreSelected,
    isBankDetailsReady,
    maxWithdrawalAmount,
    currencySymbol,
  });

  const handleSubmit = async (values: VendorWithdrawalFormData) => {
    if (!selectedStoreUserId || !selectedStoreBankDetails?.bank_id) return;
    try {
      if (useExternalData && externalCreateRequest) {
        await externalCreateRequest({
          withdrawal_amount: values.amount,
          bank_id: selectedStoreBankDetails.bank_id,
          additional_notes: values.notes?.trim() || undefined,
        });
      } else {
        await vendorCreateWithdrawRequest({
          store_user_id: selectedStoreUserId,
          withdrawal_amount: values.amount,
          bank_id: selectedStoreBankDetails.bank_id,
          additional_notes: values.notes?.trim() || undefined,
        });
      }
      toast.success(tToast('success'));
      handleOpenChange(false);
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl h-full overflow-y-auto p-4">
        <SheetHeader className="mb-5 p-0!">
          <SheetTitle>
            <Heading title={t('title')} />
          </SheetTitle>
        </SheetHeader>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              {/* Store Selection */}
              {showStoreSelection && (
                <AppSelect
                  name="storeId"
                  label={storeLabel || t('storeLabel')}
                  loading={isLoading}
                  placeholder={t('storePlaceholder')}
                  onValueChange={setSelectedStoreUserId}
                  options={getSingleStore?.map((s) => ({
                    key: t('storeOptionWithBalance', {
                      storeName: s.name,
                      currencySymbol,
                      availableBalance: s.availableBalance,
                    }),
                    value: s.storeUserId || s.id,
                  }))}
                  requiredAsterisk
                />
              )}

              {/* Withdrawal Amount */}
              <div>
                <AppInputField
                  name="amount"
                  label={t('amountLabel')}
                  type="number"
                  placeholder={t('enterAmountPlaceholder')}
                  requiredAsterisk
                  helperText={t('maximumOption', {
                    currencySymbol,
                    maxAmount,
                  })}
                />
              </div>

              {/* Bank Details (Pre-filled, Read-only) */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold">
                  {t('bankInfoLabel')}
                </h3>
                {!isStoreSelected ? (
                  <p className="text-sm text-muted-foreground rounded-md border p-3">
                    {tBankDetailsStates('selectStore')}
                  </p>
                ) : isBankDetailsLoading ? (
                  <div className="space-y-3 rounded-md border p-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : !isBankDetailsReady ? (
                  <p className="text-sm text-muted-foreground rounded-md border p-3">
                    {tBankDetailsStates('unavailable')}
                  </p>
                ) : (
                  <>
                    <AppInputField
                      label={t('bankNameLabel')}
                      value={selectedStoreBankDetails?.bank_name || ''}
                      placeholder="-"
                      disabled
                      helperText={tBankDetailsStates('autoFilled')}
                    />
                    <AppInputField
                      label={t('accountTitleLabel')}
                      value={selectedStoreBankDetails?.account_title || ''}
                      placeholder="-"
                      disabled
                    />
                    <AppInputField
                      label={t('accountNumberLabel')}
                      value={selectedStoreBankDetails?.account_number || ''}
                      placeholder="-"
                      disabled
                    />

                    <AppInputField
                      label={t('branchCodeLabel')}
                      value={selectedStoreBankDetails?.account_code || ''}
                      placeholder="-"
                      disabled
                    />
                  </>
                )}
              </div>

              {/* Notes */}
              <AppTextarea
                name="notes"
                label={t('notesLabel')}
                placeholder={t('notesPlaceholder')}
                rows={3}
              />

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-4 pt-4">
                <AppButton
                  type="button"
                  variant="secondary"
                  onClick={() => handleOpenChange(false)}
                >
                  {t('cancelButton')}
                </AppButton>
                <AppButton
                  type="submit"
                  isLoading={isSubmitting || isCreating}
                  disabled={
                    isSubmitting ||
                    isCreating ||
                    (isStoreSelected &&
                      (isBankDetailsLoading || !isBankDetailsReady))
                  }
                >
                  {t('submitButton')}
                </AppButton>
              </div>
            </Form>
          )}
        </Formik>
      </SheetContent>
    </Sheet>
  );
};
