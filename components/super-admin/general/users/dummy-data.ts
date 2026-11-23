// Dummy data
export interface User {
    id: string;
    email: string | null;
    phone: string;
    name: string;
    profile: string;
    active_status: boolean;
    block_status: boolean;
    google_id: string | null;
    last_login: string;
    internal_notes: string;
    createdAt: string;
}

export interface UsersTableProps {
    data: User[];
    isLoading?: boolean;
    isError?: boolean;
    error?: { message: string } | null;
}

export const DUMMY_USERS: User[] = [
    {
        id: 'YOGD-248',
        name: 'Jennifer Oliver',
        email: 'jennifer@gmail.com',
        phone: '+923041710573',
        profile: 'https://i.pravatar.cc/150?img=1',
        active_status: true,
        block_status: false,
        google_id: 'google_123',
        last_login: '2025-09-29T12:00:00Z',
        internal_notes: 'Problematic Customer',
        createdAt: '2025-09-16T02:20:54.896Z',
    },
    {
        id: 'YOGD-249',
        name: 'Lana Steiner',
        email: 'jennifer@gmail.com',
        phone: '+923041710574',
        profile: 'https://i.pravatar.cc/150?img=5',
        active_status: false,
        block_status: true,
        google_id: null,
        last_login: '2025-09-28T12:00:00Z',
        internal_notes: 'VIP',
        createdAt: '2025-09-15T02:20:54.896Z',
    },
    {
        id: 'YOGD-250',
        name: 'Drew Cano',
        email: 'jennifer@gmail.com',
        phone: '+923041710575',
        profile: 'https://i.pravatar.cc/150?img=12',
        active_status: true,
        block_status: false,
        google_id: null,
        last_login: '2025-09-29T12:00:00Z',
        internal_notes: 'VIP',
        createdAt: '2025-09-14T02:20:54.896Z',
    },
    {
        id: 'YOGD-251',
        name: 'Orlando Diggs',
        email: 'jennifer@gmail.com',
        phone: '+923041710576',
        profile: 'https://i.pravatar.cc/150?img=33',
        active_status: true,
        block_status: false,
        google_id: 'google_456',
        last_login: '2025-09-29T12:00:00Z',
        internal_notes: 'Good Customer',
        createdAt: '2025-09-13T02:20:54.896Z',
    },
    {
        id: 'YOGD-252',
        name: 'Drew Cano',
        email: 'jennifer@gmail.com',
        phone: '+923041710577',
        profile: 'https://i.pravatar.cc/150?img=12',
        active_status: true,
        block_status: false,
        google_id: null,
        last_login: '2025-09-29T12:00:00Z',
        internal_notes: 'Gold Customer',
        createdAt: '2025-09-12T02:20:54.896Z',
    },
    {
        id: 'YOGD-253',
        name: 'Jennifer Oliver',
        email: 'jennifer@gmail.com',
        phone: '+923041710578',
        profile: 'https://i.pravatar.cc/150?img=1',
        active_status: true,
        block_status: false,
        google_id: 'google_789',
        last_login: '2025-09-29T12:00:00Z',
        internal_notes: 'Problematic Customer',
        createdAt: '2025-09-11T02:20:54.896Z',
    },
    {
        id: 'YOGD-254',
        name: 'Lana Steiner',
        email: 'jennifer@gmail.com',
        phone: '+923041710579',
        profile: 'https://i.pravatar.cc/150?img=5',
        active_status: false,
        block_status: false,
        google_id: 'google_101',
        last_login: '2025-09-29T12:00:00Z',
        internal_notes: 'VIP',
        createdAt: '2025-09-10T02:20:54.896Z',
    },
    {
        id: 'YOGD-255',
        name: 'Jennifer Oliver',
        email: 'jennifer@gmail.com',
        phone: '+923041710580',
        profile: 'https://i.pravatar.cc/150?img=1',
        active_status: true,
        block_status: false,
        google_id: 'google_102',
        last_login: '2025-09-29T12:00:00Z',
        internal_notes: 'Gold Customer',
        createdAt: '2025-09-09T02:20:54.896Z',
    },
    {
        id: 'YOGD-256',
        name: 'Orlando Diggs',
        email: 'jennifer@gmail.com',
        phone: '+923041710581',
        profile: 'https://i.pravatar.cc/150?img=33',
        active_status: false,
        block_status: true,
        google_id: null,
        last_login: '2025-09-29T12:00:00Z',
        internal_notes: 'VIP',
        createdAt: '2025-09-08T02:20:54.896Z',
    },
    {
        id: 'YOGD-257',
        name: 'Drew Cano',
        email: 'jennifer@gmail.com',
        phone: '+923041710582',
        profile: 'https://i.pravatar.cc/150?img=12',
        active_status: true,
        block_status: false,
        google_id: 'google_103',
        last_login: '2025-09-29T12:00:00Z',
        internal_notes: 'Problematic Customer',
        createdAt: '2025-09-07T02:20:54.896Z',
    },
];