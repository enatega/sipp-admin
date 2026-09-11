'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ApiErrorResponse } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import {
  useAssignRoleToUser,
  useGetRoleUsers,
} from '@/hooks/api/super-admin/general/role-and-permissions';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { InviteUserDialog } from '../../../common/InviteUserDialog';
import { AssignUsersContent } from './AddAssignedUserCellContent';
import { useTranslations } from 'next-intl';

export interface AddAssignedUser {
  id: string;
  name: string;
  email: string;
  image: string;
  fallback: string;
}

interface AddAssignedUsersCellProps {
  roleId: string;
  selectedUsers: AddAssignedUser[];
  variant?: 'button' | 'text-link';
}

export function AddAssignedUsersCell({
  roleId,
  selectedUsers,
  variant = 'button',
}: AddAssignedUsersCellProps) {
  const t = useTranslations('roleAndPermissions.assignUsers');
  const tError = useTranslations('roleAndPermissions.errors');
  const [assignPopoverOpen, setAssignPopoverOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [allUsers, setAllUsers] = useState<AddAssignedUser[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
    selectedUsers.map((u) => u.id),
  );
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Fetch users from API with pagination
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers,
    error: usersError,
  } = useGetRoleUsers(
    { limit: 10, page: userPage, search: debouncedSearch },
    {
      enabled: assignPopoverOpen,
      staleTime: 60000, // 1 minute
    },
  );

  // Assign role to user mutation
  const { mutateAsync: assignRole } = useAssignRoleToUser();

  // Handle API errors
  useEffect(() => {
    if (usersError) {
      toast.error(tError('loadUsers'));
      // Set empty users list on error to prevent stale data
      setAllUsers([]);
      setHasMore(false);
    }
  }, [usersError, tError]);

  // Update users list when new data arrives
  useEffect(() => {
    if (usersData?.data && assignPopoverOpen) {
      const transformedUsers: AddAssignedUser[] = usersData.data.map(
        (user) => ({
          id: user.user_id,
          name: user.user_name,
          email: user.user_email || user.user_name,
          image: user.user_profile_pic,
          fallback: user.user_name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2),
        }),
      );

      if (usersData.page === 1) {
        setAllUsers(transformedUsers);
      } else {
        setAllUsers((prev) => {
          const existingIds = new Set(prev.map((u) => u.id));
          const newUsers = transformedUsers.filter(
            (u) => !existingIds.has(u.id),
          );
          return [...prev, ...newUsers];
        });
      }

      setHasMore(usersData.hasMore);
    }
  }, [usersData, assignPopoverOpen]);

  // Reset pagination when search changes
  useEffect(() => {
    if (assignPopoverOpen) {
      setUserPage(1);
      setHasMore(true);
    }
  }, [debouncedSearch, assignPopoverOpen]);

  // Handle loading more users on scroll
  const handleLoadMore = useCallback(() => {
    if (hasMore && !isFetchingUsers && usersData?.hasMore) {
      setUserPage((prev) => prev + 1);
    }
  }, [hasMore, isFetchingUsers, usersData?.hasMore]);

  const handleUserToggle = async (userId: string) => {
    const isCurrentlySelected = selectedUserIds.includes(userId);

    // Set loading state for this specific user
    setAssigningUserId(userId);

    // Optimistically update UI
    if (isCurrentlySelected) {
      setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
    } else {
      setSelectedUserIds((prev) => [...prev, userId]);
    }

    // Call API
    try {
      await assignRole({ userId, roleId });
      toast.success(
        isCurrentlySelected
          ? t('unassignSuccess')
          : t('assignSuccess'),
      );
      // Invalidate roles query after successful assignment
      queryClient.invalidateQueries({ queryKey: ['get-roles'] });
    } catch (error) {
      // Revert on error
      if (isCurrentlySelected) {
        setSelectedUserIds((prev) => [...prev, userId]);
      } else {
        setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
      }
      handleApiError(error as ApiErrorResponse);
    } finally {
      // Clear loading state
      setAssigningUserId(null);
    }
  };

  const handlePopoverClose = (open: boolean) => {
    setAssignPopoverOpen(open);
    if (!open) {
      // Reset state when closing popover
      setInputValue('');
      setDebouncedSearch('');
      setUserPage(1);
      setAllUsers([]);
      setHasMore(true);
    }
  };

  return (
    <>
      <Popover open={assignPopoverOpen} onOpenChange={handlePopoverClose}>
        <PopoverTrigger asChild>
          {variant === 'button' ? (
            <button className="size-9 rounded-md  border-dashed shadow-xs border border-primary transition-colors flex items-center justify-center">
              <Plus className="size-3.5 text-primary" />
            </button>
          ) : (
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Plus className="size-4" />
              <span>{t('assignUsers')}</span>
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-[380px]  p-0" align="start">
          <AssignUsersContent
            inputValue={inputValue}
            setInputValue={setInputValue}
            allUsers={allUsers}
            selectedUserIds={selectedUserIds}
            handleUserToggle={handleUserToggle}
            setInviteDialogOpen={setInviteDialogOpen}
            setAssignPopoverOpen={handlePopoverClose}
            isLoadingUsers={isLoadingUsers}
            isFetchingUsers={isFetchingUsers}
            hasMore={usersData?.hasMore}
            handleLoadMore={handleLoadMore}
            assigningUserId={assigningUserId}
            error={usersError}
          />
        </PopoverContent>
      </Popover>

      <InviteUserDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
      />
    </>
  );
}
