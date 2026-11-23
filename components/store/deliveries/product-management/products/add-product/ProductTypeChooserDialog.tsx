'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/shared/AppButton';
import { AppDialog } from '@/components/shared/AppDialog';

export type ProductFormType = 'single' | 'multiple';

export const isProductFormType = (
  value: string | null | undefined,
): value is ProductFormType => value === 'single' || value === 'multiple';

// Customer-facing screenshots; `focus` keeps the telling part in the frame.
const PRODUCT_TYPES = [
  {
    type: 'single',
    src: '/images/product-variation-demo/single-product-demo.png',
    width: 479,
    height: 933,
    focus: 'center 30%',
  },
  {
    type: 'multiple',
    src: '/images/product-variation-demo/product-with-variations-demo.png',
    width: 476,
    height: 933,
    focus: 'center 52%',
  },
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (type: ProductFormType) => void;
}

/** First step of "Add product": pick a single product or one with variations. */
export function ProductTypeChooserDialog({ open, onClose, onSelect }: Props) {
  const t = useTranslations('products.addProduct.chooser');

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      showDefaultFooter={false}
      size="3xl"
      title={t('title')}
    >
      <div className="grid grid-cols-1 gap-4 py-3 sm:grid-cols-2">
        {PRODUCT_TYPES.map((item) => (
          <div
            key={item.type}
            className="flex flex-col gap-3 rounded-xl border bg-white p-4"
          >
            <div className="h-64 overflow-hidden rounded-lg border bg-light sm:h-72">
              <Image
                src={item.src}
                alt={t(`${item.type}.imageAlt`)}
                width={item.width}
                height={item.height}
                className="h-full w-full object-cover"
                style={{ objectPosition: item.focus }}
              />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-base font-semibold text-foreground">
                {t(`${item.type}.title`)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t(`${item.type}.description`)}
              </p>
            </div>
            <AppButton
              type="button"
              className="w-full"
              onClick={() => onSelect(item.type)}
            >
              {t(`${item.type}.button`)}
            </AppButton>
          </div>
        ))}
      </div>
    </AppDialog>
  );
}
