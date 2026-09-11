import moment from 'moment';
import { UserManagementItem } from '@/types';

// Column definitions for download functionality
export const downloadColumns = [

  {
    header: 'Name',
    dataKey: 'name',
    formatter: (item: UserManagementItem) => item.userProfile.user.name,
  },
  {
    header: 'Email',
    dataKey: 'email',
    formatter: (item: UserManagementItem) => item.userProfile.user.email || 'N/A',
  },
  {
    header: 'Phone',
    dataKey: 'phone',
    formatter: (item: UserManagementItem) => item.userProfile.user.phone,
  },
  {
    header: 'Registration Method',
    dataKey: 'google_id',
    formatter: (item: UserManagementItem) =>
      item.userProfile.user.google_id ? 'Google' : 'Manual',
  },
  {
    header: 'Status',
    dataKey: 'active_status',
    formatter: (item: UserManagementItem) => {
      if (item.userProfile.user.block_status) return 'Blocked';
      if (!item.userProfile.user.active_status) return 'Pending';
      return 'Active';
    },
  },
  {
    header: 'Internal Notes',
    dataKey: 'internal_notes',
    formatter: (item: UserManagementItem) =>
      item.userProfile.user.internal_notes || 'N/A',
  },
  {
    header: 'Last Login',
    dataKey: 'last_login',
    formatter: (item: UserManagementItem) =>
      moment(item.userProfile.user.last_login).format('DD MMM YYYY, hh:mm A'),
  },
  {
    header: 'Created At',
    dataKey: 'createdAt',
    formatter: (item: UserManagementItem) =>
      moment(item.userProfile.user.createdAt).format('DD MMM YYYY'),
  },
];
