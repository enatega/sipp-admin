'use client';

import { useState } from 'react';
import type { Option as StoreOption } from '@/types';
import AddOptionSidebar from './AddOptionSidebar';
import EditOptionSidebar from './EditOptionSidebar';
import OptionsHeader from './Header';
import OptionsTable from './table/OptionsTable';

export default function OptionsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<StoreOption | null>(null);

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open);

    if (!open) {
      setSelectedOption(null);
    }
  };

  return (
    <div className="space-y-7">
      <OptionsHeader onAddClick={() => setIsAddOpen(true)} />
      <OptionsTable
        onEditOption={(option) => {
          setSelectedOption(option);
          setIsEditOpen(true);
        }}
      />
      <AddOptionSidebar open={isAddOpen} onOpenChange={setIsAddOpen} />
      <EditOptionSidebar
        open={isEditOpen}
        onOpenChange={handleEditOpenChange}
        option={selectedOption}
      />
    </div>
  );
}
