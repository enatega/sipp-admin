'use client';

import { useState } from 'react';
import { CirclePlus } from 'lucide-react';
import { AppButton } from '@/components/shared/AppButton';
import { Heading } from '@/components/shared/Heading';
import AddZoneDrawer from './add-zone';

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="flex justify-between items-center gap-4 flex-wrap">
      <Heading title="Deliveries Zone Management" />
      <div className="flex gap-2 items-center">
        <AppButton
          leftIcon={<CirclePlus size={16} />}
          onClick={() => setIsDrawerOpen(true)}
        >
          Add Zone
        </AppButton>
      </div>
      <AddZoneDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
