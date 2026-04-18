import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { memo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import useFlowStore from '@/store/flowStore';
import { useFlowUiStore } from '@/store/uiStore';
import { useToastStore } from '@/store/toastStore';
import { translations } from '@/i18n/translations';
import type { FlowNode } from '@/types/flow';

const colorClasses = {
  nebula: {
    accent: 'bg-nebula-500',
    selectedFrame: 'border-transparent shadow-[inset_0_0_0_1px_rgba(99,102,241,0.34),0_0_28px_rgba(99,102,241,0.16)]',
    badge: 'bg-space-900 text-nebula-400 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.18)]',
    handle: '!border-nebula-500',
  },
  sun: {
    accent: 'bg-amber-400',
    selectedFrame: 'border-transparent shadow-[inset_0_0_0_1px_rgba(251,191,36,0.3),0_0_28px_rgba(251,191,36,0.14)]',
    badge: 'bg-space-900 text-amber-300 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.18)]',
    handle: '!border-amber-400',
  },
  mint: {
    accent: 'bg-emerald-400',
    selectedFrame: 'border-transparent shadow-[inset_0_0_0_1px_rgba(52,211,153,0.28),0_0_28px_rgba(52,211,153,0.14)]',
    badge: 'bg-space-900 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.18)]',
    handle: '!border-emerald-400',
  },
  rose: {
    accent: 'bg-rose-400',
    selectedFrame: 'border-transparent shadow-[inset_0_0_0_1px_rgba(251,113,133,0.3),0_0_28px_rgba(251,113,133,0.14)]',
    badge: 'bg-space-900 text-rose-300 shadow-[inset_0_0_0_1px_rgba(251,113,133,0.18)]',
    handle: '!border-rose-400',
  },
} as const;

function GlassNode({ id, data, selected }: NodeProps<FlowNode>) {
  const language = useFlowStore((state) => state.language);
  const updateNode = useFlowStore((state) => state.updateNode);
  const deleteNode = useFlowStore((state) => state.deleteNode);
  const isDimmed = useFlowUiStore((state) => state.spotlightNodeIds.length > 0 && !state.spotlightNodeIds.includes(id));
  const isSearchMatch = useFlowUiStore((state) => state.highlightedNodeIds.includes(id));
  const shouldAutoEdit = useFlowUiStore((state) => state.pendingFocusNodeId === id);
  const clearPendingFocus = useFlowUiStore((state) => state.clearPendingFocus);
  const [isEditing, setIsEditing] = useState(shouldAutoEdit);
  const [draftLabel, setDraftLabel] = useState(data.label);
  const t = translations[language];
  const palette = colorClasses[data.color];
  const badgeTypography = language === 'zh' ? 'tracking-wide' : 'uppercase tracking-[0.3em]';
  const typeTypography = language === 'zh' ? 'tracking-widest' : 'uppercase tracking-[0.3em]';

  const startEditing = (): void => {
    setDraftLabel(data.label);
    setIsEditing(true);
  };

  const commitLabel = (): void => {
    const nextLabel = draftLabel.trim() || data.label;

    setDraftLabel(nextLabel);
    setIsEditing(false);

    if (nextLabel !== data.label) {
      updateNode(id, { label: nextLabel });
    }
  };

  return (
    <div
      className={clsx(
        'group relative min-w-[220px] rounded-3xl border bg-space-800/65 backdrop-blur-xl transition-all duration-300',
        isDimmed ? 'opacity-20 grayscale blur-[1px]' : 'opacity-100',
        selected
          ? palette.selectedFrame
          : 'border-space-700 shadow-xl hover:border-space-600 hover:shadow-2xl',
        isSearchMatch && !selected ? 'ring-1 ring-amber-300/40 border-amber-300/40' : '',
      )}
    >
      <button
        onClick={(event) => {
          event.stopPropagation();
          deleteNode(id);
          useToastStore.getState().push({
            tone: 'info',
            message: t.toastNodeDeleted,
            actionLabel: t.toastUndo,
            onAction: () => useFlowStore.getState().undo(),
          });
        }}
        className={clsx(
          'absolute -top-2 -right-2 z-50 p-1.5 rounded-full bg-space-900 border border-space-700 text-starlight-400 hover:text-red-400 hover:border-red-900 transition-all opacity-0 scale-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-500 focus-visible:ring-offset-2 focus-visible:ring-offset-space-800',
          selected || isEditing ? 'opacity-100 scale-100' : 'group-hover:opacity-100 group-hover:scale-100',
        )}
        title={t.delete}
        aria-label={`${t.delete}: ${data.label}`}
      >
        <Trash2 size={14} />
      </button>

      <Handle
        type="target"
        position={Position.Top}
        className={clsx('!w-3 !h-3 !-top-1.5 !bg-space-950 !border-2 transition-all opacity-0 group-hover:opacity-100', palette.handle)}
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className={clsx('w-2.5 h-2.5 rounded-full', palette.accent)} />
            <span className={clsx('text-[10px] text-starlight-400 font-mono', typeTypography)}>{t.nodeType}</span>
          </div>
          <span className={clsx('text-[10px] px-2 py-1 rounded-full', badgeTypography, palette.badge)}>
            {t.statuses[data.status]}
          </span>
        </div>

        {isEditing ? (
          <textarea
            value={draftLabel}
            onChange={(event) => setDraftLabel(event.target.value)}
            onBlur={commitLabel}
            autoFocus
            onFocus={() => clearPendingFocus()}
            className="w-full bg-transparent text-starlight-100 font-medium text-lg leading-tight resize-none outline-none border-b border-white/10 pb-1"
            rows={Math.max(1, Math.ceil(draftLabel.length / 20))}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                commitLabel();
              }
            }}
          />
        ) : (
          <button
            type="button"
            onDoubleClick={(event) => {
              event.stopPropagation();
              startEditing();
            }}
            className="block w-full text-left text-starlight-100 font-medium text-lg leading-tight min-h-[28px]"
          >
            {data.label}
          </button>
        )}

        {data.note ? <p className="mt-3 text-sm text-starlight-200/80 leading-6">{data.note}</p> : null}

        {data.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {data.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[11px] px-2 py-1 rounded-full bg-space-900/80 text-starlight-400 border border-space-700">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className={clsx('h-0.5 w-full opacity-60', palette.accent)} />

      <Handle
        type="source"
        position={Position.Bottom}
        className={clsx('!w-3 !h-3 !-bottom-1.5 !bg-space-950 !border-2 transition-all opacity-0 group-hover:opacity-100', palette.handle)}
      />
    </div>
  );
}

export default memo(GlassNode);
