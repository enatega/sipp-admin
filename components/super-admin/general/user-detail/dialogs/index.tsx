'use client';

import { UserManagementItem } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { ActivateUserDialog } from '@/components/super-admin/general/user-detail/dialogs/ActivateUserDialog';
import { BlockUserDialog } from '@/components/super-admin/general/user-detail/dialogs/BlockUserDialog';
import { DeactivateUserDialog } from '@/components/super-admin/general/user-detail/dialogs/DeactivateUserDialog';
import { ForceLogoutDialog } from '@/components/super-admin/general/user-detail/dialogs/ForceLogoutDialog';
import { InternalNotesDialog } from '@/components/super-admin/general/user-detail/dialogs/InternalNotesDialog';

interface UserTableDialogsProps {
  queryKey: string;
  dialogs: {
    internalNotes: { open: boolean; user: UserManagementItem | null };
    forceLogout: { open: boolean; user: UserManagementItem | null };
    activate: { open: boolean; user: UserManagementItem | null };
    deactivate: { open: boolean; user: UserManagementItem | null };
    block: { open: boolean; user: UserManagementItem | null };
  };
  closeInternalNotes: () => void;
  closeForceLogout: () => void;
  closeActivate: () => void;
  closeDeactivate: () => void;
  closeBlock: () => void;
}

export function UserActionDialogs({
  queryKey,
  dialogs,
  closeInternalNotes,
  closeForceLogout,
  closeActivate,
  closeDeactivate,
  closeBlock,
}: UserTableDialogsProps) {
  const tErrors = useTranslations('userDetail.errors');
  const queryClient = useQueryClient();

  const handleInternalNotes = () => {
    try {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    } catch {
      toast.error(tErrors('refreshUsersFailed'));
    }
  };

  const handleForceLogout = () => {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
    closeForceLogout();
  };

  const handleActivate = () => {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
    closeActivate();
  };

  const handleDeactivate = () => {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
    closeDeactivate();
  };

  const handleBlock = () => {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
    closeBlock();
  };

  return (
    <>
      {/* Internal Notes Dialog */}
      <InternalNotesDialog
        open={dialogs.internalNotes.open}
        userName={dialogs.internalNotes.user?.userProfile.user.name}
        notes={
          dialogs.internalNotes.user?.userProfile.user.internal_notes || ''
        }
        userId={dialogs.internalNotes.user?.userProfile.user.id || ''}
        onClose={closeInternalNotes}
        onUpdate={handleInternalNotes}
      />

      {/* Force Logout Dialog */}
      <ForceLogoutDialog
        open={dialogs.forceLogout.open}
        onOpenChange={closeForceLogout}
        onSuccess={handleForceLogout}
        userName={dialogs.forceLogout.user?.userProfile.user.name || ''}
        userId={dialogs.forceLogout.user?.userProfile.user.id || ''}
      />

      {/* Activate Account Dialog */}
      <ActivateUserDialog
        open={dialogs.activate.open}
        onOpenChange={closeActivate}
        onSuccess={handleActivate}
        userName={dialogs.activate.user?.userProfile.user.name || ''}
        userId={dialogs.activate.user?.userProfile.user.id || ''}
      />

      {/* Deactivate Account Dialog */}
      <DeactivateUserDialog
        open={dialogs.deactivate.open}
        onClose={closeDeactivate}
        userId={dialogs.deactivate.user?.userProfile.user.id || ''}
        onConfirm={handleDeactivate}
      />

      {/* Block Account Dialog */}
      <BlockUserDialog
        open={dialogs.block.open}
        onClose={closeBlock}
        userId={dialogs.block.user?.userProfile.user.id || ''}
        onConfirm={handleBlock}
        status={dialogs.block?.user?.userProfile?.user?.block_status || false}
      />
    </>
  );
}
