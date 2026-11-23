'use client';

import { DEFAULT_CURRENCY } from '@/constants/currency.constants';

import { UNIT_OF_MEASURE_OPTIONS } from '@/constants/product-form.constants';
import { productFormStep1Schema } from '@/schemas/store/deliveries/product-form';
import type { EditProductFormValues } from '@/types';
import { Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import * as Yup from 'yup';
import type { Product } from '@/types/entities/store/deliveries/product';
import {
  calculatePriceAfterDeal,
  findDealSummaryById,
} from '@/lib/deal-pricing';
import { formatCurrency } from '@/lib/formatCurrency';
import { hasVariationSettings } from '@/lib/product-variation-settings';
import { useGetActiveDeals } from '@/hooks/api/store/deliveries/product-management/deals';
import { useCurrency } from '@/hooks/use-currency';
import { Switch } from '@/components/ui/switch';
import { AppButton } from '@/components/shared/AppButton';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import CategoryAsyncSelect from '@/components/store/deliveries/product-management/common/CategoryAsyncSelect';
import DealsAsyncMultiSelect from '@/components/store/deliveries/product-management/common/DealsAsyncMultiSelect';
import SubCategoryAsyncSelect from '@/components/store/deliveries/product-management/common/SubCategoryAsyncSelect';
import ProductTaxField from '../ProductTaxField';
import { ProductNameTranslationsFields } from '../ProductNameTranslationsFields';
import { CatalogTextTranslationsFields } from '@/components/store/deliveries/product-management/common/CatalogTextTranslationsFields';
import { ProductFavouriteFoodTagsField } from '../ProductFavouriteFoodTagsField';
import { ProductSkuField } from '../variation-settings/ProductSkuField';

interface EditProductBasicInformationFormProps {
  initialValues: EditProductFormValues;
  product: Product;
  storeId?: string;
  isSubmitting: boolean;
  disableSubmit?: boolean;
  onSubmit: (values: EditProductFormValues) => void;
}
const UNLIMITED_STOCK_VALUE = '2147483647';
const UNLIMITED_STOCK_THRESHOLD = 1000000;

export function EditProductBasicInformationForm({
  initialValues,
  product,
  storeId,
  isSubmitting,
  disableSubmit,
  onSubmit,
}: EditProductBasicInformationFormProps) {
  const t = useTranslations('products.addProduct.step1');
  const tForm = useTranslations('products.form');
  const tSchema = useTranslations();
  // Every saved product already has a SKU (auto-generated if none was given),
  // so editing must keep one.
  const editSchema = productFormStep1Schema(tSchema).shape({
    sku: Yup.string()
      .trim()
      .required(tSchema('products.Schemas.product.skuRequired'))
      .max(100, tSchema('products.Schemas.product.skuMaxLength')),
  });
  const { currencySymbol } = useCurrency();
  const resolvedCurrencySymbol = currencySymbol || DEFAULT_CURRENCY.symbol;
  const hasVariations = product.customizationGroups?.some(
    (group) => group?.type === 'variation',
  ) ?? false;
  // Stock is then kept on each variation, so it is not asked here.
  const hasStockPerVariation = hasVariationSettings(product);
  const omittedFields: Array<'price' | 'stockQuantity'> = [
    ...(hasVariations ? (['price'] as const) : []),
    ...(hasStockPerVariation ? (['stockQuantity'] as const) : []),
  ];
  const { data: activeDeals } = useGetActiveDeals(
    storeId
      ? {
          store_id: storeId,
          offset: 0,
          limit: 200,
        }
      : null,
    {
      enabled: !!storeId,
    },
  );
  const initialSelectedDeal = (() => {
    if (!Array.isArray(product.deals)) return null;

    for (const deal of product.deals) {
      const id = typeof deal?.id === 'string' ? deal.id : '';
      if (!id) continue;

      const dealNameValue = deal.deal_name ?? deal.dealName;
      return {
        id,
        deal_name:
          typeof dealNameValue === 'string' && dealNameValue.trim().length > 0
            ? dealNameValue
            : id,
        discountType: deal.discountType ?? deal.discount_type,
        discountValue: deal.discountValue ?? deal.discount_value,
      };
    }

    return null;
  })();

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('description')}</p>
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={omittedFields.length
          ? editSchema.omit(omittedFields)
          : editSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting: isFormSubmitting, values, setFieldValue }) => {
          const selectedDealSummary = findDealSummaryById(
            activeDeals?.data,
            values.dealId,
          );
          const basePrice = Number(values.price);
          const priceAfterDeal = calculatePriceAfterDeal(
            basePrice,
            selectedDealSummary,
          );
          const isUnlimitedStock =
            Number(values.stockQuantity || 0) >= UNLIMITED_STOCK_THRESHOLD;

          return (
            <Form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <AppInputField
                  label={t('nameLabel')}
                  name="name"
                  type="text"
                  placeholder={t('namePlaceholder')}
                  requiredAsterisk
                />

                <ProductSkuField
                  label={t('skuLabel')}
                  name="sku"
                  placeholder={t('skuPlaceholder')}
                  helperText={t('skuEditHelper')}
                  requiredAsterisk
                  storeId={storeId || product.store_id}
                  scope="product"
                  productId={product.id}
                />

                <div className="md:col-span-2">
                  <ProductNameTranslationsFields />
                </div>

                <CategoryAsyncSelect
                  label={t('categoryLabel')}
                  name="categoryId"
                  placeholder={t('categoryPlaceholder')}
                  storeId={storeId}
                  requiredAsterisk
                  initialSelectedCategory={
                    product.category
                      ? {
                          id: product.category.id,
                          store_id: product.store_id,
                          categoryName:
                            product.category.categoryName ||
                            product.category.name ||
                            '',
                          imageURL: null,
                          parentId: null,
                          is_active: true,
                          createdAt: '',
                        }
                      : null
                  }
                />

                <SubCategoryAsyncSelect
                  label={t('subcategoryLabel')}
                  name="subcategoryId"
                  placeholder={t('subcategoryPlaceholder')}
                  storeId={storeId}
                  parentCategoryId={values.categoryId}
                  initialSelectedSubCategory={
                    product.subcategory
                      ? {
                          ...product.subcategory,
                          store_id: product.store_id,
                          categoryName:
                            product.subcategory.categoryName ||
                            product.subcategory.name ||
                            '',
                          is_active: true,
                          createdAt: '',
                          parentId:
                            values.categoryId || product.category?.id || null,
                        }
                      : null
                  }
                />

                <ProductFavouriteFoodTagsField
                  storeId={storeId || product.store_id}
                  initialSelected={product.favouriteFoods}
                  fullWidth={false}
                />
              </div>

              {hasVariations ? (
                <ProductTaxField currentRate={product.taxRate} showPriceInfo={false} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <AppInputField
                    label={`${t('priceLabel')} (${resolvedCurrencySymbol})`}
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={t('pricePlaceholder')}
                    prefix={
                      <span className="font-semibold text-ink">
                        {resolvedCurrencySymbol}
                      </span>
                    }
                    requiredAsterisk
                  />
                  <ProductTaxField currentRate={product.taxRate} />
                </div>
              )}

              <div
                className={
                  hasStockPerVariation
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-5'
                    : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                }
              >
                {hasStockPerVariation ? null : (
                <div className="space-y-2">
                  <AppInputField
                    label={t('stockQuantityLabel')}
                    name="stockQuantity"
                    type="number"
                    min="0"
                    placeholder={t('stockQuantityPlaceholder')}
                    requiredAsterisk
                    disabled={isUnlimitedStock}
                    {...(isUnlimitedStock ? { value: '' } : {})}
                  />
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium">
                      Unlimited Stock
                    </label>
                    <Switch
                      checked={isUnlimitedStock}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFieldValue('stockQuantity', UNLIMITED_STOCK_VALUE);
                          return;
                        }
                        if (
                          Number(values.stockQuantity || 0) >=
                          UNLIMITED_STOCK_THRESHOLD
                        ) {
                          setFieldValue('stockQuantity', '');
                        }
                      }}
                    />
                  </div>
                </div>
                )}

                <AppSelect
                  label={t('unitOfMeasureLabel')}
                  name="unitOfMeasure"
                  placeholder={t('unitOfMeasurePlaceholder')}
                  options={UNIT_OF_MEASURE_OPTIONS}
                  showInputOnOtherSelect
                />

                <DealsAsyncMultiSelect
                  label={t('dealsLabel')}
                  name="dealId"
                  placeholder={t('dealsPlaceholder')}
                  storeId={storeId}
                  initialSelectedDeal={initialSelectedDeal || null}
                />
              </div>

              {!hasVariations && selectedDealSummary && Number.isFinite(basePrice) ? (
                <div className="rounded-lg border border-ink/20 bg-primary/5 p-3 text-sm">
                  <p className="font-medium text-foreground">
                    {t('priceAfterDealLabel')}:{' '}
                    {priceAfterDeal === null
                      ? t('priceAfterDealNotAvailable')
                      : formatCurrency(priceAfterDeal, resolvedCurrencySymbol)}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    {t('priceAfterDealDescription', {
                      deal: selectedDealSummary.dealName,
                    })}
                  </p>
                </div>
              ) : null}

              <AppTextarea
                label={t('descriptionLabel')}
                name="description"
                placeholder={t('descriptionPlaceholder')}
                rows={4}
              />

              <CatalogTextTranslationsFields
                kind="productDescription"
                sourceName="description"
                translationsName="descriptionTranslations"
                multiline
                textType="html"
                maxLength={2000}
              />

              <AppFileInput
                name="image"
                label={t('imageLabel')}
                helperText={t('imageHelper')}
                requiredAsterisk
                maxSizeMB={5}
                acceptTypes={[
                  'image/png',
                  'image/jpeg',
                  'image/jpg',
                  'image/webp',
                ]}
              />

              <div className="flex items-end justify-end">
                <AppButton
                  type="submit"
                  isLoading={isFormSubmitting || isSubmitting}
                  disabled={isFormSubmitting || isSubmitting || disableSubmit}
                  className="px-12 h-10 rounded-[12px] mt-6"
                >
                  {tForm('updateButton')}
                </AppButton>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
