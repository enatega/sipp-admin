'use client';

import { MoreVertical, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReferralRule } from '../types';

interface RuleCardProps {
  rule: ReferralRule;
  onEdit: () => void;
}

const RuleCard = ({ rule, onEdit }: RuleCardProps) => {
  const t = useTranslations('deliveriesCustomerLoyaltyAndReferrals.referralRules');

  return (
    <div className="w-[220px] p-4 rounded-lg border bg-white shadow-sm">
      <div className="flex items-start justify-between">
        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-red-50 text-red-600 border border-red-100">
          {rule.triggerEvent}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger className="border px-2 py-1.5 rounded-md shadow hover:bg-accent">
            <MoreVertical size={20} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-[150px] p-0 rounded-xl overflow-hidden shadow-lg"
          >
            <DropdownMenuItem
              className="flex items-center gap-2 p-3 cursor-pointer rounded-none"
              onClick={onEdit}
            >
              <Pencil className="size-[18px]" />
              <span className="text-sm">{t('edit')}</span>
            </DropdownMenuItem>
            {/* Delete option commented out for now */}
            {/* <DropdownMenuItem
              className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:!bg-red-100"
              onClick={onDelete}
            >
              <Trash2 className="size-[18px] text-destructive" />
              <span className="text-sm text-destructive">{t('delete')}</span>
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="mt-4 text-2xl font-bold">
        {rule.points} {t('points')}
      </p>
    </div>
  );
};

export { RuleCard };
