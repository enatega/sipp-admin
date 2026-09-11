'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { SupportModule } from '@/types/api/super-admin/general/customerSupport.api';
import { handleApiError } from '@/lib/toast-error';
import { useUpdateSupportTicketStatus } from '@/hooks/api/super-admin/general/customerSupport';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AppButton } from '@/components/shared/AppButton';

const StatusDropdown = ({ id, status }: { id: string; status: string }) => {
  const params = useParams<{
    module: SupportModule;
    slug: string;
  }>();

  const supportModule = Array.isArray(params.module)
    ? params.module[0]
    : (params.module ?? '');
  const t = useTranslations('customerSupport.details.statusDropdown');
  const [selected, setSelected] = useState<string>(status);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const statuses = [
    {
      key: 'in_progress',
      label: t('inProgress'),
      color: 'bg-orange-400',
      textColor: 'text-orange-600',
    },
    {
      key: 'opened',
      label: t('opened'),
      color: 'bg-yellow-400',
      textColor: 'text-yellow-600',
    },
    {
      key: 'resolved',
      label: t('resolved'),
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
  ];

  const { mutate: updateStatus, isPending } = useUpdateSupportTicketStatus(
    supportModule,
    {
      onSuccess: (response) => {
        toast.success(response.message);
        if (pendingStatus) {
          setSelected(pendingStatus);
        }
        setModalOpen(false);
        setNote('');
      },
      onError: (error) => {
        handleApiError(error);
      },
    },
  );

  const selectedStatus =
    statuses.find((s) => s.key === selected) || statuses[0];

  const handleStatusClick = (statusKey: string) => {
    setPendingStatus(statusKey);
    setModalOpen(true);
  };

  const handleConfirm = () => {
    if (pendingStatus && id) {
      updateStatus({
        chatBoxId: id,
        status: pendingStatus,
        notes: note,
      });
    }
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${selectedStatus.color} text-white text-sm font-medium hover:opacity-90 transition-opacity`}
            aria-label={t('changeStatusAria', {
              status: selectedStatus.label,
            })}
          >
            <span className="text-sm leading-none">{selectedStatus.label}</span>
            <span className="ml-1 flex items-center justify-center w-6 h-6 rounded-full bg-white/10">
              <ChevronDown className="w-3 h-3 text-white" />
            </span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-[220px] p-0 rounded-xl overflow-hidden shadow-lg"
        >
          {statuses.map((s) => (
            <DropdownMenuItem
              key={s.key}
              className="flex items-center gap-3 p-3 cursor-pointer rounded-none hover:bg-gray-50"
              onClick={() => handleStatusClick(s.key)}
            >
              <span
                className={`inline-block w-3 h-3 rounded-full ${s.color}`}
              />
              <span className={`text-sm ${s.textColor}`}>{s.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-mute"
            onClick={() => setModalOpen(false)}
            aria-label={t('close')}
            type="button"
          ></button>
          <div className="flex flex-col items-center gap-4 mt-2">
            <RefreshCw className="w-12 h-12 text-primary" />
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-semibold">
                {t('confirmTitle')}
              </DialogTitle>
              <DialogDescription className="text-center text-gray-600 mt-2">
                {t('confirmDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="w-full mt-2">
              <Label className="block text-sm font-medium mb-1" htmlFor="note">
                {t('addNotes')}
              </Label>
              <Textarea
                id="note"
                className={`w-full border rounded-lg p-3 text-sm resize-none focus:ring-0 focus:outline-none focus-visible:ring-0`}
                rows={5}
                required
                placeholder={t('notesPlaceholder')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <DialogFooter className="flex w-full gap-4">
              <DialogClose asChild>
                <AppButton className="flex-1" type="button" variant="mute">
                  {t('cancel')}
                </AppButton>
              </DialogClose>
              <AppButton
                className="flex-1 bg-primary "
                type="button"
                variant={'primary'}
                onClick={handleConfirm}
                disabled={!note.trim() || isPending}
                isLoading={isPending}
              >
                {t('changeStatus')}
              </AppButton>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StatusDropdown;
