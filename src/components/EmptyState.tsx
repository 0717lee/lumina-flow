import { MousePointerClick, Sparkles } from 'lucide-react';
import useFlowStore from '@/store/flowStore';
import { translations } from '@/i18n/translations';

export default function EmptyState() {
  const language = useFlowStore((state) => state.language);
  const t = translations[language];

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6"
      aria-hidden
    >
      <div className="max-w-md rounded-3xl border border-space-700 bg-space-800/60 p-8 text-center shadow-xl backdrop-blur-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-space-700 bg-space-900 text-nebula-400">
          <Sparkles size={22} />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-starlight-100">{t.emptyBoardTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-starlight-400">{t.emptyBoardHint}</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-space-700 bg-space-900 px-3 py-1.5 text-xs text-starlight-400">
          <MousePointerClick size={14} className="text-nebula-400" />
          <span>{t.doubleClick}</span>
        </div>
      </div>
    </div>
  );
}
