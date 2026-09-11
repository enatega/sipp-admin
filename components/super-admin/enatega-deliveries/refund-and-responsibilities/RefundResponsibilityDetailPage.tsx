'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { ApiErrorResponse } from '@/types';
import {
  ArrowLeft,
  CalendarClock,
  CircleAlert,
  Store,
  UserRound,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateTime } from '@/lib/formatDateTime';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import { cn } from '@/lib/utils';
import {
  useApproveRefundRequest,
  useGetRefundRequestActivityLogById,
  useGetRefundRequestDetailById,
  useRejectRefundRequest,
} from '@/hooks/api/super-admin/enatega-deliveries/refund-and-responsibilities';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { AppButton } from '@/components/shared/AppButton';
import CardShimmer from '@/components/shared/CardShimmer';
import DisplayError from '@/components/shared/DisplayError';
import { AppInputField } from '@/components/shared/form/AppInput';
import { Heading } from '@/components/shared/Heading';
import { buildScopedDeliveriesAdminPathFromCurrent } from '@/lib/routes';
import RefundResponsibilitiesDetailPageShimmer from './RefundResponsibilitiesDetailPageShimmer';

const formatCurrency = (amount?: number | null) =>
  `$${Number(amount || 0).toFixed(2)}`;

const formatDate = (date?: string | null) => {
  if (!date) return '-';
  return formatDateTime(date);
};

export function RefundResponsibilityDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const requestIdParam = params.requestId;

  const { data, isLoading, error, isError } = useGetRefundRequestDetailById(
    requestIdParam as string,
  );
  const {
    data: activityLog,
    isLoading: isActivityLogLoading,
    error: activityLogError,
  } = useGetRefundRequestActivityLogById(requestIdParam as string);
  const { mutateAsync: approveRequest, isPending: isApproving } =
    useApproveRefundRequest();
  const { mutateAsync: rejectRequest, isPending: isRejecting } =
    useRejectRefundRequest();
  const request = data;

  const [isPartialRefund, setIsPartialRefund] = useState(false);
  const [pointsPerUsd, setPointsPerUsd] = useState('10');
  const [approvedAmount, setSetApprovedAmount] = useState(0);

  const [storeDeductionPoints, setStoreDeductionPoints] = useState('0');
  const [riderDeductionPoints, setRiderDeductionPoints] = useState('0');
  const [internalNotes, setInternalNotes] = useState('');

  const [currentAction, setCurrentAction] = useState<
    'approve' | 'reject' | null
  >(null);

  // dialog config

  const dialogProps = useMemo(() => {
    if (currentAction === 'approve') {
      return {
        title: 'Approve Refund Request',
        subTitle: 'Are you sure?',
        description:
          'This action will approve the refund request and apply the configured points adjustment.',
        variant: 'green',
        confirmLabel: 'Approve Refund',
      };
    }

    if (currentAction === 'reject') {
      return {
        title: 'Reject Refund Request',
        subTitle: 'Confirmation Required',
        description:
          'This action will reject the refund request. This action cannot be undone.',
        variant: 'red',
        confirmLabel: 'Reject Refund',
      };
    }

    return {
      title: '',
      subTitle: '',
      description: '',
      variant: 'default',
      confirmLabel: '',
    };
  }, [currentAction]);
  /**
   * Prefill admin action values from API
   */
  useEffect(() => {
    if (!request) return;

    setIsPartialRefund(
      request?.refund_request_details?.refund_type === 'partial',
    );
    setPointsPerUsd(String(request?.admin_actions?.points_per_usd ?? 10));
    setStoreDeductionPoints(
      String(request?.admin_actions?.store_deduction_points ?? 0),
    );
    setRiderDeductionPoints(
      String(request?.admin_actions?.rider_deduction_points ?? 0),
    );
  }, [request]);

  const customerPoints = useMemo(() => {
    const rate = Number(pointsPerUsd) || 0;
    const requestedAmount =
      Number(request?.refund_request_details?.requested_amount) || 0;

    return Math.round(requestedAmount * rate);
  }, [pointsPerUsd, request]);

  const storePoints = Number(storeDeductionPoints) || 0;
  const riderPoints = Number(riderDeductionPoints) || 0;
  const netSystemImpact = customerPoints - storePoints - riderPoints;
  const isRejectDisabled = !internalNotes?.trim();
  // confirm handler

  const handleConfirmAction = async () => {
    if (!currentAction) return;

    try {
      if (currentAction === 'approve') {
        const response = await approveRequest({
          id: requestIdParam as string,
          ApproveRefundRequest: {
            internal_notes: internalNotes,
            partial_refund: isPartialRefund,
            points_per_usd: customerPoints,
            rider_deduction_points: riderPoints,
            store_deduction_points: storePoints,
            approved_amount: approvedAmount,
          },
        });
        toast.success(
          response.message || 'Refund Request Approved Successfully',
        );
      }

      if (currentAction === 'reject') {
        const response = await rejectRequest({
          id: requestIdParam as string,
          internal_note: { internal_notes: internalNotes },
        });
        toast.success(
          response.message || 'Refund Request Rejected Successfully',
        );
      }
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    } finally {
      setCurrentAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Heading title="Refund Request" showBackBtn />
        <RefundResponsibilitiesDetailPageShimmer />
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="space-y-4">
        <Heading title="Refund Request" showBackBtn />
        <DisplayError
          title="Refund request not found"
          message={returnErrorMessage(error as ApiErrorResponse)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          type="button"
          onClick={() =>
            router.push(
              buildScopedDeliveriesAdminPathFromCurrent(
                pathname,
                '/enatega-deliveries/refund-and-responsibilities',
              ),
            )
          }
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Refund Requests
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Heading
          title={`Refund Request ${request.request_id}`}
          containerClassName="mb-0"
        />

        <div className="inline-flex items-center gap-2">
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-medium',
              request.status === 'approved' && 'bg-green-100 text-green-700',
              request.status === 'rejected' && 'bg-red-100 text-red-700',
              request.status === 'pending' && 'bg-blue-100 text-blue-700',
            )}
          >
            {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
          </span>

          <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium">
            {formatDate(request?.timeline?.requested_at)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        {/* LEFT SIDE */}
        <div className="space-y-4">
          {/* Order Information */}
          <section className="rounded-xl border bg-white p-4 sm:p-5">
            <h3 className="mb-4 text-base font-semibold">Order Information</h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Order ID</p>
                <p className="font-medium">
                  {request?.order_information?.order_id || '-'}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Payment Type</p>
                <p className="font-medium capitalize">
                  {request?.order_information?.payment_type || '-'}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Total Amount (USD)
                </p>
                <p className="font-medium">
                  {formatCurrency(request?.order_information?.total_amount)}
                </p>
              </div>
            </div>
          </section>

          {/* Customer Information */}
          <section className="rounded-xl border bg-white p-4 sm:p-5">
            <h3 className="mb-4 text-base font-semibold">
              Customer Information
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">
                  {request?.customer_information?.name || '-'}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">
                  {request?.customer_information?.email || '-'}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="font-medium">
                  {request?.customer_information?.phone_number || '-'}
                </p>
              </div>
            </div>
          </section>

          {/* Refund Request Details */}
          <section className="rounded-xl border bg-white p-4 sm:p-5">
            <h3 className="mb-4 text-base font-semibold">
              Refund Request Details
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">
                  Reason for Refund
                </p>

                <p className="rounded-lg border bg-amber-50 px-3 py-2 text-sm">
                  {request?.refund_request_details?.reason_for_refund}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Requested Amount
                </p>

                <p className="text-2xl font-semibold text-red-500">
                  {formatCurrency(
                    request?.refund_request_details?.requested_amount,
                  )}
                </p>

                <span className="mt-1 inline-flex rounded-md bg-accent px-2 py-1 text-xs capitalize">
                  {request?.refund_request_details?.refund_type} Refund
                </span>
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section className="rounded-xl border bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">
                Activity Log / History
              </h3>

              {activityLog?.length ? (
                <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium">
                  {activityLog.length} Activities
                </span>
              ) : null}
            </div>

            {isActivityLogLoading ? (
              <div className="space-y-4">
                <CardShimmer />
              </div>
            ) : activityLogError ? (
              <DisplayError
                title="Failed to fetch activity log"
                message={returnErrorMessage(activityLogError)}
              />
            ) : activityLog?.length ? (
              <div className="relative space-y-5">
                {activityLog.map((activity, index) => {
                  const action = activity?.action || '';
                  const note = activity?.payload?.note || '';

                  const formattedAction = action
                    .replaceAll('_', ' ')
                    .replace(/\b\w/g, (char) => char.toUpperCase());

                  return (
                    <div
                      key={activity.id || index}
                      className="relative flex gap-4"
                    >
                      <div className="flex-1 rounded-xl border bg-accent/20 px-4 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold">
                              {formattedAction}
                            </p>

                            <p className="text-sm text-muted-foreground">
                              {note || 'No additional note provided'}
                            </p>
                          </div>

                          <span className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatDate(activity.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed px-4 py-8 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  No activity history available
                </p>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4">
          {/* Admin Actions */}
          {request.status === 'pending' && (
            <section className="rounded-xl border bg-white p-4 sm:p-5">
              <h3 className="mb-4 text-base font-semibold">Admin Actions</h3>

              <div className="mb-4 flex items-center justify-between rounded-lg bg-accent/40 px-3 py-2">
                <p className="text-sm font-medium">Partial Refund</p>

                <Switch
                  checked={isPartialRefund}
                  onCheckedChange={setIsPartialRefund}
                />
              </div>

              <div className="space-y-4">
                <AppInputField
                  type="number"
                  name="approved_amount"
                  label="Approved Amount"
                  value={approvedAmount}
                  onChange={(event) =>
                    setSetApprovedAmount(Number(event.target.value))
                  }
                  min={0}
                />
                <AppInputField
                  type="number"
                  name="pointsPerUsd"
                  label="Points per 1 USD"
                  value={pointsPerUsd}
                  onChange={(e) => setPointsPerUsd(e.target.value)}
                  min={0}
                />

                <AppInputField
                  type="number"
                  name="storeDeductionPoints"
                  label="Store Deduction (Points)"
                  value={storeDeductionPoints}
                  onChange={(e) => setStoreDeductionPoints(e.target.value)}
                  min={0}
                />

                <AppInputField
                  type="number"
                  name="riderDeductionPoints"
                  label="Rider Deduction (Points)"
                  value={riderDeductionPoints}
                  onChange={(e) => setRiderDeductionPoints(e.target.value)}
                  min={0}
                />

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Internal Notes
                  </label>

                  <Textarea
                    rows={4}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Add note for internal use..."
                  />
                  <p className="text-xs mt-2 text-mute">
                    * Internal note is required for rejection as rejection
                    reason
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <AppButton
                  variant="green"
                  onClick={() => setCurrentAction('approve')}
                >
                  Approve
                </AppButton>

                <AppButton
                  variant="red"
                  onClick={() => setCurrentAction('reject')}
                  disabled={isRejectDisabled}
                >
                  Reject
                </AppButton>
              </div>
            </section>
          )}

          {/* Points Adjustment */}
          <section className="rounded-xl border bg-white p-4 sm:p-5">
            <h3 className="mb-3 text-base font-semibold">Points Adjustment</h3>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-md bg-emerald-50 px-3 py-2 text-emerald-700">
                <span>Customer Points Added</span>
                <span className="font-semibold">+{customerPoints}</span>
              </div>

              <div className="flex items-center justify-between rounded-md bg-red-50 px-3 py-2 text-red-700">
                <span>Store Deduction</span>
                <span className="font-semibold">-{storePoints}</span>
              </div>

              <div className="flex items-center justify-between rounded-md bg-red-50 px-3 py-2 text-red-700">
                <span>Rider Deduction</span>
                <span className="font-semibold">-{riderPoints}</span>
              </div>

              <div className="flex items-center justify-between rounded-md bg-accent px-3 py-2 font-semibold">
                <span>Net System Impact</span>
                <span>
                  {netSystemImpact > 0
                    ? `+${netSystemImpact}`
                    : netSystemImpact}
                </span>
              </div>
            </div>

            <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
              <CircleAlert className="mt-0.5 h-4 w-4" />
              Order amount is converted to customer loyalty points using your
              points-per-USD value.
            </p>
          </section>

          {/* Parties Involved */}
          <section className="rounded-xl border bg-white p-4 sm:p-5">
            <h3 className="mb-3 text-base font-semibold">Parties Involved</h3>

            <div className="space-y-2 text-sm">
              <div className="rounded-md border bg-accent/20 px-3 py-2">
                <p className="text-xs text-muted-foreground">Store Name</p>

                <div className="mt-1 flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  <span className="font-medium">
                    {request?.parties_involved?.store_name}
                  </span>
                </div>
              </div>

              <div className="rounded-md border bg-accent/20 px-3 py-2">
                <p className="text-xs text-muted-foreground">Rider Name</p>

                <div className="mt-1 flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  <span className="font-medium">
                    {request?.parties_involved?.rider_name || '-'}
                  </span>
                </div>
              </div>

              <div className="rounded-md border bg-accent/20 px-3 py-2">
                <p className="text-xs text-muted-foreground">Requested At</p>

                <div className="mt-1 flex items-center gap-2">
                  <CalendarClock className="h-4 w-4" />
                  <span className="font-medium">
                    {formatDate(request?.timeline?.requested_at)}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <AppAlertDialog
        className="w-[850px]!"
        title={dialogProps.title}
        subTitle={dialogProps.subTitle}
        description={dialogProps.description}
        open={!!currentAction}
        onOpenChange={() => setCurrentAction(null)}
        variant={'primary'}
        confirmLabel={dialogProps.confirmLabel}
        onConfirm={handleConfirmAction}
        loading={isApproving || isRejecting}
      />
    </div>
  );
}
