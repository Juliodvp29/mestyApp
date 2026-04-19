import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'mesty_device_id';

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getDeviceType(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'web';
}

export function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) return 'Android Device';
  return 'Web Browser';
}
