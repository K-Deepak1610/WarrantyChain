import { motion } from 'framer-motion';

const GlassCard = ({ children, className = "" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
