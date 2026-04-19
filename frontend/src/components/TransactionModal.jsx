import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink, Copy, Check, X, ShieldCheck, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const TransactionModal = ({ stage, status, error, txHash, metadata, onClose }) => {
    const [copied, setCopied] = useState(false);

    if (stage === 'idle') return null;

    const copyHash = () => {
        navigator.clipboard.writeText(txHash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const StatusIcon = () => {
        switch (stage) {
            case 'waiting': return <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />;
            case 'processing': return (
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
                    <Loader2 className="w-12 h-12 text-indigo-400 animate-spin relative z-10" />
                </div>
            );
            case 'success': return (
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
            );
            case 'error': return (
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
            );
            default: return null;
        }
    };

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
                    className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 overflow-hidden"
                >
                    {/* Header Decoration */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                    
                    <div className="p-8">
                        {/* Close button for success or error */}
                        {(stage === 'success' || stage === 'error') && (
                            <button 
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all"
                            >
                                <X size={20} />
                            </button>
                        )}

                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6">
                                <StatusIcon />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">
                                {stage === 'waiting' && 'Signature Required'}
                                {stage === 'processing' && 'Broadcasting Transaction'}
                                {stage === 'success' && 'Transaction Confirmed'}
                                {stage === 'error' && 'Transaction Failed'}
                            </h3>

                            <p className="text-slate-400 text-sm mb-8">
                                {status}
                            </p>

                            {/* Detailed Success Card */}
                            {stage === 'success' && metadata && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full space-y-4 mb-8"
                                >
                                    <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-5 text-left space-y-4">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Receipt Detail</span>
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                                <ShieldCheck size={10} />
                                                SECURED
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Action</p>
                                                <p className="text-sm font-bold text-indigo-400">{metadata.action}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Product</p>
                                                <p className="text-sm font-bold text-white truncate">{metadata.productName || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Product ID</p>
                                                <p className="text-sm font-mono text-white truncate">{metadata.productId}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Owner</p>
                                                <p className="text-sm font-bold text-white truncate">{metadata.ownerName}</p>
                                            </div>
                                            <div className="col-span-2 space-y-1 pt-2">
                                                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Wallet Address</p>
                                                <p className="text-[11px] font-mono text-slate-400 break-all bg-white/5 p-2 rounded-lg">{metadata.walletAddress}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hash Area */}
                                    <div className="w-full">
                                        <div className="flex items-center justify-between mb-2 px-1">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Transaction Hash</span>
                                            <button 
                                                onClick={copyHash}
                                                className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors font-bold"
                                            >
                                                {copied ? <Check size={10} /> : <Copy size={10} />}
                                                {copied ? 'COPIED' : 'COPY'}
                                            </button>
                                        </div>
                                        <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex items-center justify-between group">
                                            <span className="font-mono text-[10px] text-slate-500 truncate mr-4">
                                                {txHash}
                                            </span>
                                            <a 
                                                href={`https://amoy.polygonscan.com/tx/${txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all opacity-40 group-hover:opacity-100"
                                            >
                                                <ExternalLink size={12} />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Error Message */}
                            {stage === 'error' && (
                                <div className="w-full p-4 bg-red-900/10 border border-red-500/20 rounded-2xl mb-8">
                                    <p className="text-sm text-red-400 break-words">{error}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="w-full grid grid-cols-2 gap-4">
                                {stage === 'success' && (
                                    <>
                                        <button 
                                            onClick={onClose}
                                            className="col-span-2 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20"
                                        >
                                            Done
                                        </button>
                                    </>
                                )}
                                {stage === 'error' && (
                                    <button 
                                        onClick={onClose}
                                        className="col-span-2 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
                                    >
                                        Dismiss
                                    </button>
                                )}
                                {(stage === 'waiting' || stage === 'processing') && (
                                    <div className="col-span-2 py-3 px-4 bg-white/5 rounded-2xl flex items-center justify-center gap-3">
                                        <Loader2 size={16} className="text-slate-500 animate-spin" />
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Awaiting Network...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TransactionModal;
