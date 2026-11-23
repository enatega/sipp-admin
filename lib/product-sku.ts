/**
 * SKU of a product's n-th variation (1-based), by the server's convention
 * `<product sku>-<n>`. Blank while the product has no SKU: the server then
 * generates both.
 */
export const deriveVariationSku = (
  productSku: string | null | undefined,
  position: number,
): string => {
  const sku = productSku?.trim();
  return sku ? `${sku}-${position}` : '';
};

/** True while a variation SKU is still the one derived for its card, i.e. the user has not typed their own. */
const followsProductSku = (
  sku: string | undefined,
  productSku: string | null | undefined,
  position: number,
): boolean => (sku ?? '').trim() === deriveVariationSku(productSku, position);

/**
 * Variations without the one at `index`. SKUs that followed their card
 * position are renumbered; edited ones stay as typed.
 */
export const removeVariationKeepingSkus = <T extends { sku?: string }>(
  variations: T[],
  index: number,
  productSku: string | null | undefined,
): T[] =>
  variations.flatMap((variation, position) => {
    if (position === index) return [];
    if (position < index) return [variation];
    return [
      followsProductSku(variation.sku, productSku, position + 1)
        ? { ...variation, sku: deriveVariationSku(productSku, position) }
        : variation,
    ];
  });

/**
 * Variations kept from an earlier visit of the form, after the product SKU
 * changed: SKUs that followed the old product SKU follow the new one.
 */
export const rebaseVariationSkus = <T extends { sku?: string }>(
  variations: T[],
  previousProductSku: string | null | undefined,
  productSku: string | null | undefined,
): T[] =>
  variations.map((variation, index) =>
    followsProductSku(variation.sku, previousProductSku, index + 1)
      ? { ...variation, sku: deriveVariationSku(productSku, index + 1) }
      : variation,
  );
