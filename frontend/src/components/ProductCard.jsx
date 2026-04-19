import { motion } from 'framer-motion';
import { ShieldCheck, ShieldX, User, Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { shortenAddress } from '../utils/blockchain';

const ProductCard = ({ product }) => {
    const now = Math.floor(Date.now() / 1000);
    const isExpired = now >= product.warrantyEnd;
    const daysRemaining = Math.max(0, Math.ceil((product.warrantyEnd - now) / 86400));
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="group w-full max-w-sm bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl hover:bg-slate-800/60 hover:border-white/10 transition-all duration-300 relative overflow-hidden flex flex-col h-full shadow-2xl"
        >
            {/* Background Accent */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-500 ${isExpired ? 'bg-red-500' : 'bg-emerald-500'}`} />

            {/* Top Section: Name & ID */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-white tracking-tight leading-none mb-2 truncate group-hover:text-cyan-400 transition-colors">
                        {product.name}
                    </h3>
                    <div className="flex items-center gap-1.5 opacity-50">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ID:</span>
                        <span className="text-xs font-mono text-slate-300">{product.id}</span>
                    </div>
                </div>
                <div className={`p-2.5 rounded-2xl border ${isExpired ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                    {isExpired ? <ShieldX size={20} /> : <ShieldCheck size={20} />}
                </div>
            </div>

            {/* Middle Section: Highlight Block (Days Left) */}
            <div className={`rounded-2xl border p-5 mb-6 text-center ${isExpired ? 'bg-red-500/5 border-red-500/10' : 'bg-emerald-500/5 border-emerald-500/10'}`}>
                {isExpired ? (
                    <div className="space-y-1">
                        <p className="text-red-400 font-black text-2xl tracking-tight leading-none">Expired</p>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Warranty Period Over</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-emerald-400 font-black text-4xl tracking-tighter leading-none">{daysRemaining}</span>
                            <span className="text-emerald-400/60 font-bold text-sm uppercase tracking-tight">Days Left</span>
                        </div>
                        <p className="text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5">
                            <Clock size={12} className="text-emerald-500" />
                            Valid till {new Date(product.warrantyEnd * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                )}
            </div>

            {/* Status Indicator Badge */}
            <div className="flex justify-center mb-6">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border flex items-center gap-2 shadow-sm
                    ${isExpired 
                        ? 'bg-red-950/30 border-red-900/50 text-red-400' 
                        : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-red-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse'}`} />
                    {isExpired ? 'Warranty Expired ❌' : 'Warranty Active ✅'}
                </div>
            </div>

            {/* Bottom Section: Owner Info */}
            <div className="mt-auto pt-5 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between group/line">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-slate-400 group-hover/line:border-cyan-500/50 transition-colors">
                            <User size={14} />
                        </div>
                        <div>
                            <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest leading-none mb-1">Owner Name</p>
                            <p className="text-sm font-bold text-slate-200 group-hover/line:text-white transition-colors capitalize">{product.ownerName}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center justify-between group/line">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-slate-400 group-hover/line:border-cyan-500/50 transition-colors">
                            <ArrowUpRight size={14} />
                        </div>
                        <div>
                            <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest leading-none mb-1">Wallet Address</p>
                            <p className="text-xs font-mono text-cyan-400/80 group-hover/line:text-cyan-400 transition-colors">{shortenAddress(product.ownerAddress)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
