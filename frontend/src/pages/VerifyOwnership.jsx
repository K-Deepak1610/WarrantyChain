import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import BackToDashboardButton from '../components/BackToDashboardButton';
import QRScanner from '../components/QRScanner';
import QRCodeDisplay from '../components/QRCodeDisplay';
import DownloadCertificate from '../components/DownloadCertificate';
import { verifyOwnership, verifyWarranty, shortenAddress } from '../utils/blockchain';
import { generateCertificate } from '../utils/generateCertificate';
import { useWallet } from '../context/WalletContext';
import ContractAddress from '../contracts/contract-address.json';
import { Search, UserCheck, History, QrCode, ArrowDown, Download, Settings } from 'lucide-react';

const VerifyOwnership = () => {
    const { contract } = useWallet();
    const [productId, setProductId] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showScanner, setShowScanner] = useState(false);
    const [autoDownload, setAutoDownload] = useState(false);

    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const [ownershipData, warrantyData] = await Promise.all([
                verifyOwnership(contract, productId),
                verifyWarranty(contract, productId).catch(e => ({})) // Ignore error if warranty fetch fails, primarily for product name
            ]);

            setResult({
                ...ownershipData,
                productName: warrantyData?.productName || "Unknown Product"
            });
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

            Promise.all([
                verifyOwnership(contract, data),
                verifyWarranty(contract, data).catch(e => ({}))
            ])
                .then(([ownershipData, warrantyData]) => {
                    const fullData = {
                        ...ownershipData,
                        ...warrantyData,
                        productName: warrantyData?.productName || "Unknown Product"
                    };
                    setResult(fullData);

                    // Auto download if enabled
                    if (autoDownload) {
                        setTimeout(() => {
                            generateCertificate({
                                ...fullData,
                                productId: data,
                                contractAddress: ContractAddress.Warranty
                            });
                        }, 1000);
                    }
                })
                .catch(err => {
                    console.error(err);
                    setError("Product not found.");
                })
                .finally(() => setLoading(false));
        }
    };

    return (
        <div className="pt-24 pb-12 px-6 max-w-3xl mx-auto relative">
            <BackToDashboardButton />
            <AnimatePresence>
                {showScanner && <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
            </AnimatePresence>

            <GlassCard>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-6 text-center">
                    Ownership History
                </h2>

                <div className="flex gap-4 mb-8 max-w-xl mx-auto">
                    <div className="relative flex-1">
                        <input
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            placeholder="Enter Product ID"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 pl-4 pr-12 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        <button
                            onClick={() => setShowScanner(true)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                        >
                            <QrCode size={20} />
                        </button>
                    </div>
                    <AnimatedButton
                        text={loading ? "..." : "Verify"}
                        onClick={handleVerify}
                        icon={Search}
                        className="bg-purple-600 hover:bg-purple-500"
                    />
                </div>

                <div className="flex items-center justify-between mb-8 max-w-xl mx-auto p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 text-slate-300">
                        <Settings size={18} className="text-purple-400" />
                        <span className="text-sm font-medium">Auto-Download Certificate</span>
                    </div>
                    <button
                        onClick={() => setAutoDownload(!autoDownload)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none 
                        ${autoDownload ? 'bg-purple-500' : 'bg-slate-700'}`}
                    >
                        <span
                            className={`${autoDownload ? 'translate-x-6' : 'translate-x-1'}
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                    </button>
                </div>

                {error && <div className="text-red-400 text-center mb-4">{error}</div>}

                {result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        {/* Timeline */}
                        <div className="relative pl-8 border-l-2 border-purple-500/20 space-y-12">
                            {result.history.map((record, index) => (
                                <div key={index} className="relative">
                                    {/* Timeline Dot */}
                                    <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full border-4 border-slate-950 flex items-center justify-center
                                        ${index === result.history.length - 1 ? 'bg-purple-500' : 'bg-slate-700'}`}>
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>

                                    <div className={`bg-slate-900/50 p-6 rounded-2xl border ${index === result.history.length - 1 ? 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'border-white/5'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className={`text-lg font-bold ${index === result.history.length - 1 ? 'text-purple-400' : 'text-slate-300'}`}>
                                                    {record.ownerName}
                                                </h3>
                                                <p className="text-sm text-slate-500">{record.ownerContact}</p>
                                            </div>
                                            {index === result.history.length - 1 && (
                                                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold">
                                                    Current Owner
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <div className="font-mono text-slate-400 bg-black/20 px-2 py-1 rounded inline-block">
                                                {record.ownerAddress}
                                            </div>
                                            <div className="text-slate-500">
                                                {new Date(record.transferDate * 1000).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    {index < result.history.length - 1 && (
                                        <div className="absolute left-[-21px] bottom-[-30px] text-purple-500/30">
                                            <ArrowDown size={20} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 flex flex-col items-center gap-4 border-t border-white/5 mt-8">
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

export default VerifyOwnership;
