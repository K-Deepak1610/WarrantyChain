import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import BackToDashboardButton from '../components/BackToDashboardButton';
import ParticleBurst from '../components/ParticleBurst';
import { transferOwnership, verifyWarranty, shortenAddress } from '../utils/blockchain';
import { useWallet } from '../context/WalletContext';
import { RefreshCw, ArrowRight, Wallet, CheckCircle, ShieldCheck, AlertCircle, Loader2, Sparkles, User, Box } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTransaction } from '../hooks/useTransaction';
import TransactionModal from '../components/TransactionModal';

const TransferOwnership = () => {
    usePageTitle('Transfer Ownership');
    const { account, contract, selectAccount, isConnected, connectWallet } = useWallet();
    const { stage, status, error, txHash, metadata, execute, reset } = useTransaction();
    
    const [formData, setFormData] = useState({
        productId: "",
        newOwner: "",
        newOwnerName: "",
        newOwnerContact: "",
        newOwnerEmail: ""
    });
    const [productDetails, setProductDetails] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showBurst, setShowBurst] = useState(false);

    // Reliable lookup when ID changes
    useEffect(() => {
        const timer = setTimeout(() => {
            const cleanedId = formData.productId?.trim();
            if (cleanedId?.length > 2 && contract) {
                lookupProductName(cleanedId);
            } else {
                setProductDetails(null);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [formData.productId, contract]);

    const lookupProductName = async (id) => {
        setIsSearching(true);
        try {
            const data = await verifyWarranty(contract, id.trim());
            if (data && data.productName && data.productName !== "") {
                setProductDetails(data);
            } else {
                setProductDetails(null);
            }
        } catch (err) {
            setProductDetails(null);
        } finally {
            setIsSearching(false);
        }
    };

    const isMatch = !productDetails || !account || productDetails.owner?.toLowerCase() === account?.toLowerCase();

    const getButtonState = () => {
        if (!isConnected) return { text: "Connect Wallet", icon: Wallet, action: connectWallet, color: "blue" };
        if (!formData.productId) return { text: "Enter Product ID", icon: Box, action: null, disabled: true };
        if (isSearching) return { text: "Verifying Asset...", icon: Loader2, action: null, disabled: true, spin: true };
        if (!productDetails) return { text: "Invalid Product ID", icon: AlertCircle, action: null, disabled: true };
        if (!isMatch) return { text: "Switch to Owner Wallet", icon: RefreshCw, action: selectAccount, color: "amber" };
        if (!formData.newOwner || !formData.newOwnerName || !formData.newOwnerContact || !formData.newOwnerEmail) return { text: "Enter Recipient Details", icon: User, action: null, disabled: true };
        
        return { 
            text: stage === 'processing' ? "Transferring..." : "Confirm & Transfer", 
            icon: Sparkles, 
            action: handleTransfer,
            disabled: stage !== 'idle'
        };
    };

    const handleTransfer = async () => {
        const cleanId = formData.productId.trim();
        await execute(
            transferOwnership(contract, cleanId, formData.newOwner, formData.newOwnerName, formData.newOwnerContact, formData.newOwnerEmail),
            {
                action: "Transferred",
                productId: cleanId,
                productName: productDetails?.productName || "Asset",
                ownerName: formData.newOwnerName,
                walletAddress: formData.newOwner,
                ownerContact: formData.newOwnerContact
            }
        );
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 2000);
    };

    const handleReset = () => {
        reset();
        if (stage === 'success') {
            setFormData({ productId: "", newOwner: "", newOwnerName: "", newOwnerContact: "", newOwnerEmail: "" });
            setProductDetails(null);
        }
    };

    const buttonState = getButtonState();

    return (
        <div className="pt-24 pb-12 px-6 max-w-2xl mx-auto relative min-h-screen flex flex-col justify-center">
            <div className="mb-8">
                <BackToDashboardButton />
            </div>

            <TransactionModal stage={stage} status={status} error={error} txHash={txHash} metadata={metadata} onClose={handleReset} />

            <div className="text-center mb-10">
                <h2 className="text-4xl font-black bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent mb-2 tracking-tight">
                    Smart Transfer
                </h2>
                <p className="text-slate-500 text-sm font-medium tracking-wide">Blockchain ownership migration protocol</p>
            </div>

            <GlassCard className="relative overflow-visible">
                <div className="space-y-8">
                    
                    {/* PRODUCT INPUT */}
                    <div className="space-y-4">
                        <div className="relative group">
                            <input
                                name="productId"
                                value={formData.productId}
                                onChange={(e) => setFormData({...formData, productId: e.target.value})}
                                placeholder="Enter Product ID (e.g. IP001)"
                                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all font-mono text-lg shadow-inner shadow-black"
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                {isSearching ? <Loader2 size={24} className="text-orange-400 animate-spin" /> : 
                                 productDetails ? <CheckCircle size={24} className="text-emerald-500" /> : <Box size={24} className="text-slate-700" />}
                            </div>
                        </div>

                        <AnimatePresence>
                            {productDetails && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="bg-slate-900/60 border border-white/5 rounded-2xl p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Asset</p>
                                            <p className="text-xl font-bold text-white tracking-tight">{productDetails.productName}</p>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${isMatch ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${isMatch ? 'bg-emerald-400 animate-pulse' : 'bg-orange-400'}`} />
                                            {isMatch ? 'Unlocked' : 'Locked'}
                                        </div>
                                    </div>

                                    {!isMatch && (
                                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5 text-xs text-orange-300/80">
                                            <AlertCircle size={14} />
                                            <p>Owned by <span className="font-mono">{shortenAddress(productDetails.owner)}</span></p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* RECEIVER INPUTS */}
                    <div className={`space-y-6 transition-all duration-500 ${!productDetails || !isMatch ? 'opacity-30 pointer-events-none scale-98 blur-sm' : 'opacity-100'}`}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Receiver Address</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={(e) => { e.preventDefault(); setFormData({...formData, newOwner: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"}); }}
                                        className="text-[9px] font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-lg hover:bg-orange-500/20 transition-all active:scale-95 uppercase tracking-tighter"
                                    >
                                        Fill: Account 2
                                    </button>
                                    <button 
                                        onClick={(e) => { e.preventDefault(); setFormData({...formData, newOwner: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"}); }}
                                        className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg hover:bg-indigo-500/20 transition-all active:scale-95 uppercase tracking-tighter"
                                    >
                                        Fill: Account 1
                                    </button>
                                </div>
                            </div>
                            <input
                                name="newOwner"
                                value={formData.newOwner}
                                onChange={(e) => setFormData({...formData, newOwner: e.target.value})}
                                placeholder="Paste or Quick-Fill Wallet Address"
                                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-mono shadow-inner shadow-black"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Receiver Name</label>
                                <input
                                    name="newOwnerName"
                                    value={formData.newOwnerName}
                                    onChange={(e) => setFormData({...formData, newOwnerName: e.target.value})}
                                    placeholder="Full name"
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-mono shadow-inner shadow-black"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Receiver Contact</label>
                                <input
                                    name="newOwnerContact"
                                    value={formData.newOwnerContact}
                                    onChange={(e) => setFormData({...formData, newOwnerContact: e.target.value})}
                                    placeholder="Phone"
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-mono shadow-inner shadow-black"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Receiver Email</label>
                            <input
                                name="newOwnerEmail"
                                type="email"
                                value={formData.newOwnerEmail}
                                onChange={(e) => setFormData({...formData, newOwnerEmail: e.target.value})}
                                placeholder="Email address"
                                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-mono shadow-inner shadow-black"
                            />
                        </div>
                    </div>

                    {/* ACTION AREA */}
                    <div className="pt-4 relative">
                        <ParticleBurst trigger={showBurst} />
                        <button
                            disabled={buttonState.disabled}
                            onClick={buttonState.action}
                            className={`w-full py-5 rounded-2xl font-black text-lg transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 shadow-xl
                                ${buttonState.disabled 
                                    ? 'bg-slate-800 text-slate-600 border border-white/5 cursor-not-allowed grayscale' 
                                    : buttonState.color === 'blue'
                                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                                        : buttonState.color === 'amber'
                                            ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-500/20 animate-pulse'
                                            : 'bg-slate-900 border border-white/10 text-white hover:border-orange-500/50 shadow-orange-500/10'
                                }`}
                        >
                            <buttonState.icon size={22} className={buttonState.spin ? 'animate-spin' : ''} />
                            {buttonState.text}
                        </button>
                        
                        {buttonState.color === 'amber' && (
                            <p className="text-center text-[10px] text-orange-500/60 font-black uppercase tracking-[0.2em] mt-4 flex items-center justify-center gap-2">
                                <AlertCircle size={10} /> Account Switch Required to Unlock
                            </p>
                        )}
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default TransferOwnership;
