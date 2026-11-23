import type { ProductCustomizationGroup } from '@/types/entities/store/deliveries/product';

/** The product API synthesizes an option with the group's own ID for direct-price variations. */
export function hasPersistedVariationOptions(
  group: Pick<ProductCustomizationGroup, 'id' | 'options'> | null | undefined,
): boolean {
  return group?.options?.some((option) => option.id !== group.id) ?? false;
}
