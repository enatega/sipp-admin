// lib/socket.ts
import { io, Socket } from "socket.io-client";
import { getUser } from "@/lib/user";

const sockets: Record<string, Socket> = {};
const socketPath = process.env.NEXT_PUBLIC_SOCKET_PATH ?? "/socket.io";

const normalizeNamespace = (namespace?: string) =>
  (namespace || "").replace(/^\/+/, "").trim();

const normalizeSocketBaseUrl = (baseUrl: string) => {
  try {
    const parsed = new URL(baseUrl);
    return parsed.origin;
  } catch {
    return baseUrl.replace(/\/+$/, "").replace(/\/socket$/, "");
  }
};

const buildSocketUrl = (baseUrl: string, namespace?: string) => {
  const ns = normalizeNamespace(namespace);
  if (!ns) return baseUrl;
  return `${baseUrl.replace(/\/+$/, "")}/${ns}`;
};

export function getSocket(namespace?: string): Socket {
  const key = normalizeNamespace(namespace);
  if (!sockets[key]) {
    const baseUrl = normalizeSocketBaseUrl(process.env.NEXT_PUBLIC_SOCKET_URL!);
    const url = buildSocketUrl(baseUrl, key);

    sockets[key] = io(url, {
      transports: ["websocket"],
      autoConnect: false,
      path: socketPath,
    });
  }

  const user = getUser();
  if (user?.id && user.token) {
    sockets[key].auth = {
      ...(typeof sockets[key].auth === 'object' && sockets[key].auth !== null
        ? sockets[key].auth
        : {}),
      userId: user.id,
      token: user.token,
    };
  }

  return sockets[key];
}
