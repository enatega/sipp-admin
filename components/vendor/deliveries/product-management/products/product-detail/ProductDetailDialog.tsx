'use client';

import { useMemo } from 'react';
import { useGetProduct } from '@/hooks/api/vendor/deliveries/product-management/products';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/lib/formatCurrency';
import { returnErrorMessage } from '@/lib/toast-error';
import type { ApiErrorResponse } from '@/types';
import type { Product } from '@/types/entities/store/deliveries/product';
import { useTranslations } from 'next-intl';
import { AppDialog } from '@/components/shared/AppDialog';
import DisplayError from '@/components/shared/DisplayError';

interface ProductDetailDialogProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductDetailDialog: React.FC<ProductDetailDialogProps> = ({
  product,
  isOpen,
  onOpenChange,
}) => {
  const tForm = useTranslations('products.form');
  const tTable = useTranslations('products.table');
  const tActions = useTranslations('products.actions');
  const tErrors = useTranslations('products.errors');
  const tDetailSections = useTranslations('products.detail.sections');
  const tDetailFields = useTranslations('products.detail.fields');
  const tDetailMessages = useTranslations('products.detail.messages');
  const tDetailValues = useTranslations('products.detail.values');
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || '$';
  const productId = product?.id;

  const { data, isLoading, isError, error } = useGetProduct(productId, {
    enabled: isOpen && !!productId,
  });

  const currentProduct = data ?? product;

  const variations = useMemo(
    () =>
      currentProduct?.customizationGroups?.filter(
        (group) => group && group.type === 'variation',
      ) ?? [],
    [currentProduct],
  );

  const addOns = useMemo(
    () =>
      currentProduct?.customizationGroups?.filter(
        (group) => group && group.type === 'add-on',
      ) ?? [],
    [currentProduct],
  );

  const getInitial = (value?: string | null) =>
    value?.trim().charAt(0).toUpperCase() || '?';

  return (
    <AppDialog
      open={isOpen}
      onClose={() => onOpenChange(false)}
      title={currentProduct?.name || tActions('view')}
      size="5xl"
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-40 rounded-xl bg-accent animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-24 rounded-xl bg-accent animate-pulse" />
            <div className="h-24 rounded-xl bg-accent animate-pulse" />
          </div>
        </div>
      ) : isError ? (
        <DisplayError
          message={
            returnErrorMessage(error as ApiErrorResponse) || tErrors('fetchFailed')
          }
        />
      ) : currentProduct ? (
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-5">
            <div className="flex flex-col md:flex-row gap-5">
              <div className="w-full md:w-56 shrink-0">
                {currentProduct.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentProduct.imageUrl}
                    alt={currentProduct.name || tTable('notAvailable')}
                    className="h-56 w-full rounded-xl object-cover border"
                  />
                ) : (
                  <div className="h-56 w-full rounded-xl border bg-accent flex items-center justify-center text-3xl font-semibold">
                    {getInitial(currentProduct.name)}
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {tForm('nameLabel')}
                  </p>
                  <p className="text-2xl font-semibold">
                    {currentProduct.name || tTable('notAvailable')}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border bg-light p-4">
                    <p className="text-xs text-muted-foreground">
                      {tForm('categoryLabel')}
                    </p>
                    <p className="font-medium">
                      {currentProduct.category?.categoryName ||
                        currentProduct.category?.name ||
                        tTable('notAvailable')}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-light p-4">
                    <p className="text-xs text-muted-foreground">
                      {tDetailFields('subcategory')}
                    </p>
                    <p className="font-medium">
                      {currentProduct.subcategory?.categoryName ||
                        currentProduct.subcategory?.name ||
                        currentProduct.subcategory_id ||
                        tTable('notAvailable')}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-light p-4">
                    <p className="text-xs text-muted-foreground">
                      {`${tForm('priceLabel')} (${resolvedCurrencySymbol})`}
                    </p>
                    <p className="font-medium">
                      {formatCurrency(Number(currentProduct.price), resolvedCurrencySymbol)}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-light p-4">
                    <p className="text-xs text-muted-foreground">
                      {tForm('unitOfMeasureLabel')}
                    </p>
                    <p className="font-medium">
                      {currentProduct.unitOfMeasure || tTable('notAvailable')}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-light p-4">
                    <p className="text-xs text-muted-foreground">
                      {tDetailFields('inStock')}
                    </p>
                    <p className="font-medium">
                      {currentProduct.inStock
                        ? tTable('inStock')
                        : tTable('outOfStock')}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-light p-4">
                    <p className="text-xs text-muted-foreground">
                      {tDetailFields('stockQuantity')}
                    </p>
                    <p className="font-medium">{currentProduct.stockQuantity}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm font-semibold mb-2">{tForm('descriptionLabel')}</p>
            <p className="text-sm leading-6 text-muted-foreground">
              {currentProduct.description || tTable('notAvailable')}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {tDetailSections('variations')}
              </h3>
              <span className="text-sm text-muted-foreground">
                {variations.length}
              </span>
            </div>
            {variations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {tDetailMessages('noVariations')}
              </p>
            ) : (
              <div className="space-y-3">
                {variations.map((variation) => (
                  <div
                    key={variation.id}
                    className="rounded-xl border bg-light p-4 flex flex-col md:flex-row gap-4"
                  >
                    <div className="w-full md:w-24 shrink-0">
                      {variation.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={variation.imageUrl}
                          alt={variation.name || tTable('notAvailable')}
                          className="h-24 w-full rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="h-24 w-full rounded-lg border bg-white flex items-center justify-center text-lg font-medium">
                          {getInitial(variation.name)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {tForm('nameLabel')}
                        </p>
                        <p className="font-medium">
                          {variation.name || tTable('notAvailable')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {`Price (${resolvedCurrencySymbol})`}
                        </p>
                        <p className="font-medium">
                          {formatCurrency(Number(variation.price), resolvedCurrencySymbol)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{tForm('addonsLabel')}</h3>
              <span className="text-sm text-muted-foreground">{addOns.length}</span>
            </div>
            {addOns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {tDetailMessages('noAddOns')}
              </p>
            ) : (
              <div className="space-y-3">
                {addOns.map((addOn) => (
                  <div key={addOn.id} className="rounded-xl border bg-light p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {tForm('nameLabel')}
                        </p>
                        <p className="font-medium">
                          {addOn.name || tTable('notAvailable')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {tDetailFields('selectionType')}
                        </p>
                        <p className="font-medium">{addOn.selectionType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {tDetailFields('required')}
                        </p>
                        <p className="font-medium">
                          {addOn.requiredCheck
                            ? tDetailValues('yes')
                            : tDetailValues('no')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {tDetailFields('options')}
                        </p>
                        <p className="font-medium">{addOn.options.length}</p>
                      </div>
                    </div>
                    {addOn.description ? (
                      <p className="text-sm text-muted-foreground leading-6">
                        {addOn.description}
                      </p>
                    ) : null}
                    <div className="rounded-lg border bg-white p-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        {tDetailFields('linkedOptions')}
                      </p>
                      {addOn.options.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          {tDetailMessages('noLinkedOptions')}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {addOn.options.map((option) => (
                            <div
                              key={option.id}
                              className="rounded-md border bg-light p-3"
                            >
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    {tDetailFields('optionTitle')}
                                  </p>
                                  <p className="font-medium">{option.title}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    {`Price (${resolvedCurrencySymbol})`}
                                  </p>
                                  <p className="font-medium">
                                    {formatCurrency(
                                      Number(option.price),
                                      resolvedCurrencySymbol,
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    {tDetailFields('optionStock')}
                                  </p>
                                  <p className="font-medium">{option.stockQuantity}</p>
                                </div>
                              </div>
                              {option.description ? (
                                <p className="mt-2 text-sm text-muted-foreground">
                                  {option.description}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </AppDialog>
  );
};
