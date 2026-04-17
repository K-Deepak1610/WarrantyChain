import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import BackToDashboardButton from '../components/BackToDashboardButton';
import ParticleBurst from '../components/ParticleBurst';
import { registerProduct } from '../utils/blockchain';
import { useWallet } from '../context/WalletContext';
import { Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

const Register = () => {
    usePageTitle('Register Product');
    const { contract } = useWallet();
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        warrantyStart: "",
        warrantyEnd: "",
        ownerName: "",
        ownerContact: ""
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showBurst, setShowBurst] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        if (!contract) {
            setErrorMsg("Smart contract not initialized. Please connect your wallet.");
            setLoading(false);
            return;
        }

        try {
            // Convert dates to timestamps
            const start = new Date(formData.warrantyStart).getTime() / 1000;
            const end = new Date(formData.warrantyEnd).getTime() / 1000;
            
            if (end <= start) {
                throw new Error("Warranty end date must be after start date.");
            }

            if (!window.ethereum) {
                throw new Error("MetaMask is required to register a product.");
            }

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (!accounts || accounts.length === 0) {
                throw new Error("No wallet account connected.");
            }
            const currentAddress = accounts[0];

            const productDetails = {
                ...formData,
                warrantyStart: start,
                warrantyEnd: end,
                history: [{
                    ownerName: formData.ownerName,
                    ownerContact: formData.ownerContact,
                    ownerAddress: currentAddress,
                    transferDate: start
                }]
            };

            await registerProduct(contract, productDetails);
            
            // --- DATA PERSISTENCE FALLBACK ---
            localStorage.setItem(`product_${productDetails.id}`, JSON.stringify(productDetails));
            
            setShowBurst(true);
            setTimeout(() => {
                setSuccess(true);
                setShowBurst(false);
                setLoading(false); // ✅ Fixed: was missing on success path
            }, 800);
        } catch (error) {
            console.error(error);
            setErrorMsg(error.reason || error.message || "Registration failed. Ensure wallet is connected.");
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-12 px-6 max-w-4xl mx-auto relative">
            <BackToDashboardButton />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <GlassCard>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6 text-center">
                        Register New Product
                    </h2>

                    {!success && errorMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm mb-4"
                        >
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span>{errorMsg}</span>
                        </motion.div>
                    )}

                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12"
                        >
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 mb-6">
                                <CheckCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Registration Successful!</h3>
                            <p className="text-slate-400 mb-8">
                                Product has been permanently recorded on the blockchain.
                            </p>
                            <AnimatedButton
                                text="Register Another"
                                onClick={() => {
                                    setSuccess(false);
                                    setFormData({
                                        id: "", name: "", warrantyStart: "", warrantyEnd: "", ownerName: "", ownerContact: ""
                                    });
                                }}
                                className="mx-auto"
                            />
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto mt-4">
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
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Warranty Start</label>
                                    <input
                                        name="warrantyStart" type="date" required
                                        value={formData.warrantyStart}
                                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono shadow-inner shadow-black/50"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Warranty End</label>
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
                                    placeholder="Enter the name"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Phone Number</label>
                                <input
                                    name="ownerContact" required
                                    value={formData.ownerContact}
                                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono shadow-inner shadow-black/50"
                                    placeholder="Enter the phone number"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="relative pt-6">
                                <ParticleBurst trigger={showBurst} />
                                <AnimatedButton
                                    text={loading ? "Registering Product..." : "Register Product"}
                                    disabled={loading}
                                    icon={Plus}
                                    className="w-full py-4 text-lg bg-slate-900"
                                />
                            </div>
                        </form>
                    )}
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default Register;
