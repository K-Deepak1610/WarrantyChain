import { useState } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import BackToDashboardButton from '../components/BackToDashboardButton';
import { transferOwnership, verifyOwnership } from '../utils/blockchain';
import { useWallet } from '../context/WalletContext';
import { RefreshCw, ArrowRight, CheckCircle, AlertCircle, Wand2, Wallet, FileText } from 'lucide-react';

const TransferOwnership = () => {
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerateDemoWallet = () => {
        const wallet = ethers.Wallet.createRandom();
        setFormData({ ...formData, newOwner: wallet.address });
        alert(`Demo Wallet Generated!\n\nAddress: ${wallet.address}\nPrivate Key: ${wallet.privateKey}\n\nSAVE THIS if you want to use this account later!`);
    };

    const handleConnectNewOwner = async () => {
        if (window.ethereum) {
            try {
                // Warning: Requesting accounts here might conflict if already connected with another account.
                // Works best if user switches account in metamask then clicks this.
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length > 0) {
                    setFormData({ ...formData, newOwner: accounts[0] });
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                const details = await verifyOwnership(contract, formData.productId);
                setTransferredDetails(details);
                setStatus("success");
            }, 2000);

        } catch (error) {
            console.error(error);
            setStatus("error");
            setErrorMsg(error.reason || error.message || "Transfer failed. Ensure you are the owner.");
        } finally {
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
                                    <div className="col-span-2">
                                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">New Wallet Address</p>
                                        <p className="font-mono text-orange-300 break-all bg-orange-900/10 px-2 py-1 rounded">
                                            {transferredDetails.ownerAddress}
                                        </p>
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
                            <label className="block text-sm text-slate-400 mb-1">Product ID</label>
                            <input
                                name="productId" required
                                value={formData.productId}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                onChange={handleChange}
                                placeholder="Product ID to transfer"
                            />
                        </div>

                        <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/10 my-6">
                            <h4 className="text-orange-400 font-semibold mb-4 flex items-center gap-2">
                                <ArrowRight size={16} /> New Owner Details
                            </h4>

                            <div className="flex gap-2 mb-4">
                                <button
                                    type="button"
                                    onClick={handleConnectNewOwner}
                                    className="flex-1 py-3 px-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs rounded-lg border border-blue-500/20 transition-colors flex items-center justify-center gap-2 group"
                                >
                                    <Wallet size={16} className="group-hover:scale-110 transition-transform" />
                                    <span>Select From Wallet</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGenerateDemoWallet}
                                    className="flex-1 py-3 px-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs rounded-lg border border-purple-500/20 transition-colors flex items-center justify-center gap-2 group"
                                >
                                    <Wand2 size={16} className="group-hover:rotate-12 transition-transform" />
                                    <span>Generate Demo</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">New Owner Wallet Address</label>
                                    <input
                                        name="newOwner" required
                                        value={formData.newOwner}
                                        placeholder="0x..."
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 transition-colors font-mono"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">New Owner Name</label>
                                    <input
                                        name="newOwnerName" required
                                        value={formData.newOwnerName}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">New Owner Contact</label>
                                    <input
                                        name="newOwnerContact" required
                                        value={formData.newOwnerContact}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {status === "error" && (
                            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-2">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <AnimatedButton
                            text={status === "processing" ? "Processing Transfer..." : "Confirm & Transfer Ownership"}
                            disabled={loading}
                            icon={RefreshCw}
                            className={`w-full ${status === "processing" ? "opacity-70 cursor-wait" : "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400"}`}
                        />
                    </form>
                )}
            </GlassCard>
        </div>
    );
};

export default TransferOwnership;
