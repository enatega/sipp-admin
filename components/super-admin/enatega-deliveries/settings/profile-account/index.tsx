'use client';

import ChangePasswordForm from './ChangePasswordForm';
import ProfileForm from './ProfileForm';

export function ProfileAccount() {
  return (
    <main className="space-y-8">
      <ProfileForm />
      <ChangePasswordForm />
    </main>
  );
}
