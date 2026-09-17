'use client';

import { useState } from 'react';
import { ApiErrorResponse } from '@/types';
import { format, parseISO } from 'date-fns';
import {
  Calendar,
  CarFront,
  ContactRound,
  Copy,
  FileText,
  IdCard,
  Mail,
  Phone,
  ShieldCheck,
  TriangleAlert,
  User,
  Wallet,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import {
  useApproveDeliveryRider,
  useBlockDeliveryRider,
  useGetDeliveryRider,
  useUnblockDeliveryRider,
} from '@/hooks/api/super-admin/enatega-deliveries/riders';
import { useCapitalize } from '@/hooks/use-capitalize';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import DisplayError from '@/components/shared/DisplayError';
import NoDataFound from '@/components/shared/NoDataFound';
import Status from '@/components/shared/Status';
import { VerificationDocumentCard } from '@/components/shared/documents/VerificationDocumentCard';
import { ImagePreview } from '@/components/shared/ImagePreview';
import { RejectRiderDialog } from '../rider-table/RejectRiderDialog';
import { RiderDetailShimmer } from './RiderDetailShimmer';

type ActionDialogType = 'approve' | 'block' | 'unblock' | null;

interface Props {
  open: boolean;
  riderId: string | null;
  onOpenChange: (open: boolean) => void;
  onAfterAction?: () => void;
}

export default function RiderDetailDialog({
  open,
  riderId,
  onOpenChange,
  onAfterAction,
}: Props) {
  const t = useTranslations('driverManagement.driversTable');
  const [showRejectReasonDialog, setShowRejectReasonDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState<ActionDialogType>(null);
  const { capitalizeFirstLetter } = useCapitalize();

  // API hooks
  const {
    data: riderData,
    isLoading,
    isError,
    error,
  } = useGetDeliveryRider(riderId || '', {
    enabled: !!riderId && open,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: open ? 10 * 60 * 1000 : false,
  });

  const { mutateAsync: approveRider, isPending: isApproving } =
    useApproveDeliveryRider();
  const { mutateAsync: blockRider, isPending: isBlocking } =
    useBlockDeliveryRider();
  const { mutateAsync: unblockRider, isPending: isUnblocking } =
    useUnblockDeliveryRider();

  const rider = riderData?.rider;
  const riderRecord = (rider as Record<string, unknown>) || {};
  const legacyDocuments = (Array.isArray(riderRecord.legacyDocuments)
    ? riderRecord.legacyDocuments : []) as { attachmentId: string; label: string; url: string }[];
  const codSettings =
    (riderRecord.cod_limit_settings as Record<string, unknown>) || {};
  const codLimitEnabledRaw =
    codSettings.enabled ?? riderRecord.cod_limit_enabled;
  const codLimitAmountRaw =
    codSettings.amount ?? riderRecord.cod_limit_amount;
  const codWarningThresholdRaw =
    codSettings.warning_threshold ?? riderRecord.cod_warning_threshold;
  const codAutoSettlementCycleRaw =
    codSettings.auto_settlement_cycle ??
    riderRecord.cod_auto_settlement_cycle;
  const codAllowOnlinePaymentsRaw =
    codSettings.allow_online_payments_when_blocked ??
    riderRecord.cod_allow_online_payments_when_blocked;

  const codLimitEnabled = Boolean(codLimitEnabledRaw);
  const codLimitAmount =
    codLimitAmountRaw === null || codLimitAmountRaw === undefined
      ? null
      : Number(codLimitAmountRaw);
  const codWarningThreshold =
    codWarningThresholdRaw === null || codWarningThresholdRaw === undefined
      ? null
      : Number(codWarningThresholdRaw);
  const codAutoSettlementCycle =
    codAutoSettlementCycleRaw === null || codAutoSettlementCycleRaw === undefined
      ? null
      : String(codAutoSettlementCycleRaw);
  const codAllowOnlinePaymentsWhenBlocked =
    codAllowOnlinePaymentsRaw === null || codAllowOnlinePaymentsRaw === undefined
      ? null
      : Boolean(codAllowOnlinePaymentsRaw);

  const handleApprove = async () => {
    if (!riderId) return;
    try {
      await approveRider({ riderId });
      toast.success(t('riderApprovedSuccess'));
      setActionDialog(null);
      onOpenChange(false);
      onAfterAction?.();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handleBlock = async () => {
    if (!riderId) return;
    try {
      await blockRider({ riderId });
      toast.success(t('riderBlockedSuccess'));
      setActionDialog(null);
      onOpenChange(false);
      onAfterAction?.();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  const handleUnblock = async () => {
    if (!riderId) return;
    try {
      await unblockRider({ riderId });
      toast.success(t('riderUnblockedSuccess'));
      setActionDialog(null);
      onOpenChange(false);
      onAfterAction?.();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  if (!open) return null;

  if (isLoading) {
    return (
      <AppDialog
        open={open}
        onClose={() => onOpenChange(false)}
        title={t('driverDetailsDialogTitle')}
        size="4xl"
        showDefaultFooter={false}
      >
        <RiderDetailShimmer />
      </AppDialog>
    );
  }

  if (isError) {
    return (
      <AppDialog
        open={open}
        onClose={() => onOpenChange(false)}
        title={t('driverDetailsDialogTitle')}
        size="4xl"
        showDefaultFooter={false}
      >
        <DisplayError
          title={t('failedToFetchRiderDetails')}
          message={
            returnErrorMessage(error as ApiErrorResponse) || t('tryAgainLater')
          }
        />
      </AppDialog>
    );
  }

  return (
    <>
      <AppDialog
        open={open}
        onClose={() => onOpenChange(false)}
        title={t('driverDetailsDialogTitle')}
        size="4xl"
        showDefaultFooter={false}
        footer={
          rider && rider?.status === 'pending' ? (
            <div className="w-full flex items-end justify-end gap-4 pt-5">
              <AppButton
                variant="secondary"
                onClick={() => setActionDialog('approve')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-none"
              >
                {t('approveAction')}
              </AppButton>

              <AppButton
                variant="secondary"
                className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-none"
                onClick={() => setShowRejectReasonDialog(true)}
              >
                {t('rejectAction')}
              </AppButton>
            </div>
          ) : rider &&
            rider?.status === 'approved' &&
            rider?.userProfile?.user?.block_status !== true ? (
            <div className="w-full flex items-end justify-end gap-4 pt-5">
              <AppButton
                variant="secondary"
                onClick={() => setActionDialog('block')}
                className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-none"
              >
                {t('blockAction')}
              </AppButton>
            </div>
          ) : rider && rider?.userProfile?.user?.block_status === true ? (
            <div className="w-full flex items-end justify-end gap-4 pt-5">
              <AppButton
                variant="secondary"
                onClick={() => setActionDialog('unblock')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-none"
              >
                {t('unblockAction')}
              </AppButton>
            </div>
          ) : null
        }
      >
        {
          // isLoading ? (
          //   <AppLoader />
          // ) :
          //
          rider ? (
            <div className="flex flex-col gap-6">
              {rider?.rejection_reason && (
                <div
                  className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 shadow-sm"
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100">
                      <TriangleAlert className="h-5 w-5 text-rose-600" />
                    </span>

                    <div className="flex-1">
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-rose-900">
                          {t('rejectionReasonCardTitle')}
                        </h4>

                        {rider?.status &&
                          rider.status.toLowerCase() === 'rejected' && (
                            <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                              {t('rejectedStatus')}
                            </span>
                          )}
                      </div>

                      <p className="whitespace-pre-wrap break-words text-sm text-rose-900/90">
                        {rider?.rejection_reason || t('noReasonProvided')}
                      </p>

                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            navigator?.clipboard?.writeText(
                              rider.rejection_reason || '',
                            );
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 active:scale-[0.99]"
                          title={t('copyButton')}
                        >
                          <Copy className="h-4 w-4" />
                          {t('copyButton')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div
                className="rounded-2xl p-6 text-white shadow-sm"
                style={{
                  background: 'linear-gradient(to right, #1E40AF, #2563EB)',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        {capitalizeFirstLetter(
                          rider.userProfile?.user?.name ?? t('notAvailable'),
                        )}
                      </h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Status
                          status={rider.status?.toLowerCase() || 'pending'}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {rider.created_at
                        ? format(parseISO(rider.created_at), 'PP p')
                        : t('notAvailable')}
                    </span>
                  </div>
                </div>
              </div>
              {/* Contact Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 rounded-xl border border-emerald-200/60  transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500 rounded-lg">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-700 font-medium">
                        {t('phoneCardLabel')}
                      </p>
                      <p className="font-semibold text-emerald-900">
                        {rider.userProfile?.user?.phone ?? t('notAvailable')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 p-4 rounded-xl border border-violet-200/60  transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-500 rounded-lg">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-violet-700 font-medium">
                        {t('emailCardLabel')}
                      </p>
                      <p className="font-semibold text-violet-900 truncate">
                        {rider.userProfile?.user?.email ?? t('notAvailable')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-xl border border-blue-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4 w-full">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <CarFront className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-blue-800">
                      {t('vehicleDetailsTitle')}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg ">
                      <p className="text-xs text-blue-900 font-medium   mb-1">
                        {t('vehicleBrandLabel')}
                      </p>
                      <p className="font-bold text-blue-900 text-sm">
                        {capitalizeFirstLetter(
                          rider.vehicle?.vehicle_name ?? t('notAvailable'),
                        )}
                      </p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg ">
                      <p className="text-xs text-blue-900 font-medium   mb-1">
                        {t('modelYearLabel')}
                      </p>
                      <p className="font-bold text-blue-900 text-sm">
                        {rider.vehicle?.model_year ?? t('notAvailable')}
                      </p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg ">
                      <p className="text-xs text-blue-900 font-medium  mb-1">
                        {t('vehicleTypeLabel')}
                      </p>
                      <p className="font-bold text-blue-900 text-sm">
                        {capitalizeFirstLetter(
                          rider.vehicle?.vehicleType?.name ?? t('notAvailable'),
                        )}
                      </p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
                      <p className="text-xs text-blue-900 font-medium mb-1">
                        {t('vehicleNumberLabel')}
                      </p>
                      <p className="font-bold text-blue-900 text-sm tracking-wider">
                        {rider.vehicle?.vehicle_no ?? t('notAvailable')}
                      </p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
                      <p className="text-xs text-blue-900 font-medium mb-1">
                        {t('vehicleColorLabel')}
                      </p>
                      <p className="font-bold text-blue-900 text-sm">
                        {capitalizeFirstLetter(
                          rider.vehicle?.vehicle_colour ?? t('notAvailable'),
                        )}
                      </p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
                      <p className="text-xs text-blue-900 font-medium mb-1">
                        {t('insulatedDeliveryBagLabel')}
                      </p>
                      <p className="font-bold text-blue-900 text-sm">
                        {rider.vehicle?.insulated_delivery_bag
                          ? t('yes')
                          : t('no')}
                      </p>
                    </div>

                    {rider.vehicle?.air_conditioning !== undefined && (
                      <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
                        <p className="text-xs text-blue-900 font-medium mb-1">
                          {t('airConditioningLabel')}
                        </p>
                        <p className="font-bold text-blue-900 text-sm">
                          {rider.vehicle.air_conditioning ? t('yes') : t('no')}
                        </p>
                      </div>
                    )}

                    {rider.vehicle?.helmet !== undefined && (
                      <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
                        <p className="text-xs text-blue-900 font-medium mb-1">
                          {t('helmetLabel')}
                        </p>
                        <p className="font-bold text-blue-900 text-sm">
                          {rider.vehicle.helmet ? t('yes') : t('no')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 rounded-xl border border-emerald-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4 w-full">
                    <div className="p-2 bg-emerald-500 rounded-lg">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-emerald-800">
                      {t('codLimitSettingsTitle')}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
                      <p className="text-xs text-emerald-900 font-medium mb-1">
                        {t('codLimitEnabledLabel')}
                      </p>
                      <p className="font-bold text-emerald-900 text-sm">
                        {codLimitEnabled ? t('yes') : t('no')}
                      </p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
                      <p className="text-xs text-emerald-900 font-medium mb-1">
                        {t('codLimitAmountLabel')}
                      </p>
                      <p className="font-bold text-emerald-900 text-sm">
                        {codLimitEnabled
                          ? codLimitAmount !== null
                            ? `${codLimitAmount} PKR`
                            : t('notAvailable')
                          : t('codLimitDisabledValue')}
                      </p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
                      <p className="text-xs text-emerald-900 font-medium mb-1">
                        {t('codWarningThresholdLabel')}
                      </p>
                      <p className="font-bold text-emerald-900 text-sm">
                        {codLimitEnabled
                          ? codWarningThreshold !== null
                            ? `${codWarningThreshold}%`
                            : t('notAvailable')
                          : t('notApplicable')}
                      </p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
                      <p className="text-xs text-emerald-900 font-medium mb-1">
                        {t('codAutoSettlementCycleLabel')}
                      </p>
                      <p className="font-bold text-emerald-900 text-sm">
                        {codLimitEnabled
                          ? codAutoSettlementCycle
                            ? capitalizeFirstLetter(
                                codAutoSettlementCycle.replace(/_/g, ' '),
                              )
                            : t('notAvailable')
                          : t('notApplicable')}
                      </p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg col-span-2">
                      <p className="text-xs text-emerald-900 font-medium mb-1">
                        {t('codAllowOnlinePaymentsLabel')}
                      </p>
                      <p className="font-bold text-emerald-900 text-sm">
                        {codAllowOnlinePaymentsWhenBlocked === null
                          ? t('notAvailable')
                          : codAllowOnlinePaymentsWhenBlocked
                            ? t('yes')
                            : t('no')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Documents Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {t('documentVerificationTitle')}
                </h3>

                {legacyDocuments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {legacyDocuments.map(document => (
                      <ImagePreview
                        key={document.attachmentId}
                        image={document.url}
                        label={t('legacyDocumentLabel', { number: document.label.replace('DOCUMENT_', '') })}
                        privateSource
                      />
                    ))}
                  </div>
                )}

                <VerificationDocumentCard
                  title={t('documentCardDriverLicense')}
                  icon={ContactRound}
                  frontImg={rider.driver_license_front || ''}
                  backImg={rider.driver_license_back || ''}
                  frontLabel={t('documentCardFront')}
                  backLabel={t('documentCardBack')}
                />

                <VerificationDocumentCard
                  title={t('documentCardNationalIdPassport')}
                  icon={ShieldCheck}
                  frontImg={rider.national_id_passport_front || ''}
                  backImg={rider.national_id_passport_back || ''}
                  frontLabel={t('documentCardFront')}
                  backLabel={t('documentCardBack')}
                />
                <VerificationDocumentCard
                  title={t('documentCardVehicleRegistration')}
                  icon={IdCard}
                  frontImg={rider.vehicle_registration_front || ''}
                  backImg={rider.vehicle_registration_back || ''}
                  frontLabel={t('documentCardFront')}
                  backLabel={t('documentCardBack')}
                />
              </div>
            </div>
          ) : (
            <NoDataFound title={t('riderDetailsNotFound')} />
          )
        }
      </AppDialog>

      {riderId && rider && (
        <RejectRiderDialog
          open={showRejectReasonDialog}
          rider={rider}
          onClose={() => {
            setShowRejectReasonDialog(false);
            onOpenChange(false);
            onAfterAction?.();
          }}
        />
      )}

      {/* Approve Rider Confirmation Dialog */}
      <AppAlertDialog
        title={t('approveRiderDialogTitle')}
        subTitle={t('approveRiderDialogSubtitle')}
        description={t('approveRiderDialogDescription', {
          riderName: rider?.userProfile?.user?.name || t('notAvailable'),
        })}
        open={actionDialog === 'approve'}
        onOpenChange={(open) => {
          if (!open) setActionDialog(null);
        }}
        variant="primary"
        confirmLabel={t('approveRiderConfirmButton')}
        onConfirm={handleApprove}
        loading={isApproving}
      />

      {/* Block Rider Confirmation Dialog */}
      <AppAlertDialog
        title={t('blockRiderDialogTitle')}
        subTitle={t('blockRiderDialogSubtitle')}
        description={t('blockRiderDialogDescription', {
          riderName: rider?.userProfile?.user?.name || t('notAvailable'),
        })}
        open={actionDialog === 'block'}
        onOpenChange={(open) => {
          if (!open) setActionDialog(null);
        }}
        variant="delete"
        confirmLabel={t('blockRiderConfirmButton')}
        onConfirm={handleBlock}
        loading={isBlocking}
      />

      {/* Unblock Rider Confirmation Dialog */}
      <AppAlertDialog
        title={t('unblockRiderDialogTitle')}
        subTitle={t('unblockRiderDialogSubtitle')}
        description={t('unblockRiderDialogDescription', {
          riderName: rider?.userProfile?.user?.name || t('notAvailable'),
        })}
        open={actionDialog === 'unblock'}
        onOpenChange={(open) => {
          if (!open) setActionDialog(null);
        }}
        variant="primary"
        confirmLabel={t('unblockRiderConfirmButton')}
        onConfirm={handleUnblock}
        loading={isUnblocking}
      />
    </>
  );
}
