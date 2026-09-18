/** Keep unrelated saves from rewriting existing legacy settings or missing values. */
export function pruneUnchangedStoreFields<T extends object>(
  payload: FormData,
  values: T,
  initial: T,
  fields: Partial<Record<keyof T, string | string[]>>,
): void {
  for (const field of Object.keys(fields) as (keyof T)[]) {
    const value = values[field];
    if (
      value == null ||
      value === '' ||
      JSON.stringify(value) === JSON.stringify(initial[field])
    ) {
      const keys = fields[field];
      for (const key of Array.isArray(keys) ? keys : keys ? [keys] : []) {
        payload.delete(key);
      }
    }
  }
}

export const STORE_EDIT_PAYLOAD_FIELDS = {
  address: 'address', tagLine: 'tag_line', description: 'description',
  minimumOrderValue: 'minimumOrder', shopType: 'shopType',
  productTaxMode: 'productTaxMode', taxRateId: 'taxRateId', zoneId: 'zoneId',
  location: 'address_zone', exactStoreLocation: ['latitude', 'longitude'],
  storeTimings: 'storeTimings', bankName: 'bank_name',
  accountHolderName: 'account_holder_name', accountNumber: 'account_number',
  branchCode: 'branch_code', prepareTime: 'prepare_time',
  packingCharges: 'packing_charges', scheduleBooking: 'allow_schedule_booking',
  pickupAllowed: 'pickup_allow', deliveryAllowed: 'delivery_allow',
  baseFee: 'base_fee', perKmFee: 'per_km_fee',
  freeDeliveryThreshold: 'free_delivery_threashold',
};
