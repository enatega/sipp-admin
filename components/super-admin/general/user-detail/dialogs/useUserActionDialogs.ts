import { UMUserDetails, UserManagementItem } from '@/types';
import { useState } from 'react';

interface DialogsState {
  internalNotes: {
    open: boolean;
    user: UserManagementItem | UMUserDetails | null;
  };
  forceLogout: {
    open: boolean;
    user: UserManagementItem | UMUserDetails | null;
  };
  activate: {
    open: boolean;
    user: UserManagementItem | UMUserDetails | null;
  };
  deactivate: {
    open: boolean;
    user: UserManagementItem | UMUserDetails | null;
  };
  block: {
    open: boolean;
    user: UserManagementItem | UMUserDetails | null;
  };
}

export const useUserActionDialogs = () => {
  const [dialogs, setDialogs] = useState<DialogsState>({
    internalNotes: { open: false, user: null },
    forceLogout: { open: false, user: null },
    activate: { open: false, user: null },
    deactivate: { open: false, user: null },
    block: { open: false, user: null },
  });

  // Internal Notes
  const openInternalNotes = (user: UserManagementItem | UMUserDetails) => {
    setDialogs((prev) => ({
      ...prev,
      internalNotes: { open: true, user },
    }));
  };

  const closeInternalNotes = () => {
    setDialogs((prev) => ({
      ...prev,
      internalNotes: { open: false, user: null },
    }));
  };

  // Force Logout
  const openForceLogout = (user: UserManagementItem | UMUserDetails) => {
    setDialogs((prev) => ({
      ...prev,
      forceLogout: { open: true, user },
    }));
  };

  const closeForceLogout = () => {
    setDialogs((prev) => ({
      ...prev,
      forceLogout: { open: false, user: null },
    }));
  };

  // Activate
  const openActivate = (user: UserManagementItem | UMUserDetails) => {
    setDialogs((prev) => ({
      ...prev,
      activate: { open: true, user },
    }));
  };

  const closeActivate = () => {
    setDialogs((prev) => ({
      ...prev,
      activate: { open: false, user: null },
    }));
  };

  // Deactivate
  const openDeactivate = (user: UserManagementItem | UMUserDetails) => {
    setDialogs((prev) => ({
      ...prev,
      deactivate: { open: true, user },
    }));
  };

  const closeDeactivate = () => {
    setDialogs((prev) => ({
      ...prev,
      deactivate: { open: false, user: null },
    }));
  };

  // Block
  const openBlock = (user: UserManagementItem | UMUserDetails) => {
    setDialogs((prev) => ({
      ...prev,
      block: { open: true, user },
    }));
  };

  const closeBlock = () => {
    setDialogs((prev) => ({
      ...prev,
      block: { open: false, user: null },
    }));
  };

  return {
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
  };
};
