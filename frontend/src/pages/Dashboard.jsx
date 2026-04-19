import { motion } from 'framer-motion';
import DashboardCard from '../components/DashboardCard';
import BackToHomeButton from '../components/BackToHomeButton';
import { PlusCircle, CheckCircle, Shield, RefreshCw, Wifi, Database, Copy, Check, TrendingUp, Package } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { shortenAddress, getAllProducts } from '../utils/blockchain';
import ProductCard from '../components/ProductCard';
import { useState, useEffect, useMemo } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';

const StatCard = ({ label, value, icon: Icon, color, sub }) => {
    const colorMap = {
        cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    };
    return (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:bg-white/10 transition-colors cursor-default group">
            <div>
                <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-1">{label}</p>
                <p className="text-3xl font-black text-white">{value}</p>
                {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
            </div>
            <div className={`p-3 rounded-xl border transition-transform duration-300 group-hover:scale-105 ${colorMap[color]}`}>
                <Icon size={22} />
            </div>
        </div>
    );
};

const Dashboard = () => {
    usePageTitle('Dashboard');
    const { isConnected, account, contract } = useWallet();
    const [products, setProducts] = useState([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            if (contract && isConnected) {
                try {
                    const data = await getAllProducts(contract);
                    setProducts(data);
                } catch (err) {
                    console.error("Failed to load products from blockchain", err);
                }
            }
        };
        fetchProducts();
    }, [contract, isConnected]);

    const handleCopyAddress = () => {
        if (account) {
            navigator.clipboard.writeText(account);
            setCopied(true);
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    };

    const activeProducts = useMemo(() => {
        const now = Date.now() / 1000;
        return products.filter(p => p.warrantyEnd > now);
    }, [products]);

    return (
        <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto space-y-10 relative">
            <BackToHomeButton />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                {/* ─── Welcome Panel ───────────────────────── */}
                <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
                    {/* Watermark icon */}
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Database size={140} />
                    </div>
                    {/* Decorative top-right glow */}
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Live Dashboard</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                            WarrantyChain <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Dashboard</span>
                        </h1>
                        <p className="text-slate-300 max-w-xl mb-6 text-sm leading-relaxed">
                            Manage your digital warranties and securely transfer product ownership using blockchain technology.
                        </p>

                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-3 text-sm">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 border-slate-600 text-slate-400'}`}>
                                <Wifi size={14} className={isConnected ? 'animate-pulse' : ''} />
                                <span className="font-semibold">{isConnected ? 'Wallet Connected' : 'Not Connected'}</span>
                            </div>
                            {isConnected && (
                                <button
                                    onClick={handleCopyAddress}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                    title="Copy full address"
                                >
                                    <span className="font-mono">{shortenAddress(account)}</span>
                                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                </button>
                            )}
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                <TrendingUp size={14} />
                                <span>Ganache Local</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                                <Package size={14} />
                                <span>Persistence Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Stats Row ───────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Registered" value={products.length} icon={Database} color="cyan" sub="total products" />
                    <StatCard label="Active" value={activeProducts.length} icon={CheckCircle} color="emerald" sub="valid warranties" />
                    <StatCard label="Expired" value={products.length - activeProducts.length} icon={Shield} color="orange" sub="past warranty" />
                    <StatCard label="Network" value="Ganache" icon={Wifi} color="purple" sub="Local Workspace" />
                </div>

                {/* ─── Feature Cards ────────────────────────── */}
                <div>
                    <h2 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-gradient-to-b from-cyan-400 to-indigo-400 rounded-full inline-block" />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <DashboardCard title="Register" icon={PlusCircle} to="/register" color="blue" />
                        <DashboardCard title="Verify Warranty" icon={CheckCircle} to="/verify-warranty" color="green" />
                        <DashboardCard title="Verify Ownership" icon={Shield} to="/verify-ownership" color="purple" />
                        <DashboardCard title="Transfer" icon={RefreshCw} to="/transfer-ownership" color="orange" />
                    </div>
                </div>

                {/* ─── Registered Products Gallery ─────────── */}
                <div className="pt-4">
                    <h2 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-full inline-block" />
                        Registered Assets
                        {products.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
                                {products.length}
                            </span>
                        )}
                    </h2>

                    {products.length === 0 ? (
                        <div className="text-center p-16 glass-card rounded-2xl border-white/5 flex flex-col items-center">
                            <Database size={40} className="text-slate-700 mb-4" />
                            <p className="text-slate-500 text-sm">Blockchain indexing required for gallery view.</p>
                            <p className="text-slate-600 text-xs mt-1">Please use the Verify feature to query specific products by ID.</p>
                        </div>
                    ) : (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.08 } }
                            }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full"
                        >
                            {products.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
