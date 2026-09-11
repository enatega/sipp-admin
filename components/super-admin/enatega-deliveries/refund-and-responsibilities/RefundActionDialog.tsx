'use client';

import { useState } from 'react';
import {
  ApproveRefundRequest,
  RefundRequest,
} from '@/types/api/super-admin/enatega-deliveries/refunds-and-responsibilities';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import { AppInputField as AppInput } from '@/components/shared/form/AppInput';

export interface RefundActionPayload {
  isPartialRefund: boolean;
  pointsPerUsd: number;
  storeDeductionPoints: number;
  riderDeductionPoints: number;
  internalNotes: string;
}

interface RefundActionDialogProps {
  open: boolean;
  type: 'approve' | 'reject' | null;
  request: RefundRequest | null;
  onClose: () => void;
  onConfirm: (payload: ApproveRefundRequest) => void;
  isLoading: boolean;
}

export function RefundActionDialog({
  open,
  type,
  request,
  onClose,
  onConfirm,
  isLoading,
}: RefundActionDialogProps) {
  const [isPartialRefund, setIsPartialRefund] = useState(
    request?.refund_type === 'partial',
  );
  const [pointsPerUsd, setPointsPerUsd] = useState('10');
  const [approvedAmount, setSetApprovedAmount] = useState(0);
  const [storeDeductionPoints, setStoreDeductionPoints] = useState('0');
  const [riderDeductionPoints, setRiderDeductionPoints] = useState('0');
  const [internalNotes, setInternalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  if (!open || !type || !request) {
    return null;
  }

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={
        type === 'approve' ? 'Approve Refund Request' : 'Reject Refund Request'
      }
      description={`Review admin action details for ${request.request_id}.`}
      size="lg"
      showDefaultFooter={false}
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton
            variant={type === 'approve' ? 'green' : 'red'}
            onClick={() =>
              onConfirm({
                partial_refund: isPartialRefund,
                points_per_usd: Number(pointsPerUsd) || 0,
                store_deduction_points: Number(storeDeductionPoints) || 0,
                rider_deduction_points: Number(riderDeductionPoints) || 0,
                internal_notes: internalNotes,
                approved_amount: approvedAmount,
              })
            }
            disabled={
              (type === 'reject' && rejectionReason === '') || isLoading
            }
          >
            {type === 'approve' ? 'Approve' : 'Reject'}
          </AppButton>
        </div>
      }
    >
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Admin Actions</h3>

        <div className="flex items-center justify-between rounded-lg bg-accent/40 px-3 py-2">
          <p className="text-sm font-medium">Partial Refund</p>
          <Switch
            checked={isPartialRefund}
            onCheckedChange={setIsPartialRefund}
          />
        </div>
        <AppInput
          type="number"
          name="approved_amount"
          label="Approved Amount"
          value={approvedAmount}
          onChange={(event) => setSetApprovedAmount(Number(event.target.value))}
          min={0}
        />
        <AppInput
          type="number"
          name="pointsPerUsd"
          label="Points per 1 USD"
          value={pointsPerUsd}
          onChange={(event) => setPointsPerUsd(event.target.value)}
          min={0}
        />
        <AppInput
          type="number"
          name="storeDeductionPoints"
          label="Store Deduction (Points)"
          value={storeDeductionPoints}
          onChange={(event) => setStoreDeductionPoints(event.target.value)}
          min={0}
        />
        <AppInput
          type="number"
          name="riderDeductionPoints"
          label="Rider Deduction (Points)"
          value={riderDeductionPoints}
          onChange={(event) => setRiderDeductionPoints(event.target.value)}
          min={0}
        />
        {type === 'approve' && (
          <div>
            <label className="mb-1 block text-[15px] font-medium">
              Internal Notes (Optional)
            </label>
            <Textarea
              value={internalNotes}
              onChange={(event) => setInternalNotes(event.target.value)}
              placeholder="Add note for internal use..."
              rows={4}
            />
          </div>
        )}

        {type === 'reject' && (
          <div>
            <label className="mb-1 block text-[15px] font-medium">
              Rejection Reason
            </label>
            <Textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Add rejection reason here..."
              rows={4}
            />
          </div>
        )}
      </div>
    </AppDialog>
  );
}
