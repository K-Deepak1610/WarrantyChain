import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import BackToDashboardButton from '../components/BackToDashboardButton';
import { addServiceRecord, extendWarranty, getWarrantyHistory } from '../utils/blockchain';
import { useWallet } from '../context/WalletContext';
import { Settings, Wrench, Calendar, MapPin, User, AlertCircle, ShieldCheck, Clock, CheckCircle2, ExternalLink, History } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTransaction } from '../hooks/useTransaction';
import TransactionModal from '../components/TransactionModal';
import { useProductLookup } from '../hooks/useProductLookup';
import { verifyOwnership, getServiceHistory } from '../utils/blockchain';
import ServiceHistoryTimeline from '../components/ServiceHistoryTimeline';

const ManageProduct = () => {
    usePageTitle('Manage Product');
    const { contract, account } = useWallet();
    const { stage, status, error, txHash, metadata, execute, reset } = useTransaction();
    
    const [productId, setProductId] = useState("");
    const [activeTab, setActiveTab] = useState('service'); // 'service' | 'warranty'
    const [renewalHistory, setRenewalHistory] = useState([]);
    const [serviceRecords, setServiceRecords] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    
    // Service Form State
    const [serviceData, setServiceData] = useState({
        description: "",
        technician: "",
        location: "",
        serviceDate: new Date().toISOString().split('T')[0]
    });

    // Warranty Form State
    const [newExpiry, setNewExpiry] = useState("");
    const [isPaid, setIsPaid] = useState(false);

    // Live Product Lookup
    const { productData, isSearching, error: lookupError } = useProductLookup(contract, productId);
    const productName = productData?.productName;

    const isOwner = productData && account && productData.owner.toLowerCase() === account.toLowerCase();

    useEffect(() => {
        if (productId && productId.length > 5 && contract) {
            fetchHistory();
        } else {
            setRenewalHistory([]);
        }
    }, [productId, contract]);

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const history = await getWarrantyHistory(contract, productId);
            setRenewalHistory(history.sort((a, b) => b.timestamp - a.timestamp));
            
            const services = await getServiceHistory(contract, productId);
            setServiceRecords(services.sort((a, b) => b.serviceDate - a.serviceDate));
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTxHash = (hash) => {
        if (!hash) return "";
        return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
    };

    const handleServiceChange = (e) => {
        setServiceData({ ...serviceData, [e.target.name]: e.target.value });
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        if (!productId || !serviceData.description) return;
        if (!isOwner) return;

        let ownerInfo = { ownerName: productData?.ownerName || "Unknown", owner: productData?.owner || "0x..." };

        const serviceTimestamp = new Date(serviceData.serviceDate).getTime() / 1000;

        await execute(
            addServiceRecord(contract, productId, serviceData.description, serviceData.technician, serviceData.location, true, serviceTimestamp),
            {
                action: "Added Service Record",
                productName: productName || "Product",
                productId: productId,
                technician: serviceData.technician,
                ownerName: ownerInfo.ownerName,
                walletAddress: ownerInfo.owner
            }
        );

        // Refresh history after success
        setTimeout(fetchHistory, 2000);
    };

    const handleExtendWarranty = async (e) => {
        e.preventDefault();
        if (!productId || !newExpiry || !isPaid || !isOwner) return;

        let ownerInfo = { ownerName: productData?.ownerName || "Unknown", owner: productData?.owner || "0x..." };
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
        
        // Refresh history after success
        setTimeout(fetchHistory, 2000);
    };

    const handleReset = () => {
        reset();
        if (stage === 'success') {
            setServiceData({ description: "", technician: "", location: "", serviceDate: new Date().toISOString().split('T')[0] });
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
                                {productData && !isOwner && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute -bottom-6 left-1 flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase"
                                    >
                                        <AlertCircle size={10} /> This product is not registered to your wallet
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
                                            disabled={!isOwner}
                                            value={serviceData.description}
                                            onChange={handleServiceChange}
                                            className="w-full bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-white min-h-[120px] focus:outline-none focus:border-cyan-400/30 transition-all disabled:opacity-50"
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
                                                disabled={!isOwner}
                                                value={serviceData.technician}
                                                onChange={handleServiceChange}
                                                className="w-full bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-cyan-400/30 transition-all disabled:opacity-50"
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
                                                disabled={!isOwner}
                                                value={serviceData.location}
                                                onChange={handleServiceChange}
                                                className="w-full bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-cyan-400/30 transition-all disabled:opacity-50"
                                                placeholder="Service Center Hub"
                                            />
                                            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Service Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                name="serviceDate"
                                                disabled={!isOwner}
                                                value={serviceData.serviceDate}
                                                onChange={handleServiceChange}
                                                onClick={(e) => e.target.showPicker?.()}
                                                className="w-full bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-cyan-400/30 transition-all disabled:opacity-50 font-mono"
                                            />
                                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <AnimatedButton
                                text={stage === 'processing' ? "Submitting to Ledger..." : "Log Service Record"}
                                disabled={stage !== 'idle' || !productId || !isOwner}
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
                                
                                {productData && (
                                    <div className="mb-6 py-3 px-4 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center gap-3 text-xs font-mono">
                                        <span className="text-slate-500">Current expiry:</span>
                                        <span className="text-white font-bold">{formatDate(productData.warrantyEnd)}</span>
                                        <span className="text-indigo-500">→</span>
                                        <span className="text-slate-500">New expiry:</span>
                                        <span className="text-indigo-400 font-bold">{newExpiry ? formatDate(new Date(newExpiry).getTime() / 1000) : "---"}</span>
                                    </div>
                                )}

                                <div className="space-y-2 text-left">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">New Expiry Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            required
                                            disabled={!isOwner}
                                            value={newExpiry}
                                            onChange={(e) => setNewExpiry(e.target.value)}
                                            onClick={(e) => e.target.showPicker?.()}
                                            className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono shadow-inner shadow-black/50 disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 mt-6 px-4 text-left">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Payment Verification</label>
                                    <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPaid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                                <Clock size={20} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">Payment Received</div>
                                                <div className="text-[10px] text-slate-500 uppercase font-black">Manual Confirmation</div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={!isOwner}
                                            onClick={() => setIsPaid(!isPaid)}
                                            className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${isPaid ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${isPaid ? 'translate-x-7' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-500/80 text-xs leading-relaxed">
                                <AlertCircle size={20} className="shrink-0" />
                                <p>Extending warranty permanently updates the global registry. Confirm payment is received and product condition is verified before proceeding. This action is irreversible.</p>
                            </div>

                            {stage === 'success' && txHash && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center gap-2"
                                >
                                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                                        <CheckCircle2 size={16} /> Extension Successful
                                    </div>
                                    <a 
                                        href={`https://sepolia.etherscan.io/tx/${txHash}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-mono underline underline-offset-4"
                                    >
                                        Transaction: {formatTxHash(txHash)} <ExternalLink size={10} />
                                    </a>
                                </motion.div>
                            )}

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs text-center font-bold">
                                    {error}
                                </div>
                            )}

                            <AnimatedButton
                                text={stage === 'processing' ? "Updating Registry..." : !isPaid ? "Enable Payment Toggle to Continue" : "Extend Warranty"}
                                disabled={stage !== 'idle' || !productId || !isPaid || !isOwner}
                                icon={ShieldCheck}
                                className={`w-full py-5 text-lg transition-all duration-500 ${!isPaid ? 'bg-slate-800 border-white/5 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 border-emerald-400/30 text-white hover:bg-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]'}`}
                                type="submit"
                            />
                        </form>
                    )}
                </GlassCard>

                {/* Maintenance Timeline Section */}
                {activeTab === 'service' && productId && productId.length > 5 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6 pt-4"
                    >
                        <div className="flex items-center gap-2 px-2">
                            <Wrench className="text-slate-500" size={18} />
                            <h3 className="text-lg font-black text-white uppercase tracking-wider">Maintenance Timeline</h3>
                            <div className="h-px flex-1 bg-white/5 ml-2" />
                        </div>

                        {isLoadingHistory ? (
                            <div className="py-12 text-center text-slate-500 text-sm animate-pulse">Syncing service records...</div>
                        ) : (
                            <ServiceHistoryTimeline history={serviceRecords} />
                        )}
                    </motion.div>
                )}

                {/* Renewal History Section */}
                {activeTab === 'warranty' && productId && productId.length > 5 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-2 px-2">
                            <History className="text-slate-500" size={18} />
                            <h3 className="text-lg font-black text-white uppercase tracking-wider">Renewal History</h3>
                            <div className="h-px flex-1 bg-white/5 ml-2" />
                        </div>

                        {isLoadingHistory ? (
                            <div className="py-12 text-center text-slate-500 text-sm animate-pulse">Fetching on-chain records...</div>
                        ) : renewalHistory.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {renewalHistory.map((item, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <div className="text-white font-bold text-sm">Extended to {formatDate(item.newExpiry)}</div>
                                                <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                                                    Hash: {formatTxHash(item.txnHash)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase flex items-center gap-1">
                                                <ShieldCheck size={10} /> Verified
                                            </div>
                                            <a 
                                                href={`https://sepolia.etherscan.io/tx/${item.txnHash}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
                                <p className="text-slate-500 text-xs">No prior extension events found for this Product ID.</p>
                            </div>
                        )}
                    </motion.div>
                )}

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
