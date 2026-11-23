'use client';

import type { ReactNode } from 'react';
import { useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import { UNIT_OF_MEASURE_OPTIONS } from '@/constants/product-form.constants';
import type { VendorProductBasicsFormValues } from '@/types';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppTextarea } from '@/components/shared/form/AppTextarea';
import { NewProductSkuField } from '@/components/store/deliveries/product-management/products/variation-settings/NewProductSkuField';
import VendorCategoryAsyncSelect from '@/components/vendor/deliveries/product-management/common/VendorCategoryAsyncSelect';
import VendorMenuTemplateAsyncMultiSelect from '@/components/vendor/deliveries/product-management/common/VendorMenuTemplateAsyncMultiSelect';
import VendorSubCategoryAsyncSelect from '@/components/vendor/deliveries/product-management/common/VendorSubCategoryAsyncSelect';

interface Props {
  vendorId?: string;
  /** Product SKU the server reserved for this form; `null` while there is none. */
  suggestedSku?: string | null;
  /** Store an edited SKU is checked in; without it no check is made. */
  skuStoreId?: string;
  /** Fill the suggestion in when it arrives; off once the user has been here before. */
  autoFillSku?: boolean;
  /** Extra grid cells placed after the SKU (price, stock). */
  children?: ReactNode;
  /** Extra grid cells placed after the unit of measure (add-ons). */
  afterUnit?: ReactNode;
}

/**
 * The product details asked by both vendor add-product forms: name, menus,
 * category, subcategory, SKU, unit, description and image.
 */
export function ProductBasicsFields({
  vendorId,
  suggestedSku,
  skuStoreId,
  autoFillSku,
  children,
  afterUnit,
}: Props) {
  const t = useTranslations('products.addProduct.step1');
  const { values } = useFormikContext<VendorProductBasicsFormValues>();

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

        <VendorMenuTemplateAsyncMultiSelect
          label={t('menuTemplateLabel')}
          name="menuIds"
          placeholder={t('menuTemplatePlaceholder')}
          vendorId={vendorId}
          requiredAsterisk
        />

        <VendorCategoryAsyncSelect
          label={t('categoryLabel')}
          name="categoryId"
          placeholder={t('categoryPlaceholder')}
          vendorId={vendorId}
          requiredAsterisk
        />

        <VendorSubCategoryAsyncSelect
          label={t('subcategoryLabel')}
          name="subcategoryId"
          placeholder={t('subcategoryPlaceholder')}
          vendorId={vendorId}
          parentCategoryId={values.categoryId}
        />

        <NewProductSkuField
          name="sku"
          scope="product"
          storeId={skuStoreId}
          prefilledSku={suggestedSku}
          trustedSku={suggestedSku}
          autoFill={autoFillSku}
        />

        {children}

        <AppSelect
          label={t('unitOfMeasureLabel')}
          name="unitOfMeasure"
          placeholder={t('unitOfMeasurePlaceholder')}
          options={UNIT_OF_MEASURE_OPTIONS}
        />

        {afterUnit}
      </div>

      <AppTextarea
        label={t('descriptionLabel')}
        name="description"
        placeholder={t('descriptionPlaceholder')}
        rows={4}
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
