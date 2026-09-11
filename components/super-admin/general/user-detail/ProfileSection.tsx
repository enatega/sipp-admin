'use client';

import Image from 'next/image';
import { UMUserDetails } from '@/types';
import {
  Ban,
  CheckCircle,
  ChevronDown,
  FileText,
  LogOut,
  RefreshCw,
  Star,
  XCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppButton } from '@/components/shared/AppButton';
import 'react';
import { UserActionDialogs } from './dialogs';
import { useUserActionDialogs } from './dialogs/useUserActionDialogs';

interface ProfileSectionProps {
  user: UMUserDetails;
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const t = useTranslations('userDetail');
  const tUsers = useTranslations('users');

  const {
    dialogs,
    openInternalNotes,
    closeInternalNotes,
    openForceLogout,
    closeForceLogout,
    openActivate,
    closeActivate,
    openDeactivate,
    closeDeactivate,
    openBlock,
    closeBlock,
  } = useUserActionDialogs();

  // UI helpers
  const getStatusConfig = () => {
    if (user?.userProfile?.user?.block_status) {
      return { color: 'bg-red-500', text: tUsers('statuses.blocked') };
    }
    if (!user?.userProfile?.user?.active_status) {
      return { color: 'bg-orange-500', text: tUsers('statuses.deactivated') };
    }
    return { color: 'bg-green-500', text: tUsers('statuses.active') };
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-300 text-gray-300'
        }`}
      />
    ));
  };

  const statusConfig = getStatusConfig();

  return (
    <>
      <div className="bg-light rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={user?.userProfile?.user?.profile}
                alt={user?.userProfile?.user?.name}
                fill
                className="object-cover"
              />
            </div>

            {/* User Info */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  {user?.userProfile?.user?.name}
                </h2>

                {/* Status Badge with Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-sm font-medium ${statusConfig.color} hover:opacity-90 transition-opacity`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {statusConfig.text}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-[200px] p-0 rounded-xl overflow-hidden shadow-lg"
                  >
                    <DropdownMenuItem
                      className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                      onClick={() => openInternalNotes(user)}
                    >
                      <FileText className="size-[18px]" />
                      <span className="text-sm">
                        {tUsers('actions.internalNotes')}
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none"
                      onClick={() => openForceLogout(user)}
                    >
                      <LogOut className="size-[18px]" />
                      <span className="text-sm">
                        {tUsers('actions.forceLogout')}
                      </span>
                    </DropdownMenuItem>

                    {!user?.userProfile?.user?.active_status ? (
                      <DropdownMenuItem
                        className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none hover:!bg-green-50"
                        onClick={() => openActivate(user)}
                      >
                        <CheckCircle className="size-[18px] text-green-600" />
                        <span className="text-sm text-green-600">
                          {tUsers('actions.activateAccount')}
                        </span>
                      </DropdownMenuItem>
                    ) : (
                      <>
                        {!user?.userProfile?.user?.block_status && (
                          <DropdownMenuItem
                            className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none hover:!bg-orange-50"
                            onClick={() => openDeactivate(user)}
                          >
                            <XCircle className="size-[18px] text-orange-600" />
                            <span className="text-sm text-orange-600">
                              {tUsers('actions.deactivateAccount')}
                            </span>
                          </DropdownMenuItem>
                        )}
                      </>
                    )}

                    {!user?.userProfile?.user?.block_status ? (
                      <DropdownMenuItem
                        className="flex items-center gap-2 p-3 cursor-pointer rounded-none hover:!bg-yellow-50"
                        onClick={() => openBlock(user)}
                      >
                        <Ban className="size-[18px] text-yellow-700" />
                        <span className="text-sm text-yellow-700">
                          {tUsers('actions.blockAccount')}
                        </span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        className="flex items-center gap-2 p-3 cursor-pointer border-b rounded-none hover:!bg-green-50"
                        onClick={() => openBlock(user)}
                      >
                        <CheckCircle className="size-[18px] text-green-600" />
                        <span className="text-sm text-green-600">
                          {tUsers('actions.unblockAccount')}
                        </span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Email */}
              <p className="text-sm text-mute">
                {user?.userProfile?.user?.email ??
                  user?.userProfile?.user?.phone}
              </p>

              {/* Rating */}

              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-900">
                  {user.averageRatingGiven > 0
                    ? user.averageRatingGiven.toFixed(1)
                    : 0}
                </span>
                <div className="flex items-center gap-0.5">
                  {renderStars(Math.round(user.averageRatingGiven))}
                </div>
                <span className="text-sm text-gray-500">
                  ({user.totalReviewsGiven || 0}{' '}
                  {user.totalReviewsGiven !== 1
                    ? t('reviewsPlural')
                    : t('review')}
                  )
                </span>
              </div>
            </div>
          </div>

          {/* Reset Session Button */}
          <AppButton
            variant="secondary"
            className="flex items-center gap-2"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => openForceLogout(user)}
          >
            {t('resetSession')}
          </AppButton>
        </div>
      </div>

      {/* Dialogs */}
      <UserActionDialogs
        queryKey={'get-user-details'}
        dialogs={dialogs}
        closeInternalNotes={closeInternalNotes}
        closeForceLogout={closeForceLogout}
        closeActivate={closeActivate}
        closeDeactivate={closeDeactivate}
        closeBlock={closeBlock}
      />
    </>
  );
}
