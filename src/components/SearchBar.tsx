import { useState, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Search } from 'lucide-react';
import useFlowStore from '@/store/flowStore';
import { translations } from '@/i18n/translations';
import { clsx } from 'clsx';

export default function SearchBar() {
    const { nodes, language, toggleLanguage } = useFlowStore();
    const { fitView } = useReactFlow();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<typeof nodes>([]);
    const t = translations[language];

    useEffect(() => {
        if (query.trim() === '') {
            setResults([]);
            return;
        }
        const filtered = nodes.filter(node =>
            (node.data.label as string).toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
    }, [query, nodes]);

    const handleSelect = (nodeId: string) => {
        fitView({ nodes: [{ id: nodeId }], duration: 800, padding: 0.5 });
        setQuery('');
        setResults([]);
    };

    return (
        <div className="absolute top-6 right-6 z-50 flex gap-3">
            {/* Search Input */}
            <div className="relative group">
                <div className={clsx(
                    "flex items-center bg-space-800/80 backdrop-blur border border-space-700 rounded-full px-4 py-2 w-64 transition-all focus-within:w-80 focus-within:border-nebula-500 focus-within:ring-1 focus-within:ring-nebula-500/50",
                    results.length > 0 ? "rounded-b-none border-b-0" : ""
                )}>
                    <Search size={16} className="text-space-600 mr-2 group-focus-within:text-nebula-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="bg-transparent border-none outline-none text-sm text-starlight-100 w-full placeholder:text-space-600"
                    />
                </div>

                {/* Results Dropdown */}
                {results.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-space-800/90 backdrop-blur border border-t-0 border-space-700 rounded-b-2xl max-h-60 overflow-y-auto overflow-x-hidden shadow-xl">
                        {results.map(node => (
                            <button
                                key={node.id}
                                onClick={() => handleSelect(node.id)}
                                className="w-full text-left px-4 py-3 text-sm text-starlight-200 hover:bg-space-700 hover:text-nebula-400 transition-colors border-b border-space-700/50 last:border-0 truncate"
                            >
                                {node.data.label as string}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Language Toggle */}
            <button
                onClick={toggleLanguage}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-space-800/80 backdrop-blur border border-space-700 text-space-600 hover:text-nebula-400 hover:border-nebula-500 hover:bg-space-700 transition-all font-bold text-xs"
                title={t.switchLang}
            >
                {language === 'en' ? '中' : 'EN'}
            </button>
        </div>
    );
}
