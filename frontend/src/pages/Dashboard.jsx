import { motion } from 'framer-motion';
import DashboardCard from '../components/DashboardCard';
import BackToHomeButton from '../components/BackToHomeButton';
import { PlusCircle, CheckCircle, Shield, RefreshCw, Wifi, Database } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { shortenAddress } from '../utils/blockchain';
import HexProductCard from '../components/HexProductCard';
import { useState, useEffect } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';

const Dashboard = () => {
    usePageTitle('Dashboard');
    const { isConnected, account } = useWallet();
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const loaded = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('product_')) {
                try {
                    loaded.push(JSON.parse(localStorage.getItem(key)));
                } catch (e) {}
            }
        }
        setProducts(loaded);
    }, []);

    const StatCard = ({ label, value, icon: Icon, color }) => (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
            <div>
                <p className="text-slate-400 text-sm">{label}</p>
                <p className="text-2xl font-bold text-white mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400`}>
                <Icon size={24} />
            </div>
        </div>
    );

    return (
        <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-8 relative">
            <BackToHomeButton />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Welcome Panel */}
                <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Database size={120} />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Welcome to WarrantyChain Dashboard
                    </h1>
                    <p className="text-slate-300 max-w-xl mb-6">
                        Manage your digital warranties and securely transfer product ownership using blockchain.
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 border-slate-600 text-slate-400'}`}>
                            <Wifi size={14} className={isConnected ? "animate-pulse" : ""} />
                            <span>{isConnected ? "Wallet Connected" : "Not Connected"}</span>
                        </div>
                        {isConnected && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                <span className="font-mono">{shortenAddress(account)}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                            <span>Network: Hardhat Localhost</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                            <span>Contract: Active</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                <DashboardCard
                    title="Register"
                    icon={PlusCircle}
                    to="/register"
                    color="blue"
                />
                <DashboardCard
                    title="Verify Product"
                    icon={CheckCircle}
                    to="/verify-warranty"
                    color="green"
                />
                <DashboardCard
                    title="Check Owner"
                    icon={Shield}
                    to="/verify-ownership"
                    color="purple"
                />
                <DashboardCard
                    title="Transfer"
                    icon={RefreshCw}
                    to="/transfer-ownership"
                    color="orange"
                />
            </div>

            {/* Registered Products Gallery */}
            <div className="max-w-6xl mx-auto pt-12">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent mb-8">
                    Registered Assets
                </h2>
                
                {products.length === 0 ? (
                    <div className="text-center p-12 glass-card rounded-2xl border-white/5">
                        <p className="text-slate-500">No assets detected in current environment.</p>
                    </div>
                ) : (
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.08 } }
                        }}
                        className="flex flex-wrap gap-8 justify-center lg:justify-start"
                    >
                        {products.map(p => (
                            <HexProductCard key={p.id} product={p} />
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
