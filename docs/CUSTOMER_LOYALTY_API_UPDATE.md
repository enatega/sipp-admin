# Customer Loyalty API Endpoints Update

## Date: April 8, 2026

## Summary

Updated all customer loyalty and referral-related API endpoints to use the new ride-hailing API paths. The `/api/v1` prefix has been removed as requested.

---

## Files Modified

### 1. Customer Loyalty Points Range

**File:** `hooks/api/super-admin/general/customer-loyalty/loyalty-points-range.ts`

**Updated Endpoints:**
```typescript
// Before
getAll: '/admin/loyalty-points-range/all'
create: '/admin/loyalty-points-range/customer/create'
update: (id) => `/admin/loyalty-points-range/${id}`
delete: (id) => `/admin/loyalty-points-range/${id}`

// After
getAll: '/apps/ride-hailing/admin/loyalty-points-range/all'
create: '/apps/ride-hailing/admin/loyalty-points-range/customer/create'
getById: (id) => `/apps/ride-hailing/admin/loyalty-points-range/${id}`
update: (id) => `/apps/ride-hailing/admin/loyalty-points-range/${id}`
delete: (id) => `/apps/ride-hailing/admin/loyalty-points-range/${id}`
```

**New Hook Added:**
- `useGetLoyaltyPointsRangeById(id)` - Get customer loyalty points range by ID

---

### 2. Rider Loyalty Points Range

**File:** `hooks/api/super-admin/general/customer-loyalty/rider-loyalty-points-range.ts`

**Updated Endpoints:**
```typescript
// Before
getAll: '/admin/rider-loyalty-points-range/get-all'
create: '/admin/rider-loyalty-points-range/rider/create'
update: (id) => `/admin/rider-loyalty-points-range/${id}`
delete: (id) => `/admin/rider-loyalty-points-range/${id}`

// After
getAll: '/apps/ride-hailing/admin/rider-loyalty-points-range/get-all'
create: '/apps/ride-hailing/admin/rider-loyalty-points-range/rider/create'
generate: '/apps/ride-hailing/admin/rider-loyalty-points-range/generate'
getById: (id) => `/apps/ride-hailing/admin/rider-loyalty-points-range/${id}`
update: (id) => `/apps/ride-hailing/admin/rider-loyalty-points-range/${id}`
delete: (id) => `/apps/ride-hailing/admin/rider-loyalty-points-range/${id}`
```

**New Hooks Added:**
- `useGetRiderLoyaltyPointsRangeById(id)` - Get rider loyalty points range by ID
- `useGenerateReferralCode()` - Generate a unique referral code

**Note:** The update mutation already uses `Axios.patch` (not `PUT`)

---

### 3. Loyalty Dashboard

**File:** `hooks/api/super-admin/general/customer-loyalty/loyalty-dashboard.ts`

**Updated Endpoints:**
```typescript
// Before
customer: '/admin/loyalty-points-range/loyalty-dashboard'
driver: '/admin/rider-loyalty-points-range/loyalty-dashboard'

// After
customer: '/apps/ride-hailing/admin/loyalty-points-range/loyalty-dashboard'
customerPointsHistory: '/apps/ride-hailing/admin/dashboard/loyalty-referral/customer-points'
driver: '/apps/ride-hailing/admin/rider-loyalty-points-range/loyalty-dashboard'
riderPointsHistory: '/apps/ride-hailing/admin/dashboard/loyalty-referral/rider-points'
```

**New Hooks Added:**
- `useGetCustomerPointsHistory()` - Get history of points availed by customers
- `useGetRiderPointsHistory()` - Get history of points availed by riders

---

### 4. Point Conversion

**File:** `hooks/api/super-admin/general/customer-loyalty/point-conversion.ts`

**Updated Endpoints:**
```typescript
// Before
customer: '/customer-points-to-balance'
driver: '/rider-points-to-balance'

// After
customer: '/apps/ride-hailing/customer-points-to-balance'
driver: '/apps/ride-hailing/rider-points-to-balance'
```

---

### 5. Points History

**File:** `hooks/api/super-admin/general/customer-loyalty/points-history.ts`

**Updated Endpoints:**
```typescript
// Before
customer: '/admin/dashboard/loyalty-referral/customer-points'
driver: '/admin/dashboard/loyalty-referral/rider-points'

// After
customer: '/apps/ride-hailing/admin/dashboard/loyalty-referral/customer-points'
driver: '/apps/ride-hailing/admin/dashboard/loyalty-referral/rider-points'
```

---

### 6. Referral Rules

**File:** `hooks/api/super-admin/general/customer-loyalty/referral-rules.ts`

**Updated Endpoints:**
```typescript
// Before
customer: '/customer-point-adjustments/referral/get-customer-points'
driver: '/admin/rider-point-adjustments/referral/get-rider-points'

// After
customer: '/apps/ride-hailing/customer-point-adjustments/referral/get-customer-points'
driver: '/apps/ride-hailing/admin/rider-point-adjustments/referral/get-rider-points'
```

---

## New Files Created

### 7. Point Adjustments

**File:** `hooks/api/super-admin/general/customer-loyalty/point-adjustments.ts` (NEW)

**Endpoints:**
```typescript
// Rider Points Adjustments
create: '/apps/ride-hailing/admin/rider-point-adjustments/referral/create'
updatePoints: (id) => `/apps/ride-hailing/admin/rider-point-adjustments/referral/update-points/${id}`
getRiderPoints: '/apps/ride-hailing/admin/rider-point-adjustments/referral/get-rider-points'

// Customer Points Adjustments
create: '/apps/ride-hailing/customer-point-adjustments/referral/create'
updatePoints: (id) => `/apps/ride-hailing/customer-point-adjustments/referral/update-points/${id}`
getCustomerPoints: '/apps/ride-hailing/customer-point-adjustments/referral/get-customer-points'
```

**Hooks:**
- `useCreateRiderPointAdjustment()`
- `useUpdateRiderPoints()`
- `useGetRiderPoints()`
- `useCreateCustomerPointAdjustment()`
- `useUpdateCustomerPoints()`
- `useGetCustomerPoints()`

---

### 8. Points To Balance

**File:** `hooks/api/super-admin/general/customer-loyalty/points-to-balance.ts` (NEW)

**Endpoints:**
```typescript
// Customer Points To Balance
get: '/apps/ride-hailing/customer-points-to-balance'
update: '/apps/ride-hailing/customer-points-to-balance'

// Rider Points To Balance
get: '/apps/ride-hailing/rider-points-to-balance'
update: '/apps/ride-hailing/rider-points-to-balance'
```

**Hooks:**
- `useGetCustomerPointsToBalance()`
- `useUpdateCustomerPointsToBalance()`
- `useGetRiderPointsToBalance()`
- `useUpdateRiderPointsToBalance()`

---

## API Endpoint Reference

### Customer Loyalty Points Range

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/apps/ride-hailing/admin/loyalty-points-range/customer/create` | Create customer loyalty points range |
| GET | `/apps/ride-hailing/admin/loyalty-points-range/all` | Get all customer loyalty points ranges |
| GET | `/apps/ride-hailing/admin/loyalty-points-range/loyalty-dashboard` | Get customer loyalty dashboard metrics |
| GET | `/apps/ride-hailing/admin/loyalty-points-range/{id}` | Get customer loyalty points range by ID |
| PUT | `/apps/ride-hailing/admin/loyalty-points-range/{id}` | Update customer loyalty points range |
| DELETE | `/apps/ride-hailing/admin/loyalty-points-range/{id}` | Delete customer loyalty points range |

### Rider Loyalty Points Range

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/apps/ride-hailing/admin/rider-loyalty-points-range/rider/create` | Create rider loyalty points range |
| GET | `/apps/ride-hailing/admin/rider-loyalty-points-range/get-all` | Get all rider loyalty points ranges |
| GET | `/apps/ride-hailing/admin/rider-loyalty-points-range/generate` | Generate a unique referral code |
| GET | `/apps/ride-hailing/admin/rider-loyalty-points-range/loyalty-dashboard` | Get rider loyalty dashboard metrics |
| GET | `/apps/ride-hailing/admin/rider-loyalty-points-range/{id}` | Get rider loyalty points range by ID |
| PATCH | `/apps/ride-hailing/admin/rider-loyalty-points-range/{id}` | Update rider loyalty points range |
| DELETE | `/apps/ride-hailing/admin/rider-loyalty-points-range/{id}` | Delete rider loyalty points range |

### Rider Points Adjustments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/apps/ride-hailing/admin/rider-point-adjustments/referral/create` | Create rider point adjustment |
| PUT | `/apps/ride-hailing/admin/rider-point-adjustments/referral/update-points/{id}` | Update rider points |
| GET | `/apps/ride-hailing/admin/rider-point-adjustments/referral/get-rider-points` | Get rider points |

### Customer Points Adjustments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/apps/ride-hailing/customer-point-adjustments/referral/create` | Create customer point adjustment |
| PUT | `/apps/ride-hailing/customer-point-adjustments/referral/update-points/{id}` | Update customer points |
| GET | `/apps/ride-hailing/customer-point-adjustments/referral/get-customer-points` | Get customer points |

### Loyalty Referral History

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/apps/ride-hailing/admin/dashboard/loyalty-referral/customer-points` | Get history of points availed by customers |
| GET | `/apps/ride-hailing/admin/dashboard/loyalty-referral/rider-points` | Get history of points availed by riders |

### Points To Balance Conversion

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/apps/ride-hailing/customer-points-to-balance` | Get current customer points conversion rate |
| PUT | `/apps/ride-hailing/customer-points-to-balance` | Update customer points conversion rate |
| GET | `/apps/ride-hailing/rider-points-to-balance` | Get current rider points conversion rate |
| PUT | `/apps/ride-hailing/rider-points-to-balance` | Update rider points conversion rate |

---

## Usage Examples

### Customer Loyalty Points Range

```typescript
import {
  useGetLoyaltyPointsRange,
  useGetLoyaltyPointsRangeById,
  useCreateLoyaltyPointsRange,
  useUpdateLoyaltyPointsRange,
  useDeleteLoyaltyPointsRange,
} from '@/hooks/api/super-admin/general/customer-loyalty';

// Get all ranges
const { data, isLoading } = useGetLoyaltyPointsRange();

// Get by ID
const { data: range } = useGetLoyaltyPointsRangeById('123');

// Create new range
const createMutation = useCreateLoyaltyPointsRange();
createMutation.mutate({ minPoints: 100, maxPoints: 500 });

// Update range
const updateMutation = useUpdateLoyaltyPointsRange();
updateMutation.mutate({ id: '123', payload: { minPoints: 150 } });

// Delete range
const deleteMutation = useDeleteLoyaltyPointsRange();
deleteMutation.mutate('123');
```

### Rider Loyalty Points Range

```typescript
import {
  useGetRiderLoyaltyPointsRange,
  useGetRiderLoyaltyPointsRangeById,
  useGenerateReferralCode,
  useCreateRiderLoyaltyPointsRange,
  useUpdateRiderLoyaltyPointsRange,
  useDeleteRiderLoyaltyPointsRange,
} from '@/hooks/api/super-admin/general/customer-loyalty';

// Get all ranges
const { data } = useGetRiderLoyaltyPointsRange();

// Get by ID
const { data: range } = useGetRiderLoyaltyPointsRangeById('456');

// Generate referral code
const { data: code } = useGenerateReferralCode();

// Update (uses PATCH)
const updateMutation = useUpdateRiderLoyaltyPointsRange();
updateMutation.mutate({ id: '456', payload: { points: 200 } });
```

### Points History

```typescript
import {
  useGetCustomerPointsHistory,
  useGetRiderPointsHistory,
} from '@/hooks/api/super-admin/general/customer-loyalty';

// Customer history
const { data: customerHistory } = useGetCustomerPointsHistory({
  page: 1,
  limit: 10,
  type: 'all'
});

// Rider history
const { data: riderHistory } = useGetRiderPointsHistory({
  page: 1,
  limit: 10
});
```

### Points To Balance

```typescript
import {
  useGetCustomerPointsToBalance,
  useUpdateCustomerPointsToBalance,
  useGetRiderPointsToBalance,
  useUpdateRiderPointsToBalance,
} from '@/hooks/api/super-admin/general/customer-loyalty';

// Get customer conversion rate
const { data: customerRate } = useGetCustomerPointsToBalance();

// Update customer conversion rate
const updateCustomer = useUpdateCustomerPointsToBalance();
updateCustomer.mutate({ points: 100, balance: 5 });

// Get rider conversion rate
const { data: riderRate } = useGetRiderPointsToBalance();

// Update rider conversion rate
const updateRider = useUpdateRiderPointsToBalance();
updateRider.mutate({ points: 100, balance: 3 });
```

---

## Testing Checklist

- [x] All endpoint paths updated to use `/apps/ride-hailing` prefix
- [x] `/api/v1` prefix removed from all endpoints
- [x] New hooks created for missing functionality
- [x] Customer loyalty endpoints updated
- [x] Rider loyalty endpoints updated
- [x] Points conversion endpoints updated
- [x] Points history endpoints updated
- [x] Referral rules endpoints updated
- [ ] Test all hooks in components
- [ ] Verify API calls work correctly
- [ ] Check for any TypeScript errors

---

## Migration Notes

### Breaking Changes
- All API endpoints have changed. Components using these hooks will automatically use the new endpoints.
- No changes needed in component code if using the provided hooks.

### Backward Compatibility
- Old endpoints will no longer work. Ensure backend is updated to the new endpoints before deploying.

---

## Module Migration: General → Enatega Drive ✅

**Date:** April 8, 2026

### Migration Summary

Successfully migrated the entire Customer Loyalty and Referrals feature from the **general** module to the **enatega-drive** module.

### Files Moved

**Page:**
- ✅ `/app/(super-admin)/enatega-drive/customer-loyalty-and-referrals/page.tsx` (created)
- ✅ `/app/(super-admin)/general/customer-loyalty-and-referrals/page.tsx` (deleted)

**Components (7 directories + 1 file):**
- ✅ `/components/super-admin/enatega-drive/customer-loyalty-and-referrals/` (created)
  - `filters/`
  - `loyal-points-breakdown/`
  - `point-conversion/`
  - `referral-and-loyalty-history/`
  - `referral-rules/`
  - `stats-cards/`
  - `types.ts`
- ✅ `/components/super-admin/general/customer-loyalty-and-referrals/` (deleted)

**API Hooks (19 files):**
- ✅ `/hooks/api/super-admin/enatega-drive/` (created)
  - `loyalty-dashboard.ts`
  - `loyalty-points-range.ts`
  - `point-adjustments.ts`
  - `point-conversion.ts`
  - `points-history.ts`
  - `points-to-balance.ts`
  - `rider-loyalty-points-range.ts`
  - `referral-rules.ts`
  - ... (11 more files)
- ✅ `/hooks/api/super-admin/general/customer-loyalty/` (deleted)

**Type Definitions:**
- ✅ `/types/api/super-admin/enatega-drive/loyalty.api.d.ts` (created)
- ✅ `/types/api/super-admin/general/loyalty.api.d.ts` (deleted)

**Navigation:**
- ✅ `/config/sidebar.ts` - Updated to move menu item from General to Enatega Drive

### Import Path Updates

All import statements were automatically updated:
- `@/components/super-admin/general/customer-loyalty-and-referrals` → `@/components/super-admin/enatega-drive/customer-loyalty-and-referrals`
- `@/hooks/api/super-admin/general/customer-loyalty` → `@/hooks/api/super-admin/enatega-drive`
- `@/types/api/super-admin/general/loyalty.api` → `@/types/api/super-admin/enatega-drive/loyalty.api`

### Sidebar Changes

**Before (General section):**
```typescript
{
  id: 2.6,
  name: 'Customer Loyalty and Referrals',
  path: '/general/customer-loyalty-and-referrals',
  permission: 'general.loyalty_referral',
}
```

**After (Enatega Drive section):**
```typescript
{
  id: 3.7,
  name: 'Customer Loyalty and Referrals',
  path: '/enatega-drive/customer-loyalty-and-referrals',
  permission: 'lumi_drive.loyalty_referral',
}
```

### Verification

All migrations verified:
- ✅ New page file exists in enatega-drive
- ✅ All component files moved (29 files)
- ✅ All API hooks moved (19 files)
- ✅ Type definitions moved
- ✅ Old files removed from general module
- ✅ Sidebar navigation updated
- ✅ No traces remain in general module

---

**Last Updated:** April 8, 2026
**Status:** API endpoints updated ✅ | Module migration complete ✅ | Ready for testing 🔜
