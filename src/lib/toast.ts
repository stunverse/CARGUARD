"use client";

// Minimal dependency-free toast store. Call toast.success/error/info from
// any client component; mount <Toaster/> once (in the root layout).

export type ToastType = "success" | "error" | "info";
export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

let items: ToastItem[] = [];
const listeners = new Set<(items: ToastItem[]) => void>();
let counter = 0;

function emit() {
  const snapshot = [...items];
  listeners.forEach((l) => l(snapshot));
}

export function subscribeToasts(l: (items: ToastItem[]) => void) {
  listeners.add(l);
  l([...items]);
  return () => {
    listeners.delete(l);
  };
}

export function dismissToast(id: number) {
  items = items.filter((i) => i.id !== id);
  emit();
}

function push(type: ToastType, message: string) {
  const id = ++counter;
  items = [...items, { id, type, message }];
  emit();
  setTimeout(() => dismissToast(id), 4500);
}

export const toast = {
  success: (m: string) => push("success", m),
  error: (m: string) => push("error", m),
  info: (m: string) => push("info", m),
};
