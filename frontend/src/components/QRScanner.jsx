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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4"
        >
            <div className="relative w-full max-w-md bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                {/* Header Area */}
                <div className="p-6 text-center border-b border-white/5 bg-slate-800/50">
                    <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 text-blue-400 mb-4 border border-blue-500/20">
                        <Camera size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">AI QR Scanner</h3>
                    <p className="text-sm text-slate-400">Scan product QR for instant blockchain verification</p>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all border border-white/10"
                >
                    <X size={20} />
                </button>

                <div className="relative aspect-square bg-black overflow-hidden m-4 rounded-2xl border border-white/5">
                    <QrReader
                        onResult={handleResult}
                        constraints={{ facingMode: 'environment' }}
                        className="w-full h-full"
                        videoStyle={{ objectFit: 'cover' }}
                    />

                    {/* Scanning Animation Overlays */}
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Corner Brackets */}
                        <div className="absolute top-10 left-10 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                        <div className="absolute top-10 right-10 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                        <div className="absolute bottom-10 left-10 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                        <div className="absolute bottom-10 right-10 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>

                        {/* Scanner Line */}
                        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent top-1/2 -translate-y-1/2 animate-scan shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>

                        {/* Pulse effect */}
                        <div className="absolute inset-0 m-12 border-2 border-blue-400/20 rounded-xl animate-pulse"></div>
                    </div>
                </div>

                <div className="p-6 bg-slate-800/30 flex items-center justify-center gap-2 text-slate-400 text-sm italic">
                    <ShieldCheck size={16} className="text-blue-500" />
                    Secure end-to-end encrypted scanning
                </div>
            </div>

            <style>{`
                @keyframes scan-animation {
                    0% { top: 10%; }
                    50% { top: 90%; }
                    100% { top: 10%; }
                }
                .animate-scan {
                    position: absolute;
                    animation: scan-animation 3s ease-in-out infinite;
                }
            `}</style>
        </motion.div>
    );
};

export default QRScanner;
