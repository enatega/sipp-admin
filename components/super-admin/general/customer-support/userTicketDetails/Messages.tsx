'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { LoaderCircle, Paperclip, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocale, useTranslations } from 'next-intl';
import type {
  GetCustomerSupportTicketMessagesByIdResponse,
  Message as Msg,
  SupportModule,
} from '@/types/api/super-admin/general/customerSupport.api';
import { getUser } from '@/lib/user';
import {
  SUPPORT_ATTACHMENT_TYPES,
  supportAttachmentMaxBytes,
  uploadSupportAttachment,
  useSendSupportChatMessage,
} from '@/hooks/api/super-admin/general/customerSupport';
import { useSocket } from '@/hooks/use-socket';
import { ImagePreview } from '@/components/shared/ImagePreview';

const MAX_ATTACHMENTS = 5;

const formatMessageDate = (value: string | undefined, locale: string) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

export default function Messages({
  data,
}: {
  data: GetCustomerSupportTicketMessagesByIdResponse | undefined;
}) {
  const t = useTranslations('customerSupport.details.messages');
  const creatorLabels = useTranslations('customerSupport.filters.creatorLabels');
  const locale = useLocale();
  const { slug } = useParams<{ slug: string }>();
  const ticketId = Array.isArray(slug) ? slug[0] : (slug ?? '');
  const params = useParams<{
    module: SupportModule;
    slug: string;
  }>();

  const supportModule = Array.isArray(params.module)
    ? params.module[0]
    : (params.module ?? '');
  const user = getUser();
  const userId = user?.id;
  const receiverId = data?.sender?.id;
  const canReply = !!userId && data?.assignedAdminId === userId;
  const assignmentMessage = !data?.assignedAdminId
    ? 'Take this ticket before replying.'
    : `Ticket is already assigned to ${data.assignedAdminName ?? 'another admin'}.`;
  const queryClient = useQueryClient();

  const [liveMessages, setLiveMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const serverMessages = useMemo(() => data?.messages ?? [], [data?.messages]);

  const { socket, connected } = useSocket(undefined, {
    namespace: 'deliveries',
  });

  useEffect(() => {
    if (!connected || !userId) return;
    socket.emit('add-user', userId);
  }, [connected, socket, userId]);

  const messages = useMemo(() => {
    if (liveMessages.length === 0) {
      return serverMessages;
    }

    const signatures = new Set(
      serverMessages.map(
        (message) =>
          `${message.sender_id}|${message.receiver_id}|${message.text}|${message.createdAt}`,
      ),
    );

    const mergedMessages = [...serverMessages];

    liveMessages.forEach((message) => {
      const signature = `${message.sender_id}|${message.receiver_id}|${message.text}|${message.createdAt}`;
      if (!signatures.has(signature)) {
        mergedMessages.push(message);
      }
    });

    return mergedMessages;
  }, [liveMessages, serverMessages]);

  useEffect(() => {
    if (connected) console.log('✅ Socket connected:', socket.id);
    else console.log('⚠️ Socket disconnected');
  }, [connected, socket]);

  useEffect(() => {
    const handleSupportUpdated = (payload: {
      type: string;
      chatBoxId: string;
      message?: Msg;
    }) => {
      if (payload?.chatBoxId !== ticketId) return;

      // Own messages are already shown optimistically by sendMessage().
      if (
        payload.type === 'message' &&
        payload.message &&
        payload.message.sender_id !== userId
      ) {
        const msg = payload.message;
        setLiveMessages((prev) =>
          prev.find((x) => x.id === msg.id) ? prev : [...prev, msg],
        );
      }

      queryClient.invalidateQueries({
        queryKey: ['get-support-chat-messages-by-id'],
      });
    };

    socket.on('support-updated', handleSupportUpdated);

    return () => {
      socket.off('support-updated', handleSupportUpdated);
    };
  }, [socket, ticketId, queryClient, userId]);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  const { mutate, isPending } = useSendSupportChatMessage(supportModule);

  const uploadAttachments = async (files: FileList | null) => {
    if (!files?.length) return;
    const available = MAX_ATTACHMENTS - attachments.length;
    const selected = Array.from(files);
    if (selected.length > available) toast.error(t('attachmentLimit'));
    const valid = selected.slice(0, Math.max(0, available)).filter((file) => {
      const ok = SUPPORT_ATTACHMENT_TYPES.includes(file.type) && file.size <= supportAttachmentMaxBytes(file.type);
      if (!ok) toast.error(t('attachmentInvalid'));
      return ok;
    });
    if (!valid.length) return;
    setIsUploading(true);
    try {
      const urls = await Promise.all(valid.map(uploadSupportAttachment));
      setAttachments((current) => [...current, ...urls].slice(0, MAX_ATTACHMENTS));
    } catch {
      toast.error(t('attachmentUploadError'));
    } finally {
      setIsUploading(false);
    }
  };

  const sendMessage = () => {
    const text = input.trim();
    const attachmentUrls = attachments;
    if ((!text && !attachmentUrls.length) || !userId || !receiverId || !canReply || isPending || isUploading) return;
    setInput('');
    setAttachments([]);

    // Only show the message once send-to-chat-box actually succeeds, using
    // the server-persisted record (real id + real createdAt) so it isn't
    // duplicated once the message list refetches with the same row.
    mutate(
      { chatBoxId: ticketId, text, ...(attachmentUrls.length ? { attachmentUrls } : {}) },
      {
        onSuccess: (response) => {
          const detail = response?.detail;
          if (!detail) return;
          setLiveMessages((prev) =>
            prev.find((x) => x.id === detail.id) ? prev : [...prev, detail],
          );
        },
        onError: () => {
          setInput(text);
          setAttachments(attachmentUrls);
        },
      },
    );
  };

  return (
    <div className="flex min-w-0 max-w-full flex-col h-full bg-white shadow-xs rounded-md border overflow-hidden">
      <div ref={listRef} className="min-w-0 flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.map((m, idx) => {
          const mine = m.sender_id === userId;
          const isRequesterMessage = m.sender_id === data?.sender?.id || (m.senderType && m.senderType !== 'admin');
          const isAdminMessage = !isRequesterMessage;
          const senderName = m.senderName || (isRequesterMessage ? data?.sender?.name : undefined);
          return (
            <div
              key={m?.id ?? idx}
              className={`flex gap-3 ${isAdminMessage ? 'justify-end' : 'justify-start'}`}
            >
              {isRequesterMessage && (
                <div className="h-8 w-8 shrink-0 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-semibold">
                  {(senderName ?? 'C').trim()[0]}
                </div>
              )}
              <div
                className={`min-w-0 max-w-[85%] sm:max-w-[78%] rounded-xl px-4 py-2.5 ${
                  isAdminMessage
                    ? 'rounded-br-sm bg-primary text-primary-foreground'
                    : 'rounded-bl-sm bg-slate-100 text-slate-900'
                }`}
              >
                <div className={`mb-1 text-xs font-semibold ${isAdminMessage ? 'text-primary-foreground/80' : 'text-slate-600'}`}>
                  {isAdminMessage
                    ? t('supportSender', { name: senderName || (mine ? user?.role?.name || 'Support' : 'Support') })
                    : data?.ticket?.creatorType === 'store' || data?.ticket?.creatorType === 'rider'
                      ? `${creatorLabels(data.ticket.creatorType)}: ${senderName || '—'}`
                      : t('customerSender', { name: senderName || 'Customer' })}
                </div>
                <div className="whitespace-pre-wrap [overflow-wrap:anywhere] text-sm">{m.text}</div>
                {m.attachmentUrls?.map((url, attachmentIndex) => (
                  <ImagePreview key={url} image={url} label={t('attachment', { number: attachmentIndex + 1 })} className="mt-2" imageClassName="h-32" />
                ))}
                <div
                  className={`mt-2 text-[11px] ${isAdminMessage ? 'text-primary-foreground/70' : 'text-slate-500'}`}
                >
                  {formatMessageDate(m.createdAt, locale)}
                </div>
              </div>
              {isAdminMessage && (
                <div className="h-8 w-8 shrink-0 rounded-full bg-primary-soft text-ink flex items-center justify-center text-sm font-semibold">
                  {(senderName || (mine ? user?.email : undefined))?.[0]?.toUpperCase() || 'S'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input */}
      {canReply && attachments.length ? (
        <div className="flex flex-wrap gap-2 border-t px-4 pt-3">
          {attachments.map((url, index) => (
            <span key={url} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-3 pr-1.5 text-xs text-slate-700">
              <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                {t('attachment', { number: index + 1 })}
              </a>
              <button
                type="button"
                aria-label={t('removeAttachment')}
                onClick={() => setAttachments((current) => current.filter((item) => item !== url))}
                disabled={isPending}
                className="grid size-5 place-items-center rounded-full hover:bg-slate-200"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <div className={`px-4 py-3 flex gap-3 ${canReply && attachments.length ? '' : 'border-t'}`}>
        {!canReply ? (
          <div className="text-sm text-amber-700 self-center">
            {assignmentMessage}
          </div>
        ) : null}
        <label
          aria-label={isUploading ? t('uploading') : t('attach')}
          title={isUploading ? t('uploading') : t('attach')}
          className={`relative grid w-11 shrink-0 place-items-center overflow-hidden rounded-md border text-slate-600 focus-within:ring-2 focus-within:ring-ink/30 ${
            !canReply || isUploading || isPending || attachments.length >= MAX_ATTACHMENTS
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            accept={SUPPORT_ATTACHMENT_TYPES.join(',')}
            multiple
            // Kept inside the (relative) button: an sr-only input positioned
            // against a far ancestor makes the browser scroll the page's
            // overflow-hidden containers when the file picker opens.
            className="sr-only"
            disabled={!canReply || isUploading || isPending || attachments.length >= MAX_ATTACHMENTS}
            onChange={(event) => {
              void uploadAttachments(event.target.files);
              event.target.value = '';
            }}
          />
          {isUploading ? (
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <Paperclip className="size-5" aria-hidden="true" />
          )}
        </label>
        <div className="relative flex items-center border rounded-md w-full">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              !e.shiftKey &&
              (e.preventDefault(), sendMessage())
            }
            placeholder={t('placeholder')}
            disabled={!canReply}
            className="resize-none px-3 text-sm border-none outline-none pt-2 w-full"
            rows={2}
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={!canReply || isPending || isUploading || (!input.trim() && !attachments.length)}
          aria-busy={isPending}
          className="min-w-20 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary-pressed disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <LoaderCircle
              className="mx-auto size-5 animate-spin"
              aria-hidden="true"
            />
          ) : (
            t('send')
          )}
        </button>
      </div>
    </div>
  );
}
