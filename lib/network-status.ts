/**
 * Browser connectivity state shared by the axios client and the
 * NetworkStatusAlert banner.
 *
 * - `offline`: the browser reports no connection (`navigator.onLine`).
 * - `unstable`: the browser thinks it is online, but API requests are
 *   failing without a response (weak or dropping connection).
 */
export type NetworkStatus = 'online' | 'offline' | 'unstable';

type Listener = () => void;

const listeners = new Set<Listener>();
let hasRequestFailures = false;

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeNetworkStatus(listener: Listener) {
  // Failures from before the drop say nothing about the new connection.
  const handleOnline = () => {
    hasRequestFailures = false;
    listener();
  };
  listeners.add(listener);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', listener);
  };
}

export function getNetworkStatus(): NetworkStatus {
  if (!navigator.onLine) return 'offline';
  return hasRequestFailures ? 'unstable' : 'online';
}

export function getServerNetworkStatus(): NetworkStatus {
  return 'online';
}

/** A request failed with no response from the server. */
export function reportNetworkFailure() {
  if (hasRequestFailures) return;
  hasRequestFailures = true;
  emit();
}

/** A request reached the server, so the connection works again. */
export function reportNetworkSuccess() {
  if (!hasRequestFailures) return;
  hasRequestFailures = false;
  emit();
}
