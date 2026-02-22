import { motion } from 'framer-motion';
import AnimatedButton from '../components/AnimatedButton';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Hexagon, ShieldCheck, Zap, Lock, QrCode } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    const FeatureItem = ({ icon: Icon, text }) => (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all cursor-default"
        >
            <Icon size={20} className="text-blue-400" />
            <span className="text-slate-300 text-sm font-medium">{text}</span>
        </motion.div>
    );

    return (
        <div className="min-h-screen flex flex-col justify-start items-center relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950">

            {/* 1. Background Layer - STRICTLY Z-0 and POINTER-EVENTS-NONE, Top Aligned */}
            <div className="absolute top-0 left-0 w-full flex justify-center pointer-events-none z-0">
                <div className="w-[600px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full" />

                {/* Side glows */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
            </div>

            {/* 2. Content Layer - Z-10, Top Padding for Offset */}
            <div className="relative z-10 w-full max-w-4xl px-6 pt-32 md:pt-40 flex flex-col items-center text-center">

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center"
                >
                    {/* Logo */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="mb-8 text-blue-500 opacity-90 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                    >
                        <Hexagon size={80} strokeWidth={1.5} />
                    </motion.div>

                    {/* Headings */}
                    <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(139,92,246,0.5)]">
                        WarrantyChain
                    </h1>

                    <h2 className="text-xl md:text-2xl font-medium text-slate-300 tracking-wide mb-8 max-w-2xl">
                        Blockchain-Based Digital Warranty & Ownership Verification System
                    </h2>

                    {/* Description */}
                    <div className="max-w-2xl mx-auto mb-10">
                        <p className="text-lg text-slate-400 leading-relaxed">
                            WarrantyChain securely stores and verifies product warranty and ownership using blockchain technology.
                            It ensures transparency, prevents fraud, and enables secure ownership transfer.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="relative z-20 flex flex-wrap justify-center gap-4 mb-12">
                        <FeatureItem icon={Lock} text="Secure Blockchain Storage" />
                        <FeatureItem icon={Zap} text="Instant Verification" />
                        <FeatureItem icon={ShieldCheck} text="Fraud-Proof Tracking" />
                        <FeatureItem icon={QrCode} text="QR-Based Access" />
                    </div>

                    {/* BUTTON - CRITICAL Z-INDEX FIX */}
                    <div className="relative z-50 pb-20">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/dashboard')}
                            className="group flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:shadow-[0_0_35px_rgba(124,58,237,0.7)] cursor-pointer"
                        >
                            <span>Enter Dashboard</span>
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
