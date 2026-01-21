import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import { clsx } from 'clsx';
import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import useFlowStore from '@/store/flowStore';
import { translations } from '@/i18n/translations';

type GlassNodeData = Node<{
  label: string;
}>;

function GlassNode({ id, data, selected }: NodeProps<GlassNodeData>) {
  const { updateNodeLabel, deleteNode, language } = useFlowStore();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Get translations
  const t = translations[language];

  // Sync local state when external data changes
  useEffect(() => {
    setLabel(data.label);
  }, [data.label]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    updateNodeLabel(id, label);
  }, [id, label, updateNodeLabel]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection
    deleteNode(id);
  }, [id, deleteNode]);

  return (
    <div className={clsx(
      "group relative min-w-[200px] rounded-2xl border transition-all duration-500", // Increased duration for smooth spotlight
      "bg-space-800/60 backdrop-blur-xl",
      (data as any).dimmed ? "opacity-20 grayscale blur-[1px]" : "opacity-100", // Spotlight Effect
      selected
        ? "border-nebula-500 shadow-[0_0_30px_rgba(99,102,241,0.3)] ring-1 ring-nebula-500/50"
        : "border-space-700 hover:border-space-600 shadow-lg hover:shadow-xl",
    )}>
      {/* Delete Button (Visible on Hover/Selected) */}
      <button
        onClick={handleDelete}
        className={clsx(
          "absolute -top-3 -right-3 z-50 p-1.5 rounded-full bg-space-900 border border-space-700 text-starlight-400 hover:text-red-400 hover:border-red-900 transition-all opacity-0 scale-75",
          (selected || isEditing) ? "opacity-100 scale-100" : "group-hover:opacity-100 group-hover:scale-100"
        )}
      >
        <Trash2 size={14} />
      </button>

      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !-top-1.5 !bg-space-950 !border-2 !border-nebula-500 transition-all opacity-0 group-hover:opacity-100"
      />

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="w-2 h-2 rounded-full bg-nebula-500 animate-pulse" />
          <span className="text-[10px] text-space-600 uppercase tracking-widest font-mono">{t.nodeType}</span>
        </div>

        {isEditing ? (
          <textarea
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            onFocus={(e) => {
              const val = e.target.value;
              e.target.setSelectionRange(val.length, val.length);
            }}
            className="w-full bg-transparent text-starlight-100 font-medium text-lg leading-tight resize-none outline-none border-b border-nebula-500/50"
            rows={Math.max(1, Math.ceil(label.length / 20))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                inputRef.current?.blur();
              }
            }}
          />
        ) : (
          <div
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="text-starlight-100 font-medium text-lg leading-tight cursor-text min-h-[24px]"
          >
            {data.label}
          </div>
        )}
      </div>

      {/* Decorative Gradient Line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-nebula-500/30 to-transparent opacity-50" />

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !-bottom-1.5 !bg-space-950 !border-2 !border-nebula-500 transition-all opacity-0 group-hover:opacity-100"
      />
    </div>
  );
}

export default memo(GlassNode);
