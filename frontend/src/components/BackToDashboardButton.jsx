import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const BackToDashboardButton = () => {
    const navigate = useNavigate();

    return (
        <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/dashboard')}
            className="absolute top-24 left-6 z-10 p-3 rounded-full bg-white/5 border border-white/10 text-white backdrop-blur-md hover:bg-white/10 hover:border-blue-500/50 transition-colors shadow-lg shadow-blue-500/10 group"
            title="Back to Dashboard"
        >
            <ArrowLeft size={24} className="group-hover:text-blue-400 transition-colors" />
        </motion.button>
    );
};

export default BackToDashboardButton;
