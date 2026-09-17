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
// and counting how many tickets that customer actually has.
export const groupTicketsByCustomer = (
    tickets: CustomerSupportTicketItem[]
): CustomerSupportGroupedByCustomer[] => {
    const byCustomer = new Map<string, CustomerSupportGroupedByCustomer>();

    for (const ticket of tickets) {
        const customerId = ticket.sender?.id;
        if (!customerId) continue;

        const existing = byCustomer.get(customerId);

        if (!existing) {
            byCustomer.set(customerId, { ...ticket, ticketCount: 1, unreadCount: ticket.unreadCount ?? 0 });
            continue;
        }

        const ticketCount = existing.ticketCount + 1;
        const unreadCount = (existing.unreadCount ?? 0) + (ticket.unreadCount ?? 0);
        const isMoreRecent =
            new Date(ticket.latestMessageAt) > new Date(existing.latestMessageAt);

        byCustomer.set(
            customerId,
            isMoreRecent ? { ...ticket, ticketCount, unreadCount } : { ...existing, ticketCount, unreadCount }
        );
    }

    return Array.from(byCustomer.values());
};

export const groupSupportTickets = (
    tickets: CustomerSupportGroupedByCustomer[]
): GroupedSupportTickets => {
    return tickets.reduce<GroupedSupportTickets>(
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
};
