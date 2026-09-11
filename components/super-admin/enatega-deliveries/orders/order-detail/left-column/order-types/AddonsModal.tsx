'use client';

import { AppDialog } from '@/components/shared/AppDialog';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { useTranslations } from 'next-intl';

type Addon = {
  name: string;
  price: number;
};

interface AddonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  addons: Addon[];
}

export function AddonsModal({ isOpen, onClose, addons }: AddonsModalProps) {
  const t = useTranslations('orders.orderDetail.addonsModal');
  const totalAmount = addons.reduce((acc, addon) => acc + addon.price, 0);

  return (
    <AppDialog
      open={isOpen}
      onClose={onClose}
      title={t('title')}
      size="md"
      showDefaultFooter={false}
    >
      <div className="flex flex-col gap-5 py-1">
        <div className="rounded-xl border border-sidebar-border bg-accent/30 p-3">
          <div className="max-h-[320px] overflow-y-auto pr-1 space-y-2">
            {addons.map((addon, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-sidebar-border bg-white px-3 py-2.5"
              >
                <span className="text-black font-medium text-sm">
                  {addon?.name}
                </span>
                <span className="text-primary font-semibold text-sm">
                  <CurrencyDisplay amount={addon?.price} />
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3.5 flex justify-between items-center">
          <span className="text-black font-semibold text-base">
            {t('totalAmount')}
          </span>
          <span className="text-primary font-bold text-lg">
            <CurrencyDisplay amount={totalAmount} />
          </span>
        </div>
      </div>
    </AppDialog>
  );
}
