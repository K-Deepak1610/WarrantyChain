import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import BackToDashboardButton from '../components/BackToDashboardButton';
import ParticleBurst from '../components/ParticleBurst';
import { registerProduct } from '../utils/blockchain';
import { useWallet } from '../context/WalletContext';
import { Plus, AlertCircle, Wand2 } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTransaction } from '../hooks/useTransaction';
import TransactionModal from '../components/TransactionModal';

const Register = () => {
    usePageTitle('Register Product');
    const { contract, isConnected, connectWallet, account, contractError } = useWallet();
    const { stage, status, error, txHash, metadata, execute, reset } = useTransaction();
    
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        warrantyStart: "",
        warrantyEnd: "",
        ownerName: "",
        ownerContact: "",
        serialNumber: "",
        specifications: ""
    });
    const [showBurst, setShowBurst] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!contract) {
            alert("Smart contract not initialized. Please connect your wallet.");
            return;
        }

        try {
            // Convert dates to timestamps
            const start = new Date(formData.warrantyStart).getTime() / 1000;
            const end = new Date(formData.warrantyEnd).getTime() / 1000;
            
            if (end <= start) {
                alert("Warranty end date must be after start date.");
                return;
            }

            const productDetails = {
                ...formData,
                warrantyStart: start,
                warrantyEnd: end
            };

            // Process transaction through our professional hook
            await execute(
                registerProduct(contract, productDetails), 
                {
                    action: "Registered",
                    productName: formData.name,
                    productId: formData.id,
                    ownerName: formData.ownerName,
                    walletAddress: account
                }
            );

            setShowBurst(true);
            setTimeout(() => setShowBurst(false), 2000);
            
        } catch (error) {
            console.error("Registration flow failed:", error);
        }
    };

    const handleReset = () => {
        reset();
        if (stage === 'success') {
            setFormData({
                id: "", name: "", warrantyStart: "", warrantyEnd: "", ownerName: "", ownerContact: "", serialNumber: "", specifications: ""
            });
        }
    };

    return (
        <div className="pt-24 pb-12 px-6 max-w-4xl mx-auto relative">
            <div className="mb-8">
                <BackToDashboardButton />
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
            {contractError && (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-sm flex items-center justify-center gap-2">
                    <AlertCircle size={16} />
                    {contractError}
                </div>
            )}
            <GlassCard>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6 text-center">
                        Register Your Product Warranty
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto mt-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Serial Number / License Key</label>
                                <div className="relative group">
                                    <input
                                        name="serialNumber" required
                                        value={formData.serialNumber}
                                        className="w-full bg-slate-900/80 border border-indigo-500/30 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                                        placeholder="e.g. LIC-XXXX-XXXX"
                                        onChange={handleChange}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400/50">
                                        <Wand2 size={16} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Product ID</label>
                                <input
                                    name="id" required
                                    value={formData.id}
                                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono shadow-inner shadow-black/50"
                                    placeholder="e.g. SN-12345678"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Product Name</label>
                                <input
                                    name="name" required
                                    value={formData.name}
                                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono shadow-inner shadow-black/50"
                                    placeholder="e.g. iPhone 17 Pro, Dell Laptop"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Warranty Register</label>
                                    <input
                                        name="warrantyStart" type="date" required
                                        value={formData.warrantyStart}
                                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono shadow-inner shadow-black/50"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Warranty Expiry</label>
                                    <input
                                        name="warrantyEnd" type="date" required
                                        value={formData.warrantyEnd}
                                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono shadow-inner shadow-black/50"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Owner Name</label>
                                <input
                                    name="ownerName" required
                                    value={formData.ownerName}
                                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono shadow-inner shadow-black/50"
                                    placeholder="Enter the owner name"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Owner Contact</label>
                                <input
                                    name="ownerContact" required
                                    value={formData.ownerContact}
                                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono shadow-inner shadow-black/50"
                                    placeholder="Enter contact number"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Specifications (Color, Model, etc.)</label>
                                <textarea
                                    name="specifications"
                                    value={formData.specifications}
                                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono shadow-inner shadow-black/50"
                                    placeholder="e.g. Color: Space Gray, Model: M3 Pro"
                                    onChange={handleChange}
                                    rows="2"
                                />
                            </div>

                                {!isConnected ? (
                                    <AnimatedButton
                                        text="Connect Wallet to Register"
                                        onClick={(e) => { e.preventDefault(); connectWallet(); }}
                                        icon={AlertCircle}
                                        className="w-full py-4 text-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                                        type="button"
                                    />
                                ) : (
                                    <AnimatedButton
                                        text={stage === 'processing' ? "Broadcasting..." : stage === 'waiting' ? "Awaiting Wallet..." : "Register Warranty"}
                                        disabled={stage !== 'idle'}
                                        icon={Plus}
                                        className={`w-full py-4 text-lg ${stage !== 'idle' ? 'bg-slate-700 cursor-not-allowed' : 'bg-slate-900 border-indigo-500/50 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all'}`}
                                        type="submit"
                                    />
                                )}
                        </form>
                    </GlassCard>
            </motion.div>
        </div>
    );
};

export default Register;
