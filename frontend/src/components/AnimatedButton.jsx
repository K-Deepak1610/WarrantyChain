import { motion } from 'framer-motion';

const AnimatedButton = ({ text, onClick, className = "", disabled = false, icon: Icon }) => {
    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.05, boxShadow: "0px 0px 8px rgb(59, 130, 246)" } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            onClick={onClick}
            disabled={disabled}
            className={`relative px-6 py-3 font-semibold text-white rounded-xl transition-all duration-300
        bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}`}
        >
            {Icon && <Icon size={20} />}
            {text}
        </motion.button>
    );
};

export default AnimatedButton;
