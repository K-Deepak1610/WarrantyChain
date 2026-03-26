import { useState } from 'react';
import { Copy, Check, AlertTriangle } from 'lucide-react';

const HashDisplay = ({ label, value, isBackup }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!value || value === "—") return;
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</span>
                {isBackup && (
                    <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border border-amber-500/30">
                        <AlertTriangle size={10} />
                        Cached
                    </span>
                )}
            </div>
            
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:border-cyan-400/30 transition-all group">
                <span className={`font-mono text-sm truncate pr-4 ${!value || value === "—" ? 'text-slate-500' : 'text-cyan-300'}`}>
                    {value || "—"}
                </span>
                
                {value && value !== "—" && (
                    <button 
                        onClick={handleCopy}
                        className="text-slate-500 hover:text-cyan-400 focus:outline-none transition-colors shrink-0"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default HashDisplay;
