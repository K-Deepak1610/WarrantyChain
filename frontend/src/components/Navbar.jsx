import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { shortenAddress } from '../utils/blockchain';
import AnimatedButton from './AnimatedButton';
import { Wallet, ShieldCheck, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { account, connectWallet, disconnectWallet, isConnected } = useWallet();
    const navigate = useNavigate();

    const handleConnect = async () => {
        await connectWallet();
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
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-slate-950/50 border-b border-white/5"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <ShieldCheck className="text-blue-500 group-hover:text-blue-400 transition-colors" size={32} />
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        WarrantyChain
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    {isConnected ? (
                        <div className="flex items-center gap-4">
                            <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                                Dashboard
                            </Link>
                            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="font-mono">{shortenAddress(account)}</span>
                            </div>
                            <button
                                onClick={handleDisconnect}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Disconnect"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <AnimatedButton
                            text="Connect Wallet"
                            onClick={handleConnect}
                            icon={Wallet}
                            className="text-sm px-4 py-2"
                        />
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
