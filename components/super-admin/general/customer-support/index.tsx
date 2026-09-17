'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import {
  CustomerSupportGroupedByCustomer,
  SupportModule,
} from '@/types/api/super-admin/general/customerSupport.api';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetDeliverySupport } from '@/hooks/api/super-admin/general/customer-support-deliveries';
import { useSocket } from '@/hooks/use-socket';
import { getUser } from '@/lib/user';
import DisplayError from '@/components/shared/DisplayError';
import { Heading } from '@/components/shared/Heading';
import Filters from './Filters';
import MainPageSkeleton from './skeleton/MainPageSkeleton';
import TabList from './tabsList/TabList';
import TicketsInformation from './tickets/TicketsInformation';
import { groupSupportTickets, groupTicketsByCustomer } from './useGroupSupportTicket';

// const SUPPORT_TABS: {
//   label: string;
//   value: SupportModule;
// }[] = [
//   {
//     label: 'Deliveries',
//     value: 'deliveries',
//   },
//   {
//     label: 'Drive',
//     value: 'drive',
//   },
//   {
//     label: 'Home Services',
//     value: 'home-services',
//   },
//   {
//     label: 'General Bookings',
//     value: 'general-bookings',
//   },
// ];

const CustomerSupportMain = () => {
  const t = useTranslations('customerSupport');

  // const [activeTab, setActiveTab] = useState<SupportModule>('deliveries');

  const [selectedTicket, setSelectedTicket] =
    useState<CustomerSupportGroupedByCustomer | null>(null);

  const queryClient = useQueryClient();
  const userId = getUser()?.id ?? null;
  const { socket, connected } = useSocket(undefined, { namespace: 'deliveries' });

  useEffect(() => {
    if (!connected || !userId) return;
    socket.emit('add-user', userId);
  }, [connected, socket, userId]);

  useEffect(() => {
    const handleSupportUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['get-delivery-support-chat'] });
    };

    socket.on('support-updated', handleSupportUpdated);

    return () => {
      socket.off('support-updated', handleSupportUpdated);
    };
  }, [socket, queryClient]);

  // Queries for each support module
  // const deliveriesQuery = useGetDeliverySupport({
  //   enabled: activeTab === 'deliveries',
  //   placeholderData: (previousData) => previousData,
  // });

  // const driveQuery = useGetDriveSupport({
  //   enabled: activeTab === 'drive',
  //   placeholderData: (previousData) => previousData,
  // });

  const deliveriesQuery = useGetDeliverySupport({
    placeholderData: (previousData) => previousData,
  });

  // const generalBookingsQuery = useGetGeneralBookingsSupport({
  //   enabled: activeTab === 'general-bookings',
  //   placeholderData: (previousData) => previousData,
  // });

  //  Active query based on selected tab
  // const activeQuery = useMemo(() => {
  //   switch (activeTab) {
  //     case 'deliveries':
  //       return deliveriesQuery;

  //     case 'drive':
  //       return driveQuery;

  //     case 'home-services':
  //       return homeServicesQuery;

  //     case 'general-bookings':
  //       return generalBookingsQuery;

  //     default:
  //       return deliveriesQuery;
  //   }
  // }, [
  //   activeTab,
  //   deliveriesQuery,
  //   driveQuery,
  //   homeServicesQuery,
  //   generalBookingsQuery,
  // ]);

  const { data, isLoading, isError, error, isFetching } = deliveriesQuery;

  const groupedTickets = useMemo(() => {
    if (!data?.data) {
      return {
        today: [],
        yesterday: [],
        older: [],
      };
    }

    return groupSupportTickets(groupTicketsByCustomer(data.data));
  }, [data]);

  const allTickets = useMemo(() => data?.data ?? [], [data?.data]);

  const ticketsForSelectedUser = useMemo(() => {
    if (!selectedTicket) {
      return null;
    }

    const senderId = selectedTicket.sender.id;

    return allTickets.filter((ticket) => ticket.sender.id === senderId);
  }, [selectedTicket, allTickets]);

  if (isLoading) {
    return <MainPageSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-4">
        <DisplayError
          message={returnErrorMessage(error) || t('errors.loadFailed')}
        />
      </div>
    );
  }

  return (
    <div>
      <Heading title={t('title')} />

      {/* Top Support Tabs
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setSelectedTicket(null);
          setActiveTab(val as SupportModule);
        }}
        className="mt-4"
      >
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          {SUPPORT_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs> */}

      <div className="mt-4">
        <Filters />
      </div>

      <div className="flex flex-col-reverse lg:flex-row gap-6 mt-4">
        <div className="w-full md:w-[300px] lg:w-[420px]">
          <TabList
            isLoading={isLoading}
            isError={isError}
            error={error}
            isFetching={isFetching}
            grouped={groupedTickets}
            selectedItemId={selectedTicket?.id ?? null}
            onSelect={(ticket) => setSelectedTicket(ticket)}
          />
        </div>

        <div className={`${selectedTicket ? 'border rounded-md' : ''} flex-1`}>
          <TicketsInformation
            ticket={selectedTicket}
            tickets={ticketsForSelectedUser}
            isLoading={isFetching}
            module={'deliveries' as SupportModule}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportMain;
