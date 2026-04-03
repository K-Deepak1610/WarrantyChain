import { motion } from 'framer-motion';
import AnimatedButton from '../components/AnimatedButton';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Hexagon, ShieldCheck, Zap, Lock, QrCode } from 'lucide-react';
import Logo from '../components/Logo';
import { usePageTitle } from '../hooks/usePageTitle';

const Home = () => {
    usePageTitle('Trustless Warranties');
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
        <div className="min-h-screen flex flex-col justify-start items-center relative overflow-hidden bg-transparent pt-20">

            {/* 1. Background Layer - Add subtle local glow without blocking global grid */}
            <div className="absolute top-0 left-0 w-full flex justify-center pointer-events-none z-0">
                <div className="w-[800px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full mix-blend-screen" />

                {/* Side glows */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl mix-blend-screen" />
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
                    <div className="mb-12">
                        <Logo size="lg" />
                    </div>

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
                            className="group flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-slate-900 border border-cyan-500/50 hover:border-cyan-400 transition-all duration-300 text-white font-bold text-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 group-hover:from-cyan-400/40 group-hover:to-indigo-400/40 transition-colors" />
                            <span className="relative z-10 uppercase tracking-widest text-cyan-50">Get Started</span>
                            <ArrowRight className="relative z-10 group-hover:translate-x-2 transition-transform text-cyan-400" />
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
