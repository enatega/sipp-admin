'use client';

import { Form, Formik } from 'formik';
import {
  MoreVertical,
  PenIcon,
  PlusCircleIcon,
  TrashIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import * as Yup from 'yup';

import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { AppButton } from '@/components/shared/AppButton';
import DisplayError from '@/components/shared/DisplayError';
import { Heading } from '@/components/shared/Heading';
import NoDataFound from '@/components/shared/NoDataFound';
import AppPagination from '@/components/shared/AppPagination';
import SearchUrl from '@/components/shared/SearchUrl';
import { TableShimmer, TLimitType } from '@/components/shared/TableShimmer';
import { ClearFiltersButton } from '@/components/shared/filters/ClearFiltersButton';
import { AppFileInput } from '@/components/shared/form/AppFileInput';
import { AppInputField } from '@/components/shared/form/AppInput';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { MultiSelect } from '@/components/shared/form/AppMultiSelect';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useActiveDeliveryLanguages } from '@/hooks/api/deliveries/languages';
import {
  useCreateFavouriteFood,
  useDeleteFavouriteFood,
  useFavouriteFoods,
  useUpdateFavouriteFood,
  useUpdateFavouriteFoodStatus,
} from '@/hooks/api/super-admin/enatega-deliveries/favourite-foods';
import { useGetAllShopTypesSimple } from '@/hooks/api/super-admin/enatega-deliveries/shop-type';
import { useQueryParams } from '@/hooks/use-query-params';
import { handleApiError, returnErrorMessage } from '@/lib/toast-error';
import type {
  ApiErrorResponse,
  FavouriteFood,
  FavouriteFoodPayload,
} from '@/types';

type FormValues = Omit<FavouriteFoodPayload, 'image'> & {
  image: File | string | null;
};

function FavouriteFoodForm({
  item,
  open,
  onClose,
}: {
  item: FavouriteFood | null;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations('favouriteFoods');
  const { data: shopTypes = [], isLoading: loadingShopTypes } =
    useGetAllShopTypesSimple();
  const { data: languages = [] } = useActiveDeliveryLanguages();
  const createMutation = useCreateFavouriteFood();
  const updateMutation = useUpdateFavouriteFood();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const languageFields = languages.filter((language) => language.code !== 'en');

  const initialValues: FormValues = {
    name: item?.name ?? '',
    nameTranslations: item?.nameTranslations ?? {},
    shopTypeIds: item?.shopTypes.map((shopType) => shopType.id) ?? [],
    displayOrder: item?.displayOrder ?? 0,
    isActive: item?.isActive ?? true,
    image: item?.imageUrl ?? null,
    removeImage: false,
  };

  const schema = Yup.object({
    name: Yup.string().trim().required(t('validation.nameRequired')).max(255),
    shopTypeIds: Yup.array()
      .of(Yup.string().required())
      .min(1, t('validation.shopTypeRequired')),
    displayOrder: Yup.number()
      .integer(t('validation.orderInteger'))
      .min(0, t('validation.orderMinimum'))
      .required(),
  });

  const submit = async (values: FormValues) => {
    const payload: FavouriteFoodPayload = {
      name: values.name.trim(),
      nameTranslations: values.nameTranslations,
      shopTypeIds: values.shopTypeIds,
      displayOrder: Number(values.displayOrder),
      isActive: values.isActive,
      image: values.image instanceof File ? values.image : undefined,
      removeImage: values.removeImage,
    };

    try {
      if (item) {
        await updateMutation.mutateAsync({ id: item.id, payload });
        toast.success(t('messages.updated'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('messages.created'));
      }
      onClose();
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="border-b">
          <SheetTitle>{item ? t('form.editTitle') : t('form.createTitle')}</SheetTitle>
          <SheetDescription>{t('form.description')}</SheetDescription>
        </SheetHeader>
        <Formik
          initialValues={initialValues}
          validationSchema={schema}
          enableReinitialize
          onSubmit={submit}
        >
          {({ values, setFieldValue }) => (
            <Form className="flex flex-col gap-5 p-4">
              <AppInputField
                name="name"
                label={t('form.name')}
                placeholder={t('form.namePlaceholder')}
                maxLength={255}
                requiredAsterisk
              />

              {languageFields.length > 0 && (
                <div className="rounded-xl border p-4">
                  <h3 className="text-sm font-semibold">{t('form.translations')}</h3>
                  <p className="mb-4 mt-1 text-sm text-mute">
                    {t('form.translationsDescription')}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {languageFields.map((language) => (
                      <AppInputField
                        key={language.code}
                        name={`nameTranslations.${language.code}`}
                        label={language.name}
                        maxLength={255}
                        placeholder={t('form.translationPlaceholder', {
                          language: language.name,
                        })}
                      />
                    ))}
                  </div>
                </div>
              )}

              <MultiSelect
                name="shopTypeIds"
                label={t('form.shopTypes')}
                placeholder={t('form.shopTypesPlaceholder')}
                options={shopTypes.map((shopType) => ({
                  key: shopType.name,
                  value: shopType.id,
                }))}
                disabled={loadingShopTypes || isPending}
                requiredAsterisk
              />

              <AppInputField
                name="displayOrder"
                type="number"
                min={0}
                label={t('form.displayOrder')}
                helperText={t('form.displayOrderHelp')}
              />

              <AppFileInput
                name="image"
                label={t('form.image')}
                helperText={t('form.imageHelp')}
                previewUrl={item?.imageUrl ?? undefined}
                disabled={isPending}
                onFileSelected={(file) => {
                  if (file) void setFieldValue('removeImage', false);
                }}
              />

              {item?.imageUrl && !(values.image instanceof File) && (
                <AppButton
                  type="button"
                  variant="mute"
                  size="sm"
                  className="self-start"
                  onClick={() => {
                    void setFieldValue('image', null);
                    void setFieldValue('removeImage', true);
                  }}
                >
                  {t('form.removeImage')}
                </AppButton>
              )}

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="favourite-food-active">{t('form.status')}</Label>
                  <p className="mt-1 text-sm text-mute">
                    {values.isActive ? t('status.active') : t('status.inactive')}
                  </p>
                </div>
                <Switch
                  id="favourite-food-active"
                  checked={values.isActive}
                  disabled={isPending}
                  onCheckedChange={(checked) => setFieldValue('isActive', checked)}
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-4">
                <AppButton type="button" variant="secondary" onClick={onClose}>
                  {t('actions.cancel')}
                </AppButton>
                <AppButton type="submit" isLoading={isPending}>
                  {item ? t('actions.save') : t('actions.create')}
                </AppButton>
              </div>
            </Form>
          )}
        </Formik>
      </SheetContent>
    </Sheet>
  );
}

export function FavouriteFoodsPage() {
  const t = useTranslations('favouriteFoods');
  const { getParam, setParams } = useQueryParams();
  const limit = (Number(getParam('limit')) || 10) as TLimitType;
  const status = getParam('status') || '';
  const shopTypeId = getParam('shopTypeId') || '';
  const { data: shopTypes = [] } = useGetAllShopTypesSimple();
  const { data, isLoading, isError, error } = useFavouriteFoods();
  const deleteMutation = useDeleteFavouriteFood();
  const statusMutation = useUpdateFavouriteFoodStatus();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FavouriteFood | null>(null);
  const [deleting, setDeleting] = useState<FavouriteFood | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const rows = data?.data ?? [];

  const statusOptions = useMemo(
    () => [
      { key: t('status.active'), value: 'active' },
      { key: t('status.inactive'), value: 'inactive' },
    ],
    [t],
  );

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      toast.success(t('messages.deleted'));
      setDeleting(null);
    } catch (deleteError) {
      handleApiError(deleteError as ApiErrorResponse);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Heading title={t('title')} subTitle={t('subtitle')} />
        <AppButton
          leftIcon={<PlusCircleIcon size={16} />}
          onClick={() => setFormOpen(true)}
        >
          {t('addButton')}
        </AppButton>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 lg:flex-row lg:items-center">
        <SearchUrl
          placeholder={t('filters.search')}
          containerClass="w-full lg:max-w-sm"
        />
        <AppSelect
          name="status"
          placeholder={t('filters.status')}
          options={statusOptions}
          value={status || undefined}
          onValueChange={(value) => setParams({ status: String(value), page: '1' })}
          containerClassName="w-full lg:w-48"
        />
        <AppSelect
          name="shopTypeId"
          placeholder={t('filters.shopType')}
          options={shopTypes.map((shopType) => ({
            key: shopType.name,
            value: shopType.id,
          }))}
          value={shopTypeId || undefined}
          onValueChange={(value) =>
            setParams({ shopTypeId: String(value), page: '1' })
          }
          containerClassName="w-full lg:w-56"
        />
        <ClearFiltersButton paramKeys={['search', 'status', 'shopTypeId']} />
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <Table>
          <TableHeader className="bg-accent">
            <TableRow>
              <TableHead>{t('table.image')}</TableHead>
              <TableHead>{t('table.name')}</TableHead>
              <TableHead>{t('table.shopTypes')}</TableHead>
              <TableHead>{t('table.order')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableShimmer limit={limit} columns={6} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  <DisplayError
                    title={t('errors.loadTitle')}
                    message={returnErrorMessage(error) || t('errors.loadMessage')}
                  />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  <NoDataFound title={t('empty')} />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Avatar className="size-11 rounded-lg">
                      <AvatarImage src={item.imageUrl ?? ''} alt={item.name} />
                      <AvatarFallback className="rounded-lg">
                        {item.name.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-mute">{item.identifier}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-xs flex-wrap gap-1">
                      {item.shopTypes.map((shopType) => (
                        <span
                          key={shopType.id}
                          className="rounded-full bg-accent px-2.5 py-1 text-xs"
                        >
                          {shopType.name}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">{item.displayOrder}</TableCell>
                  <TableCell>
                    <Switch
                      checked={item.isActive}
                      disabled={updatingId === item.id}
                      aria-label={t('actions.toggleStatus', { name: item.name })}
                      onCheckedChange={async (checked) => {
                        setUpdatingId(item.id);
                        try {
                          await statusMutation.mutateAsync({ item, isActive: checked });
                          toast.success(t('messages.statusUpdated'));
                        } catch (statusError) {
                          handleApiError(statusError as ApiErrorResponse);
                        } finally {
                          setUpdatingId(null);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="rounded-md border p-2">
                        <MoreVertical size={18} />
                        <span className="sr-only">{t('table.actions')}</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(item);
                            setFormOpen(true);
                          }}
                        >
                          <PenIcon size={16} /> {t('actions.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-help-red"
                          onClick={() => setDeleting(item)}
                        >
                          <TrashIcon size={16} /> {t('actions.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!isLoading && !isError && rows.length > 0 && (
          <div className="border-t bg-accent/30 p-3">
            <AppPagination
              page={data?.page ?? 1}
              totalPages={data?.totalPages ?? 1}
              totalData={data?.total ?? 0}
              defaultLimit={limit}
            />
          </div>
        )}
      </div>

      <FavouriteFoodForm
        key={editing?.id ?? 'create'}
        item={editing}
        open={formOpen}
        onClose={closeForm}
      />

      {deleting && (
        <AppAlertDialog
          open
          title={t('deleteDialog.title')}
          subTitle={t('deleteDialog.subtitle', { name: deleting.name })}
          description={t('deleteDialog.description')}
          confirmLabel={t('actions.delete')}
          variant="delete"
          loading={deleteMutation.isPending}
          onConfirm={confirmDelete}
          onOpenChange={(next) => !next && setDeleting(null)}
        />
      )}
    </div>
  );
}
