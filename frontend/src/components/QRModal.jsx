import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, ShieldCheck } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const QRModal = ({ isOpen, onClose, value, title, metadata }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/60"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl shadow-cyan-500/10 overflow-hidden"
                >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all z-20"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8 flex flex-col items-center">
                        <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30 mb-6">
                            <QrCode className="w-6 h-6 text-cyan-400" />
                        </div>
                        
                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                            Verification QR
                        </h3>
                        <p className="text-slate-500 text-xs uppercase font-bold tracking-[0.2em] mb-8">
                            Global Registry Access
                        </p>

                        <div className="relative p-6 bg-white rounded-3xl border-4 border-slate-800 shadow-2xl transition-transform hover:scale-[1.02] duration-500">
                            <div className="absolute inset-0 bg-cyan-400 blur-2xl opacity-20 -z-10" />
                            <QRCodeCanvas
                                value={value}
                                size={220}
                                level={"H"}
                                includeMargin={true}
                            />
                        </div>

                        {metadata && (
                            <div className="mt-8 w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Asset Name</span>
                                    <span className="text-xs font-bold text-white">{metadata.productName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Product ID</span>
                                    <span className="text-xs font-mono text-cyan-400">{metadata.productId?.slice(0, 15)}...</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase">
                                        <ShieldCheck size={10} />
                                        Blockchain Verified
                                    </div>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={onClose}
                            className="mt-8 w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all active:scale-[0.98] border border-white/5"
                        >
                            Close Portal
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default QRModal;
