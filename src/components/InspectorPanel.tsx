import type { ReactNode } from 'react';
import { useState } from 'react';
import { clsx } from 'clsx';
import useFlowStore, { selectActiveBoard } from '@/store/flowStore';
import { useFlowUiStore } from '@/store/uiStore';
import { translations } from '@/i18n/translations';
import { FLOW_NODE_COLORS, FLOW_NODE_STATUSES } from '@/types/flow';
import type { FlowNode } from '@/types/flow';

const colorButtonClasses = {
  nebula: 'bg-nebula-500',
  sun: 'bg-amber-400',
  mint: 'bg-emerald-400',
  rose: 'bg-rose-400',
} as const;

export default function InspectorPanel() {
  const language = useFlowStore((state) => state.language);
  const activeBoard = useFlowStore(selectActiveBoard);
  const selectedNodeId = useFlowUiStore((state) => state.selectedNodeId);
  const inspectorOpen = useFlowUiStore((state) => state.inspectorOpen);
  const selectedNode = activeBoard.nodes.find((node) => node.id === selectedNodeId) ?? null;
  const t = translations[language];

  return (
    <aside
      className={clsx(
        'absolute top-40 right-6 z-50 w-80 max-h-[calc(100vh-11rem)] overflow-y-auto rounded-[28px] p-4 transition-all duration-300 lumina-panel',
        inspectorOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-6 opacity-0 pointer-events-none',
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-starlight-100 font-semibold">{t.inspector}</h2>
        {selectedNode ? <span className="text-xs text-starlight-400">{selectedNode.id.slice(0, 8)}</span> : null}
      </div>

      {selectedNode ? (
        <NodeInspectorForm
          key={`${selectedNode.id}-${selectedNode.data.label}-${selectedNode.data.note}-${selectedNode.data.tags.join(',')}-${selectedNode.data.status}-${selectedNode.data.color}`}
          node={selectedNode}
        />
      ) : (
        <div className="mt-4 rounded-3xl border border-space-700 bg-space-900 p-4">
          <p className="text-sm text-starlight-100">{t.inspectorHint}</p>
          <div className="mt-4 space-y-2 text-xs text-starlight-400">
            <p>{t.shortcutChild}</p>
            <p>{t.shortcutSibling}</p>
            <p>{t.shortcutDelete}</p>
            <p>{t.shortcutUndo}</p>
            <p>{t.shortcutRedo}</p>
          </div>
        </div>
      )}
    </aside>
  );
}

function NodeInspectorForm({ node }: { node: FlowNode }) {
  const language = useFlowStore((state) => state.language);
  const updateNode = useFlowStore((state) => state.updateNode);
  const t = translations[language];

  const [label, setLabel] = useState(node.data.label);
  const [note, setNote] = useState(node.data.note);
  const [tagsInput, setTagsInput] = useState(node.data.tags.join(', '));

  const commitTags = (): void => {
    updateNode(node.id, {
      tags: tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  };

  return (
    <div className="mt-4 space-y-4">
      <Field label={t.label}>
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          onBlur={() => updateNode(node.id, { label: label.trim() || node.data.label })}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur();
            }
          }}
          className="lumina-field"
        />
      </Field>

      <Field label={t.note}>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          onBlur={() => updateNode(node.id, { note: note.trim() })}
          className="lumina-field min-h-28 resize-y py-3"
          placeholder={t.notePlaceholder}
        />
      </Field>

      <Field label={t.tags}>
        <input
          value={tagsInput}
          onChange={(event) => setTagsInput(event.target.value)}
          onBlur={commitTags}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
          className="lumina-field"
          placeholder={t.tagsPlaceholder}
        />
      </Field>

      <Field label={t.status}>
        <select
          value={node.data.status}
          onChange={(event) => updateNode(node.id, { status: event.target.value as (typeof FLOW_NODE_STATUSES)[number] })}
          className="lumina-field"
        >
          {FLOW_NODE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {t.statuses[status]}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t.color}>
        <div className="grid grid-cols-4 gap-2">
          {FLOW_NODE_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => updateNode(node.id, { color })}
              className={clsx(
                'rounded-2xl border border-space-700 bg-space-900 p-2 transition-colors',
                node.data.color === color ? 'border-white/20 ring-1 ring-white/15' : 'hover:border-nebula-500/40',
              )}
            >
              <div className={`h-8 rounded-xl ${colorButtonClasses[color]}`} />
              <div className="mt-2 text-[11px] text-starlight-400">{t.colors[color]}</div>
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

function Field(props: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-xs text-starlight-400">{props.label}</label>
      <div className="mt-2">{props.children}</div>
    </div>
  );
}
