import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import BackToDashboardButton from '../components/BackToDashboardButton';
import { addServiceRecord, extendWarranty } from '../utils/blockchain';
import { useWallet } from '../context/WalletContext';
import { Settings, Wrench, Calendar, MapPin, User, AlertCircle, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTransaction } from '../hooks/useTransaction';
import TransactionModal from '../components/TransactionModal';
import { useProductLookup } from '../hooks/useProductLookup';
import { verifyOwnership } from '../utils/blockchain';

const ManageProduct = () => {
    usePageTitle('Manage Product');
    const { contract, account } = useWallet();
    const { stage, status, error, txHash, metadata, execute, reset } = useTransaction();
    
    const [productId, setProductId] = useState("");
    const [activeTab, setActiveTab] = useState('service'); // 'service' | 'warranty'
    
    // Service Form State
    const [serviceData, setServiceData] = useState({
        description: "",
        technician: "",
        location: ""
    });

    // Warranty Form State
    const [newExpiry, setNewExpiry] = useState("");
    const [isPaid, setIsPaid] = useState(false);

    // Live Product Lookup
    const { productName, isSearching, error: lookupError } = useProductLookup(contract, productId);

    const handleServiceChange = (e) => {
        setServiceData({ ...serviceData, [e.target.name]: e.target.value });
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        if (!productId || !serviceData.description) return;

        let ownerInfo = { ownerName: "Unknown", owner: "0x..." };
        try {
            ownerInfo = await verifyOwnership(contract, productId);
        } catch (e) { console.warn("Owner lookup failed", e); }

        await execute(
            addServiceRecord(contract, productId, serviceData.description, serviceData.technician, serviceData.location, true),
            {
                action: "Added Service Record",
                productName: productName || "Product",
                productId: productId,
                technician: serviceData.technician,
                ownerName: ownerInfo.ownerName,
                walletAddress: ownerInfo.owner
            }
        );
    };

    const handleExtendWarranty = async (e) => {
        e.preventDefault();
        if (!productId || !newExpiry) return;

        let ownerInfo = { ownerName: "Unknown", owner: "0x..." };
        try {
            ownerInfo = await verifyOwnership(contract, productId);
        } catch (e) { console.warn("Owner lookup failed", e); }

        const expiryTimestamp = new Date(newExpiry).getTime() / 1000;

        await execute(
            extendWarranty(contract, productId, expiryTimestamp),
            {
                action: "Extended Warranty",
                productName: productName || "Product",
                productId: productId,
                newExpiry: newExpiry,
                ownerName: ownerInfo.ownerName,
                walletAddress: ownerInfo.owner
            }
        );
    };

    const handleReset = () => {
        reset();
        if (stage === 'success') {
            setServiceData({ description: "", technician: "", location: "" });
            setNewExpiry("");
            setIsPaid(false);
        }
    };

    return (
        <div className="pt-24 pb-12 px-6 max-w-4xl mx-auto relative min-h-screen">
            <div className="mb-8 flex justify-between items-center">
                <BackToDashboardButton />
                <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTab('service')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'service' ? 'bg-cyan-500 text-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-slate-800 text-slate-400 border border-white/5 hover:bg-slate-700'}`}
                    >
                        Service & Repair
                    </button>
                    <button 
                        onClick={() => setActiveTab('warranty')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'warranty' ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-slate-800 text-slate-400 border border-white/5 hover:bg-slate-700'}`}
                    >
                        Warranty Extension
                    </button>
                </div>
            </div>

            <TransactionModal 
                stage={stage}
                status={status}
                error={error}
                txHash={txHash}
                metadata={metadata}
                onClose={handleReset}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <GlassCard className="border-t-4 border-t-cyan-500/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                                <Settings className="text-cyan-400 animate-[spin_8s_linear_infinite]" />
                                Product Maintenance
                            </h2>
                            <p className="text-slate-400 mt-2">Manage lifecycle records and warranty periods</p>
                        </div>

                        <div className="relative group min-w-[300px]">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Product Identity Hash</label>
                            <input
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-cyan-400 font-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-all shadow-inner"
                                placeholder="Enter Product ID"
                            />
                            <AnimatePresence>
                                {productName && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute -bottom-6 left-1 flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase"
                                    >
                                        <CheckCircle2 size={10} /> Found: {productName}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

                    {activeTab === 'service' ? (
                        <form onSubmit={handleAddService} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Repair Description</label>
                                    <div className="relative">
                                        <textarea
                                            name="description"
                                            required
                                            value={serviceData.description}
                                            onChange={handleServiceChange}
                                            className="w-full bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-white min-h-[120px] focus:outline-none focus:border-cyan-400/30 transition-all"
                                            placeholder="What was fixed or maintained?"
                                        />
                                        <Wrench className="absolute right-4 bottom-4 text-slate-600" size={18} />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Technician Name</label>
                                        <div className="relative">
                                            <input
                                                name="technician"
                                                value={serviceData.technician}
                                                onChange={handleServiceChange}
                                                className="w-full bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-cyan-400/30 transition-all"
                                                placeholder="Lead Engineer"
                                            />
                                            <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Service Location</label>
                                        <div className="relative">
                                            <input
                                                name="location"
                                                value={serviceData.location}
                                                onChange={handleServiceChange}
                                                className="w-full bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-cyan-400/30 transition-all"
                                                placeholder="Service Center Hub"
                                            />
                                            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <AnimatedButton
                                text={stage === 'processing' ? "Submitting to Ledger..." : "Log Service Record"}
                                disabled={stage !== 'idle' || !productId}
                                icon={ShieldCheck}
                                className="w-full py-5 text-lg bg-slate-900 border-cyan-500/30 text-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                                type="submit"
                            />
                        </form>
                    ) : (
                        <form onSubmit={handleExtendWarranty} className="space-y-8 max-w-xl mx-auto py-4">
                            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-[2.5rem] p-8 text-center relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                                
                                <Calendar className="mx-auto text-indigo-400 mb-4" size={48} />
                                <h3 className="text-2xl font-black text-white mb-2">Renewal & Extension</h3>
                                <p className="text-slate-400 text-sm mb-8">Select the new expiration date for this digital asset.</p>
                                
                                <div className="space-y-2 text-left">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">New Expiry Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            required
                                            value={newExpiry}
                                            onChange={(e) => setNewExpiry(e.target.value)}
                                            onClick={(e) => e.target.showPicker?.()}
                                            className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono shadow-inner shadow-black/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4 px-4">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Renewal Payment Status</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsPaid(!isPaid)}
                                        className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all ${isPaid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {isPaid ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                            <span className="text-lg font-black uppercase tracking-tight">{isPaid ? "Renewal Paid" : "Awaiting Renewal Payment"}</span>
                                        </div>
                                        <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${isPaid ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                            {isPaid ? "CONFIRMED" : "REQUIRED"}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-500/80 text-xs leading-relaxed">
                                <AlertCircle size={20} className="shrink-0" />
                                <p>Extending a warranty will permanently update the global registry. Ensure you have verified the product's physical condition or received payment for renewal before proceeding.</p>
                            </div>

                            <AnimatedButton
                                text={stage === 'processing' ? "Reactivating Warranty..." : !isPaid ? "Payment Required for Extension" : "Confirm Extension"}
                                disabled={stage !== 'idle' || !productId || !isPaid}
                                icon={Clock}
                                className={`w-full py-5 text-lg ${!isPaid ? 'bg-slate-800 border-red-500/20 text-red-500/50 cursor-not-allowed' : 'bg-slate-900 border-indigo-500/30 text-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]'}`}
                                type="submit"
                            />
                        </form>
                    )}
                </GlassCard>

                {/* Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <ShieldCheck className="text-cyan-400 mb-3" />
                        <h4 className="text-white font-bold mb-1">Immutable Log</h4>
                        <p className="text-slate-400 text-xs">Every repair record is permanently etched into the blockchain for future owners.</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <Clock className="text-indigo-400 mb-3" />
                        <h4 className="text-white font-bold mb-1">Renewal Power</h4>
                        <p className="text-slate-400 text-xs">Expired products can be reactivated instantly, enabling secondary market trust.</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <Wrench className="text-emerald-400 mb-3" />
                        <h4 className="text-white font-bold mb-1">Authentic Care</h4>
                        <p className="text-slate-400 text-xs">Official technicians build product value by documenting professional maintenance.</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ManageProduct;
