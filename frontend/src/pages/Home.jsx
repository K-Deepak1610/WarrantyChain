import { motion } from 'framer-motion';
import AnimatedButton from '../components/AnimatedButton';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Zap, ShieldCheck, QrCode, ChevronRight } from 'lucide-react';
import Logo from '../components/Logo';
import { usePageTitle } from '../hooks/usePageTitle';

const FeatureItem = ({ icon: Icon, text }) => (
    <motion.div
        whileHover={{ scale: 1.05, y: -2 }}
        className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/5 hover:bg-white/10 hover:border-cyan-500/30 transition-all cursor-default"
    >
        <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Icon size={16} className="text-cyan-400" />
        </div>
        <span className="text-slate-300 text-sm font-medium">{text}</span>
    </motion.div>
);

const Step = ({ number, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.6 }}
        className="flex flex-col items-center text-center"
    >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center font-black text-white text-lg mb-3 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            {number}
        </div>
        <h4 className="text-white font-bold mb-1">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed max-w-[180px]">{desc}</p>
    </motion.div>
);

const Home = () => {
    usePageTitle('Trustless Warranties');
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col justify-start items-center relative overflow-hidden bg-transparent pt-20">

            {/* Background glows */}
            <div className="absolute top-0 left-0 w-full flex justify-center pointer-events-none z-0">
                <div className="w-[800px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl mix-blend-screen" />
            </div>

            {/* ─── Hero Section ─────────────────────────── */}
            <div className="relative z-10 w-full max-w-4xl px-6 pt-32 md:pt-40 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="flex flex-col items-center"
                >
                    {/* Logo */}
                    <div className="mb-10 animate-float">
                        <Logo size="lg" />
                    </div>

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        Blockchain-Powered Warranty System
                    </motion.div>

                    {/* Description */}
                    <div className="max-w-2xl mx-auto mb-8">
                        <p className="text-lg text-slate-400 leading-relaxed">
                            WarrantyChain securely stores and verifies product warranty and ownership using blockchain technology.
                            It ensures transparency, prevents fraud, and enables secure ownership transfer.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="relative z-20 flex flex-wrap justify-center gap-3 mb-10">
                        <FeatureItem icon={Lock} text="Secure Blockchain Storage" />
                        <FeatureItem icon={Zap} text="Instant Verification" />
                        <FeatureItem icon={ShieldCheck} text="Fraud-Proof Tracking" />
                        <FeatureItem icon={QrCode} text="QR-Based Access" />
                    </div>

                    {/* CTA Button */}
                    <div className="relative z-50 pb-20">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/dashboard')}
                            className="group flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-slate-900 border border-cyan-500/50 hover:border-cyan-400 transition-all duration-300 text-white font-bold text-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 group-hover:from-cyan-400/40 group-hover:to-indigo-400/40 transition-colors" />
                            <span className="relative z-10 uppercase tracking-widest text-cyan-50">Launch App</span>
                            <ArrowRight className="relative z-10 group-hover:translate-x-2 transition-transform text-cyan-400" />
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* ─── How It Works ─────────────────────────── */}
            <div className="relative z-10 w-full max-w-4xl px-6 pb-24">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl font-bold text-white mb-2">How It Works</h2>
                    <p className="text-slate-500 text-sm">Three steps to blockchain-verified warranty protection</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting line (desktop) */}
                    <div className="hidden md:block absolute top-6 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-gradient-to-r from-cyan-500/30 via-indigo-500/30 to-cyan-500/30" />

                    <Step number="01" title="Register Product" desc="Register your product on the blockchain with warranty dates and owner info." delay={0.7} />
                    <Step number="02" title="Verify Warranty" desc="Instantly verify your product's warranty status by ID or scanning a QR code." delay={0.85} />
                    <Step number="03" title="Transfer Ownership" desc="Securely transfer ownership to a new wallet when selling or gifting the product." delay={1.0} />
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="mt-16 flex justify-center"
                >
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 text-sm font-medium transition-colors group"
                    >
                        Go to Dashboard
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
