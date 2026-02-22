import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const DashboardCard = ({ title, icon: Icon, to, color = "blue" }) => {
    const gradients = {
        blue: "from-blue-500 to-cyan-400",
        purple: "from-purple-500 to-pink-500",
        green: "from-emerald-500 to-green-400",
        orange: "from-orange-500 to-yellow-400",
    };

    return (
        <Link to={to} className="w-full">
            <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative group h-64 w-full"
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradients[color]} opacity-20 group-hover:opacity-30 rounded-3xl blur-xl transition-all duration-500`} />

                <div className="relative h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between overflow-hidden group-hover:border-white/20 transition-all duration-300">
                    <div className={`text-${color}-400 mb-4`}>
                        <Icon size={48} />
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                        <p className="text-slate-400 text-sm">Click to access &gt; </p>
                    </div>

                    <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradients[color]} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-all duration-500`} />
                </div>
            </motion.div>
        </Link>
    );
};

export default DashboardCard;
