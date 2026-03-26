import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { shortenAddress } from '../utils/blockchain';
import { ShieldCheck, LogOut, Loader2, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

const Navbar = ({ setShowCommandPalette }) => {
    const { account, connectWallet, disconnectWallet, isConnected } = useWallet();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [scrolled, setScrolled] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            await connectWallet();
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = () => {
        disconnectWallet();
        navigate('/');
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
                scrolled 
                ? 'backdrop-blur-xl bg-slate-900/70 border-b border-white/10 shadow-lg shadow-black/20' 
                : 'bg-transparent border-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="hover:opacity-80 transition-opacity group relative">
                    <Logo size="md" />
                    {/* Active Route indicator (Only show if at root for now or general) */}
                    {location.pathname === '/' && (
                        <motion.div layoutId="nav-underline" className="absolute -bottom-5 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-indigo-400" />
                    )}
                </Link>

                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => setShowCommandPalette(true)}
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors text-sm"
                    >
                        <Command size={14} />
                        <span>Search</span>
                        <kbd className="ml-2 font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">⌘K</kbd>
                    </button>

                    <AnimatePresence mode="wait">
                        {isConnected ? (
                            <motion.div 
                                key="connected"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center gap-4"
                            >
                                <div className="relative">
                                    <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors font-medium">
                                        Dashboard
                                    </Link>
                                    {location.pathname === '/dashboard' && (
                                        <motion.div layoutId="nav-underline" className="absolute -bottom-5 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-indigo-400" />
                                    )}
                                </div>
                                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                    <span className="font-mono text-sm tracking-wider">{shortenAddress(account)}</span>
                                </div>
                                <button
                                    onClick={handleDisconnect}
                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Disconnect"
                                >
                                    <LogOut size={20} />
                                </button>
                            </motion.div>
                        ) : isConnecting ? (
                            <motion.div 
                                key="connecting"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="px-5 py-2.5 bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center gap-3 text-indigo-300"
                            >
                                <Loader2 size={18} className="animate-spin" />
                                <span className="font-medium text-sm">Awaiting signature...</span>
                            </motion.div>
                        ) : (
                            <motion.button
                                key="connect"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={handleConnect}
                                className="relative group px-6 py-2.5 bg-slate-900 rounded-xl border border-transparent overflow-hidden active:scale-95 transition-transform"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity rounded-xl -z-10 blur-sm" />
                                <div className="absolute inset-[1px] bg-slate-950 rounded-[11px] -z-10" />
                                <div className="flex items-center gap-2">
                                    {/* Simulated Fox Icon */}
                                    <svg width="20" height="20" viewBox="0 0 118 118" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M107.824 23.3601L91.4326 19.336L78.1132 50.8443L107.824 23.3601Z" fill="#E2761B"/>
                                        <path d="M10.1763 23.3601L26.5674 19.336L39.8868 50.8443L10.1763 23.3601Z" fill="#E2761B"/>
                                        <path d="M78.1133 50.8443L59.0001 70.8245L39.8868 50.8443L26.5674 19.336L59.0001 4.70801L91.4327 19.336L78.1133 50.8443Z" fill="#E4761B"/>
                                        <path d="M59.0001 70.8245L78.1133 50.8443L91.4327 75.8365L59.0001 70.8245Z" fill="#D7C1B3"/>
                                        <path d="M59.0001 70.8245L39.8868 50.8443L26.5674 75.8365L59.0001 70.8245Z" fill="#D7C1B3"/>
                                        <path d="M107.824 23.3601L91.4326 75.8365L118 73.1119L107.824 23.3601Z" fill="#E4761B"/>
                                        <path d="M10.1763 23.3601L26.5674 75.8365L0 73.1119L10.1763 23.3601Z" fill="#E4761B"/>
                                        <path d="M59.0001 70.8245L91.4326 75.8365L82.1643 102.324L59.0001 118V70.8245Z" fill="#F6851B"/>
                                        <path d="M59.0001 70.8245L26.5674 75.8365L35.8357 102.324L59.0001 118V70.8245Z" fill="#F6851B"/>
                                        <path d="M75.3129 104.744L82.1643 102.324L91.4326 75.8365L107.824 100.228L75.3129 104.744Z" fill="#C0AD9E"/>
                                        <path d="M42.6871 104.744L35.8357 102.324L26.5674 75.8365L10.1763 100.228L42.6871 104.744Z" fill="#C0AD9E"/>
                                        <path d="M75.3129 104.744L59.0001 118L42.6871 104.744L35.8357 102.324L59.0001 108.796L82.1643 102.324L75.3129 104.744Z" fill="#161616"/>
                                    </svg>
                                    <span className="font-bold text-white relative z-10">Connect Wallet</span>
                                </div>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
