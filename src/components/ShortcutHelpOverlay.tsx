import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import useFlowStore from '@/store/flowStore';
import { translations } from '@/i18n/translations';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ShortcutHelpOverlay({ open, onClose }: Props) {
  const language = useFlowStore((state) => state.language);
  const t = translations[language];
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();

    const handle = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        closeButtonRef.current?.focus();
        return;
      }

      event.stopPropagation();
    };

    window.addEventListener('keydown', handle, true);
    return () => window.removeEventListener('keydown', handle, true);
  }, [open, onClose]);

  const items = [
    t.shortcutChild,
    t.shortcutSibling,
    t.shortcutDelete,
    t.shortcutUndo,
    t.shortcutRedo,
    t.shortcutFocusSearch,
    t.shortcutHelp,
  ];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="shortcut-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-space-950/70 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={t.shortcutHelpTitle}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-md rounded-3xl border border-space-700 bg-space-800/95 p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-starlight-100">{t.shortcutHelpTitle}</h2>
                <p className="mt-1 text-xs text-starlight-400">{t.shortcutCloseHelp}</p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-starlight-400 transition-colors hover:bg-space-700 hover:text-starlight-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-500 focus-visible:ring-offset-2 focus-visible:ring-offset-space-800"
                aria-label={t.close}
              >
                <X size={16} />
              </button>
            </div>

            <ul className="mt-5 space-y-2">
              {items.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-space-700 bg-space-900 px-4 py-3 text-sm text-starlight-200"
                >
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
