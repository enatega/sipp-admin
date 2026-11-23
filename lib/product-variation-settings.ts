import type {
  ProductCustomizationGroup,
  ProductVariationSettings,
  ProductVariationSettingsFormValues,
} from '@/types/entities/store/deliveries/product';
import { hasPersistedVariationOptions } from '@/lib/product-variation-options';

/** Form value of a stock field while its "Unlimited" switch is on. */
export const UNLIMITED_STOCK_VALUE = '2147483647';
export const UNLIMITED_STOCK_THRESHOLD = 1000000;

export const isUnlimitedStockValue = (value: unknown): boolean =>
  Number(value || 0) >= UNLIMITED_STOCK_THRESHOLD;

/** Form stock value -> API stock of a variation (`null` = unlimited). */
export const toVariationStockQuantity = (value: unknown): number | null =>
  isUnlimitedStockValue(value) ? null : Math.max(0, Math.trunc(Number(value) || 0));

/** API stock of a variation -> form stock value. */
export const toStockFormValue = (stockQuantity: number | null | undefined): string =>
  stockQuantity === null ||
  stockQuantity === undefined ||
  stockQuantity >= UNLIMITED_STOCK_THRESHOLD
    ? UNLIMITED_STOCK_VALUE
    : String(stockQuantity);

export const hasVariationSettings = (
  product: { variationSettings?: ProductVariationSettings[] | null } | null | undefined,
): boolean => (product?.variationSettings?.length ?? 0) > 0;

export const findVariationSettings = (
  settings: ProductVariationSettings[] | null | undefined,
  variationId: string | null | undefined,
): ProductVariationSettings | null =>
  settings?.find((row) => row.variationId === variationId) ?? null;

export type VariationStockState =
  | { kind: 'unlimited' }
  | { kind: 'outOfStock' }
  | { kind: 'tracked'; quantity: number };

export const getVariationStockState = (
  settings: Pick<ProductVariationSettings, 'stockQuantity' | 'inStock'>,
): VariationStockState => {
  if (!settings.inStock || settings.stockQuantity === 0) return { kind: 'outOfStock' };
  if (settings.stockQuantity === null) return { kind: 'unlimited' };
  return { kind: 'tracked', quantity: settings.stockQuantity };
};

/** Form defaults: a new variation is in stock, unlimited and has no add-ons. */
export const toVariationSettingsFormValues = (
  settings?: ProductVariationSettings | null,
  fallbackSku?: string | null,
): Required<ProductVariationSettingsFormValues> => ({
  sku: settings?.sku ?? fallbackSku ?? '',
  stockQuantity: toStockFormValue(settings?.stockQuantity),
  inStock: settings?.inStock ?? true,
  addOnIds: settings?.addOnGroupIds ?? [],
});

/** Body of the variation settings call; a blank SKU is left unchanged. */
export const toVariationSettingsPayload = (
  values: ProductVariationSettingsFormValues,
) => ({
  ...(values.sku?.trim() ? { sku: values.sku.trim() } : {}),
  stockQuantity: toVariationStockQuantity(values.stockQuantity),
  inStock: values.inStock ?? true,
  addOnIds: values.addOnIds ?? [],
});

export interface ProductVariationName {
  variationId: string;
  name: string;
}

/**
 * The names customers pick from, keyed like `variationSettings`: the options
 * of an option-backed variation, otherwise the variation group itself.
 */
export const listVariationNames = (
  variationGroups: ProductCustomizationGroup[],
): ProductVariationName[] =>
  variationGroups.flatMap((group) =>
    hasPersistedVariationOptions(group)
      ? group.options
          .filter((option) => option.id !== group.id)
          .map((option) => ({ variationId: option.id, name: option.title }))
      : [{ variationId: group.id, name: group.name }],
  );

/** Names of the variations an add-on group is offered with; `null` = all of them. */
export const getAddonVariationNames = (
  addOnGroupId: string,
  settings: ProductVariationSettings[],
  variationNames: ProductVariationName[],
): string[] | null => {
  const offeredWith = settings.filter((row) =>
    row.addOnGroupIds.includes(addOnGroupId),
  );
  if (settings.length > 0 && offeredWith.length === settings.length) return null;
  return offeredWith.map(
    (row) =>
      variationNames.find((entry) => entry.variationId === row.variationId)?.name ??
      row.sku ??
      row.variationId,
  );
};
