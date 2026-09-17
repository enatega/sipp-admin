'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import type {
  GetCustomerSupportTicketMessagesByIdResponse,
  Message,
  Message as Msg,
  SupportModule,
} from '@/types/api/super-admin/general/customerSupport.api';
import { getUser } from '@/lib/user';
import { useSendSupportChatMessage } from '@/hooks/api/super-admin/general/customerSupport';
import { useSocket } from '@/hooks/use-socket';

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

  const [liveMessages, setLiveMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const serverMessages = useMemo(() => data?.messages ?? [], [data?.messages]);

  const { socket, connected } = useSocket({
    message: (m) => {
      const msg = m as Message;
      if (!msg || msg.chat_box_id !== ticketId) return;
      setLiveMessages((prev) =>
        prev.find((x) => x.id === msg.id) ? prev : [...prev, msg],
      );
    },
  });

  const messages = useMemo(() => {
    if (liveMessages.length === 0) {
      return serverMessages;
    }

    const signatures = new Set(
      serverMessages.map((message) =>
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
    const handleReceiveMessage = (message: {
      sender?: string;
      receiver?: string;
      text?: string;
    }) => {
      const newMsg: Msg = {
        sender_id: message?.sender ?? '',
        receiver_id: message?.receiver ?? '',
        text: message?.text ?? '',
        createdAt: String(new Date()),
      };
      setLiveMessages((prev) => [...prev, newMsg]);
    };

    socket.on('receive-message', handleReceiveMessage);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
    };
  }, [socket]);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  const { mutate } = useSendSupportChatMessage(supportModule);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !userId || !receiverId) return;
    setInput('');
    const body: Msg = {
      sender_id: userId,
      receiver_id: receiverId,
      text,
      createdAt: String(new Date()),
    };
    socket.emit('send-message', {
      sender: userId,
      receiver: receiverId,
      text,
    });

    setLiveMessages((prev) => [...prev, body]);
    mutate({ chatBoxId: ticketId, text });
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-xs rounded-md border overflow-scroll">
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.map((m, idx) => {
          const mine = m.sender_id === userId;
          return (
            <div
              key={m?.id ?? idx}
              className={`flex gap-3 ${mine ? 'justify-end' : 'justify-start'}`}
            >
              {!mine && (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                  {data?.sender?.name.trim()[0]}
                </div>
              )}
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg shadow-sm ${
                  mine ? 'text-white' : 'text-black'
                }`}
                style={{
                  backgroundColor: mine
                    ? 'var(--primary,#0ea5e9)'
                    : 'var(--muted,#f3f4f6)',
                }}
              >
                <div className="text-sm">{m.text}</div>
                <div
                  className={`mt-1 text-[11px] ${mine ? 'text-white/80' : 'text-mute'}`}
                >
                  {moment(m.createdAt).fromNow()}
                </div>
              </div>
              {mine && (
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-sm"
                  style={{ backgroundColor: '#e0f2fe', color: '#0ea5e9' }}
                >
                  {user?.role?.name?.[0]?.toUpperCase() ||
                    user?.email?.[0]?.toUpperCase() ||
                    '?'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t flex gap-3">
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
            className="resize-none px-3 text-sm border-none outline-none pt-2 w-full"
            rows={2}
          />
          {/* <Paperclip className="text-mute absolute right-2 top-2" size={18} /> */}
        </div>
        <button
          onClick={sendMessage}
          className="px-4 py-2 text-sm rounded-md text-white"
          style={{ backgroundColor: 'var(--primary,#0ea5e9)' }}
        >
          {t('send')}
        </button>
      </div>
    </div>
  );
}
