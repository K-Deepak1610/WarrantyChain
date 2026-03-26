import React from 'react';

const events = [
    "WARRANTY MINTED · 0x3f…a9",
    "TRANSFER CONFIRMED · 0xAb…1c",
    "VERIFIED · 0x99…ff",
    "NEW REGISTRATION · 0x2e…4d",
    "OWNERSHIP CLAIMED · 0x1f…8b",
    "WARRANTY CHECKED · 0x7c…9a"
];

const LiveTicker = () => {
    return (
        <div className="fixed bottom-0 left-0 w-full h-8 bg-slate-950/80 backdrop-blur-md border-t border-cyan-500/20 z-50 flex items-center overflow-hidden">
            <div className="whitespace-nowrap animate-scroll-x flex gap-12 text-[10px] font-mono font-bold tracking-widest text-cyan-400/80">
                {/* Repeat list twice for seamless loop */}
                {[...events, ...events].map((evt, idx) => (
                    <span key={idx} className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse-slow"></span>
                        {evt}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default LiveTicker;
