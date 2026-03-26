import { QRCodeCanvas } from 'qrcode.react';
import GlassCard from './GlassCard';

const QRCodeDisplay = ({ value, title = "Product QR Code" }) => {
    if (!value) return null;

    return (
        <GlassCard className="flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.2)]">
            <h3 className="text-lg font-bold text-cyan-400 tracking-wider uppercase text-center">{title || "Verification QR"}</h3>
            <div className="p-4 bg-white/90 rounded-2xl border-4 border-slate-800 relative z-10 transition-transform hover:scale-105 duration-300">
                <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-20 -z-10" />
                <QRCodeCanvas
                    value={value}
                    size={200}
                    level={"H"}
                    includeMargin={true}
                />
            </div>
            <p className="text-[10px] text-center text-slate-500 font-mono tracking-widest break-all bg-black/30 w-full p-2 rounded-lg">
                {value}
            </p>
        </GlassCard>
    );
};

export default QRCodeDisplay;
