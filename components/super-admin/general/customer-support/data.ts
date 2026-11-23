export type Activity = {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  status: string;
  avatarUrl?: string | null;
  role?: string;
  priority?: string;
};

export const activities: Activity[] = [
  {
    id: '1',
    title: 'Jeniffer Oliver',
    subtitle: 'Order Placement',
    date: new Date().toISOString(),
    status: 'inProgress',
    avatarUrl: 'user.png',
    role: 'Customer',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Jeniffer Oliver',
    subtitle: 'Order Issue',
    date: new Date().toISOString(),
    status: 'running',
    avatarUrl: 'user.png',
    role: 'Rider',
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Talha',
    subtitle: 'Order Issue',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    avatarUrl: 'user.png',
    role: 'Customer',
    priority: 'urgent',
  },
  {
    id: '4',
    title: 'John Doe',
    subtitle: 'Order Issue',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'cancelled',
    avatarUrl: 'user.png',
    role: 'Vendor',
    priority: 'low',
  },
  {
    id: '5',
    title: 'Abdulllah',
    subtitle: 'Order Issue',
    date: new Date(2025, 8, 23).toISOString(),
    status: 'approved',
    avatarUrl: 'user.png',
    role: 'Customer',
    priority: 'medium',
  },
  {
    id: '6',
    title: 'Ali',
    subtitle: 'Order Issue',
    date: new Date(2025, 8, 24).toISOString(),
    status: 'declined',
    avatarUrl: 'user.png',
    role: 'Rider',
    priority: 'high',
  },
];
