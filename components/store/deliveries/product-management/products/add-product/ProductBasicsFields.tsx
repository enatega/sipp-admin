'use client';

import type { ReactNode } from 'react';
import { useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import { UNIT_OF_MEASURE_OPTIONS } from '@/constants/product-form.constants';
import type { ProductBasicsFormValues } from '@/types';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import { CatalogTextTranslationsFields } from '@/components/store/deliveries/product-management/common/CatalogTextTranslationsFields';
import CategoryAsyncSelect from '@/components/store/deliveries/product-management/common/CategoryAsyncSelect';
import DealsAsyncMultiSelect from '@/components/store/deliveries/product-management/common/DealsAsyncMultiSelect';
import SubCategoryAsyncSelect from '@/components/store/deliveries/product-management/common/SubCategoryAsyncSelect';
import { ProductFavouriteFoodTagsField } from '../ProductFavouriteFoodTagsField';
import { ProductNameTranslationsFields } from '../ProductNameTranslationsFields';
import ProductTaxField from '../ProductTaxField';
import { NewProductSkuField } from '../variation-settings/NewProductSkuField';

interface Props {
  storeId?: string;
  /** Product SKU the server reserved for this form; `null` while there is none. */
  suggestedSku?: string | null;
  /** Fill the suggestion in when it arrives; off once the user has been here before. */
  autoFillSku?: boolean;
  /** Extra grid cells placed after the tax field (price, stock). */
  children?: ReactNode;
  /** Extra grid cells placed after the unit of measure (add-ons). */
  afterUnit?: ReactNode;
}

/**
 * The product details asked by both add-product forms: name, category, SKU,
 * tags, tax, unit, deal, description and image.
 */
export function ProductBasicsFields({
  storeId,
  suggestedSku,
  autoFillSku,
  children,
  afterUnit,
}: Props) {
  const t = useTranslations('products.addProduct.step1');
  const { values } = useFormikContext<ProductBasicsFormValues>();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInputField
          label={t('nameLabel')}
          name="name"
          type="text"
          placeholder={t('namePlaceholder')}
          requiredAsterisk
        />

        <CategoryAsyncSelect
          label={t('categoryLabel')}
          name="categoryId"
          placeholder={t('categoryPlaceholder')}
          storeId={storeId}
          requiredAsterisk
        />

        <div className="md:col-span-2">
          <ProductNameTranslationsFields />
        </div>

        <NewProductSkuField
          name="sku"
          scope="product"
          storeId={storeId}
          prefilledSku={suggestedSku}
          trustedSku={suggestedSku}
          autoFill={autoFillSku}
        />

        <SubCategoryAsyncSelect
          label={t('subcategoryLabel')}
          name="subcategoryId"
          placeholder={t('subcategoryPlaceholder')}
          storeId={storeId}
          parentCategoryId={values.categoryId}
        />

        <ProductFavouriteFoodTagsField storeId={storeId} fullWidth={false} />

        <ProductTaxField showPriceInfo={false} />

        {children}

        <AppSelect
          label={t('unitOfMeasureLabel')}
          name="unitOfMeasure"
          placeholder={t('unitOfMeasurePlaceholder')}
          options={UNIT_OF_MEASURE_OPTIONS}
          showInputOnOtherSelect
        />

        {afterUnit}

        <DealsAsyncMultiSelect
          label={t('dealsLabel')}
          name="dealId"
          placeholder={t('dealsPlaceholder')}
          storeId={storeId}
        />
      </div>

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
        acceptTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp']}
      />
    </>
  );
}
