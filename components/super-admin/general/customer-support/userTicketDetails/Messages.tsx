'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type {
  GetCustomerSupportTicketMessagesByIdResponse,
  Message as Msg,
  SupportModule,
} from '@/types/api/super-admin/general/customerSupport.api';
import { getUser } from '@/lib/user';
import { useSendSupportChatMessage } from '@/hooks/api/super-admin/general/customerSupport';
import { useSocket } from '@/hooks/use-socket';
import RelativeTime from '@/components/shared/RelativeTime';
import { ImagePreview } from '@/components/shared/ImagePreview';

export default function Messages({
  data,
}: {
  data: GetCustomerSupportTicketMessagesByIdResponse | undefined;
}) {
  const t = useTranslations('customerSupport.details.messages');
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

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !userId || !receiverId || !canReply || isPending) return;
    setInput('');

    // Only show the message once send-to-chat-box actually succeeds, using
    // the server-persisted record (real id + real createdAt) so it isn't
    // duplicated once the message list refetches with the same row.
    mutate(
      { chatBoxId: ticketId, text },
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
        },
      },
    );
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-xs rounded-md border overflow-scroll">
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.map((m, idx) => {
          const mine = m.sender_id === userId;
          const isAdminMessage =
            m.senderType === 'admin' || (m.senderType === undefined && mine);
          const isCustomerMessage = !isAdminMessage;
          return (
            <div
              key={m?.id ?? idx}
              className={`flex gap-3 ${mine ? 'justify-end' : 'justify-start'}`}
            >
              {isCustomerMessage && (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                  {(m.senderName ?? data?.sender?.name ?? 'C').trim()[0]}
                </div>
              )}
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg shadow-sm ${
                  isAdminMessage ? 'text-white' : 'text-black'
                }`}
                style={{
                  backgroundColor: mine ? 'var(--primary,#0ea5e9)' : isAdminMessage ? '#dcfce7' : 'var(--muted,#f3f4f6)',
                }}
              >
                {!mine && (
                  <div className="mb-1 text-[11px] font-semibold text-gray-600">
                    {isAdminMessage
                      ? `Admin: ${m.senderName ?? 'Support admin'}`
                      : 'Customer'}
                  </div>
                )}
                <div className={`text-sm text-black`}>{m.text}</div>
                {m.attachmentUrls?.map((url, attachmentIndex) => (
                  <ImagePreview key={url} image={url} label={`Attachment ${attachmentIndex + 1}`} className="mt-2" imageClassName="h-32" />
                ))}
                <div
                  className={`mt-1 text-[11px] ${mine ? 'text-white/80' : 'text-mute'}`}
                >
                  <RelativeTime date={m.createdAt} />
                </div>
              </div>
              {isAdminMessage && (
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-sm"
                  style={{ backgroundColor: '#e0f2fe', color: '#0ea5e9' }}
                >
                  {(mine
                    ? user?.role?.name
                    : m.senderName)?.[0]?.toUpperCase() ||
                    (mine ? user?.email : m.senderName)?.[0]?.toUpperCase() ||
                    '?'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t flex gap-3">
        {!canReply ? (
          <div className="text-sm text-amber-700 self-center">
            {assignmentMessage}
          </div>
        ) : null}
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
          {/* <Paperclip className="text-mute absolute right-2 top-2" size={18} /> */}
        </div>
        <button
          onClick={sendMessage}
          disabled={!canReply || isPending || !input.trim()}
          aria-busy={isPending}
          className="min-w-20 px-4 py-2 text-sm rounded-md text-white disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: 'var(--primary,#0ea5e9)' }}
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
