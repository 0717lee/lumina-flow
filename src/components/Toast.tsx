import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import useFlowStore from '@/store/flowStore';
import { translations } from '@/i18n/translations';
import { useToastStore } from '@/store/toastStore';

const toneStyles = {
  info: 'border-space-700 bg-space-800/95 text-starlight-100',
  success: 'border-emerald-500/40 bg-space-800/95 text-starlight-100 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.18)]',
  error: 'border-rose-500/40 bg-space-800/95 text-starlight-100 shadow-[inset_0_0_0_1px_rgba(251,113,133,0.18)]',
} as const;

const toneAccent = {
  info: 'bg-nebula-400',
  success: 'bg-emerald-400',
  error: 'bg-rose-400',
} as const;

export default function ToastViewport() {
  const language = useFlowStore((state) => state.language);
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);
  const t = translations[language];

  return (
    <div
      className="pointer-events-none fixed bottom-24 left-1/2 z-[60] flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4"
      role="region"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={clsx(
              'pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-xl backdrop-blur-xl',
              toneStyles[toast.tone],
            )}
          >
            <span className={clsx('h-2 w-2 shrink-0 rounded-full', toneAccent[toast.tone])} aria-hidden />
            <p className="flex-1 leading-relaxed">{toast.message}</p>
            {toast.actionLabel && toast.onAction ? (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.();
                  dismiss(toast.id);
                }}
                className="rounded-full border border-space-700 px-3 py-1 text-xs font-medium text-nebula-400 transition-colors hover:border-nebula-500 hover:bg-space-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-500 focus-visible:ring-offset-2 focus-visible:ring-offset-space-800"
              >
                {toast.actionLabel}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded-full p-1 text-starlight-400 transition-colors hover:text-starlight-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-500 focus-visible:ring-offset-2 focus-visible:ring-offset-space-800"
              aria-label={t.close}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
