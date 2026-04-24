import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import BackToDashboardButton from '../components/BackToDashboardButton';
import ParticleBurst from '../components/ParticleBurst';
import { registerProduct } from '../utils/blockchain';
import { useWallet } from '../context/WalletContext';
import { Plus, AlertCircle, Wand2, Trash2, PlusCircle } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTransaction } from '../hooks/useTransaction';
import TransactionModal from '../components/TransactionModal';

const PRESETS = {
    Smartphone: [
        { name: "Color", placeholder: "e.g. Space Gray" },
        { name: "Storage", placeholder: "e.g. 256GB" },
        { name: "RAM", placeholder: "e.g. 12GB" }
    ],
    Laptop: [
        { name: "Color", placeholder: "e.g. Midnight Blue" },
        { name: "RAM", placeholder: "e.g. 16GB" },
        { name: "Storage", placeholder: "e.g. 1TB SSD" },
        { name: "Processor", placeholder: "e.g. M3 Max" }
    ],
    "Smart TV": [
        { name: "Screen Size", placeholder: "e.g. 55 Inch" },
        { name: "Resolution", placeholder: "e.g. 4K UHD" },
        { name: "Panel Type", placeholder: "e.g. OLED" }
    ],
    "Smart Watch": [
        { name: "Strap Type", placeholder: "e.g. Sport Band" },
        { name: "Battery Life", placeholder: "e.g. 48 Hours" },
        { name: "Connectivity", placeholder: "e.g. GPS + Cellular" }
    ],
    Appliance: [
        { name: "Capacity", placeholder: "e.g. 500L" },
        { name: "Power Rating", placeholder: "e.g. 5 Star" },
        { name: "Model", placeholder: "e.g. Series 9" }
    ],
    Other: []
};

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
    const [dynamicSpecs, setDynamicSpecs] = useState([{ name: "", value: "", placeholder: "Value (e.g. Space Gray)" }]);
    const [productType, setProductType] = useState("Other");
    const [showBurst, setShowBurst] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSpecChange = (index, field, value) => {
        const newSpecs = [...dynamicSpecs];
        newSpecs[index][field] = value;
        setDynamicSpecs(newSpecs);
    };

    const addSpecField = () => {
        setDynamicSpecs([...dynamicSpecs, { name: "", value: "", placeholder: "Value (e.g. Space Gray)" }]);
    };

    const removeSpecField = (index) => {
        if (dynamicSpecs.length > 1) {
            setDynamicSpecs(dynamicSpecs.filter((_, i) => i !== index));
        } else {
            setDynamicSpecs([{ name: "", value: "", placeholder: "Value (e.g. Space Gray)" }]);
        }
    };

    const handleProductTypeChange = (e) => {
        const type = e.target.value;
        setProductType(type);
        
        if (type === "Other") {
            setDynamicSpecs([{ name: "", value: "", placeholder: "Value (e.g. Space Gray)" }]);
        } else {
            const fields = PRESETS[type].map(item => ({ 
                name: item.name, 
                value: "", 
                placeholder: `e.g. ${item.placeholder.replace('e.g. ', '')}`
            }));
            setDynamicSpecs(fields);
        }
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

            // Construct dynamic specifications JSON
            const specsObject = {};
            dynamicSpecs.forEach(spec => {
                if (spec.name.trim() && spec.value.trim()) {
                    specsObject[spec.name.trim()] = spec.value.trim();
                }
            });

            const productDetails = {
                ...formData,
                warrantyStart: start,
                warrantyEnd: end,
                specifications: JSON.stringify({ 
                    category: productType,
                    specs: specsObject 
                })
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
            setDynamicSpecs([{ name: "", value: "", placeholder: "Value (e.g. Space Gray)" }]);
            setProductType("Other");
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

                            <div className="pt-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 text-cyan-400/80">Product Type</label>
                                <select
                                    value={productType}
                                    onChange={handleProductTypeChange}
                                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono appearance-none"
                                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236366f1\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
                                >
                                    {Object.keys(PRESETS).map(type => (
                                        <option key={type} value={type} className="bg-slate-900 text-white">{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Product Specifications</label>
                                    <button 
                                        type="button" 
                                        onClick={addSpecField}
                                        className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 uppercase transition-colors"
                                    >
                                        <PlusCircle size={12} /> Add Specification
                                    </button>
                                </div>
                                
                                <div className="space-y-3">
                                    {dynamicSpecs.map((spec, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-3 group">
                                            <div className="col-span-5">
                                                <input
                                                    placeholder="Spec Name (e.g. Color)"
                                                    value={spec.name}
                                                    onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                                                    className="w-full bg-slate-950/40 border border-white/5 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-cyan-400 transition-all font-mono"
                                                />
                                            </div>
                                            <div className="col-span-6">
                                                <input
                                                    placeholder={spec.placeholder || "Value (e.g. Space Gray)"}
                                                    value={spec.value}
                                                    onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                                    className="w-full bg-slate-950/40 border border-white/5 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-cyan-400 transition-all font-mono"
                                                />
                                            </div>
                                            <div className="col-span-1 flex items-center justify-center">
                                                <button 
                                                    type="button"
                                                    onClick={() => removeSpecField(index)}
                                                    className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
