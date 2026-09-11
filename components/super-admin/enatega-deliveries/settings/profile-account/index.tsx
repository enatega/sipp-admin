'use client';

import ChangePasswordForm from './ChangePasswordForm';
import ProfileForm from './ProfileForm';
import StoreTypeForm from './StoreTypeForm';

export function ProfileAccount() {
  return (
    <main className="space-y-8">
      <ProfileForm />
      <StoreTypeForm />
      <ChangePasswordForm />
    </main>
  );
}
