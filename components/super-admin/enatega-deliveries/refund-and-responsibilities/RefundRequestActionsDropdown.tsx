'use client';

import { CheckCircle2, Eye, MoreVertical, XCircle } from 'lucide-react';
import { RefundRequest } from '@/types/api/super-admin/enatega-deliveries/refunds-and-responsibilities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RefundRequestActionsDropdownProps {
  request: RefundRequest;
  onView: (request: RefundRequest) => void;
  onApprove: (request: RefundRequest) => void;
  onReject: (request: RefundRequest) => void;
}

export function RefundRequestActionsDropdown({
  request,
  onView,
  onApprove,
  onReject,
}: RefundRequestActionsDropdownProps) {
  const isPending = request.status === 'pending';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="border px-2 py-1.5 rounded-md shadow"
        onClick={(event) => event.stopPropagation()}
      >
        <MoreVertical size={20} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[170px] p-0 rounded-xl overflow-hidden shadow-lg"
      >
        <DropdownMenuItem
          className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
          onClick={(event) => {
            event.stopPropagation();
            onView(request);
          }}
        >
          <Eye className="size-[18px]" />
          <span className="text-sm">View Details</span>
        </DropdownMenuItem>

        {isPending ? (
          <>
            <DropdownMenuItem
              className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
              onClick={(event) => {
                event.stopPropagation();
                onApprove(request);
              }}
            >
              <CheckCircle2 className="size-[18px] text-help-green" />
              <span className="text-sm text-help-green">Approve</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="flex items-center gap-2 p-3 cursor-pointer rounded-none"
              onClick={(event) => {
                event.stopPropagation();
                onReject(request);
              }}
            >
              <XCircle className="size-[18px] text-help-red" />
              <span className="text-sm text-help-red">Reject</span>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
