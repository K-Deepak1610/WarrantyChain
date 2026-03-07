import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import BackToDashboardButton from '../components/BackToDashboardButton';
import QRScanner from '../components/QRScanner';
import QRCodeDisplay from '../components/QRCodeDisplay';
import DownloadCertificate from '../components/DownloadCertificate';
import { verifyWarranty } from '../utils/blockchain';
import { generateCertificate } from '../utils/generateCertificate';
import { useWallet } from '../context/WalletContext';
import ContractAddress from '../contracts/contract-address.json';
import WarrantyArtifact from '../contracts/Warranty.json';
import { Search, CheckCircle, XCircle, QrCode, User, Calendar, Clock, MapPin, Download, Settings } from 'lucide-react';

const VerifyWarranty = () => {
    const { contract } = useWallet();
    const [productId, setProductId] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showScanner, setShowScanner] = useState(false);
    const [autoDownload, setAutoDownload] = useState(false);

    // Fallback for read-only if not connected
    const getReadOnlyContract = async () => {
        try {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                return new ethers.Contract(ContractAddress.Warranty, WarrantyArtifact.abi, provider);
            }
        } catch (e) {
            console.warn("Read-only provider failed", e);
        }
        return null;
    };

    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        if (!productId) return;

        setLoading(true);
        setError("");
        setResult(null);

        try {
            let activeContract = contract;
            if (!activeContract) {
                activeContract = await getReadOnlyContract();
            }

            if (!activeContract) {
                throw new Error("Cannot connect to blockchain. Please connect wallet.");
            }

            const data = await verifyWarranty(activeContract, productId);
            setResult(data);
        } catch (err) {
            console.error(err);
            setError("Product not found or error fetching data.");
        } finally {
            setLoading(false);
        }
    };

    const handleScan = (data) => {
        if (data) {
            setProductId(data);
            setShowScanner(false);
            setLoading(true);
            setError("");
            setResult(null);

            (async () => {
                try {
                    let activeContract = contract;
                    if (!activeContract) {
                        activeContract = await getReadOnlyContract();
                    }
                    if (!activeContract) throw new Error("No connection");

                    const res = await verifyWarranty(activeContract, data);
                    setResult(res);

                    // Auto download if enabled
                    if (autoDownload && res.isValid) {
                        setTimeout(() => {
                            generateCertificate({
                                ...res,
                                productId: data,
                                contractAddress: ContractAddress.Warranty
                            });
                        }, 1000);
                    }
                } catch (err) {
                    setError("Product not found via scan.");
                } finally {
                    setLoading(false);
                }
            })();
        }
    };

    const StatusBadge = ({ isValid, days }) => (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 
            ${isValid
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    : 'bg-red-500/10 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'}`}
        >
            {isValid ? <CheckCircle size={48} className="text-emerald-500 mb-2" /> : <XCircle size={48} className="text-red-500 mb-2" />}
            <h3 className={`text-2xl font-bold ${isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                {isValid ? "WARRANTY VALID" : "WARRANTY EXPIRED"}
            </h3>
            <p className={`text-lg mt-2 ${isValid ? 'text-emerald-200' : 'text-red-300'}`}>
                {isValid ? (
                    <span className="font-mono">{days} Days Remaining</span>
                ) : (
                    "Warranty Period Over"
                )}
            </p>
        </motion.div>
    );

    return (
        <div className="pt-24 pb-12 px-6 max-w-2xl mx-auto relative">
            <BackToDashboardButton />
            <AnimatePresence>
                {showScanner && <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
            </AnimatePresence>

            <GlassCard>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent mb-6 text-center">
                    Verify Warranty
                </h2>

                <div className="flex gap-4 mb-8">
                    <div className="relative flex-1">
                        <input
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            placeholder="Enter Product ID"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 pl-4 pr-12 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                        <button
                            onClick={() => setShowScanner(true)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                        >
                            <QrCode size={20} />
                        </button>
                    </div>
                    <AnimatedButton
                        text={loading ? "..." : "Check"}
                        onClick={handleVerify}
                        icon={Search}
                        className="bg-emerald-600 hover:bg-emerald-500"
                    />
                </div>

                <div className="flex items-center justify-between mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 text-slate-300">
                        <Settings size={18} className="text-emerald-400" />
                        <span className="text-sm font-medium">Auto-Download Certificate</span>
                    </div>
                    <button
                        onClick={() => setAutoDownload(!autoDownload)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none 
                        ${autoDownload ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                        <span
                            className={`${autoDownload ? 'translate-x-6' : 'translate-x-1'}
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                    </button>
                </div>

                {error && (
                    <div className="text-red-400 text-center mb-4 p-3 bg-red-900/20 rounded-xl border border-red-900/50">
                        {error}
                    </div>
                )}

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <StatusBadge isValid={result.isValid} days={result.daysRemaining} />

                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
                            <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2 mb-4">Product Details</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-slate-400 text-sm mb-1">Product Name</p>
                                    <p className="text-white font-medium text-lg">{result.productName}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm mb-1">Product ID</p>
                                    <p className="text-white font-mono">{productId}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-emerald-400" size={20} />
                                    <div>
                                        <p className="text-slate-400 text-xs">Start Date</p>
                                        <p className="text-white text-sm">{new Date(result.warrantyStart * 1000).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="text-red-400" size={20} />
                                    <div>
                                        <p className="text-slate-400 text-xs">End Date</p>
                                        <p className="text-white text-sm">{new Date(result.warrantyEnd * 1000).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-500/5 rounded-2xl p-6 border border-blue-500/10 space-y-3">
                            <h3 className="text-lg font-bold text-blue-400 border-b border-blue-500/10 pb-2 mb-4 flex items-center gap-2">
                                <User size={20} /> Owner Information
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Name</span>
                                    <span className="text-white font-medium">{result.ownerName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Contact</span>
                                    <span className="text-white">{result.ownerContact}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-slate-400 text-sm">Wallet Address</span>
                                    <span className="font-mono text-xs text-blue-300 bg-blue-900/30 px-3 py-2 rounded-lg break-all">
                                        {result.ownerAddress}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col items-center gap-4">
                            <QRCodeDisplay
                                value={`${window.location.origin}/verify/${productId}`}
                                title="Verification QR"
                            />

                            <button
                                onClick={() => generateCertificate({
                                    ...result,
                                    productId,
                                    contractAddress: ContractAddress.Warranty
                                })}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 mt-4"
                            >
                                <Download size={20} />
                                Download Official Certificate
                            </button>
                        </div>
                    </motion.div>
                )}
            </GlassCard>
        </div>
    );
};

export default VerifyWarranty;
