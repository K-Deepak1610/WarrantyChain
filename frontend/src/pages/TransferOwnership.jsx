import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import BackToDashboardButton from '../components/BackToDashboardButton';
import ParticleBurst from '../components/ParticleBurst';
import { transferOwnership, verifyWarranty } from '../utils/blockchain';
import { useWallet } from '../context/WalletContext';
import { RefreshCw, ArrowRight, Wallet, Wand2, Loader2, CheckCircle } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTransaction } from '../hooks/useTransaction';
import TransactionModal from '../components/TransactionModal';

const TransferOwnership = () => {
    usePageTitle('Transfer Ownership');
    const { contract } = useWallet();
    const { stage, status, error, txHash, metadata, execute, reset } = useTransaction();
    
    const [formData, setFormData] = useState({
        productId: "",
        newOwner: "",
        newOwnerName: ""
    });
    const [productName, setProductName] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [showBurst, setShowBurst] = useState(false);

    // Reliable lookup when ID changes
    useEffect(() => {
        const timer = setTimeout(() => {
            const cleanedId = formData.productId?.trim();
            if (cleanedId?.length > 2 && contract) {
                lookupProductName(cleanedId);
            } else {
                setProductName("");
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [formData.productId, contract]);

    const lookupProductName = async (id) => {
        setIsSearching(true);
        try {
            const cleanId = id.trim();
            // Use our specialized verify utility which we know is robust
            const data = await verifyWarranty(contract, cleanId);
            
            if (data && data.productName && data.productName !== "") {
                setProductName(data.productName);
            } else {
                setProductName("");
            }
        } catch (err) {
            console.error("Lookup error:", err);
            setProductName("");
        } finally {
            setIsSearching(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerateDemoWallet = () => {
        const wallet = ethers.Wallet.createRandom();
        setFormData({ ...formData, newOwner: wallet.address });
        alert(`Demo Wallet Generated!\n\nAddress: ${wallet.address}\nPrivate Key: ${wallet.privateKey}\n\nSAVE THIS if you want to use this account later!`);
    };

    const handleConnectNewOwner = async () => {
        if (!window.ethereum) {
            alert("MetaMask is not installed. Please install it to use this feature.");
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
                setFormData(prev => ({ ...prev, newOwner: accounts[0] }));
            }
        } catch (err) {
            console.error("Wallet connection failed:", err);
            alert(err.message || "Failed to connect wallet.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const cleanId = formData.productId.trim();
        if (!contract) {
            alert("Smart contract not initialized. Please connect your wallet.");
            return;
        }

        try {
            // Final safety check using the robust utility
            let finalName = productName;
            if (!finalName || finalName === "") {
                try {
                    const data = await verifyWarranty(contract, cleanId);
                    finalName = data.productName;
                } catch (err) {
                    console.warn("Final name lookup failed", err);
                }
            }

            await execute(
                transferOwnership(
                    contract,
                    cleanId,
                    formData.newOwner,
                    formData.newOwnerName
                ),
                {
                    action: "Transferred",
                    productId: cleanId,
                    productName: (finalName && finalName !== "") ? finalName : "Asset " + cleanId, 
                    ownerName: formData.newOwnerName,
                    walletAddress: formData.newOwner
                }
            );

            setShowBurst(true);
            setTimeout(() => setShowBurst(false), 2000);

        } catch (error) {
            console.error("Transfer flow failed:", error);
        }
    };

    const handleReset = () => {
        reset();
        if (stage === 'success') {
            setFormData({ productId: "", newOwner: "", newOwnerName: "" });
            setProductName("");
        }
    };

    return (
        <div className="pt-24 pb-12 px-6 max-w-2xl mx-auto relative">
            <BackToDashboardButton />

            <TransactionModal 
                stage={stage}
                status={status}
                error={error}
                txHash={txHash}
                metadata={metadata}
                onClose={handleReset}
            />

            <GlassCard>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent mb-6 text-center">
                    Transfer Ownership
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Target Product ID</label>
                            <div className="relative group">
                                <input
                                    name="productId" required
                                    value={formData.productId}
                                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono shadow-inner shadow-black/50"
                                    onChange={handleChange}
                                    placeholder="Enter Token ID"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {isSearching && <Loader2 size={16} className="text-cyan-400 animate-spin" />}
                                    {!isSearching && productName && <CheckCircle size={16} className="text-emerald-400" />}
                                </div>
                            </div>
                            
                            <AnimatePresence>
                                {productName && !isSearching && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="mt-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center gap-2"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                                            Found: <span className="text-white ml-1">{productName}</span>
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="p-6 bg-slate-900/40 rounded-[2rem] border border-white/5 my-6 backdrop-blur-md shadow-inner shadow-black/20">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2 flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest px-1">New Owner Wallet Address</label>
                                    <div className="flex gap-2">
                                        <button 
                                            type="button"
                                            onClick={handleConnectNewOwner}
                                            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20 transition-all"
                                        >
                                            <Wallet size={10} /> CONNECT
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={handleGenerateDemoWallet}
                                            className="text-[10px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20 transition-all"
                                        >
                                            <Wand2 size={10} /> DEMO
                                        </button>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <input
                                        name="newOwner" required
                                        value={formData.newOwner}
                                        placeholder="0x..."
                                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono shadow-inner shadow-black/50"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">New Owner Name</label>
                                    <input
                                        name="newOwnerName" required
                                        value={formData.newOwnerName}
                                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono shadow-inner shadow-black/50"
                                        placeholder="Enter full name"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="relative pt-4">
                            <ParticleBurst trigger={showBurst} />
                            <AnimatedButton
                                text={stage === 'processing' ? "Broadcasting..." : stage === 'waiting' ? "Awaiting Wallet..." : "Confirm & Transfer"}
                                disabled={stage !== 'idle'}
                                icon={RefreshCw}
                                className={`w-full py-4 text-lg ${stage !== 'idle' ? "opacity-70 cursor-wait bg-slate-800" : "bg-slate-900 border-indigo-500/50 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all"}`}
                            />
                        </div>
                    </form>
                </GlassCard>
        </div>
    );
};

export default TransferOwnership;
