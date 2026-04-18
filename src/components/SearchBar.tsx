import { Search } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { clsx } from 'clsx';
import useFlowStore, { selectActiveBoard } from '@/store/flowStore';
import { useFlowUiStore } from '@/store/uiStore';
import { translations } from '@/i18n/translations';
import type { FlowNode } from '@/types/flow';

const MAX_VISIBLE_RESULTS = 8;

export default function SearchBar() {
  const language = useFlowStore((state) => state.language);
  const toggleLanguage = useFlowStore((state) => state.toggleLanguage);
  const nodes = useFlowStore((state) => selectActiveBoard(state).nodes);
  const setHighlightedNodeIds = useFlowUiStore((state) => state.setHighlightedNodeIds);
  const searchFocusNonce = useFlowUiStore((state) => state.searchFocusNonce);
  const { fitView } = useReactFlow();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const allMatches = useMemo(
    () => (deferredQuery ? nodes.filter((node) => matchesQuery(node, deferredQuery)) : []),
    [deferredQuery, nodes],
  );
  const results = allMatches.slice(0, MAX_VISIBLE_RESULTS);
  const overflowCount = allMatches.length - results.length;
  const activeResultIndex = results.length === 0 ? -1 : Math.min(activeIndex, results.length - 1);
  const t = translations[language];

  useEffect(() => {
    if (searchFocusNonce > 0) {
      inputRef.current?.focus();
    }
  }, [searchFocusNonce]);

  useEffect(() => {
    if (activeResultIndex < 0) {
      setHighlightedNodeIds([]);
      return;
    }

    setHighlightedNodeIds([results[activeResultIndex].id]);

    return () => {
      setHighlightedNodeIds([]);
    };
  }, [activeResultIndex, results, setHighlightedNodeIds]);

  const handleSelect = (nodeId: string): void => {
    fitView({ nodes: [{ id: nodeId }], duration: 600, padding: 0.45 });
    setHighlightedNodeIds([nodeId]);
    setQuery('');
    setActiveIndex(0);
  };

  const showDropdown = deferredQuery.length > 0;

  return (
    <div className="absolute top-6 right-4 z-50 flex max-w-[calc(100vw-2rem)] gap-2 sm:right-6 sm:max-w-none sm:gap-3">
      <div className="relative group" role="search" aria-label={t.searchPlaceholder}>
        <div
          className={clsx(
            'flex items-center bg-space-800/85 backdrop-blur-xl border border-space-700 rounded-full px-4 py-2.5 w-[min(18rem,calc(100vw-6.5rem))] sm:w-72 transition-all sm:focus-within:w-96 focus-within:border-nebula-500 focus-within:ring-1 focus-within:ring-nebula-500/50 shadow-xl',
            showDropdown ? 'rounded-b-none border-b-0' : '',
          )}
        >
          <Search size={16} className="text-space-600 mr-2 group-focus-within:text-nebula-400" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={(event) => {
              if (!showDropdown || results.length === 0) {
                return;
              }

              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActiveIndex((current) => (current + 1) % results.length);
                return;
              }

              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActiveIndex((current) => (current - 1 + results.length) % results.length);
                return;
              }

              if (event.key === 'Enter' && activeResultIndex >= 0) {
                event.preventDefault();
                handleSelect(results[activeResultIndex].id);
                return;
              }

              if (event.key === 'Escape') {
                event.preventDefault();
                setQuery('');
                setActiveIndex(0);
              }
            }}
            placeholder={t.searchPlaceholder}
            className="bg-transparent border-none outline-none text-sm text-starlight-100 w-full placeholder:text-space-600"
            aria-label={t.searchPlaceholder}
            aria-expanded={showDropdown}
            aria-activedescendant={showDropdown && activeResultIndex >= 0 ? `search-result-${results[activeResultIndex].id}` : undefined}
          />
        </div>

        {showDropdown ? (
          <div className="absolute top-full left-0 w-full bg-space-800/95 backdrop-blur-xl border border-t-0 border-space-700 rounded-b-3xl shadow-2xl overflow-hidden">
            {results.length > 0 ? (
              <div className="max-h-72 overflow-y-auto">
                {results.map((node, index) => (
                  <button
                    key={node.id}
                    id={`search-result-${node.id}`}
                    onClick={() => handleSelect(node.id)}
                    className={clsx(
                      'w-full text-left px-4 py-3 transition-colors border-b border-space-700/60 last:border-b-0 focus-visible:outline-none',
                      index === activeResultIndex ? 'bg-space-700/80' : 'hover:bg-space-700/80',
                    )}
                  >
                    <p className="text-sm text-starlight-100 font-medium truncate">{node.data.label}</p>
                    <p className="mt-1 text-xs text-space-600 truncate">
                      {[node.data.note, node.data.tags.join(' · ')].filter(Boolean).join(' · ')}
                    </p>
                  </button>
                ))}
                {overflowCount > 0 ? (
                  <p className="px-4 py-2.5 text-xs text-starlight-400 border-t border-space-700/60">
                    {t.searchOverflow.replace('{count}', String(overflowCount))}
                  </p>
                ) : null}
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
        className="flex items-center justify-center w-11 h-11 rounded-full bg-space-800/85 backdrop-blur-xl border border-space-700 text-space-600 hover:text-nebula-400 hover:border-nebula-500 hover:bg-space-700 transition-all font-bold text-xs shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-500 focus-visible:ring-offset-2 focus-visible:ring-offset-space-800"
        title={t.switchLang}
        aria-label={t.switchLang}
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
