import { AdminProfile, Role, RolePermission, ShopMode, User } from '@/types';
import CryptoJS from 'crypto-js';
import { adminRoutes, canonicalizeAdminPath } from '@/lib/routes';
import { getStorePath } from '@/lib/store';

const SECRET_KEY = process.env.NEXT_PUBLIC_AUTH_SECRET_KEY as string;

if (!SECRET_KEY) {
  console.warn('AUTH_SECRET_KEY is not defined in your .env file');
}

export type StoredUser = User;

// Shop Mode Storage Constants
const SHOP_MODE_STORAGE_KEY = 'shopMode';

const SHOP_MODE_BLOCKED_ROUTE_PREFIXES: Record<ShopMode, string[]> = {
  SINGLE_VENDOR: [adminRoutes.deliveries.vendors],
  MULTI_VENDOR: [],
  STORE_CHAIN: [],
};

const normalizePath = (path: string) => path.split('?')[0];

const normalizeShopMode = (shopMode?: string | null): ShopMode | null => {
  if (
    shopMode === 'SINGLE_VENDOR' ||
    shopMode === 'MULTI_VENDOR' ||
    shopMode === 'STORE_CHAIN'
  ) {
    return shopMode;
  }
  return null;
};

export const storeAdminProfiles = (profiles: AdminProfile[]): void => {
  try {
    if (typeof window === 'undefined') return;

    const encryptedProfiles = CryptoJS.AES.encrypt(
      JSON.stringify(profiles),
      SECRET_KEY,
    ).toString();
    localStorage.setItem('adminProfiles', encryptedProfiles);
  } catch (error) {
    console.error('Error storing admin profiles:', error);
  }
};

export const getAdminProfiles = (): AdminProfile[] | null => {
  try {
    if (typeof window === 'undefined') return null;

    const encryptedProfiles = localStorage.getItem('adminProfiles');
    if (!encryptedProfiles) return null;

    const bytes = CryptoJS.AES.decrypt(encryptedProfiles, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;

    return JSON.parse(decrypted) as AdminProfile[];
  } catch (error) {
    console.error('Error getting admin profiles:', error);
    return null;
  }
};

export const removeAdminProfiles = (): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('adminProfiles');
  } catch (error) {
    console.error('Error removing admin profiles:', error);
  }
};

export const storeUser = (user: StoredUser): void => {
  try {
    if (typeof window === 'undefined') return;

    const encryptedUser = CryptoJS.AES.encrypt(
      JSON.stringify(user),
      SECRET_KEY,
    ).toString();
    localStorage.setItem('user', encryptedUser);
  } catch (error) {
    console.error('Error storing user:', error);
  }
};

// 2. Get User (Decrypt and retrieve from localStorage)
export const getUser = (): StoredUser | null => {
  try {
    if (typeof window === 'undefined') return null;

    const encryptedUser = localStorage.getItem('user');
    if (!encryptedUser) return null;

    const bytes = CryptoJS.AES.decrypt(encryptedUser, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;

    return JSON.parse(decrypted) as StoredUser;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const getProfileByKey = (
  profiles: AdminProfile[] | null | undefined,
  key: string,
) => {
  const normalizeProfileKey = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '');

  const normalizedTargetKey = normalizeProfileKey(key);

  return profiles?.find(
    (profile) => normalizeProfileKey(profile.key) === normalizedTargetKey,
  );
};

export const getVendorProfileId = (
  profiles: AdminProfile[] | null | undefined = getAdminProfiles(),
): string | null => getProfileByKey(profiles, 'Vendor')?.data?.id ?? null;

export const getVendorDashboardPath = (
  profiles: AdminProfile[] | null | undefined = getAdminProfiles(),
): string | null => {
  const vendorProfile = getProfileByKey(profiles, 'Vendor');
  const vendorId = vendorProfile?.data?.id;

  if (typeof vendorId !== 'string' || !vendorId) {
    return null;
  }

  return `/vendor/deliveries/${vendorId}`;
};

export const getStoreProfileId = (
  profiles: AdminProfile[] | null | undefined = getAdminProfiles(),
): string | null => getProfileByKey(profiles, 'Store')?.data?.id ?? null;

export const getStoreDashboardPath = (
  profiles: AdminProfile[] | null | undefined = getAdminProfiles(),
): string | null => {
  const storeProfile = getProfileByKey(profiles, 'Store');

  const storeId = storeProfile?.data?.id;
  if (typeof storeId !== 'string' || !storeId) {
    return null;
  }

  return getStorePath(storeId);
};

export const hasAdminProfile = (
  profiles: AdminProfile[] | null | undefined = getAdminProfiles(),
) =>
  Boolean(
    getProfileByKey(profiles, 'Admin') || getProfileByKey(profiles, 'Staff'),
  );

export const hasStoreProfile = (
  profiles: AdminProfile[] | null | undefined = getAdminProfiles(),
) => Boolean(getProfileByKey(profiles, 'Store'));

export const shouldRedirectVendorToResetPassword = (
  profiles: AdminProfile[] | null | undefined = getAdminProfiles(),
): boolean => {
  const vendorProfile = getProfileByKey(profiles, 'Vendor');
  return vendorProfile?.data?.allow_password_change === true;
};

export const resolvePostLoginPath = (
  profiles: AdminProfile[] | null | undefined = getAdminProfiles(),
): string => {
  if (hasAdminProfile(profiles)) {
    return '/';
  }

  const vendorDashboardPath = getVendorDashboardPath(profiles);
  if (vendorDashboardPath) {
    return vendorDashboardPath;
  }

  const storeDashboardPath = getStoreDashboardPath(profiles);
  if (storeDashboardPath) {
    return storeDashboardPath;
  }

  return '/';
};

// 3. Remove User (Remove user from localStorage)
export const removeUser = (): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
    localStorage.removeItem(SHOP_MODE_STORAGE_KEY);
    removeAdminProfiles();
    removeRoleAndPermissions();
  } catch (error) {
    console.error('Error removing user:', error);
  }
};

// Shop Mode Storage Functions
export const storeShopMode = (shopMode?: ShopMode | null): void => {
  try {
    if (typeof window === 'undefined') return;
    const normalizedShopMode = normalizeShopMode(shopMode);
    if (!normalizedShopMode) {
      localStorage.removeItem(SHOP_MODE_STORAGE_KEY);
      return;
    }
    const encryptedShopMode = CryptoJS.AES.encrypt(
      JSON.stringify(normalizedShopMode),
      SECRET_KEY,
    ).toString();
    localStorage.setItem(SHOP_MODE_STORAGE_KEY, encryptedShopMode);
  } catch (error) {
    console.error('Error storing shop mode:', error);
  }
};

export const getShopMode = (): ShopMode | null => {
  try {
    if (typeof window === 'undefined') return null;
    const encryptedShopMode = localStorage.getItem(SHOP_MODE_STORAGE_KEY);
    if (encryptedShopMode) {
      const bytes = CryptoJS.AES.decrypt(encryptedShopMode, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) return null;
      return normalizeShopMode(JSON.parse(decrypted) as string);
    }
    return normalizeShopMode(getUser()?.shopMode ?? null);
  } catch (error) {
    console.error('Error getting shop mode:', error);
    return null;
  }
};

export const updateStoredShopMode = (shopMode?: ShopMode | null): void => {
  try {
    const normalizedShopMode = normalizeShopMode(shopMode);
    const currentUser = getUser();
    if (currentUser) {
      storeUser({
        ...currentUser,
        shopMode: normalizedShopMode,
      });
    }
    storeShopMode(normalizedShopMode);
  } catch (error) {
    console.error('Error updating stored shop mode:', error);
  }
};

export const hasShopModeAccess = (path: string): boolean => {
  const shopMode = getShopMode();
  if (!shopMode) return true;
  const normalizedPath = canonicalizeAdminPath(normalizePath(path));

  const blockedPrefixes = SHOP_MODE_BLOCKED_ROUTE_PREFIXES[shopMode] ?? [];
  return !blockedPrefixes.some(
    (prefix) =>
      normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );
};

export const storeRoleAndPermissions = (role: Role): void => {
  try {
    if (typeof window === 'undefined') return;

    const encryptedRole = CryptoJS.AES.encrypt(
      JSON.stringify(role),
      SECRET_KEY,
    ).toString();
    localStorage.setItem('role', encryptedRole);
  } catch (error) {
    console.error('Error storing role:', error);
  }
};

export const getRoleAndPermissions = (): Role | null => {
  try {
    if (typeof window === 'undefined') return null;

    const encryptedRole = localStorage.getItem('role');
    if (!encryptedRole) return null;

    const bytes = CryptoJS.AES.decrypt(encryptedRole, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;

    return JSON.parse(decrypted) as Role;
  } catch (error) {
    console.error('Error getting role:', error);
    return null;
  }
};

export const removeRoleAndPermissions = (): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('role');
  } catch (error) {
    console.error('Error removing role:', error);
  }
};

export const getUserPermissions = (): string[] => {
  const role = getRoleAndPermissions();
  if (!role?.permissions?.length) return [];

  return role.permissions
    .filter((permission): permission is RolePermission =>
      Boolean(permission?.main_module && permission?.module),
    )
    .map((permission) => `${permission.main_module}.${permission.module}`);
};

export const hasPermission = (permission?: string): boolean => {
  if (!permission) return true;

  const normalizedPermission = permission.toLowerCase();
  return getUserPermissions().some((userPermission) =>
    userPermission.toLowerCase().startsWith(normalizedPermission),
  );
};

const routePermissionMap: Record<string, string | null> = {
  '/': null,
  '/general/users': 'general.users',
  '/general/zones': 'general.zones',
  '/general/role-and-permissions': 'general.role_permissions',
  '/general/notifications': 'general.notifications',
  '/general/customer-support': 'general.custom_support',
  '/general/customer-loyalty-and-referrals': 'general.loyalty_referral',
  [adminRoutes.deliveries.base]: 'general-delivery.dashboard',
  [adminRoutes.deliveries.dashboard]: 'general-delivery.dashboard',
  [adminRoutes.deliveries.vendors]: 'general-delivery.vendor',
  [adminRoutes.deliveries.stores]: 'general-delivery.store',
  [adminRoutes.deliveries.riders]: 'general-delivery.rider',
  [adminRoutes.deliveries.orders]: 'general-delivery.orders',
  [adminRoutes.deliveries.liveTracking]: 'general-delivery.live_tracking',
  [adminRoutes.deliveries.refundAndResponsibilities]:
    'general-delivery.refund_responsibilities',
  [adminRoutes.deliveries.discountsOffers]: 'general-delivery.coupons',
  [adminRoutes.deliveries.deliveryFee]:
    'general-delivery.delivery_fee_settings',
  [adminRoutes.deliveries.shopTypes]: 'general-delivery.shop_types',
  [adminRoutes.deliveries.taxRates]: 'general-delivery.tax_rates',
  [adminRoutes.deliveries.commissionRate]: 'general-delivery.store_commissions',
  [adminRoutes.deliveries.earningsReports]: 'general-delivery.earning',
  [adminRoutes.deliveries.withdrawalRequests]:
    'general-delivery.withdraw_requests',
  [adminRoutes.deliveries.customerLoyaltyAndReferrals]:
    'general-delivery.loyalty_referral',
  [adminRoutes.deliveries.subscriptionPlans]:
    'general-delivery.subscription_plans',
};

export const hasRoutePermission = (path: string): boolean => {
  const normalizedPath = canonicalizeAdminPath(normalizePath(path));

  if (!hasShopModeAccess(normalizedPath)) {
    return false;
  }

  const matchedPrefix = Object.keys(routePermissionMap)
    .sort((left, right) => right.length - left.length)
    .find((prefix) => {
      if (prefix === '/') {
        return normalizedPath === '/';
      }

      return (
        normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
      );
    });

  if (!matchedPrefix) return false;

  const requiredPermission = routePermissionMap[matchedPrefix];
  if (!requiredPermission) return true;

  return hasPermission(requiredPermission);
};
