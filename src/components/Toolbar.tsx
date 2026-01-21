import { useReactFlow } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { Camera, Sun, Moon, Monitor } from 'lucide-react';
import useFlowStore from '@/store/flowStore';
import { translations } from '@/i18n/translations';

function downloadImage(dataUrl: string) {
    const a = document.createElement('a');
    a.setAttribute('download', 'lumina-flow-snapshot.png');
    a.setAttribute('href', dataUrl);
    a.click();
}

export default function Toolbar() {
    const { getViewport } = useReactFlow();
    const { language, theme, setTheme } = useFlowStore();
    const t = translations[language];

    const handleSnapshot = () => {
        // We target the viewport class from React Flow
        const flowElement = document.querySelector('.react-flow__viewport') as HTMLElement;

        if (flowElement) {
            toPng(flowElement, {
                backgroundColor: '#050508',
                width: flowElement.offsetWidth,
                height: flowElement.offsetHeight,
                style: {
                    width: '100%',
                    height: '100%',
                    transform: `translate(${getViewport().x}px, ${getViewport().y}px) scale(${getViewport().zoom})`
                }
            }).then(downloadImage);
        }
    };

    return (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex gap-2">
            <div className="flex bg-space-800/90 backdrop-blur-xl border border-space-600 rounded-full p-1.5 shadow-2xl ring-1 ring-white/10">
                <button
                    onClick={() => {
                        const next = theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system';
                        setTheme(next);
                    }}
                    className="p-3 rounded-full text-space-600 hover:text-nebula-400 hover:bg-space-700 transition-all group relative"
                    title={`${t.theme}: ${t[theme]}`}
                >
                    <div className="relative">
                        {theme === 'light' ? (
                            <Sun size={20} />
                        ) : theme === 'dark' ? (
                            <Moon size={20} />
                        ) : (
                            <Monitor size={20} />
                        )}
                    </div>
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-space-900 border border-space-700 text-starlight-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {t[theme]}
                    </span>
                </button>

                <div className="w-px bg-space-700 my-2" />

                <button
                    onClick={handleSnapshot}
                    className="p-3 rounded-full text-space-600 hover:text-nebula-400 hover:bg-space-700 transition-all group relative"
                    title={t.snapshot}
                >
                    <Camera size={20} />
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-space-900 border border-space-700 text-starlight-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {t.snapshot}
                    </span>
                </button>
            </div>
        </div>
    );
}
