'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Addon, AddonFormValues, ApiErrorResponse } from '@/types';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import {
  useCreateAddon,
  useDeleteAddon,
  useGetAddons,
  useUpdateAddon,
} from '@/hooks/api/store/deliveries/product-management/addons';
import { AddAddonDrawer } from '../add-addon';
import { EditAddonDrawer } from '../edit-addon';
import { AddonsHeader } from './header';
import { AddonsTable } from './table';
import ViewAddonDialog from './ViewAddonDialog';

export function AddonsModule() {
  const t = useTranslations('storeAddons');
  const { storeId } = useParams() as { storeId?: string };
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [viewingAddon, setViewingAddon] = useState<Addon | null>(null);

  const { data, isLoading, isError, error, refetch } = useGetAddons({
    placeholderData: (previousData) => previousData,
  });
  const { mutateAsync: createAddon } = useCreateAddon();
  const { mutateAsync: updateAddon } = useUpdateAddon();
  const { mutateAsync: deleteAddon } = useDeleteAddon();

  const handleAddNew = () => {
    setEditingAddon(null);
    setIsAddDrawerOpen(true);
  };

  const handleSubmitAddon = async (values: AddonFormValues) => {
    if (!storeId) {
      return;
    }

    try {
      if (editingAddon) {
        await updateAddon({
          id: editingAddon.id,
          store_id: storeId,
          name: values.name.trim(),
          description: values.description.trim(),
          requiredCheck: values.requiredCheck,
          selectionType: values.selectionType as 'single' | 'multi',
          type: 'add-on',
          optionIds: values.optionIds,
        });
        toast.success(t('success.update'));
      } else {
        await createAddon({
          store_id: storeId,
          name: values.name.trim(),
          description: values.description.trim(),
          requiredCheck: values.requiredCheck,
          selectionType: values.selectionType as 'single' | 'multi',
          type: 'add-on',
          optionIds: values.optionIds,
        });
        toast.success(t('success.create'));
      }

      setIsAddDrawerOpen(false);
      setEditingAddon(null);
    } catch (submitError) {
      handleApiError(submitError as ApiErrorResponse);
    }
  };

  const handleEdit = (addon: Addon) => {
    setIsAddDrawerOpen(false);
    setEditingAddon(addon);
  };

  const handleView = (addon: Addon) => {
    setViewingAddon(addon);
  };

  const handleDelete = async (addonId: string) => {
    const response = await deleteAddon(addonId);
    return response.message;
  };

  return (
    <>
      <AddonsHeader onAddNew={handleAddNew} />

      <div className="space-y-6">
        <AddonsTable
          data={data?.data ?? []}
          isLoading={isLoading}
          isError={isError}
          error={isError ? (error as ApiErrorResponse) : null}
          onRetry={refetch}
          page={data?.page || 1}
          totalPages={data?.totalPages || 1}
          totalData={data?.total || 0}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      </div>

      <AddAddonDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => {
          setIsAddDrawerOpen(false);
        }}
        onSubmit={handleSubmitAddon}
      />

      {editingAddon && (
        <EditAddonDrawer
          isOpen={!!editingAddon}
          onClose={() => setEditingAddon(null)}
          onSubmit={handleSubmitAddon}
          editData={editingAddon}
        />
      )}

      <ViewAddonDialog
        open={!!viewingAddon}
        onClose={() => setViewingAddon(null)}
        addon={viewingAddon}
      />
    </>
  );
}
