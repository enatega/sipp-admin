"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";

// The server only streams `get-rider-location-admin` to sockets that opted in,
// so riders' pings cost nothing while no admin has a tracking screen open.
// Several screens share the singleton socket, so unsubscribe only when the
// last one unmounts.
let activeSubscribers = 0;

export function useAdminRiderTracking(
  socket: Socket,
  connected: boolean,
  enabled = true,
) {
  const lastTimestampByRiderRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!connected || !enabled) return;

    activeSubscribers += 1;
    // Rooms are dropped on reconnect; `connected` flipping back re-subscribes.
    socket.emit("subscribe-admin-rider-tracking");

    return () => {
      activeSubscribers = Math.max(0, activeSubscribers - 1);
      if (activeSubscribers === 0 && socket.connected) {
        socket.emit("unsubscribe-admin-rider-tracking");
      }
    };
  }, [connected, enabled, socket]);

  /** False for delayed samples older than the last one shown for that rider. */
  const isFreshSample = useCallback(
    (riderUserId: string, timestamp?: number) => {
      if (typeof timestamp !== "number") return true;
      const last = lastTimestampByRiderRef.current[riderUserId];
      if (last !== undefined && timestamp < last) return false;
      lastTimestampByRiderRef.current[riderUserId] = timestamp;
      return true;
    },
    [],
  );

  return { isFreshSample };
}
