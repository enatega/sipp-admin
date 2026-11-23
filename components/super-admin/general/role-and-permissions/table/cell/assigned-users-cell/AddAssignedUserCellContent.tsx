// Separate component for popover content to keep it clean

import { ApiErrorResponse } from '@/types';
import { Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { AppButton } from '@/components/shared/AppButton';
import { AddAssignedUser } from './AddAssignedUsersCell';
import { useTranslations } from 'next-intl';

export function AssignUsersContent({
  inputValue,
  setInputValue,
  allUsers,
  selectedUserIds,
  handleUserToggle,
  setInviteDialogOpen,
  setAssignPopoverOpen,
  isLoadingUsers,
  isFetchingUsers,
  hasMore,
  handleLoadMore,
  assigningUserId,
  error,
}: {
  inputValue: string;
  setInputValue: (query: string) => void;
  allUsers: AddAssignedUser[];
  selectedUserIds: string[];
  handleUserToggle: (userId: string) => Promise<void>;
  setInviteDialogOpen: (open: boolean) => void;
  setAssignPopoverOpen: (open: boolean) => void;
  isLoadingUsers: boolean;
  isFetchingUsers: boolean;
  hasMore?: boolean;
  handleLoadMore: () => void;
  assigningUserId: string | null;
  error?: ApiErrorResponse | Error | null;
}) {
  const t = useTranslations('roleAndPermissions.assignUsers');
  const selectedCount = selectedUserIds.length;

  return (
    <div className="flex  flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h4 className="font-semibold text-sm">{t('title')}</h4>
        <button
          onClick={() => setAssignPopoverOpen(false)}
          aria-label={t('close')}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-stroke bg-transparent text-sm focus:outline-none focus:border-primary transition-colors"
            disabled={!!assigningUserId}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-2.5 border-b flex items-center justify-between bg-accent/30">
        <span className="text-sm text-muted-foreground">
          {isLoadingUsers ? t('loading') : `${t('people')} ${allUsers.length}`}
        </span>
        {selectedCount > 0 && (
          <span className="text-sm text-primary font-medium">
            {t('selected', { count: selectedCount, plural: selectedCount > 1 ? 's' : '' })}
          </span>
        )}
      </div>

      {/* User List */}
      <div
        className="max-h-[180px] overflow-y-auto"
        onScroll={(e) => {
          const target = e.currentTarget;
          const bottom =
            target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
          if (bottom && hasMore && !isFetchingUsers) {
            handleLoadMore();
          }
        }}
      >
        {error ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-destructive mb-2">
              {t('loadUsersError')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('loadUsersErrorSubtitle')}
            </p>
          </div>
        ) : isLoadingUsers ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">{t('loadingUsers')}</p>
          </div>
        ) : allUsers.length > 0 ? (
          <>
            {allUsers.map((user) => {
              const isSelected = selectedUserIds.includes(user.id);

              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors"
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={assigningUserId === user.id}
                    onCheckedChange={() => handleUserToggle(user.id)}
                  />
                  <Avatar className="size-9 bg-accent">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback className="text-sm bg-accent">
                      {user.fallback}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              );
            })}
            {isFetchingUsers && !isLoadingUsers && (
              <div className="w-full py-2 text-center text-sm text-muted-foreground">
                {t('loading')}
              </div>
            )}
            {!hasMore && !isFetchingUsers && allUsers.length > 0 && (
              <div className="w-full py-2 text-center text-sm text-muted-foreground">
                {t('endOfList')}
              </div>
            )}
          </>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {t('noUserFound')}
            </p>
            <AppButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setAssignPopoverOpen(false);
                setInviteDialogOpen(true);
              }}
            >
              {t('inviteUsers')}
            </AppButton>
          </div>
        )}
      </div>

      {/* Footer with Invite Button */}
      {allUsers.length > 0 && (
        <div className="px-4 py-3 border-t">
          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setAssignPopoverOpen(false);
              setInviteDialogOpen(true);
            }}
            className="w-full"
          >
            {t('inviteUsers')}
          </AppButton>
        </div>
      )}
    </div>
  );
}
