import {
    CustomerSupportGroupedByCustomer,
    CustomerSupportTicketItem,
} from '@/types/api/super-admin/general/customerSupport.api';
import { isToday, isYesterday } from 'date-fns';


export interface GroupedSupportTickets {
    today: CustomerSupportGroupedByCustomer[];
    yesterday: CustomerSupportGroupedByCustomer[];
    older: CustomerSupportGroupedByCustomer[];
}

// The backend returns one row per ticket/chat box. The left-hand customer
// list shows one card per customer, so tickets are collapsed here by
// sender.id, keeping the most recently active ticket as the representative
// and counting each ticket status independently.
const statusCountsFor = (status: string) => ({
    opened: Number(status === 'opened'),
    in_progress: Number(status === 'in_progress'),
    resolved: Number(status === 'resolved'),
    closed: Number(status === 'closed'),
});

export const groupTicketsByCustomer = (
    tickets: CustomerSupportTicketItem[]
): CustomerSupportGroupedByCustomer[] => {
    const byCustomer = new Map<string, CustomerSupportGroupedByCustomer>();

    for (const ticket of tickets) {
        const customerId = ticket.sender?.id;
        if (!customerId) continue;

        const existing = byCustomer.get(customerId);

        if (!existing) {
            byCustomer.set(customerId, {
                ...ticket,
                ticketCount: 1,
                unreadCount: ticket.unreadCount ?? 0,
                statusCounts: statusCountsFor(ticket.status),
            });
            continue;
        }

        const ticketCount = existing.ticketCount + 1;
        const unreadCount = (existing.unreadCount ?? 0) + (ticket.unreadCount ?? 0);
        const counts = statusCountsFor(ticket.status);
        const statusCounts = {
            opened: existing.statusCounts.opened + counts.opened,
            in_progress: existing.statusCounts.in_progress + counts.in_progress,
            resolved: existing.statusCounts.resolved + counts.resolved,
            closed: existing.statusCounts.closed + counts.closed,
        };
        const isMoreRecent =
            new Date(ticket.latestMessageAt) > new Date(existing.latestMessageAt);

        byCustomer.set(
            customerId,
            isMoreRecent
                ? { ...ticket, ticketCount, unreadCount, statusCounts }
                : { ...existing, ticketCount, unreadCount, statusCounts }
        );
    }

    return Array.from(byCustomer.values()).sort(
        (left, right) => new Date(right.latestMessageAt).getTime() - new Date(left.latestMessageAt).getTime()
    );
};

export const groupSupportTickets = (
    tickets: CustomerSupportGroupedByCustomer[]
): GroupedSupportTickets => {
    const grouped = tickets.reduce<GroupedSupportTickets>(
        (acc, ticket) => {
            const ticketDate = new Date(ticket.latestMessageAt);

            if (isToday(ticketDate)) {
                acc.today.push(ticket);
            } else if (isYesterday(ticketDate)) {
                acc.yesterday.push(ticket);
            } else {
                acc.older.push(ticket);
            }

            return acc;
        },
        {
            today: [],
            yesterday: [],
            older: [],
        }
    );

    for (const items of [grouped.today, grouped.yesterday, grouped.older]) {
        items.sort(
            (left, right) => new Date(right.latestMessageAt).getTime() - new Date(left.latestMessageAt).getTime()
        );
    }

    return grouped;
};
