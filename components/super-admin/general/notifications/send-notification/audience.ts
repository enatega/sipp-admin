import { UserType } from '@/types';

export const AUDIENCE_GROUPS = ['customer', 'rider', 'store', 'admin'] as const;
export type AudienceGroup = (typeof AUDIENCE_GROUPS)[number];
export type ZoneMode = 'all' | 'zones';

/** The user-type name the server reports each group under. */
export const GROUP_USER_TYPE: Record<AudienceGroup, string> = {
  customer: 'Customer',
  rider: 'Rider',
  store: 'Store',
  admin: 'Admin',
};

/** Selecting every group is recorded as "all", which reads better in the history. */
export const toServerGroups = (groups: AudienceGroup[]): UserType[] =>
  groups.length === AUDIENCE_GROUPS.length ? ['all'] : groups;
