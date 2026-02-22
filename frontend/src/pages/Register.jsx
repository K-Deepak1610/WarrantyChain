import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import BackToDashboardButton from '../components/BackToDashboardButton';
import { registerProduct } from '../utils/blockchain';
import { useWallet } from '../context/WalletContext';
import { Plus, CheckCircle } from 'lucide-react';

const Register = () => {
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Convert dates to timestamps
            const start = new Date(formData.warrantyStart).getTime() / 1000;
            const end = new Date(formData.warrantyEnd).getTime() / 1000;

            const productDetails = {
                ...formData,
                warrantyStart: start,
                warrantyEnd: end
            };

            await registerProduct(contract, productDetails);
            setSuccess(true);
        } catch (error) {
            console.error(error);
            alert("Registration failed. Ensure wallet is connected.");
        } finally {
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
                        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Product ID</label>
                                <input
                                    name="id" required
                                    value={formData.id}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="e.g. SN-12345678"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Product Name</label>
                                <input
                                    name="name" required
                                    value={formData.name}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="e.g. Model X 2024"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Warranty Start</label>
                                    <input
                                        name="warrantyStart" type="date" required
                                        value={formData.warrantyStart}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Warranty End</label>
                                    <input
                                        name="warrantyEnd" type="date" required
                                        value={formData.warrantyEnd}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Owner Name</label>
                                <input
                                    name="ownerName" required
                                    value={formData.ownerName}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Full Name"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Owner Contact</label>
                                <input
                                    name="ownerContact" required
                                    value={formData.ownerContact}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Email or Phone"
                                    onChange={handleChange}
                                />
                            </div>

                            <AnimatedButton
                                text={loading ? "Registering..." : "Register Product"}
                                disabled={loading}
                                icon={Plus}
                                className="w-full mt-4"
                            />
                        </form>
                    )}
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default Register;
