import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(value: number, currency = 'DOP') {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency }).format(value || 0);
}

export function nowIso() {
  return new Date().toISOString();
}

export function uid(prefix = 'id') {
  return `${prefix}_${crypto.randomUUID()}`;
}
