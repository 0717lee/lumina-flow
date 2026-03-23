import { Search } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { clsx } from 'clsx';
import useFlowStore, { selectActiveBoard } from '@/store/flowStore';
import { useFlowUiStore } from '@/store/uiStore';
import { translations } from '@/i18n/translations';
import type { FlowNode } from '@/types/flow';

export default function SearchBar() {
  const language = useFlowStore((state) => state.language);
  const toggleLanguage = useFlowStore((state) => state.toggleLanguage);
  const nodes = useFlowStore((state) => selectActiveBoard(state).nodes);
  const setHighlightedNodeIds = useFlowUiStore((state) => state.setHighlightedNodeIds);
  const { fitView } = useReactFlow();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const results = useMemo(
    () => (deferredQuery ? nodes.filter((node) => matchesQuery(node, deferredQuery)).slice(0, 8) : []),
    [deferredQuery, nodes],
  );
  const t = translations[language];

  useEffect(() => {
    setHighlightedNodeIds(results.map((node) => node.id));

    return () => {
      setHighlightedNodeIds([]);
    };
  }, [results, setHighlightedNodeIds]);

  const handleSelect = (nodeId: string): void => {
    fitView({ nodes: [{ id: nodeId }], duration: 600, padding: 0.45 });
    setHighlightedNodeIds([nodeId]);
    setQuery('');
  };

  const showDropdown = deferredQuery.length > 0;

  return (
    <div className="absolute top-6 right-6 z-50 flex gap-3">
      <div className="relative group">
        <div
          className={clsx(
            'flex items-center bg-space-800/85 backdrop-blur-xl border border-space-700 rounded-full px-4 py-2.5 w-72 transition-all focus-within:w-96 focus-within:border-nebula-500 focus-within:ring-1 focus-within:ring-nebula-500/50 shadow-xl',
            showDropdown ? 'rounded-b-none border-b-0' : '',
          )}
        >
          <Search size={16} className="text-space-600 mr-2 group-focus-within:text-nebula-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.searchPlaceholder}
            className="bg-transparent border-none outline-none text-sm text-starlight-100 w-full placeholder:text-space-600"
          />
        </div>

        {showDropdown ? (
          <div className="absolute top-full left-0 w-full bg-space-800/95 backdrop-blur-xl border border-t-0 border-space-700 rounded-b-3xl shadow-2xl overflow-hidden">
            {results.length > 0 ? (
              <div className="max-h-72 overflow-y-auto">
                {results.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => handleSelect(node.id)}
                    className="w-full text-left px-4 py-3 hover:bg-space-700/80 transition-colors border-b border-space-700/60 last:border-b-0"
                  >
                    <p className="text-sm text-starlight-100 font-medium truncate">{node.data.label}</p>
                    <p className="mt-1 text-xs text-space-600 truncate">
                      {[node.data.note, node.data.tags.join(' · ')].filter(Boolean).join(' · ')}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-4 text-sm text-space-600">
                <p>{t.noResults}</p>
                <p className="mt-1 text-xs">{t.searchHint}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <button
        onClick={toggleLanguage}
        className="flex items-center justify-center w-11 h-11 rounded-full bg-space-800/85 backdrop-blur-xl border border-space-700 text-space-600 hover:text-nebula-400 hover:border-nebula-500 hover:bg-space-700 transition-all font-bold text-xs shadow-xl"
        title={t.switchLang}
      >
        {language === 'en' ? '中' : 'EN'}
      </button>
    </div>
  );
}

function matchesQuery(node: FlowNode, query: string): boolean {
  const haystacks = [node.data.label, node.data.note, node.data.tags.join(' ')];
  return haystacks.some((value) => value.toLowerCase().includes(query));
}
