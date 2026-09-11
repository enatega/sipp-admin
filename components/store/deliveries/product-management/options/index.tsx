'use client';

import { useState } from 'react';
import AddOptionSidebar from './AddOptionSidebar';
import EditOptionSidebar from './EditOptionSidebar';
import OptionsHeader from './Header';
import OptionsTable from './table/OptionsTable';

export default function OptionsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open);

    if (!open) {
      setSelectedOptionId(null);
    }
  };

  return (
    <div className="space-y-7">
      <OptionsHeader onAddClick={() => setIsAddOpen(true)} />
      <OptionsTable
        onEditOption={(optionId) => {
          setSelectedOptionId(optionId);
          setIsEditOpen(true);
        }}
      />
      <AddOptionSidebar open={isAddOpen} onOpenChange={setIsAddOpen} />
      <EditOptionSidebar
        open={isEditOpen}
        onOpenChange={handleEditOpenChange}
        optionId={selectedOptionId}
      />
    </div>
  );
}
