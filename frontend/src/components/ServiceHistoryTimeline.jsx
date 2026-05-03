import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Calendar, MapPin, User, CheckCircle2, Clock } from 'lucide-react';

const ServiceHistoryTimeline = ({ history }) => {
    if (!history || history.length === 0) {
        return (
            <div className="py-12 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
                <p className="text-slate-500 text-xs italic">No maintenance records found for this product.</p>
            </div>
        );
    }

    return (
        <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:left-[15px] before:w-px before:bg-gradient-to-b before:from-cyan-500/50 before:via-indigo-500/50 before:to-transparent">
            {history.map((record, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                >
                    {/* Timeline Node */}
                    <div className="absolute -left-[25px] mt-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center z-10 shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-cyan-500/30 transition-all group backdrop-blur-sm shadow-lg">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                                    <Wrench size={18} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm tracking-wide">{record.description}</h4>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                                        <Calendar size={10} />
                                        {new Date(record.serviceDate * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 self-start md:self-center">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${record.isPaid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                                    {record.isPaid ? 'Paid & Verified' : 'Pending Payment'}
                                </span>
                                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                                    <CheckCircle2 size={12} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                <div className="p-1.5 rounded-lg bg-slate-900/50">
                                    <User size={14} className="text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Technician</p>
                                    <p className="text-slate-300">{record.technicianName || "Unknown"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                <div className="p-1.5 rounded-lg bg-slate-900/50">
                                    <MapPin size={14} className="text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Location</p>
                                    <p className="text-slate-300">{record.location || "Authorized Center"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default ServiceHistoryTimeline;
