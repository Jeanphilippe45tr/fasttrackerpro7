import { supabase } from '@/integrations/supabase/client';

const SW_URL = '/sw-push.js';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function pushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function pushPermission(): NotificationPermission {
  return typeof Notification !== 'undefined' ? Notification.permission : 'default';
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  const reg = await navigator.serviceWorker.register(SW_URL);
  await navigator.serviceWorker.ready;
  return reg;
}

async function getPublicKey(): Promise<string> {
  const { data, error } = await supabase.functions.invoke('push-api', { body: { action: 'getPublicKey' } });
  if (error || !data?.publicKey) throw new Error('Missing VAPID key');
  return data.publicKey;
}

/**
 * Enable push for an admin (requires admin token) or a client (requires trackingCode).
 * Returns true on success.
 */
export async function enablePush(opts: { subscriberType: 'admin' | 'client'; token?: string; trackingCode?: string }): Promise<boolean> {
  if (!pushSupported()) throw new Error('unsupported');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('denied');

  const reg = await getRegistration();
  const publicKey = await getPublicKey();
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey).buffer as ArrayBuffer,
    });
  }

  const { error } = await supabase.functions.invoke('push-api', {
    body: {
      action: 'subscribe',
      data: {
        subscription: sub.toJSON(),
        subscriberType: opts.subscriberType,
        trackingCode: opts.trackingCode,
      },
    },
    headers: opts.token ? { Authorization: `Bearer ${opts.token}` } : undefined,
  });
  if (error) throw error;
  return true;
}

export async function disablePush(): Promise<void> {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration(SW_URL);
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await supabase.functions.invoke('push-api', { body: { action: 'unsubscribe', data: { endpoint: sub.endpoint } } });
    await sub.unsubscribe();
  }
}
