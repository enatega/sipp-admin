import { CustomerSupportTicketItem } from '@/types/api/super-admin/general/customerSupport.api';
import { isToday, isYesterday } from 'date-fns';


export interface GroupedSupportTickets {
    today: CustomerSupportTicketItem[];
    yesterday: CustomerSupportTicketItem[];
    older: CustomerSupportTicketItem[];
}

export const groupSupportTickets = (
    tickets: CustomerSupportTicketItem[]
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