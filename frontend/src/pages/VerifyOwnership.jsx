import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import BackToDashboardButton from '../components/BackToDashboardButton';
import QRScanner from '../components/QRScanner';
import QRCodeDisplay from '../components/QRCodeDisplay';
import DownloadCertificate from '../components/DownloadCertificate';
import HashDisplay from '../components/HashDisplay';
import { verifyOwnership, verifyWarranty } from '../utils/blockchain';
import { generateCertificate } from '../utils/generateCertificate';
import { useWallet } from '../context/WalletContext';
import ContractAddress from '../contracts/contract-address.json';
import { Search, UserCheck, History, QrCode, Download, Settings, ShieldCheck, ShieldAlert, ShieldX, Check, X, ArrowRight, UserX, Crown } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

const VerifyOwnership = () => {
    usePageTitle('Verify Ownership');
    const { contract, connectWallet } = useWallet();
    const [productId, setProductId] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showScanner, setShowScanner] = useState(false);
    const [autoDownload, setAutoDownload] = useState(false);

    const executeVerify = async (targetId) => {
        setLoading(true);
        setError("");
        setResult(null);

        // If no contract (no wallet connected), go straight to localStorage fallback
        if (!contract) {
            const backup = localStorage.getItem(`product_${targetId}`);
            if (backup) {
                try {
                    const parsed = JSON.parse(backup);
                    const history = parsed.history && parsed.history.length > 0 ? parsed.history : [{
                        ownerName: parsed.ownerName,
                        ownerContact: parsed.ownerContact,
                        ownerAddress: parsed.ownerAddress || null,
                        transferDate: parsed.warrantyStart
                    }];
                    setResult({
                        ...parsed,
                        productId: parsed.id,
                        productName: parsed.name,
                        history: history,
                        isFallback: true
                    });
                } catch (e) {
                    setError("Product not found. Connect wallet for live verification.");
                }
            } else {
                setError("No wallet connected and product not in local cache.");
            }
            setLoading(false);
            return;
        }

        try {
            const [ownershipData, warrantyData] = await Promise.all([
                verifyOwnership(contract, targetId),
                verifyWarranty(contract, targetId).catch(e => ({}))
            ]);

            setResult({
                ...ownershipData,
                ...warrantyData,
                productId: targetId,
                productName: warrantyData?.productName || "Unknown Product",
                isFallback: false
            });

            if (autoDownload) {
                setTimeout(() => {
                    generateCertificate({
                        ...ownershipData,
                        ...warrantyData,
                        productId: targetId,
                        contractAddress: ContractAddress.Warranty
                    });
                }, 1000);
            }
        } catch (err) {
            console.warn("Blockchain read failed. Checking local backup...");
            const backup = localStorage.getItem(`product_${targetId}`);
            if (backup) {
                const parsed = JSON.parse(backup);
                const history = parsed.history && parsed.history.length > 0 ? parsed.history : [{
                    ownerName: parsed.ownerName,
                    ownerContact: parsed.ownerContact,
                    ownerAddress: parsed.ownerAddress || parsed.owner || parsed.currentOwner || null,
                    transferDate: parsed.warrantyStart
                }];
                setResult({
                    ...parsed,
                    productId: parsed.id,
                    productName: parsed.name,
                    history: history,
                    isFallback: true
                });
            } else {
                setError("Product not found on blockchain or local backup.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = (e) => {
        if (e) e.preventDefault();
        executeVerify(productId);
    };

    const handleScan = (data) => {
        if (data) {
            setProductId(data);
            setShowScanner(false);
            executeVerify(data);
        }
    };

    // Authenticity Signals
    const renderAuthenticitySection = (data) => {
        const isOnChain = !data.isFallback;
        const ownershipChainIntact = data.history && data.history.length > 0;
        const registrationBlockExists = data.history && data.history.length > 0 && !!data.history[0].transferDate;
        const warrantyNotExpired = data.warrantyEnd ? (data.warrantyEnd * 1000 > Date.now()) : false;

        let verdict = 'FAKE';
        if (ownershipChainIntact && registrationBlockExists) {
            verdict = isOnChain ? 'ORIGINAL' : 'CACHED';
        }

        const SignalRow = ({ label, passed }) => (
            <div className={`flex items-center gap-2 text-xs font-mono uppercase tracking-wider ${passed ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
                {passed ? <Check size={14} /> : <X size={14} />}
                <span>{label}</span>
            </div>
        );

        if (verdict === 'ORIGINAL') {
            return (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-6 items-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <div className="p-4 bg-emerald-500/20 rounded-full animate-pulse border border-emerald-500/50 relative">
                        <div className="absolute inset-0 rounded-full blur-md bg-emerald-500/20" />
                        <ShieldCheck size={36} className="text-emerald-400 relative z-10" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-emerald-400 font-bold font-mono tracking-widest text-lg mb-1">VERIFIED ORIGINAL</h3>
                        <p className="text-emerald-400/70 text-sm mb-4">Product authenticated on-chain. Ownership chain intact.</p>
                        <div className="grid grid-cols-2 gap-2">
                            <SignalRow label="On-Chain Source" passed={isOnChain} />
                            <SignalRow label="Ownership Chain" passed={ownershipChainIntact} />
                            <SignalRow label="Registration Block" passed={registrationBlockExists} />
                            <SignalRow label="Warranty Status" passed={warrantyNotExpired} />
                        </div>
                    </div>
                </div>
            );
        }

        if (verdict === 'CACHED') {
            return (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-6 items-center shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                    <div className="p-4 bg-amber-500/20 rounded-full border border-amber-500/50">
                        <ShieldAlert size={36} className="text-amber-400" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-amber-400 font-bold font-mono tracking-widest text-lg mb-1">CACHED DATA — UNVERIFIED LIVE</h3>
                        <p className="text-amber-400/70 text-sm mb-4">Data loaded from local cache. Reconnect wallet to verify on-chain.</p>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <SignalRow label="On-Chain Source" passed={isOnChain} />
                            <SignalRow label="Ownership Chain" passed={ownershipChainIntact} />
                            <SignalRow label="Registration Block" passed={registrationBlockExists} />
                            <SignalRow label="Warranty Status" passed={warrantyNotExpired} />
                        </div>
                        <button 
                            onClick={connectWallet}
                            className="bg-amber-950/50 hover:bg-amber-900/50 border border-amber-500/50 text-amber-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                        >
                            Verify Live Now
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-6 items-center shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                <div className="p-4 bg-red-500/20 rounded-full border border-red-500/50">
                    <ShieldX size={36} className="text-red-400" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-red-400 font-bold font-mono tracking-widest text-lg mb-1">⚠ AUTHENTICITY UNCONFIRMED</h3>
                    <p className="text-red-400/70 text-sm mb-4">Ownership chain has gaps or registration data is missing.</p>
                    <div className="grid grid-cols-2 gap-2">
                        <SignalRow label="On-Chain Source" passed={isOnChain} />
                        <SignalRow label="Ownership Chain" passed={ownershipChainIntact} />
                        <SignalRow label="Registration Block" passed={registrationBlockExists} />
                        <SignalRow label="Warranty Status" passed={warrantyNotExpired} />
                    </div>
                </div>
            </div>
        );
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
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 pl-4 pr-12 text-white focus:outline-none focus:border-purple-500 transition-colors shadow-inner shadow-black/50"
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
                        ${autoDownload ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-slate-700'}`}
                    >
                        <span
                            className={`${autoDownload ? 'translate-x-6' : 'translate-x-1'}
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-1`}
                        />
                    </button>
                </div>

                {error && <div className="text-red-400 text-center mb-4 bg-red-900/20 border border-red-500/20 p-4 rounded-xl">{error}</div>}

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {/* Authenticity Engine Dashboard */}
                        {renderAuthenticitySection(result)}

                        {/* Timeline */}
                        <motion.div 
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.2 } }
                            }}
                            className="relative pl-[3.25rem] space-y-4 py-4"
                        >
                            {/* SVG Animated Connecting Line */}
                            <svg className="absolute top-0 bottom-0 left-[23px] w-1 h-full z-0 overflow-visible" preserveAspectRatio="none">
                                <motion.line 
                                    x1="0" y1="0" x2="0" y2="100%" 
                                    stroke="url(#neonGradient)" 
                                    strokeWidth="2"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                />
                                <defs>
                                    <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#34d399" stopOpacity="0.8" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            {result.history.map((record, index) => {
                                const isCurrent = index === result.history.length - 1;
                                
                                // Strict fallbacks for missing ownerAddresses in local cache
                                let resolvedAddress = record.ownerAddress;
                                if (!resolvedAddress && isCurrent) {
                                    resolvedAddress = result.ownerAddress || result.owner || result.currentOwner || null;
                                }

                                // Timeline connection visualizer (between cards)
                                const isRapidTransfer = index > 0 && (record.transferDate - result.history[index - 1].transferDate) < 60;

                                return (
                                <motion.div 
                                    key={index} 
                                    variants={{
                                        hidden: { opacity: 0, x: -20 },
                                        visible: { opacity: 1, x: 0 }
                                    }}
                                    className="relative z-10 space-y-4"
                                >
                                    {/* Timeline Connector between previous and current */}
                                    {index > 0 && (
                                        <div className="-ml-8 py-2 flex items-center gap-4">
                                            <div className="w-16 h-px bg-white/20 relative">
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 border-t-[4px] border-b-[4px] border-l-[6px] border-y-transparent border-l-white/40" />
                                            </div>
                                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-2">
                                                Transferred <ArrowRight size={10} /> 
                                                <span className="font-mono text-slate-400">{resolvedAddress ? resolvedAddress.slice(0, 10)+'...' : 'Unknown Wallet'}</span>
                                            </div>
                                            {isRapidTransfer && (
                                                <div className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1">
                                                    ⚡ Rapid Transfer
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="relative">
                                        {/* Timeline Dot */}
                                        <div className={`absolute -left-[41px] top-6 w-5 h-5 rounded-full border-[3px] border-slate-950 flex items-center justify-center 
                                            ${isCurrent ? 'bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-amber-500 opacity-60 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}>
                                        </div>

                                        <div className={`bg-slate-900/80 p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-1 
                                            ${isCurrent ? 'border-emerald-500/50 shadow-[0_10px_30px_rgba(16,185,129,0.15)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.2)]' : 'border-amber-500/20 hover:border-amber-500/40 hover:shadow-[0_10px_30px_rgba(245,158,11,0.1)]'}`}>
                                            
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl ${isCurrent ? 'bg-emerald-500/20' : 'bg-amber-500/10'}`}>
                                                        {isCurrent ? <Crown size={20} className="text-emerald-400" /> : <UserX size={20} className="text-amber-500/60" />}
                                                    </div>
                                                    <div>
                                                        <h3 className={`text-xl font-bold ${isCurrent ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                            {record.ownerName}
                                                        </h3>
                                                        <p className="text-sm text-slate-500 mt-1">{record.ownerContact}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {isCurrent ? (
                                                        <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                                            Current Owner
                                                        </span>
                                                    ) : (
                                                        <span className="bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[10px] font-mono tracking-widest px-3 py-1 rounded-full opacity-90">
                                                            Previous Owner
                                                        </span>
                                                    )}
                                                    
                                                    {/* Warranty Status Pill for Current Owner */}
                                                    {isCurrent && (
                                                        <>
                                                            {result.warrantyEnd ? (
                                                                (result.warrantyEnd * 1000 > Date.now()) 
                                                                ? <span className="bg-emerald-950/40 border border-emerald-900 text-emerald-400/80 text-[9px] uppercase px-2 py-0.5 rounded font-bold">✓ WARRANTY ACTIVE — expires {new Date(result.warrantyEnd * 1000).toLocaleDateString()}</span>
                                                                : <span className="bg-red-950/40 border border-red-900 text-red-400/80 text-[9px] uppercase px-2 py-0.5 rounded font-bold">✗ WARRANTY EXPIRED — expired {new Date(result.warrantyEnd * 1000).toLocaleDateString()}</span>
                                                            ) : (
                                                                <span className="bg-slate-800 border border-slate-700 text-slate-400 text-[9px] uppercase px-2 py-0.5 rounded font-bold">Warranty Period Unknown</span>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-sm mt-6 border-t border-white/5 pt-4">
                                                <div className="flex flex-col flex-1 max-w-[60%] mr-4">
                                                    {resolvedAddress ? (
                                                        <HashDisplay 
                                                            label="Wallet Identity" 
                                                            value={resolvedAddress} 
                                                            isBackup={result.isFallback}
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Wallet Identity</span>
                                                            <span className="text-slate-500 italic text-[11px] bg-slate-900/50 px-3 py-2 rounded-xl border border-white/5 w-fit">Not recorded</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end shrink-0">
                                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Timestamp</span>
                                                    <div className="text-slate-300 font-mono text-xs bg-white/5 px-3 py-2 rounded-xl border border-white/5 whitespace-nowrap">
                                                        {record.transferDate ? new Date(record.transferDate * 1000).toLocaleString() : 'Unknown Time'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )})}
                        </motion.div>

                        <div className="pt-12 flex flex-col items-center gap-6 border-t border-white/5 mt-8">
                            <QRCodeDisplay value={`${window.location.origin}/verify/${productId}`} title="Verification QR" />
                            <button
                                onClick={() => generateCertificate({ ...result, productId, contractAddress: ContractAddress.Warranty })}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 mt-2"
                            >
                                <Download size={20} /> Download Official Certificate
                            </button>
                        </div>
                    </motion.div>
                )}
            </GlassCard>
        </div>
    );
};

export default VerifyOwnership;
