import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const BackToHomeButton = () => {
    const navigate = useNavigate();

    return (
        <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05, x: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-slate-900/40 border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all backdrop-blur-md group shadow-xl"
        >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Return Home</span>
        </motion.button>
    );
};

export default BackToHomeButton;
