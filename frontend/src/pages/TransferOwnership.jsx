import { useState } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import BackToDashboardButton from '../components/BackToDashboardButton';
import ParticleBurst from '../components/ParticleBurst';
import HashDisplay from '../components/HashDisplay';
import { transferOwnership, verifyOwnership } from '../utils/blockchain';
import { useWallet } from '../context/WalletContext';
import { RefreshCw, ArrowRight, CheckCircle, AlertCircle, Wand2, Wallet, FileText } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

const TransferOwnership = () => {
    usePageTitle('Transfer Ownership');
    const { contract } = useWallet();
    const [formData, setFormData] = useState({
        productId: "",
        newOwner: "",
        newOwnerName: "",
        newOwnerContact: ""
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("idle"); // idle, processing, success, error
    const [errorMsg, setErrorMsg] = useState("");
    const [transferredDetails, setTransferredDetails] = useState(null);
    const [txHash, setTxHash] = useState("");
    const [showBurst, setShowBurst] = useState(false);

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
        
        if (!contract) {
            setStatus("error");
            setErrorMsg("Smart contract not initialized. Please connect your wallet.");
            return;
        }

        setLoading(true);
        setStatus("processing");
        setErrorMsg("");
        setTxHash("");

        try {
            const tx = await transferOwnership(
                contract,
                formData.productId,
                formData.newOwner,
                formData.newOwnerName,
                formData.newOwnerContact
            );
            setTxHash(tx.hash);

            // Wait a sec for propagation then fetch
            setTimeout(async () => {
                try {
                    const details = await verifyOwnership(contract, formData.productId);
                    setTransferredDetails(details);
                } catch (err) {
                    console.warn("Could not verify ownership after transfer, updating local backup...");
                    const backup = localStorage.getItem(`product_${formData.productId}`);
                    if (backup) {
                        const parsed = JSON.parse(backup);
                        const updated = {
                            ...parsed,
                            ownerName: formData.newOwnerName,
                            ownerContact: formData.newOwnerContact,
                            history: [
                                ...(parsed.history || []),
                                {
                                    ownerName: formData.newOwnerName,
                                    ownerContact: formData.newOwnerContact,
                                    ownerAddress: formData.newOwner,
                                    transferDate: Math.floor(Date.now() / 1000)
                                }
                            ]
                        };
                        localStorage.setItem(`product_${formData.productId}`, JSON.stringify(updated));
                    }
                    setTransferredDetails({
                        ownerName: formData.newOwnerName,
                        ownerContact: formData.newOwnerContact,
                        ownerAddress: formData.newOwner
                    });
                }
                
                setShowBurst(true);
                setTimeout(() => {
                    setStatus("success");
                    setShowBurst(false);
                }, 800);
            }, 2000);

        } catch (error) {
            console.error(error);
            setStatus("error");
            setErrorMsg(error.reason || error.message || "Transfer failed. Ensure you are the owner.");
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-12 px-6 max-w-2xl mx-auto relative">
            <BackToDashboardButton />

            <GlassCard>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent mb-6 text-center">
                    Transfer Ownership
                </h2>

                {status === "success" ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6"
                    >
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 mb-6 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Ownership Transfer Successful</h3>
                        <p className="text-slate-400 mb-8">The ownership has been securely transferred on the blockchain.</p>

                        <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/10 text-left mb-8 space-y-4">
                            <h4 className="font-bold text-slate-300 flex items-center gap-2 border-b border-white/5 pb-2">
                                <FileText size={16} /> Transaction Receipt
                            </h4>

                            {transferredDetails && (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">New Owner Name</p>
                                        <p className="text-white font-medium">{transferredDetails.ownerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Contact</p>
                                        <p className="text-white font-medium">{transferredDetails.ownerContact}</p>
                                    </div>
                                    <div className="col-span-2 mt-4">
                                        <HashDisplay 
                                            label="New Wallet Address" 
                                            value={transferredDetails.ownerAddress} 
                                        />
                                    </div>
                                    <div className="col-span-2 mt-2 pt-2 border-t border-white/5">
                                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Transaction Hash</p>
                                        <p className="font-mono text-xs text-slate-400 break-all">
                                            {txHash}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <AnimatedButton
                            text="Transfer Another Product"
                            onClick={() => {
                                setStatus("idle");
                                setFormData({ productId: "", newOwner: "", newOwnerName: "", newOwnerContact: "" });
                                setTransferredDetails(null);
                                setTxHash("");
                            }}
                            className="bg-orange-600 hover:bg-orange-500 mx-auto"
                        />
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Target Product ID</label>
                            <input
                                name="productId" required
                                value={formData.productId}
                                className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono shadow-inner shadow-black/50"
                                onChange={handleChange}
                                placeholder="Token ID"
                            />
                        </div>

                        <div className="p-6 bg-slate-900/40 rounded-[2rem] border border-white/5 my-6 backdrop-blur-md shadow-inner shadow-black/20">
                            <h4 className="text-cyan-400 font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-sm border-b border-white/5 pb-4">
                                <ArrowRight size={16} /> New Node Designation
                            </h4>

                            <div className="flex gap-2 mb-6">
                                <button
                                    type="button"
                                    onClick={handleConnectNewOwner}
                                    className="flex-1 py-3 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs rounded-xl border border-cyan-500/20 transition-all flex items-center justify-center gap-2 group hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                                >
                                    <Wallet size={16} className="group-hover:scale-110 transition-transform" />
                                    <span className="font-bold tracking-wide">Use External Wallet</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGenerateDemoWallet}
                                    className="flex-1 py-3 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs rounded-xl border border-indigo-500/20 transition-all flex items-center justify-center gap-2 group hover:shadow-[0_0_15px_rgba(129,140,248,0.2)]"
                                >
                                    <Wand2 size={16} className="group-hover:rotate-12 transition-transform" />
                                    <span className="font-bold tracking-wide">Generate Demo Hash</span>
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Target Wallet Address</label>
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
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">New Phone Number</label>
                                    <input
                                        name="newOwnerContact" required
                                        value={formData.newOwnerContact}
                                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono shadow-inner shadow-black/50"
                                        placeholder="Enter phone number"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {status === "error" && (
                            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <div className="relative pt-4">
                            <ParticleBurst trigger={showBurst} />
                            <AnimatedButton
                                text={status === "processing" ? "Broadcasting Transfer..." : "Confirm Sequence & Transfer"}
                                disabled={loading}
                                icon={RefreshCw}
                                className={`w-full py-4 text-lg ${status === "processing" ? "opacity-70 cursor-wait bg-slate-800" : "bg-slate-900 border-indigo-500/50 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all"}`}
                            />
                        </div>
                    </form>
                )}
            </GlassCard>
        </div>
    );
};

export default TransferOwnership;
