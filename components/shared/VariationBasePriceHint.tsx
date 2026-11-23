'use client';

import * as React from 'react';
import Image from 'next/image';
import { Eye, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppButton } from './AppButton';
import { AppDialog } from './AppDialog';

const DEMO_SCREENSHOTS = [
  {
    key: 'single',
    src: '/images/product-variation-demo/base-product-variation-demo.png',
    width: 936,
    height: 1378,
  },
  {
    key: 'multiple',
    src: '/images/product-variation-demo/multiple-variations-demo.png',
    width: 930,
    height: 1382,
  },
] as const;

// Explains that the first variation doubles as the product's base price,
// with customer-facing screenshots of the single vs. multiple variation cases.
export function VariationBasePriceHint() {
  const t = useTranslations('products.addProduct.step2.baseVariationHint');
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  return (
    <>
      <div
        role="note"
        className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground sm:flex-row sm:items-start"
      >
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-medium">{t('title')}</p>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <AppButton
          type="button"
          variant="secondary"
          className="shrink-0"
          onClick={() => setIsPreviewOpen(true)}
          leftIcon={<Eye className="size-4" />}
        >
          {t('previewButton')}
        </AppButton>
      </div>

      <AppDialog
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        showDefaultFooter={false}
        size="3xl"
        title={t('previewTitle')}
      >
        <div className="grid grid-cols-1 gap-6 py-3 sm:grid-cols-2">
          {DEMO_SCREENSHOTS.map((shot) => (
            <figure key={shot.key} className="space-y-2">
              <figcaption className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  {t(`${shot.key}.title`)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(`${shot.key}.description`)}
                </p>
              </figcaption>
              <Image
                src={shot.src}
                alt={t(`${shot.key}.title`)}
                width={shot.width}
                height={shot.height}
                className="h-auto w-full rounded-xl border bg-white"
              />
            </figure>
          ))}
        </div>
      </AppDialog>
    </>
  );
}
