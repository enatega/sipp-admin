/* eslint-disable react-hooks/refs */
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RoleUser } from '@/types';
import { useGetRoleUsers } from '@/hooks/api/super-admin/general/role-and-permissions';
import {
  AppUserSelect,
  UserOption,
} from '@/components/shared/form/AppUserSelect';
import { useTranslations } from 'next-intl';

// Transform RoleUser to UserOption
const transformToUserOption = (user: RoleUser): UserOption => ({
  id: user.user_id,
  name: user.user_name,
  email: user.user_email,
  image: user.user_profile_pic,
  status: 'active', // Default to active, adjust based on your API if it provides status
});

interface AssignRoleToUserMultiSelectProps {
  name?: string;
  label?: string;
  placeholder?: string;
  containerClassName?: string;
  selected?: string[];
  onChange?: (selected: string[]) => void;
  onInviteUser?: () => void;
}

export default function AssignRoleToUserMultiSelect({
  name = 'assignTo',
  label,
  placeholder,
  containerClassName = 'w-full',
  selected: externalSelected,
  onChange: externalOnChange,
  onInviteUser,
}: AssignRoleToUserMultiSelectProps) {
  const t = useTranslations('roleAndPermissions');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
    externalSelected || [],
  );
  const [selectedUsersMap, setSelectedUsersMap] = useState<
    Map<string, UserOption>
  >(new Map());

  // Refs for debounce and tracking
  const debounceTimerRef = useRef<NodeJS.Timeout>(undefined);
  const prevSearchRef = useRef(debouncedSearch);
  const prevDataRef = useRef<typeof usersData>(undefined);

  // Handle search change with debounce and pagination reset
  const handleSearchChange = useCallback((value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setUserPage(1);
      setHasMore(true);
    }, 500);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Fetch users from API with pagination (using debounced search)
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers,
    error: usersError,
  } = useGetRoleUsers(
    { limit: 10, page: userPage, search: debouncedSearch },
    {
      enabled: true,
      staleTime: 60000, // 1 minute
    },
  );

  // Handle API data changes - compute new state inline
  // Using a pattern that avoids setState in effects while still updating on data changes
  const processedUsers = useMemo(() => {
    if (usersError) {
      return { users: [] as UserOption[], hasMore: false, shouldReset: true };
    }

    if (!usersData?.data) {
      return { users: allUsers, hasMore, shouldReset: false };
    }

    const transformedUsers = usersData.data.map(transformToUserOption);
    const searchChanged = prevSearchRef.current !== debouncedSearch;
    const dataChanged = prevDataRef.current !== usersData;

    if (!dataChanged) {
      return { users: allUsers, hasMore, shouldReset: false };
    }

    let newUsers: UserOption[];
    if (searchChanged || usersData.page === 1) {
      newUsers = transformedUsers;
    } else {
      const existingIds = new Set(allUsers.map((u) => u.id));
      const additionalUsers = transformedUsers.filter((u) => !existingIds.has(u.id));
      newUsers = [...allUsers, ...additionalUsers];
    }

    return {
      users: newUsers,
      hasMore: usersData.hasMore,
      shouldReset: true,
      newSearch: debouncedSearch,
      newData: usersData,
    };
  }, [usersData, usersError, debouncedSearch, allUsers, hasMore]);

  // Apply computed state changes via effect (unavoidable for this pattern)
  useEffect(() => {
    if (processedUsers.shouldReset) {
      if (processedUsers.users !== allUsers) {
        setAllUsers(processedUsers.users);
      }
      if (processedUsers.hasMore !== hasMore) {
        setHasMore(processedUsers.hasMore);
      }
      if (processedUsers.newSearch !== undefined) {
        prevSearchRef.current = processedUsers.newSearch;
      }
      if (processedUsers.newData !== undefined) {
        prevDataRef.current = processedUsers.newData;
      }
    }
  }, [processedUsers, allUsers, hasMore]);

  // Use external selected if provided (controlled mode)
  const effectiveSelectedIds = externalSelected ?? selectedUserIds;

  // Handle loading more users on scroll
  const handleLoadMore = useCallback(() => {
    // Only load more if there are more results and not currently fetching
    if (hasMore && !isFetchingUsers && usersData?.hasMore) {
      setUserPage((prev) => prev + 1);
    }
  }, [hasMore, isFetchingUsers, usersData?.hasMore]);

  // Merge selected users with fetched users to ensure selected ones are always visible
  const displayUsers = useMemo(() => {
    const usersMap = new Map<string, UserOption>();

    // Add all fetched users
    allUsers.forEach((user) => {
      usersMap.set(user.id, user);
    });

    // Ensure selected users are included (even if not in current page)
    selectedUsersMap.forEach((user, id) => {
      if (!usersMap.has(id)) {
        usersMap.set(id, user);
      }
    });

    return Array.from(usersMap.values());
  }, [allUsers, selectedUsersMap]);

  // Handle user selection changes
  const handleUserSelectionChange = useCallback(
    (selected: string[]) => {
      if (!externalSelected) {
        setSelectedUserIds(selected);
      }

      // Update selected users map
      const newMap = new Map(selectedUsersMap);
      selected.forEach((userId) => {
        const user = allUsers.find((u) => u.id === userId);
        if (user && !newMap.has(userId)) {
          newMap.set(userId, user);
        }
      });

      // Remove unselected users from map
      Array.from(newMap.keys()).forEach((userId) => {
        if (!selected.includes(userId)) {
          newMap.delete(userId);
        }
      });

      setSelectedUsersMap(newMap);

      // Call external onChange if provided
      externalOnChange?.(selected);
    },
    [allUsers, selectedUsersMap, externalOnChange, externalSelected],
  );

  return (
    <AppUserSelect
      name={name}
      label={label ?? t('form.assignTo')}
      options={displayUsers}
      selected={effectiveSelectedIds}
      onChange={handleUserSelectionChange}
      placeholder={placeholder ?? t('form.assignToPlaceholder')}
      containerClassName={containerClassName}
      disabled={false} // Never disable input field
      isLoading={isLoadingUsers && userPage === 1}
      isFetchingMore={isFetchingUsers && userPage > 1}
      showLoadingOption={true}
      hasMore={usersData?.hasMore}
      onSearchChange={handleSearchChange}
      onLoadMore={handleLoadMore}
      onInviteUser={onInviteUser}
      error={usersError ? t('errors.loadUsers') : undefined}
    />
  );
}
