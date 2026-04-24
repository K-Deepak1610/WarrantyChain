import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const cardMeta = {
    blue:   { border: 'border-blue-500/30',   glow: 'shadow-blue-500/20',   badge: 'from-blue-500 to-cyan-400',   dot: 'bg-blue-400', desc: 'Register a new product on the blockchain' },
    green:  { border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20', badge: 'from-emerald-500 to-green-400', dot: 'bg-emerald-400', desc: 'Check if a product warranty is still active' },
    purple: { border: 'border-purple-500/30', glow: 'shadow-purple-500/20', badge: 'from-purple-500 to-pink-500',  dot: 'bg-purple-400', desc: 'View the full ownership transfer history' },
    orange: { border: 'border-orange-500/30', glow: 'shadow-orange-500/20', badge: 'from-orange-500 to-yellow-400', dot: 'bg-orange-400', desc: 'Transfer ownership to a new wallet address' },
    cyan:   { border: 'border-cyan-500/30',   glow: 'shadow-cyan-500/20',   badge: 'from-cyan-500 to-blue-400',   dot: 'bg-cyan-400',   desc: 'Update service records and extend product warranty' },
};

const DashboardCard = ({ title, icon: Icon, to, color = 'blue' }) => {
    const meta = cardMeta[color];

    return (
        <Link to={to} className="w-full">
            <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative group h-64 w-full rounded-3xl border ${meta.border} overflow-hidden
                    bg-slate-900/60 backdrop-blur-xl transition-all duration-300
                    hover:shadow-2xl hover:${meta.glow}`}
            >
                {/* Gradient background glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${meta.badge} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />

                {/* Corner blob */}
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${meta.badge} rounded-full blur-3xl opacity-15 group-hover:opacity-30 transition-all duration-500`} />

                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${meta.badge} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative h-full p-7 flex flex-col justify-between">
                    {/* Icon + Status dot */}
                    <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${meta.badge} bg-opacity-10 border ${meta.border}`}>
                            <Icon size={28} className="text-white" />
                        </div>
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-400`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${meta.dot} animate-pulse`} />
                            Active
                        </div>
                    </div>

                    {/* Title + Description */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1.5">{title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{meta.desc}</p>
                        <div className={`mt-4 flex items-center gap-1 text-xs font-semibold bg-gradient-to-r ${meta.badge} bg-clip-text text-transparent`}>
                            Access feature →
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

export default DashboardCard;
