'use client';

import { useState } from 'react';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RefundRequestStatus, RefundType } from './types';

export interface RefundFilters {
  status: 'all' | RefundRequestStatus;
  refundType: 'all' | RefundType;
}

interface RefundFiltersDialogProps {
  open: boolean;
  onClose: () => void;
  filters: RefundFilters;
  onApply: (filters: RefundFilters) => void;
}

export function RefundFiltersDialog({
  open,
  onClose,
  filters,
  onApply,
}: RefundFiltersDialogProps) {
  const [draft, setDraft] = useState<RefundFilters>(filters);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="Filter Requests"
      description="Filter refund requests by status and refund type."
      size="md"
      showDefaultFooter={false}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={draft.status}
            onValueChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                status: value as RefundFilters['status'],
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="automatic">Automatic</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Refund Type</label>
          <Select
            value={draft.refundType}
            onValueChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                refundType: value as RefundFilters['refundType'],
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select refund type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="full">Full</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <AppButton
            variant="secondary"
            onClick={() => setDraft({ status: 'all', refundType: 'all' })}
          >
            Reset
          </AppButton>
          <AppButton
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Apply Filters
          </AppButton>
        </div>
      </div>
    </AppDialog>
  );
}
