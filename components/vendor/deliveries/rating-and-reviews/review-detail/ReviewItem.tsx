'use client';

import Image from 'next/image';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { EllipsisVertical, EyeOff, Trash2 } from 'lucide-react';
import { ManageStoreReviewAction, VendorStoreReviewItem } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AverageRatingDisplay } from '@/components/shared/AverageRatingDisplay';

interface ReviewItemProps {
  item: VendorStoreReviewItem;
  onAction: (reviewId: string, action: ManageStoreReviewAction) => void;
  disabled?: boolean;
  isLast?: boolean;
}

const ReviewItem = ({ item, onAction, disabled, isLast = false }: ReviewItemProps) => {
  const t = useTranslations('vendorRatingReviews.detail.item');

  return (
    <div className={isLast ? 'py-5' : 'border-b py-5'}>
      <div className="flex flex-col lg:flex-row items-start gap-4">
        <div className="flex gap-3 flex-1">
          <Image
            src={item.user.image || '/images/enatega-deliveries/profile.jpg'}
            width={40}
            height={40}
            alt={item.user.name}
            className="h-10 w-10 rounded-full object-cover"
            unoptimized
          />
          <div>
            <p className="font-medium">{item.user.name}</p>
            <p className="text-sm text-muted-foreground">{item.user.email}</p>
          </div>
        </div>

        <div className="space-y-1 flex-2">
          <div className="flex justify-between">
            <div className="flex items-center gap-3">
              <AverageRatingDisplay
                rating={item.rating}
                showLabel={false}
                size="sm"
              />
              <span className="text-sm text-muted-foreground">
                {moment(item.review_date).format('DD MMM YYYY, hh:mm A')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('orderIdLabel')}: {item.order_id ?? t('notAvailable')}
            </p>
          </div>

          <p className="text-sm text-muted-foreground">{item.comment}</p>
        </div>
        <div className="flex w-full justify-end flex-[0.5]">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={disabled}
              aria-label={t('actionsAriaLabel')}
            >
              <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px] p-1">
              <DropdownMenuItem
                className="cursor-pointer rounded-md px-2 py-2"
                onClick={() => onAction(item.review_id, 'hide')}
              >
                <EyeOff className="mr-2 h-4 w-4 text-muted-foreground" />
                {t('hide')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-md px-2 py-2 text-help-red focus:text-help-red"
                onClick={() => onAction(item.review_id, 'delete')}
              >
                <Trash2 className="mr-2 h-4 w-4 text-help-red" />
                {t('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default ReviewItem;
