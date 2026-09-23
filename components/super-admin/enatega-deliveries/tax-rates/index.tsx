'use client';

import { useState } from 'react';
import { ApiErrorResponse } from '@/types';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { TaxRate, TaxScope } from '@/types/tax';
import { handleApiError } from '@/lib/toast-error';
import {
  useTaxRateMutation,
  useTaxRates,
} from '@/hooks/api/deliveries/tax-rates';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppAlertDialog } from '@/components/shared/AppAlertDialog';
import { StoreTaxAssignments } from './StoreTaxAssignments';

export default function TaxRates() {
  const t = useTranslations('taxRates');
  const [scope, setScope] = useState<TaxScope>('store');
  const query = useTaxRates(scope, true);
  const mutation = useTaxRateMutation();
  const [editing, setEditing] = useState<TaxRate | 'new' | null>(null);
  const [deleting, setDeleting] = useState<TaxRate | null>(null);
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState('');
  const open = (value: TaxRate | 'new') => {
    setEditing(value);
    setError('');
    setName(value === 'new' ? '' : value.name);
    setRate(value === 'new' ? '' : String(value.rate));
    setActive(value === 'new' ? true : value.isActive);
  };
  const save = async (
    values: Parameters<typeof mutation.mutateAsync>[0],
    processingMessage: string,
  ) => {
    setProcessing(processingMessage);
    try {
      await mutation.mutateAsync(values);
      toast.success(t('saved'));
      return true;
    } catch (err) {
      handleApiError(err as ApiErrorResponse);
      return false;
    } finally {
      setProcessing('');
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('description')}</p>
        </div>
        <Button disabled={mutation.isPending} onClick={() => open('new')}>
          {t('add')}
        </Button>
      </div>
      <Tabs
        value={scope}
        onValueChange={(value) => setScope(value as TaxScope)}
      >
        <TabsList>
          <TabsTrigger value="store" disabled={mutation.isPending}>
            {t('store')}
          </TabsTrigger>
          <TabsTrigger value="product" disabled={mutation.isPending}>
            {t('product')}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="max-w-3xl space-y-1 text-sm text-muted-foreground">
        <p>{scope === 'product' ? t('defaultHelp') : t('storeHelp')}</p>
        <p>
          {scope === 'product' ? t('productImpactHelp') : t('storeImpactHelp')}
        </p>
      </div>
      {mutation.isPending && processing && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm"
        >
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          <span>{processing}</span>
        </div>
      )}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="bg-accent">
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('rate')}</TableHead>
              <TableHead>{t('active')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isPending ? (
              <TableRow>
                <TableCell colSpan={4} role="status">
                  {t('loading')}
                </TableCell>
              </TableRow>
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <p role="alert" className="text-destructive">
                    {t('loadError')}
                  </p>
                  <Button variant="outline" onClick={() => query.refetch()}>
                    {t('retry')}
                  </Button>
                </TableCell>
              </TableRow>
            ) : !query.data?.length ? (
              <TableRow>
                <TableCell colSpan={4}>{t('empty')}</TableCell>
              </TableRow>
            ) : (
              query.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{Number(item.rate).toFixed(2)}%</TableCell>
                  <TableCell>
                    <Switch
                      checked={item.isActive}
                      disabled={mutation.isPending}
                      aria-label={t('activeFor', { name: item.name })}
                      onCheckedChange={(isActive) =>
                        save(
                          { id: item.id, values: { isActive } },
                          isActive
                            ? t('activating', { name: item.name })
                            : t('deactivating', { name: item.name }),
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        disabled={mutation.isPending}
                        onClick={() => open(item)}
                      >
                        {t('edit')}
                      </Button>
                      <Button
                        variant="outline"
                        disabled={mutation.isPending}
                        onClick={() => setDeleting(item)}
                      >
                        {t('delete')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <StoreTaxAssignments key={scope} scope={scope} />
      <Dialog
        open={editing !== null}
        onOpenChange={(value) => {
          if (!value && !mutation.isPending) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogTitle>{editing === 'new' ? t('add') : t('edit')}</DialogTitle>
          <DialogDescription>{t('formHelp')}</DialogDescription>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              if (
                !name.trim() ||
                name.trim().length > 100 ||
                !/^\d+(\.\d{1,2})?$/.test(rate) ||
                Number(rate) > 100
              ) {
                setError(t('validation'));
                return;
              }
              if (
                await save(
                  {
                    id: editing && editing !== 'new' ? editing.id : undefined,
                    values: {
                      name: name.trim(),
                      rate: Number(rate),
                      ...(editing === 'new' ? { scope } : {}),
                      isActive: active,
                    },
                  },
                  editing === 'new'
                    ? t('creating')
                    : t('updating', { name: name.trim() }),
                )
              )
                setEditing(null);
            }}
          >
            <label className="block space-y-2">
              <span>{t('name')}</span>
              <Input
                value={name}
                maxLength={100}
                required
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className="block space-y-2">
              <span>{t('rate')}</span>
              <Input
                value={rate}
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                onChange={(event) => setRate(event.target.value)}
              />
            </label>
            <label className="flex gap-3 items-center">
              <Switch checked={active} onCheckedChange={setActive} />
              {t('active')}
            </label>
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={mutation.isPending}
                onClick={() => setEditing(null)}
              >
                {t('cancel')}
              </Button>
              <Button disabled={mutation.isPending}>
                {mutation.isPending ? t('saving') : t('save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <AppAlertDialog
        open={!!deleting}
        title={t('deleteTitle')}
        subTitle={t('deleteHelp')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        loading={mutation.isPending}
        variant="delete"
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (
            deleting &&
            (await save(
              { id: deleting.id, remove: true },
              t('deleting', { name: deleting.name }),
            ))
          )
            setDeleting(null);
        }}
      />
    </div>
  );
}
