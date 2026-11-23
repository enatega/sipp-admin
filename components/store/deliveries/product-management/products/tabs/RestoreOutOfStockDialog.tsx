'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import Axios from '@/config/axios';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { handleApiError } from '@/lib/toast-error';
import type { ApiErrorResponse } from '@/types';

type AffectedItem = { id: string; name: string; sku: string; stockQuantity: number | null };

export function RestoreOutOfStockDialog({ storeId, openFromEmail }: { storeId: string; openFromEmail: boolean }) {
  const t = useTranslations('products.restore');
  const [manualOpen, setManualOpen] = useState(false);
  const [emailLinkDismissed, setEmailLinkDismissed] = useState(false);
  const open = manualOpen || (openFromEmail && !emailLinkDismissed);
  const setOpen = (nextOpen: boolean) => {
    setManualOpen(nextOpen);
    if (!nextOpen) setEmailLinkDismissed(true);
  };
  const [quantity, setQuantity] = useState('');
  const queryClient = useQueryClient();

  const affected = useQuery({
    queryKey: ['long-out-of-stock', storeId],
    queryFn: async () => {
      const { data } = await Axios.get<AffectedItem[]>(`/apps/deliveries/products/store/${storeId}/long-out-of-stock`);
      return data;
    },
    enabled: open && Boolean(storeId),
    retry: false,
  });
  const zeroStockCount = affected.data?.filter((item) => Number(item.stockQuantity || 0) <= 0).length || 0;
  const parsedQuantity = Number(quantity);
  const validQuantity = Number.isSafeInteger(parsedQuantity) && parsedQuantity > 0;

  const restore = useMutation<{ restored: number }, ApiErrorResponse, void>({
    mutationFn: async () => {
      const { data } = await Axios.post<{ restored: number }>(
        `/apps/deliveries/products/store/${storeId}/restore-long-out-of-stock`,
        zeroStockCount ? { quantityForZeroStock: parsedQuantity } : {},
      );
      return data;
    },
    onSuccess: async ({ restored }) => {
      await queryClient.invalidateQueries({ queryKey: ['store-products'] });
      await queryClient.invalidateQueries({ queryKey: ['long-out-of-stock', storeId] });
      toast.success(t('success', { count: restored }));
      setOpen(false);
      setQuantity('');
    },
    onError: (error) => handleApiError(error),
  });

  return <>
    <Button type="button" variant="outline" onClick={() => setOpen(true)}>{t('button')}</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        {affected.isLoading ? <p>{t('loading')}</p> : affected.isError ?
          <p role="alert" className="text-destructive">{t('loadError')}</p> :
          <div className="flex max-h-56 flex-col gap-2 overflow-y-auto text-sm">
            {(affected.data || []).slice(0, 30).map((item) => <p key={item.id}>{t('itemStock', { name: item.name, sku: item.sku, quantity: item.stockQuantity ?? 0 })}</p>)}
            {(affected.data?.length || 0) > 30 && <p>{t('more', { count: (affected.data?.length || 0) - 30 })}</p>}
            {!affected.data?.length && <p>{t('empty')}</p>}
          </div>}
        {zeroStockCount > 0 && <div className="flex flex-col gap-2">
          <Label htmlFor="restore-stock-quantity">{t('quantityLabel', { count: zeroStockCount })}</Label>
          <Input id="restore-stock-quantity" type="number" min={1} step={1} value={quantity}
            onChange={(event) => setQuantity(event.target.value)} aria-invalid={quantity !== '' && !validQuantity} />
          <p className="text-sm text-muted-foreground">{t('keepQuantity')}</p>
        </div>}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('cancel')}</Button>
          <Button type="button" disabled={affected.isLoading || affected.isError || !affected.data?.length ||
            (zeroStockCount > 0 && !validQuantity) || restore.isPending}
            onClick={() => restore.mutate()}>
            {restore.isPending ? t('restoring') : t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>;
}
