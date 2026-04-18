import { create } from 'zustand';

export type ToastTone = 'info' | 'success' | 'error';

export type Toast = {
  id: string;
  message: string;
  tone: ToastTone;
  actionLabel?: string;
  onAction?: () => void;
};

type ToastState = {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id'> & { id?: string; durationMs?: number }) => string;
  dismiss: (id: string) => void;
};

const DEFAULT_DURATION_MS = 5000;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: ({ id, durationMs, ...rest }) => {
    const toastId = id ?? `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    set((state) => ({
      toasts: [...state.toasts.filter((existing) => existing.id !== toastId), { id: toastId, ...rest }],
    }));

    const timeout = durationMs ?? DEFAULT_DURATION_MS;

    if (timeout > 0) {
      window.setTimeout(() => {
        if (get().toasts.some((toast) => toast.id === toastId)) {
          get().dismiss(toastId);
        }
      }, timeout);
    }

    return toastId;
  },
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));
