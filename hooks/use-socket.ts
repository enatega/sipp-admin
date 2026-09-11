// lib/useSocket.ts
"use client";

import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";

import { getSocket } from "@/lib/socket";
import { getUser } from "@/lib/user";

// Socket events are app-specific. We intentionally make handler parameters
// bivariant so callers can pass strongly-typed handlers (e.g. (msg: Message) => {})
// without fighting function-parameter variance.
type SocketEventHandler = {
  bivarianceHack: (...args: unknown[]) => unknown;
}["bivarianceHack"];
type SocketEventsMap = Record<string, SocketEventHandler>;

type UseSocketOptions = {
  /** default: true */
  autoConnect?: boolean;
  /** socket.io namespace, e.g. "deliveries" for `${NEXT_PUBLIC_SOCKET_URL}/deliveries` */
  namespace?: string;
};

export function useSocket(
  events?: SocketEventsMap,
  opts: UseSocketOptions = { autoConnect: true }
) {
  const [socket] = useState<Socket>(() => {
    const s = getSocket(opts.namespace);
    const userId = getUser()?.id ?? null;

    if (userId) {
      s.auth = {
        ...(typeof s.auth === 'object' && s.auth !== null ? s.auth : {}),
        userId,
      };
    }

    return s;
  });
  const [connected, setConnected] = useState<boolean>(socket.connected);

  useEffect(() => {
    const s = socket;
    const userId = getUser()?.id ?? null;

    const onConnect = () => {
      console.log('[admin][socket] connect', {
        namespace: opts.namespace || 'default',
        socketId: s.id,
        connected: s.connected,
        active: s.active,
        userId,
      });
      setConnected(true);
    };
    const onDisconnect = (reason: Socket.DisconnectReason) => {
      console.log('[admin][socket] disconnect', {
        namespace: opts.namespace || 'default',
        socketId: s.id,
        reason,
        connected: s.connected,
        active: s.active,
        userId,
      });
      setConnected(false);
    };
    const onConnectError = (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);

      // Socket.IO retries transient failures automatically. Keep the failure
      // visible without triggering Next's development error overlay.
      console.warn('[admin][socket] connect_error', {
        namespace: opts.namespace || 'default',
        socketId: s.id,
        message,
        connected: s.connected,
        active: s.active,
      });
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("connect_error", onConnectError);

    console.log('[admin][socket] init', {
      namespace: opts.namespace || 'default',
      socketId: s.id,
      connected: s.connected,
      active: s.active,
      userId,
      autoConnect: opts.autoConnect !== false,
    });

    // Register user-defined events (once per mount)
    if (events) {
      for (const [event, handler] of Object.entries(events)) {
        s.on(event, handler);
      }
    }

    if (opts.autoConnect !== false && !s.connected) {
      console.log('[admin][socket] connect()', {
        namespace: opts.namespace || 'default',
        socketId: s.id,
        connected: s.connected,
        active: s.active,
        userId,
      });
      s.connect();
    }

    return () => {
      if (events) {
        for (const [event, handler] of Object.entries(events)) {
          s.off(event, handler);
        }
      }
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("connect_error", onConnectError);
      // Don't disconnect here — singleton is shared app-wide.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // keep empty so we don't re-bind on every render

    return {
    socket,
    connected,
  };
}
