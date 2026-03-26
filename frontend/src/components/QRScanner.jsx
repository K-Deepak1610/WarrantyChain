import { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, ShieldCheck } from 'lucide-react';

const QRScanner = ({ onScan, onClose }) => {
    const handleResult = (result, error) => {
        if (!!result) {
            try {
                const text = result?.text;
                if (text) {
                    let parsed = text;
                    try {
                        const json = JSON.parse(text);
                        // Extract productId from various possible JSON structures
                        parsed = json.productId || json.id || json.productID || text;
                    } catch (e) {
                        // Not JSON, use raw text
                    }
                    onScan(parsed);
                }
            } catch (err) {
                console.error("Scan error:", err);
            }
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/80 backdrop-blur-sm sm:items-center sm:p-4"
            >
                {/* Click outside to close (desktop) */}
                <div className="absolute inset-0" onClick={onClose} />

                <motion.div
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, info) => {
                        if (info.offset.y > 100) onClose();
                    }}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-2xl rounded-t-[2.5rem] sm:rounded-3xl overflow-hidden border border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]"
                >
                    {/* Drag Handle */}
                    <div className="w-full flex justify-center pt-4 pb-2 shrink-0 cursor-grab active:cursor-grabbing sm:hidden">
                        <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                    </div>

                    {/* Header Area */}
                    <div className="px-6 py-4 text-center shrink-0">
                        <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-4 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                            <Camera size={24} />
                        </div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent mb-1 tracking-tight">AI QR Scanner</h3>
                        <p className="text-sm text-slate-400">Scan product QR for instant verification</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all border border-white/10 hidden sm:block"
                    >
                        <X size={20} />
                    </button>

                    <div className="relative aspect-square bg-black overflow-hidden mx-6 mb-4 rounded-2xl border border-white/10 shrink-0">
                        <QrReader
                            onResult={handleResult}
                            constraints={{ facingMode: 'environment' }}
                            className="w-full h-full"
                            videoStyle={{ objectFit: 'cover' }}
                        />

                        {/* Scanning Animation Overlays */}
                        <div className="absolute inset-0 pointer-events-none">
                            {/* Corner Brackets */}
                            <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                            <div className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                            <div className="absolute bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                            <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-cyan-400 rounded-br-lg shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>

                            {/* Scanner Line */}
                            <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent top-1/2 -translate-y-1/2 -translate-x-[100%] animate-[scan-animation_3s_ease-in-out_infinite] shadow-[0_0_20px_rgba(34,211,238,1)]"></div>
                        </div>
                    </div>

                    <div className="mt-auto px-6 py-4 bg-slate-800/30 flex items-center justify-center gap-2 text-cyan-400/80 text-xs uppercase tracking-widest shrink-0 border-t border-white/5">
                        <ShieldCheck size={14} className="text-cyan-500" />
                        Encrypted Connection
                    </div>
                </motion.div>
                
                <style>{`
                    @keyframes scan-animation {
                        0% { top: 10%; opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { top: 90%; opacity: 0; }
                    }
                `}</style>
            </motion.div>
        </AnimatePresence>
    );
};

export default QRScanner;
