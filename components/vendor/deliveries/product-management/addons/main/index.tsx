'use client';

import { useState } from 'react';
import { ApiErrorResponse, AddonFormValues } from '@/types';
import type { VendorAddon } from '@/types/api/vendor/deliveries/addons.api';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { hasAdminProfile } from '@/lib/user';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/toast-error';
import {
  useCreateAddon,
  useDeleteAddon,
  useGetAddonById,
  useGetAddons,
  useUpdateAddon,
} from '@/hooks/api/vendor/deliveries/product-management/addons';
import { AddAddonDrawer } from '../add-addon';
import { EditAddonDrawer } from '../edit-addon';
import { AddonsHeader } from './header';
import ViewAddonDialog from './ViewAddonDialog';
import { AddonsTable } from './table';

export function AddonsModule() {
  const t = useTranslations('storeAddons');
  const { vendorId: routeVendorId } = useParams() as { vendorId?: string };
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<VendorAddon | null>(null);
  const [selectedAddonMode, setSelectedAddonMode] = useState<
    'view' | 'edit' | null
  >(null);

  const { data, isLoading, isError, error, refetch } = useGetAddons({
    placeholderData: (previousData) => previousData,
  });
  const { data: selectedAddonDetails } = useGetAddonById(
    selectedAddon && selectedAddonMode
      ? {
          id: selectedAddon.id,
          vendor_id: hasAdminProfile() ? routeVendorId : undefined,
        }
      : null,
    {
      enabled: !!selectedAddon && !!selectedAddonMode,
      placeholderData: (previousData) => previousData,
    },
  );
  const { mutateAsync: createAddon } = useCreateAddon();
  const { mutateAsync: updateAddon } = useUpdateAddon();
  const { mutateAsync: deleteAddon } = useDeleteAddon();
  const activeAddon = selectedAddonDetails ?? selectedAddon;

  const handleAddNew = () => {
    setSelectedAddon(null);
    setSelectedAddonMode(null);
    setIsAddDrawerOpen(true);
  };

  const handleSubmitAddon = async (values: AddonFormValues) => {
    if (hasAdminProfile() && !routeVendorId) {
      return;
    }

    try {
      if (selectedAddonMode === 'edit' && activeAddon) {
        await updateAddon({
          id: activeAddon.id,
          vendor_id: hasAdminProfile() ? routeVendorId : undefined,
          name: values.name.trim(),
          description: values.description.trim(),
          requiredCheck: values.requiredCheck,
          selectionType: values.selectionType as 'single' | 'multi',
          price: Number(values.price || 0),
          minSelect: Number(values.minSelect || 0),
          maxSelect: Number(values.maxSelect || 0),
          status: values.status ?? true,
          type: 'add-on',
          dependsOnVariationId: values.dependsOnVariationId?.trim() || null,
          optionIds: values.optionIds,
        });
        toast.success(t('success.update'));
      } else {
        await createAddon({
          vendor_id: hasAdminProfile() ? routeVendorId : undefined,
          name: values.name.trim(),
          description: values.description.trim(),
          requiredCheck: values.requiredCheck,
          selectionType: values.selectionType as 'single' | 'multi',
          price: Number(values.price || 0),
          minSelect: Number(values.minSelect || 0),
          maxSelect: Number(values.maxSelect || 0),
          status: values.status ?? true,
          type: 'add-on',
          dependsOnVariationId: values.dependsOnVariationId?.trim() || null,
          optionIds: values.optionIds,
        });
        toast.success(t('success.create'));
      }

      setIsAddDrawerOpen(false);
      setSelectedAddon(null);
      setSelectedAddonMode(null);
    } catch (submitError) {
      handleApiError(submitError as ApiErrorResponse);
    }
  };

  const handleEdit = (addon: VendorAddon) => {
    setIsAddDrawerOpen(false);
    setSelectedAddon(addon);
    setSelectedAddonMode('edit');
  };

  const handleView = (addon: VendorAddon) => {
    setSelectedAddon(addon);
    setSelectedAddonMode('view');
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

      {selectedAddonMode === 'edit' && activeAddon && (
        <EditAddonDrawer
          isOpen={!!activeAddon && selectedAddonMode === 'edit'}
          onClose={() => {
            setSelectedAddon(null);
            setSelectedAddonMode(null);
          }}
          onSubmit={handleSubmitAddon}
          editData={activeAddon}
        />
      )}

      <ViewAddonDialog
        open={selectedAddonMode === 'view' && !!activeAddon}
        onClose={() => {
          setSelectedAddon(null);
          setSelectedAddonMode(null);
        }}
        addon={activeAddon}
      />
    </>
  );
}
